import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { TherapistNewEditForm } from '../therapist-new-edit-form';

// ----------------------------------------------------------------------

export function TherapistEditView({ currentTherapist }) {
  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Güncelle"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Danışman', href: paths.dashboard.therapist.root },
          { name: currentTherapist ? `${currentTherapist.therapistFirstName} ${currentTherapist.therapistLastName}` : 'Güncelle' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <TherapistNewEditForm currentTherapist={currentTherapist} />
    </DashboardContent>
  );
}
