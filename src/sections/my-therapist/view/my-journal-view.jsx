import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { trTR } from '@mui/x-data-grid/locales';
import {
  DataGrid,
  GridToolbarQuickFilter,
  GridToolbarContainer,
} from '@mui/x-data-grid';

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { getEmailFromToken, getTherapistId } from 'src/auth/context/jwt/action';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { DataGridContainer } from 'src/components/datagrid';
import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export function MyJournalView() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('jwt_access_token');
      const userInfo = getEmailFromToken();
      if (!userInfo?.email) {
        toast.error('Oturum bilgisi bulunamadı');
        router.push(paths.dashboard.root);
        return;
      }

      const therapistInfo = await getTherapistId(userInfo.email);
      const therapistId = therapistInfo?.therapistId ?? therapistInfo;
      if (!therapistId) {
        toast.error('Danışman bilgisi bulunamadı');
        setEntries([]);
        setLoading(false);
        return;
      }

      const journalRes = await fetch(
        `${CONFIG.psikoHekimBaseUrl}/therapy-sessions/therapist/${therapistId}/journal`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!journalRes.ok) {
        throw new Error('Görüşme defteri alınamadı');
      }
      const data = await journalRes.json();
      const items = Array.isArray(data) ? data : [];

      const allEntries = items.map((item) => {
        const patientName = item.patient
          ? `${item.patient.patientFirstName || ''} ${item.patient.patientLastName || ''}`.trim()
          : 'Danışan';
        const noteContent = [item.sessionNotes, item.therapistNotes].filter(Boolean).join('\n\n') || '—';
        return {
          ...item,
          id: `${item.patientId}-${item.sessionId}`,
          patientName: patientName || 'Danışan',
          noteContent,
          formattedDate: item.scheduledDate
            ? format(new Date(item.scheduledDate), 'd MMMM yyyy, HH:mm', { locale: tr })
            : '—',
        };
      });

      setEntries(allEntries);
    } catch (error) {
      console.error('Görüşme defteri yüklenemedi:', error);
      toast.error(error.message || 'Görüşme defteri yüklenemedi');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    {
      field: 'formattedDate',
      headerName: 'Tarih',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'noteContent',
      headerName: 'Görüşme Notları',
      flex: 2,
      minWidth: 300,
      renderCell: (params) => {
        const { patientName, patientId, noteContent } = params.row;
        return (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', py: 1 }}>
            <Typography
              component="span"
              color="primary"
              sx={{ cursor: 'pointer', textDecoration: 'underline', display: 'inline-block', mb: 0.5 }}
              onClick={() => router.push(paths.dashboard.patient.journal(patientId))}
            >
              {patientName}
            </Typography>
            {noteContent !== '—' && (
              <>
                {'\n\n'}
                {noteContent}
              </>
            )}
            {noteContent === '—' && ' —'}
          </Typography>
        );
      },
    },
  ];

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Görüşme Defteri"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Danışmanlarım', href: paths.dashboard.myTherapist.root },
          { name: 'Görüşme Defteri' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Typography variant="h6" sx={{ mb: 2 }}>
        Tüm Danışanlarım - Görüşme Notları
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Tamamlanan görüşmelerin notları kronolojik sırayla listelenir. Görüşme tamamlandığında otomatik eklenir.
      </Typography>

      <Card>
        <DataGridContainer height={500}>
          <DataGrid
            localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
            rows={entries}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            slots={{
              toolbar: () => (
                <GridToolbarContainer sx={{ p: 2 }}>
                  <GridToolbarQuickFilter />
                </GridToolbarContainer>
              ),
              noRowsOverlay: () => (
                <EmptyContent
                  title="Henüz tamamlanmış görüşme bulunmuyor"
                  description="Görüşme tamamlandığında notlar buraya otomatik eklenir."
                />
              ),
            }}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            pageSizeOptions={[5, 10, 25]}
          />
        </DataGridContainer>
      </Card>
    </DashboardContent>
  );
}
