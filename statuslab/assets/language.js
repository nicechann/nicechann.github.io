(() => {
  const supportedLanguages = new Set(["en", "ko", "ja"]);
  const storageKey = "statuslab-language";
  const metaDescription = document.querySelector('meta[name="description"]');

  function browserLanguage() {
    const language = (navigator.language || "en").toLowerCase();
    if (language.startsWith("ko")) return "ko";
    if (language.startsWith("ja")) return "ja";
    return "en";
  }

  function preferredLanguage() {
    const queryLanguage = new URL(window.location.href).searchParams.get("lang");
    if (supportedLanguages.has(queryLanguage)) return queryLanguage;

    const savedLanguage = window.localStorage.getItem(storageKey);
    if (supportedLanguages.has(savedLanguage)) return savedLanguage;

    return browserLanguage();
  }

  function updateUrl(language) {
    const url = new URL(window.location.href);
    if (language === "en") {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", language);
    }
    window.history.replaceState({}, "", url);
  }

  function setLanguage(language, shouldPersist = true) {
    const nextLanguage = supportedLanguages.has(language) ? language : "en";
    document.documentElement.lang = nextLanguage;

    document.querySelectorAll("[data-lang]").forEach((element) => {
      element.hidden = element.dataset.lang !== nextLanguage;
    });

    document.querySelectorAll("[data-language-button]").forEach((button) => {
      const isSelected = button.dataset.languageButton === nextLanguage;
      button.setAttribute("aria-pressed", String(isSelected));
    });

    const suffix = nextLanguage.toUpperCase();
    const title = document.body.dataset[`title${suffix}`];
    const description = document.body.dataset[`description${suffix}`];
    if (title) document.title = title;
    if (description && metaDescription) {
      metaDescription.setAttribute("content", description);
    }

    if (shouldPersist) {
      window.localStorage.setItem(storageKey, nextLanguage);
      updateUrl(nextLanguage);
    }
  }

  document.querySelectorAll("[data-language-button]").forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.languageButton);
    });
  });

  setLanguage(preferredLanguage(), false);
})();
