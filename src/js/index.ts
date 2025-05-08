import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@babel/polyfill';

import { GeoLocation } from '@js/types';
import displayMap from './adventure/mapbox';
import logout from './auth/logout';
import login from './auth/login';
import bookAdventure from './adventure/stripe';
import { showAlert } from './utils/alerts';
import {
  initSettingsForms,
  initManageAdventuresForms,
} from './account/initAccountSections';
import { dashboardNav } from './account/dashboardNav';

/**
 * Initializes client-side functionality for various pages.
 *
 * Responsibilities:
 * - Imports and sets up external libraries (e.g., Bootstrap, Babel polyfills).
 * - Dynamically loads page-specific modules based on the current page context:
 *   - Login form handling (for `/login`).
 *   - User settings management (for `/me/settings`).
 *   - Adventure booking functionality (for `/adventure/:id` or `/adventure/:slug`).
 *   - Displays adventure locations on a map with Mapbox integration (for `/adventure/:id` or `/adventure/:slug`).
 *   - Admin dashboard navigation (for `/me/dashboard`).
 *   - Adventure form handling (for `/me/manage-adventures`).
 * - Displays success/error alerts from server-rendered pages using data attributes in the `<body>` tag.
 * - Configures the global logout functionality across all pages.
 *
 * Dynamic Behavior:
 * - Detects the current page using the `data-page` attribute on the `<body>` element to selectively load modules.
 * - Utilizes code-splitting and dynamic imports to load only the required JavaScript for the current page to enhance performance.
 */

// Initializes login form handling from login page
const initLoginForm = () => {
  const formLogin = document.querySelector('.form-login') as HTMLFormElement;

  formLogin.addEventListener('submit', (e) => {
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
  const btnLogout = document.querySelector('.btn-logout') as HTMLAnchorElement;
  btnLogout?.addEventListener('click', logout);
};

// Initializes booking button functionality on the adventure page
const initBooking = () => {
  const bookBtn = document.getElementById(
    'book-adventure',
  ) as HTMLButtonElement | null;

  bookBtn?.addEventListener('click', (e) => {
    const target = e.target as HTMLButtonElement;
    target.textContent = 'Processing...';

    //  Gets the adventure ID for the booking from the visited adventure page
    const { adventureId } = target.dataset;

    if (!adventureId) return;
    bookAdventure(adventureId);
  });
};

// Initializes map on the adventure page
const initMap = () => {
  const mapBox = document.getElementById('map') as HTMLDivElement;

  if (!mapBox) return;

  mapBox.innerHTML = '';

  // Get location data from data attribute ( json format )
  const data = mapBox.dataset.locations;

  if (!data) return;

  const locations: GeoLocation[] = JSON.parse(data);
  displayMap(locations);
};

// Displays a success alert using the message stored in the body data attribute (data-alert)
const showAlertFromBody = () => {
  if (!document.body.dataset.alert) return;

  showAlert({
    type: 'success',
    message: document.body.dataset.alert,
    timeout: 20,
  });
};

// Get the current displayed page name
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
    initManageAdventuresForms();
    break;
  default:
}

(() => {
  initLogout();
  showAlertFromBody();
})();
