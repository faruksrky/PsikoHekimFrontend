import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';

import { STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------
// Firefox / Strict modda sessionStorage erişim hatalarını yakala
export function safeSessionStorageGet(key) {
  try {
    return typeof window !== 'undefined' ? sessionStorage.getItem(key) : null;
  } catch (e) {
    console.warn('sessionStorage erişilemedi (Firefox özel mod / gizli sekme olabilir):', e?.message);
    return null;
  }
}
export function safeSessionStorageSet(key, value) {
  try {
    if (typeof window !== 'undefined') sessionStorage.setItem(key, value);
  } catch (e) {
    console.warn('sessionStorage yazılamadı:', e?.message);
  }
}
function safeSessionStorageRemove(key) {
  try {
    if (typeof window !== 'undefined') sessionStorage.removeItem(key);
  } catch (e) {
    console.warn('sessionStorage temizlenemedi:', e?.message);
  }
}

// ----------------------------------------------------------------------

export function jwtDecode(token) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid token!');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken) {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    if (!decoded || !('exp' in decoded)) {
      return false;
    }

    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error during token validation:', error);
    return false;
  }
}

// ----------------------------------------------------------------------

export function tokenExpired(exp) {
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  setTimeout(() => {
    try {
      alert('Token expired!');
      safeSessionStorageRemove(STORAGE_KEY);
      safeSessionStorageRemove('user');
      window.location.href = paths.auth.jwt.signIn;
    } catch (error) {
      console.error('Error during token expiration:', error);
      throw error;
    }
  }, timeLeft);
}

// ----------------------------------------------------------------------

export async function setSession(accessToken, user) {
  try {
    if (accessToken) {
      safeSessionStorageSet(STORAGE_KEY, accessToken);
      safeSessionStorageSet('user', JSON.stringify(user));

      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      const decodedToken = jwtDecode(accessToken);

      if (decodedToken && 'exp' in decodedToken) {
        tokenExpired(decodedToken.exp);
      } else {
        throw new Error('Invalid access token!');
      }
    } else {
      safeSessionStorageRemove(STORAGE_KEY);
      safeSessionStorageRemove('user');
      delete axios.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error('Error during set session:', error);
    throw error;
  }
}
