import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import { SERVICE_COMPLETION_STATUS_OPTIONS } from 'src/_mock/_user';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
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

import { CustomerTableRow } from './customer-table-row';
import { getUserNames } from '../userNames/userNamesAPI';
import { CustomerTableToolbar } from './customer-table-toolbar';
import { fetchCustomerList } from '../user/view/_customerservicelist';
import { CustomerTableFiltersResult } from './customer-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'Liste' }, ...SERVICE_COMPLETION_STATUS_OPTIONS];

const calculateWidth = (content) => {
  // Her karakter için 8px genişlik varsayıyoruz
  const widthPerChar = 8;
  // İçeriğin genişliğini hesaplıyoruz
  const contentWidth = content.length * widthPerChar;
  // Genişlik, içeriğin genişliği ile belirtilen minimum genişlik arasındaki en büyük değer olmalıdır
  return Math.max(contentWidth, 200);
};

const TABLE_HEAD = [
  { id: 'customerFirstName', label: 'İsim', width: calculateWidth('İsim') },
  { id: 'customerLastName', label: 'Soyisim', width: calculateWidth('Soyisim') },
  { id: 'phoneNumber', label: 'Telefon', width: calculateWidth('Telefon') },
  { id: 'emailAddress', label: 'E-Posta', width: calculateWidth('E-Posta') },
  { id: 'address', label: 'Adres', width: calculateWidth('Adres') },
  { id: 'productName', label: 'Ürün Adı', width: calculateWidth('Ürün Adı') },
  { id: 'faultDescription', label: 'Arıza Tanımı', width: calculateWidth('Arıza Tanımı') },
  { id: 'faultDate', label: 'Arıza Tarihi', width: calculateWidth('Arıza Tarihi') },
  { id: 'servicePersonnel', label: 'Servis Personeli', width: calculateWidth('Servis Personeli') },
  { id: 'warrantyStatus', label: 'Garanti Durumu', width: calculateWidth('Garanti Durumu') },
  { id: 'cargoStatus', label: 'Kargo Durumu', width: calculateWidth('Kargo Durumu') },
  {
    id: 'serviceCompletionStatus',
    label: 'Servis Tamamlanma Durumu',
    width: calculateWidth('Servis Tamamlanma Durum'),
  },
  { id: 'operationDate', label: 'Operasyon Tarihi', width: calculateWidth('Operasyon Tarihi') },
  { id: 'deliveryDate', label: 'Teslim Tarihi', width: calculateWidth('Teslim Tarihi') },
  { id: 'notes', label: 'Notlar', width: calculateWidth('Notlar') },
  { id: '', label: '', width: calculateWidth('') },
];

// ----------------------------------------------------------------------

export function CustomerServiceListView() {
  const table = useTable();
  const router = useRouter();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState([]);
  const [userNames, setUserNames] = useState([]);

  const fetchData = async () => {
    const result = await fetchCustomerList();
    setTableData(result);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchUserNames = async () => {
      const result = await getUserNames();
      setUserNames(result);
    };

    fetchUserNames();
  }, []);

  const filters = useSetState({
    customerFirstName: '',
    customerLastName: '',
    role: [],
    status: 'all',
  });

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!filters.state.customerFirstName ||
    !!filters.state.customerLastName ||
    filters.state.role.length > 0 ||
    filters.state.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, table]
  );

  return (
    <>
      <DashboardContent maxWidth="xl">
        <Box
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}
        >
          <CustomBreadcrumbs
            heading="Müşteri Teknik Servis Bilgileri"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Teknik Servis Listesi' },
            ]}
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          <Card sx={{ width: '100%', overflowX: 'auto' }}>
            <Tabs
              value={filters.state.status}
              onChange={handleFilterStatus}
              sx={{
                px: 2.5,
                boxShadow: (theme) =>
                  `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }}
            >
              {STATUS_OPTIONS.map((tab) => (
                <Tab
                  key={tab.value}
                  iconPosition="end"
                  value={tab.value}
                  label={tab.label}
                  icon={
                    <Label
                      variant={
                        ((tab.value === 'all' || tab.value === filters.state.status) && 'filled') ||
                        'soft'
                      }
                      color={
                        (tab.value === 'Teslim_Edildi' && 'success') ||
                        (tab.value === 'Tamamlandı' && 'warning') ||
                        (tab.value === 'Beklemede' && 'error') ||
                        'default'
                      }
                    >
                      {['Teslim_Edildi', 'Tamamlandı', 'Beklemede'].includes(tab.value)
                        ? tableData.filter((user) => user.serviceCompletionStatus === tab.value)
                            .length
                        : tableData.length}
                    </Label>
                  }
                />
              ))}
            </Tabs>

            <CustomerTableToolbar
              filters={filters}
              onResetPage={table.onResetPage}
              userNames={userNames}
            />
            {canReset && (
              <CustomerTableFiltersResult
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
              />

              <Box
                sx={{
                  position: 'relative',
                  height: '500px',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  width: '100%', // Box genişliği %100 olarak ayarlandı
                  overflowX: 'auto', // Yatay kaydırma çubuğu ekler
                }}
              >
                <Scrollbar>
                  <Table
                    size={table.dense ? 'small' : 'medium'}
                    sx={{ minWidth: 1500, width: '100%' }}
                  >
                    <TableHeadCustom
                      order={table.order}
                      orderBy={table.orderBy}
                      headLabel={TABLE_HEAD}
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
                      {dataFiltered
                        .slice(
                          table.page * table.rowsPerPage,
                          table.page * table.rowsPerPage + table.rowsPerPage
                        )
                        .map((row) => (
                          <CustomerTableRow
                            key={row.id}
                            fetchData={fetchData}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            userNames={userNames}
                          />
                        ))}

                      <TableEmptyRows
                        height={table.dense ? 56 : 56 + 20}
                        emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                      />

                      <TableNoData notFound={notFound} />
                    </TableBody>
                  </Table>
                </Scrollbar>
              </Box>
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
        </Box>
      </DashboardContent>

      <ConfirmDialog open={confirm.value} onClose={confirm.onFalse} />
    </>
  );
}

function applyFilter({ inputData, comparator, filters }) {
  const { role, name, status } = filters;

  if (!Array.isArray(inputData)) {
    console.error('inputData is not an array:', inputData);
    return [];
  }

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user.role));
  }

  if (name) {
    inputData = inputData.filter(
      (user) => user.customerFirstName.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.serviceCompletionStatus === status);
  }

  return inputData;
}
