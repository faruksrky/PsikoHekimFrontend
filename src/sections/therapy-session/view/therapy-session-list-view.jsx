import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import {
  Card,
  Stack,
  Button,
  Container,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { getComparator } from 'src/components/table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { TherapySessionTable } from '../therapy-session-table';

 // ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tümü' },
  { value: 'SCHEDULED', label: 'Planlandı' },
  { value: 'COMPLETED', label: 'Tamamlandı' },
  { value: 'CANCELLED', label: 'İptal Edildi' },
];

const SESSION_TYPE_OPTIONS = [
  { value: 'all', label: 'Tümü' },
  { value: 'INDIVIDUAL', label: 'Bireysel' },
  { value: 'COUPLE', label: 'Çift' },
];

const defaultFilters = {
  name: '',
  status: 'all',
  sessionType: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

const applyFilter = ({ inputData, comparator, filters }) => {
  const { name, status, sessionType, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (session) =>
        session.patient?.name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        session.therapist?.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((session) => session.status === status);
  }

  if (sessionType !== 'all') {
    inputData = inputData.filter((session) => session.sessionType === sessionType);
  }

  if (startDate && endDate) {
    inputData = inputData.filter(
      (session) =>
        new Date(session.scheduledDate) >= new Date(startDate) &&
        new Date(session.scheduledDate) <= new Date(endDate)
    );
  }

  return inputData;
};

// ----------------------------------------------------------------------

export function TherapySessionListView() {
  const router = useRouter();
  const navigate = useNavigate();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);

  const canReset = Object.keys(filters).some(
    (key) => filters[key] !== defaultFilters[key]
  );

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator('asc', 'scheduledDate'),
    filters,
  });

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const fetchTherapySessions = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('jwt_access_token');
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.getAll}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        // 404 hatası için boş array döndür
        console.log('No therapy sessions found, returning empty list');
        setTableData([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch therapy sessions: ${response.status}`);
      }

      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error('Error fetching therapy sessions:', error);
      toast('Seanslar yüklenirken bir hata oluştu', { variant: 'error' });
      // Hata durumunda da boş array set et
      setTableData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTherapySessions();
  }, [fetchTherapySessions]);

  const handleFilters = useCallback(
    (name, value) => {
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(async (id) => {
    try {
      const token = sessionStorage.getItem('jwt_access_token');
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.delete}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      toast('Seans başarıyla silindi', { variant: 'success' });
      fetchTherapySessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast('Seans silinirken bir hata oluştu', { variant: 'error' });
    }
  }, [fetchTherapySessions]);

  const handleCompleteSession = useCallback(async (id) => {
    try {
      const token = sessionStorage.getItem('jwt_access_token');
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.complete}/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionNotes: '',
          therapistNotes: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete session');
      }

      toast('Seans başarıyla tamamlandı', { variant: 'success' });
      fetchTherapySessions();
    } catch (error) {
      console.error('Error completing session:', error);
      toast('Seans tamamlanırken bir hata oluştu', { variant: 'error' });
    }
  }, [fetchTherapySessions]);

  const handleCancelSession = useCallback(async (id) => {
    try {
      const token = sessionStorage.getItem('jwt_access_token');
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.cancel}/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'İptal edildi',
          cancelledBy: 'THERAPIST',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel session');
      }

      toast('Seans başarıyla iptal edildi', { variant: 'success' });
      fetchTherapySessions();
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast('Seans iptal edilirken bir hata oluştu', { variant: 'error' });
    }
  }, [fetchTherapySessions]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.therapySession.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.therapySession.details(id));
    },
    [router]
  );

  const handleRescheduleSession = useCallback(
    (id) => {
      router.push(paths.dashboard.therapySession.reschedule(id));
    },
    [router]
  );

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Terapi Seansları"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Terapi Seansları', href: paths.dashboard.therapySession.root },
          { name: 'Seans Listesi' },
        ]}
        action={
          <Stack direction="row" spacing={2}>
            <Button
              component={RouterLink}
              href={paths.dashboard.therapySession.new}
              variant="outlined"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Yeni Seans
            </Button>
            <Button
              component={RouterLink}
              href={paths.dashboard.therapySession.editGeneral}
              variant="contained"
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Bilgi Güncelle
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <TherapySessionTable
          sessions={dataFiltered}
          loading={loading}
          onEditRow={handleEditRow}
          onDeleteRow={handleDeleteRow}
          onViewDetails={handleViewRow}
          onCompleteSession={handleCompleteSession}
          onCancelSession={handleCancelSession}
          onRescheduleSession={handleRescheduleSession}
        />
      </Card>
    </Container>
  );
} 