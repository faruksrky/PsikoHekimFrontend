import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PatientListView } from 'src/sections/patient/view';

// ----------------------------------------------------------------------

const metadata = { title: `Hasta Listesi | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <PatientListView />
    </>
  );
}
