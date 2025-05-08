import { loadSection } from '../api/loadSection';
import {
  initManageAdventuresForms,
  initSettingsForms,
} from './initAccountSections';

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

      if (!target || !(target instanceof HTMLLIElement)) return;

      const section = (target as HTMLLIElement).dataset.section;

      if (!section) return;
      await loadSection(section);

      if (activeDashSection) {
        activeDashSection.classList.remove('active');
      }

      target.classList.add('active');
      //  Remember active item
      activeDashSection = target;

      initDashboardSections(section);
    });
  });

  // Handle browser back/forward buttons to load the correct section dynamically
  window.addEventListener('popstate', async () => {
    const section = window.location.pathname.split('/')[2] || 'settings';
    await loadSection(section);

    initDashboardSections(section);
  });
};

/**
 * Initializes dashboard logic based on the active section.
 * Called after HTML content has been dynamically injected.
 *
 * @param section - The current section identifier
 */
const initDashboardSections = (section: string) => {
  switch (section) {
    case 'manage-adventures':
      initManageAdventuresForms();
      break;
    case 'settings':
      initSettingsForms();
      break;
    default:
      initSettingsForms();
  }
};
