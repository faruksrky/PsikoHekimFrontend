import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { getTherapistId, getEmailFromToken } from 'src/auth/context/jwt/action';

// ----------------------------------------------------------------------

export function PatientJournalView() {
  const router = useRouter();
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('jwt_access_token');
      const userInfo = getEmailFromToken();

      // Danışan bilgisi
      const patientRes = await fetch(`${CONFIG.psikoHekimBaseUrl}/patient/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!patientRes.ok) throw new Error('Danışan bulunamadı');
      const patientData = await patientRes.json();
      setPatient(patientData);

      // Görüşme defteri - therapistId admin değilse gerekli
      let journalUrl = `${CONFIG.psikoHekimBaseUrl}/therapy-sessions/patient/${id}/journal`;
      if (!userInfo?.isAdmin) {
        const therapistInfo = await getTherapistId(userInfo?.email);
        const therapistId = therapistInfo?.therapistId ?? therapistInfo;
        if (therapistId) {
          journalUrl += `?therapistId=${therapistId}`;
        }
      }

      const journalRes = await fetch(journalUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (journalRes.ok) {
        const data = await journalRes.json();
        setJournal(Array.isArray(data) ? data : []);
      } else {
        setJournal([]);
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
      <Container maxWidth="md">
        <Typography>Yükleniyor...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <CustomBreadcrumbs
        heading="Görüşme Defteri"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Danışan', href: paths.dashboard.patient.root },
          { name: patient ? `${patient.patientFirstName} ${patient.patientLastName}` : 'Defter' },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => router.push(paths.dashboard.patient.details(id))}
          >
            Danışan Detayı
          </Button>
        }
        sx={{ mb: 3 }}
      />

      <Typography variant="h6" sx={{ mb: 2 }}>
        {patient?.patientFirstName} {patient?.patientLastName} - Hasta Hikayesi
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Tamamlanan görüşmelerin notları kronolojik sırayla listelenir.
      </Typography>

      {journal.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Iconify icon="solar:document-text-bold" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">
            Henüz tamamlanmış görüşme bulunmuyor.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Görüşme tamamlandığında notlar buraya otomatik eklenir.
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {journal.map((entry) => (
            <Card key={entry.sessionId} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle2" color="primary">
                  {entry.scheduledDate
                    ? format(new Date(entry.scheduledDate), 'd MMMM yyyy, HH:mm', { locale: tr })
                    : '—'}
                </Typography>
                {entry.therapist && (
                  <Typography variant="caption" color="text.secondary">
                    {entry.therapist.therapistFirstName} {entry.therapist.therapistLastName}
                  </Typography>
                )}
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
    </Container>
  );
}
