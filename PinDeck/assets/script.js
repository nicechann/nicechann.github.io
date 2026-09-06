(() => {
  const lightbox = document.querySelector('.lightbox');
  if (!lightbox) return;
  const img = lightbox.querySelector('img');
  const close = () => {
    lightbox.classList.remove('open');
    img.removeAttribute('src');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-lightbox]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      img.src = link.getAttribute('href');
      img.alt = link.querySelector('img')?.alt || 'PinDeck screenshot';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox || event.target.closest('.lightbox-close')) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('open')) close();
  });
})();
