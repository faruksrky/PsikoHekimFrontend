import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { UserNewEditForm } from '../user-new-edit-form';

// ----------------------------------------------------------------------

export function UserCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Yeni Kullanıcı Oluştur"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Kullanıcı', href: paths.dashboard.user.root },
          { name: 'Yeni Kullanıcı' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <UserNewEditForm />
    </DashboardContent>
  );
}
