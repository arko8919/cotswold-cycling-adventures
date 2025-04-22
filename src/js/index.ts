import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@babel/polyfill';

import { type GeoLocation, AlertMessage } from '@js/types';

import displayMap from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './api/updateSettings';
import { bookAdventure } from './stripe';
import { showAlert } from './alerts';
import { handleAdventureForm } from './modules/handleAdventureForm';
import { dashboardNav } from './modules/dashboardNav';
import { populateAdventureForm } from './modules/populateAdventureForm';

const page = document.body.dataset.page;

// Initializes login form handling from login page
const initLoginForm = () => {
  const loginForm = document.querySelector('.form-login') as HTMLFormElement;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById(
      'password',
    ) as HTMLInputElement;

    const email: string = emailInput.value.trim();
    const password: string = passwordInput.value;

    if (!email || !password) return;

    login(email, password);
  });
};

// Initializes logout handler from any page
const initLogout = () => {
  const logOutBtn = document.querySelector('.btn-logout') as HTMLAnchorElement;
  logOutBtn?.addEventListener('click', logout);
};

// Initializes user account "settings" section form handlers
const initUserForms = () => {
  const userDataForm = document.querySelector(
    '.form-user-data',
  ) as HTMLFormElement | null;
  const userPasswordForm = document.querySelector(
    '.form-user-password',
  ) as HTMLFormElement | null;

  if (!userDataForm || !userPasswordForm) return;

  // Handle user data update form submission
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('name') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const photoInput = document.getElementById('photo') as HTMLInputElement;

    const form = new FormData();
    form.append('name', nameInput.value.trim());
    form.append('email', emailInput.value.trim());

    const photo = photoInput.files?.[0];
    if (photo) form.append('photo', photo);

    updateSettings(form, 'data');
  });

  // Handles password update form submission
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

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
  });
};

// Initializes booking button functionality on the adventure page
const initBooking = () => {
  const bookBtn = document.getElementById(
    'book-adventure',
  ) as HTMLButtonElement | null;

  if (!bookBtn) return;

  bookBtn.addEventListener('click', (e) => {
    const target = e.target as HTMLButtonElement;
    target.textContent = 'Processing...';

    //  Gets the adventure ID for the booking from the visited adventure page
    const { adventureId } = target.dataset;

    if (!adventureId) return;
    bookAdventure(adventureId);
  });
};

// Initializes map in selected adventure page
const initMap = () => {
  const mapBox = document.getElementById('map') as HTMLDivElement;

  if (mapBox) {
    mapBox.innerHTML = '';

    // Get location data from data attribute ( json format )
    const data = mapBox.dataset.locations;

    if (data) {
      const locations: GeoLocation[] = JSON.parse(data);
      displayMap(locations);
    }
  }
};

// Displays a success alert using the message stored in the body data attribute (data-alert)
const showAlertFromBody = () => {
  if (document.body.dataset.alert)
    showAlert({
      type: 'success',
      message: document.body.dataset.alert,
      timeout: 20,
    });
};

// Load only files needed for the page being loaded
switch (page) {
  case 'login':
    initLoginForm();
    break;
  case 'signup':
    break;
  case 'adventure':
    initBooking();
    initMap();
    break;
  case 'account':
    populateAdventureForm();
    handleAdventureForm();
    dashboardNav();
    initUserForms();
    break;
  default:
}

(() => {
  initLogout();
  showAlertFromBody();
})();
