import { axiosInstance } from 'src/utils/axios';
import { CONFIG } from 'src/config-global';

export function useGetPendingRequests(therapistId) {
  const getPendingRequests = async () => {
    try {
      const response = await axiosInstance.get(`${CONFIG.psikoHekimBaseUrl}/inbox/pending?therapistId=${therapistId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  };

  return { getPendingRequests };
} 