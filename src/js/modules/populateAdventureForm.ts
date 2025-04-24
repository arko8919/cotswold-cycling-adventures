/* eslint-disable */

import {
  createStartDateInput,
  createLocationGroup,
  coverPreviewContainer,
  imagesPreviewContainer,
} from './formFields';

import { fillAdventureForm } from './fillAdventureForm';

export const populateAdventureForm = () => {
  const select = document.querySelector(
    '.form-select',
  ) as HTMLSelectElement | null;

  if (!select) return;

  select.addEventListener('change', async (e) => {
    try {
      const target = e.target as HTMLSelectElement;
      const id = target.value;

      const form = document.querySelector(
        '.form-adventure-data',
      ) as HTMLFormElement;

      if (!form) return;

      const startDatesWrapper = document.getElementById(
        'startDatesWrapper',
      ) as HTMLDivElement;
      const locationsWrapper = document.getElementById(
        'locationsWrapper',
      ) as HTMLDivElement;

      // If selected "none" option or adventure not exist reset form to initial state
      if (!id) {
        form.reset();
        startDatesWrapper.innerHTML = '';
        createStartDateInput();

        locationsWrapper.innerHTML = '';
        createLocationGroup({});

        return;
      }
      console.log(id);

      // ID of adventure exist
      const res = await fetch(`/api/v1/adventures/${id}`);
      const { data } = await res.json();
      const adventure = data.data;

      console.log(adventure);

      // Fill the form with existing adventure data
      fillAdventureForm(adventure);

      // Fill image cover container
      imagesPreviewContainer(adventure);

      // Fill images container
      coverPreviewContainer(adventure);

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
        const guideIds = adventure.guides.map((guide) => guide._id.toString());

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
};
