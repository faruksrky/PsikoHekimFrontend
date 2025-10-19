import { jwtDecode } from 'jwt-decode';
import { useMemo, useEffect, useCallback } from 'react';

import { useSetState } from 'src/hooks/use-set-state';

import { STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken } from './utils';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({
    user: null,
    email: null,
    loading: true,
  });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);
  
      if (accessToken && isValidToken(accessToken)) {
        const jwtDecodeModule = jwtDecode;
        const decodedToken = jwtDecodeModule.default
          ? jwtDecodeModule.default(accessToken)
          : jwtDecodeModule(accessToken);

        // Token'dan kullanıcı bilgilerini al
        // Role'ü JWT token'dan çek (Keycloak format: resource_access.DN.roles veya realm_access.roles)
        let roles = decodedToken.resource_access?.DN?.roles || [];
        
        // Eğer DN.roles yoksa, realm_access.roles kullan
        if (roles.length === 0 && decodedToken.realm_access?.roles) {
          roles = decodedToken.realm_access.roles;
        }
        
        const isAdmin = roles.includes('Admin') || roles.includes('admin') || roles.includes('ADMIN');
        
        const user = {
          email: decodedToken.email,
          name: decodedToken.name,
          role: isAdmin ? 'admin' : 'user'  // Role'ü token'dan al
        };

        // Session'ı güncelle
        await setSession(accessToken, user);
        sessionStorage.setItem('username', user.name);
        sessionStorage.setItem('email', user.email);
        setState({ user: { ...user, accessToken }, loading: false });
      } else {
        setState({ user: null, email: null, loading: false });
      }
    } catch (error) {
      console.error('Session check error:', error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
            ...state.user,
            role: state.user?.role ?? 'user',  // Default: user (güvenlik için)
          }
        : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
