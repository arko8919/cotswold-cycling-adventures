/* eslint-disable */

export const createStartDateInput = (value) => {
  const startDatesWrapper = document.getElementById('startDatesWrapper');
  if (!startDatesWrapper) return;

  const newInput = document.createElement('input');
  newInput.type = 'date';
  newInput.name = 'startDates[]';
  newInput.className = 'form-control mt-2';
  newInput.value = value;

  startDatesWrapper.appendChild(newInput);
};

export const createLocationGroup = (loc) => {
  const locationsWrapper = document.getElementById('locationsWrapper');
  if (!locationsWrapper) return;

  let locationCount = locationsWrapper.children.length + 1;
  const group = document.createElement('div');
  group.className = 'location-group mb-3 p-3 border rounded';

  group.innerHTML = `
    <label class="form-label">Location ${locationCount}</label>
    <div class="row g-2">
      <div class="col-md-4">
        <input class="form-control" type="number" name="locationLng[]" step="any" value="${loc?.coordinates?.[0] || ''}" placeholder="Longitude" />
      </div>
      <div class="col-md-4">
        <input class="form-control" type="number" name="locationLat[]" step="any" value="${loc?.coordinates?.[1] || ''}" placeholder="Latitude" />
      </div>
      <div class="col-md-4">
        <input class="form-control" type="text" name="locationAddress[]" value="${loc?.address || ''}" placeholder="Address" />
      </div>
      <div class="col-md-6 mt-2">
        <input class="form-control" type="text" name="locationDescription[]" value="${loc?.description || ''}" placeholder="Description" />
      </div>
      <div class="col-md-6 mt-2">
        <input class="form-control" type="number" name="locationDay[]" value="${loc?.day || ''}" placeholder="Day" />
      </div>
    </div>
  `;

  locationsWrapper.appendChild(group);
};

// Handle existing image cover
export const coverPreviewContainer = (adventure) => {
  const coverPreviewContainer = document.getElementById(
    'imageCoverPreviewContainer',
  );
  coverPreviewContainer.innerHTML = ''; // Clear previous
  if (adventure.imageCover) {
    const checkbox = `
    <div class="mb-2">
      <input class="form-check-input" type="checkbox" name="deleteImageCover" id="deleteImageCover" value="${adventure.imageCover}">
      <label class="form-check-label ms-2" for="deleteImageCover">Delete current cover image</label>
      <br>
      <img src="/assets/adventures/${adventure.imageCover}" alt="Cover Image" width="150" class="img-thumbnail mt-2">
    </div>
  `;
    coverPreviewContainer.insertAdjacentHTML('beforeend', checkbox);
  }
};

// Handle existing gallery images
export const imagesPreviewContainer = (adventure) => {
  const imagesPreviewContainer = document.getElementById(
    'imagesPreviewContainer',
  );
  imagesPreviewContainer.innerHTML = ''; // Clear previous
  if (Array.isArray(adventure.images)) {
    adventure.images.forEach((img, i) => {
      const checkbox = `
      <div class="mb-2">
        <input class="form-check-input" type="checkbox" name="deleteImages" id="deleteImage-${i}" value="${img}">
        <label class="form-check-label ms-2" for="deleteImage-${i}">Delete image ${i + 1}</label>
        <br>
        <img src="/assets/adventures/${img}" alt="Image ${i + 1}" width="150" class="img-thumbnail mt-2">
      </div>
    `;
      imagesPreviewContainer.insertAdjacentHTML('beforeend', checkbox);
    });
  }
};
