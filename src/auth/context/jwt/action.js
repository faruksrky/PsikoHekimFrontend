import { jwtDecode } from 'jwt-decode';

import { axiosInstance, axiosInstanceKeycloak } from 'src/utils/axios';

import { setSession } from './utils';
import { STORAGE_KEY } from './constant';
import {CONFIG} from '../../../config-global';

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ username, password }) => {
    try {
      const res = await axiosInstanceKeycloak.post('/keycloak/getToken', {
        username,
        password
      });

      // istek başarılı olursa, gelen verileri accessToken değişkenine atıyoruz
      const accessToken = res.data.access_token;

      if (!accessToken) {
        throw new Error('Access Token bulunamadı');
      }

      // Kullanıcı bilgilerini al
      const userInfoRes = await axiosInstanceKeycloak.get('/keycloak/userInfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const userInfo = userInfoRes.data;
      const user = {
        email: userInfo.email,
        name: userInfo.name
      };

      setSession(accessToken, user);

    } catch (error) {
      if (error.response) {
        console.error(error.response.data);
      }
      else if(error.request){
        console.error(error.request);
      }
      console.error('Sunucu yanıt veremedi', error);
      throw error;
    }
}

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({ userName, email, password, firstName, lastName }) => {
  const params = {
    userName,
    email,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await axiosInstanceKeycloak.post('/keycloak/register', params);
    const accessToken = sessionStorage.getItem('jwt_access_token');

    sessionStorage.setItem(STORAGE_KEY, accessToken);

    // Return a success message
    return 'Başarılı bir şekilde kayıt oldunuz.';
  } catch (error) {
    console.error('Yeni kullanıcı oluştururken hata oluştu:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async () => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};

/** **************************************
 * Update password
 *************************************** */
export const updatePassword = async ({ username, confirmationCode, newPassword }) => {
  try {
    const params = {
      username,
      confirmationCode,
      newPassword,
    };

    const res = await axiosInstanceKeycloak.post('/keycloak/update-password', params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    sessionStorage.setItem(STORAGE_KEY, accessToken);
  } catch (error) {
    console.error('Error during password update:', error);
    throw error;
  }
};

/** **************************************
 * Reset password
 *************************************** */
export const resetPassword = async ({ username }) => {
  try {
    const params = { username };

    await axiosInstanceKeycloak.post('/keycloak/reset-password', params);
  } catch (error) {
    console.error('Error during password reset:', error);
    throw error;
  }
};

// Önce getTherapistId'yi export edelim
export const getTherapistId = async (email) => {
  try {
    const token = sessionStorage.getItem('jwt_access_token');
    // URL'i manuel olarak oluştur ve encode et
    const encodedEmail = encodeURIComponent(email);
    const url = `${CONFIG.psikoHekimBaseUrl}/therapist/by-email?email=${encodedEmail}`;
  
    // Axios kullanarak daha güvenli istek
    const response = await axiosInstance.get(`/therapist/by-email?email=${encodedEmail}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 saniye timeout
    });

    return response.data;
  } catch (error) {
    console.error('Therapist ID Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      headers: error.response?.headers
    });
    
    if (error.response?.status === 404) {
      return null;
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error('CORS veya Network hatası - Backend CORS ayarlarını kontrol edin');
    }
    
    return null;
  }
};

// Sonra getEmailFromToken'ı export edelim
export const getEmailFromToken = () => {
  const token = sessionStorage.getItem('jwt_access_token');
  if (!token) return null;
  
  const decoded = jwtDecode(token);
  const isAdmin = decoded.resource_access?.DN?.roles?.includes('Admin');
  
  return {
    email: decoded.email,
    isAdmin
  };
};