/* eslint-disable */
// modules/adventureFormHandlers.js
import { createAdventure } from '../createAdventure';

export const handleAdventureForm = () => {
  const form = document.querySelector('.form-adventure-data');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData();

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

    const imageCover = document.getElementById('imageCover').files[0];
    if (imageCover) formData.append('imageCover', imageCover);

    const imagesInput = document.getElementById('images');
    for (let i = 0; i < imagesInput.files.length; i++) {
      formData.append('images', imagesInput.files[i]);
    }

    // Dates
    document.querySelectorAll('input[name="startDates[]"]').forEach((input) => {
      if (input.value) formData.append('startDates[]', input.value);
    });

    // Start Location
    const lng = parseFloat(document.getElementById('startLocationLng').value);
    const lat = parseFloat(document.getElementById('startLocationLat').value);
    const address = document.getElementById('startLocationAddress').value;
    const description = document.getElementById(
      'startLocationDescription',
    ).value;

    if (!isNaN(lng) && !isNaN(lat) && address && description) {
      const startLocation = {
        type: 'Point',
        coordinates: [lng, lat],
        address,
        description,
      };
      console.log(startLocation);
      formData.append('startLocation', JSON.stringify(startLocation));
    }

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
        const loc = {
          type: 'Point',
          coordinates: [parseFloat(lngs[i].value), parseFloat(lats[i].value)],
          address: addresses[i]?.value || '',
          description: descriptions[i]?.value || '',
          day: parseInt(days[i]?.value) || i + 1,
        };
        formData.append('locations[]', JSON.stringify(loc));
      }
    }

    // Guides
    const guideSelect = document.getElementById('guides');
    const selectedGuides = Array.from(guideSelect.selectedOptions).map(
      (o) => o.value,
    );
    selectedGuides.forEach((id) => formData.append('guides[]', id));

    createAdventure(formData);
  });
};
