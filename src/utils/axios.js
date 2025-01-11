
import axios from 'axios';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

const axiosInstanceTherapist = axios.create({ baseURL: CONFIG.therapistList });

const axiosInstancePatient = axios.create({ baseURL: CONFIG.patientList });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Server işlemlerinde hata var!')
);

axiosInstanceTherapist.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Server işlemlerinde hata var!')
);

axiosInstancePatient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Server işlemlerinde hata var!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

export const fetcherTherapist = async () => {
  try {
    const res = await axiosInstanceTherapist();
    return res.data;
  } catch (error) {
    console.error('Error in Fetcher:', error);
    throw error;
  }
};

export const fetcherPatient = async () => {
  try {
    const res = await axiosInstancePatient();
    return res.data;
  } catch (error) {
    console.error('Error in Fetcher:', error);
    throw error;
  }
};



// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    signIn: '/api/auth/sign-in',
    signUp: '/api/auth/sign-up',
    resetPassword: '/api/auth/reset-password',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  therapist: {
    list: '/therapist/all',
    details: '/therapist/details',
    search: '/therapist/search',
  },
  patient: {
    list: '/patient/all',
    details: '/patient/details',
    search: '/patient/search',
  },
};
