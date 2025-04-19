/* eslint-disable */
//import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@babel/polyfill';

import { type Location } from './types';

import displayMap from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './api/updateSettings';
import { bookAdventure } from './stripe';
import { showAlert } from './alerts';
import { handleAdventureForm } from './modules/handleAdventureForm';
import { dashboardNav } from './modules/dashboardNav';
import { populateAdventureForm } from './modules/populateAdventureForm';

const page = document.body.dataset.page;

// Initializes map in selected adventure page
const initMap = () => {
  const mapBox = document.getElementById('map') as HTMLDivElement | null;

  if (mapBox) {
    mapBox.innerHTML = '';

    // Get location data from data attribute ( json format )
    const data = mapBox.dataset.locations;

    if (data) {
      const locations: Location[] = JSON.parse(data);
      displayMap(locations);
    }
  }
};

// Initializes login form handling from login page
const initLoginForm = () => {
  const loginForm = document.querySelector(
    '.form-login',
  ) as HTMLFormElement | null;

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById(
      'password',
    ) as HTMLInputElement;

    const email: string = emailInput.value.trim();
    const password: string = passwordInput.value;

    if (email && password) login(email, password);
  });
};

// Initializes logout handler from any page
const initLogout = () => {
  const logOutBtn = document.querySelector('.btn-logout') as HTMLAnchorElement;
  logOutBtn?.addEventListener('click', logout);
};

// Initializes user account form handlers
const initUserForms = () => {
  const userDataForm = document.querySelector(
    '.form-user-data',
  ) as HTMLFormElement | null;
  const userPasswordForm = document.querySelector(
    '.form-user-password',
  ) as HTMLFormElement | null;

  if (!userDataForm || !userPasswordForm) return;

  // Updates user data
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

  // Updates password
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

// Initializes booking
const initBooking = () => {
  const bookBtn = document.getElementById(
    'book-adventure',
  ) as HTMLButtonElement;

  bookBtn.addEventListener('click', (e) => {
    const target = e.target as HTMLButtonElement;
    target.textContent = 'Processing...';

    // Gets the adventure ID for the booking
    const { adventureId } = target.dataset;
    bookAdventure(adventureId);
  });
};

const showAlertFromBody = () => {
  if (document.body.dataset.alert)
    showAlert('success', document.body.dataset.alert, 20);
};

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
