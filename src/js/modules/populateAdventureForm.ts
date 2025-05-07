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

// DOM References
const btnSubmitAdventure = document.getElementById(
  'submit-adventure',
) as HTMLButtonElement;

/**
 * Handles populating the adventure form when an adventure is selected from a dropdown in Manage adventures section
 *
 * - Listens to changes on the adventure select element.
 * - If no adventure is selected ("none" option), resets the form to its default empty state.
 * - If an adventure is selected, fetches the corresponding adventure data from the API.
 * - Fills the form fields, including start dates, locations, guides, and image previews, with the fetched data.
 * - Utilizes utility functions for creating and populating form fields and handling errors.
 *
 */
const populateAdventureForm = async (e: Event) => {
  try {
    // If adventure is selected then change button label to Update adventure
    btnSubmitAdventure.textContent = 'Update Adventure';

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

      // Clear existing start date fields and insert a new empty one
      startDatesWrapper.innerHTML = '';
      createStartDateInput();
      // Clear existing location fields and insert a new empty group
      locationsWrapper.innerHTML = '';
      createLocationGroup();

      // Clear existing cover and image preview fields
      coverPreviewContainer();
      imagesPreviewContainer();

      // If 'none' is selected then change button label to create adventure
      btnSubmitAdventure.textContent = 'Create Adventure';

      return;
    }

    // Fetch adventure from API
    const res = await fetch(`/api/v1/adventures/${id}`);

    // Catch network issues (e.g. 404, 500)
    if (!res.ok) {
      throw new Error('Failed to fetch adventure.');
    }

    // Parse response and destructure to extract adventure directly
    const {
      status,
      data: { data: adventure },
    } = await res.json();

    // Handle application-level errors
    if (status !== 'success') {
      throw new Error('API error: status not success.');
    }

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
    const guidesSelect = document.getElementById('guides') as HTMLSelectElement;

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
};

export default populateAdventureForm;
