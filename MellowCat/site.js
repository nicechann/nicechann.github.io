(() => {
  const root = document.documentElement;
  const stored = localStorage.getItem('mellowcat-language');
  const preferred = stored || (navigator.language?.toLowerCase().startsWith('ko') ? 'ko' : 'en');
  const setLanguage = (lang) => {
    root.dataset.language = lang;
    root.lang = lang;
    localStorage.setItem('mellowcat-language', lang);
    document.querySelectorAll('[data-language-button]').forEach((button) => {
      button.classList.toggle('active', button.dataset.languageButton === lang);
      button.setAttribute('aria-pressed', button.dataset.languageButton === lang ? 'true' : 'false');
    });
  };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-language-button]').forEach((button) => {
      button.addEventListener('click', () => setLanguage(button.dataset.languageButton));
    });
    setLanguage(preferred === 'ko' ? 'ko' : 'en');
  });
})();
