import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { _userList } from 'src/_mock/_user';

import { PsychologistEditView } from 'src/sections/psychologist/view';

// ----------------------------------------------------------------------

const metadata = { title: `Piskolog Bilgi Güncelle | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();

  const currentUser = _userList.find((user) => user.id === id);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PsychologistEditView user={currentUser} />
    </>
  );
}
