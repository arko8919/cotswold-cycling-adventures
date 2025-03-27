/* eslint-disable */
// modules/navigation.js
import { loadSection } from '../loadSection';
import { handleAdventureForm } from './adventureFormHandlers';
import { initDynamicLocationFields } from './locationFields';

export const setupNavigation = () => {
  const menuItems = document.querySelectorAll('.list-group-item');

  if (menuItems.length) {
    menuItems.forEach((item) => {
      item.addEventListener('click', async function (e) {
        e.preventDefault();
        const section = this.getAttribute('data-section');
        await loadSection(section, menuItems);

        if (section === 'manage-adventures') {
          handleAdventureForm();
          initDynamicLocationFields();
        }
      });
    });
  }

  window.addEventListener('popstate', async () => {
    const section = window.location.pathname.split('/')[2] || 'settings';
    await loadSection(section, menuItems);

    if (section === 'manage-adventures') {
      handleAdventureForm();
      initDynamicLocationFields();
    }
  });
};
