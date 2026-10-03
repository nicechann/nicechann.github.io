(() => {
  const root = document.documentElement;
  const buttons = document.querySelectorAll('[data-language-button]');
  const saved = localStorage.getItem('mellowgomoku-language');
  const browserLanguage = (navigator.language || '').toLowerCase();
  const initial = saved || (browserLanguage.startsWith('ko') ? 'ko' : 'en');

  const setLanguage = (language) => {
    const next = language === 'ko' ? 'ko' : 'en';
    root.dataset.language = next;
    root.lang = next;
    localStorage.setItem('mellowgomoku-language', next);
    buttons.forEach((button) => {
      const active = button.dataset.languageButton === next;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.languageButton));
  });

  setLanguage(initial);
})();
