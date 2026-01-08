'use strict';

const CNEMonitor = (() => {
  console.log('CNEMonitor module initialized');

  const targetDate1 = new Date('2024-07-30T22:00:00Z');
  const targetDate2 = new Date('2024-08-29T02:00:00Z');
  const counterIntervals = new Map();

  function setThemeIcon(isDarkMode) {
    const icon = document.querySelector('#toggleTheme i');
    if (!icon) {
      return;
    }
    icon.classList.toggle('fa-sun', isDarkMode);
    icon.classList.toggle('fa-moon', !isDarkMode);
  }

  function updateCounter(elementId, targetDate) {
    console.log(`Updating counter: ${elementId}`);
    const counter = document.getElementById(elementId);
    if (!counter) {
      console.error(`Counter element with id ${elementId} not found`);
      return;
    }

    const targetTime = targetDate.getTime();
    if (Number.isNaN(targetTime)) {
      console.error(`Invalid target date for counter: ${elementId}`);
      return;
    }

    if (counterIntervals.has(elementId)) {
      window.clearInterval(counterIntervals.get(elementId));
      counterIntervals.delete(elementId);
    }

    counter.textContent = '';
    const spans = ['days', 'hours', 'minutes', 'seconds'].map((unit) => {
      const span = document.createElement('span');
      span.className = unit;
      const numberSpan = document.createElement('span');
      numberSpan.className = 'number';
      const labelNode = document.createTextNode('');
      span.append(numberSpan, labelNode);
      counter.appendChild(span);
      return { span, numberSpan, labelNode };
    });

    function update() {
      try {
        const differenceInMs = Math.max(0, Date.now() - targetTime);

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
          const { numberSpan, labelNode } = spans[index];
          const valueText = String(value);
          const labelText = ` ${value === 1 ? singular : plural}`;
          if (numberSpan.textContent !== valueText) {
            numberSpan.textContent = valueText;
          }
          if (labelNode.textContent !== labelText) {
            labelNode.textContent = labelText;
          }
        });

        // Pulse effect removed
      } catch (error) {
        console.error('Error updating counter:', error);
      }
    }

    update();
    const intervalId = window.setInterval(update, 1000);
    counterIntervals.set(elementId, intervalId);
    console.log(`Counter ${elementId} update started`);
  }

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
      setThemeIcon(isDarkMode);
      console.log(`Theme set to: ${isDarkMode ? 'dark' : 'light'}`);
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  }

  function initCounters() {
    updateCounter('counter1', targetDate1);
    updateCounter('counter2', targetDate2);
  }

  function initThemeToggle() {
    const toggleThemeBtn = document.getElementById('toggleTheme');
    if (toggleThemeBtn) {
      toggleThemeBtn.addEventListener('click', toggleTheme);
      toggleThemeBtn.setAttribute('aria-pressed', 'false');
      console.log('Theme toggle button listener added');
      return toggleThemeBtn;
    }
    console.warn('Theme toggle button not found');
    return null;
  }

  function applySavedTheme(toggleThemeBtn) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== 'dark') {
      return;
    }
    document.body.classList.add('dark-mode');
    if (toggleThemeBtn) {
      toggleThemeBtn.setAttribute('aria-pressed', 'true');
    }
    setThemeIcon(true);
    console.log('Dark mode applied from saved preference');
  }

  function initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 1000,
        once: true,
      });
      console.log('AOS initialized');
      return;
    }
    console.warn('AOS library not found');
  }

  function sendPageView() {
    if (typeof gtag !== 'function') {
      console.warn(
        'Google Analytics gtag function not found. Make sure the Google Analytics script is loaded correctly.',
      );
      return;
    }
    console.log('Sending Google Analytics pageview event');
    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
    });
    console.log('Google Analytics pageview event sent successfully');
  }

  function runInitialization() {
    initCounters();
    const toggleThemeBtn = initThemeToggle();
    applySavedTheme(toggleThemeBtn);
    initAOS();
    sendPageView();
  }

  function initializePage() {
    console.log('Initializing page');
    try {
      runInitialization();
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
    nav_cne_tech1: "Tecnología Electoral I",
    nav_cne_tech2: "Tecnología Electoral II",
    nav_audits: "AUDITORÍAS",
    nav_audits_triad: "Triada post-electoral (sección)",
    nav_audits_cne: "CNE: Auditorías del sistema",
    nav_audits_pc: "Prensa Comunitaria: auditorías no realizadas",
    nav_audits_cnn: "CNN: auditorías no realizadas",
    nav_international: "INTERNACIONAL",
    org_carter: "Centro Carter",
    org_oas_sec: "Sec. Gral. OEA",
    org_eu: "Unión Europea",
    org_fidh: "FIDH",
    org_un: "Prensa ONU",
    org_cidh: "CIDH",
    org_oas_assembly: "Asamblea General OEA",
    org_hrw: "Human Rights Watch",
    org_amnesty: "Amnistía Internacional",
    org_oacdh: "OACDH ONU",
    org_eu_parl: "Parlamento Europeo",
    nav_verification: "VERIFICACIÓN",
    nav_verify_lewis: "Desmintiendo a Lewis & Thompson",
    nav_verify_hack: "Análisis del supuesto \"Hackeo\"",
    nav_legal_resources: "RECURSOS LEGALES",
    nav_resource_auth: "Autenticidad de las Actas",
    nav_resource_qr: "Cómo leer un Código QR",
    nav_resource_lopre: "Ley Orgánica de Procesos Electorales",
    nav_resource_barbados: "Acuerdo de Barbados",
    nav_results: "RESULTADOS",
    nav_results_actas: "Resultados con Venezuela",
    nav_results_macedonia: "MacedoniaDelNorte",


    // Header
    status_live: "EN VIVO",
    hero_country: "Venezuela | Elecciones Presidenciales 2024",
    hero_title: "Plazos legales incumplidos",
    hero_subtitle: "Evidencia verificable sobre totalización, actas y auditorías del CNE",

    // Mission
    mission_text: {
      prefix:
        "Este observatorio reúne hechos verificables sobre incumplimientos de plazos y obligaciones del CNE según la ",
      highlight: "Ley Orgánica de Procesos Electorales (LOPRE)",
      suffix: ". Cada punto enlaza norma y fuente primaria.",
    },
    mission_proof_label: "Fuente primaria:",
    mission_proof_link: "Sitio oficial del CNE (archivo)",

    // Key claims
    key_claims_title: "Hechos clave verificables",
    key_claims_subtitle: "Cada afirmación cita norma y fuente.",
    key_claims_impact: "Impacto: sin actas publicadas y auditorías completadas, los resultados no pueden verificarse de forma independiente.",
    key_claim_1_title: "Totalización fuera de plazo",
    key_claim_1_text: "El Art. 146 LOPRE fija un máximo de 48 horas para la totalización y el escrutinio.",
    key_claim_1_law: "Art. 146 LOPRE",
    key_claim_1_source: "CNE: totalización",
    key_claim_2_title: "Gaceta Electoral fuera de plazo",
    key_claim_2_text: "El Art. 155 LOPRE exige la publicación oficial en un máximo de 30 días.",
    key_claim_2_law: "Art. 155 LOPRE",
    key_claim_2_source: "CNE: cronograma electoral",
    key_claim_3_title: "Auditorías post-electorales no realizadas",
    key_claim_3_text: "La verificación post-electoral incluye auditorías técnicas previstas por el CNE.",
    key_claim_3_law: "CNE: auditorías del sistema",
    key_claim_3_source: "Reporte: Prensa Comunitaria",
    counter_claims_title: "Contrapuntos y verificación",
    counter_claims_subtitle: "Afirmaciones frecuentes y lo que exige la verificación pública.",
    counter_claim_1_label: "Afirmación frecuente",
    counter_claim_1_claim: "\"Los resultados son definitivos.\"",
    counter_claim_1_verify_label: "Verificación necesaria",
    counter_claim_1_verify: "La verificación independiente requiere actas mesa por mesa y auditorías post-electorales completas.",
    counter_claim_1_source_1: "CNE: totalización",
    counter_claim_1_source_2: "CNE: auditorías",
    counter_claim_2_label: "Afirmación frecuente",
    counter_claim_2_claim: "\"La publicación en Gaceta no es prioritaria.\"",
    counter_claim_2_verify_label: "Verificación necesaria",
    counter_claim_2_verify: "La LOPRE fija un plazo máximo de 30 días para la publicación oficial.",
    counter_claim_2_source_1: "Art. 155 LOPRE",
    counter_claim_2_source_2: "CNE: cronograma electoral",
    counter_claim_3_label: "Afirmación frecuente",
    counter_claim_3_claim: "\"Se realizaron auditorías post-electorales.\"",
    counter_claim_3_verify_label: "Verificación necesaria",
    counter_claim_3_verify: "El propio CNE describe las auditorías; reportes externos señalan que no se realizaron.",
    counter_claim_3_source_1: "CNE: auditorías",
    counter_claim_3_source_2: "Reporte: Prensa Comunitaria",

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
    timeline_3_date: "29-31 de Julio",
    timeline_3_title: "Auditoría de Telecomunicaciones Fase II",
    timeline_3_text: "Debía comparar la configuración de transmisión con la auditada antes de la elección y revisar los registros. No se realizó; fue suspendida tras alegar un \"ataque informático\".",
    timeline_4_date: "30 de Julio",
    timeline_4_title: "Primer Plazo Violado",
    timeline_4_text: "Vence el lapso legal de 48 horas (Art. 146 LOPRE) para la totalización. No se publican actas.",
    timeline_5_date: "2 de Agosto",
    timeline_5_title: "Verificación Ciudadana Fase II",
    timeline_5_text: "Debía auditar una muestra aleatoria (1%) de máquinas para verificar que el software no fue alterado y que la transmisión fue correcta. No se realizó.",
    timeline_6_date: "2 de Agosto",
    timeline_6_title: "Boletín sin Sustento",
    timeline_6_text: "El CNE emite un segundo boletín adjudicando la victoria sin presentar una sola acta de escrutinio que lo valide.",
    timeline_7_date: "5-8 de Agosto",
    timeline_7_title: "Auditoría de Datos Electorales Fase II",
    timeline_7_text: "Debía verificar la base de huellas (calidad y duplicidades) y su consistencia con el registro electoral. No se realizó.",
    timeline_8_date: "29 de Agosto",
    timeline_8_title: "Segundo Plazo Violado",
    timeline_8_text: "Vence el lapso de 30 días (Art. 155 LOPRE) para la publicación en Gaceta Electoral. El incumplimiento se consuma definitivamente.",

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
    nav_cne_tech1: "Electoral Technology I",
    nav_cne_tech2: "Electoral Technology II",
    nav_audits: "AUDITS",
    nav_audits_triad: "Post-election triad (section)",
    nav_audits_cne: "CNE: System audits",
    nav_audits_pc: "Prensa Comunitaria: audits not performed",
    nav_audits_cnn: "CNN: audits not performed",
    nav_international: "INTERNATIONAL",
    org_carter: "The Carter Center",
    org_oas_sec: "OAS Gen. Sec.",
    org_eu: "European Union",
    org_fidh: "FIDH",
    org_un: "UN Press",
    org_cidh: "IACHR",
    org_oas_assembly: "OAS General Assembly",
    org_hrw: "Human Rights Watch",
    org_amnesty: "Amnesty International",
    org_oacdh: "UN OHCHR",
    org_eu_parl: "European Parliament",
    nav_verification: "VERIFICATION",
    nav_verify_lewis: "Debunking Lewis & Thompson",
    nav_verify_hack: "Analysis of the alleged \"Hack\"",
    nav_legal_resources: "LEGAL RESOURCES",
    nav_resource_auth: "Authenticity of the Minutes (Actas)",
    nav_resource_qr: "How to read a QR Code",
    nav_resource_lopre: "Organic Law of Electoral Processes",
    nav_resource_barbados: "Barbados Agreement",
    nav_results: "RESULTS",
    nav_results_actas: "Resultados con Venezuela",
    nav_results_macedonia: "MacedoniaDelNorte",

    // Header
    status_live: "LIVE",
    hero_country: "Venezuela | Presidential Election 2024",
    hero_title: "Legal Deadlines Breached",
    hero_subtitle: "Verifiable evidence on CNE totals, actas, and audits",

    // Mission
    mission_text: {
      prefix:
        "This observatory compiles verifiable facts on missed deadlines and obligations under the ",
      highlight: "Organic Law of Electoral Processes (LOPRE)",
      suffix: ". Each point links the legal basis and a primary source.",
    },
    mission_proof_label: "Primary source:",
    mission_proof_link: "CNE official site (archive)",

    // Key claims
    key_claims_title: "Key verifiable claims",
    key_claims_subtitle: "Each claim links a legal basis and a source.",
    key_claims_impact: "Impact: without published actas and completed audits, results cannot be independently verified.",
    key_claim_1_title: "Totalization beyond deadline",
    key_claim_1_text: "Article 146 of LOPRE sets a maximum of 48 hours for totalization and scrutiny.",
    key_claim_1_law: "Article 146 LOPRE",
    key_claim_1_source: "CNE: totalization",
    key_claim_2_title: "Electoral Gazette beyond deadline",
    key_claim_2_text: "Article 155 of LOPRE requires official publication within 30 days.",
    key_claim_2_law: "Article 155 LOPRE",
    key_claim_2_source: "CNE: electoral schedule",
    key_claim_3_title: "Post-election audits not performed",
    key_claim_3_text: "Post-election verification includes technical audits defined by the CNE.",
    key_claim_3_law: "CNE: system audits",
    key_claim_3_source: "Report: Prensa Comunitaria",
    counter_claims_title: "Counter-claims and verification",
    counter_claims_subtitle: "Common assertions and what public verification requires.",
    counter_claim_1_label: "Common claim",
    counter_claim_1_claim: "\"The results are final.\"",
    counter_claim_1_verify_label: "Verification needed",
    counter_claim_1_verify: "Independent verification requires precinct-level actas and completed post-election audits.",
    counter_claim_1_source_1: "CNE: totalization",
    counter_claim_1_source_2: "CNE: audits",
    counter_claim_2_label: "Common claim",
    counter_claim_2_claim: "\"Publication in the Gazette is not a priority.\"",
    counter_claim_2_verify_label: "Verification needed",
    counter_claim_2_verify: "LOPRE sets a maximum of 30 days for official publication.",
    counter_claim_2_source_1: "Article 155 LOPRE",
    counter_claim_2_source_2: "CNE: electoral schedule",
    counter_claim_3_label: "Common claim",
    counter_claim_3_claim: "\"Post-election audits were conducted.\"",
    counter_claim_3_verify_label: "Verification needed",
    counter_claim_3_verify: "The CNE itself describes the audits; external reports state they did not occur.",
    counter_claim_3_source_1: "CNE: audits",
    counter_claim_3_source_2: "Report: Prensa Comunitaria",

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
    timeline_3_date: "July 29-31",
    timeline_3_title: "Telecommunications Audit Phase II",
    timeline_3_text: "It should have compared transmission configuration with the pre-election audit and reviewed logs. It did not occur; it was suspended after alleging a \"cyberattack\".",
    timeline_4_date: "July 30",
    timeline_4_title: "First Deadline Violated",
    timeline_4_text: "The 48-hour legal deadline (Art. 146 LOPRE) for totalization expires. No official minutes are published.",
    timeline_5_date: "August 2",
    timeline_5_title: "Citizen Verification Phase II",
    timeline_5_text: "A random 1% sample of machines was due to verify that software was not altered and transmission was correct. It was not carried out.",
    timeline_6_date: "August 2",
    timeline_6_title: "Baseless Bulletin",
    timeline_6_text: "The CNE issues a second bulletin awarding victory without presenting a single scrutiny minute.",
    timeline_7_date: "August 5-8",
    timeline_7_title: "Electoral Data Audit Phase II",
    timeline_7_text: "It should have verified the fingerprint database (quality and duplicates) and its consistency with the electoral register. It did not occur.",
    timeline_8_date: "August 29",
    timeline_8_title: "Second Deadline Violated",
    timeline_8_text: "The 30-day deadline (Art. 155 LOPRE) for publication in the Electoral Gazette expires. The breach is definitively consummated.",

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

const DEFAULT_LANG = 'es';
const PAGE_TITLES = {
  es: 'Monitoreo de Infracciones Legales Electorales - CNE Venezuela',
  en: 'Legal Compliance Observatory - CNE Venezuela',
};
const HIGHLIGHT_OBSERVER_OPTIONS = { threshold: 1.0 };
let highlightObserver = null;

function getSafeLang(lang) {
  return translations[lang] ? lang : DEFAULT_LANG;
}

function getPageTitle(lang) {
  return PAGE_TITLES[lang] || PAGE_TITLES[DEFAULT_LANG];
}

function getHighlightObserver() {
  if (!('IntersectionObserver' in window)) {
    return null;
  }

  if (!highlightObserver) {
    highlightObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, HIGHLIGHT_OBSERVER_OPTIONS);
  }

  return highlightObserver;
}

function observeHighlights(root = document) {
  const highlights = root.querySelectorAll('.highlight-text');
  if (!highlights.length) {
    return;
  }

  const observer = getHighlightObserver();
  highlights.forEach((element) => {
    if (!observer) {
      element.classList.add('active');
      return;
    }
    observer.observe(element);
  });
}

const storedLang = localStorage.getItem('site_lang');
let currentLang = getSafeLang(storedLang);

function setMissionText(element, entry) {
  if (!element) {
    return;
  }

  if (!entry || typeof entry !== 'object') {
    element.textContent = entry || '';
    return;
  }

  element.textContent = '';
  element.append(document.createTextNode(entry.prefix || ''));
  const strong = document.createElement('strong');
  strong.className = 'highlight-text';
  strong.textContent = entry.highlight || '';
  element.append(strong);
  element.append(document.createTextNode(entry.suffix || ''));
}

function updateLanguage(lang) {
  const resolvedLang = getSafeLang(lang);
  const langTranslations = translations[resolvedLang];

  document.documentElement.lang = resolvedLang;

  // Update all marked elements
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!Object.prototype.hasOwnProperty.call(langTranslations, key)) {
      return;
    }

    if (key === 'mission_text') {
      setMissionText(el, langTranslations[key]);
    } else if (key.startsWith('org_')) {
      // For inline spans we just set textContent
      el.textContent = langTranslations[key];
    } else {
      el.textContent = langTranslations[key];
    }
  });

  observeHighlights();

  // Update Toggle Button
  const toggleBtn = document.getElementById('toggleLang');
  if (toggleBtn) {
    toggleBtn.textContent = resolvedLang === 'es' ? 'ES' : 'EN';
  }

  document.title = getPageTitle(resolvedLang);

  localStorage.setItem('site_lang', resolvedLang);
  currentLang = resolvedLang;
}

// 3. Updated "Tab Signal" & Init
document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    document.title = "⚠️ Tiempo Agotado - CNE Venezuela";
  } else {
    document.title = getPageTitle(currentLang);
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
