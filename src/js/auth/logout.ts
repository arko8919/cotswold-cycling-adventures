import axios from 'axios';
import { showAlert } from '../alerts';
import getErrorMessage from '../utils/errorHandler';

/**
 * Sends a logout request to the API.
 */
const logout = async (): Promise<void> => {
  try {
    const response = await axios.get<{ status: string }>(
      '/api/v1/users/logout',
    );

    if (response.data.status === 'success') {
      showAlert({ type: 'success', message: 'Logged out successfully.' });
      // Redirects to the login page and replaces history
      // to prevent "Back" navigation to protected page
      window.location.replace('/login');
    } else {
      throw new Error('Invalid response from logout API.');
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'Logout failed.');
    showAlert({ type: 'error', message });
  }
};

export default logout;
