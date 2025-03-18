/* eslint-disable */
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import Bootstrap JS (includes Popper.js)
import '@babel/polyfill';
import displayMap from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookAdventure } from './stripe';
import { showAlert } from './alerts';
import { loadSection } from './loadSection';

// DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form-login');
const logOutBtn = document.querySelector('.btn-logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-adventure');
const menuItems = document.querySelectorAll('.list-group-item');

if (mapBox) {
  // Ensure the map container is empty
  mapBox.innerHTML = '';
  // Converts location data from JSON to a JavaScript object
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

// Handle login form submission
if (loginForm)
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault(); //  prevent page reload
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

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

    // document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { adventureId } = e.target.dataset;
    bookAdventure(adventureId);
  });

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);

if (menuItems)
  menuItems.forEach((item) => {
    item.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent full page reload

      const section = this.getAttribute('data-section');

      loadSection(section, menuItems);
    });
  });

// Handle browser back/forward navigation
window.addEventListener('popstate', function () {
  const section = window.location.pathname.split('/')[2] || 'settings';

  loadSection(section, menuItems);
});
