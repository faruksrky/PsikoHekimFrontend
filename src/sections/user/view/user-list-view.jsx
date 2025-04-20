import axios from 'axios';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
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

import { STORAGE_KEY } from 'src/auth/context/jwt/constant';

import {CONFIG} from '../../../config-global';
import { UserTableRow } from '../user-table-row';
import { UserTableToolbar } from '../user-table-toolbar';
import { UserTableFiltersResult } from '../user-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'Liste' }];

const TABLE_HEAD = [
  { id: 'id', label: 'ID' },
  { id: 'firstName', label: 'Ad' },
  { id: 'lastName', label: 'Soyad' },
  { id: 'email', label: 'Email' },
  { id: 'userName', label: 'Kullanıcı Adı'},
];

// ----------------------------------------------------------------------

export function UserListView() {
  const table = useTable();
  const router = useRouter();
  const confirm = useBoolean();
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const filters = useSetState({ firstName: '', lastName: '', status: 'all' });
  const accessToken = sessionStorage.getItem(STORAGE_KEY);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(CONFIG.usersListUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        setTableData(response.data);
      } catch (error) {
        console.error('error', error);
      }
    };
    fetchData();
  }, [accessToken]); // Include 'accessToken' in the dependency array
  
  // Rest of the code...
  

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!filters.state.firstName || filters.state.lastName;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilterStatus = (_, newValue) => {" "}
  // Rest of the code...

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Kullanıcı Listesi"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Kullanıcı', href: paths.dashboard.user.root },
            { name: 'Kullanıcı Listesi' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.user.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Yeni Kullanıcı
            </Button>
          }
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
                     
                    >
                      {['active', 'pending', 'banned', 'rejected'].includes(tab.value)
                        ? tableData.filter((user) => user.status === tab.value).length
                        : tableData.length}
                    </Label>
                  }
                />
              ))}
            </Tabs>

            <UserTableToolbar
              filters={filters}
              onResetPage={table.onResetPage}
            />

            {canReset && (
              <UserTableFiltersResult
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
                          <UserTableRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
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
      </DashboardContent>
      <ConfirmDialog open={confirm.value} onClose={confirm.onFalse} />
    </>
  );
}

function applyFilter({ inputData, comparator, filters }) {
  const { firstName, lastName, status } = filters;

  // inputData'nın bir dizi olup olmadığını kontrol edin
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

  if (firstName) {
    inputData = inputData.filter((user) =>
      user.firstName.toLowerCase().includes(firstName.toLowerCase())
    );
  }

  if (lastName) {
    inputData = inputData.filter((user) =>
      user.lastName.toLowerCase().includes(lastName.toLowerCase())
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  return inputData;
}