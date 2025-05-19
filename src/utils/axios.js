import axios from 'axios';
import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

// Ana API instance'ı
export const axiosInstance = axios.create({
  baseURL: CONFIG.psikoHekimBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Keycloak için instance
export const axiosInstanceKeycloak = axios.create({
  baseURL: CONFIG.keycloakBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// BPMN için instance
export const axiosInstanceBpmn = axios.create({
  baseURL: CONFIG.bpmn.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Therapist için instance
export const axiosInstanceTherapist = axios.create({ 
  baseURL: CONFIG.psikoHekimBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Patient için instance
export const axiosInstancePatient = axios.create({ 
  baseURL: CONFIG.psikoHekimBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for main instance
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('jwt_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for main instance
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// Response interceptor for Keycloak instance
axiosInstanceKeycloak.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Keycloak işlemlerinde hata var!')
);

// Response interceptor for BPMN instance
axiosInstanceBpmn.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'BPMN işlemlerinde hata var!')
);

// Response interceptor for Therapist instance
axiosInstanceTherapist.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Therapist işlemlerinde hata var!')
);

// Response interceptor for Patient instance
axiosInstancePatient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Patient işlemlerinde hata var!')
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
    const res = await axiosInstanceTherapist.get(CONFIG.therapistListUrl);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch therapist:', error);
    throw error;
  }
};

export const fetcherPatient = async () => {
  try {
    const res = await axiosInstancePatient.get(CONFIG.patientListUrl);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch patient:', error);
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
    getToken: '/keycloak/getToken',
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
    list: CONFIG.therapistListUrl,
    details: CONFIG.therapistDetailsUrl,
    search: CONFIG.therapistSearchUrl,
  },
  patient: {
    list: CONFIG.patientListUrl,
    details: CONFIG.patientDetailsUrl,
    search: CONFIG.patientSearchUrl,
  },
};
