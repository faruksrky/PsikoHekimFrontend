import { axiosInstance } from 'src/utils/axios';

import { CONFIG } from 'src/config-global';

export function useGetPendingRequests(therapistId) {
  const getPendingRequests = async () => {
    try {
      const therapistIdLong = parseInt(therapistId, 10);
      const response = await axiosInstance.get(`${CONFIG.psikoHekimBaseUrl}/process/inbox/pending`, {
        params: {
          therapistId: therapistIdLong
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  };

  return { getPendingRequests };
} 