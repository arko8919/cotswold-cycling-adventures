import axios from 'axios';
import { LoginResponse } from '@js/types';
import { showAlert } from '../alerts';
import getErrorMessage from '../utils/errorHandler';

/**
 * Sends a login request to the API with provided credentials
 *
 * @param email - The user's email address
 * @param password - The user's password
 */
const login = async (email: string, password: string): Promise<void> => {
  try {
    const response = await axios.post<LoginResponse>('/api/v1/users/login', {
      email,
      password,
    });

    if (response.data.status === 'success') {
      showAlert({ type: 'success', message: 'Logged in successfully!' });
      setTimeout(() => {
        window.location.assign('/'); // Redirects to homepage after login
      }, 1000);
    } else {
      throw new Error('Invalid response from login API.');
    }
  } catch (error) {
    const message = getErrorMessage(error, 'Login failed.');

    showAlert({ type: 'error', message });
  }
};

export default login;
