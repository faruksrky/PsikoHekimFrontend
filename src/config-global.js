import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export const CONFIG = {
  appName: 'PsikoHekim UI',
  appVersion: packageJson.version,
  serverUrl: import.meta.env.VITE_SERVER_URL ?? '',
  loginUrl: import.meta.env.VITE_LOGIN_URL ?? '',
  signUpUrl: import.meta.env.VITE_SIGNUP_URL ?? '',
  assetsDir: import.meta.env.VITE_ASSETS_DIR ?? '',
  addTherapist: import.meta.env.VITE_ADD_THERAPIST_URL ?? '',
  addPatient: import.meta.env.VITE_ADD_PATIENT_URL ?? '',
  therapistList: import.meta.env.VITE_THERAPIST_LIST_URL ?? '',
  patientList: import.meta.env.VITE_PATIENT_LIST_URL ?? '',
  googleAuthUrl: import.meta.env.VITE_GET_GOOGLE_AUTH_URL ?? '',
  googleCallback: import.meta.env.VITE_GET_GOOGLE_CALLBACK_URL ?? '',
  googleCalendarEvents: import.meta.env.VITE_GET_GOOGLE_CALENDAR_EVENTS_URL ?? '',
  bpmnBaseUrl: import.meta.env.VITE_GET_BPMN_BASE_URL ?? '',
  psikoHekimBaseUrl: import.meta.env.VITE_GET_PsikoHekim_BASE_URL ?? '',

  /**
   * Auth
   * @method jwt | amplify | firebase | supabase | auth0
   */
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: paths.dashboard.root,
  },
  /**
   * Mapbox
   */
  mapboxApiKey: import.meta.env.VITE_MAPBOX_API_KEY ?? '',
  /**
   * Firebase
   */
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APPID ?? '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? '',
  },
  /**
   * Amplify
   */
  amplify: {
    userPoolId: import.meta.env.VITE_AWS_AMPLIFY_USER_POOL_ID ?? '',
    userPoolWebClientId: import.meta.env.VITE_AWS_AMPLIFY_USER_POOL_WEB_CLIENT_ID ?? '',
    region: import.meta.env.VITE_AWS_AMPLIFY_REGION ?? '',
  },
  /**
   * Auth0
   */
  auth0: {
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID ?? '',
    domain: import.meta.env.VITE_AUTH0_DOMAIN ?? '',
    callbackUrl: import.meta.env.VITE_AUTH0_CALLBACK_URL ?? '',
  },
  /**
   * Supabase
   */
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL ?? '',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  },

  // Google Calendar endpoints
  googleCalendar: {
    auth: '/api/google-calendar/redirect-to-google-oauth',
    callback: '/api/google-calendar/callback',
    events: '/api/google-calendar/events',
    sync: '/api/google-calendar/sync',
    status: '/api/google-calendar/status',
  },

  // Outlook Calendar endpoints
  outlookCalendar: {
    auth: '/api/outlook-calendar/redirect',
    callback: '/api/outlook-calendar/callback',
  },

  calendar: {
    // Genel takvim endpointleri
    events: '/api/calendar/events',
    sync: '/api/calendar/sync',
    status: '/api/calendar/status',
    add: '/api/calendar/events/add',
    update: '/api/calendar/events/update',
    delete: '/api/calendar/events/delete',
    
    // Takvim entegrasyonları
    integrations: {
      google: {
        auth: '/api/calendar/integrations/google/auth',
        callback: '/api/calendar/integrations/google/callback',
      },
      outlook: {
        auth: '/api/calendar/integrations/outlook/auth',
        callback: '/api/calendar/integrations/outlook/callback',
      }
    }
  }
};
