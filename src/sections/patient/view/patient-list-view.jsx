import { useState, useEffect, useCallback } from 'react';

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

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { countries } from 'src/assets/data';
import { useGetPatients } from 'src/actions/patient';
import { DashboardContent } from 'src/layouts/dashboard';
import { GENDER_TYPE_OPTIONS } from 'src/_mock/_patient';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PatientTableToolbar } from '../patient-table-toolbar';
import { PatientTableFiltersResult } from '../patient-table-filters-result';
import {
  RenderCellID,
  RenderCellAge,
  RenderCellCity,
  RenderCellEmail,
  RenderCellPhone,
  RenderCellGender,
  RenderCellAddress,
  RenderCellCountry,
  RenderCellFullName
} from '../patient-table-row';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function PatientListView() {
  const confirmRows = useBoolean();

  const router = useRouter();

  const { patients, patientsLoading } = useGetPatients();

  const filters = useSetState({ patientGender: [], patientCountry: [] });

  const [tableData, setTableData] = useState([]);

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [filterButtonEl, setFilterButtonEl] = useState(null);

  useEffect(() => {
    if (!patients.length) {
      return;
    }
    // Filtreleme yapılmadıysa tüm verileri göster
    if (!filters.state.patientGender.length && !filters.state.patientCountry.length) {
      const transformedPatients = patients.map((patient) => ({
        ...patient,
        id: patient.patientId,
      }));
      setTableData(transformedPatients);
      return;
    }

    // Normalize filtre değerleri
    const normalizedPatientGender = filters.state.patientGender.map((type) =>
      type.trim().toLowerCase()
    );
    const normalizedPatientCountry = filters.state.patientCountry.map((rating) =>
      rating.trim().toLowerCase()
    );

    const filteredPatients = patients.filter((patient) => {
      const matchesType =
        !filters.state.patientGender.length ||
        (patient.patientGender &&
          normalizedPatientGender.includes(patient.patientGender.trim().toLowerCase()));

      const matchesRating =
        !filters.state.patientCountry.length ||
        (patient.therapistRating &&
          normalizedPatientCountry.includes(patient.patientCountry.toString().toLowerCase()));

      return matchesType && matchesRating;
    });

    const transformedPatients = filteredPatients.map((patient) => ({
      ...patient,
      id: patient.patientId,
    }));


    setTableData(transformedPatients);
  }, [patients, filters.state.patientGender, filters.state.patientCountry]);

  const canReset =
    filters.state.patientGender.length > 0 || filters.state.patientCountry.length > 0;

  const dataFiltered = applyFilter({ inputData: tableData, filters: filters.state });

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      toast.success('Delete success!');

      setTableData(deleteRow);
    },
    [tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));

    toast.success('Delete success!');

    setTableData(deleteRows);
  }, [selectedRowIds, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.patient.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.patient.details(id));
    },
    [router]
  );

  const CustomToolbarCallback = useCallback(
    () => (
      <CustomToolbar
        filters={filters}
        canReset={canReset}
        setFilterButtonEl={setFilterButtonEl}
        filteredResults={dataFiltered.length}
        onOpenConfirmDeleteRows={confirmRows.onTrue}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.state, selectedRowIds]
  );

  const columns = [
    {
      field: 'patientId',
      headerName: 'ID',
      width: 40,
      renderCell: (params) => <RenderCellID params={params} />,
    },
    {
      field: 'patientFirstName',
      headerName: 'Ad-Soyad',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => <RenderCellFullName params={params} />,
    },
    {
      field: 'patientGender',
      headerName: 'Cinsiyet',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => <RenderCellGender params={params} />,
    },
    {
      field: 'patientAge',
      headerName: 'Yaş',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => <RenderCellAge params={params} />,
    },
    {
      field: 'patientPhoneNumber',
      headerName: 'Telefon',
      flex: 1.5,
      minWidth: 130,
      renderCell: (params) => <RenderCellPhone params={params} />,
    },
    {
      field: 'patientEmail',
      headerName: 'Email',
      flex: 1.2,
      minWidth: 170,
      renderCell: (params) => <RenderCellEmail params={params} />,
    },
    {
      field: 'patientCountry',
      headerName: 'Ülke',
      flex: 1.2,
      minWidth: 150,
      renderCell: (params) => <RenderCellCountry params={params} />,
    },
    {
      field: 'patientCity',
      headerName: 'Şehir',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => <RenderCellCity params={params} />,
    },

    {
      field: 'patientAddress',
      headerName: 'Adres',
      flex: 2, // Adres genelde uzun olabilir
      minWidth: 300,
      renderCell: (params) => <RenderCellAddress params={params} />,
    },

    {
      type: 'actions',
      field: 'actions',
      headerName: ' ',
      align: 'right',
      headerAlign: 'right',
      width: 80, // Sabit genişlik
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="View"
          onClick={() => handleViewRow(params.row.id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:pen-bold" />}
          label="Edit"
          onClick={() => handleEditRow(params.row.id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
          label="Delete"
          onClick={() => {
            handleDeleteRow(params.row.id);
          }}
          sx={{ color: 'error.main' }}
        />,
      ],
    },
  ];

  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="Hasta Listesi"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Hasta', href: paths.dashboard.patient.root },
            { name: 'Hasta Listesi' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.patient.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Yeni Hasta
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card
          sx={{
            flexGrow: 1,
            height: '600px', // Sabit yükseklik
            width: '100%', // Tam genişlik
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <DataGrid
            localeText={trTR.components.MuiDataGrid.defaultProps.localeText} // Türkçe metin desteği
            rows={dataFiltered.length ? dataFiltered : []} // Filtrelenmiş veriyi göster
            columns={columns} // Kolonlar
            loading={patientsLoading} // Yükleme durumu
            pageSizeOptions={[5, 10, 25]} // Sayfa büyüklüğü
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            onRowSelectionModelChange={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
            slots={{
              toolbar: CustomToolbarCallback,
              noRowsOverlay: () => <EmptyContent />,
              noResultsOverlay: () => <EmptyContent title="Veri Bulunamadı!" />,
            }}
            slotProps={{
              panel: { anchorEl: filterButtonEl },
              toolbar: { setFilterButtonEl },
            }}
            sx={{
              flexGrow: 1,
              height: '100%',
              '& .MuiDataGrid-virtualScroller': {
                overflow: 'auto',
              },
            }}
          />
        </Card>
      </DashboardContent>

      <ConfirmDialog
        open={confirmRows.value}
        onClose={confirmRows.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {selectedRowIds.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirmRows.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

function CustomToolbar({
  filters,
  canReset,
  selectedRowIds = [],
  filteredResults,
  setFilterButtonEl,
  onOpenConfirmDeleteRows,
}) {
  return (
    <>
      <GridToolbarContainer>
        <PatientTableToolbar
          filters={filters}
          options={{
            patientGender: GENDER_TYPE_OPTIONS,
            patientCountry: countries,
          }}
        />

        <GridToolbarQuickFilter />

        <Stack
          spacing={1}
          flexGrow={1}
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
        >
          {!!selectedRowIds.length && (
            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={onOpenConfirmDeleteRows}
            >
              Delete ({selectedRowIds.length})
            </Button>
          )}

          <GridToolbarColumnsButton />
          <GridToolbarFilterButton ref={setFilterButtonEl} />
          <GridToolbarExport />
        </Stack>
      </GridToolbarContainer>

      {canReset && (
        <PatientTableFiltersResult
          filters={filters}
          totalResults={filteredResults}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}
    </>
  );
}

function applyFilter({ inputData, filters }) {
  const { patientGender } = filters;

  let filteredData = inputData;

  if (Array.isArray(patientGender) && patientGender.length > 0) {
    const normalizedPatientGender = patientGender.map((type) => type.trim().toLowerCase());
    filteredData = filteredData.filter(
      (patient) =>
        patient.patientGender &&
        normalizedPatientGender.includes(patient.patientGender.trim().toLowerCase())
    );
  }

  return filteredData;
}
