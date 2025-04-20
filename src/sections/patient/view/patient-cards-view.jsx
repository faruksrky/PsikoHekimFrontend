import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _userCards } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PatientCardList } from '../patient-card-list';

// ----------------------------------------------------------------------

export function PatientCardsView() {
  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="User cards"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.patient.root },
          { name: 'Cards' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.user.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Yeni Hasta
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PatientCardList users={_userCards} />
    </DashboardContent>
  );
}
