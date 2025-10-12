import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';

import { PatientEditView } from 'src/sections/patient/view';

// ----------------------------------------------------------------------

const metadata = { title: `Danışan Bilgi Güncelle | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPatient = useCallback(async () => {
    if (!id) {
      toast.error('Danışan ID bulunamadı');
      router.push(paths.dashboard.patient.list);
      return;
    }

    try {
      setLoading(true);
      const token = sessionStorage.getItem('jwt_access_token');
      
      const response = await fetch(`${CONFIG.psikoHekimBaseUrl}/patient/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patient');
      }

      const data = await response.json();
      setPatient(data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error('Danışan bilgileri yüklenirken hata oluştu');
      router.push(paths.dashboard.patient.list);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

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

      <PatientEditView currentPatient={patient} />
    </>
  );
}
