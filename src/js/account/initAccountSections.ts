import handleAdventureForm from './handleAdventureForm';
import populateAdventureForm from './populateAdventureForm';

import { createStartDateInput, createLocationGroup } from './formFields';

import { handleUserForm, handlePasswordForm } from './handleSettingsForm';

// Initializes user account "settings" section form handlers
export const initSettingsForms = () => {
  const userDataForm = document.querySelector(
    '.form-user-data',
  ) as HTMLFormElement | null;
  const userPasswordForm = document.querySelector(
    '.form-user-password',
  ) as HTMLFormElement | null;

  // Handle user data update form submission
  userDataForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleUserForm();
  });

  // Handles password update form submission
  userPasswordForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    handlePasswordForm();
  });
};

export const initManageAdventuresForms = () => {
  const select = document.querySelector(
    '.form-select',
  ) as HTMLSelectElement | null;

  if (!select) return;
  select.addEventListener('change', populateAdventureForm);

  // Add a new start date input when "Add Date" button is clicked
  const addDateBtn = document.getElementById('addDateBtn') as HTMLButtonElement;
  if (addDateBtn) {
    addDateBtn.addEventListener('click', () => {
      createStartDateInput();
    });
  }

  // Add a new location group when "Add Location" button is clicked
  const addLocationBtn = document.getElementById(
    'addLocationBtn',
  ) as HTMLButtonElement;
  if (addLocationBtn) {
    addLocationBtn.addEventListener('click', () => {
      createLocationGroup();
    });
  }

  const form = document.querySelector(
    '.form-adventure-data',
  ) as HTMLFormElement;

  if (!form) return;

  // Handle form submission
  form.addEventListener('submit', handleAdventureForm);
};
