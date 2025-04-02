/* eslint-disable */
import { createAdventure } from '../api/createAdventure';
import { createStartDateInput, createLocationGroup } from './formFields';

// Main function to handle the adventure form
export const handleAdventureForm = () => {
  const addDateBtn = document.getElementById('addDateBtn');
  const addLocationBtn = document.getElementById('addLocationBtn');
  const form = document.querySelector('.form-adventure-data');

  // Add a new start date input when "Add Date" button is clicked
  if (addDateBtn) {
    addDateBtn.addEventListener('click', () => {
      createStartDateInput();
    });
  }

  // Add a new location group when "Add Location" button is clicked
  if (addLocationBtn) {
    addLocationBtn.addEventListener('click', () => {
      createLocationGroup({});
    });
  }

  // Stop if form is not found
  if (!form) return;

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(); // Create a new FormData object

    // Collect basic adventure info from the form
    formData.append('name', document.getElementById('name').value);
    formData.append('distance', document.getElementById('distance').value);
    formData.append('duration', document.getElementById('duration').value);
    formData.append(
      'maxGroupSize',
      document.getElementById('maxGroupSize').value,
    );
    formData.append('difficulty', document.getElementById('difficulty').value);
    formData.append('price', document.getElementById('price').value);
    formData.append(
      'priceDiscount',
      document.getElementById('priceDiscount').value,
    );
    formData.append('summary', document.getElementById('summary').value);
    formData.append(
      'description',
      document.getElementById('description').value,
    );

    // Handle image uploads
    const imageCover = document.getElementById('imageCover');
    const images = document.getElementById('images');

    // Append main cover image if it exists
    if (imageCover.files[0]) {
      formData.append('imageCover', imageCover.files[0]);
    }

    // Append additional images
    for (let i = 0; i < images.files.length; i++) {
      formData.append('images', images.files[i]);
    }

    // Append IDs of images marked for deletion
    const deleteImagesCheckboxes = document.querySelectorAll(
      'input[name="deleteImages"]:checked',
    );
    deleteImagesCheckboxes.forEach((checkbox) => {
      formData.append('deleteImages', checkbox.value);
    });

    // Append all start date values
    document.querySelectorAll('input[name="startDates[]"]').forEach((input) => {
      if (input.value) formData.append('startDates[]', input.value);
    });

    // Prepare and append the start location data
    const lng = parseFloat(document.getElementById('startLocationLng').value);
    const lat = parseFloat(document.getElementById('startLocationLat').value);
    const address = document.getElementById('startLocationAddress').value;
    const description = document.getElementById(
      'startLocationDescription',
    ).value;

    if (!isNaN(lng) && !isNaN(lat) && address && description) {
      formData.append(
        'startLocation',
        JSON.stringify({
          type: 'Point',
          coordinates: [lng, lat],
          address,
          description,
        }),
      );
    }

    // Append all additional location data
    document
      .querySelectorAll('input[name="locationLng[]"]')
      .forEach((lngInput, i) => {
        const latInput = document.querySelectorAll(
          'input[name="locationLat[]"]',
        )[i];
        const addressInput = document.querySelectorAll(
          'input[name="locationAddress[]"]',
        )[i];
        const descriptionInput = document.querySelectorAll(
          'input[name="locationDescription[]"]',
        )[i];
        const dayInput = document.querySelectorAll(
          'input[name="locationDay[]"]',
        )[i];

        if (lngInput.value && latInput.value) {
          formData.append(
            'locations[]',
            JSON.stringify({
              type: 'Point',
              coordinates: [
                parseFloat(lngInput.value),
                parseFloat(latInput.value),
              ],
              address: addressInput?.value || '',
              description: descriptionInput?.value || '',
              day: parseInt(dayInput?.value) || i + 1,
            }),
          );
        }
      });

    // Append selected guides
    const guides = document.getElementById('guides');
    Array.from(guides.selectedOptions).forEach((option) => {
      formData.append('guides[]', option.value);
    });

    // Get adventure ID (if updating an existing adventure)
    const select = document.querySelector('.form-select');
    const selectedAdventureId = select?.value;

    // Log all form data to the console (for debugging)
    for (let pair of formData.entries()) {
      console.log(`Front: ${pair[0]}:`, pair[1]);
    }

    // Decide whether to create a new adventure or update an existing one
    if (!selectedAdventureId) {
      createAdventure(formData, 'create');
    } else {
      createAdventure(formData, 'update', selectedAdventureId);
    }
  });
};
