import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AssignTherapistView } from 'src/sections/patient/view';

// ----------------------------------------------------------------------

const metadata = { title: `Danışman Ata | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <AssignTherapistView />
    </>
  );
}
