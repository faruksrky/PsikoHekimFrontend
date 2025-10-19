import { useState, useEffect } from 'react';

import { jwtDecode } from 'jwt-decode';

// ----------------------------------------------------------------------

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // auth-provider.jsx'den kaydedilen user bilgisini al
    const userData = sessionStorage.getItem('user');
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('User data parse error:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  }, []);

  const hasRole = (requiredRole) => {
    if (!user) {
      return false;
    }
    
    // auth-provider.jsx'den gelen user.role kullan
    const userRole = user.role || 'user';
    
    // Role hierarchy: admin > user
    const roleHierarchy = {
      'user': 1,
      'admin': 2,
      'USER': 1,
      'ADMIN': 2
    };
    
    const userRoleLevel = roleHierarchy[userRole] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
    return userRoleLevel >= requiredRoleLevel;
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
