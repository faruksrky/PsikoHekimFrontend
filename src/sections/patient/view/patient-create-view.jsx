import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PatientNewEditForm } from '../patient-new-edit-form';

// ----------------------------------------------------------------------

export function PatientCreateView() {
  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Yeni Danışan Oluştur"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Danışan', href: paths.dashboard.patient.root },
          { name: 'Yeni Danışan' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PatientNewEditForm />
    </DashboardContent>
  );
}
