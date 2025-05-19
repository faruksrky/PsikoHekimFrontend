import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { InboxView } from 'src/sections/inbox/view';

// ----------------------------------------------------------------------

const metadata = { title: `Gelen Kutusu | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <InboxView />
    </>
  );
}
