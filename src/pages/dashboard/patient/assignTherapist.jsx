import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PatientAssignTherapistView } from 'src/sections/patient/view/patient-assign-therapist';

// ----------------------------------------------------------------------

const metadata = { title: `Danışman Ata | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PatientAssignTherapistView />
    </>
  );
}
