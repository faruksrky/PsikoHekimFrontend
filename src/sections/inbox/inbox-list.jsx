import { toast } from 'sonner';
import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { axiosInstance } from 'src/utils/axios';
import { fIsAfter, fIsBetween } from 'src/utils/format-time';
import { mutate } from 'swr';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { getTherapistId, getEmailFromToken } from 'src/auth/context/jwt/action';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { InboxTableRow } from './inbox-table-row';
import { InboxTableToolbar } from './inbox-table-toolbar';
import { InboxTableFiltersResult } from './inbox-table-filters-result';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tümü' },
  { value: 'pending', label: 'Bekleyen' },
  { value: 'accepted', label: 'Onaylanan' },
  { value: 'rejected', label: 'Reddedilen' }
];

const TABLE_HEAD = [
  { id: 'processName', label: 'Akış Adı', width: 110 },
  { id: 'startedBy', label: 'Başlatan Kullanıcı', width: 160 },
  { id: 'description', label: 'Açıklama' },
  { id: 'createdAt', label: 'Atanma Tarihi', width: 160 },
  { id: 'status', label: 'Durum', width: 110 },
  { id: '', width: 88 },
];

export function InboxList() {
  const table = useTable({ defaultOrderBy: 'createdAt' });
  const confirmDialog = useBoolean();
  const [allData, setAllData] = useState([]); // Tüm veriler
  const [isLoading, setIsLoading] = useState(true);
  const [therapistId, setTherapistId] = useState(null);

  const filters = useSetState({ 
    name: '', 
    status: 'pending', // Varsayılan olarak pending göster
    createdAtStarted: null, 
    createdAtEnded: null 
  });
  const { state: currentFilters, setState: updateFilters } = filters;

  // Therapist ID'yi JWT token'dan al
  useEffect(() => {
    const loadTherapistId = async () => {
      try {
        const userInfo = getEmailFromToken();
        if (!userInfo || !userInfo.email) {
          console.error('Email bulunamadı');
          toast.error('Kullanıcı bilgisi alınamadı');
          return;
        }
        
        const id = await getTherapistId(userInfo.email);
        if (id) {
          setTherapistId(id);
        } else {
          console.error('Therapist ID bulunamadı');
          // Toast mesajını kaldırdık, UI'da gösterilecek
        }
      } catch (error) {
        console.error('Therapist ID alınırken hata:', error);
        // Toast mesajını kaldırdık, UI'da gösterilecek
      }
    };
    
    loadTherapistId();
  }, []);

  // Sadece tek API çağrısı
  const fetchAllData = useCallback(async () => {
    if (!therapistId) {
      return;
    }
    
    // therapistId'nin object mi yoksa number/string mi olduğunu kontrol et
    const actualTherapistId = therapistId.therapistId || therapistId;
    
    try {
      setIsLoading(true);
      // PsikoHekim backend'ine istek at (port 8083)
      const response = await axiosInstance.get(`${CONFIG.psikoHekimBaseUrl}/process/inbox/pending`, {
        params: { therapistId: actualTherapistId },
      });
      
      setAllData(response.data);
    } catch (error) {
      console.error('Veriler alınırken hata:', error);
      setAllData([]); // Hata durumunda boş array set et
    } finally {
      setIsLoading(false);
    }
  }, [therapistId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Tab değiştiğinde sadece filtre güncelle (API çağrısı yok)
  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  // Action handler
  const handleAction = useCallback(async (processInstanceKey, action) => {
    try {
      // Doğru endpoint'i kullan: /process/inbox/action
      const url = `/process/inbox/action`;
      
      const response = await axiosInstance.post(url, {
        processInstanceKey: parseInt(processInstanceKey, 10),
        action: action.toUpperCase()
      });
      
      // Listeyi hemen yenile
      await fetchAllData();
      
      // Event dispatch et - Patient list dinleyecek
      window.dispatchEvent(new CustomEvent('patientListRefresh', {
        detail: {
          processInstanceKey: parseInt(processInstanceKey, 10),
          action: action.toUpperCase(),
          timestamp: new Date().toISOString()
        }
      }));
      
      // Başarı mesajı
      if (action.toUpperCase() === 'REJECTED') {
        toast.success('Akış reddedildi - İşlem sonlandırıldı');
      } else {
        toast.success('Akış onaylandı - İşlem tamamlandı');
      }
      
    } catch (error) {
      console.error('İşlem sırasında hata:', error);
      toast.error('İşlem başarısız');
    }
  }, [fetchAllData]);

  // Count hesaplama - sadece frontend
  const getStatusCount = useCallback((status) => {
    if (status === 'all') {
      return allData.length;
    }
    return allData.filter((item) => 
      item.status?.toLowerCase() === status.toLowerCase()
    ).length;
  }, [allData]);

  const dateError = fIsAfter(currentFilters.createdAtStarted, currentFilters.createdAtEnded);

  // Filtreleme işlemi - tüm veriler üzerinde çalışır
  const dataFiltered = applyFilter({
    inputData: allData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
    dateError,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!currentFilters.name ||
    currentFilters.status !== 'all' ||
    (!!currentFilters.createdAtStarted && !!currentFilters.createdAtEnded);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = allData.filter((row) => row.id !== id);
      toast.success('İstek silindi');
      setAllData(deleteRow);
      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, allData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = allData.filter((row) => !table.selected.includes(row.id));
    toast.success('Seçilen istekler silindi');
    setAllData(deleteRows);
    table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
  }, [dataFiltered.length, dataInPage.length, table, allData]);

  const onApprove = useCallback((processInstanceKey) => {
    handleAction(processInstanceKey, 'accepted');
  }, [handleAction]);

  const onReject = useCallback((processInstanceKey) => {
    handleAction(processInstanceKey, 'rejected');
  }, [handleAction]);

  return (
    <>
      <DashboardContent maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tabs
            value={currentFilters.status}
            onChange={handleFilterStatus}
            sx={{ px: 2.5, boxShadow: (theme) => `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}` }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={tab.value === currentFilters.status ? 'filled' : 'soft'}
                    color={
                      (tab.value === 'accepted' && 'success') ||
                      (tab.value === 'pending' && 'warning') ||
                      (tab.value === 'rejected' && 'error') ||
                      'default'
                    }
                  >
                    {getStatusCount(tab.value)}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <InboxTableToolbar filters={filters} onResetPage={table.onResetPage} dateError={dateError} />

          {canReset && (
            <InboxTableFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirmDialog.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar sx={{ minHeight: 444 }}>
              <Table>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headCells={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography>Yükleniyor...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    dataInPage.map((row, index) => (
                      <InboxTableRow
                        key={row.processId || `row-${index}`}
                        row={row}
                        selected={table.selected.includes(row.processId)}
                        onSelectRow={() => table.onSelectRow(row.processId)}
                        onDeleteRow={() => handleDeleteRow(row.processId)}
                        onApprove={onApprove}
                        onReject={onReject}
                      />
                    ))
                  )}

                  <TableEmptyRows
                    height={table.dense ? 56 : 76}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData 
                    notFound={notFound} 
                    title={
                      !therapistId 
                        ? "Terapist bilgisi bulunamadı" 
                        : dataFiltered.length === 0 
                          ? "Bekleyen kayıt bulunmamaktadır"
                          : "Sonuç bulunamadı"
                    }
                    description={
                      !therapistId 
                        ? "Terapist bilgisi alınamadı. Lütfen giriş yapın."
                        : dataFiltered.length === 0 
                          ? currentFilters.status === 'pending' 
                            ? "Şu an için bekleyen bir atama veya işlem bulunmuyor."
                            : "Bu filtreler için sonuç bulunamadı."
                          : "Bu filtreler için sonuç bulunamadı."
                    }
                  />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Sil"
        content={`Seçili ${table.selected.length} öğeyi silmek istediğinize emin misiniz?`}
        action={
          <Button variant="contained" color="error" onClick={() => {
            handleDeleteRows();
            confirmDialog.onFalse();
          }}>
            Sil
          </Button>
        }
      />
    </>
  );
}

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { status, name, createdAtStarted, createdAtEnded } = filters;

  const stabilized = inputData.map((el, index) => [el, index]);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    return order !== 0 ? order : a[1] - b[1];
  });
  inputData = stabilized.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((row) => Object.values(row).some((val) =>
      String(val).toLowerCase().includes(name.toLowerCase())
    ));
  }

  if (status !== 'all') {
    inputData = inputData.filter((row) => 
      row.status?.toLowerCase() === status.toLowerCase()
    );
  }

  if (!dateError && createdAtStarted && createdAtEnded) {
    inputData = inputData.filter((row) => fIsBetween(row.createdAt, createdAtStarted, createdAtEnded));
  }

  return inputData;
}
