import { GeoLocation, Adventure } from '@js/types';

/**
 * Creates <input> start date field and prefill it with time data.
 *
 * @param value - The date value to prefill in the new input field (ISO format expected).
 */
export const createStartDateInput = (value: string = '') => {
  const startDatesWrapper = document.getElementById(
    'startDatesWrapper',
  ) as HTMLDivElement;
  if (!startDatesWrapper) return;

  const newInput = document.createElement('input');
  newInput.type = 'date';
  newInput.name = 'startDates[]';
  newInput.className = 'form-control mt-2';
  newInput.value = value;

  startDatesWrapper.appendChild(newInput);
};

/**
 * Creates <input> geo location fields and prefill with location data.
 *
 * @param loc - GeoLocation object containing coordinates, address, description, and day.
 */
export const createLocationGroup = (loc: Partial<GeoLocation> = {}) => {
  const locationsWrapper = document.getElementById(
    'locationsWrapper',
  ) as HTMLDivElement;
  if (!locationsWrapper) return;

  let locationCount: number = locationsWrapper.children.length + 1;

  const group = document.createElement('div');
  group.className = 'location-group mb-3 p-3 border rounded';

  group.innerHTML = `
    <label class="form-label">Location ${locationCount}</label>
    <div class="row g-2">
      <div class="col-md-4">
        <input class="form-control" type="number" name="locationLng[]" step="any" value="${loc?.coordinates?.[0] ?? ''}" placeholder="Longitude" />
      </div>
      <div class="col-md-4">
        <input class="form-control" type="number" name="locationLat[]" step="any" value="${loc?.coordinates?.[1] ?? ''}" placeholder="Latitude" />
      </div>
      <div class="col-md-4">
        <input class="form-control" type="text" name="locationAddress[]" value="${loc?.address ?? ''}" placeholder="Address" />
      </div>
      <div class="col-md-6 mt-2">
        <input class="form-control" type="text" name="locationDescription[]" value="${loc?.description ?? ''}" placeholder="Description" />
      </div>
      <div class="col-md-6 mt-2">
        <input class="form-control" type="number" name="locationDay[]" value="${loc?.day ?? ''}" placeholder="Day" />
      </div>
    </div>
  `;

  locationsWrapper.appendChild(group);
};

/**
 * Displays the current image cover preview for the given adventure.
 *
 * @param adventure - Adventure object containing the imageCover filename.
 */
export const coverPreviewContainer = (adventure: Partial<Adventure> = {}) => {
  const coverPreviewContainer = document.getElementById(
    'imageCoverPreviewContainer',
  ) as HTMLDivElement;
  if (!coverPreviewContainer) return;

  coverPreviewContainer.innerHTML = ''; // Clear previous

  if (adventure.imageCover) {
    const currentImageCover = `
    <div class="mb-2">
      <h3>Image Cover</h3>
      <img src="/assets/adventures/${adventure.imageCover}" alt="Cover Image" width="150" class="img-thumbnail mt-2">
    </div>
  `;
    coverPreviewContainer.insertAdjacentHTML('beforeend', currentImageCover);
  }
};

/**
 * Displays all current gallery images with an option to mark them for deletion.
 *
 * @param adventure - Adventure object containing images array with filenames.
 */
export const imagesPreviewContainer = (adventure: Partial<Adventure> = {}) => {
  const imagesPreviewContainer = document.getElementById(
    'imagesPreviewContainer',
  ) as HTMLDivElement;

  if (!imagesPreviewContainer) return;

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
