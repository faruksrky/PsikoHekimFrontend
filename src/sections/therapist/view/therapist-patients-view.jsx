import { useParams } from 'react-router-dom';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TherapistPatientsList from '../therapist-patients-list';

// ----------------------------------------------------------------------

export function TherapistPatientsPageView() {
    const { id } = useParams();

    return (
        <Container maxWidth="lg">
            <CustomBreadcrumbs
                heading="Danışman Hastaları"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Danışmanlar', href: paths.dashboard.therapist.root },
                    { name: 'Hastalar' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <TherapistPatientsList therapistId={id} />
        </Container>
    );
}
