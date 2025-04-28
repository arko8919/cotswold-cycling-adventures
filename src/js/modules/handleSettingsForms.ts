import { updateSettings } from '../api/updateSettings';

/**
 * Initializes handlers for user account forms.
 *
 * - `initUserForm` handles updating user profile information (name, email, photo).
 *   - Collects input values.
 *   - Appends them into a FormData object.
 *   - Submits the data to the server via `updateSettings`.
 *
 * - `initPasswordForm` handles updating the user's password.
 *   - Collects current password, new password, and password confirmation.
 *   - Submits the data as a FormData object via `updateSettings`.
 *   - Clears password fields after successful submission.
 *
 * Both functions depend on the IDs of HTML input fields being correctly set in the DOM.
 *
 * Dependencies:
 * - `updateSettings` API function
 */
export const initUserForm = () => {
  const nameInput = document.getElementById('name') as HTMLInputElement;
  const emailInput = document.getElementById('email') as HTMLInputElement;
  const photoInput = document.getElementById('photo') as HTMLInputElement;

  const form = new FormData();
  form.append('name', nameInput.value.trim());
  form.append('email', emailInput.value.trim());

  const photo = photoInput.files?.[0];
  if (photo) form.append('photo', photo);

  updateSettings(form, 'data');
};

export const initPasswordForm = async () => {
  const passwordCurrent = document.getElementById(
    'password-current',
  ) as HTMLInputElement;
  const password = document.getElementById('password') as HTMLInputElement;
  const passwordConfirm = document.getElementById(
    'password-confirm',
  ) as HTMLInputElement;

  if (!passwordCurrent || !password || !passwordConfirm) return;

  await updateSettings(
    {
      passwordCurrent: passwordCurrent.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
    },
    'password',
  );

  passwordCurrent.value = '';
  password.value = '';
  passwordConfirm.value = '';
};
