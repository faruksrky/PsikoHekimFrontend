import { useState, useCallback } from 'react';

import {
  Card,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
} from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
} from 'src/components/table';

import { TherapySessionTableRow } from './therapy-session-table-row';
import { TherapySessionTableToolbar } from './therapy-session-table-toolbar';
import { TherapySessionTableFiltersResult } from './therapy-session-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'patient', label: 'Danışan', width: 200 },
  { id: 'therapist', label: 'Danışman', width: 200 },
  { id: 'scheduledDate', label: 'Randevu Tarihi', width: 160 },
  { id: 'status', label: 'Durum', width: 120 },
  { id: 'sessionType', label: 'Seans Tipi', width: 120 },
  { id: 'sessionFormat', label: 'Format', width: 100 },
  { id: 'paymentStatus', label: 'Ödeme', width: 120 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  status: 'all',
  therapist: [],
  patient: [],
  sessionType: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export function TherapySessionTable({
  sessions = [],
  loading = false,
  onEditRow,
  onDeleteRow,
  onCompleteSession,
  onCancelSession,
  onRescheduleSession,
  onViewDetails,
}) {
  const table = useTable();

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: sessions,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 76;

  const canReset = Object.keys(filters).some(
    (key) => filters[key] !== defaultFilters[key]
  );

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = sessions.filter((row) => row.sessionId !== id);
      onDeleteRow?.(deleteRow);
      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, onDeleteRow, sessions, table]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = sessions.filter((row) => !table.selected.includes(row.sessionId));
    onDeleteRow?.(deleteRows);
    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, onDeleteRow, sessions, table]);

  return (
    <Card>
        <TherapySessionTableToolbar
          filters={filters}
          onFilters={handleFilters}
          canReset={canReset}
          onResetFilters={handleResetFilters}
        />

        {canReset && (
          <TherapySessionTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            results={dataFiltered.length}
          />
        )}

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
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
                    dataFiltered.map((row) => row.sessionId)
                  )
                }
              />

              <TableBody>
                {dataFiltered.length > 0 ? (
                  dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <TherapySessionTableRow
                        key={row.sessionId}
                        row={row}
                        selected={table.selected.includes(row.sessionId)}
                        onSelectRow={() => table.onSelectRow(row.sessionId)}
                        onDeleteRow={() => handleDeleteRow(row.sessionId)}
                        onEditRow={() => onEditRow?.(row.sessionId)}
                        onCompleteSession={() => onCompleteSession?.(row.sessionId)}
                        onCancelSession={() => onCancelSession?.(row.sessionId)}
                        onRescheduleSession={() => onRescheduleSession?.(row.sessionId)}
                        onViewDetails={() => onViewDetails?.(row.sessionId)}
                      />
                    ))
                ) : (
                  <TableNoData 
                    notFound 
                    title="Henüz hiç terapi seansı bulunmamaktadır"
                    description="Yeni seans oluşturmak için 'Yeni Seans' butonunu kullanabilirsiniz."
                  />
                )}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePagination
          page={table.page}
          component="div"
          count={dataFiltered.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({ inputData, comparator, filters }) => {
  const { name, status, therapist, patient, sessionType, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    const searchTerm = name.toLowerCase().trim();
    inputData = inputData.filter(
      (session) => {
        const firstName = session.patient?.patientFirstName?.toLowerCase() || '';
        const lastName = session.patient?.patientLastName?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const matches = fullName.includes(searchTerm) || firstName.includes(searchTerm) || lastName.includes(searchTerm);
        return matches;
      }
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((session) => session.status === status);
  }

  if (sessionType !== 'all') {
    inputData = inputData.filter((session) => session.sessionType === sessionType);
  }

  if (therapist.length) {
    inputData = inputData.filter((session) =>
      therapist.includes(session.therapist?.id)
    );
  }

  if (patient.length) {
    inputData = inputData.filter((session) =>
      patient.includes(session.patient?.id)
    );
  }

  if (startDate && endDate) {
    inputData = inputData.filter((session) => {
      const sessionDate = new Date(session.scheduledDate);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }

  return inputData;
}; 