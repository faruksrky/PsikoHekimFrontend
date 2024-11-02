import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PsychologistListView } from 'src/sections/psychologist/view';

// ----------------------------------------------------------------------

const metadata = { title: `Piskolog Listesi | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <PsychologistListView />
    </>
  );
}
