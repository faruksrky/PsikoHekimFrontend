import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import {
  Box,
  Card,
  Grid,
  Chip,
  Stack,
  Button,
  Divider,
  Container,
  Typography,
  Alert,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export function PatientDetailsView() {
  const router = useRouter();
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [payments, setPayments] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllPayments, setShowAllPayments] = useState(false);

  const fetchPatientDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('jwt_access_token');
      
      // Patient detaylarını getir
      const patientResponse = await fetch(`${CONFIG.psikoHekimBaseUrl}/patient/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!patientResponse.ok) {
        throw new Error('Failed to fetch patient details');
      }

      const patientData = await patientResponse.json();
      
      // Eğer createdAt yoksa mock data ekle
      if (!patientData.createdAt) {
        patientData.createdAt = '2024-01-10T10:30:00Z';
      }
      
      setPatient(patientData);

      // Payment bilgilerini getir
      try {
        const paymentsResponse = await fetch(`${CONFIG.psikoHekimBaseUrl}/patient/${id}/payments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          setPayments(paymentsData.payments || []);
        } else {
          // API henüz hazır değilse mock data kullan
          console.log('Payment API not available, using mock data');
          setPayments([
            { amount: 3000, paymentDate: '2024-01-15', status: 'COMPLETED', description: 'İlk seans ödemesi' },
            { amount: 3000, paymentDate: '2024-01-22', status: 'COMPLETED', description: 'İkinci seans ödemesi' },
            { amount: 3000, paymentDate: '2024-01-29', status: 'PENDING', description: 'Üçüncü seans ödemesi' },
            { amount: 3000, paymentDate: '2024-02-05', status: 'COMPLETED', description: 'Dördüncü seans ödemesi' },
            { amount: 3000, paymentDate: '2024-02-12', status: 'COMPLETED', description: 'Beşinci seans ödemesi' }
          ]);
        }
      } catch (error) {
        console.log('Payment data not available, using mock data:', error);
        // Mock data ile test edelim
        setPayments([
          { amount: 3000, paymentDate: '2024-01-15', status: 'COMPLETED', description: 'İlk seans ödemesi' },
          { amount: 3000, paymentDate: '2024-01-22', status: 'COMPLETED', description: 'İkinci seans ödemesi' },
          { amount: 3000, paymentDate: '2024-01-29', status: 'PENDING', description: 'Üçüncü seans ödemesi' },
          { amount: 3000, paymentDate: '2024-02-05', status: 'COMPLETED', description: 'Dördüncü seans ödemesi' },
          { amount: 3000, paymentDate: '2024-02-12', status: 'COMPLETED', description: 'Beşinci seans ödemesi' }
        ]);
      }

      // Çalıştığı therapist bilgilerini getir
      try {
        const therapistsResponse = await fetch(`${CONFIG.psikoHekimBaseUrl}/patient/${id}/therapists`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (therapistsResponse.ok) {
          const therapistsData = await therapistsResponse.json();
          setTherapists(therapistsData.therapists || []);
        } else {
          // API henüz hazır değilse mock data kullan
          console.log('Therapist API not available, using mock data');
          setTherapists([
            { therapistFirstName: 'Dr. Ahmet', therapistLastName: 'Yılmaz' },
            { therapistFirstName: 'Dr. Ayşe', therapistLastName: 'Kaya' },
            { therapistFirstName: 'Dr. Mehmet', therapistLastName: 'Demir' }
          ]);
        }
      } catch (error) {
        console.log('Therapist data not available, using mock data:', error);
        // Mock data ile test edelim
        setTherapists([
          { therapistFirstName: 'Dr. Ahmet', therapistLastName: 'Yılmaz' },
          { therapistFirstName: 'Dr. Ayşe', therapistLastName: 'Kaya' },
          { therapistFirstName: 'Dr. Mehmet', therapistLastName: 'Demir' }
        ]);
      }

    } catch (error) {
      console.error('Error fetching patient details:', error);
      toast.error('Danışan detayları yüklenirken hata oluştu');
      router.push(paths.dashboard.patient.list);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchPatientDetails();
  }, [fetchPatientDetails]);

  const handleEdit = () => {
    router.push(paths.dashboard.patient.edit(id));
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography>Danışan detayları yükleniyor...</Typography>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mb: 3 }}>
          Danışan bilgileri bulunamadı.
        </Alert>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={() => router.push(paths.dashboard.patient.list)}
        >
          Danışan Listesine Dön
        </Button>
      </Container>
    );
  }

  // Toplam ödeme hesapla
  const totalPayment = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  
  // Kayıt tarihini formatla
  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Danışan Detayları"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Danışanlar', href: paths.dashboard.patient.root },
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
        {/* Sol Panel - Avatar ve Temel Bilgiler */}
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
              {patient.patientFirstName?.[0]}{patient.patientLastName?.[0]}
            </Typography>
            
            <Typography variant="h5" gutterBottom>
              {patient.patientFirstName} {patient.patientLastName}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Danışan
            </Typography>
            
            <Chip
              label={patient.patientGender === 'ERKEK' ? 'Erkek' : patient.patientGender === 'KADIN' ? 'Kadın' : 'Belirtilmemiş'}
              color="primary"
              sx={{ mt: 1 }}
            />
          </Card>

          {/* Ödeme Özeti */}
          <Card sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Finansal Özet
            </Typography>
            
            <Stack spacing={2}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Toplam Ödeme
                </Typography>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  ₺{totalPayment.toLocaleString()}
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ödeme Sayısı
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {payments.length}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ortalama
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    ₺{payments.length > 0 ? Math.round(totalPayment / payments.length).toLocaleString() : 0}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider />
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Kayıt Tarihi
                </Typography>
                <Typography variant="body1">
                  {formatDate(patient.createdAt)}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Sağ Panel - Detaylı Bilgiler */}
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
                  {patient.patientEmail || 'Belirtilmemiş'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Telefon
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {patient.patientPhoneNumber || 'Belirtilmemiş'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Yaş
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {patient.patientAge} yaşında
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Cinsiyet
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {patient.patientGender === 'ERKEK' ? 'Erkek' : patient.patientGender === 'KADIN' ? 'Kadın' : 'Belirtilmemiş'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Adres
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {patient.patientAddress || 'Belirtilmemiş'}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Adres Bilgileri
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Ülke
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {patient.patientCountry || 'Belirtilmemiş'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Şehir
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {patient.patientCity || 'Belirtilmemiş'}
                </Typography>
              </Grid>
            </Grid>

            {patient.patientReference && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Diğer Bilgiler
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Referans
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {patient.patientReference}
                    </Typography>
                  </Grid>
                </Grid>
              </>
            )}

            {/* Çalıştığı Danışmanlar */}
            {therapists.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Çalıştığı Danışmanlar
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {therapists.map((therapist, index) => (
                    <Chip 
                      key={index} 
                      label={`${therapist.therapistFirstName} ${therapist.therapistLastName}`}
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
              </>
            )}

            {/* Ödeme Geçmişi Özeti */}
            {payments.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Ödeme Geçmişi
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Iconify icon={showAllPayments ? "solar:eye-closed-bold" : "solar:eye-bold"} />}
                      onClick={() => setShowAllPayments(!showAllPayments)}
                    >
                      {showAllPayments ? 'Gizle' : 'Detaylar'}
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<Iconify icon="solar:external-link-bold" />}
                      onClick={() => router.push(paths.dashboard.patient.payments(id))}
                    >
                      Ayrı Sayfa
                    </Button>
                  </Stack>
                </Box>
                
                {/* Ödeme listesi - özet veya tam */}
                {!showAllPayments ? (
                  // Özet görünüm - son 3 ödeme
                  <Box>
                    {payments.slice(0, 3).map((payment, index) => (
                      <Box key={index} sx={{ 
                        p: 2, 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: 1, 
                        mb: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            ₺{payment.amount?.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(payment.paymentDate)}
                          </Typography>
                        </Box>
                        <Chip 
                          label={
                            payment.status === 'PENDING' ? 'Beklemede' :
                            payment.status === 'COMPLETED' ? 'Tamamlandı' :
                            payment.status === 'FAILED' ? 'Başarısız' :
                            payment.status || 'Tamamlandı'
                          }
                          color={
                            payment.status === 'PENDING' ? 'warning' :
                            payment.status === 'COMPLETED' ? 'success' :
                            payment.status === 'FAILED' ? 'error' :
                            'success'
                          }
                          size="small"
                        />
                      </Box>
                    ))}
                    
                    {payments.length > 3 && (
                      <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          +{payments.length - 3} ödeme daha...
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  // Detaylı görünüm - tablo formatında tüm ödemeler
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Tarih</strong></TableCell>
                          <TableCell align="right"><strong>Tutar</strong></TableCell>
                          <TableCell align="center"><strong>Durum</strong></TableCell>
                          <TableCell><strong>Açıklama</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {payments.map((payment, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              {formatDate(payment.paymentDate)}
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" fontWeight="medium">
                                ₺{payment.amount?.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={
                                  payment.status === 'PENDING' ? 'Beklemede' :
                                  payment.status === 'COMPLETED' ? 'Tamamlandı' :
                                  payment.status === 'FAILED' ? 'Başarısız' :
                                  payment.status || 'Tamamlandı'
                                }
                                color={
                                  payment.status === 'PENDING' ? 'warning' :
                                  payment.status === 'COMPLETED' ? 'success' :
                                  payment.status === 'FAILED' ? 'error' :
                                  'success'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {payment.description || 'Seans ödemesi'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
} 