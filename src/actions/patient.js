import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints, fetcherPatient, fetcherSinglePatient } from 'src/utils/axios';

import { CONFIG } from 'src/config-global';

const swrOptions = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  };


export function useGetPatients() {

    const { data, isLoading, error, isValidating } = useSWR(
      CONFIG.patientListUrl,
      fetcherPatient,
      swrOptions
    );
    
    const memoizedValue = useMemo(
      () => ({
        patients: data?.patients || [],
        patientsLoading: isLoading,
        patientsError: error,
        patientsValidating: isValidating,
        patientsEmpty: !isLoading && !data?.patients.length,
      }),
      [data?.patients, error, isLoading, isValidating]
    );
  
    return memoizedValue;
  }


export function useGetPatient(patientId) {
    const url = patientId ? `/patient/${patientId}` : '';
  
    const { data, isLoading, error, isValidating } = useSWR(url, fetcherSinglePatient, swrOptions);
  
    const memoizedValue = useMemo(
      () => ({
        patient: data, // API direkt patient objesi dönüyor, data.patient değil
        patientLoading: isLoading,
        patientError: error,
        patientValidating: isValidating,
      }),
      [data, error, isLoading, isValidating]
    );
  
    return memoizedValue;
  }
  
