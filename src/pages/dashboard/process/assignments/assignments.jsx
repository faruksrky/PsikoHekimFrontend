import { Helmet } from 'react-helmet-async';

import { ProcessAssignmentManagementView } from 'src/sections/process/view/process-assignment-management-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Danışman Atama Yönetimi</title>
      </Helmet>

      <ProcessAssignmentManagementView />
    </>
  );
}
