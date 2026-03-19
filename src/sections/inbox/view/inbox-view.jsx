import { useState, useEffect, useCallback } from 'react';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';

import { CONFIG } from 'src/config-global';
import { getTherapistId, getEmailFromToken } from 'src/auth/context/jwt/action';
import { useAuth } from 'src/hooks/useAuth';

import { InboxList } from '../inbox-list';
import { InboxWelcome } from '../inbox-welcome';
import { InboxWidgetSummary } from '../inbox-summary';

// ----------------------------------------------------------------------

export function InboxView() {
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const [patientCount, setPatientCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('jwt_access_token');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

      // Danışan sayısı: ADMIN = tümü, USER = danışmanın danışanları
      if (isAdmin()) {
        const patientRes = await fetch(`${CONFIG.psikoHekimBaseUrl}/patient/all`, { headers });
        if (patientRes.ok) {
          const data = await patientRes.json();
          setPatientCount(data?.patients?.length ?? 0);
        }
      } else {
        const userInfo = getEmailFromToken();
        const therapistInfo = await getTherapistId(userInfo?.email);
        const therapistId = therapistInfo?.therapistId ?? therapistInfo;
        if (therapistId) {
          const patientRes = await fetch(
            `${CONFIG.therapistPatientPatientsUrl}/${therapistId}/patients`,
            { headers }
          );
          if (patientRes.ok) {
            const data = await patientRes.json();
            const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
            setPatientCount(list.length);
          }
        }
      }

      // Takvim yükü: bu haftaki planlanmış/gerçekleşen görüşme sayısı
      const userInfo = getEmailFromToken();
      const therapistInfo = await getTherapistId(userInfo?.email);
      const therapistId = therapistInfo?.therapistId ?? therapistInfo;
      const query = !isAdmin() && therapistId ? `?therapistId=${therapistId}` : '';
      const sessionsRes = await fetch(
        `${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.getAll}${query}`,
        { headers }
      );
      if (sessionsRes.ok) {
        const sessions = await sessionsRes.json();
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const thisWeek = (Array.isArray(sessions) ? sessions : []).filter((s) => {
          const d = new Date(s.scheduledDate);
          return d >= weekStart && d < weekEnd && s.status !== 'CANCELLED';
        });
        setSessionCount(thisWeek.length);
      }
    } catch (err) {
      console.error('İstatistikler alınırken hata:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const chartCategories = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu'];

  return (
    <DashboardContent maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <InboxWelcome
            title={`Hoşgeldiniz 👋 \n ${sessionStorage.getItem('username')}`}
            description=""
            img={<SeoIllustration hideBackground />}
            sx={{
              height: '80px',
              width: '100%',
              '& .MuiBox-root': {
                height: '60px',
                '& img': {
                  height: '60px',
                  width: 'auto',
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <InboxWidgetSummary
            title="Toplam Danışan Sayısı"
            percent={0}
            total={loading ? 0 : patientCount}
            chart={{
              categories: chartCategories,
              series: [15, 18, 12, 51, 68, 11, 39, 37],
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <InboxWidgetSummary
            title="Takvim Yükü (Bu Hafta)"
            percent={0}
            total={loading ? 0 : sessionCount}
            chart={{
              colors: [theme.palette.info.main],
              categories: chartCategories,
              series: [20, 41, 63, 33, 28, 35, 50, 46],
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <InboxList />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
