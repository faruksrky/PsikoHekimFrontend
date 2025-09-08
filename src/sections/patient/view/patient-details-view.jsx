import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export function PatientDetailsView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    if (location.state?.patient) {
      setPatient(location.state.patient);
    }
  }, [location.state]);

  if (!patient) {
    return (
      <DashboardContent maxWidth="xl">
        <Alert severity="error" sx={{ mb: 3 }}>
          Danışan bilgileri bulunamadı.
        </Alert>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={() => navigate(paths.dashboard.patient.list)}
        >
          Danışan Listesine Dön
        </Button>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Danışan Detayları"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Danışan', href: paths.dashboard.patient.root },
          { name: 'Danışan Listesi', href: paths.dashboard.patient.list },
          { name: 'Danışan Detayları' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={() => navigate(paths.dashboard.patient.edit(patient.id))}
          >
            Düzenle
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">Kişisel Bilgiler</Typography>
          </Stack>

          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <Typography variant="subtitle1" sx={{ minWidth: 120 }}>Ad Soyad:</Typography>
              <Typography>{`${patient.patientFirstName} ${patient.patientLastName}`}</Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Typography variant="subtitle1" sx={{ minWidth: 120 }}>Cinsiyet:</Typography>
              <Typography>{patient.patientGender}</Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Typography variant="subtitle1" sx={{ minWidth: 120 }}>Yaş:</Typography>
              <Typography>{patient.patientAge}</Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Typography variant="subtitle1" sx={{ minWidth: 120 }}>Telefon:</Typography>
              <Typography>{patient.patientPhoneNumber}</Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Typography variant="subtitle1" sx={{ minWidth: 120 }}>E-posta:</Typography>
              <Typography>{patient.patientEmail}</Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Typography variant="subtitle1" sx={{ minWidth: 120 }}>Ülke:</Typography>
              <Typography>{patient.patientCountry}</Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Typography variant="subtitle1" sx={{ minWidth: 120 }}>Şehir:</Typography>
              <Typography>{patient.patientCity}</Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Typography variant="subtitle1" sx={{ minWidth: 120 }}>Adres:</Typography>
              <Typography>{patient.patientAddress}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Card>
    </DashboardContent>
  );
} 