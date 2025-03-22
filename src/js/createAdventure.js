/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const createAdventure = async (data) => {
  try {
    const url = '/api/v1/adventures';
    const res = await axios.post(url, data);

    if (res.data.status === 'success') {
      showAlert('success', 'Adventure created successfully');
    }
  } catch (err) {
    console.log(err.response?.data?.message);
    showAlert('error', err.response?.data?.message || 'Something went wrong');
  }
};
