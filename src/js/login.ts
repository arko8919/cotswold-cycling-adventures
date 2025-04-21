import axios from 'axios';
import { LoginResponse } from '@js/types';
import { showAlert } from './alerts';

/**
 * Sends a login request to the API with provided credentials.
 * @param email - The user's email address
 * @param password - The user's password
 */
export const login = async (email: string, password: string): Promise<void> => {
  try {
    const response = await axios.post<LoginResponse>('/api/v1/users/login', {
      email,
      password,
    });

    if (response.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      setTimeout(() => {
        window.location.assign('/'); // Redirects to homepage after login
      }, 1000);
    } else {
      throw new Error('Unexpected response from server.');
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Login failed.';
      showAlert('error', message);
    } else {
      console.error('Unexpected error during login:', error);
      showAlert('error', 'An unexpected error occurred. Please try again.');
    }
  }
};

/**
 * Sends a logout request to the API and handles client-side redirection.
 */
export const logout = async (): Promise<void> => {
  try {
    const response = await axios.get<LoginResponse>('/api/v1/users/logout');

    if (response.data.status === 'success') {
      showAlert('success', 'Logged out successfully.');
      // Redirects to the login page and replaces history
      // to prevent "Back" navigation to protected page
      window.location.replace('/login');
    } else {
      throw new Error('Unexpected response from server.');
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Logout failed.';
      showAlert('error', message);
    } else {
      console.error('Unexpected error during logout:', error);
      showAlert('error', 'An unexpected error occurred while logging out.');
    }
  }
};
