import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PsychologistNewEditForm } from '../psychologist-new-edit-form';

// ----------------------------------------------------------------------

export function PsychologistEditView({ user: currentUser }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Güncelle"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Piskolog', href: paths.dashboard.psychologist.root },
          { name: currentUser?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PsychologistNewEditForm currentUser={currentUser} />
    </DashboardContent>
  );
}
