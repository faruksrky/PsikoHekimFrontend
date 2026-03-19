import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { getEmailFromToken, getTherapistId } from 'src/auth/context/jwt/action';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export function MyJournalView() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('jwt_access_token');
      const userInfo = getEmailFromToken();
      if (!userInfo?.email) {
        toast.error('Oturum bilgisi bulunamadı');
        router.push(paths.dashboard.root);
        return;
      }

      const therapistInfo = await getTherapistId(userInfo.email);
      const therapistId = therapistInfo?.therapistId ?? therapistInfo;
      if (!therapistId) {
        toast.error('Danışman bilgisi bulunamadı');
        setEntries([]);
        setLoading(false);
        return;
      }

      // Tek API çağrısı ile tüm görüşme defterini al
      const journalRes = await fetch(
        `${CONFIG.psikoHekimBaseUrl}/therapy-sessions/therapist/${therapistId}/journal`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!journalRes.ok) {
        throw new Error('Görüşme defteri alınamadı');
      }
      const data = await journalRes.json();
      const items = Array.isArray(data) ? data : [];

      const allEntries = items.map((item) => {
        const patientName = item.patient
          ? `${item.patient.patientFirstName || ''} ${item.patient.patientLastName || ''}`.trim()
          : 'Danışan';
        return {
          ...item,
          patientName: patientName || 'Danışan',
        };
      });

      setEntries(allEntries);
    } catch (error) {
      console.error('Görüşme defteri yüklenemedi:', error);
      toast.error(error.message || 'Görüşme defteri yüklenemedi');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

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

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Görüşme Defteri"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Danışmanlarım', href: paths.dashboard.myTherapist.root },
          { name: 'Görüşme Defteri' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Typography variant="h6" sx={{ mb: 2 }}>
        Tüm Danışanlarım - Görüşme Notları
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Tamamlanan görüşmelerin notları kronolojik sırayla listelenir. Görüşme tamamlandığında otomatik eklenir.
      </Typography>

      {entries.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Iconify
            icon="solar:document-text-bold"
            width={48}
            sx={{ color: 'text.disabled', mb: 1 }}
          />
          <Typography color="text.secondary">
            Henüz tamamlanmış görüşme bulunmuyor.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Görüşme tamamlandığında notlar buraya otomatik eklenir.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {entries.map((entry) => (
            <Card key={`${entry.patientId}-${entry.sessionId}`} sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 1,
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" color="primary">
                  {entry.scheduledDate
                    ? format(new Date(entry.scheduledDate), 'd MMMM yyyy, HH:mm', {
                        locale: tr,
                      })
                    : '—'}
                </Typography>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => router.push(paths.dashboard.patient.journal(entry.patientId))}
                >
                  {entry.patientName}
                </Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              {entry.sessionNotes && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Görüşme Notu
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {entry.sessionNotes}
                  </Typography>
                </Box>
              )}
              {entry.therapistNotes && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Danışman Notu
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
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
    </DashboardContent>
  );
}
