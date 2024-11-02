import axios from 'axios';

import {CONFIG} from '../../../config-global';
import { getUserNames } from '../../userNames/userNamesAPI';

export const fetchData = async () => {
  try {
    const response = await axios.get(CONFIG.customerListUrl);
    const data = Array.isArray(response.data) ? response.data : [];

    const userNames = await getUserNames();

    return { data, userNames };
  } catch (error) {
    console.error('Error fetching data', error);
    return { data: [], userNames: [] };
  }
};

export const fetchCustomerList = async () => {
  try {
    const response = await axios.get(CONFIG.customerListUrl);
    const data = Array.isArray(response.data) ? response.data : [];
    return data;
  } catch (error) {
    console.error('Error fetching customer list', error);
    return [];
  }
};