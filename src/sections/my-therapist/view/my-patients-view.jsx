import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import { trTR } from '@mui/x-data-grid/locales';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarQuickFilter,
  GridToolbarContainer,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { getEmailFromToken, getTherapistId } from 'src/auth/context/jwt/action';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { DataGridContainer } from 'src/components/datagrid';
import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

function getCountryLabel(row) {
  const c = row.patientCountry;
  if (!c) return '—';
  return typeof c === 'object' ? (c.label || c.name || '—') : String(c);
}

export function MyPatientsView() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [therapistFee, setTherapistFee] = useState(null);

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
        setPatients([]);
        setLoading(false);
        return;
      }

      // Danışan listesi
      const patientsRes = await fetch(
        `${CONFIG.therapistPatientPatientsUrl}/${therapistId}/patients`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!patientsRes.ok) {
        throw new Error('Danışan listesi alınamadı');
      }
      const patientsData = await patientsRes.json();
      const list = Array.isArray(patientsData?.data) ? patientsData.data : (Array.isArray(patientsData) ? patientsData : []);

      // Danışman bilgisi (ücret için)
      const therapistRes = await fetch(
        `${CONFIG.psikoHekimBaseUrl}/therapist/${therapistId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (therapistRes.ok) {
        const t = await therapistRes.json();
        setTherapistFee(t.therapistAppointmentFee);
      }

      const rows = list.map((p) => ({
        ...p,
        id: p.patientId,
      }));
      setPatients(rows);
    } catch (error) {
      console.error('Danışanlar yüklenemedi:', error);
      toast.error(error.message || 'Danışanlar yüklenemedi');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    {
      field: 'patientFirstName',
      headerName: 'Ad Soyad',
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => {
        const name = `${row.patientFirstName || ''} ${row.patientLastName || ''}`.trim();
        return name || row.patientName || '—';
      },
    },
    {
      field: 'patientEmail',
      headerName: 'E-Posta',
      flex: 1.2,
      minWidth: 180,
      valueGetter: (_, row) => row.patientEmail || '—',
    },
    {
      field: 'patientPhoneNumber',
      headerName: 'Telefon',
      flex: 1,
      minWidth: 130,
      valueGetter: (_, row) => row.patientPhoneNumber || row.patientPhone || '—',
    },
    {
      field: 'patientAge',
      headerName: 'Yaş',
      width: 70,
    },
    {
      field: 'patientCountry',
      headerName: 'Ülke',
      flex: 1,
      minWidth: 100,
      valueGetter: (_, row) => getCountryLabel(row),
    },
    {
      field: 'sessionFee',
      headerName: 'Görüşme Ücreti',
      width: 120,
      valueGetter: (_, row) => {
        const fee = row.sessionFeePerSession ?? therapistFee;
        return fee != null ? String(fee) : '—';
      },
    },
    {
      field: 'reasonForApplication',
      headerName: 'Başvurma Sebebi',
      flex: 1.5,
      minWidth: 180,
      valueGetter: (_, row) => row.reasonForApplication || '—',
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: 'İşlemler',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:user-id-bold" />}
          label="Danışan Detayları"
          onClick={() => router.push(paths.dashboard.patient.journal(params.row.patientId))}
        />,
      ],
    },
  ];

  return (
    <DashboardContent maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Danışanlarım"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Danışmanlarım', href: paths.dashboard.myTherapist.root },
          { name: 'Danışanlarım' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <DataGridContainer height={500}>
          <DataGrid
            localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
            rows={patients}
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
                  title="Henüz danışan bulunmuyor"
                  description="Size atanmış danışanlar burada listelenecektir."
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
