function updateCounterElement(counter) {
  if (!(counter instanceof HTMLElement)) {
    return;
  }
  if (counter.dataset.counterBound === 'true') {
    return;
  }
  counter.dataset.counterBound = 'true';

  var targetDateStr = counter.dataset.target;
  if (!targetDateStr) {
    return;
  }

  var targetTime = new Date(targetDateStr).getTime();
  var isEn = document.documentElement.lang === 'en';

  function update() {
    var diff = Math.max(0, Date.now() - targetTime);
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var minutes = Math.floor((diff % 3600000) / 60000);
    var seconds = Math.floor((diff % 60000) / 1000);

    var units = [
      { value: days, label: isEn ? (days === 1 ? 'Day' : 'Days') : (days === 1 ? 'Día' : 'Días') },
      { value: hours, label: isEn ? (hours === 1 ? 'Hour' : 'Hours') : (hours === 1 ? 'Hora' : 'Horas') },
      { value: minutes, label: 'Min' },
      { value: seconds, label: isEn ? 'Sec' : 'Seg' },
    ];

    if (!counter.children.length) {
      counter.innerHTML = units
        .map(function (unit, i) {
          var value = i >= 1 ? String(unit.value).padStart(2, '0') : String(unit.value);
          return '<span data-unit="' + i + '"><span class="number">' + value + '</span>' + unit.label + '</span>';
        })
        .join('');
      return;
    }

    units.forEach(function (unit, i) {
      var wrapper = counter.querySelector('[data-unit="' + i + '"]');
      if (!(wrapper instanceof HTMLElement)) {
        return;
      }
      var numEl = wrapper.querySelector('.number');
      if (!(numEl instanceof HTMLElement)) {
        return;
      }
      var formatted = i >= 1 ? String(unit.value).padStart(2, '0') : String(unit.value);
      if (numEl.textContent !== formatted) {
        numEl.textContent = formatted;
        numEl.classList.remove('digit-flash');
        void numEl.offsetWidth;
        numEl.classList.add('digit-flash');
      }
    });
  }

  update();
  window.setInterval(update, 1000);
}

function initializeCounters() {
  document.querySelectorAll('.counter[data-target]').forEach(function (counter) {
    updateCounterElement(counter);
  });
}

function initializeShareCopy() {
  var btn = document.getElementById('copyLinkBtn');
  var label = document.getElementById('copyBtnLabel');
  if (!(btn instanceof HTMLButtonElement) || !(label instanceof HTMLElement)) {
    return;
  }
  if (btn.dataset.bound === 'true') {
    return;
  }
  btn.dataset.bound = 'true';

  var isEn = document.documentElement.lang === 'en';
  var defaultLabel = isEn ? 'Copy link' : 'Copiar enlace';

  btn.addEventListener('click', async function () {
    var url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      label.textContent = isEn ? '✓ Copied!' : '✓ ¡Copiado!';
      window.setTimeout(function () {
        label.textContent = defaultLabel;
      }, 2500);
    } catch (error) {
      label.textContent = url;
    }
  });
}

function initializeReadingProgress() {
  var bar = document.getElementById('read-progress');
  if (!(bar instanceof HTMLElement) || bar.dataset.bound === 'true') {
    return;
  }
  bar.dataset.bound = 'true';

  function update() {
    var total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0
      ? (window.scrollY / total * 100).toFixed(1) + '%'
      : '0%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initializeHeroCounter() {
  var el = document.getElementById('hero-num-citizen');
  if (!(el instanceof HTMLElement) || el.dataset.counterBound === 'true') {
    return;
  }
  el.dataset.counterBound = 'true';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  var final = Number(el.dataset.final);
  if (!Number.isFinite(final)) {
    return;
  }
  var sep = el.dataset.sep || '.';
  var duration = 1800;

  function format(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  }

  el.textContent = format(0);
  var start = performance.now();

  function tick(now) {
    var progress = Math.min((now - start) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = format(Math.round(eased * final));
    if (progress < 1) {
      window.requestAnimationFrame(tick);
    }
  }

  window.requestAnimationFrame(tick);
}

function initializeBackToTop() {
  var btn = document.getElementById('back-to-top');
  if (!(btn instanceof HTMLAnchorElement) || btn.dataset.bound === 'true') {
    return;
  }
  btn.dataset.bound = 'true';

  function update() {
    btn.classList.toggle('visible', window.scrollY > 400);
  }

  window.addEventListener('scroll', update, { passive: true });
  btn.addEventListener('click', function (event) {
    event.preventDefault();
    var start = document.getElementById('inicio');
    if (start) {
      start.scrollIntoView({ behavior: 'smooth' });
    }
  });
  update();
}

function initializeConclusionShare() {
  var btn = document.getElementById('conclusion-share-btn');
  if (!(btn instanceof HTMLButtonElement) || btn.dataset.bound === 'true') {
    return;
  }
  btn.dataset.bound = 'true';

  btn.addEventListener('click', async function () {
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      var original = btn.textContent;
      btn.textContent = btn.dataset.copiedLabel || original;
      window.setTimeout(function () {
        btn.textContent = original;
      }, 2000);
    } catch (_) {
      // Dismissed shares and unavailable clipboard access require no UI error.
    }
  });
}

function initializeSectionRail() {
  var rail = document.querySelector('[data-section-rail]');
  if (!(rail instanceof HTMLElement) || rail.dataset.bound === 'true') {
    return;
  }
  rail.dataset.bound = 'true';

  var links = Array.prototype.slice.call(rail.querySelectorAll('[data-rail-target]'));
  var sections = links
    .map(function (link) { return document.getElementById(link.dataset.railTarget || ''); })
    .filter(Boolean);
  if (!sections.length) {
    return;
  }

  function update() {
    var line = window.innerHeight / 3;
    var current = sections[0];
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= line) {
        current = section;
      }
    });
    links.forEach(function (link) {
      if (link.dataset.railTarget === current.id) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(function () {
      update();
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

function initializePageBehavior() {
  initializeCounters();
  initializeShareCopy();
  initializeReadingProgress();
  initializeHeroCounter();
  initializeBackToTop();
  initializeConclusionShare();
  initializeSectionRail();
  if (document.readyState === 'complete') {
    document.documentElement.dataset.pageReady = 'true';
  } else {
    window.addEventListener('load', function () {
      document.documentElement.dataset.pageReady = 'true';
    }, { once: true });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePageBehavior, { once: true });
} else {
  initializePageBehavior();
}

document.addEventListener('astro:page-load', initializePageBehavior);
