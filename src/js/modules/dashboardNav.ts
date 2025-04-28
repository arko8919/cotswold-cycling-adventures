import { loadSection } from '../api/loadSection';
import { handleAdventureForm } from './handleAdventureForm';
import { populateAdventureForm } from './populateAdventureForm';

/**
 * Initializes dashboard navigation.
 *
 * - Delegates click events from dashboard menu lists to load content dynamically without page refresh.
 * - Listens to browser history "popstate" events to handle back/forward navigation.
 */
export const dashboardNav = () => {
  const dashLists = document.querySelectorAll<HTMLUListElement>('.dashLists');

  let activeDashSection = document.querySelector<HTMLLIElement>(
    '.dashLists .list-group-item.active',
  );

  dashLists.forEach((list) => {
    list.addEventListener('click', async function (e) {
      e.preventDefault();
      // Use closest() to ensure we always get the nearest <li> ancestor with a data-section attribute
      const target = (e.target as HTMLElement).closest('li[data-section]');

      if (!(target instanceof HTMLLIElement)) return;

      const section = (target as HTMLElement).dataset.section;

      if (!section) return;
      await loadSection(section);

      if (activeDashSection) {
        activeDashSection.classList.remove('active');
      }

      target.classList.add('active');
      //  Remember active item
      activeDashSection = target;

      // Note: If this block grows in the future, consider moving it to a separate handler
      if (section === 'manage-adventures') {
        handleAdventureForm();
        populateAdventureForm();
      }
    });
  });

  window.addEventListener('popstate', async () => {
    const section = window.location.pathname.split('/')[2] || 'settings';
    await loadSection(section);

    // Note: If this block grows in the future, consider moving it to a separate handler
    if (section === 'manage-adventures') {
      handleAdventureForm();
      populateAdventureForm();
    }
  });
};
