'use strict';

const CNEMonitor = (() => {
  console.log('CNEMonitor module initialized');

  const targetDate1 = new Date('2024-07-30T22:00:00Z');
  const targetDate2 = new Date('2024-08-29T02:00:00Z');

  function updateCounter(elementId, targetDate) {
    console.log(`Updating counter: ${elementId}`);
    const counter = document.getElementById(elementId);
    if (!counter) {
      console.error(`Counter element with id ${elementId} not found`);
      return;
    }

    const spans = ['days', 'hours', 'minutes', 'seconds'].map((unit) => {
      const span = document.createElement('span');
      span.className = unit;
      counter.appendChild(span);
      return span;
    });

    function update() {
      try {
        const now = new Date();
        const differenceInMs = now - targetDate;

        const days = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (differenceInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
          (differenceInMs % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((differenceInMs % (1000 * 60)) / 1000);

        const units = [
          { value: days, singular: 'día', plural: 'días' },
          { value: hours, singular: 'hora', plural: 'horas' },
          { value: minutes, singular: 'minuto', plural: 'minutos' },
          { value: seconds, singular: 'segundo', plural: 'segundos' },
        ];

        units.forEach(({ value, singular, plural }, index) => {
          const span = spans[index];
          const newText = `<span class="number">${value}</span> ${value === 1 ? singular : plural}`;
          if (span.innerHTML !== newText) {
            span.innerHTML = newText;
          }
        });

        // Pulse effect removed
      } catch (error) {
        console.error('Error updating counter:', error);
      }

      requestAnimationFrame(update);
    }

    update();
    console.log(`Counter ${elementId} update started`);
  }

  // Simple ease-out quadratic for smooth animation
  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quadratic: 1 - (1-t) * (1-t)
      const easeProgress = 1 - (1 - progress) * (1 - progress);

      obj.innerHTML = Math.floor(progress * (end - start) + start);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.innerHTML = end;
      }
    };
    window.requestAnimationFrame(step);
  }

  // We'll modify the update function to handle the initial animation later if needed,
  // but for now, the existing logic runs continuously.
  // To strictly animate "on load" from 0 to Current, we'd need to intercept the first render.
  // Given the complexity of the current continuous update loop, adding a css-based fade-in or
  // simple specific animation might be safer.
  // Let's stick to the current robust logic but add a visual "entry" animation via CSS instead for safety.

  function toggleTheme() {
    console.log('Toggling theme');
    try {
      document.body.classList.toggle('dark-mode');
      const isDarkMode = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      const toggleThemeBtn = document.getElementById('toggleTheme');
      if (toggleThemeBtn) {
        toggleThemeBtn.setAttribute('aria-pressed', String(isDarkMode));
      }
      const icon = document.querySelector('#toggleTheme i');
      if (icon) {
        icon.classList.toggle('fa-sun', isDarkMode);
        icon.classList.toggle('fa-moon', !isDarkMode);
      }
      console.log(`Theme set to: ${isDarkMode ? 'dark' : 'light'}`);
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  }

  function initializePage() {
    console.log('Initializing page');
    try {
      updateCounter('counter1', targetDate1);
      updateCounter('counter2', targetDate2);

      const toggleThemeBtn = document.getElementById('toggleTheme');
      if (toggleThemeBtn) {
        toggleThemeBtn.addEventListener('click', toggleTheme);
        toggleThemeBtn.setAttribute('aria-pressed', 'false');
        console.log('Theme toggle button listener added');
      } else {
        console.warn('Theme toggle button not found');
      }

      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (toggleThemeBtn) {
          toggleThemeBtn.setAttribute('aria-pressed', 'true');
        }
        const icon = document.querySelector('#toggleTheme i');
        if (icon) {
          icon.classList.remove('fa-moon');
          icon.classList.add('fa-sun');
        }
        console.log('Dark mode applied from saved preference');
      }

      if (typeof AOS !== 'undefined') {
        AOS.init({
          duration: 1000,
          once: true,
        });
        console.log('AOS initialized');
      } else {
        console.warn('AOS library not found');
      }

      if (typeof gtag === 'function') {
        console.log('Sending Google Analytics pageview event');
        gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: window.location.pathname,
        });
        console.log('Google Analytics pageview event sent successfully');
      } else {
        console.warn(
          'Google Analytics gtag function not found. Make sure the Google Analytics script is loaded correctly.',
        );
      }

      console.log('Page initialization complete');
    } catch (error) {
      console.error('Error during page initialization:', error);
    }
  }

  return {
    init: initializePage,
    toggleTheme: toggleTheme,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');
  CNEMonitor.init();
});

window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
});

window.addEventListener('load', () => {
  if (typeof gtag === 'undefined') {
    console.warn(
      'Google Analytics might be blocked by an ad blocker or not loaded correctly',
    );
  } else {
    console.log('Google Analytics (gtag) is available');
  }

  // 2. Legal Highlighter Observer
  const highlighterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Disconnect after activating once intended? 
        // Keep looking if user scrolls back up? 
        // Usually standard is fire once.
        highlighterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 1.0 });

  const highlights = document.querySelectorAll('.highlight-text');
  highlights.forEach(el => highlighterObserver.observe(el));
});

// --- Internationalization (i18n) ---
const translations = {
  es: {
    // Nav
    nav_home: "INICIO",
    nav_analysis: "ANÁLISIS",
    nav_analysis_math: "Análisis Matemático",
    nav_analysis_irregularities: "Irregularidades del proceso",
    nav_background: "ANTECEDENTES",
    nav_bg_2018_power: "21/03/2018 - \"Nunca vamos a entregar el poder\"",
    nav_bg_2024_threat: "04/02/2024 - \"Por las buenas o por las malas\"",
    nav_bg_2024_ue: "28/05/2024 - Revocatoria Observadores UE",
    nav_bg_2024_repression: "25/07/2024 - Aumento de la represión",
    nav_bg_2024_joder: "30/07/2024 - \"Los vamos a joder\"",
    nav_cne_archive: "CNE (ARCHIVE.ORG)",
    nav_cne_mirror: "Sitio Oficial (Espejo)",
    nav_cne_schedule: "Cronograma Electoral",
    nav_international: "INTERNACIONAL",
    org_carter: "Centro Carter",
    org_oas_sec: "Sec. Gral. OEA",
    org_eu: "Unión Europea",
    org_un: "Prensa ONU",
    nav_verification: "VERIFICACIÓN",
    nav_verify_lewis: "Desmintiendo a Lewis & Thompson",
    nav_verify_hack: "Análisis del supuesto \"Hackeo\"",
    nav_legal_resources: "RECURSOS LEGALES",
    nav_resource_auth: "Autenticidad de las Actas",
    nav_resource_lopre: "Ley Orgánica de Procesos Electorales",
    nav_resource_barbados: "Acuerdo de Barbados",
    nav_results: "RESULTADOS",
    nav_results_actas: "Resultados con Venezuela",
    nav_results_macedonia: "MacedoniaDelNorte",


    // Header
    status_live: "EN VIVO",
    hero_title: "Observatorio de Cumplimiento Legal",
    hero_subtitle: "Vigilando el respeto a la voluntad popular en tiempo real",

    // Mission
    mission_text: "La legalidad no es opcional. El Consejo Nacional Electoral (CNE) tiene plazos constitucionales y legales taxativos que no han sido cumplidos. Este observatorio documenta, en tiempo real, la violación sistemática de la <strong class='highlight-text'>Ley Orgánica de Procesos Electorales (LOPRE)</strong>, socavando la transparencia y la soberanía popular.",

    // Counters
    counter1_title: "Retraso en la totalización y escrutinio:",
    status_label: "ESTADO:",
    violation_1: "VIOLADO DESDE EL 30/07/2024",
    limit_48h: "Límite Legal (48h)",
    current_delay: "Retraso Actual",
    legal_ref_1: "Art. 146 LOPRE: Plazo máximo legal de 48 horas",

    counter2_title: "Retraso en la publicación en Gaceta Electoral:",
    violation_2: "VIOLADO DESDE EL 29/08/2024",
    limit_30d: "Límite Legal (30 días)",
    legal_ref_2: "Art. 155 LOPRE: Plazo máximo legal de 30 días",

    // Timeline
    timeline_title: "Cronología de la Ruptura del Hilo Constitucional",
    timeline_1_date: "28 de Julio - 10:00 PM",
    timeline_1_title: "Paralización de Transmisión",
    timeline_1_text: "El CNE detiene inexplicablemente la transmisión de datos cuando la oposición reportaba una ventaja irreversible.",
    timeline_2_date: "29 de Julio - 12:00 AM",
    timeline_2_title: "Apagón Digital",
    timeline_2_text: "La página web oficial del CNE sale de línea. Hasta la fecha, no ha sido restablecida con los resultados mesa por mesa.",
    timeline_3_date: "30 de Julio",
    timeline_3_title: "Primer Plazo Violado",
    timeline_3_text: "Vence el lapso legal de 48 horas (Art. 146 LOPRE) para la totalización. No se publican actas.",
    timeline_4_date: "2 de Agosto",
    timeline_4_title: "Boletín sin Sustento",
    timeline_4_text: "El CNE emite un segundo boletín adjudicando la victoria sin presentar una sola acta de escrutinio que lo valide.",
    timeline_5_date: "29 de Agosto",
    timeline_5_title: "Segundo Plazo Violado",
    timeline_5_text: "Vence el lapso de 30 días (Art. 155 LOPRE) para la publicación en Gaceta Electoral. El incumplimiento se consuma definitivamente.",

    // International
    international_title: "La Comunidad Internacional Confirma el Fraude",
    card_carter_title: "Centro Carter",
    card_carter_text: "\"La elección de Venezuela no se adecuó a parámetros internacionales y no puede ser considerada democrática.\"",
    btn_read_report: "Leer Informe",
    card_un_title: "Panel Expertos ONU",
    card_un_text: "\"El proceso de gestión de resultados por parte del CNE no cumplió con las medidas básicas de transparencia e integridad.\"",
    btn_read_statement: "Leer Comunicado",
    card_eu_title: "Unión Europea",
    card_eu_text: "\"Sin pruebas que las respalden, los resultados publicados el 2 de agosto no pueden ser reconocidos.\"",
    btn_view_declaration: "Ver Declaración",
    card_oas_title: "OEA",
    card_oas_text: "\"El régimen aplicó un esquema represivo complementado por acciones tendientes a distorsionar completamente el resultado electoral, dejándolo a la manipulación más aberrante.\"",
    btn_view_communique: "Ver Comunicado",

    // Share & Footer
    share_title: "Rompe la Censura: Difunde la Verdad",
    footer_rights: "Observatorio Electoral Ciudadano. Este sitio no está afiliado al CNE.",
    footer_opensource: "Código Abierto / Open Source"
  },
  en: {
    // Nav
    nav_home: "HOME",
    nav_analysis: "ANALYSIS",
    nav_analysis_math: "Mathematical Analysis",
    nav_analysis_irregularities: "Process Irregularities",
    nav_background: "BACKGROUND",
    nav_bg_2018_power: "03/21/2018 - \"We will never give up power\"",
    nav_bg_2024_threat: "02/04/2024 - \"By hook or by crook\"",
    nav_bg_2024_ue: "05/28/2024 - EU Observers Revocation",
    nav_bg_2024_repression: "07/25/2024 - Increase in repression",
    nav_bg_2024_joder: "07/30/2024 - \"We will screw them over\"",
    nav_cne_archive: "CNE (ARCHIVE.ORG)",
    nav_cne_mirror: "Official Site (Mirror)",
    nav_cne_schedule: "Electoral Schedule",
    nav_international: "INTERNATIONAL",
    org_carter: "The Carter Center",
    org_oas_sec: "OAS Gen. Sec.",
    org_eu: "European Union",
    org_un: "UN Press",
    nav_verification: "VERIFICATION",
    nav_verify_lewis: "Debunking Lewis & Thompson",
    nav_verify_hack: "Analysis of the alleged \"Hack\"",
    nav_legal_resources: "LEGAL RESOURCES",
    nav_resource_auth: "Authenticity of the Minutes (Actas)",
    nav_resource_lopre: "Organic Law of Electoral Processes",
    nav_resource_barbados: "Barbados Agreement",
    nav_results: "RESULTS",
    nav_results_actas: "Resultados con Venezuela",
    nav_results_macedonia: "MacedoniaDelNorte",

    // Header
    status_live: "LIVE",
    hero_title: "Legal Compliance Observatory",
    hero_subtitle: "Monitoring respect for the popular will in real time",

    // Mission
    mission_text: "Legality is not optional. The National Electoral Council (CNE) has strict constitutional and legal deadlines that have not been met. This observatory documents, in real time, the systematic violation of the <strong class='highlight-text'>Organic Law of Electoral Processes (LOPRE)</strong>, undermining transparency and popular sovereignty.",

    // Counters
    counter1_title: "Delay in Totalization and Scrutiny:",
    status_label: "STATUS:",
    violation_1: "VIOLATED SINCE 07/30/2024",
    limit_48h: "Legal Limit (48h)",
    current_delay: "Current Delay",
    legal_ref_1: "Art. 146 LOPRE: Maximum legal deadline of 48 hours",

    counter2_title: "Delay in Publication in Electoral Gazette:",
    violation_2: "VIOLATED SINCE 08/29/2024",
    limit_30d: "Legal Limit (30 days)",
    legal_ref_2: "Art. 155 LOPRE: Maximum legal deadline of 30 days",

    // Timeline
    timeline_title: "Chronology of the Constitutional Breakdown",
    timeline_1_date: "July 28 - 10:00 PM",
    timeline_1_title: "Transmission Halted",
    timeline_1_text: "The CNE inexplicably halts data transmission just as the opposition was reporting an irreversible lead.",
    timeline_2_date: "July 29 - 12:00 AM",
    timeline_2_title: "Digital Blackout",
    timeline_2_text: "The official CNE website goes offline. To date, it has not been restored with precinct-level results.",
    timeline_3_date: "July 30",
    timeline_3_title: "First Deadline Violated",
    timeline_3_text: "The 48-hour legal deadline (Art. 146 LOPRE) for totalization expires. No official minutes are published.",
    timeline_4_date: "August 2",
    timeline_4_title: "Baseless Bulletin",
    timeline_4_text: "The CNE issues a second bulletin awarding the victory without presenting a single scrutiny minute to validate it.",
    timeline_5_date: "August 29",
    timeline_5_title: "Second Deadline Violated",
    timeline_5_text: "The 30-day deadline (Art. 155 LOPRE) for publication in the Electoral Gazette expires. The breach is definitively consummated.",

    // International
    international_title: "The International Community Confirms the Fraud",
    card_carter_title: "The Carter Center",
    card_carter_text: "\"Venezuela's election did not meet international standards and cannot be considered democratic.\"",
    btn_read_report: "Read Report",
    card_un_title: "UN Panel of Experts",
    card_un_text: "\"The CNE's results management process fell short of the basic measures of transparency and integrity.\"",
    btn_read_statement: "Read Statement",
    card_eu_title: "European Union",
    card_eu_text: "\"Without evidence to support them, the results published on August 2nd cannot be recognized.\"",
    btn_view_declaration: "View Declaration",
    card_oas_title: "OAS",
    card_oas_text: "\"The regime applied a repressive scheme complemented by actions tending to completely distort the electoral result, leaving it to the most aberrant manipulation.\"",
    btn_view_communique: "View Communiqué",

    // Share & Footer
    share_title: "Break the Censorship: Spread the Truth",
    footer_rights: "Citizen Electoral Observatory. This site is not affiliated with the CNE.",
    footer_opensource: "Open Source"
  }
};

let currentLang = localStorage.getItem('site_lang') || 'es';

function updateLanguage(lang) {
  // Update all marked elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      if (key === 'mission_text') {
        el.innerHTML = translations[lang][key];
        // Re-observe highlight if needed, or just let it exist
        setTimeout(() => {
          const newHighlight = el.querySelector('.highlight-text');
          if (newHighlight) {
            // Trigger observer manually or re-observe?
            // Simple hack: add 'active' class after a tiny delay to ensure animation plays if visible
            // But better to rely on existing observer if it catches dynamic nodes? 
            // The existing observer in window 'load' only targeted initial nodes.
            // We need to re-add it.
            reObserveHighlighter(newHighlight);
          }
        }, 50);
      } else if (key.startsWith('org_')) {
        // For inline spans we just set textContent
        el.textContent = translations[lang][key];
      } else {
        el.textContent = translations[lang][key];
      }
    }
  });

  // Update Toggle Button
  const toggleBtn = document.getElementById('toggleLang');
  if (toggleBtn) {
    toggleBtn.textContent = lang === 'es' ? 'ES' : 'EN';
  }

  // Update Title
  if (lang === 'en') {
    document.title = "Legal Compliance Observatory - CNE Venezuela";
  } else {
    document.title = "Monitoreo de Infracciones Legales Electorales - CNE Venezuela";
  }

  localStorage.setItem('site_lang', lang);
  currentLang = lang;
}

function reObserveHighlighter(element) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 1.0 });
  observer.observe(element);
}

// 3. Updated "Tab Signal" & Init
document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    document.title = "⚠️ Tiempo Agotado - CNE Venezuela";
  } else {
    // Restore correct title based on language
    if (localStorage.getItem('site_lang') === 'en') {
      document.title = "Legal Compliance Observatory - CNE Venezuela";
    } else {
      document.title = "Monitoreo de Infracciones Legales Electorales - CNE Venezuela";
    }
  }
});

// Init Language Logic
document.addEventListener('DOMContentLoaded', () => {
  updateLanguage(currentLang);

  const langBtn = document.getElementById('toggleLang');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const newLang = currentLang === 'es' ? 'en' : 'es';
      updateLanguage(newLang);
    });
  }
});
