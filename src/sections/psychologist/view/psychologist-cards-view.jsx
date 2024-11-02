import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _userCards } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PsychologistCardList } from '../psychologist-card-list';

// ----------------------------------------------------------------------

export function PsychologistCardsView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Psychologist cards"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Psychologist', href: paths.dashboard.psychologist.root },
          { name: 'Cards' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.psychologist.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Yeni Piskolog
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PsychologistCardList users={_userCards} />
    </DashboardContent>
  );
}
