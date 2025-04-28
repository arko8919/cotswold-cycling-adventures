import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@babel/polyfill';

import { GeoLocation } from '@js/types';
import displayMap from './mapbox';
import { login, logout } from './login';
import { bookAdventure } from './stripe';
import { showAlert } from './alerts';
import { handleAdventureForm } from './modules/handleAdventureForm';
import { dashboardNav } from './modules/dashboardNav';
import { populateAdventureForm } from './modules/populateAdventureForm';
import { initUserForm, initPasswordForm } from './modules/handleSettingsForms';

/**
 * Entry point for initializing client-side JavaScript functionality.
 *
 * Responsibilities:
 * - Imports and sets up external libraries (Bootstrap, Babel polyfills).
 * - Initializes page-specific modules based on the page type:
 *   - Login form handling
 *   - User account settings forms
 *   - Adventure booking button
 *   - Adventure map display with Mapbox
 *   - Admin dashboard navigation and adventure form handling
 * - Displays success alerts from server-rendered pages (via body data attributes).
 * - Always sets up logout functionality across all pages.
 *
 * Dynamic Behavior:
 * - Detects the page context via the `data-page` attribute on the `<body>`.
 * - Loads only necessary JavaScript modules to optimize performance.
 *
 * Dependencies:
 * - Bootstrap (modal and dropdowns)
 * - Mapbox (map display)
 * - Stripe (payment handling)
 * - Custom modules: login, logout, alerts, map display, form handlers
 */

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
const initSettingsForms = () => {
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
    initUserForm();
  });

  // Handles password update form submission
  userPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    initPasswordForm();
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

const page = document.body.dataset.page;

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
    dashboardNav();
    initSettingsForms();
    populateAdventureForm();
    handleAdventureForm();
    break;
  default:
}

(() => {
  initLogout();
  showAlertFromBody();
})();
