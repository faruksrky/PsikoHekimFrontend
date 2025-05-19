import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTherapists } from 'src/api/therapist';
import { axiosInstanceBpmn } from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';
import { toast } from 'sonner';

import {
  Card,
  Table,
  Stack,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  TextField,
  InputAdornment,
  Box,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export function PatientAssignTherapistView() {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const settings = useSettingsContext();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { therapists, isLoading, error, mutate } = useGetTherapists();

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

  if (isLoading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography>Yükleniyor...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography color="error">Danışman listesi yüklenirken bir hata oluştu: {error.message}</Typography>
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
      // Önce BPMN sürecini başlat
      const bpmnResponse = await axiosInstanceBpmn.post(CONFIG.bpmn.endpoints.assignTherapist, {
        bpmnProcessId: 'Process_Patient_Registration',
        variables: {
          patientId,
          therapistId
        }
      });

      if (!bpmnResponse.data) {
        throw new Error('BPMN süreci başlatılamadı');
      }

      toast.success('Danışman başarıyla atandı!');
      navigate(paths.dashboard.patient.root);
    } catch (assignError) {
      console.error('Danışman atama hatası:', assignError);
      toast.error(assignError.message || 'Danışman atanırken bir hata oluştu!');
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
