'use strict';

const CNEMonitor = (() => {
  console.log('CNEMonitor module initialized');

  const targetDate1 = new Date('2024-07-30T22:00:00Z');
  const targetDate2 = new Date('2024-08-29T02:00:00Z');
  const counterIntervals = new Map();
  const flipTimeouts = new WeakMap();

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
      numberSpan.className = 'number flip';
      numberSpan.dataset.value = '0';
      const flipCard = document.createElement('span');
      flipCard.className = 'flip-card';
      const top = document.createElement('span');
      top.className = 'flip-top';
      top.textContent = '0';
      const bottom = document.createElement('span');
      bottom.className = 'flip-bottom';
      bottom.textContent = '0';
      const topNext = document.createElement('span');
      topNext.className = 'flip-top flip-next';
      const bottomNext = document.createElement('span');
      bottomNext.className = 'flip-bottom flip-next';
      flipCard.append(top, bottom, topNext, bottomNext);
      numberSpan.appendChild(flipCard);
      const labelNode = document.createTextNode('');
      span.append(numberSpan, labelNode);
      counter.appendChild(span);
      return { span, numberSpan, labelNode };
    });

    function setFlipValue(numberSpan, valueText) {
      const currentValue = numberSpan.dataset.value;
      if (currentValue === valueText) {
        return;
      }

      const top = numberSpan.querySelector('.flip-top');
      const bottom = numberSpan.querySelector('.flip-bottom');
      const topNext = numberSpan.querySelector('.flip-top.flip-next');
      const bottomNext = numberSpan.querySelector('.flip-bottom.flip-next');
      if (!top || !bottom || !topNext || !bottomNext) {
        numberSpan.textContent = valueText;
        numberSpan.dataset.value = valueText;
        return;
      }

      topNext.textContent = valueText;
      bottomNext.textContent = valueText;

      numberSpan.classList.remove('flip-animate');
      void numberSpan.offsetWidth;
      numberSpan.classList.add('flip-animate');

      const pendingTimeout = flipTimeouts.get(numberSpan);
      if (pendingTimeout) {
        window.clearTimeout(pendingTimeout);
      }

      const timeoutId = window.setTimeout(() => {
        top.textContent = valueText;
        bottom.textContent = valueText;
        numberSpan.dataset.value = valueText;
        numberSpan.classList.remove('flip-animate');
        flipTimeouts.delete(numberSpan);
      }, 720);
      flipTimeouts.set(numberSpan, timeoutId);
    }

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
          setFlipValue(numberSpan, valueText);
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
    hero_title: "Dossier del Fraude Electoral en Venezuela",
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

    faq_title: "Contrapuntos y verificación",
    faq_subtitle: "Respuestas rápidas para desmontar los argumentos más trillados del madurismo.",
    faq_q1: "\"Los resultados son definitivos\"",
    faq_q1_a: "La verificación independiente requiere dos elementos legales que no se cumplieron:",
    faq_q1_item1: "Publicación de resultados desagregados mesa por mesa en 48 horas (Art. 146 LOPRE).",
    faq_q1_item2: "Auditorías post-electorales completas (triada obligatoria).",
    faq_q1_note: "Sin esos requisitos, no hay forma de validar los resultados proclamados.",
    faq_q1_link1: "CNE: totalización",
    faq_q1_link2: "CNE: auditorías",
    faq_q2: "\"La publicación en Gaceta no es prioritaria\"",
    faq_q2_a: "La LOPRE fija dos plazos obligatorios, no opcionales:",
    faq_q2_item1: "Art. 146: publicación web en 48 horas.",
    faq_q2_item2: "Art. 155: Gaceta Electoral en 30 días.",
    faq_q2_note: "Ambos plazos están violados.",
    faq_q2_link1: "Art. 155 LOPRE",
    faq_q2_link2: "CNE: cronograma electoral",
    faq_q3: "\"Se realizaron auditorías post-electorales\"",
    faq_q3_a: "El propio CNE define tres auditorías post-electorales obligatorias y ninguna se realizó:",
    faq_q3_item1: "Telecomunicaciones Fase II (29-31 julio) ❌",
    faq_q3_item2: "Verificación Ciudadana Fase II (2 agosto) ❌",
    faq_q3_item3: "Datos Electorales Fase II (5-8 agosto) ❌",
    faq_q3_note: "Sin estas auditorías, no existe verificación técnica independiente.",
    faq_q3_link1: "CNE: auditorías",
    faq_q3_link2: "Reporte: Prensa Comunitaria",
    faq_q3_link3: "CNN: auditorías no realizadas",
    faq_q4: "\"¿No es esto solo política normal de Venezuela?\"",
    faq_q4_a: "No. Incluso en elecciones cuestionadas (2013, 2018) el CNE publicó resultados desagregados en su web. En 2024 es la primera vez que:",
    faq_q4_item1: "No publican NINGÚN resultado desagregado mesa por mesa.",
    faq_q4_item2: "La web del CNE permanece sin datos 160+ días después.",
    faq_q4_item3: "Se suspenden TODAS las auditorías post-electorales obligatorias.",
    faq_q5: "\"¿Por qué debería creer a la oposición venezolana?\"",
    faq_q5_a: "No se trata de creer. Se trata de verificar con evidencia independiente:",
    faq_q5_item1: "Actas ciudadanas verificables con QR, número de serie y sello oficial.",
    faq_q5_item2: "Las actas son válidas con o sin firmas; la validez es técnica, no política.",
    faq_q5_item3: "Análisis estadístico independiente de UCLA, Columbia, Berkeley y U. Michigan.",
    faq_q5_item4: "Centro Carter, ONU, UE y 12+ organismos con metodología propia.",
    faq_q5_note: "Mientras tanto, el CNE no publicó resultados desagregados ni completó la triada de auditorías.",
    faq_q5_link1: "Ver actas ciudadanas",
    faq_q5_link2: "Cómo verificar un acta",
    faq_q6: "\"¿Qué pasa con el hackeo que mencionó el CNE?\"",
    faq_q6_a: "Expertos cuestionan el supuesto hackeo por varias razones:",
    faq_q6_item1: "El sistema no está conectado a internet durante la votación (según CNE).",
    faq_q6_item2: "Las actas físicas impresas no pueden ser hackeadas.",
    faq_q6_item3: "Si hubo ataque, la respuesta legal era hacer auditorías, no suspenderlas.",
    faq_q6_item4: "Las auditorías usan muestras físicas y registros, no solo sistemas digitales.",
    faq_q6_link1: "Análisis del supuesto hackeo",
    faq_q6_link2: "Protocolos de auditoría CNE",
    faq_q7: "\"¿No es el Centro Carter una organización parcial?\"",
    faq_q7_a: "El Centro Carter ha observado 113 elecciones en 39 países y validó ganadores de todo el espectro político.",
    faq_q7_b: "Es la primera vez que declara que una elección no puede considerarse democrática.",
    faq_q7_link1: "Declaración del Centro Carter (2024)",
    faq_q8: "\"¿Qué son exactamente las auditorías post-electorales y por qué importan?\"",
    faq_q8_a: "Son verificaciones técnicas obligatorias después de la elección. La triada post-electoral incluye:",
    faq_q8_item1: "Telecomunicaciones Fase II: integridad de transmisión.",
    faq_q8_item2: "Verificación Ciudadana Fase II: comparación de actas físicas con transmisión digital.",
    faq_q8_item3: "Datos Electorales Fase II: integridad del registro y huellas.",
    faq_q8_link1: "Protocolos de auditorías del CNE",

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
    hero_title: "Electoral Fraud Dossier in Venezuela",
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

    faq_title: "Counter-claims and verification",
    faq_subtitle: "Quick answers to dismantle the regime's most recycled talking points.",
    faq_q1: "\"The results are final\"",
    faq_q1_a: "Independent verification requires two legal elements that were not met:",
    faq_q1_item1: "Publication of precinct-level results within 48 hours (Art. 146 LOPRE).",
    faq_q1_item2: "Completed post-election audits (mandatory triad).",
    faq_q1_note: "Without these, the proclaimed results cannot be independently validated.",
    faq_q1_link1: "CNE: totalization",
    faq_q1_link2: "CNE: audits",
    faq_q2: "\"Publication in the Gazette is not a priority\"",
    faq_q2_a: "LOPRE sets two mandatory deadlines, not optional:",
    faq_q2_item1: "Art. 146: web publication within 48 hours.",
    faq_q2_item2: "Art. 155: Electoral Gazette within 30 days.",
    faq_q2_note: "Both legal deadlines were violated.",
    faq_q2_link1: "Art. 155 LOPRE",
    faq_q2_link2: "CNE: electoral schedule",
    faq_q3: "\"Post-election audits were conducted\"",
    faq_q3_a: "The CNE itself defines three mandatory post-election audits, and none took place:",
    faq_q3_item1: "Telecommunications Phase II (Jul 29-31) ❌",
    faq_q3_item2: "Citizen Verification Phase II (Aug 2) ❌",
    faq_q3_item3: "Electoral Data Phase II (Aug 5-8) ❌",
    faq_q3_note: "Without these audits, there is no independent technical verification.",
    faq_q3_link1: "CNE: audits",
    faq_q3_link2: "Report: Prensa Comunitaria",
    faq_q3_link3: "CNN: audits not conducted",
    faq_q4: "\"Isn't this just normal Venezuelan politics?\"",
    faq_q4_a: "No. Even in contested elections (2013, 2018), the CNE published precinct-level results. In 2024, for the first time:",
    faq_q4_item1: "No precinct-level results were published at all.",
    faq_q4_item2: "The CNE website remains without data 160+ days later.",
    faq_q4_item3: "All mandatory post-election audits were suspended.",
    faq_q5: "\"Why should I believe the opposition?\"",
    faq_q5_a: "This is not about belief. It's about independent evidence:",
    faq_q5_item1: "Citizen actas are verifiable with QR code, serial number, and official seal.",
    faq_q5_item2: "Actas are valid with or without signatures; validity is technical, not political.",
    faq_q5_item3: "Independent statistical analyses by UCLA, Columbia, Berkeley, and U. Michigan.",
    faq_q5_item4: "Carter Center, UN, EU and 12+ bodies using their own methodology.",
    faq_q5_note: "Meanwhile, the CNE published no precinct-level results and suspended the audit triad.",
    faq_q5_link1: "See citizen actas",
    faq_q5_link2: "How to verify an acta",
    faq_q6: "\"What about the hack the CNE mentioned?\"",
    faq_q6_a: "Experts question the hacking claim for several reasons:",
    faq_q6_item1: "The system is not connected to the internet during voting (per CNE).",
    faq_q6_item2: "Printed actas cannot be hacked.",
    faq_q6_item3: "If there was an attack, the legal response was to conduct audits, not suspend them.",
    faq_q6_item4: "Audits rely on physical samples and logs, not only digital systems.",
    faq_q6_link1: "Analysis of the alleged hack",
    faq_q6_link2: "CNE audit protocols",
    faq_q7: "\"Isn't the Carter Center biased?\"",
    faq_q7_a: "The Carter Center has observed 113 elections in 39 countries and validated winners across the political spectrum.",
    faq_q7_b: "This is the first time in its history it declares an election non-democratic.",
    faq_q7_link1: "Carter Center statement (2024)",
    faq_q8: "\"What are post-election audits and why do they matter?\"",
    faq_q8_a: "They are mandatory technical checks after election day. The post-election triad includes:",
    faq_q8_item1: "Telecommunications Phase II: transmission integrity.",
    faq_q8_item2: "Citizen Verification Phase II: compare physical actas with digital transmission.",
    faq_q8_item3: "Electoral Data Phase II: registry and fingerprint integrity.",
    faq_q8_link1: "CNE audit protocols",

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
