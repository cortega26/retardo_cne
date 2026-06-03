function initializeNavbarBehavior() {
  var btn = document.getElementById('toggleTheme');
  var langBtn = document.getElementById('toggleLang');
  var navbarToggler = document.querySelector('[data-toggle="navbar-collapse"]');
  var navPanel = document.getElementById('navbarNav');
  var dropdownToggles = document.querySelectorAll('[data-toggle="dropdown"]');

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

  // ── Mobile collapse toggle ──────────────────────────────────
  if (navbarToggler && navPanel) {
    navbarToggler.addEventListener('click', function () {
      var isOpen = navPanel.classList.toggle('show');
      navbarToggler.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // ── Dropdown toggle ─────────────────────────────────────────
  dropdownToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var dropdown = this.closest('.dropdown');
      if (!dropdown) return;

      // Close other dropdowns
      dropdownToggles.forEach(function (other) {
        var otherDropdown = other.closest('.dropdown');
        if (otherDropdown && otherDropdown !== dropdown) {
          otherDropdown.classList.remove('show');
          other.setAttribute('aria-expanded', 'false');
        }
      });

      var isOpen = dropdown.classList.toggle('show');
      this.setAttribute('aria-expanded', String(isOpen));
    });
  });

  // ── Click outside handler ───────────────────────────────────
  document.addEventListener('click', function (e) {
    // Close dropdowns
    dropdownToggles.forEach(function (toggle) {
      var dropdown = toggle.closest('.dropdown');
      if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close mobile nav on outside click
    if (navPanel && navbarToggler && !navPanel.contains(e.target) && !navbarToggler.contains(e.target)) {
      navPanel.classList.remove('show');
      navbarToggler.setAttribute('aria-expanded', 'false');
    }
  });

  // ── Escape key handler ──────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      dropdownToggles.forEach(function (toggle) {
        var dropdown = toggle.closest('.dropdown');
        if (dropdown) {
          dropdown.classList.remove('show');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
      if (navPanel && navbarToggler) {
        navPanel.classList.remove('show');
        navbarToggler.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // ── Close mobile nav on anchor click ────────────────────────
  document.querySelectorAll('#navbarNav a[href^="#"]').forEach(function (link) {
    if (link instanceof HTMLAnchorElement && !link.dataset.bound) {
      link.dataset.bound = 'true';
      link.addEventListener('click', function () {
        if (!window.matchMedia('(max-width: 991.98px)').matches) return;
        if (navPanel && navbarToggler) {
          navPanel.classList.remove('show');
          navbarToggler.setAttribute('aria-expanded', 'false');
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
