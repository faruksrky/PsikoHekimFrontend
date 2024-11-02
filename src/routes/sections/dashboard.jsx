import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/calendar/calendar'));

const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit')); 
const PatientListPage = lazy(() => import('src/pages/dashboard/patient/list'));
const PatientCreatePage = lazy(() => import('src/pages/dashboard/patient/new'));
const PatientEditPage = lazy(() => import('src/pages/dashboard/patient/edit'));
const PsychologistListPage = lazy(() => import('src/pages/dashboard/psychologist/list'));
const PsychologistCreatePage = lazy(() => import('src/pages/dashboard/psychologist/new'));
const PsychologistEditPage = lazy(() => import('src/pages/dashboard/psychologist/edit')); 

const CalendarView = lazy(() => import('src/pages/dashboard/calendar/calendar'));

// ----------------------------------------------------------------------

const layoutContent = (
  <DashboardLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <AuthGuard>{layoutContent}</AuthGuard>,
    children: [
      { element: <IndexPage />, index: true },
      
      { path: 'calendar', element: <CalendarView /> },
      {
        path: 'patient',
        children: [
          { path: 'list', element: <PatientListPage /> },
          { path: 'new', element: <PatientCreatePage /> },
          { path: ':id/edit', element: <PatientEditPage /> },
        ],
      },
    
      {
        path: 'user',
        children: [
          { path: 'list', element: <UserListPage /> },
          { path: 'new', element: <UserCreatePage /> },
          { path: ':id/edit', element: <UserEditPage /> },
        ],
      },
      {
        path: 'psychologist',
        children: [
          { path: 'list', element: <PsychologistListPage /> },
          { path: 'new', element: <PsychologistCreatePage /> },
          { path: ':id/edit', element: <PsychologistEditPage /> },
        ],
      },
    ],
  },
];
