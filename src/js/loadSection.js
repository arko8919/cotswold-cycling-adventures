import axios from 'axios';

const contentDiv = document.getElementById('dynamic-content');

/* eslint-disable */
export const loadSection = async (section, menuItemsRef) => {
  try {
    const url = `/me/${section}`;
    const res = await axios.get(url);

    // Parse the returned HTML response into a document
    const parser = new DOMParser();
    const doc = parser.parseFromString(res.data, 'text/html');
    const newContent = doc.querySelector('#dynamic-content');

    // Update only the target content area, keeping the rest of the page intact
    contentDiv.innerHTML = newContent.innerHTML;

    // Update URL in browser history without reloading the page
    history.pushState({}, '', url); // Update URL without reloading

    // Toggle active class on the selected menu item
    menuItemsRef.forEach((item) => {
      item.classList.toggle(
        'active',
        item.getAttribute('data-section') === section,
      );
    });
  } catch (error) {
    console.error('❌ AJAX Load Error:');
    // Fallback UI message for users if section fails to load
    contentDiv.innerHTML = '<h2>Error loading content. Try again.</h2>';
  }
};
