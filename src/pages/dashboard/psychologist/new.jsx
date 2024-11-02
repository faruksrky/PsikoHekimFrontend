import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import {PsychologistCreateView } from 'src/sections/psychologist/view';

// ----------------------------------------------------------------------

const metadata = { title: `Yeni Piskolog Oluştur | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PsychologistCreateView />
    </>
  );
}
