import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { TherapistListView } from 'src/sections/therapist/view';

// ----------------------------------------------------------------------

const metadata = { title: `Danışman Listesi | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <TherapistListView />
    </>
  );
}
