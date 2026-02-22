import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Card,
  Grid,
  Chip,
  Stack,
  Button,
  Avatar,
  Divider,
  Container,
  Typography,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { useAuth } from 'src/hooks/useAuth';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { getCurrencySymbol } from '../therapist-new-edit-form';

// ----------------------------------------------------------------------

export function TherapistDetailsView() {
  const router = useRouter();
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTherapistDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('jwt_access_token');

      // Backend GET /therapist/{therapistId}
      const endpoint = `${CONFIG.psikoHekimBaseUrl}/therapist/${id}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Failed to fetch therapist details: ${response.status}`);
      }

      const data = await response.json();
      setTherapist(data);
    } catch (error) {
      console.error('Error fetching therapist details:', error);
      toast.error('Danışman detayları yüklenirken hata oluştu');
      router.push(paths.dashboard.therapist.list);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchTherapistDetails();
  }, [fetchTherapistDetails]);

  const handleEdit = () => {
    router.push(paths.dashboard.therapist.edit(id));
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography>Danışman detayları yükleniyor...</Typography>
      </Container>
    );
  }

  if (!therapist) {
    return (
      <Container maxWidth="lg">
        <Typography>Danışman bulunamadı</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Danışman Detayları"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Danışmanlar', href: paths.dashboard.therapist.root },
          { name: 'Detaylar' },
        ]}
        action={
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={handleEdit}
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Düzenle
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" sx={{
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: '50%',
              width: 120,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}>
              {therapist.therapistFirstName?.[0]}{therapist.therapistLastName?.[0]}
            </Typography>

            <Typography variant="h5" gutterBottom>
              {therapist.therapistFirstName} {therapist.therapistLastName}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              {therapist.therapistType}
            </Typography>

            <Chip
              label={`${therapist.therapistRating}/100`}
              color="primary"
              sx={{ mt: 1 }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Kişisel Bilgiler
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  E-posta
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {therapist.therapistEmail}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Telefon
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {therapist.therapistPhoneNumber}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Adres
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {therapist.therapistAddress}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Uzmanlık Alanları
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {therapist.therapistSpecializationAreas?.map((area, index) => (
                <Chip key={index} label={area} variant="outlined" />
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Eğitim ve Deneyim
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Deneyim Yılı
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {therapist.therapistYearsOfExperience}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Üniversite
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {therapist.therapistUniversity}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Eğitim
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {therapist.therapistEducation}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Sertifikalar
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {therapist.therapistCertifications}
                </Typography>
              </Grid>

              {isAdmin() && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Randevu Ücreti
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {getCurrencySymbol(therapist.therapistAppointmentFeeCurrency || 'TRY')}
                      {therapist.therapistAppointmentFee?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Grid>

                  {therapist.therapistConsultantFee && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Danışman Ücreti
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {getCurrencySymbol(therapist.therapistConsultantFeeCurrency || 'TRY')}
                        {therapist.therapistConsultantFee?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
