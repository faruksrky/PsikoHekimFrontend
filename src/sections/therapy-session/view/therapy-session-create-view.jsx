import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { TherapySessionNewEditForm } from '../therapy-session-new-edit-form';

// ----------------------------------------------------------------------

export function TherapySessionCreateView() {
  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Yeni Görüşme Oluştur"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Görüşmeler', href: paths.dashboard.therapySession.root },
          { name: 'Yeni Görüşme' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <TherapySessionNewEditForm />
    </DashboardContent>
  );
} 