document.addEventListener('DOMContentLoaded', function () {
  const scrollContainer = document.querySelector('.review-slider');
  const scrollLeft = document.querySelector('.scroll-left');
  const scrollRight = document.querySelector('.scroll-right');

  if (scrollContainer) {
    scrollLeft.addEventListener('click', () => {
      scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
    });

    scrollRight.addEventListener('click', () => {
      scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }
});
