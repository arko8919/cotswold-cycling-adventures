/* eslint-disable */
import axios from 'axios';
import { showAlert } from '../alerts';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert({
        type: 'success',
        message: `${type.toUpperCase()} Data updated successfully!`,
      });
    }
  } catch (err) {
    showAlert({ type: 'error', message: err.response.data.message });
  }
};
