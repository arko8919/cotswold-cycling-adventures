import {
  createStartDateInput,
  createLocationGroup,
  coverPreviewContainer,
  imagesPreviewContainer,
} from './formFields';

import { fillAdventureForm } from './fillAdventureForm';
import { GeoLocation } from '@js/types';
import { Guide } from '@js/types';
import getErrorMessage from '../utils/errorHandler';
import { showAlert } from '../alerts';

/**
 * Handles populating the adventure form when an adventure is selected from a dropdown in Manage adventures section
 *
 * - Listens to changes on the adventure select element.
 * - If no adventure is selected, resets the form to its default empty state.
 * - If an adventure is selected, fetches the corresponding adventure data from the API.
 * - Fills the form fields, including start dates, locations, guides, and image previews, with the fetched data.
 * - Utilizes utility functions for creating and populating form fields and handling errors.
 *
 * Dependencies:
 * - createStartDateInput, createLocationGroup, coverPreviewContainer, imagesPreviewContainer (form field utilities)
 * - fillAdventureForm (form filler utility)
 * - getErrorMessage (error handling utility)
 * - showAlert (UI alert system)
 *
 * Related types:
 * - GeoLocation
 * - Guide
 */
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

      const locationsWrapper = document.getElementById(
        'locationsWrapper',
      ) as HTMLDivElement;

      const startDatesWrapper = document.getElementById(
        'startDatesWrapper',
      ) as HTMLDivElement;

      // If selected "none" option or adventure not exist reset form to initial state
      if (!id) {
        form.reset();

        // Calling this functions without params reset date, location, cover and images fields
        startDatesWrapper.innerHTML = '';
        createStartDateInput();
        locationsWrapper.innerHTML = '';
        createLocationGroup();

        coverPreviewContainer();
        imagesPreviewContainer();
        return;
      }

      // Fetch adventure from API
      const res = await fetch(`/api/v1/adventures/${id}`);

      if (!res.ok) {
        throw new Error('Failed to fetch adventure.');
      }

      const body = await res.json();

      if (body.status !== 'success') {
        throw new Error('API error: status not success.');
      }

      const adventure = body.data.data;

      // Fill the form with existing adventure data
      fillAdventureForm(adventure);

      // Fill image cover container
      imagesPreviewContainer(adventure);

      // Fill images container
      coverPreviewContainer(adventure);

      // Fill start dates
      if (Array.isArray(adventure.startDates)) {
        startDatesWrapper.innerHTML = '';
        adventure.startDates.forEach((dateStr: string) => {
          const value = new Date(dateStr).toISOString().split('T')[0];
          createStartDateInput(value);
        });
      }

      // Fill locations
      if (Array.isArray(adventure.locations)) {
        locationsWrapper.innerHTML = '';

        adventure.locations.forEach((loc: GeoLocation) => {
          createLocationGroup(loc);
        });
      }

      // Set multiple adventure guides
      const guidesSelect = document.getElementById(
        'guides',
      ) as HTMLSelectElement;

      if (Array.isArray(adventure.guides)) {
        // Convert to normal array and clear previous selection
        Array.from(guidesSelect.options).forEach((option) => {
          option.selected = false;
        });

        // Extract guide IDs
        const guideIds = adventure.guides.map((guide: Guide) => guide._id);

        // Select matching options
        Array.from(guidesSelect.options).forEach((option) => {
          if (guideIds.includes(option.value)) {
            option.selected = true;
          }
        });
      }
    } catch (err) {
      const message = getErrorMessage(err, 'Error fetching adventure data');
      showAlert({ type: 'error', message });
    }
  });
};
