import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Card,
  Stack,
  Alert,
  Button,
  Container,
  Typography,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const RescheduleSchema = Yup.object().shape({
  newScheduledDate: Yup.date()
    .required('Yeni tarih gereklidir')
    .test('future-date', 'Tarih gelecekte olmalıdır', (value) => {
      if (!value) return false;
      return value > new Date();
    }),
});

export function TherapySessionRescheduleView() {
  const router = useRouter();
  const { id: sessionId } = useParams();
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const methods = useForm({
    resolver: yupResolver(RescheduleSchema),
    defaultValues: {
      newScheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // Geçici değer, useEffect'te güncellenecek
    },
  });

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        toast.error('Seans ID bulunamadı');
        router.push(paths.dashboard.therapySession.list);
        return;
      }

      try {
        setLoading(true);
        const token = sessionStorage.getItem('jwt_access_token');
        
        const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.details}/${sessionId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch therapy session: ${response.status}`);
        }

        const data = await response.json();
        setCurrentSession(data);
        
        // Update form with current session's scheduled date
        if (data.scheduledDate) {
          methods.setValue('newScheduledDate', new Date(data.scheduledDate));
        }
      } catch (error) {
        console.error('Error fetching therapy session:', error);
        toast.error('Seans yüklenirken bir hata oluştu');
        router.push(paths.dashboard.therapySession.list);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, router, methods]);

  const handleReschedule = async (data) => {
    try {
      // Check if the new date is the same as current date
      if (currentSession?.scheduledDate) {
        const currentDate = new Date(currentSession.scheduledDate);
        const newDate = new Date(data.newScheduledDate);
        
        if (currentDate.getTime() === newDate.getTime()) {
          toast.error('Yeni tarih mevcut tarihten farklı olmalıdır!');
          return;
        }
      }

      const token = sessionStorage.getItem('jwt_access_token');
      
      // Format date in local timezone (YYYY-MM-DDTHH:mm:ss)
      const date = new Date(data.newScheduledDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.reschedule}/${sessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newDate: formattedDate,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Seans yeniden planlanamadı';
        try {
          if (errorText && errorText.trim().startsWith('{')) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } else {
            errorMessage = errorText || errorMessage;
          }
        } catch (e) {
          errorMessage = errorText || response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      toast.success('Seans başarıyla yeniden planlandı!');
      router.push(paths.dashboard.therapySession.details(sessionId));
    } catch (error) {
      console.error('Error rescheduling session:', error);
      toast.error(`Seans yeniden planlanırken hata oluştu: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography>Yükleniyor...</Typography>
      </Container>
    );
  }

  if (!currentSession) {
    return (
      <Container maxWidth="lg">
        <Typography>Seans bulunamadı</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Seans Yeniden Planla"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Terapi Seansları', href: paths.dashboard.therapySession.root },
          { name: 'Seans Detayları', href: paths.dashboard.therapySession.details(sessionId) },
          { name: 'Yeniden Planla' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Form methods={methods} onSubmit={methods.handleSubmit(handleReschedule)}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Alert severity="info">
              Seans yeniden planlandıktan sonra danışan ve danışmana bildirim gönderilecektir.
            </Alert>

            <Stack spacing={2}>
              <Typography variant="h6">Mevcut Seans Bilgileri</Typography>
              
              <Stack spacing={1}>
                <Typography variant="subtitle2">Danışan</Typography>
                <Typography variant="body2">
                  {currentSession.patient?.patientFirstName} {currentSession.patient?.patientLastName}
                </Typography>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2">Danışman</Typography>
                <Typography variant="body2">
                  {currentSession.therapist?.therapistFirstName} {currentSession.therapist?.therapistLastName}
                </Typography>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2">Mevcut Tarih</Typography>
                <Typography variant="body2">
                  {new Date(currentSession.scheduledDate).toLocaleString('tr-TR')}
                </Typography>
              </Stack>
            </Stack>

            <Stack spacing={3}>
              <Field.MobileDateTimePicker
                name="newScheduledDate"
                label="Yeni Randevu Tarihi ve Saati"
                ampm={false}
                slotProps={{
                  textField: {
                    placeholder: 'GG/AA/YYYY SS:DD',
                    fullWidth: true,
                  },
                  actionBar: {
                    actions: ['cancel', 'accept'],
                  },
                  toolbar: {
                    title: 'Tarih ve Saat Seçin',
                  },
                }}
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  color="inherit"
                  variant="outlined"
                  onClick={() => router.push(paths.dashboard.therapySession.details(sessionId))}
                >
                  İptal
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  color="warning"
                >
                  Yeniden Planla
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Form>
    </Container>
  );
}

export default TherapySessionRescheduleView; 