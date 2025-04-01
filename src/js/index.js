/* eslint-disable */
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@babel/polyfill';

import displayMap from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './api/updateSettings';
import { bookAdventure } from './stripe';
import { showAlert } from './alerts';
import { handleAdventureForm } from './modules/handleAdventureForm';
import { dashboardNav } from './modules/dashboardNav';
import { populateAdventureForm } from './modules/populateAdventureForm';

const initMap = () => {
  const mapBox = document.getElementById('map');
  if (mapBox) {
    mapBox.innerHTML = '';
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
  }
};

const initLoginForm = () => {
  const loginForm = document.querySelector('.form-login');
  if (loginForm)
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      login(email, password);
    });
};

const initLogout = () => {
  const logOutBtn = document.querySelector('.btn-logout');
  if (logOutBtn) logOutBtn.addEventListener('click', logout);
};

const initUserForms = () => {
  const userDataForm = document.querySelector('.form-user-data');
  const userPasswordForm = document.querySelector('.form-user-password');

  if (userDataForm)
    userDataForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = new FormData();
      form.append('name', document.getElementById('name').value);
      form.append('email', document.getElementById('email').value);
      form.append('photo', document.getElementById('photo').files[0]);
      updateSettings(form, 'data');
    });

  if (userPasswordForm)
    userPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;

      await updateSettings(
        { passwordCurrent, password, passwordConfirm },
        'password',
      );

      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    });
};

const initBooking = () => {
  const bookBtn = document.getElementById('book-adventure');
  if (bookBtn)
    bookBtn.addEventListener('click', (e) => {
      e.target.textContent = 'Processing...';
      const { adventureId } = e.target.dataset;
      bookAdventure(adventureId);
    });
};

const showAlertFromBody = () => {
  if (document.body.dataset.alert)
    showAlert('success', document.body.dataset.alert, 20);
};

(() => {
  initMap();
  initLoginForm();
  initLogout();
  initUserForms();
  initBooking();

  populateAdventureForm();
  handleAdventureForm();
  dashboardNav();
  showAlertFromBody();
})();
