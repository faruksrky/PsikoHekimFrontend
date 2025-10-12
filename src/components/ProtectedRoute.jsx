import { Navigate } from 'react-router-dom';

import { LoadingScreen } from 'src/components/loading-screen';
import { useAuth } from 'src/hooks/useAuth';

// ----------------------------------------------------------------------

export function ProtectedRoute({ children, requiredRole, fallback }) {
  const { hasRole, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!hasRole(requiredRole)) {
    return fallback || <Navigate to="/unauthorized" />;
  }

  return children;
}
