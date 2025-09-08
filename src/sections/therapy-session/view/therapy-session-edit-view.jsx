import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { TherapySessionNewEditForm } from '../therapy-session-new-edit-form';

// ----------------------------------------------------------------------

export function TherapySessionEditView() {
  const router = useRouter();
  const { id } = useParams(); // Get session ID from URL
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      if (!id) {
        toast.error('Seans ID bulunamadı');
        router.push(paths.dashboard.therapySession.list);
        return;
      }

      try {
        setLoading(true);
        const token = sessionStorage.getItem('jwt_access_token');
        
        const response = await fetch(`${CONFIG.psikoHekimBaseUrl}${CONFIG.therapySession.details}/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch therapy session: ${response.status}`);
        }

        const data = await response.json();
        setCurrentSession(data);
      } catch (error) {
        console.error('Error fetching therapy session:', error);
        toast.error('Seans yüklenirken bir hata oluştu');
        router.push(paths.dashboard.therapySession.list);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id, router]);

  const handleSuccess = () => {
    toast.success('Seans başarıyla güncellendi!');
    router.push(paths.dashboard.therapySession.list);
  };

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Seans Bilgilerini Güncelle"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Terapi Seansları', href: paths.dashboard.therapySession.root },
          { name: 'Bilgi Güncelle' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {loading ? (
        <div>Yükleniyor...</div>
      ) : currentSession ? (
        <TherapySessionNewEditForm 
          currentSession={currentSession}
          onSuccess={handleSuccess}
        />
      ) : (
        <div>Seans bulunamadı</div>
      )}
    </Container>
  );
} 