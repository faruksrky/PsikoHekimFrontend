import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints, fetcherTherapist } from 'src/utils/axios';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

export function useGetTherapists() {

  const { data, isLoading, error, isValidating } = useSWR(
    CONFIG.therapistList,
    fetcherTherapist,
    swrOptions
  );
  
  const memoizedValue = useMemo(
    () => ({
      therapists: data?.therapists || [],
      therapistsLoading: isLoading,
      therapistsError: error,
      therapistsValidating: isValidating,
      therapistsEmpty: !isLoading && !data?.therapists.length,
    }),
    [data?.therapists, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetTherapist(therapistId) {
  const url = therapistId ? [endpoints.therapist.details, { params: { therapistId } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      therapist: data?.therapist,
      therapistLoading: isLoading,
      therapistError: error,
      therapistValidating: isValidating,
    }),
    [data?.therapist, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useSearchTherapists(query) {
  const url = query ? [endpoints.therapist.search, { params: { query } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.results || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !data?.results.length,
    }),
    [data?.results, error, isLoading, isValidating]
  );

  return memoizedValue;
}
