import { lazy, Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';
import { ProtectedRoute } from 'src/components/ProtectedRoute';

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
const TherapistDetailsView = lazy(() => import('src/sections/therapist/view/therapist-details-view').then(module => ({ default: module.TherapistDetailsView })));
const TherapistPatientsPage = lazy(() => import('src/pages/dashboard/therapist/patients'));

// Therapy Session Pages
const TherapySessionListView = lazy(() => import('src/sections/therapy-session/view/therapy-session-list-view').then(module => ({ default: module.TherapySessionListView })));
const TherapySessionCreateView = lazy(() => import('src/sections/therapy-session/view/therapy-session-create-view').then(module => ({ default: module.TherapySessionCreateView })));
const TherapySessionDetailsView = lazy(() => import('src/sections/therapy-session/view/therapy-session-details-view').then(module => ({ default: module.TherapySessionDetailsView })));
const TherapySessionEditView = lazy(() => import('src/sections/therapy-session/view/therapy-session-edit-view').then(module => ({ default: module.TherapySessionEditView })));
const TherapySessionRescheduleView = lazy(() => import('src/sections/therapy-session/view/therapy-session-reschedule-view'));
const TherapySessionAnalyticsView = lazy(() => import('src/sections/therapy-session/view/therapy-session-analytics-view').then(module => ({ default: module.TherapySessionAnalyticsView })));

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
      {
        path: 'inbox',
        element: (
          <ProtectedRoute requiredRole="USER">
            <InboxView />
          </ProtectedRoute>
        )
      },
      {
        path: 'calendar',
        element: (
          <ProtectedRoute requiredRole="USER">
            <CalendarView />
          </ProtectedRoute>
        )
      },

      {
        path: 'patient',
        children: [
          { element: <Navigate to="/dashboard/patient/list" replace />, index: true },
          {
            path: 'list',
            element: (
              <ProtectedRoute requiredRole="ADMIN">
                <PatientListPage />
              </ProtectedRoute>
            )
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute requiredRole="ADMIN">
                <PatientCreatePage />
              </ProtectedRoute>
            )
          },
          {
            path: ':id/details',
            element: (
              <ProtectedRoute requiredRole="ADMIN">
                <PatientDetailsPage />
              </ProtectedRoute>
            )
          },
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute requiredRole="ADMIN">
                <PatientEditPage />
              </ProtectedRoute>
            )
          },
          {
            path: ':id/assign-therapist',
            element: (
              <ProtectedRoute requiredRole="ADMIN">
                <AssignTherapistView />
              </ProtectedRoute>
            )
          },
        ],
      },

      {
        path: 'user',
        children: [
          {
            path: 'list',
            element: (
              <ProtectedRoute requiredRole="ADMIN">
                <UserListPage />
              </ProtectedRoute>
            )
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute requiredRole="ADMIN">
                <UserCreatePage />
              </ProtectedRoute>
            )
          },
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute requiredRole="ADMIN">
                <UserEditPage />
              </ProtectedRoute>
            )
          },
        ],
      },
      {
        path: 'therapist',
        children: [
          { element: <Navigate to="/dashboard/therapist/list" replace />, index: true },
          {
            path: 'list',
            element: (
              <ProtectedRoute requiredRole="ADMIN">
                <TherapistListPage />
              </ProtectedRoute>
            )
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute requiredRole="ADMIN">
                <TherapistCreatePage />
              </ProtectedRoute>
            )
          },
          {
            path: ':id/details',
            element: (
              <ProtectedRoute requiredRole="ADMIN">
                <TherapistDetailsView />
              </ProtectedRoute>
            )
          },
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute requiredRole="ADMIN">
                <TherapistEditPage />
              </ProtectedRoute>
            )
          },
          {
            path: ':id/patients',
            element: (
              <ProtectedRoute requiredRole="ADMIN">
                <TherapistPatientsPage />
              </ProtectedRoute>
            )
          },
        ],
      },
      {
        path: 'therapy-session',
        children: [
          { element: <Navigate to="/dashboard/therapy-session/list" replace />, index: true },
          {
            path: 'list',
            element: (
              <ProtectedRoute requiredRole="USER">
                <TherapySessionListView />
              </ProtectedRoute>
            )
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute requiredRole="USER">
                <TherapySessionCreateView />
              </ProtectedRoute>
            )
          },
          {
            path: 'edit',
            element: (
              <ProtectedRoute requiredRole="USER">
                <TherapySessionEditView />
              </ProtectedRoute>
            )
          },
          {
            path: 'analytics',
            element: (
              <ProtectedRoute requiredRole="USER">
                <TherapySessionAnalyticsView />
              </ProtectedRoute>
            )
          },
          {
            path: ':id/details',
            element: (
              <ProtectedRoute requiredRole="USER">
                <TherapySessionDetailsView />
              </ProtectedRoute>
            )
          },
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute requiredRole="USER">
                <TherapySessionEditView />
              </ProtectedRoute>
            )
          },
          {
            path: ':id/reschedule',
            element: (
              <ProtectedRoute requiredRole="USER">
                <TherapySessionRescheduleView />
              </ProtectedRoute>
            )
          },
        ],
      },
      {
        path: 'analytics',
        element: (
          <ProtectedRoute requiredRole="USER">
            <OverviewAnalyticsPage />
          </ProtectedRoute>
        )
      },
    ],
  },
];
