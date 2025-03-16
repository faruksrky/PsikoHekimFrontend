import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _userCards } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { TherapistCardList } from '../therapist-card-list';

// ----------------------------------------------------------------------

export function TherapistCardsView() {
  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Therapist cards"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Therapist', href: paths.dashboard.therapist.root },
          { name: 'Cards' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.psychologist.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Yeni Therapist
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <TherapistCardList users={_userCards} />
    </DashboardContent>
  );
}
