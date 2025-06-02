import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { CONFIG } from 'src/config-global';
import { PatientAssignTherapistView } from 'src/sections/patient/view/patient-assign-therapist';

// ----------------------------------------------------------------------

const metadata = { title: `Danışman Ata | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id: patientId } = useParams();

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PatientAssignTherapistView patientId={patientId} />
    </>
  );
}
