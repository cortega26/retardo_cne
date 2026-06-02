(function () {
  function applyThemeClass(isDark) {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    if (document.body) {
      document.body.classList.toggle('dark-mode', isDark);
    }
  }

  function resolvePreferredTheme() {
    var theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      return true;
    }
    if (theme === 'light') {
      return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function syncPreferredTheme() {
    applyThemeClass(resolvePreferredTheme());
  }

  window.__setPreferredTheme = function (nextTheme) {
    localStorage.setItem('theme', nextTheme);
    applyThemeClass(nextTheme === 'dark');
  };

  syncPreferredTheme();
  document.addEventListener('DOMContentLoaded', syncPreferredTheme, { once: true });
})();
