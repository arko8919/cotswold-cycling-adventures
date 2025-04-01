/* eslint-disable */
// modules/navigation.js
import { loadSection } from '../api/loadSection';
import { handleAdventureForm } from './handleAdventureForm';
import { populateAdventureForm } from './populateAdventureForm';

export const dashboardNav = () => {
  const menuItems = document.querySelectorAll('.list-group-item');

  if (menuItems.length) {
    menuItems.forEach((item) => {
      item.addEventListener('click', async function (e) {
        e.preventDefault();
        const section = this.getAttribute('data-section');
        await loadSection(section);

        if (section === 'manage-adventures') {
          handleAdventureForm();
          populateAdventureForm();
        }
      });
    });
  }

  window.addEventListener('popstate', async () => {
    const section = window.location.pathname.split('/')[2] || 'settings';
    await loadSection(section);

    if (section === 'manage-adventures') {
      handleAdventureForm();
      populateAdventureForm();
    }
  });
};
