import { Helmet } from 'react-helmet-async';

import { TherapistPatientsPageView } from 'src/sections/therapist/view';

// ----------------------------------------------------------------------

export default function TherapistPatientsPage() {
    return (
        <>
            <Helmet>
                <title> Dashboard: Danışman Hastaları</title>
            </Helmet>

            <TherapistPatientsPageView />
        </>
    );
}
