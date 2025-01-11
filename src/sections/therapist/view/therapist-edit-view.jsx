import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { TherapistNewEditForm } from '../therapist-new-edit-form';

// ----------------------------------------------------------------------

export function TherapistEditView({ user: currentUser }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Güncelle"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Danışman', href: paths.dashboard.therapist.root },
          { name: currentUser?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <TherapistNewEditForm currentUser={currentUser} />
    </DashboardContent>
  );
}
