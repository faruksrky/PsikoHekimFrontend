import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Button,
  Divider,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';

import { getTherapistId, getEmailFromToken } from 'src/auth/context/jwt/action';
import { useAuth } from 'src/hooks/useAuth';

// ----------------------------------------------------------------------

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getPaymentStatusLabel = (status) => {
  switch (status) {
    case 'PENDING':
    case 'pending':
      return 'Beklemede';
    case 'PAID':
    case 'COMPLETED':
    case 'paid':
    case 'completed':
      return 'Ödendi';
    case 'FAILED':
    case 'failed':
      return 'Başarısız';
    default:
      return status || '—';
  }
};

const getPaymentStatusColor = (status) => {
  switch (String(status).toUpperCase()) {
    case 'PENDING':
      return 'warning';
    case 'PAID':
    case 'COMPLETED':
      return 'success';
    case 'FAILED':
      return 'error';
    default:
      return 'default';
  }
};

// ----------------------------------------------------------------------

export function PatientJournalView() {
  const router = useRouter();
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [patient, setPatient] = useState(null);
  const [journal, setJournal] = useState([]);
  const [payments, setPayments] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('jwt_access_token');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const userInfo = getEmailFromToken();

      // Danışan bilgisi
      const patientRes = await fetch(`${CONFIG.psikoHekimBaseUrl}/patient/${id}`, { headers });
      if (!patientRes.ok) throw new Error('Danışan bulunamadı');
      const patientData = await patientRes.json();
      setPatient(patientData);

      // Görüşme defteri + ödeme bilgileri için session listesi
      let sessionsUrl = `${CONFIG.psikoHekimBaseUrl}/therapy-sessions/patient/${id}`;
      let journalUrl = `${CONFIG.psikoHekimBaseUrl}/therapy-sessions/patient/${id}/journal`;

      if (!userInfo?.isAdmin) {
        const therapistInfo = await getTherapistId(userInfo?.email);
        const therapistId = therapistInfo?.therapistId ?? therapistInfo;
        if (therapistId) {
          sessionsUrl += `?therapistId=${therapistId}`;
          journalUrl += `?therapistId=${therapistId}`;
        }
      }

      // Görüşme defteri (tamamlanan görüşmeler)
      const journalRes = await fetch(journalUrl, { headers });
      if (journalRes.ok) {
        const data = await journalRes.json();
        setJournal(Array.isArray(data) ? data : []);
      } else {
        setJournal([]);
      }

      // Ödeme bilgileri (tüm görüşmeler)
      const sessionsRes = await fetch(sessionsUrl, { headers });
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        const sessionsList = Array.isArray(sessionsData) ? sessionsData : [];

        const paymentRows = sessionsList.map((session, index) => ({
          amount: Number(session.sessionFee || 0),
          paymentDate: session.scheduledDate || session.createdAt,
          status: session.paymentStatus || 'PENDING',
          description: `Görüşme #${session.sessionId || index + 1}`,
        }));
        setPayments(paymentRows);

        const therapistMap = new Map();
        sessionsList.forEach((session) => {
          const therapist = session.therapist;
          if (!therapist) return;
          const key =
            therapist.therapistId ??
            therapist.therapistEmail ??
            `${therapist.therapistFirstName}-${therapist.therapistLastName}`;
          if (!therapistMap.has(key)) {
            therapistMap.set(key, {
              therapistFirstName: therapist.therapistFirstName,
              therapistLastName: therapist.therapistLastName,
            });
          }
        });
        setTherapists(Array.from(therapistMap.values()));
      } else {
        setPayments([]);
        setTherapists([]);
      }
    } catch (error) {
      console.error('Görüşme defteri yüklenemedi:', error);
      toast.error('Görüşme defteri yüklenemedi');
      router.push(paths.dashboard.patient.list);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <DashboardContent maxWidth="xl">
        <Typography>Yükleniyor...</Typography>
      </DashboardContent>
    );
  }

  if (!patient) {
    return null;
  }

  const totalPayment = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidCount = payments.filter(
    (p) => String(p.status).toUpperCase() === 'PAID' || String(p.status).toUpperCase() === 'COMPLETED'
  ).length;
  const pendingCount = payments.filter(
    (p) => String(p.status).toUpperCase() === 'PENDING'
  ).length;

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Görüşme Defteri"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: isAdmin() ? 'Danışan' : 'Danışanlarım',
            href: isAdmin() ? paths.dashboard.patient.list : paths.dashboard.myTherapist.patients,
          },
          { name: `${patient.patientFirstName} ${patient.patientLastName}` },
        ]}
        action={
          <Stack direction="row" spacing={2}>
            {isAdmin() && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="solar:user-id-bold" />}
                  onClick={() => router.push(paths.dashboard.patient.details(id))}
                >
                  Danışan Detayı
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                  onClick={() => router.push(paths.dashboard.patient.edit(id))}
                >
                  Düzenle
                </Button>
              </>
            )}
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        {/* Sol Panel - Danışan Bilgileri & Ödeme Özeti */}
        <Grid item xs={12} md={4}>
          {/* Danışan Kartı */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  typography: 'h4',
                  mx: 'auto',
                  mb: 1.5,
                }}
              >
                {patient.patientFirstName?.[0]}
                {patient.patientLastName?.[0]}
              </Box>
              <Typography variant="h6">
                {patient.patientFirstName} {patient.patientLastName}
              </Typography>
              <Chip
                label={
                  patient.patientGender === 'ERKEK'
                    ? 'Erkek'
                    : patient.patientGender === 'KADIN'
                      ? 'Kadın'
                      : 'Belirtilmemiş'
                }
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  E-posta
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {patient.patientEmail || '—'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Telefon
                </Typography>
                <Typography variant="body2">{patient.patientPhoneNumber || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Yaş
                </Typography>
                <Typography variant="body2">{patient.patientAge ? `${patient.patientAge} yaş` : '—'}</Typography>
              </Box>
              {(patient.patientCountry || patient.patientCity) && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Konum
                  </Typography>
                  <Typography variant="body2">
                    {[patient.patientCity, patient.patientCountry]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </Typography>
                </Box>
              )}
            </Stack>

            {therapists.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Danışman(lar)
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                  {therapists.map((t, i) => (
                    <Chip
                      key={i}
                      label={`${t.therapistFirstName} ${t.therapistLastName}`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </>
            )}
          </Card>

          {/* Ödeme Özeti */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Ödeme Bilgileri
            </Typography>
            <Stack spacing={2}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'success.lighter',
                  borderRadius: 1,
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Toplam Ödeme
                </Typography>
                <Typography variant="h5" color="success.dark" fontWeight="bold">
                  ₺{totalPayment.toLocaleString('tr-TR')}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Ödeme Sayısı
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {payments.length}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Ödenen
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" color="success.main">
                    {paidCount}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Bekleyen
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" color="warning.main">
                    {pendingCount}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Ortalama
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    ₺{payments.length > 0 ? Math.round(totalPayment / payments.length).toLocaleString('tr-TR') : 0}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>

            {payments.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Button
                  variant="text"
                  size="small"
                  fullWidth
                  startIcon={<Iconify icon="solar:wallet-money-bold" />}
                  onClick={() => router.push(paths.dashboard.patient.payments(id))}
                >
                  Ödeme Geçmişi
                </Button>
              </>
            )}
          </Card>
        </Grid>

        {/* Sağ Panel - Hasta Hikayesi & Görüşme Notları */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {patient.patientFirstName} {patient.patientLastName} — Hasta Hikayesi
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Tamamlanan görüşmelerin notları kronolojik sırayla listelenir.
            </Typography>

            {journal.length === 0 ? (
              <Box
                sx={{
                  py: 8,
                  textAlign: 'center',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Iconify
                  icon="solar:document-text-bold"
                  width={64}
                  sx={{ color: 'text.disabled', mb: 1.5 }}
                />
                <Typography variant="body1" color="text.secondary">
                  Henüz tamamlanmış görüşme bulunmuyor.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Görüşme tamamlandığında notlar buraya otomatik eklenir.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {journal.map((entry) => (
                  <Card key={entry.sessionId} variant="outlined" sx={{ p: 2.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: 1,
                        mb: 1.5,
                      }}
                    >
                      <Typography variant="subtitle2" color="primary">
                        {entry.scheduledDate
                          ? format(new Date(entry.scheduledDate), 'd MMMM yyyy, HH:mm', { locale: tr })
                          : '—'}
                      </Typography>
                      {entry.therapist && (
                        <Chip
                          label={`${entry.therapist.therapistFirstName} ${entry.therapist.therapistLastName}`}
                          size="small"
                          variant="soft"
                        />
                      )}
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    {entry.sessionNotes && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Görüşme Notu
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                          {entry.sessionNotes}
                        </Typography>
                      </Box>
                    )}
                    {entry.therapistNotes && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Danışman Notu
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                          {entry.therapistNotes}
                        </Typography>
                      </Box>
                    )}
                    {!entry.sessionNotes && !entry.therapistNotes && (
                      <Typography variant="body2" color="text.secondary">
                        Not eklenmemiş
                      </Typography>
                    )}
                  </Card>
                ))}
              </Stack>
            )}

            {/* Ödeme Tablosu */}
            {payments.length > 0 && (
              <>
                <Divider sx={{ my: 4 }} />
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Son Ödemeler
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tarih</TableCell>
                        <TableCell align="right">Tutar</TableCell>
                        <TableCell align="center">Durum</TableCell>
                        <TableCell>Açıklama</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.slice(0, 5).map((payment, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              ₺{payment.amount?.toLocaleString('tr-TR')}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={getPaymentStatusLabel(payment.status)}
                              color={getPaymentStatusColor(payment.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{payment.description || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {payments.length > 5 && (
                  <Button
                    variant="text"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => router.push(paths.dashboard.patient.payments(id))}
                  >
                    Tümünü gör ({payments.length})
                  </Button>
                )}
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
