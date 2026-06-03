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
  window.setInterval(update, 60000);
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

function initializePageBehavior() {
  initializeCounters();
  initializeShareCopy();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePageBehavior, { once: true });
} else {
  initializePageBehavior();
}

document.addEventListener('astro:page-load', initializePageBehavior);
