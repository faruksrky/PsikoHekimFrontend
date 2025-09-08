import useSWR from 'swr';
import { useMemo } from 'react';

import { axiosInstancePatient } from 'src/utils/axios';


const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

const fetcher = async (url) => {
  try {
    console.log('Fetching from URL:', url);
    const response = await axiosInstancePatient.get('/patient/all');
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export function useGetPatients() {
  const { data, isLoading, error, isValidating } = useSWR(
    '/patient/all',
    fetcher,
    swrOptions
  );

  console.log('SWR State:', { data, isLoading, error, isValidating });

  const memoizedValue = useMemo(
    () => {
      const patients = data?.patients || [];
      const isEmpty = !isLoading && (!data || !data.patients || patients.length === 0);

      console.log('Memoized Value:', {
        patients,
        patientsLoading: isLoading,
        patientsError: error,
        patientsValidating: isValidating,
        patientsEmpty: isEmpty,
      });

      return {
        patients,
        patientsLoading: isLoading,
        patientsError: error,
        patientsValidating: isValidating,
        patientsEmpty: isEmpty,
      };
    },
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useAssignTherapistToPatient() {
  const assignTherapistToPatient = async (patientId, therapistId) => {
    try {
      const response = await axiosInstancePatient.post(`/assign-therapist`, {
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