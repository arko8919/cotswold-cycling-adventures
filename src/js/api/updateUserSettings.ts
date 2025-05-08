import axios from 'axios';
import { showAlert } from '../utils/alerts';
import getErrorMessage from '../utils/errorHandler';
import { UpdatedUser } from '@js/types';

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
export const updateUserSettings = async (
  data: FormData | PasswordData,
  type: 'password' | 'data',
) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await axios.patch<UpdatedUser>(url, data);

    if (res.data.status === 'success') {
      showAlert({
        type: 'success',
        message: `${type === 'password' ? 'Password' : 'User'} updated successfully!`,
      });
    } else {
      throw new Error('Invalid response from update user settings API.');
    }
  } catch (err) {
    const message = getErrorMessage(
      err,
      `${type === 'password' ? 'Password' : 'User'} update failed!`,
    );
    showAlert({ type: 'error', message });
  }
};
