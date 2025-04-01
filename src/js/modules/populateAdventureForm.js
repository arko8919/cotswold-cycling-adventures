/* eslint-disable */
import {
  createStartDateInput,
  createLocationGroup,
  coverPreviewContainer,
  imagesPreviewContainer,
} from './formFields';

export const populateAdventureForm = () => {
  const select = document.querySelector('.form-select');
  if (select) {
    select.addEventListener('change', async (e) => {
      try {
        const id = e.target.value;
        const form = document.querySelector('.form-adventure-data');
        const startDatesWrapper = document.getElementById('startDatesWrapper');
        const locationsWrapper = document.getElementById('locationsWrapper');

        if (!form) return;

        // Reset form to initial state
        if (!id) {
          console.log('test' + id);
          form.reset();

          console.log(startDatesWrapper);
          startDatesWrapper.innerHTML = '';
          createStartDateInput();

          locationsWrapper.innerHTML = '';
          createLocationGroup({});

          return;
        }

        const res = await fetch(`/api/v1/adventures/${id}`);
        const data = await res.json();
        const adventure = data.data.data;
        console.log(adventure);

        // Fill the form with existing adventure data
        document.getElementById('name').value = adventure.name || '';
        document.getElementById('description').value =
          adventure.description || '';
        document.getElementById('distance').value = adventure.distance || '';
        document.getElementById('duration').value = adventure.duration || '';
        document.getElementById('maxGroupSize').value =
          adventure.maxGroupSize || '';
        document.getElementById('difficulty').value =
          adventure.difficulty || '';
        document.getElementById('price').value = adventure.price || '';
        document.getElementById('priceDiscount').value =
          adventure.priceDiscount || '';
        document.getElementById('summary').value = adventure.summary || '';

        // Fill image cover container
        imagesPreviewContainer(adventure);

        // Fill images container
        coverPreviewContainer(adventure);

        // Set start location
        const startLoc = adventure.startLocation || {};
        document.getElementById('startLocationDescription').value =
          startLoc.description || '';
        document.getElementById('startLocationAddress').value =
          startLoc.address || '';
        document.getElementById('startLocationLng').value =
          startLoc.coordinates?.[0] || '';
        document.getElementById('startLocationLat').value =
          startLoc.coordinates?.[1] || '';

        // Fill start dates
        if (Array.isArray(adventure.startDates)) {
          console.log(startDatesWrapper);
          startDatesWrapper.innerHTML = '';
          adventure.startDates.forEach((dateStr) => {
            const value = new Date(dateStr).toISOString().split('T')[0];
            createStartDateInput(value);
          });
        }

        // Fill locations
        if (Array.isArray(adventure.locations)) {
          locationsWrapper.innerHTML = '';
          adventure.locations.forEach((loc) => {
            createLocationGroup(loc);
          });
        }

        // Set multiple guides
        const guidesSelect = document.getElementById('guides');
        if (guidesSelect && Array.isArray(adventure.guides)) {
          // Clear previous selection
          Array.from(guidesSelect.options).forEach((option) => {
            option.selected = false;
          });

          // Extract guide IDs
          const guideIds = adventure.guides.map((guide) =>
            guide._id.toString(),
          );

          // Select matching options
          Array.from(guidesSelect.options).forEach((option) => {
            if (guideIds.includes(option.value)) {
              option.selected = true;
            }
          });
        }
      } catch (err) {
        console.error('Error fetching adventure data', err);
      }
    });
  }
};
