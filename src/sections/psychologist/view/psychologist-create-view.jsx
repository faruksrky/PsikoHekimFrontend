import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PsychologistNewEditForm } from '../psychologist-new-edit-form';

// ----------------------------------------------------------------------

export function PsychologistCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Yeni Piskolog Oluştur"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Piskolog', href: paths.dashboard.psychologist.root },
          { name: 'Yeni Piskolog' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PsychologistNewEditForm />
    </DashboardContent>
  );
}
