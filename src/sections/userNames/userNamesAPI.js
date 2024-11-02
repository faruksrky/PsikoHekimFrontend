// userNamesAPI.js
import axios from 'axios';

import { STORAGE_KEY } from 'src/auth/context/jwt/constant';

import {CONFIG} from '../../config-global';

const accessToken = sessionStorage.getItem(STORAGE_KEY);

let _userNames = [];



const fetchUserNames = async () => {
  try {
    const response = await axios.get(CONFIG.usersListUserName, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
        });
        _userNames = response.data;
  } catch (error) {
    console.error('error', error);
  }
};

export const getUserNames = async () => {
  if (_userNames.length === 0) {
    await fetchUserNames();
  }
  return _userNames;
};