import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { TherapistNewEditForm } from '../therapist-new-edit-form';

// ----------------------------------------------------------------------

export function TherapistCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Yeni Danışman Oluştur"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Danışman', href: paths.dashboard.therapist.root },
          { name: 'Yeni Danışman' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <TherapistNewEditForm />
    </DashboardContent>
  );
}
