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
import { createAdventure } from './createAdventure';

// DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form-login');
const logOutBtn = document.querySelector('.btn-logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-adventure');
const menuItems = document.querySelectorAll('.list-group-item');
const adventureDataForm = document.querySelector('.form-adventure-data');
const addDateBtn = document.getElementById('addDateBtn');
const wrapper = document.getElementById('startDatesWrapper');

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

if (adventureDataForm)
  adventureDataForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('distance', document.getElementById('distance').value);
    form.append('duration', document.getElementById('duration').value);
    form.append('maxGroupSize', document.getElementById('maxGroupSize').value);
    form.append('difficulty', document.getElementById('difficulty').value);
    form.append('price', document.getElementById('price').value);
    form.append(
      'priceDiscount',
      document.getElementById('priceDiscount').value,
    );
    form.append('summary', document.getElementById('summary').value);
    form.append('description', document.getElementById('description').value);

    // Images Cover
    form.append('imageCover', document.getElementById('imageCover').files[0]);

    // Images
    const imagesInput = document.getElementById('images');
    for (let i = 0; i < imagesInput.files.length; i++) {
      form.append('images', imagesInput.files[i]);
    }

    // Start Dates
    const dateInputs = document.querySelectorAll('input[name="startDates[]"');
    dateInputs.forEach((input) => {
      if (input.value) {
        form.append('startDates[]', input.value); // Keeps them grouped as array
      }
    });

    // Start Locations
    form.append(
      'startLocation[description]',
      document.getElementById('startLocationDescription').value,
    );
    form.append(
      'startLocation[address]',
      document.getElementById('startLocationAddress').value,
    );
    form.append('startLocation[type]', 'Point');

    const lng = document.getElementById('startLocationLng').value;
    const lat = document.getElementById('startLocationLat').value;

    if (lng && lat) {
      form.append('startLocation[coordinates][]', lng);
      form.append('startLocation[coordinates][]', lat);
    }

    form.append(
      'startLocation',
      JSON.stringify({
        type: 'Point',
        coordinates: [-1.5, 52.4], // Test longitude and latitude
        address: 'Cotswolds, UK',
        description: 'Beautiful starting point in the Cotswolds',
      }),
    );

    // Locations
    const lngs = document.querySelectorAll('input[name="locationLng[]"]');
    const lats = document.querySelectorAll('input[name="locationLat[]"]');
    const addresses = document.querySelectorAll(
      'input[name="locationAddress[]"]',
    );
    const descriptions = document.querySelectorAll(
      'input[name="locationDescription[]"]',
    );
    const days = document.querySelectorAll('input[name="locationDay[]"]');

    for (let i = 0; i < lngs.length; i++) {
      if (lngs[i].value && lats[i].value) {
        const location = {
          type: 'Point',
          coordinates: [parseFloat(lngs[i].value), parseFloat(lats[i].value)],
          address: addresses[i]?.value || '',
          description: descriptions[i]?.value || '',
          day: parseInt(days[i]?.value) || i + 1,
        };

        form.append('locations[]', JSON.stringify(location));
      }
    }

    // Guides
    const guideSelect = document.getElementById('guides');
    const selectedGuides = Array.from(guideSelect.selectedOptions).map(
      (option) => option.value,
    );

    selectedGuides.forEach((id) => {
      form.append('guides[]', id);
    });

    createAdventure(form);

    // form.forEach((value, key) => {
    //   console.log(`${key}: ${value}`);
    // });
  });
// Create new date input
if (addDateBtn)
  addDateBtn.addEventListener('click', () => {
    const newInput = document.createElement('input');
    newInput.type = 'date';
    newInput.name = 'startDates[]';
    newInput.className = 'form-control mt-2';
    wrapper.appendChild(newInput);
  });

// Create new location inputs
let locationCount = 1;

document.getElementById('addLocationBtn').addEventListener('click', () => {
  locationCount++;

  const wrapper = document.getElementById('locationsWrapper');
  const group = document.createElement('div');
  group.className = 'location-group mb-3 p-3 border rounded';

  group.innerHTML = `
    <label class="form-label">Location ${locationCount}</label>
    <div class="row g-2">
      <div class="col-md-4">
        <input class="form-control" type="number" name="locationLng[]" step="any" placeholder="Longitude" />
      </div>
      <div class="col-md-4">
        <input class="form-control" type="number" name="locationLat[]" step="any" placeholder="Latitude" />
      </div>
      <div class="col-md-4">
        <input class="form-control" type="text" name="locationAddress[]" placeholder="Address" />
      </div>
      <div class="col-md-6 mt-2">
        <input class="form-control" type="text" name="locationDescription[]" placeholder="Description" />
      </div>
      <div class="col-md-6 mt-2">
        <input class="form-control" type="number" name="locationDay[]" placeholder="Day" />
      </div>
    </div>
  `;

  wrapper.appendChild(group);
});

/////////////////////
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
