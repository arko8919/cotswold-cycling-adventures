/* eslint-disable */

// Removes the alert message from the page if it exists
export const hideAlert = () => {
  const alert = document.querySelector('.alert');
  if (alert) alert.parentElement.removeChild(alert);
};

// Displays an alert message and hides it after 5 seconds
export const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};
