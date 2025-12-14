import { useSearchParams } from 'react-router-dom';
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

import { PRODUCT_STOCK_OPTIONS } from 'src/_mock';
import { useGetTherapists } from 'src/actions/therapist';
import { DashboardContent } from 'src/layouts/dashboard';
import { THERAPIST_TYPE_OPTIONS, THERAPIST_RATING_OPTIONS } from 'src/_mock/_therapist';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { DataGridContainer } from 'src/components/datagrid';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { TherapistTableToolbar } from '../therapist-table-toolbar';
import { TherapistTableFiltersResult } from '../therapist-table-filters-result';
import {
  RenderCellID,
  RenderCellEmail,
  RenderCellPhone,
  RenderCellAddress,
  RenderCellFullName,
  RenderCellEducation,
  RenderCellUniversity,
  RenderCellTherapistType,
  RenderCellCertifications,
  RenderCellAppointmentFee,
  RenderCellTherapistRating,
  RenderCellYearsOfExperience,
  RenderCellSpecializationAreas,
  RenderCellTherapistAvailability
} from '../therapist-table-row';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function TherapistListView() {
  const confirmRows = useBoolean();
  const router = useRouter();

  const { therapists, therapistsLoading } = useGetTherapists();

  const filters = useSetState({ therapistType: [], therapistRating: [] });

  const [tableData, setTableData] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [filterButtonEl, setFilterButtonEl] = useState(null);

  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.therapist.details(id));
    },
    [router]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.therapist.edit(id));
    },
    [router]
  );

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      setTableData(deleteRow);
      toast.success('Danışman başarıyla silindi!');
    },
    [tableData]
  );

  const columns = [
    {
      field: 'therapistId',
      headerName: 'ID',
      width: 40,
      renderCell: (params) => <RenderCellID params={params} />,
    },
    {
      field: 'therapistFirstName',
      headerName: 'Ad Soyad',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => <RenderCellFullName params={params} />,
    },
    {
      field: 'therapistPhoneNumber',
      headerName: 'Telefon',
      flex: 1.5,
      minWidth: 130,
      renderCell: (params) => <RenderCellPhone params={params} />,
    },
    {
      field: 'therapistEmail',
      headerName: 'Email',
      flex: 1.2,
      minWidth: 170,
      renderCell: (params) => <RenderCellEmail params={params} />,
    },
    {
      field: 'therapistAddress',
      headerName: 'Adres',
      flex: 2,
      minWidth: 300,
      renderCell: (params) => <RenderCellAddress params={params} />,
    },
    {
      field: 'therapistEducation',
      headerName: 'Eğitim',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => <RenderCellEducation params={params} />,
    },
    {
      field: 'therapistUniversity',
      headerName: 'Üniversite',
      flex: 1.2,
      minWidth: 150,
      renderCell: (params) => <RenderCellUniversity params={params} />,
    },
    {
      field: 'therapistType',
      headerName: 'Danışman Türü',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => <RenderCellTherapistType params={params} />,
    },
    {
      field: 'therapistSpecializationAreas',
      headerName: 'Uzmanlık Alanı',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => <RenderCellSpecializationAreas params={params} />,
    },
    {
      field: 'therapistYearsOfExperience',
      headerName: 'Deneyim',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => <RenderCellYearsOfExperience params={params} />,
    },
    {
      field: 'therapistCertifications',
      headerName: 'Sertifikalar',
      flex: 1.5,
      minWidth: 150,
      renderCell: (params) => <RenderCellCertifications params={params} />,
    },
    {
      field: 'therapistAppointmentFee',
      headerName: 'Randevu Ücreti',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => <RenderCellAppointmentFee params={params} />,
    },
    {
      field: 'therapistRating',
      headerName: 'Danışman Puanı',
      width: 110,
      type: 'singleSelect',
      editable: true,
      renderCell: (params) => <RenderCellTherapistRating params={params} />,
    },
    {
      field: 'therapistAvailability',
      headerName: 'Takvim',
      width: 160,
      type: 'singleSelect',
      valueOptions: PRODUCT_STOCK_OPTIONS,
      renderCell: (params) => <RenderCellTherapistAvailability params={params} />,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'İşlemler',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      cellClassName: 'actions',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="Detayları Görüntüle"
          onClick={() => handleViewRow(params.id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:pen-bold" />}
          label="Düzenle"
          onClick={() => handleEditRow(params.id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:users-group-rounded-bold" />}
          label="Danışanlarını Göster"
          onClick={() => router.push(paths.dashboard.therapist.patients(params.id))}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
          label="Sil"
          onClick={() => handleDeleteRow(params.id)}
          sx={{ color: 'error.main' }}
        />,
      ],
    },
  ];

  useEffect(() => {
    if (!therapists.length) {
      return;
    }
    // Filtreleme yapılmadıysa tüm verileri göster
    if (!filters.state.therapistType.length && !filters.state.therapistRating.length) {
      const transformedTherapists = therapists.map((therapist) => ({
        ...therapist,
        id: therapist.therapistId,
        therapistRating: therapist.therapistRating || 30,
        fullName: `${therapist.therapistFirstName || ''} ${therapist.therapistSurname || ''}`.trim(),
      }));
      setTableData(transformedTherapists);
      return;
    }

    // Normalize filtre değerleri
    const normalizedTherapistType = filters.state.therapistType.map((type) =>
      type.trim().toLowerCase()
    );
    const normalizedTherapistRating = filters.state.therapistRating.map((rating) =>
      rating.trim().toLowerCase()
    );

    // Geçerli terapistleri filtrele
    const filteredTherapists = therapists.filter((therapist) => {
      const matchesType =
        !filters.state.therapistType.length ||
        (therapist.therapistType &&
          normalizedTherapistType.includes(therapist.therapistType.trim().toLowerCase()));

      const matchesRating =
        !filters.state.therapistRating.length ||
        (therapist.therapistRating &&
          normalizedTherapistRating.includes(therapist.therapistRating.toString().toLowerCase()));

      return matchesType && matchesRating;
    });

    // Filtrelenmiş veriyi dönüştür
    const transformedTherapists = filteredTherapists.map((therapist) => ({
      ...therapist,
      id: therapist.therapistId,
      fullName: `${therapist.therapistFirstName || ''} ${therapist.therapistSurname || ''}`.trim(),
    }));

    setTableData(transformedTherapists);
  }, [therapists, filters.state.therapistType, filters.state.therapistRating]);

  const canReset =
    filters.state.therapistType.length > 0 || filters.state.therapistRating.length > 0;

  const dataFiltered = applyFilter({ inputData: tableData, filters: filters.state });

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));

    toast.success(`${selectedRowIds.length} danışman başarıyla silindi!`);

    setTableData(deleteRows);
  }, [selectedRowIds, tableData]);

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

  return (
    <>
      <DashboardContent maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="Danışman Listesi"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Danışman', href: paths.dashboard.therapist.root },
            { name: 'Danışman Listesi' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.therapist.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Yeni Danışman
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
              loading={therapistsLoading} // Yükleme durumu
              pageSizeOptions={[5, 10, 25]} // Sayfa büyüklüğü
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              onRowSelectionModelChange={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
              slots={{
                toolbar: CustomToolbarCallback,
                noRowsOverlay: () => <EmptyContent
                  title="Henüz hiç danışman kaydı bulunmamaktadır"
                  description="Yeni danışman eklemek için 'Yeni Danışman' butonunu kullanabilirsiniz."
                />,
                noResultsOverlay: () => <EmptyContent
                  title="Arama kriterlerinize uygun danışman bulunamadı"
                  description="Farklı arama terimleri deneyebilir veya filtreleri temizleyebilirsiniz."
                />,
              }}
              slotProps={{
                panel: { anchorEl: filterButtonEl },
                toolbar: { setFilterButtonEl },
              }}
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
            <strong> {selectedRowIds.length} </strong> danışmanı silmek istediğinizden emin misiniz?
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
        <TherapistTableToolbar
          filters={filters}
          options={{
            therapistType: THERAPIST_TYPE_OPTIONS,
            therapistRating: THERAPIST_RATING_OPTIONS,
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
        <TherapistTableFiltersResult
          filters={filters}
          totalResults={filteredResults}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}
    </>
  );
}

function applyFilter({ inputData, filters }) {
  const { therapistType, therapistRating } = filters;

  let filteredData = inputData;

  // TherapistType Filtresi
  if (Array.isArray(therapistType) && therapistType.length > 0) {
    const normalizedTherapistType = therapistType.map((type) => type.trim().toLowerCase());
    filteredData = filteredData.filter(
      (therapist) =>
        therapist.therapistType &&
        normalizedTherapistType.includes(therapist.therapistType.trim().toLowerCase())
    );
  }

  // TherapistRating Filtresi
  if (Array.isArray(therapistRating) && therapistRating.length > 0) {
    const normalizedTherapistRating = therapistRating.map((rating) => rating.trim().toLowerCase());
    filteredData = filteredData.filter(
      (therapist) =>
        therapist.therapistRating &&
        normalizedTherapistRating.includes(therapist.therapistRating.toString().toLowerCase())
    );
  }

  return filteredData;
}
