import { useRef, useState, useEffect, useCallback } from 'react';
import { mutate } from 'swr';

import { CONFIG } from 'src/config-global';

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
import { DataGridContainer } from 'src/components/datagrid';
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
  RenderCellFullName,
  RenderCellReference,
  RenderCellAssignmentStatus
} from '../patient-table-row';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function PatientListView() {
  const confirmRows = useBoolean();

  const router = useRouter();

  const { patients, patientsLoading } = useGetPatients();

  const filters = useSetState({ patientGender: [], patientCountry: [], assignmentStatus: [] });

  const [tableData, setTableData] = useState([]);

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [filterButtonEl, setFilterButtonEl] = useState(null);

  const gridRef = useRef();

  // Event listener for patient list refresh
  useEffect(() => {
    const handlePatientListRefresh = (event) => {
      console.log('Patient list refresh event received:', event.detail);
      // SWR cache'ini invalidate et
      mutate(CONFIG.patientListUrl, undefined, { revalidate: true });
    };

    window.addEventListener('patientListRefresh', handlePatientListRefresh);
    
    return () => {
      window.removeEventListener('patientListRefresh', handlePatientListRefresh);
    };
  }, []);

  useEffect(() => {
    if (!patients || !patients.length) {
      setTableData([]);
      return;
    }

    // Debug: Patient verilerini kontrol et
    console.log('Patient Data Debug:', patients.map(p => ({
      id: p.patientId,
      name: `${p.patientFirstName} ${p.patientLastName}`,
      therapistId: p.therapistId,
      therapistIdType: typeof p.therapistId,
      allFields: Object.keys(p)
    })));

    // Filtreleme yapılmadıysa tüm verileri göster
    if (!filters.state.patientGender.length && !filters.state.patientCountry.length && !filters.state.assignmentStatus.length) {
      const transformedPatients = patients.map((patient) => ({
        ...patient,
        id: patient.patientId,
        isAssigned: patient.therapistId && patient.therapistId !== null && patient.therapistId !== undefined && patient.therapistId !== '' && patient.therapistId !== 0,
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

      // Atama durumu filtresi
      const matchesAssignmentStatus = !filters.state.assignmentStatus.length || 
        filters.state.assignmentStatus.some(status => {
          const isAssigned = patient.therapistId && patient.therapistId !== null && patient.therapistId !== undefined && patient.therapistId !== '' && patient.therapistId !== 0;
          if (status === 'assigned') return isAssigned;
          if (status === 'unassigned') return !isAssigned;
          return true;
        });

      return matchesType && matchesRating && matchesAssignmentStatus;
    });

    const transformedPatients = filteredPatients.map((patient) => ({
      ...patient,
      id: patient.patientId,
      isAssigned: patient.therapistId && patient.therapistId !== null && patient.therapistId !== undefined && patient.therapistId !== '' && patient.therapistId !== 0,
    }));

    setTableData(transformedPatients);
  }, [patients, filters.state.patientGender, filters.state.patientCountry, filters.state.assignmentStatus]);

  const canReset =
    filters.state.patientGender.length > 0 || filters.state.patientCountry.length > 0 || filters.state.assignmentStatus.length > 0;

  const dataFiltered = applyFilter({ inputData: tableData, filters: filters.state });

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      toast.success('Danışan başarıyla silindi!');

      setTableData(deleteRow);
    },
    [tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));

    toast.success(`${selectedRowIds.length} danışan başarıyla silindi!`);

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

  const handleAssignTherapist = useCallback(
    (patient) => {
      // Eğer danışan zaten atanmışsa uyarı göster
      if (patient.isAssigned) {
        const confirmDialog = window.confirm(
          `Bu danışan zaten bir danışmana atanmış. Değiştirmek istediğinize emin misiniz?`
        );
        
        if (!confirmDialog) {
          return; // Kullanıcı iptal etti
        }
      }
      
      // Danışman atama sayfasına git
      router.push(paths.dashboard.patient.assignTherapist(patient.id), {
        state: { patient }
      });
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
      field: 'patientReference',
      headerName: 'Referans',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => <RenderCellReference params={params} />,
    },
    {
      field: 'isAssigned',
      headerName: 'Danışman Atama Durumu',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => <RenderCellAssignmentStatus params={params} />,
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: 'Danışman Ata',
      align: 'right',
      headerAlign: 'right',
      width: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="Detayları Görüntüle"
          onClick={() => handleViewRow(params.row.id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:pen-bold" />}
          label="Düzenle"
          onClick={() => handleEditRow(params.row.id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:user-plus-bold" />}
          label="Danışman Ata"
          onClick={() => handleAssignTherapist(params.row)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
          label="Sil"
          onClick={() => {
            handleDeleteRow(params.row.id);
          }}
          sx={{ color: 'error.main' }}
        />,
      ],
    },
  ];

  // Modal açıkken DataGrid'den focus'u alın
  useEffect(() => {
    const handleModalOpen = () => {
      if (document.activeElement && gridRef.current && gridRef.current.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    };

    // cleanup
    return () => {};
  }, []);

  useEffect(() => {
    // Her render'da aktif elementin aria-hidden olup olmadığını kontrol et
    const active = document.activeElement;
    if (
      active &&
      active.getAttribute('aria-hidden') === 'true'
    ) {
      active.blur();
    }
  });

  return (
    <>
      <DashboardContent maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="Danışan Listesi"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Danışan', href: paths.dashboard.patient.root },
            { name: 'Danışan Listesi' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.patient.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Yeni Danışan
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <DataGridContainer height={600} className="datagrid-container">
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
                noRowsOverlay: () => <EmptyContent 
                  title="Henüz hiç hasta kaydı bulunmamaktadır" 
                  description="Yeni hasta eklemek için 'Yeni Danışan' butonunu kullanabilirsiniz."
                />,
                noResultsOverlay: () => <EmptyContent 
                  title="Arama kriterlerinize uygun hasta bulunamadı" 
                  description="Farklı arama terimleri deneyebilir veya filtreleri temizleyebilirsiniz."
                />,
              }}
              slotProps={{
                panel: { anchorEl: filterButtonEl },
                toolbar: { setFilterButtonEl },
              }}
              ref={gridRef}
              style={{ height: '100%', minHeight: '400px', width: '100%' }}
              sx={{
                height: '100% !important',
                minHeight: '400px !important',
                width: '100% !important',
              }}
            />
          </DataGridContainer>
        </Card>
      </DashboardContent>

      <ConfirmDialog
        open={confirmRows.value}
        onClose={confirmRows.onFalse}
        title="Silme Onayı"
        content={
          <>
            <strong> {selectedRowIds.length} </strong> danışanı silmek istediğinizden emin misiniz?
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
            Sil
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
              Sil ({selectedRowIds.length})
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
  const { patientGender, assignmentStatus } = filters;

  let filteredData = inputData;

  if (Array.isArray(patientGender) && patientGender.length > 0) {
    const normalizedPatientGender = patientGender.map((type) => type.trim().toLowerCase());
    filteredData = filteredData.filter(
      (patient) =>
        patient.patientGender &&
        normalizedPatientGender.includes(patient.patientGender.trim().toLowerCase())
    );
  }

  if (Array.isArray(assignmentStatus) && assignmentStatus.length > 0) {
    filteredData = filteredData.filter((patient) => {
      const isAssigned = patient.therapistId && patient.therapistId !== null && patient.therapistId !== undefined && patient.therapistId !== '' && patient.therapistId !== 0;
      return assignmentStatus.some(status => {
        if (status === 'assigned') return isAssigned;
        if (status === 'unassigned') return !isAssigned;
        return true;
      });
    });
  }

  return filteredData;
}