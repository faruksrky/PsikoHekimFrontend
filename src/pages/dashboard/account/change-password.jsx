import { Helmet } from 'react-helmet-async';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';

import { AccountChangePasswordView } from 'src/sections/account/view/account-change-password-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Şifre Güncelle | {CONFIG.appName}</title>
      </Helmet>

      <DashboardContent>
        <CustomBreadcrumbs
          heading="Şifre Güncelle"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Kullanıcı', href: paths.dashboard.user.root },
            { name: 'Şifre Güncelle' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <AccountChangePasswordView />
      </DashboardContent>
    </>
  );
}
