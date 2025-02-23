/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// Sends a login request with email and password to the API
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    // Shows a success alert and redirects to the homepage after 1.5 seconds
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// Sends a logout request to the API
export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    // ✅ If logout is successful, redirect to the login page
    if (res.data.status === 'success') {
      window.location.href = '/login'; // Change this to your actual login or home page
    }
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};
