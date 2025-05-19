import useSWR from 'swr';
import { axiosInstance } from 'src/utils/axios';
import { CONFIG } from 'src/config-global';

export function useGetTherapists() {
  const { data, error, isLoading, mutate } = useSWR(
    CONFIG.therapistListUrl,
    async (url) => {
      try {
        const response = await axiosInstance.get(url);
        return response.data;
      } catch (err) {
        console.error('Error fetching therapists:', err);
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  return {
    therapists: data?.therapists || [],
    isLoading,
    error,
    mutate,
  };
}

export function useAssignTherapistToPatient() {
  const assignTherapistToPatient = async (patientId, therapistId) => {
    try {
      if (!patientId) {
        throw new Error('Danışan ID\'si bulunamadı');
      }

      if (!therapistId) {
        throw new Error('Danışman ID\'si bulunamadı');
      }

      const url = '/therapist/assign-therapist';
      const response = await axiosInstance.post(url, {
        patientId,
        therapistId,
      });

      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Danışman atama işlemi başarısız oldu');
    } catch (error) {
      console.error('Error assigning therapist:', error);
      throw error;
    }
  };

  return { assignTherapistToPatient };
} 