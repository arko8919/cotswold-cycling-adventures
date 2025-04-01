/* eslint-disable */
import axios from 'axios';
import { showAlert } from '../alerts';

export const createAdventure = async (data, action, id = '') => {
  try {
    let url = '/api/v1/adventures';
    let res;

    if (action === 'create') {
      res = await axios.post(url, data);
    }

    if (action === 'update') {
      res = await axios.patch(`${url}/${id}`, data);
    }

    if (res.data.status === 'success') {
      showAlert('success', `Adventure ${action}d successfully`);
    }
  } catch (err) {
    console.log(err.response?.data?.message);
    showAlert('error', err.response?.data?.message || 'Something went wrong');
  }
};
