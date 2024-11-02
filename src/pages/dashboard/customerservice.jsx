import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { CustomerServiceListView } from 'src/sections/customerService/customer-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Müşteri Servis Listesi | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <CustomerServiceListView />
    </>
  );
}
