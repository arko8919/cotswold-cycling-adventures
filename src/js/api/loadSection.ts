import axios from 'axios';
import getErrorMessage from '../utils/errorHandler';
import { showAlert } from '../utils/alerts';

const contentDiv = document.getElementById('dynamic-content') as HTMLDivElement;

/**
 * Dynamically loads a section into the account page without a full page reload.
 *
 * @param section - The section to load (e.g., 'settings', 'bookings').
 */
export const loadSection = async (section: string) => {
  try {
    const url = `/me/${section}`;

    // Fetch the raw HTML string of the requested section
    const res = await axios.get<string>(url);

    // Parse the fetched HTML string into a document object
    const parser = new DOMParser();
    const doc = parser.parseFromString(res.data, 'text/html');
    const newContent = doc.querySelector('#dynamic-content') as HTMLDivElement;

    // Update only the dynamic content area, preserving the rest of the page
    contentDiv.innerHTML = newContent.innerHTML;

    // Update the browser URL without triggering a page reload
    history.pushState({}, '', url);
  } catch (err) {
    const message = getErrorMessage(err, 'Failed to load section:');
    showAlert({ type: 'error', message });

    // Display fallback content if the section fails to load
    contentDiv.innerHTML = '<h2>Error loading content. Try again.</h2>';
  }
};
