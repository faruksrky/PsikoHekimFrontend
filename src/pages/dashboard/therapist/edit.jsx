import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

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
      
      // Backend Long ID bekliyor - UUID kontrolü yap
      let therapistId = id;
      
      // UUID formatı kontrolü (8-4-4-4-12 karakter formatı veya hyphen içeriyorsa)
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const hasHyphens = id.includes('-');
      
      if (uuidPattern.test(id) || hasHyphens) {
        // UUID ise, bu bir hata - backend Long ID bekliyor
        console.error('UUID formatında ID tespit edildi:', id);
        toast.error('Geçersiz danışman ID formatı. Lütfen listeden tekrar seçin veya sayfayı yenileyin.');
        setLoading(false);
        setTimeout(() => {
          router.push(paths.dashboard.therapist.list);
        }, 2000);
        return;
      }
      
      // Numeric ID kontrolü
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId) || numericId <= 0) {
        console.error('Geçersiz numeric ID:', id);
        toast.error('Geçersiz danışman ID formatı. Lütfen listeden tekrar seçin.');
        setLoading(false);
        setTimeout(() => {
          router.push(paths.dashboard.therapist.list);
        }, 2000);
        return;
      }
      
      therapistId = numericId;
      
      // Backend endpoint: /therapist/{therapistId}
      const endpoint = `${CONFIG.psikoHekimBaseUrl}/therapist/${therapistId}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        
        if (response.status === 404) {
          toast.error('Danışman bulunamadı');
        } else if (response.status === 500) {
          toast.error('Sunucu hatası. Lütfen tekrar deneyin.');
        } else {
          toast.error(`Danışman bilgileri yüklenirken hata oluştu: ${response.status}`);
        }
        
        router.push(paths.dashboard.therapist.list);
        return;
      }

      const data = await response.json();
      setTherapist(data);
    } catch (error) {
      console.error('Error fetching therapist:', error);
      toast.error(`Danışman bilgileri yüklenirken hata oluştu: ${error.message}`);
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
