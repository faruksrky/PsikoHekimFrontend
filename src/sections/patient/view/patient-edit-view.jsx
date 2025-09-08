import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PatientNewEditForm } from '../patient-new-edit-form';

// ----------------------------------------------------------------------

export function PatientEditView({ currentPatient }) {
  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Güncelle"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Danışan', href: paths.dashboard.patient.root },
          { name: currentPatient ? `${currentPatient.patientFirstName} ${currentPatient.patientLastName}` : 'Güncelle' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PatientNewEditForm currentPatient={currentPatient} />
    </DashboardContent>
  );
}
