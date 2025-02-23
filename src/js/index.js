/* eslint-disable */
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import Bootstrap JS (includes Popper.js)
import '@babel/polyfill';
import displayMap from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookAdventure } from './stripe';

// DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form-login');
const logOutBtn = document.querySelector('.btn-logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-adventure');

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

    // If we just update without files
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    // updateSettings( { name, email }, 'data');

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    //document.querySelector('.btn--save-password').textContent = 'Updating...';

    //document.querySelector('.btn--save-password').value = 'Updating...';
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
