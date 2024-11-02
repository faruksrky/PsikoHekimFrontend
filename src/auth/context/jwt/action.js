import qs from 'qs';

import axios, { endpoints } from 'src/utils/axios';

import { setSession } from './utils';
import { STORAGE_KEY } from './constant';
import {CONFIG} from '../../../config-global';

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ username, password }) => {

    const params = qs.stringify(
      { username, password },
      { arrayFormat: 'brackets' }
    );

    try {
      const res = await axios.post(CONFIG.loginUrl, params, 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // istek başarılı olursa, gelen verileri accessToken değişkenine atıyoruz
    const accessToken = res.data.access_token;

    if (!accessToken) {
      throw new Error('Access Token bulunamadı');
    }
    setSession(accessToken,username);

  } catch (error) {
    if (error.response) {
      console.error(error.response.data);
    }
    else if(error.request){
      console.error (error.request);
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
    const res = await axios.post(CONFIG.signUpUrl, params);
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

    const res = await axios.post(endpoints.auth.updatePassword, params);

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

    await axios.post(endpoints.auth.resetPassword, params);
  } catch (error) {
    console.error('Error during password reset:', error);
    throw error;
  }
};
