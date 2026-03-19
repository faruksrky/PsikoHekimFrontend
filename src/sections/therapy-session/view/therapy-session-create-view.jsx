import { Container } from '@mui/material';

import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { TherapySessionNewEditForm } from '../therapy-session-new-edit-form';

// ----------------------------------------------------------------------

export function TherapySessionCreateView() {
  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Yeni Görüşme Oluştur"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Terapi Görüşmeleri', href: paths.dashboard.therapySession.root },
          { name: 'Yeni Görüşme' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <TherapySessionNewEditForm />
    </Container>
  );
} 