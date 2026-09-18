(() => {
  const filters = Array.from(document.querySelectorAll('.filter'));
  const cards = Array.from(document.querySelectorAll('.project-card'));
  const year = document.querySelector('#year');

  if (year) year.textContent = String(new Date().getFullYear());

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.dataset.filter || 'all';

      filters.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });

      cards.forEach((card) => {
        card.hidden = selected !== 'all' && card.dataset.category !== selected;
      });
    });
  });
})();
