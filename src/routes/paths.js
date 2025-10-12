import { _id } from 'src/_mock/assets';
// ----------------------------------------------------------------------


const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------
const MOCK_ID = _id[1];
export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
      resetPassword: `${ROOTS.AUTH}/jwt/reset-password`,
      updatePassword: `${ROOTS.AUTH}/jwt/update-password`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
      updatePassword: `${ROOTS.AUTH}/firebase/update-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    inbox: `${ROOTS.DASHBOARD}/inbox`,
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      edit: (id) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit`,
      },
    },

    patient: {
      root: `${ROOTS.DASHBOARD}/patient`,
      new: `${ROOTS.DASHBOARD}/patient/new`,
      list: `${ROOTS.DASHBOARD}/patient/list`,
      details: (id) => `${ROOTS.DASHBOARD}/patient/${id}/details`,
      payments: (id) => `${ROOTS.DASHBOARD}/patient/${id}/payments`,
      assignTherapist: (patientId) => 
        `${ROOTS.DASHBOARD}/patient/${patientId}/assign-therapist`,
      edit: (id) => `${ROOTS.DASHBOARD}/patient/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/patient/${MOCK_ID}/edit`,
      },
    },

    therapist: {
      root: `${ROOTS.DASHBOARD}/therapist`,
      new: `${ROOTS.DASHBOARD}/therapist/new`,
      list: `${ROOTS.DASHBOARD}/therapist/list`,
      details: (id) => `${ROOTS.DASHBOARD}/therapist/${id}/details`,
      edit: (id) => `${ROOTS.DASHBOARD}/therapist/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/therapist/${MOCK_ID}/edit`,
      },
    },

    analytics: `${ROOTS.DASHBOARD}/analytics`,

    process: {
      root: `${ROOTS.DASHBOARD}/process`,
      assignments: `${ROOTS.DASHBOARD}/process/assignments`,
      status: (processInstanceKey) => `${ROOTS.DASHBOARD}/process/status/${processInstanceKey}`,
    },

    therapySession: {
      root: `${ROOTS.DASHBOARD}/therapy-session`,
      list: `${ROOTS.DASHBOARD}/therapy-session/list`,
      new: `${ROOTS.DASHBOARD}/therapy-session/new`,
      editGeneral: `${ROOTS.DASHBOARD}/therapy-session/edit`,
      details: (id) => `${ROOTS.DASHBOARD}/therapy-session/${id}/details`,
      edit: (id) => `${ROOTS.DASHBOARD}/therapy-session/${id}/edit`,
      complete: (id) => `${ROOTS.DASHBOARD}/therapy-session/${id}/complete`,
      cancel: (id) => `${ROOTS.DASHBOARD}/therapy-session/${id}/cancel`,
      reschedule: (id) => `${ROOTS.DASHBOARD}/therapy-session/${id}/reschedule`,
      calendar: `${ROOTS.DASHBOARD}/therapy-session/calendar`,
      analytics: `${ROOTS.DASHBOARD}/therapy-session/analytics`,
    },

    group: {
      root: `${ROOTS.DASHBOARD}/group`,
    },
  },
};
