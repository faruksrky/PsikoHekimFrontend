import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';

import { useParams, useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { paths } from 'src/routes/paths';

import { toast } from 'src/components/snackbar';
import { TherapistEditView } from 'src/sections/therapist/view';

// ----------------------------------------------------------------------

const metadata = { title: `Danışman Bilgi Güncelle | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();
  const router = useRouter();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTherapist = useCallback(async () => {
    if (!id) {
      toast.error('Danışman ID bulunamadı');
      router.push(paths.dashboard.therapist.list);
      return;
    }

    try {
      setLoading(true);
      const token = sessionStorage.getItem('jwt_access_token');
      
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}/therapist/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch therapist');
      }

      const data = await response.json();
      setTherapist(data);
    } catch (error) {
      console.error('Error fetching therapist:', error);
      toast.error('Danışman bilgileri yüklenirken hata oluştu');
      router.push(paths.dashboard.therapist.list);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchTherapist();
  }, [fetchTherapist]);

  if (loading) {
    return (
      <>
        <Helmet>
          <title> {metadata.title}</title>
        </Helmet>
        <div>Yükleniyor...</div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <TherapistEditView currentTherapist={therapist} />
    </>
  );
}
