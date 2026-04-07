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

// Keycloak projesi - auth.iyihislerapp.com (LoginController, UserController - Keycloak imajı ile ayağa kalkan app)
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

// BPMN isteklerine token ekle (403 önlemek için)
axiosInstanceBpmn.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('jwt_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

// Kimlik doğrulama gerektirmeyen Keycloak uçları — eski JWT eklenirse getToken 400 dönebilir
const KEYCLOAK_PUBLIC_PATH_PREFIXES = [
  '/keycloak/getToken',
  '/keycloak/reset-password',
  '/keycloak/update-password',
];

// Request interceptor for Keycloak instance
axiosInstanceKeycloak.interceptors.request.use(
  (config) => {
    const path = config.url || '';
    const isPublicKeycloakAuth = KEYCLOAK_PUBLIC_PATH_PREFIXES.some((p) => path.includes(p));
    const token = typeof window !== 'undefined' && sessionStorage.getItem('jwt_access_token');
    if (!isPublicKeycloakAuth && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (typeof window !== 'undefined') config.headers['X-Requested-With'] = 'XMLHttpRequest';
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
  (error) => {
    // CORS hatasını tespit et
    const isCorsError = 
      !error.response && 
      error.message && 
      (error.message.includes('CORS') || 
       error.message.includes('Network Error') ||
       error.code === 'ERR_NETWORK' ||
       error.code === 'ERR_FAILED');
    
    // Preserve the original error structure but add better logging
    console.error('Keycloak API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      fullURL: `${error.config?.baseURL || ''}${error.config?.url || ''}`,
      headers: error.config?.headers,
      requestData: error.config?.data,
      isCorsError,
      errorCode: error.code,
      errorMessage: error.message
    });
    
    // CORS hatası için özel mesaj ekle
    if (isCorsError) {
      error.isCorsError = true;
      error.corsMessage = 'CORS Hatası: Backend servisi CORS başlıklarını göndermiyor. Sunucu yöneticisi ile iletişime geçin.';
      console.error('🚫 CORS ERROR DETECTED:', {
        origin: window.location.origin,
        target: `${error.config?.baseURL || ''}${error.config?.url || ''}`,
        message: 'Backend CORS ayarları eksik. Keycloak servisinde CORS yapılandırması yapılmalı.'
      });
    }
    
    // Return the original error to preserve error handling in calling functions
    return Promise.reject(error);
  }
);

// Response interceptor for BPMN instance
axiosInstanceBpmn.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('BPMN API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    return Promise.reject(error);
  }
);

// Response interceptor for Therapist instance
axiosInstanceTherapist.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Therapist API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    return Promise.reject(error);
  }
);

// Response interceptor for Patient instance
axiosInstancePatient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Patient API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    return Promise.reject(error);
  }
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
    
    // 404 hatası için boş liste döndür
    if (error.response?.status === 404) {
      console.log('No therapists found, returning empty list');
      return { therapists: [] };
    }
    
    throw error;
  }
};

export const fetcherPatient = async () => {
  try {
    const res = await axiosInstancePatient.get(CONFIG.patientListUrl);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch patient:', error);
    
    // 404 hatası için boş liste döndür
    if (error.response?.status === 404) {
      console.log('No patients found, returning empty list');
      return { patients: [] };
    }
    
    throw error;
  }
};

export const fetcherSinglePatient = async (url) => {
  try {
    const res = await axiosInstancePatient.get(url);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch single patient:', error);
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
