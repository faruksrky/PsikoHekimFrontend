import { useEffect, useState, useCallback } from 'react';
import { axiosInstance } from 'src/utils/axios';
import { CONFIG } from 'src/config-global';
import { toast } from 'sonner';
import { useBoolean, useSetState } from 'minimal-shared/hooks';
import { varAlpha } from 'minimal-shared/utils';
import { useGetPendingRequests } from 'src/api/inbox';
import { paths } from 'src/routes/paths';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { fIsAfter, fIsBetween } from 'src/utils/format-time';
import { DashboardContent } from 'src/layouts/dashboard';
import { ORDER_STATUS_OPTIONS } from 'src/_mock';

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

const STATUS_OPTIONS = [{ value: 'all', label: 'Tümü' }, ...ORDER_STATUS_OPTIONS];

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
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const therapistId = 3;

  const filters = useSetState({ name: '', status: 'all', startDate: null, endDate: null });
  const { state: currentFilters, setState: updateFilters } = filters;

  const onApprove = useCallback((response) => {
    toast.success('İstek onaylandı');
    // Tabloyu güncelle
    setTableData((prevData) => prevData.filter((row) => row.processId !== response.processId));
  }, []);

  const onReject = useCallback((response) => {
    toast.success('İstek reddedildi');
    // Tabloyu güncelle
    setTableData((prevData) => prevData.filter((row) => row.processId !== response.processId));
  }, []);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`${CONFIG.psikoHekimBaseUrl}${CONFIG.process.inbox.pending}`, {
          params: { therapistId },
        });
        setTableData(response.data);
      } catch (error) {
        console.error('Bekleyen istekler alınırken hata:', error);
        toast.error('Bekleyen istekler alınamadı');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingRequests();
  }, [therapistId]);

  const dateError = fIsAfter(currentFilters.startDate, currentFilters.endDate);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
    dateError,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!currentFilters.name ||
    currentFilters.status !== 'all' ||
    (!!currentFilters.startDate && !!currentFilters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      toast.success('İstek silindi');
      setTableData(deleteRow);
      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    toast.success('Seçilen istekler silindi');
    setTableData(deleteRows);
    table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

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
                    variant={tab.value === currentFilters.status || tab.value === 'all' ? 'filled' : 'soft'}
                    color={
                      (tab.value === 'completed' && 'success') ||
                      (tab.value === 'pending' && 'warning') ||
                      (tab.value === 'cancelled' && 'error') ||
                      'default'
                    }
                  >
                    {['completed', 'pending', 'cancelled'].includes(tab.value)
                      ? tableData.filter((user) => user.status === tab.value).length
                      : tableData.length}
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

                  <TableNoData notFound={notFound} />
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
  const { status, name, startDate, endDate } = filters;

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
    inputData = inputData.filter((row) => row.status === status);
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((row) => fIsBetween(row.createdAt, startDate, endDate));
  }

  return inputData;
}
