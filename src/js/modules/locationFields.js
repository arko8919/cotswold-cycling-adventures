/* eslint-disable */
// modules/locationFields.js
export const initDynamicLocationFields = () => {
  const addDateBtn = document.getElementById('addDateBtn');
  const startDatesWrapper = document.getElementById('startDatesWrapper');
  const addLocationBtn = document.getElementById('addLocationBtn');
  const locationsWrapper = document.getElementById('locationsWrapper');

  if (addDateBtn && startDatesWrapper) {
    addDateBtn.addEventListener('click', () => {
      const newInput = document.createElement('input');
      newInput.type = 'date';
      newInput.name = 'startDates[]';
      newInput.className = 'form-control mt-2';
      startDatesWrapper.appendChild(newInput);
    });
  }

  if (addLocationBtn && locationsWrapper) {
    let locationCount = locationsWrapper.children.length + 1;

    addLocationBtn.addEventListener('click', () => {
      const group = document.createElement('div');
      group.className = 'location-group mb-3 p-3 border rounded';

      group.innerHTML = `
        <label class="form-label">Location ${locationCount++}</label>
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

      locationsWrapper.appendChild(group);
    });
  }
};
