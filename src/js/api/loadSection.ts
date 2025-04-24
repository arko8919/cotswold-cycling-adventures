import axios from 'axios';
import getErrorMessage from '../utils/errorHandler';

const contentDiv = document.getElementById('dynamic-content') as HTMLDivElement;
const menuItems = document.querySelectorAll<HTMLLIElement>('.list-group-item');

export const loadSection = async (section: string) => {
  try {
    const url = `/me/${section}`;

    // Fetch HTML ( string ) of account page
    const res = await axios.get(url);

    // Parse the returned HTML response into a document
    const parser = new DOMParser();
    const doc = parser.parseFromString(res.data, 'text/html');
    const newContent = doc.querySelector('#dynamic-content') as HTMLDivElement;

    // Update only the target content area, keeping the rest of the page intact
    contentDiv.innerHTML = newContent.innerHTML;

    // Update URL in browser history without reloading the page
    history.pushState({}, '', url); // Update URL without reloading

    // Toggle active class on the selected menu item
    menuItems.forEach((item) => {
      item.classList.toggle('active', item.dataset.section === section);
    });
  } catch (err) {
    getErrorMessage(err, 'Failed to load section:');

    // Fallback UI message for users if section fails to load
    contentDiv.innerHTML = '<h2>Error loading content. Try again.</h2>';
  }
};
