import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Stack,
  Chip,
  TextField,
  MenuItem,
  Pagination,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useSnackbar } from 'src/components/snackbar';
import { axiosInstance } from 'src/utils/axios';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { paths } from 'src/routes/paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// Filtreleme seçenekleri
const STATUS_OPTIONS = [
  { value: 'all', label: 'Tümü' },
  { value: 'pending', label: 'Beklemede' },
  { value: 'accepted', label: 'Kabul Edildi' },
  { value: 'rejected', label: 'Reddedildi' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'oldest', label: 'En Eski' },
  { value: 'patientName', label: 'Danışan Adı' },
];

export function TherapistInboxView() {
  const { enqueueSnackbar } = useSnackbar();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: null,
    endDate: null,
    search: '',
    sort: 'newest',
  });

  const detailsDialog = useBoolean();

  // Filtreleme ve sayfalama ile istekleri getir
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/therapist/pending-requests', {
        params: {
          page: currentPage,
          status: filters.status,
          startDate: filters.startDate?.toISOString(),
          endDate: filters.endDate?.toISOString(),
          search: filters.search,
          sort: filters.sort,
        },
      });
      setRequests(response.data.requests);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      enqueueSnackbar('İstekler yüklenirken bir hata oluştu', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  // Filtre değişikliklerini yönet
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
  };

  // Danışan detaylarını göster
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    detailsDialog.onTrue();
  };

  // İstekleri kabul et
  const handleAccept = async (requestId) => {
    try {
      await axiosInstance.post(`/api/therapist/accept-request/${requestId}`, {
        decision: 'accepted'
      });
      enqueueSnackbar('Danışan atama isteği kabul edildi', { variant: 'success' });
      fetchRequests();
    } catch (error) {
      enqueueSnackbar('İşlem sırasında bir hata oluştu', { variant: 'error' });
    }
  };

  // İstekleri reddet
  const handleReject = async (requestId) => {
    try {
      await axiosInstance.post(`/api/therapist/reject-request/${requestId}`, {
        decision: 'rejected'
      });
      enqueueSnackbar('Danışan atama isteği reddedildi', { variant: 'success' });
      fetchRequests();
    } catch (error) {
      enqueueSnackbar('İşlem sırasında bir hata oluştu', { variant: 'error' });
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Gelen Kutusu"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Danışman', href: paths.dashboard.therapist.root },
          { name: 'Gelen Kutusu' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Stack spacing={3} sx={{ p: 3 }}>
          {/* Filtreler */}
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              select
              label="Durum"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              sx={{ width: 200 }}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <DatePicker
              label="Başlangıç Tarihi"
              value={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
              sx={{ width: 200 }}
            />

            <DatePicker
              label="Bitiş Tarihi"
              value={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              sx={{ width: 200 }}
            />

            <TextField
              label="Ara"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Danışan adı veya ID"
              sx={{ width: 200 }}
            />

            <TextField
              select
              label="Sırala"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              sx={{ width: 200 }}
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {/* Tablo */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Danışan Adı</TableCell>
                  <TableCell>Danışan Yaşı</TableCell>
                  <TableCell>İstek Tarihi</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.patientName}</TableCell>
                    <TableCell>{request.patientAge}</TableCell>
                    <TableCell>{fDateTime(request.requestDate)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status === 'pending' ? 'Beklemede' : 
                               request.status === 'accepted' ? 'Kabul Edildi' : 'Reddedildi'} 
                        color={request.status === 'pending' ? 'warning' : 
                               request.status === 'accepted' ? 'success' : 'error'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Detaylar">
                          <IconButton onClick={() => handleViewDetails(request)}>
                            <Iconify icon="mdi:eye-outline" />
                          </IconButton>
                        </Tooltip>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleAccept(request.id)}
                            >
                              Kabul Et
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => handleReject(request.id)}
                            >
                              Reddet
                            </Button>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Sayfalama */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(e, page) => setCurrentPage(page)}
              color="primary"
            />
          </Box>
        </Stack>
      </Card>

      {/* Detay Dialog */}
      <Dialog open={detailsDialog.value} onClose={detailsDialog.onFalse} maxWidth="md" fullWidth>
        <DialogTitle>Danışan Detayları</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Danışan Bilgileri</Typography>
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" sx={{ width: 150 }}>Ad Soyad:</Typography>
                <Typography variant="body2">{selectedRequest.patientName}</Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" sx={{ width: 150 }}>Yaş:</Typography>
                <Typography variant="body2">{selectedRequest.patientAge}</Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" sx={{ width: 150 }}>İletişim:</Typography>
                <Typography variant="body2">{selectedRequest.patientContact}</Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" sx={{ width: 150 }}>İstek Tarihi:</Typography>
                <Typography variant="body2">{fDateTime(selectedRequest.requestDate)}</Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Typography variant="body2" sx={{ width: 150 }}>Durum:</Typography>
                <Typography variant="body2">
                  {selectedRequest.status === 'pending' ? 'Beklemede' : 
                   selectedRequest.status === 'accepted' ? 'Kabul Edildi' : 'Reddedildi'}
                </Typography>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={detailsDialog.onFalse}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
