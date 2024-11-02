import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PatientNewEditForm } from '../patient-new-edit-form';

// ----------------------------------------------------------------------

export function PatientEditView({ user: currentUser }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Güncelle"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Hasta', href: paths.dashboard.patient.root },
          { name: currentUser?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PatientNewEditForm currentUser={currentUser} />
    </DashboardContent>
  );
}
