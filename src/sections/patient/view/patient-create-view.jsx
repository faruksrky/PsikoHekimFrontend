import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PatientNewEditForm } from '../patient-new-edit-form';

// ----------------------------------------------------------------------

export function PatientCreateView() {
  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Yeni Hasta Oluştur"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Hasta', href: paths.dashboard.patient.root },
          { name: 'Yeni Hasta' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PatientNewEditForm />
    </DashboardContent>
  );
}
