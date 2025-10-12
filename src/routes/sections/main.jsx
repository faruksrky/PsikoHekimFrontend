import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

// Error
const Page404 = lazy(() => import('src/pages/error/404'));
const UnauthorizedPage = lazy(() => import('src/pages/error/unauthorized'));

// ----------------------------------------------------------------------

export const mainRoutes = [
  {
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [
      { path: '404', element: <Page404 /> },
      { path: 'unauthorized', element: <UnauthorizedPage /> },
    ],
  },
];
