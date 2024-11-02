import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PatientCreateView } from 'src/sections/patient/view';

// ----------------------------------------------------------------------

const metadata = { title: `Yeni Hasta Oluştur | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PatientCreateView />
    </>
  );
}
