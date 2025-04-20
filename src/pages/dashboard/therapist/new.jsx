import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import {TherapistCreateView } from 'src/sections/therapist/view';

// ----------------------------------------------------------------------

const metadata = { title: `Yeni Danışman Oluştur | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <TherapistCreateView />
    </>
  );
}
