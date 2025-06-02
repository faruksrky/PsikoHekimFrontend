import { lazy, Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

const InboxView = lazy(() => import('src/sections/inbox/view/inbox-view').then(module => ({ default: module.InboxView })));
const IndexPage = lazy(() => import('src/pages/dashboard/calendar/calendar'));

const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit')); 
const PatientListPage = lazy(() => import('src/pages/dashboard/patient/list'));
const PatientCreatePage = lazy(() => import('src/pages/dashboard/patient/new'));
const PatientDetailsPage = lazy(() => import('src/sections/patient/view/patient-details-view').then(module => ({ default: module.PatientDetailsView })));
const AssignTherapistView = lazy(() => import('src/pages/dashboard/patient/assignTherapist'));
const PatientEditPage = lazy(() => import('src/pages/dashboard/patient/edit'));
const TherapistListPage = lazy(() => import('src/pages/dashboard/therapist/list'));
const TherapistCreatePage = lazy(() => import('src/pages/dashboard/therapist/new'));
const TherapistEditPage = lazy(() => import('src/pages/dashboard/therapist/edit'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
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
      { element: <Navigate to="/dashboard/inbox" replace />, index: true },
      { path: 'inbox', element: <InboxView /> },
      { path: 'calendar', element: <CalendarView /> },
     
      {
        path: 'patient',
        children: [
          { element: <Navigate to="/dashboard/patient/list" replace />, index: true },
          { path: 'list', element: <PatientListPage /> },
          { path: 'new', element: <PatientCreatePage /> },
          { path: ':id/details', element: <PatientDetailsPage /> },
          { path: ':id/edit', element: <PatientEditPage /> },
          { path: ':id/assign-therapist', element: <AssignTherapistView /> },
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
        path: 'therapist',
        children: [
          { path: 'list', element: <TherapistListPage /> },
          { path: 'new', element: <TherapistCreatePage /> },
          { path: ':id/edit', element: <TherapistEditPage /> },
        ],
      },
      { path: 'analytics', element: <OverviewAnalyticsPage /> },
    ],
  },
];
