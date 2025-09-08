import { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Select,
  MenuItem,
  Container,
  InputLabel,
  Typography,
  FormControl,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { RevenueChart } from '../components/revenue-chart';
import { AnalyticsCard } from '../components/analytics-card';
import { SessionTrendChart } from '../components/session-trend-chart';
import { SessionStatusChart } from '../components/session-status-chart';
import { TherapistPerformanceTable } from '../components/therapist-performance-table';

// ----------------------------------------------------------------------

export function TherapySessionAnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [selectedTherapist, setSelectedTherapist] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [therapists, setTherapists] = useState([]);
  
  // Analytics Data
  const [generalStats, setGeneralStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    overdueSessions: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
  });
  
  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [therapistStats, setTherapistStats] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  // Fetch all data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('jwt_access_token');
      
      // Fetch all sessions for general stats
      const sessionsResponse = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.getAll}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!sessionsResponse.ok) {
        throw new Error('Failed to fetch sessions');
      }

      let sessions = await sessionsResponse.json();
      
      // Apply filters
      if (selectedTherapist !== 'all') {
        sessions = sessions.filter(session => session.therapistId === selectedTherapist);
      }
      
      // Apply period filter
      const now = new Date();
      const filteredSessions = sessions.filter(session => {
        const sessionDate = new Date(session.scheduledDate);
        
        switch (selectedPeriod) {
          case 'week': {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return sessionDate >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return sessionDate >= monthAgo;
          }
          case 'quarter': {
            const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            return sessionDate >= quarterAgo;
          }
          case 'year': {
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            return sessionDate >= yearAgo;
          }
          default:
            return true;
        }
      });
      
      sessions = filteredSessions;
      
      // Calculate general statistics
      const stats = {
        totalSessions: sessions.length,
        completedSessions: sessions.filter(s => s.status === 'COMPLETED').length,
        cancelledSessions: sessions.filter(s => s.status === 'CANCELLED').length,
        overdueSessions: sessions.filter(s => s.status === 'SCHEDULED' && new Date(s.scheduledDate) < new Date()).length,
        totalRevenue: sessions.filter(s => s.paymentStatus === 'PAID').reduce((sum, s) => sum + (s.sessionFee || 0), 0),
        pendingRevenue: sessions.filter(s => s.paymentStatus === 'PENDING').reduce((sum, s) => sum + (s.sessionFee || 0), 0),
      };
      
      setGeneralStats(stats);

      // Calculate status distribution
      const statusCounts = {};
      sessions.forEach(session => {
        statusCounts[session.status] = (statusCounts[session.status] || 0) + 1;
      });
      
      const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
        label: getStatusLabel(status),
        value: count,
        color: getStatusColor(status),
      }));
      
      setStatusData(statusChartData);

      // Calculate monthly trends
      const monthlyTrends = calculateMonthlyTrends(sessions);
      setMonthlyData(monthlyTrends);

      // Calculate revenue trends
      const revenueTrends = calculateRevenueTrends(sessions);
      setRevenueData(revenueTrends);

      // Fetch therapist statistics
      await fetchTherapistStats(token);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Analitik veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [selectedTherapist, selectedPeriod]);

  const fetchTherapistStats = async (token) => {
    try {
      // Fetch therapists first
      const therapistsResponse = await fetch(`${CONFIG.psikoHekimBaseUrl}/therapist/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (therapistsResponse.ok) {
        const therapistsData = await therapistsResponse.json();
        
        // Backend returns { "therapists": [...] }
        const therapistsArray = therapistsData.therapists || [];
        
        if (!Array.isArray(therapistsArray)) {
          console.error('Therapists data is not an array:', therapistsData);
          setTherapists([]);
          return;
        }
        
        setTherapists(therapistsArray);
        
        // Calculate therapist performance
        const therapistPerformance = await Promise.all(
          therapistsArray.map(async (therapist) => {
            const therapistSessionsResponse = await fetch(
              `${CONFIG.psikoHekimBaseUrl}/therapy-sessions/therapist/${therapist.therapistId}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (therapistSessionsResponse.ok) {
              const therapistSessions = await therapistSessionsResponse.json();
              
              const totalSessions = therapistSessions.length;
              const completedSessions = therapistSessions.filter(s => s.status === 'COMPLETED').length;
              const cancelledSessions = therapistSessions.filter(s => s.status === 'CANCELLED').length;
              const totalRevenue = therapistSessions.filter(s => s.paymentStatus === 'PAID').reduce((sum, s) => sum + (s.sessionFee || 0), 0);
              
              return {
                therapistId: String(therapist.therapistId),
                therapistName: `${therapist.therapistFirstName} ${therapist.therapistLastName}`,
                totalSessions,
                completedSessions,
                cancelledSessions,
                completionRate: totalSessions > 0 ? (completedSessions / totalSessions * 100).toFixed(1) : 0,
                totalRevenue,
                avgSessionFee: totalSessions > 0 ? (totalRevenue / totalSessions).toFixed(2) : 0,
              };
            }
            
            return null;
          })
        );

        setTherapistStats(therapistPerformance.filter(Boolean));
      }
    } catch (error) {
      console.error('Error fetching therapist stats:', error);
    }
  };

  const calculateMonthlyTrends = (sessions) => {
    const monthlyTrends = {};
    
    sessions.forEach(session => {
      const date = new Date(session.scheduledDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = {
          month: monthKey,
          total: 0,
          completed: 0,
          cancelled: 0,
          revenue: 0,
        };
      }
      
      monthlyTrends[monthKey].total += 1;
      
      if (session.status === 'COMPLETED') {
        monthlyTrends[monthKey].completed += 1;
      } else if (session.status === 'CANCELLED') {
        monthlyTrends[monthKey].cancelled += 1;
      }
      
      if (session.paymentStatus === 'PAID') {
        monthlyTrends[monthKey].revenue += session.sessionFee || 0;
      }
    });
    
    return Object.values(monthlyTrends).sort((a, b) => a.month.localeCompare(b.month));
  };

  const calculateRevenueTrends = (sessions) => {
    const revenueTrends = {};
    
    sessions.forEach(session => {
      const date = new Date(session.scheduledDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!revenueTrends[monthKey]) {
        revenueTrends[monthKey] = {
          month: monthKey,
          paid: 0,
          pending: 0,
          total: 0,
        };
      }
      
      const fee = session.sessionFee || 0;
      revenueTrends[monthKey].total += fee;
      
      if (session.paymentStatus === 'PAID') {
        revenueTrends[monthKey].paid += fee;
      } else if (session.paymentStatus === 'PENDING') {
        revenueTrends[monthKey].pending += fee;
      }
    });
    
    return Object.values(revenueTrends).sort((a, b) => a.month.localeCompare(b.month));
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'Planlandı';
      case 'COMPLETED': return 'Tamamlandı';
      case 'CANCELLED': return 'İptal Edildi';
      case 'IN_PROGRESS': return 'Devam Ediyor';
      case 'NO_SHOW': return 'Gelmedi';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return '#2196F3';
      case 'COMPLETED': return '#4CAF50';
      case 'CANCELLED': return '#F44336';
      case 'IN_PROGRESS': return '#FF9800';
      case 'NO_SHOW': return '#9E9E9E';
      default: return '#757575';
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData, selectedTherapist, selectedPeriod]);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Typography>Analitik veriler yükleniyor...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Seans Analitikleri"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Terapi Seansları', href: paths.dashboard.therapySession.root },
          { name: 'Analitikler' },
        ]}
        action={
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Dönem</InputLabel>
              <Select
                value={selectedPeriod}
                label="Dönem"
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <MenuItem value="week">Bu Hafta</MenuItem>
                <MenuItem value="month">Bu Ay</MenuItem>
                <MenuItem value="quarter">Bu Çeyrek</MenuItem>
                <MenuItem value="year">Bu Yıl</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Danışman</InputLabel>
              <Select
                value={selectedTherapist}
                label="Danışman"
                onChange={(e) => setSelectedTherapist(e.target.value)}
              >
                <MenuItem value="all">Tüm Danışmanlar</MenuItem>
                {Array.isArray(therapists) && therapists.map((therapist) => (
                  <MenuItem key={therapist.therapistId} value={therapist.therapistId}>
                    {therapist.therapistFirstName} {therapist.therapistLastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={fetchAnalyticsData}
              startIcon={<Iconify icon="solar:refresh-bold" />}
            >
              Yenile
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* General Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticsCard
            title="Toplam Seans"
            value={generalStats.totalSessions}
            icon="solar:calendar-bold"
            color="primary"
            trend={+5.2}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AnalyticsCard
            title="Tamamlanan"
            value={generalStats.completedSessions}
            icon="solar:check-circle-bold"
            color="success"
            trend={+12.5}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AnalyticsCard
            title="İptal Edilen"
            value={generalStats.cancelledSessions}
            icon="solar:close-circle-bold"
            color="error"
            trend={-2.1}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AnalyticsCard
            title="Gecikmiş"
            value={generalStats.overdueSessions}
            icon="solar:clock-circle-bold"
            color="warning"
            trend={+1.8}
          />
        </Grid>
      </Grid>

      {/* Revenue Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <AnalyticsCard
            title="Toplam Gelir"
            value={`₺${generalStats.totalRevenue.toLocaleString()}`}
            icon="solar:money-bag-bold"
            color="success"
            trend={+8.3}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AnalyticsCard
            title="Bekleyen Ödeme"
            value={`₺${generalStats.pendingRevenue.toLocaleString()}`}
            icon="solar:wallet-bold"
            color="warning"
            trend={+3.7}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AnalyticsCard
            title="Ortalama Seans Ücreti"
            value={`₺${generalStats.totalSessions > 0 ? (generalStats.totalRevenue / generalStats.totalSessions).toFixed(2) : 0}`}
            icon="solar:chart-2-bold"
            color="info"
            trend={+2.4}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AnalyticsCard
            title="Tamamlanma Oranı"
            value={`${generalStats.totalSessions > 0 ? (generalStats.completedSessions / generalStats.totalSessions * 100).toFixed(1) : 0}%`}
            icon="solar:target-bold"
            color="primary"
            trend={+4.2}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ p: 3, pb: 1 }}>
              <Typography variant="h6">Seans Trendi</Typography>
            </Box>
            <Box sx={{ p: 3, pt: 1 }}>
              <SessionTrendChart data={monthlyData} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <Box sx={{ p: 3, pb: 1 }}>
              <Typography variant="h6">Seans Durumları</Typography>
            </Box>
            <Box sx={{ p: 3, pt: 1 }}>
              <SessionStatusChart data={statusData} />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Chart */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <Box sx={{ p: 3, pb: 1 }}>
              <Typography variant="h6">Gelir Analizi</Typography>
            </Box>
            <Box sx={{ p: 3, pt: 1 }}>
              <RevenueChart data={revenueData} />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Therapist Performance Table */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <Box sx={{ p: 3, pb: 1 }}>
              <Typography variant="h6">Danışman Performansı</Typography>
            </Box>
            <Box sx={{ p: 3, pt: 1 }}>
              <TherapistPerformanceTable data={therapistStats} />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
} 