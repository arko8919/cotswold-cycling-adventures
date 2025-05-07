import { createAdventure } from '../api/createAdventure';

/**
 * Initializes and handles the adventure creation/edit form.
 *
 * Responsibilities:
 * - Collects all form field values, including:
 *   - Basic adventure info (name, distance, duration, etc.)
 *   - Images (cover image and additional images)
 *   - Start location and multiple additional locations
 *   - Selected guides
 *   - Selected images to delete
 *   - Adventure start dates
 * - Compiles all data into a FormData object for server submission.
 * - Sends either a create or update request based on whether an adventure is selected.
 * - Logs all form data to the console for debugging.
 *
 */
const handleAdventureForm = (e: SubmitEvent) => {
  e.preventDefault();

  const formData = new FormData(); // Create a new FormData object

  // Collect basic adventure info from the form
  formData.append(
    'name',
    (document.getElementById('name') as HTMLInputElement).value,
  );
  formData.append(
    'distance',
    (document.getElementById('distance') as HTMLInputElement).value,
  );
  formData.append(
    'duration',
    (document.getElementById('duration') as HTMLInputElement).value,
  );
  formData.append(
    'maxGroupSize',
    (document.getElementById('maxGroupSize') as HTMLInputElement).value,
  );
  formData.append(
    'difficulty',
    (document.getElementById('difficulty') as HTMLSelectElement).value,
  );
  formData.append(
    'price',
    (document.getElementById('price') as HTMLInputElement).value,
  );
  formData.append(
    'priceDiscount',
    (document.getElementById('priceDiscount') as HTMLInputElement).value,
  );
  formData.append(
    'summary',
    (document.getElementById('summary') as HTMLTextAreaElement).value,
  );
  formData.append(
    'description',
    (document.getElementById('description') as HTMLInputElement).value,
  );

  // Handle image uploads
  const imageCover = document.getElementById('imageCover') as HTMLInputElement;
  const images = document.getElementById('images') as HTMLInputElement;

  // Append main cover image if it exists
  if (imageCover?.files && imageCover.files.length > 0) {
    formData.append('imageCover', imageCover.files[0]);
  }

  // Append additional images
  const files = images?.files;
  if (files?.length) {
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });
  }

  // Append IDs of images marked for deletion
  const deleteImagesCheckboxes = document.querySelectorAll<HTMLInputElement>(
    'input[name="deleteImages"]:checked',
  );

  if (deleteImagesCheckboxes) {
    deleteImagesCheckboxes.forEach((checkbox) => {
      formData.append('deleteImages', checkbox.value);
    });
  }

  // Append all start date values
  const startDate = document.querySelectorAll<HTMLInputElement>(
    'input[name="startDates[]"]',
  );

  startDate.forEach((input) => {
    if (input.value) formData.append('startDates[]', input.value);
  });

  // Prepare and append the start location data
  const lngInput = document.getElementById(
    'startLocationLng',
  ) as HTMLInputElement;
  const latInput = document.getElementById(
    'startLocationLat',
  ) as HTMLInputElement;
  const addressInput = document.getElementById(
    'startLocationAddress',
  ) as HTMLInputElement;
  const descriptionInput = document.getElementById(
    'startLocationDescription',
  ) as HTMLInputElement;

  const lng = parseFloat(lngInput.value);
  const lat = parseFloat(latInput.value);
  const address = addressInput.value;
  const description = descriptionInput.value;

  if (!isNaN(lng) && !isNaN(lat)) {
    formData.append(
      'startLocation',
      JSON.stringify({
        type: 'Point',
        coordinates: [lng, lat],
        address: address || '',
        description: description || '',
      }),
    );
  }

  // Append all additional location data
  const lngInputs = document.querySelectorAll<HTMLInputElement>(
    'input[name="locationLng[]"]',
  );
  const latInputs = document.querySelectorAll<HTMLInputElement>(
    'input[name="locationLat[]"]',
  );
  const addressInputs = document.querySelectorAll<HTMLInputElement>(
    'input[name="locationAddress[]"]',
  );
  const descriptionInputs = document.querySelectorAll<HTMLInputElement>(
    'input[name="locationDescription[]"]',
  );
  const dayInputs = document.querySelectorAll<HTMLInputElement>(
    'input[name="locationDay[]"]',
  );

  lngInputs.forEach((lngInput, i) => {
    const latInput = latInputs[i];
    const addressInput = addressInputs[i];
    const descriptionInput = descriptionInputs[i];
    const dayInput = dayInputs[i];

    if (lngInput?.value && latInput?.value) {
      formData.append(
        'locations[]',
        JSON.stringify({
          type: 'Point',
          coordinates: [parseFloat(lngInput.value), parseFloat(latInput.value)],
          address: addressInput?.value || '',
          description: descriptionInput?.value || '',
          day: dayInput?.value ? parseInt(dayInput.value, 10) : i + 1,
        }),
      );
    }
  });

  // Append selected guides
  const guides = document.getElementById('guides') as HTMLSelectElement;
  Array.from(guides.selectedOptions).forEach((option) => {
    formData.append('guides[]', option.value);
  });

  // Get adventure ID (if updating an existing adventure)
  const select = document.querySelector(
    '.form-select',
  ) as HTMLSelectElement | null;
  const selectedAdventureId = select?.value;

  // Log all form data to the console (for debugging)
  // for (let pair of formData.entries()) {
  //   console.log(`Front: ${pair[0]}:`, pair[1]);
  // }

  // Decide whether to create a new adventure or update an existing one
  if (!selectedAdventureId) {
    createAdventure(formData, 'create');
  } else {
    createAdventure(formData, 'update', selectedAdventureId);
  }
};

export default handleAdventureForm;
