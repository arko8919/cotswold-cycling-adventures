import { updateSettings } from '../api/updateSettings';

/**
 *  Handles updating user profile information.
 */
export const handleUserForm = () => {
  const nameInput = document.getElementById('name') as HTMLInputElement;
  const emailInput = document.getElementById('email') as HTMLInputElement;
  const photoInput = document.getElementById('photo') as HTMLInputElement;

  // Appends input values into a FormData object
  const form = new FormData();
  form.append('name', nameInput.value.trim());
  form.append('email', emailInput.value.trim());

  const photo = photoInput.files?.[0];
  if (photo) form.append('photo', photo);

  // Submit the data as a FormData object
  updateSettings(form, 'data');
};

/**
 *  Handles updating the user's password.
 */
export const handlePasswordForm = async () => {
  const passwordCurrentInput = document.getElementById(
    'password-current',
  ) as HTMLInputElement;
  const passwordInput = document.getElementById('password') as HTMLInputElement;
  const passwordConfirmInput = document.getElementById(
    'password-confirm',
  ) as HTMLInputElement;

  // Submit data to the server
  await updateSettings(
    {
      passwordCurrent: passwordCurrentInput.value,
      password: passwordInput.value,
      passwordConfirm: passwordConfirmInput.value,
    },
    'password',
  );

  passwordCurrentInput.value = '';
  passwordInput.value = '';
  passwordConfirmInput.value = '';
};
