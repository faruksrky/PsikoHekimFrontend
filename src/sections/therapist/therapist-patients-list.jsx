import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { trTR } from '@mui/x-data-grid/locales';

import { useGetPatients } from 'src/actions/patient';
import { EmptyContent } from 'src/components/empty-content';
import { DataGridContainer } from 'src/components/datagrid';

import {
    RenderCellID,
    RenderCellAge,
    RenderCellCity,
    RenderCellEmail,
    RenderCellPhone,
    RenderCellGender,
    RenderCellFullName,
    RenderCellAssignmentStatus
} from '../patient/patient-table-row';

// ----------------------------------------------------------------------

export default function TherapistPatientsList({ therapistId }) {
    const { patients, patientsLoading } = useGetPatients();
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        if (patients.length) {
            // Sadece bu danışmana atanmış hastaları filtrele
            const filteredPatients = patients.filter(patient =>
                String(patient.therapistId) === String(therapistId)
            );

            const transformedPatients = filteredPatients.map((patient) => ({
                ...patient,
                id: patient.patientId,
                isAssigned: true,
            }));

            setTableData(transformedPatients);
        }
    }, [patients, therapistId]);

    const columns = [
        {
            field: 'patientId',
            headerName: 'ID',
            width: 60,
            renderCell: (params) => <RenderCellID params={params} />,
        },
        {
            field: 'patientFirstName',
            headerName: 'Ad-Soyad',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => <RenderCellFullName params={params} />,
        },
        {
            field: 'patientGender',
            headerName: 'Cinsiyet',
            width: 120,
            renderCell: (params) => <RenderCellGender params={params} />,
        },
        {
            field: 'patientAge',
            headerName: 'Yaş',
            width: 80,
            renderCell: (params) => <RenderCellAge params={params} />,
        },
        {
            field: 'patientPhoneNumber',
            headerName: 'Telefon',
            flex: 1,
            minWidth: 140,
            renderCell: (params) => <RenderCellPhone params={params} />,
        },
        {
            field: 'patientEmail',
            headerName: 'Email',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => <RenderCellEmail params={params} />,
        },
        {
            field: 'patientCity',
            headerName: 'Şehir',
            width: 120,
            renderCell: (params) => <RenderCellCity params={params} />,
        },
        {
            field: 'isAssigned',
            headerName: 'Durum',
            width: 120,
            renderCell: (params) => <RenderCellAssignmentStatus params={params} />,
        },
    ];

    return (
        <Card>
            <DataGridContainer>
                <DataGrid
                    localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
                    rows={tableData}
                    columns={columns}
                    loading={patientsLoading}
                    disableRowSelectionOnClick
                    slots={{
                        toolbar: () => (
                            <GridToolbarContainer sx={{ p: 2 }}>
                                <GridToolbarQuickFilter />
                            </GridToolbarContainer>
                        ),
                        noRowsOverlay: () => (
                            <EmptyContent
                                title="Danışan Bulunamadı"
                                description="Bu danışmana atanmış henüz bir danışan bulunmamaktadır."
                                imgUrl="/assets/illustrations/illustration_empty_content.svg"
                            />
                        ),
                        noResultsOverlay: () => (
                            <EmptyContent
                                title="Sonuç Bulunamadı"
                                description="Arama kriterlerinize uygun danışan bulunamadı."
                                imgUrl="/assets/illustrations/illustration_empty_content.svg"
                            />
                        ),
                    }}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10 },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                />
            </DataGridContainer>
        </Card>
    );
}

TherapistPatientsList.propTypes = {
    therapistId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
