import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { trTR } from '@mui/x-data-grid/locales';
import {
  DataGrid,
  GridToolbarExport,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { DataGridContainer } from 'src/components/datagrid';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';
import { axiosInstance } from 'src/utils/axios';

import { ProcessFlowDialog } from '../components';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'processName', label: 'Akış Adı', width: 150 },
  { id: 'patientName', label: 'Danışan', width: 150 },
  { id: 'therapistName', label: 'Danışman', width: 150 },
  { id: 'startedBy', label: 'Başlatan', width: 120 },
  { id: 'createdAt', label: 'Başlangıç Tarihi', width: 160 },
  { id: 'status', label: 'Durum', width: 120 },
  { id: 'actions', label: 'İşlemler', width: 200 },
];

export function ProcessAssignmentManagementView() {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  const processFlowDialog = useBoolean();
  const confirmDialog = useBoolean();

  // Tamamlanmamış atamaları getir
  const fetchIncompleteAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${CONFIG.psikoHekimBaseUrl}/process/incomplete-assignments`);
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Tamamlanmamış atamalar alınırken hata:', error);
      toast.error('Atamalar alınamadı');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncompleteAssignments();
  }, [fetchIncompleteAssignments]);

  // Atamayı yeniden başlat
  const handleRestartAssignment = useCallback(async (assignmentId) => {
    try {
      const response = await axiosInstance.post(`${CONFIG.psikoHekimBaseUrl}/process/restart-assignment/${assignmentId}`);
      toast.success(response.data.message || 'Atama yeniden başlatıldı');
      fetchIncompleteAssignments(); // Listeyi yenile
    } catch (error) {
      console.error('Atama yeniden başlatılırken hata:', error);
      toast.error('Atama yeniden başlatılamadı');
    }
  }, [fetchIncompleteAssignments]);

  // Süreç durumunu görüntüle
  const handleViewProcessStatus = useCallback(async (processInstanceKey) => {
    try {
      const response = await axiosInstance.get(`${CONFIG.psikoHekimBaseUrl}/process/status/${processInstanceKey}`);
      setSelectedAssignment(response.data);
      processFlowDialog.onTrue();
    } catch (error) {
      console.error('Süreç durumu alınırken hata:', error);
      toast.error('Süreç durumu alınamadı');
    }
  }, [processFlowDialog]);

  // Action handler
  const handleAction = useCallback((assignmentId, action) => {
    if (action === 'restart') {
      setSelectedAssignment({ assignmentId });
      confirmDialog.onTrue();
    }
  }, [confirmDialog]);

  // Yeniden başlatma onayı
  const handleConfirmRestart = useCallback(() => {
    if (selectedAssignment?.assignmentId) {
      handleRestartAssignment(selectedAssignment.assignmentId);
      confirmDialog.onFalse();
      setSelectedAssignment(null);
    }
  }, [selectedAssignment, handleRestartAssignment, confirmDialog]);

  // Columns
  const columns = [
    {
      field: 'processName',
      headerName: 'Akış Adı',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'patientName',
      headerName: 'Danışan',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'therapistName',
      headerName: 'Danışman',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'startedBy',
      headerName: 'Başlatan',
      flex: 0.8,
      minWidth: 120,
    },
    {
      field: 'createdAt',
      headerName: 'Başlangıç Tarihi',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      field: 'status',
      headerName: 'Durum',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const status = params.value;
        const statusColors = {
          PENDING: { color: '#FF9800', label: 'Bekliyor' },
          ACCEPTED: { color: '#4CAF50', label: 'Kabul Edildi' },
          REJECTED: { color: '#F44336', label: 'Reddedildi' },
        };
        const statusInfo = statusColors[status] || { color: '#757575', label: status };
        
        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: statusInfo.color,
              }}
            />
            <span>{statusInfo.label}</span>
          </Stack>
        );
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'İşlemler',
      width: 200,
      getActions: (params) => [
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="Süreç Durumunu Gör"
          onClick={() => handleViewProcessStatus(params.row.processInstanceKey)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:refresh-bold" />}
          label="Yeniden Başlat"
          onClick={() => handleAction(params.row.assignmentId, 'restart')}
          sx={{ color: 'warning.main' }}
        />,
      ],
    },
  ];

  return (
    <>
      <DashboardContent maxWidth="xl">
        <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
          <CustomBreadcrumbs
            heading="Danışman Atama Yönetimi"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Süreç Yönetimi', href: paths.dashboard.process.root },
              { name: 'Atama Yönetimi' },
            ]}
            action={
              <Button
                component={RouterLink}
                href={paths.dashboard.process.assignments}
                variant="contained"
                startIcon={<Iconify icon="solar:refresh-bold" />}
                onClick={() => fetchIncompleteAssignments()}
              >
                Listeyi Yenile
              </Button>
            }
          />
        </Stack>

        <Card sx={{ height: '100%' }}>
          <DataGridContainer>
            <DataGrid
              rows={assignments}
              columns={columns}
              checkboxSelection
              disableRowSelectionOnClick
              loading={loading}
              localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
              slots={{
                noRowsOverlay: () => (
                  <EmptyContent
                    title="Tamamlanmamış atama bulunamadı"
                    description="Şu anda bekleyen danışman ataması bulunmuyor."
                    imgUrl="/assets/illustrations/illustration_empty_content.svg"
                  />
                ),
                noResultsOverlay: () => (
                  <EmptyContent
                    title="Sonuç bulunamadı"
                    description="Arama kriterlerinize uygun atama bulunamadı."
                    imgUrl="/assets/illustrations/illustration_empty_content.svg"
                  />
                ),
                toolbar: () => (
                  <GridToolbarContainer sx={{ p: 2 }}>
                    <GridToolbarQuickFilter />
                    <GridToolbarColumnsButton />
                    <GridToolbarFilterButton />
                    <GridToolbarExport />
                  </GridToolbarContainer>
                ),
              }}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25 },
                },
              }}
              pageSizeOptions={[25, 50, 100]}
            />
          </DataGridContainer>
        </Card>
      </DashboardContent>

      {/* Süreç Durumu Dialog */}
      <ProcessFlowDialog
        open={processFlowDialog.value}
        onClose={processFlowDialog.onFalse}
        assignment={selectedAssignment}
      />

      {/* Yeniden Başlatma Onay Dialog */}
      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Atamayı Yeniden Başlat"
        content="Bu atamayı yeniden başlatmak istediğinize emin misiniz? Bu işlem yeni bir süreç örneği oluşturacaktır."
        action={
          <Button variant="contained" color="warning" onClick={handleConfirmRestart}>
            Yeniden Başlat
          </Button>
        }
      />
    </>
  );
}
