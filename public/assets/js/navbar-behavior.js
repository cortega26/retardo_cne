function initializeNavbarBehavior() {
  var btn = document.getElementById('toggleTheme');
  var langBtn = document.getElementById('toggleLang');

  function syncThemeState() {
    if (!(btn instanceof HTMLButtonElement)) {
      return;
    }
    btn.setAttribute('aria-pressed', String(document.body.classList.contains('dark-mode')));
  }

  if (btn instanceof HTMLButtonElement && !btn.dataset.bound) {
    btn.dataset.bound = 'true';
    syncThemeState();
    btn.addEventListener('click', function () {
      var nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
      var setPreferredTheme = window.__setPreferredTheme;
      if (typeof setPreferredTheme === 'function') {
        setPreferredTheme(nextTheme);
      } else {
        document.body.classList.toggle('dark-mode', nextTheme === 'dark');
        localStorage.setItem('theme', nextTheme);
      }
      syncThemeState();
    });
  }

  if (langBtn instanceof HTMLAnchorElement && !langBtn.dataset.bound) {
    langBtn.dataset.bound = 'true';
    langBtn.addEventListener('click', function () {
      var targetLang = langBtn.dataset.targetLang;
      if (targetLang) {
        localStorage.setItem('site_lang', targetLang);
      }
    });
  }

  document.querySelectorAll('#navbarNav a[href^="#"]').forEach(function (link) {
    if (link instanceof HTMLAnchorElement && !link.dataset.bound) {
      link.dataset.bound = 'true';
      link.addEventListener('click', function () {
        var navPanel = document.getElementById('navbarNav');
        var toggler = document.querySelector('[data-bs-target="#navbarNav"]');
        if (!navPanel || !window.matchMedia('(max-width: 991.98px)').matches) {
          return;
        }
        navPanel.classList.remove('show', 'collapsing');
        navPanel.style.height = '';
        if (toggler) {
          toggler.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeNavbarBehavior, { once: true });
} else {
  initializeNavbarBehavior();
}

document.addEventListener('astro:page-load', initializeNavbarBehavior);
