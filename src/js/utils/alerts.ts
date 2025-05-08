import { AlertMessage } from './types';

/**
 * Removes the alert message from the page if it exists.
 */
export const hideAlert = (): void => {
  const alert = document.querySelector('.alert') as HTMLDivElement | null;
  alert?.remove();
};

/**
 * Displays an alert message of the given type with custom text and timeout.
 *
 * @param type - One of: 'success' | 'error' | 'info' | 'warning'
 * @param message - The alert message to display
 * @param timeout - How long (in seconds) the alert should stay visible
 */
export const showAlert = ({
  type,
  message,
  timeout = 7,
}: AlertMessage): void => {
  hideAlert();

  const markup = `<div class="alert alert--${type}">${message}</div>`;
  document.body.insertAdjacentHTML('afterbegin', markup);

  window.setTimeout(hideAlert, timeout * 1000);
};
