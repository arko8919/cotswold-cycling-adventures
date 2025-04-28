import axios, { AxiosResponse } from 'axios';
import { showAlert } from '../alerts';
import getErrorMessage from '../utils/errorHandler';

type PasswordData = {
  passwordCurrent: string;
  password: string;
  passwordConfirm: string;
};

/**
 * Updates user profile data or password via a PATCH request.
 *
 * @param data - FormData for profile updates or PasswordData for password updates.
 * @param type - Action type: either 'data' for profile info or 'password' for password change.
 *
 */
export const updateSettings = async (
  data: FormData | PasswordData,
  type: 'password' | 'data',
) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res: AxiosResponse<any> = await axios.patch(url, data);

    if (res.data.status === 'success') {
      showAlert({
        type: 'success',
        message: `${type === 'password' ? 'Password' : 'User'} updated successfully!`,
      });
    }
  } catch (err) {
    const message = getErrorMessage(err, 'Update failed.');
    showAlert({ type: 'error', message });
  }
};
