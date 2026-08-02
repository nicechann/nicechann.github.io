(function () {
  const saved = localStorage.getItem('mellowlines-language');
  const browser = (navigator.language || 'en').toLowerCase();
  const initial = saved || (browser.startsWith('ko') ? 'ko' : 'en');

  function setLanguage(language) {
    const lang = language === 'ko' ? 'ko' : 'en';
    document.documentElement.dataset.language = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('mellowlines-language', lang);
    document.querySelectorAll('[data-set-language]').forEach((button) => {
      button.classList.toggle('active', button.dataset.setLanguage === lang);
      button.setAttribute('aria-pressed', String(button.dataset.setLanguage === lang));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setLanguage(initial);
    document.querySelectorAll('[data-set-language]').forEach((button) => {
      button.addEventListener('click', () => setLanguage(button.dataset.setLanguage));
    });
  });
})();
