import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import {
  Card,
  Grid,
  Stack,
  Button,
  Avatar,
  Divider,
  Container,
  Typography,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useAuth } from 'src/hooks/useAuth';
import { getEmailFromToken } from 'src/auth/context/jwt/action';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { CONFIG } from 'src/config-global';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export function TherapySessionDetailsView() {
  const { id: sessionId } = useParams();
  const router = useRouter();
  const confirm = useBoolean();
  const { isAdmin } = useAuth();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priceView, setPriceView] = useState('client');
  const [pricingData, setPricingData] = useState({
    clientPrice: null,
    consultantEarning: null,
  });

  const fetchSessionDetails = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.details}/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session details');
      }
      const data = await response.json();
      setSessionData(data);
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast('Seans detayları yüklenirken bir hata oluştu', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const fetchPricing = useCallback(async () => {
    if (!sessionId) return;

    try {
      const [clientRes, consultantRes] = await Promise.all([
        fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.pricing.clientSession}/${sessionId}/price`),
        fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.pricing.consultantSession}/${sessionId}/earning`)
      ]);

      const clientPrice = clientRes.ok ? await clientRes.json() : null;
      const consultantEarning = consultantRes.ok ? await consultantRes.json() : null;

      setPricingData({
        clientPrice: clientPrice?.sessionPrice ?? null,
        consultantEarning: consultantEarning?.consultantFee ?? null,
      });
    } catch (error) {
      console.error('Error fetching pricing data:', error);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionDetails();
  }, [fetchSessionDetails]);

  useEffect(() => {
    const resolvePriceView = () => {
      if (isAdmin()) {
        setPriceView('admin');
        return;
      }

      const userInfo = getEmailFromToken();
      if (userInfo?.therapistId) {
        setPriceView('consultant');
      } else {
        setPriceView('client');
      }
    };

    resolvePriceView();
  }, [isAdmin]);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  const handleEdit = useCallback(() => {
    router.push(paths.dashboard.therapySession.edit(sessionId));
  }, [router, sessionId]);

  const handleComplete = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.complete}/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionNotes: '',
          therapistNotes: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete session');
      }

      toast('Seans başarıyla tamamlandı', { variant: 'success' });
      fetchSessionDetails();
    } catch (error) {
      console.error('Error completing session:', error);
      toast('Seans tamamlanırken bir hata oluştu', { variant: 'error' });
    }
  }, [sessionId, fetchSessionDetails]);

  const handleCancel = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('jwt_access_token');
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.cancel}/${sessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'İptal edildi',
          cancelledBy: 'THERAPIST',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel session');
      }

      toast('Seans başarıyla iptal edildi', { variant: 'success' });
      fetchSessionDetails();
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast('Seans iptal edilirken bir hata oluştu', { variant: 'error' });
    }
  }, [sessionId, fetchSessionDetails]);

  const handleReschedule = useCallback(() => {
    router.push(paths.dashboard.therapySession.reschedule(sessionId));
  }, [router, sessionId]);

  const handleDelete = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('jwt_access_token');
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.delete}/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      toast('Seans başarıyla silindi', { variant: 'success' });
      router.push(paths.dashboard.therapySession.list);
    } catch (error) {
      console.error('Error deleting session:', error);
      toast('Seans silinirken bir hata oluştu', { variant: 'error' });
    }
  }, [sessionId, router]);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Typography>Yükleniyor...</Typography>
      </Container>
    );
  }

  if (!sessionData) {
    return (
      <Container maxWidth="xl">
        <Typography>Seans bulunamadı</Typography>
      </Container>
    );
  }

  const sessionFeeValue = sessionData?.sessionFee ?? 0;
  const clientPrice = pricingData.clientPrice ?? sessionFeeValue;
  const consultantEarning = pricingData.consultantEarning ?? null;
  const platformIncome =
    clientPrice !== null && consultantEarning !== null
      ? clientPrice - consultantEarning
      : null;
  const formatPrice = (value) => (value === null || value === undefined ? '-' : fCurrency(value));

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Seans Detayları"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Terapi Seansları', href: paths.dashboard.therapySession.root },
          { name: 'Detaylar' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleEdit}
              disabled={sessionData.status === 'COMPLETED' || sessionData.status === 'CANCELLED'}
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Düzenle
            </Button>

            <Button
              variant="outlined"
              color="success"
              onClick={handleComplete}
              disabled={sessionData.status === 'COMPLETED' || sessionData.status === 'CANCELLED'}
              startIcon={<Iconify icon="solar:check-circle-bold" />}
            >
              Tamamla
            </Button>

            <Button
              variant="outlined"
              color="warning"
              onClick={handleReschedule}
              disabled={sessionData.status === 'COMPLETED' || sessionData.status === 'CANCELLED'}
              startIcon={<Iconify icon="solar:calendar-mark-bold" />}
            >
              Yeniden Planla
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={handleCancel}
              disabled={sessionData.status === 'COMPLETED' || sessionData.status === 'CANCELLED'}
              startIcon={<Iconify icon="solar:close-circle-bold" />}
            >
              İptal Et
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={confirm.onTrue}
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            >
              Sil
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Stack spacing={3} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    alt={sessionData.patient.name}
                    src={sessionData.patient.avatarUrl}
                    sx={{ width: 64, height: 64 }}
                  />
                  <Stack>
                    <Typography variant="h6">{sessionData.patient.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {sessionData.patient.email}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="subtitle2">Seans Tarihi</Typography>
                  <Typography variant="body2">
                    {fDate(sessionData.scheduledDate)} {fTime(sessionData.scheduledDate)}
                  </Typography>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="subtitle2">Seans Türü</Typography>
                  <Typography variant="body2">
                    {sessionData.sessionType === 'INDIVIDUAL' ? 'Bireysel' : 'Çift'}
                  </Typography>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="subtitle2">Seans Formatı</Typography>
                  <Typography variant="body2">
                    {sessionData.sessionFormat === 'IN_PERSON' ? 'Yüz Yüze' : 'Online'}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    alt={sessionData.therapist.name}
                    src={sessionData.therapist.avatarUrl}
                    sx={{ width: 64, height: 64 }}
                  />
                  <Stack>
                    <Typography variant="h6">{sessionData.therapist.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {sessionData.therapist.email}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="subtitle2">Durum</Typography>
                  <Label
                    variant="soft"
                    color={
                      (sessionData.status === 'SCHEDULED' && 'info') ||
                      (sessionData.status === 'COMPLETED' && 'success') ||
                      (sessionData.status === 'CANCELLED' && 'error') ||
                      'default'
                    }
                  >
                    {sessionData.status === 'SCHEDULED' && 'Planlandı'}
                    {sessionData.status === 'COMPLETED' && 'Tamamlandı'}
                    {sessionData.status === 'CANCELLED' && 'İptal Edildi'}
                  </Label>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="subtitle2">Ödeme Durumu</Typography>
                  <Label
                    variant="soft"
                    color={
                      (sessionData.paymentStatus === 'PAID' && 'success') ||
                      (sessionData.paymentStatus === 'PENDING' && 'warning') ||
                      (sessionData.paymentStatus === 'NOT_APPLICABLE' && 'default') ||
                      'default'
                    }
                  >
                    {sessionData.paymentStatus === 'PAID' && 'Ödendi'}
                    {sessionData.paymentStatus === 'PENDING' && 'Bekliyor'}
                    {sessionData.paymentStatus === 'NOT_APPLICABLE' && 'Uygulanamaz'}
                  </Label>
                </Stack>

                {priceView === 'admin' && (
                  <>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Danışan Ödemesi</Typography>
                      <Typography variant="body2">{formatPrice(clientPrice)}</Typography>
                    </Stack>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Danışman Ücreti</Typography>
                      <Typography variant="body2">{formatPrice(consultantEarning)}</Typography>
                    </Stack>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Platform Geliri</Typography>
                      <Typography variant="body2">{formatPrice(platformIncome)}</Typography>
                    </Stack>
                  </>
                )}

                {priceView === 'consultant' && (
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Danışman Ücreti</Typography>
                    <Typography variant="body2">{formatPrice(consultantEarning)}</Typography>
                  </Stack>
                )}

                {priceView === 'client' && (
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Danışan Ödemesi</Typography>
                    <Typography variant="body2">{formatPrice(clientPrice)}</Typography>
                  </Stack>
                )}
              </Stack>
            </Grid>
          </Grid>

          {sessionData.sessionNotes && (
            <>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2">Seans Notları</Typography>
                <Typography variant="body2">{sessionData.sessionNotes}</Typography>
              </Stack>
            </>
          )}

          {sessionData.cancellationReason && (
            <>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2">İptal Nedeni</Typography>
                <Typography variant="body2">{sessionData.cancellationReason}</Typography>
              </Stack>
            </>
          )}
        </Stack>
      </Card>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Seansı Sil"
        content="Bu seansı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDelete();
              confirm.onFalse();
            }}
          >
            Sil
          </Button>
        }
      />
    </Container>
  );
} 