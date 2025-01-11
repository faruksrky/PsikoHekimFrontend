import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints, fetcherPatient } from 'src/utils/axios';

import { CONFIG } from 'src/config-global';

const swrOptions = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  };


export function useGetPatients() {

    const { data, isLoading, error, isValidating } = useSWR(
      CONFIG.patientList,
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
    const url = patientId ? [endpoints.patient.details, { params: { patientId } }] : '';
  
    const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);
  
    const memoizedValue = useMemo(
      () => ({
        patient: data?.patient,
        patientLoading: isLoading,
        patientError: error,
        patientValidating: isValidating,
      }),
      [data?.patient, error, isLoading, isValidating]
    );
  
    return memoizedValue;
  }
  
