import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import {
  Card,
  Table,
  Stack,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  TextField,
  Typography,
  TableContainer,
  InputAdornment,
  TablePagination,
  MenuItem,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { axiosInstance } from 'src/utils/axios';

import { CONFIG } from 'src/config-global';
import { useGetTherapists } from 'src/api/therapist';
import { useGetPatient } from 'src/actions/patient';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

export function PatientAssignTherapistView() {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const settings = useSettingsContext();
  const { user } = useAuthContext();
  const patient = location.state?.patient;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { therapists, isLoading, error, mutate } = useGetTherapists();
  const { patient: fetchedPatient, patientLoading, patientError } = useGetPatient(patientId);

  useEffect(() => {
    if (!patientId) {
      console.error('Danışan ID bulunamadı!');
      return;
    }

    // Terapistleri yükle
    const loadTherapists = async () => {
      try {
        await mutate(); // Terapist listesini yenile
      } catch (loadError) {
        console.error('Danışman yükleme hatası:', loadError);
        toast.error('Danışman listesi yüklenirken bir hata oluştu!');
      }
    };

    loadTherapists();
  }, [patientId, mutate]);


  if (!patientId) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography color="error">Danışan ID bulunamadı!</Typography>
      </Container>
    );
  }

  if (isLoading || patientLoading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography>Yükleniyor...</Typography>
      </Container>
    );
  }

  if (error || patientError) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography color="error">
          {error ? `Danışman listesi yüklenirken bir hata oluştu: ${error.message}` : 
           patientError ? `Danışan bilgileri yüklenirken bir hata oluştu: ${patientError.message}` : 
           'Bilinmeyen bir hata oluştu'}
        </Typography>
      </Container>
    );
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleAssignTherapist = async (therapistId) => {
    try {
      // Seçilen terapistin bilgilerini bul
      const selectedTherapist = therapists.find(t => t.therapistId === therapistId);
      if (!selectedTherapist) {
        throw new Error('Terapist bulunamadı');
      }

      const currentPatient = patient || fetchedPatient;
      if (!currentPatient) {
        throw new Error('Danışan bilgileri bulunamadı');
      }

      const existingSessions = await fetchPatientSessions(patientId);
      if (existingSessions.length > 0) {
        const confirmed = window.confirm(
          'Danışman değiştiriliyor. Mevcut randevular iptal edilecektir. Devam edilsin mi?'
        );
        if (!confirmed) {
          return;
        }
      }

      // BPMN sürecini başlat
      const bpmnRequest = {
        messageName: 'startTherapistAssignmentProcess',
        variables: {
          patientId,
          patientFirstName: currentPatient.patientFirstName,
          patientLastName: currentPatient.patientLastName,
          patientEmail: currentPatient.patientEmail,
          patientPhoneNumber: currentPatient.patientPhoneNumber,
          therapistId: selectedTherapist.therapistId,
          therapistFirstName: selectedTherapist.therapistFirstName,
          therapistLastName: selectedTherapist.therapistLastName,
          processName: 'Randevu Onay Süreci',
          description: `${currentPatient.patientFirstName} ${currentPatient.patientLastName} için ${selectedTherapist.therapistFirstName} ${selectedTherapist.therapistLastName} randevu isteği`,
          startedBy: user?.displayName || 'Sistem',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      const bpmnResponse = await axiosInstance.post(CONFIG.bpmn.endpoints.assignTherapist, bpmnRequest);

      if (!bpmnResponse.data) {
        throw new Error('BPMN süreci başlatılamadı');
      }

      toast.success(`Danışman atama işlemi gerçekleştirildi. ${selectedTherapist.therapistFirstName} ${selectedTherapist.therapistLastName} isimli terapist onaya gönderildi.`);
      navigate(paths.dashboard.inbox);
    } catch (assignError) {
      console.error('Danışman atama hatası:', assignError);
      toast.error(assignError.message || 'Danışman atanırken bir hata oluştu!');
    }
  };

  const fetchPatientSessions = async (patientIdValue) => {
    try {
      const response = await axiosInstance.get(`/therapy-sessions/patient/${patientIdValue}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (fetchError) {
      console.error('Randevular alınırken hata:', fetchError);
      toast.warning('Randevular kontrol edilemedi, işlem devam ediyor.');
      return [];
    }
  };

  const filteredTherapists = therapists?.filter((therapist) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      therapist.therapistFirstName?.toLowerCase().includes(searchLower) ||
      therapist.therapistLastName?.toLowerCase().includes(searchLower) ||
      therapist.therapistEmail?.toLowerCase().includes(searchLower) ||
      therapist.therapistPhoneNumber?.toLowerCase().includes(searchLower) ||
      therapist.therapistType?.toLowerCase().includes(searchLower)
    );
  });

  const TABLE_HEAD = [
    { id: 'therapistId', label: 'ID', align: 'left' },
    { id: 'fullName', label: 'Ad Soyad', align: 'left' },
    { id: 'email', label: 'E-posta', align: 'left' },
    { id: 'phone', label: 'Telefon', align: 'left' },
    { id: 'therapistType', label: 'Danışman Tipi', align: 'left' },
    { id: 'action', label: 'İşlem', align: 'center' },
  ];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Danışman Atama"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Danışanlar', href: paths.dashboard.patient.root },
          { name: 'Danışman Atama' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Stack
          spacing={2}
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          sx={{ p: 2.5 }}
        >
          <TextField
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Danışman ara..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: 1, sm: 260 } }}
          />
        </Stack>


        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={settings.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
              <TableHeadCustom
                headLabel={TABLE_HEAD}
                rowCount={filteredTherapists?.length}
                numSelected={selected.length}
              />

              <TableBody>
                {filteredTherapists?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery
                          ? 'Arama kriterlerine uygun danışman bulunamadı.'
                          : 'Henüz danışman bulunmuyor.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTherapists
                    ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow hover key={row.therapistId}>
                        <TableCell>{row.therapistId}</TableCell>
                        <TableCell>{`${row.therapistFirstName} ${row.therapistLastName}`}</TableCell>
                        <TableCell>{row.therapistEmail}</TableCell>
                        <TableCell>{row.therapistPhoneNumber}</TableCell>
                        <TableCell>{row.therapistType}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleAssignTherapist(row.therapistId)}
                          >
                            Ata
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePagination
          page={page}
          component="div"
          count={filteredTherapists?.length || 0}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
