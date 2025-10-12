import { useState, useEffect } from 'react';

import { jwtDecode } from 'jwt-decode';

// ----------------------------------------------------------------------

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // JWT token'dan user bilgilerini al
    const token = sessionStorage.getItem('jwt_access_token');
    
    if (token) {
      try {
        // JWT token'ı decode et
        const payload = jwtDecode(token);
        
        // Keycloak token yapısından role bilgilerini al
        const roles = [];
        
        // Keycloak resource_access'den role'ları al
        if (payload.resource_access) {
          Object.values(payload.resource_access).forEach(client => {
            if (client.roles) {
              roles.push(...client.roles);
            }
          });
        }
        
        // Realm roles'den de al
        if (payload.realm_access?.roles) {
          roles.push(...payload.realm_access.roles);
        }
        
        // User bilgilerini set et
        setUser({
          id: payload.sub || payload.user_id,
          email: payload.email,
          name: payload.name || payload.preferred_username,
          roles: roles.length > 0 ? roles : ['USER'], // Default role
          // Diğer user bilgileri
          ...payload
        });
        
      } catch (error) {
        console.error('Token decode error:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  }, []);

  const hasRole = (requiredRole) => {
    if (!user || !user.roles) {
      return false;
    }
    
    // Role hierarchy: ADMIN > USER
    const roleHierarchy = {
      'USER': 1,
      'ADMIN': 2,
      'Admin': 2, // Keycloak'ta büyük harfle başlayabilir
      'admin': 2
    };
    
    const userMaxRole = Math.max(...user.roles.map(role => roleHierarchy[role] || 0));
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
    return userMaxRole >= requiredRoleLevel;
  };

  const isAdmin = () => hasRole('ADMIN');
  const isUser = () => hasRole('USER');

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('jwt_access_token');
  };

  return {
    user,
    isLoading,
    hasRole,
    isAdmin,
    isUser,
    login,
    logout,
    isAuthenticated: !!user
  };
}
