import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'src/components/snackbar';
import { useGetTherapists } from 'src/api/therapist';
import { useAssignTherapistToPatient } from 'src/api/patient';
import { paths } from 'src/routes/paths';

import {
  Card,
  Table,
  Stack,
  Paper,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export function PatientAssignTherapistView() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { therapists, isLoading, mutate } = useGetTherapists();
  const { assignTherapist } = useAssignTherapistToPatient();

  useEffect(() => {
    if (patientId) {
      mutate(); // Terapist listesini yenile
    }
  }, [patientId, mutate]);

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
      await assignTherapist(patientId, therapistId);
      enqueueSnackbar('Danışman başarıyla atandı!', { variant: 'success' });
      navigate(paths.dashboard.patient.root);
    } catch (error) {
      enqueueSnackbar(error.message || 'Danışman atanırken bir hata oluştu!', { variant: 'error' });
    }
  };

  const filteredTherapists = therapists?.filter((therapist) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      therapist.therapistFirstName?.toLowerCase().includes(searchLower) ||
      therapist.therapistLastName?.toLowerCase().includes(searchLower) ||
      therapist.therapistEmail?.toLowerCase().includes(searchLower) ||
      therapist.therapistPhoneNumber?.toLowerCase().includes(searchLower)
    );
  });

  const TABLE_HEAD = [
    { id: 'therapistId', label: 'ID', align: 'left' },
    { id: 'fullName', label: 'Ad Soyad', align: 'left' },
    { id: 'email', label: 'E-posta', align: 'left' },
    { id: 'phone', label: 'Telefon', align: 'left' },
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
        sx={{
          mb: { xs: 3, md: 5 },
        }}
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
                {filteredTherapists?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <TableRow hover key={row.therapistId}>
                    <TableCell>{row.therapistId}</TableCell>
                    <TableCell>{`${row.therapistFirstName} ${row.therapistLastName}`}</TableCell>
                    <TableCell>{row.therapistEmail}</TableCell>
                    <TableCell>{row.therapistPhoneNumber}</TableCell>
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
                ))}
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