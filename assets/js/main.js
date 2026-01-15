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

  function buildOdometer(numberSpan, valueText) {
    numberSpan.textContent = '';
    numberSpan.classList.add('odometer');
    numberSpan.dataset.value = valueText;
    numberSpan.dataset.digits = String(valueText.length);
    numberSpan.dataset.ready = 'false';

    valueText.split('').forEach((digitChar) => {
      const digit = document.createElement('span');
      digit.className = 'odometer-digit';
      const roller = document.createElement('span');
      roller.className = 'odometer-roller';
      for (let i = 0; i < 10; i += 1) {
        const num = document.createElement('span');
        num.className = 'odometer-number';
        num.textContent = String(i);
        roller.appendChild(num);
      }
      roller.style.transform = `translateY(-${Number(digitChar) || 0}em)`;
      digit.appendChild(roller);
      numberSpan.appendChild(digit);
    });

    window.requestAnimationFrame(() => {
      numberSpan.dataset.ready = 'true';
    });
  }

  function updateOdometer(numberSpan, valueText) {
    const currentValue = numberSpan.dataset.value || '';
    const needsRebuild =
      !numberSpan.classList.contains('odometer') ||
      numberSpan.dataset.digits !== String(valueText.length);

    if (needsRebuild) {
      buildOdometer(numberSpan, valueText);
      return;
    }

    const digits = numberSpan.querySelectorAll('.odometer-digit');
    valueText.split('').forEach((digitChar, index) => {
      const digit = digits[index];
      if (!digit) {
        return;
      }
      const roller = digit.querySelector('.odometer-roller');
      if (!roller) {
        return;
      }
      const digitValue = Number(digitChar) || 0;
      roller.style.transform = `translateY(-${digitValue}em)`;
    });

    numberSpan.dataset.value = valueText;
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
          const valueText = index >= 1 ? String(value).padStart(2, '0') : String(value);
          const labelText = ` ${value === 1 ? singular : plural}`;
          updateOdometer(numberSpan, valueText);
          if (labelNode.textContent !== labelText) {
            labelNode.textContent = labelText;
          }
        });

        if (elementId === 'counter2') {
          updateHeroSuptitle(days);
        }

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
    nav_evidence: "LA EVIDENCIA",
    nav_evidence_timeline: "Cronología completa",
    nav_evidence_audits: "Auditorías post-electorales",
    nav_evidence_analysis: "Análisis estadísticos",
    nav_evidence_actas: "Actas ciudadanas verificables",
    nav_evidence_press_kit: "Kit para prensa",
    nav_evidence_results_header: "Resultados y actas",
    nav_evidence_analysis_header: "Análisis estadísticos",
    nav_context: "CONTEXTO",
    nav_context_system: "Sistema Electoral Venezolano 101",
    nav_context_deadlines: "Plazos legales incumplidos",
    nav_context_background_header: "Antecedentes 2018-2024",
    nav_context_cne_header: "Documentación CNE (Archive.org)",
    nav_context_legal_header: "Recursos legales",
    nav_international_section: "Comunidad internacional (sección)",
    nav_verification_section: "Contrapuntos y verificación",
    nav_verification_how: "Cómo verificar",
    nav_action: "QUÉ PUEDES HACER",
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
    nav_international: "COMUNIDAD INTERNACIONAL",
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
    hero_country: "Elecciones Presidenciales 2024",
    hero_suptitle:
      "Última verificación: {{date}} · {{days}} días sin resultados desagregados publicados (CNE, archivo)",
    hero_title: "Incumplimientos verificables del CNE — Elecciones 2024",
    hero_subtitle: "Normas, plazos y evidencia primaria para auditar la transparencia electoral",
    cred_docs: "Documentos oficiales/legales enlazados: {{count}}",
    cred_update: "Última actualización de datos: {{date}}",
    cred_corrections: "Correcciones: GitHub Issues",
    hero_stat_1: "25,000+ actas ciudadanas verificables / 0 resultados oficiales desagregados publicados",
    hero_stat_1_source_primary: "Resultados con Venezuela",
    hero_stat_1_source_archive: "CNE (archivo)",
    hero_stat_2: "Organismos internacionales reportan falta de transparencia e integridad",
    hero_stat_2_source_carter: "Centro Carter",
    hero_stat_2_source_un: "Panel ONU",
    hero_stat_2_source_eu: "Unión Europea",
    hero_stat_2_source_oas: "OEA",
    hero_stat_3: "Plazos legales vencidos + auditorías post-electorales sin evidencia pública",
    hero_stat_3_source_lopre: "LOPRE (Art. 146/155)",
    hero_stat_3_source_audits: "Protocolos CNE (archivo)",
    hero_stat_3_source_press: "Prensa Comunitaria",
    methodology_title: "Metodología de verificación",
    methodology_text: "Cada afirmación enlaza norma legal, evidencia pública y fuente primaria.",
    methodology_link: "Ver cómo verificamos",
    source_label: "Fuente primaria:",
    source_archive_label: "Archivo:",
    sources_label: "Fuentes:",

    // Mission
    mission_text: {
      prefix: "Este observatorio documenta incumplimientos verificables del CNE según la ",
      highlight: "Ley Orgánica de Procesos Electorales (LOPRE)",
      suffix:
        ", y enlaza cada afirmación con su fuente primaria. La verificación es replicable: cualquiera puede contrastar actas, plazos y auditorías.",
    },
    mission_proof_label: "Fuente primaria:",
    mission_proof_link: "Sitio oficial del CNE (archivo)",

    // Start Here
    start_here_title: "Si solo tienes 3 minutos: ¿Qué pasó y cómo verificarlo?",
    start_here_block1_label: "Qué pasó",
    start_here_block1_text:
      "El 28 de julio de 2024 el CNE detuvo la transmisión y la web oficial quedó fuera de línea. Desde entonces no se publicaron resultados desagregados mesa por mesa dentro del plazo legal.",
    start_here_block1_source: "Sitio oficial del CNE (archivo)",
    start_here_block2_label: "Por qué importa",
    start_here_block2_text:
      "La LOPRE exige resultados desagregados en 48 horas y publicación en Gaceta en 30 días. Sin esos datos, la verificación pública de la totalización queda incompleta.",
    start_here_block2_source: "Ley Orgánica de Procesos Electorales (LOPRE)",
    start_here_block2_link: "Ver actas ciudadanas",
    start_here_block3_label: "Qué puedes verificar",
    start_here_block3_text:
      "Puedes contrastar actas físicas con bases ciudadanas, revisar protocolos de auditoría y comparar cronogramas oficiales.",
    start_here_block3_source: "Protocolos de auditoría CNE (archivo)",
    start_here_block3_link: "Ir a auditorías post-electorales",
    start_here_cta: "Explorar toda la evidencia ↓",

    // Deadlines
    deadlines_title: "Plazos legales incumplidos",
    deadlines_subtitle:
      "La LOPRE exige publicar resultados desagregados en 48 horas y la Gaceta Electoral en 30 días. Ambos plazos están vencidos.",

    faq_title: "Contrapuntos y verificación",
    faq_subtitle: "Respuestas basadas en evidencia verificable y en el marco legal vigente.",
    faq_q1: "¿Son definitivos los resultados anunciados?",
    faq_q1_a: "Los resultados solo pueden considerarse definitivos cuando se cumplen los requisitos legales de publicación y verificación:",
    faq_q1_item1: "Publicación de resultados desagregados mesa por mesa en 48 horas (Art. 146 LOPRE).",
    faq_q1_item2: "Ejecución de las auditorías post-electorales previstas en los protocolos del CNE.",
    faq_q1_note: "Sin esos pasos, los resultados anunciados no pueden validarse de forma independiente.",
    faq_q1_link1: "CNE: totalización",
    faq_q1_link2: "CNE: auditorías",
    faq_q2: "¿La publicación en Gaceta Electoral es opcional o secundaria?",
    faq_q2_a: "No. La LOPRE establece plazos obligatorios tanto para la publicación web como para la Gaceta Electoral:",
    faq_q2_item1: "Art. 146: publicación web en 48 horas.",
    faq_q2_item2: "Art. 155: publicación en Gaceta Electoral en 30 días.",
    faq_q2_note: "Son obligaciones distintas y exigibles; una no reemplaza a la otra.",
    faq_q2_link1: "Art. 155 LOPRE",
    faq_q2_link2: "CNE: cronograma electoral",
    faq_q3: "¿Se realizaron las auditorías post-electorales obligatorias?",
    faq_q3_a: "Los protocolos del CNE establecen tres auditorías post-electorales obligatorias; no hay constancia pública de su ejecución:",
    faq_q3_item1: "Telecomunicaciones Fase II (29-31 julio).",
    faq_q3_item2: "Verificación Ciudadana Fase II (2 agosto).",
    faq_q3_item3: "Datos Electorales Fase II (5-8 agosto).",
    faq_q3_note: "Reportes independientes indican suspensión; sin ellas no hay verificación técnica independiente.",
    faq_q3_link1: "CNE: auditorías",
    faq_q3_link2: "Reporte: Prensa Comunitaria",
    faq_q3_link3: "CNN: auditorías no realizadas",
    faq_q4: "¿Esto es comparable a elecciones anteriores en Venezuela?",
    faq_q4_a: "No. En elecciones anteriores, incluso cuestionadas, el CNE publicó resultados desagregados en su web.",
    faq_q4_item1: "En 2024 no hay publicación mesa por mesa.",
    faq_q4_item2: "La web oficial sigue sin esos datos meses después.",
    faq_q4_item3: "Las auditorías post-electorales obligatorias no se ejecutaron.",
    faq_q5: "¿Esto depende de creer a la oposición venezolana?",
    faq_q5_a: "No. La evaluación se basa en evidencia verificable y normas públicas, no en la credibilidad de actores políticos:",
    faq_q5_item1: "Actas verificables con QR, número de serie y sello oficial.",
    faq_q5_item2: "Plazos legales y obligaciones del CNE (LOPRE).",
    faq_q5_item3: "Protocolos de auditoría con evidencia técnica.",
    faq_q5_item4: "Observación y análisis independiente (Centro Carter, ONU, UE, universidades).",
    faq_q5_note: "La verificación es replicable: cualquiera puede contrastar actas y fuentes.",
    faq_q5_link1: "Ver actas ciudadanas",
    faq_q5_link2: "Cómo verificar un acta",
    faq_q6: "¿Qué significa el alegato de \"hackeo\" del CNE?",
    faq_q6_a: "El alegato de \"hackeo\" no sustituye la verificación técnica ni las auditorías obligatorias:",
    faq_q6_item1: "Según la documentación del CNE, el sistema no está conectado a internet durante la votación.",
    faq_q6_item2: "Las actas físicas permiten contrastar los datos transmitidos.",
    faq_q6_item3: "La respuesta técnica ante un incidente es ejecutar auditorías, no suspenderlas.",
    faq_q6_item4: "Las auditorías usan muestras físicas y registros verificables.",
    faq_q6_link1: "Análisis del supuesto hackeo",
    faq_q6_link2: "Protocolos de auditoría CNE",
    faq_q10: "¿Un acta sin firma pierde validez?",
    faq_q10_a: "No. La validez de un acta depende de elementos técnicos verificables; la firma es un respaldo, no un requisito:",
    faq_q10_item1: "Código QR único con datos cifrados.",
    faq_q10_item2: "Número de serie de la máquina.",
    faq_q10_item3: "Sello oficial y resultados impresos.",
    faq_q10_item4: "Coherencia con otras actas del mismo centro.",
    faq_q10_note: "Esto evita que la negativa de firmar anule un acta válida y protege la evidencia.",
    faq_q10_link1: "Ver actas ciudadanas",
    faq_q10_link2: "Cómo verificar un acta",
    faq_q7: "¿Es imparcial el Centro Carter?",
    faq_q7_a: "El Centro Carter es un observador electoral independiente y reconocido internacionalmente; ha observado 113 elecciones en 39 países.",
    faq_q7_b: "Su evaluación se basa en estándares técnicos internacionales y es la primera vez que declara que una elección no puede considerarse democrática.",
    faq_q7_link1: "Declaración del Centro Carter (2024)",
    faq_q8: "¿Qué son las auditorías post-electorales y por qué importan?",
    faq_q8_a: "Son controles técnicos posteriores a la elección que verifican la integridad de la transmisión, las actas y el registro.",
    faq_q8_item1: "Telecomunicaciones Fase II: integridad de transmisión y registros.",
    faq_q8_item2: "Verificación Ciudadana Fase II: comparación de actas físicas con datos transmitidos.",
    faq_q8_item3: "Datos Electorales Fase II: integridad del registro y huellas.",
    faq_q8_link1: "Protocolos de auditorías del CNE",
    faq_q9: "¿Puede el TSJ sustituir las obligaciones legales del CNE?",
    faq_q9_a: "No. La ley asigna al CNE la obligación de publicar resultados y ejecutar auditorías; una sentencia no reemplaza esos procedimientos.",
    faq_q9_item1: "La publicación desagregada y la Gaceta tienen plazos legales (Art. 146 y 155 LOPRE).",
    faq_q9_item2: "Las auditorías generan evidencia técnica (actas, registros, muestras) que una decisión judicial no crea.",
    faq_q9_item3: "Sin esa evidencia, la verificación pública queda incompleta.",
    faq_q9_link1: "LOPRE (Art. 146 y 155)",
    faq_q9_link2: "Protocolos de auditoría CNE",

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
    timeline_intro:
      "Cada hito incluye: hecho observado, obligación legal, fuente primaria, estado de evidencia y fecha de verificación.",
    timeline_cta: "Ver evidencia relacionada",
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
    timeline_4_text:
      "Vence el lapso legal de 48 horas (Art. 146 LOPRE) para la totalización. No se publican resultados desagregados mesa por mesa.",
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

    // Sistema Electoral 101
    system_title: "Sistema Electoral Venezolano 101",
    system_subtitle: "Cómo debería funcionar según el propio CNE y qué se rompió en 2024.",
    system_expected_label: "Cómo debería funcionar",
    system_expected_step1: "El votante sufraga en la máquina.",
    system_expected_step2: "La máquina imprime el comprobante y se deposita en la caja.",
    system_expected_step3: "Al cierre, la máquina imprime el acta con resultados (QR, número de serie, sello oficial).",
    system_expected_step4: "El acta física queda en la mesa para auditorías.",
    system_expected_step5: "La máquina transmite los resultados al CNE.",
    system_expected_step6: "El CNE publica resultados desagregados en 48 horas (Art. 146 LOPRE).",
    system_expected_step7: "Se ejecutan las tres auditorías post-electorales obligatorias.",
    system_expected_step8: "Se publica la Gaceta Electoral en 30 días (Art. 155 LOPRE).",
    system_actual_label: "Qué pasó en 2024",
    system_actual_step1: "La votación y las actas físicas se emitieron normalmente.",
    system_actual_step2: "La transmisión se detuvo el 28/07 a las 10 PM.",
    system_actual_step3: "La web del CNE se apagó y nunca publicó resultados desagregados.",
    system_actual_step4: "Las tres auditorías post-electorales fueron suspendidas.",
    system_actual_step5: "No hubo publicación en Gaceta Electoral dentro del plazo legal.",

    // Auditorías
    audits_title: "Las Auditorías Post-Electorales: La Triada de Verificación",
    audits_subtitle: "Tres auditorías obligatorias definidas por el propio CNE. Ninguna se realizó.",
    audit1_date: "29-31 de julio",
    audit1_title: "Telecomunicaciones Fase II",
    audit1_status: "Estado: NO realizada",
    audit1_point1: "Verifica que la transmisión no fue alterada.",
    audit1_point2: "Compara registros con la auditoría pre-electoral.",
    audit1_point3: "Confirma que no hubo intervención externa.",
    audit2_date: "2 de agosto",
    audit2_title: "Verificación Ciudadana Fase II",
    audit2_status: "Estado: NO realizada",
    audit2_point1: "Compara actas físicas con transmisión digital.",
    audit2_point2: "Revisa una muestra aleatoria de máquinas (1%).",
    audit2_point3: "Es la verificación más directa de integridad.",
    audit3_date: "5-8 de agosto",
    audit3_title: "Datos Electorales Fase II",
    audit3_status: "Estado: NO realizada",
    audit3_point1: "Verifica la base de huellas y duplicidades.",
    audit3_point2: "Comprueba integridad del registro electoral.",
    audit3_point3: "Detecta votación múltiple o inconsistencias.",
    audits_cne_link: "Protocolos CNE",
    audits_note:
      "El CNE alegó un \"ataque informático\", pero las auditorías trabajan con evidencia física y son el mecanismo legal para verificar resultados.",
    audits_hack_link: "Análisis del supuesto hackeo",
    audits_report_pc: "Prensa Comunitaria",
    audits_report_cnn: "CNN: auditorías no realizadas",

    // Actas ciudadanas
    actas_title: "Actas ciudadanas verificables",
    actas_subtitle:
      "Las actas físicas (QR, serial, sello) permiten verificación independiente. Sin resultados desagregados oficiales, la totalización no es auditable.",
    actas_body_1:
      "Cada acta tiene código QR único, número de serie y sello oficial. Son válidas con o sin firmas, precisamente para evitar sabotaje. La oposición recolectó 84% de las actas el día de la elección.",
    actas_body_2:
      "Cualquier persona puede contrastar las actas con los resultados publicados por organizaciones ciudadanas independientes.",
    actas_cta_primary: "Ver actas ciudadanas",
    actas_cta_secondary: "Ver MacedoniaDelNorte",
    actas_verify_title: "Cómo verificar un acta",
    actas_verify_step1: "Código QR único con datos cifrados.",
    actas_verify_step2: "Número de serie de la máquina.",
    actas_verify_step3: "Sello oficial y resultados impresos.",
    actas_verify_step4: "Comparación con bases de datos ciudadanas.",
    actas_verify_link: "Guía para verificar actas",

    // Cómo verificar
    verify_title: "Cómo verificar por ti mismo",
    verify_subtitle:
      "Tres pasos para contrastar actas, plazos y auditorías con fuentes primarias.",
    verify_step1:
      "Ubica el acta física (QR, número de serie, sello oficial) y su mesa.",
    verify_step2:
      "Cruza el acta con bases ciudadanas y resultados publicados.",
    verify_step3:
      "Revisa si se cumplieron plazos legales y auditorías post-electorales.",
    verify_cta_actas: "Ver actas ciudadanas",
    verify_cta_guide: "Guía para verificar actas",
    verify_checklist_title: "Checklist de verificación",
    verify_check1: "Resultados desagregados en 48 horas (Art. 146 LOPRE).",
    verify_check2: "Publicación en Gaceta Electoral en 30 días (Art. 155 LOPRE).",
    verify_check3: "Auditorías post-electorales obligatorias ejecutadas.",
    verify_cta_schedule: "Ver cronograma oficial",
    verify_cta_audits: "Ver protocolos de auditoría",

    // Análisis estadísticos
    analysis_title: "Análisis estadísticos independientes",
    analysis_subtitle:
      "Cuatro expertos de UCLA, UC Berkeley, Columbia y Michigan encontraron patrones incompatibles con una elección normal.",
    analysis_tao_title: "Dr. Terence Tao (UCLA)",
    analysis_tao_text: "Encontró patrones matemáticamente imposibles en la distribución de votos.",
    analysis_kronick_title: "Dorothy Kronick (UC Berkeley)",
    analysis_kronick_text: "Detectó anomalías en la distribución y patrones históricos.",
    analysis_gelman_title: "Andrew Gelman (Columbia)",
    analysis_gelman_text: "Señales estadísticas asociadas a manipulación de resultados.",
    analysis_mebane_title: "Walter Mebane (U. Michigan)",
    analysis_mebane_text: "Análisis forense electoral con irregularidades consistentes.",
    analysis_read_link: "Leer análisis",

    // International
    international_title: "Evaluaciones internacionales sobre transparencia e integridad del proceso",
    international_intro:
      "Organismos con metodologías independientes coinciden: el proceso no cumplió estándares democráticos básicos.",
    card_carter_title: "Centro Carter",
    card_carter_text: "\"La elección de Venezuela no se adecuó a parámetros internacionales y no puede ser considerada democrática.\"",
    btn_read_report: "Leer Informe",
    card_un_title: "Panel de Expertos ONU",
    card_un_text: "\"En síntesis, el proceso de gestión de resultados del CNE no cumplió con las medidas básicas de transparencia e integridad necesarias para elecciones creíbles.\"",
    btn_read_statement: "Leer Comunicado",
    card_eu_title: "Unión Europea",
    card_eu_text: "\"Los resultados hechos públicos el 2 de agosto por la CNE no pueden reconocerse sin pruebas que los respalden.\"",
    btn_view_declaration: "Ver Declaración",
    card_oas_title: "OEA",
    card_oas_text: "\"El manual completo del manejo doloso del resultado electoral fue aplicado en Venezuela la noche del domingo, en muchos casos de manera muy rudimentaria.\"",
    btn_view_communique: "Ver Comunicado",

    // Action
    action_title: "Qué puedes hacer",
    action_text: "Ayuda a compartir evidencia verificable y fuentes primarias.",
    action_share_btn: "Compartir evidencia",
    action_actas_btn: "Ver actas ciudadanas",
    action_github_btn: "Código abierto",

    // Share & Footer
    share_title: "Comparte evidencia verificable",
    press_kit_title: "Kit para prensa",
    press_kit_subtitle: "Resumen descargable con datos clave, fuentes y cronologia.",
    press_kit_item1: "Resumen ejecutivo con narrativa verificable.",
    press_kit_item2: "Plazos legales y auditorias post-electorales.",
    press_kit_item3: "Fuentes primarias enlazadas y actas ciudadanas.",
    press_kit_cta_download: "Descargar kit (MD)",
    press_kit_cta_repo: "Repositorio",
    press_kit_contents_title: "Incluye",
    press_kit_content1: "Resumen ES/EN listo para citar.",
    press_kit_content2: "Checklist de verificacion.",
    press_kit_content3: "Referencias con enlaces directos.",
    footer_rights: "Observatorio Electoral Ciudadano. Este sitio no está afiliado al CNE.",
    footer_opensource: "Código Abierto / Open Source"
  },
  en: {
    // Nav
    nav_home: "HOME",
    nav_evidence: "EVIDENCE",
    nav_evidence_timeline: "Full timeline",
    nav_evidence_audits: "Post-election audits",
    nav_evidence_analysis: "Statistical analysis",
    nav_evidence_actas: "Citizen actas",
    nav_evidence_press_kit: "Press kit",
    nav_evidence_results_header: "Results and actas",
    nav_evidence_analysis_header: "Statistical analysis",
    nav_context: "CONTEXT",
    nav_context_system: "Venezuelan Electoral System 101",
    nav_context_deadlines: "Missed legal deadlines",
    nav_context_background_header: "Background 2018-2024",
    nav_context_cne_header: "CNE Documentation (Archive.org)",
    nav_context_legal_header: "Legal resources",
    nav_international_section: "International community (section)",
    nav_verification_section: "Verification and counterpoints",
    nav_verification_how: "How to verify",
    nav_action: "WHAT YOU CAN DO",
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
    nav_international: "INTERNATIONAL COMMUNITY",
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
    hero_country: "Presidential Election 2024",
    hero_suptitle:
      "Last verified: {{date}} · {{days}} days without published precinct-level results (CNE, archive)",
    hero_title: "Verifiable CNE breaches — 2024 Election",
    hero_subtitle: "Rules, deadlines, and primary evidence to audit electoral transparency",
    cred_docs: "Official/legal documents linked: {{count}}",
    cred_update: "Last data update: {{date}}",
    cred_corrections: "Corrections: GitHub Issues",
    hero_stat_1: "25,000+ citizen actas verified / 0 official precinct-level results published",
    hero_stat_1_source_primary: "Resultados con Venezuela",
    hero_stat_1_source_archive: "CNE archive",
    hero_stat_2: "International bodies report transparency and integrity failures",
    hero_stat_2_source_carter: "Carter Center",
    hero_stat_2_source_un: "UN Panel",
    hero_stat_2_source_eu: "European Union",
    hero_stat_2_source_oas: "OAS",
    hero_stat_3: "Legal deadlines expired + post-election audits without public evidence",
    hero_stat_3_source_lopre: "LOPRE (Art. 146/155)",
    hero_stat_3_source_audits: "CNE protocols (archive)",
    hero_stat_3_source_press: "Prensa Comunitaria",
    methodology_title: "Verification methodology",
    methodology_text: "Each claim links a legal basis, public evidence, and a primary source.",
    methodology_link: "See how we verify",
    source_label: "Primary source:",
    source_archive_label: "Archive:",
    sources_label: "Sources:",

    // Mission
    mission_text: {
      prefix: "This observatory documents verifiable CNE breaches under the ",
      highlight: "Organic Law of Electoral Processes (LOPRE)",
      suffix:
        ", and links every claim to its primary source. Verification is replicable: anyone can cross-check actas, deadlines, and audits.",
    },
    mission_proof_label: "Primary source:",
    mission_proof_link: "CNE official site (archive)",

    // Start Here
    start_here_title: "If you only have 3 minutes: What happened and how to verify it?",
    start_here_block1_label: "What happened",
    start_here_block1_text:
      "On July 28, 2024 the CNE halted transmission and the official website went offline. Since then, precinct-level results have not been published within the legal deadline.",
    start_here_block1_source: "CNE official site (archive)",
    start_here_block2_label: "Why it matters",
    start_here_block2_text:
      "LOPRE requires precinct-level results within 48 hours and Gazette publication within 30 days. Without those, public verification of the totalization is incomplete.",
    start_here_block2_source: "Organic Law of Electoral Processes (LOPRE)",
    start_here_block2_link: "See citizen actas",
    start_here_block3_label: "What you can verify",
    start_here_block3_text:
      "You can cross-check physical actas with citizen databases, review audit protocols, and compare official schedules.",
    start_here_block3_source: "CNE audit protocols (archive)",
    start_here_block3_link: "Go to post-election audits",
    start_here_cta: "Explore all the evidence ↓",

    // Deadlines
    deadlines_title: "Missed legal deadlines",
    deadlines_subtitle:
      "LOPRE requires publishing precinct-level results within 48 hours and the Electoral Gazette within 30 days. Both deadlines were missed.",

    faq_title: "Counterpoints and verification",
    faq_subtitle: "Answers based on verifiable evidence and the applicable legal framework.",
    faq_q1: "Are the announced results definitive?",
    faq_q1_a: "Results can only be considered definitive once the legal publication and verification steps are fulfilled:",
    faq_q1_item1: "Publication of precinct-level results within 48 hours (Art. 146 LOPRE).",
    faq_q1_item2: "Execution of the post-election audits defined in CNE protocols.",
    faq_q1_note: "Without those steps, the announced results cannot be independently validated.",
    faq_q1_link1: "CNE: totalization",
    faq_q1_link2: "CNE: audits",
    faq_q2: "Is publication in the Electoral Gazette optional or secondary?",
    faq_q2_a: "No. LOPRE sets mandatory deadlines for both web publication and the Electoral Gazette:",
    faq_q2_item1: "Art. 146: web publication within 48 hours.",
    faq_q2_item2: "Art. 155: publication in the Electoral Gazette within 30 days.",
    faq_q2_note: "They are distinct and enforceable obligations; one does not replace the other.",
    faq_q2_link1: "Art. 155 LOPRE",
    faq_q2_link2: "CNE: electoral schedule",
    faq_q3: "Were the mandatory post-election audits carried out?",
    faq_q3_a: "CNE protocols establish three mandatory post-election audits; there is no public record of their completion:",
    faq_q3_item1: "Telecommunications Phase II (Jul 29-31).",
    faq_q3_item2: "Citizen Verification Phase II (Aug 2).",
    faq_q3_item3: "Electoral Data Phase II (Aug 5-8).",
    faq_q3_note: "Independent reports indicate suspension; without them there is no independent technical verification.",
    faq_q3_link1: "CNE: audits",
    faq_q3_link2: "Report: Prensa Comunitaria",
    faq_q3_link3: "CNN: audits not conducted",
    faq_q4: "Is this comparable to previous Venezuelan elections?",
    faq_q4_a: "No. In earlier elections, even contested ones, the CNE published precinct-level results on its website.",
    faq_q4_item1: "In 2024 there is no precinct-level publication.",
    faq_q4_item2: "The official site remains without that data months later.",
    faq_q4_item3: "Mandatory post-election audits were not carried out.",
    faq_q5: "Does this depend on believing the opposition?",
    faq_q5_a: "No. The assessment relies on verifiable evidence and public rules, not on trusting political actors:",
    faq_q5_item1: "Actas verifiable by QR code, serial number, and official seal.",
    faq_q5_item2: "Legal deadlines and CNE obligations (LOPRE).",
    faq_q5_item3: "Audit protocols with technical evidence.",
    faq_q5_item4: "Independent observation and analysis (Carter Center, UN, EU, universities).",
    faq_q5_note: "Verification is replicable: anyone can cross-check actas and sources.",
    faq_q5_link1: "See citizen actas",
    faq_q5_link2: "How to verify an acta",
    faq_q6: "What does the CNE's \"hack\" claim mean?",
    faq_q6_a: "The CNE's \"hack\" claim does not replace technical verification or mandatory audits:",
    faq_q6_item1: "CNE documentation states the system is not connected to the internet during voting.",
    faq_q6_item2: "Printed actas allow a direct comparison with transmitted data.",
    faq_q6_item3: "The technical response to an incident is to run audits, not suspend them.",
    faq_q6_item4: "Audits rely on physical samples and verifiable logs.",
    faq_q6_link1: "Analysis of the alleged hack",
    faq_q6_link2: "CNE audit protocols",
    faq_q10: "Does an acta without a signature lose validity?",
    faq_q10_a: "No. An acta's validity depends on verifiable technical elements; a signature is supportive, not required:",
    faq_q10_item1: "Unique QR code with encrypted data.",
    faq_q10_item2: "Machine serial number.",
    faq_q10_item3: "Official seal and printed results.",
    faq_q10_item4: "Consistency with other actas from the same center.",
    faq_q10_note: "This prevents a refusal to sign from voiding a valid acta and protects the evidence.",
    faq_q10_link1: "See citizen actas",
    faq_q10_link2: "How to verify an acta",
    faq_q7: "Is the Carter Center impartial?",
    faq_q7_a: "The Carter Center is an independent, internationally recognized electoral observer; it has observed 113 elections in 39 countries.",
    faq_q7_b: "Its assessment follows international technical standards, and this is the first time it declares an election non-democratic.",
    faq_q7_link1: "Carter Center statement (2024)",
    faq_q8: "What are post-election audits and why do they matter?",
    faq_q8_a: "They are post-election technical checks that verify transmission integrity, actas, and the registry.",
    faq_q8_item1: "Telecommunications Phase II: transmission and log integrity.",
    faq_q8_item2: "Citizen Verification Phase II: compare physical actas with transmitted data.",
    faq_q8_item3: "Electoral Data Phase II: registry and fingerprint integrity.",
    faq_q8_link1: "CNE audit protocols",
    faq_q9: "Can the TSJ replace the CNE's legal obligations?",
    faq_q9_a: "No. The law assigns the CNE the duty to publish results and execute audits; a court ruling does not replace those procedures.",
    faq_q9_item1: "Precinct-level publication and the Gazette have legal deadlines (Art. 146 and 155 LOPRE).",
    faq_q9_item2: "Audits produce technical evidence (actas, logs, samples) that a judicial decision cannot create.",
    faq_q9_item3: "Without that evidence, public verification is incomplete.",
    faq_q9_link1: "LOPRE (Art. 146 and 155)",
    faq_q9_link2: "CNE audit protocols",

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
    timeline_intro:
      "Each milestone includes an observed fact, legal obligation, primary source, evidence status, and verification date.",
    timeline_cta: "See related evidence",
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
    timeline_4_text:
      "The 48-hour legal deadline (Art. 146 LOPRE) for totalization expires. No precinct-level results are published.",
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

    // Electoral System 101
    system_title: "Venezuelan Electoral System 101",
    system_subtitle: "How it should work according to the CNE and what broke in 2024.",
    system_expected_label: "How it should work",
    system_expected_step1: "The voter casts a ballot on the machine.",
    system_expected_step2: "The machine prints a receipt that is deposited.",
    system_expected_step3: "At closing, the machine prints the acta with results (QR, serial number, official seal).",
    system_expected_step4: "The physical acta remains at the precinct for audits.",
    system_expected_step5: "The machine transmits results to the CNE.",
    system_expected_step6: "The CNE publishes precinct-level results within 48 hours (Art. 146 LOPRE).",
    system_expected_step7: "The three mandatory post-election audits are executed.",
    system_expected_step8: "The Electoral Gazette is published within 30 days (Art. 155 LOPRE).",
    system_actual_label: "What happened in 2024",
    system_actual_step1: "Voting and physical actas were produced normally.",
    system_actual_step2: "Transmission stopped on 07/28 at 10 PM.",
    system_actual_step3: "The CNE website went offline and never published precinct-level results.",
    system_actual_step4: "All three post-election audits were suspended.",
    system_actual_step5: "No Electoral Gazette publication within the legal deadline.",

    // Audits
    audits_title: "Post-Election Audits: The Verification Triad",
    audits_subtitle: "Three mandatory audits defined by the CNE itself. None were carried out.",
    audit1_date: "July 29-31",
    audit1_title: "Telecommunications Phase II",
    audit1_status: "Status: NOT conducted",
    audit1_point1: "Verifies transmission integrity.",
    audit1_point2: "Compares logs with the pre-election audit.",
    audit1_point3: "Confirms no external interference.",
    audit2_date: "August 2",
    audit2_title: "Citizen Verification Phase II",
    audit2_status: "Status: NOT conducted",
    audit2_point1: "Compares physical actas to digital transmission.",
    audit2_point2: "Reviews a random 1% machine sample.",
    audit2_point3: "Most direct integrity verification.",
    audit3_date: "August 5-8",
    audit3_title: "Electoral Data Phase II",
    audit3_status: "Status: NOT conducted",
    audit3_point1: "Checks fingerprint database and duplicates.",
    audit3_point2: "Validates electoral registry integrity.",
    audit3_point3: "Detects multiple voting or inconsistencies.",
    audits_cne_link: "CNE protocols",
    audits_note:
      "The CNE cited a \"cyberattack\", but audits rely on physical evidence and are the legal mechanism to verify results.",
    audits_hack_link: "Analysis of the alleged hack",
    audits_report_pc: "Prensa Comunitaria",
    audits_report_cnn: "CNN: audits not conducted",

    // Citizen actas
    actas_title: "Verifiable citizen actas",
    actas_subtitle:
      "Physical actas (QR, serial, seal) allow independent verification. Without official precinct-level results, the totalization is not auditable.",
    actas_body_1:
      "Each acta has a unique QR code, serial number, and official seal. They are valid with or without signatures to prevent sabotage. The opposition collected 84% of actas on election day.",
    actas_body_2:
      "Anyone can compare actas with results published by independent citizen organizations.",
    actas_cta_primary: "See citizen actas",
    actas_cta_secondary: "See MacedoniaDelNorte",
    actas_verify_title: "How to verify an acta",
    actas_verify_step1: "Unique QR code with encrypted data.",
    actas_verify_step2: "Machine serial number.",
    actas_verify_step3: "Official seal and printed results.",
    actas_verify_step4: "Comparison with citizen databases.",
    actas_verify_link: "Guide to verify actas",

    // How to verify
    verify_title: "How to verify it yourself",
    verify_subtitle:
      "Three steps to cross-check actas, deadlines, and audits with primary sources.",
    verify_step1:
      "Locate the physical acta (QR code, serial number, official seal) and its precinct.",
    verify_step2:
      "Cross-check the acta against citizen databases and published results.",
    verify_step3:
      "Confirm whether legal deadlines and post-election audits were fulfilled.",
    verify_cta_actas: "See citizen actas",
    verify_cta_guide: "Guide to verify actas",
    verify_checklist_title: "Verification checklist",
    verify_check1: "Precinct-level results within 48 hours (Art. 146 LOPRE).",
    verify_check2: "Electoral Gazette publication within 30 days (Art. 155 LOPRE).",
    verify_check3: "Mandatory post-election audits completed.",
    verify_cta_schedule: "See official schedule",
    verify_cta_audits: "See audit protocols",

    // Statistical analyses
    analysis_title: "Independent statistical analyses",
    analysis_subtitle:
      "Four experts from UCLA, UC Berkeley, Columbia, and Michigan found patterns incompatible with a normal election.",
    analysis_tao_title: "Dr. Terence Tao (UCLA)",
    analysis_tao_text: "Found mathematically impossible patterns in vote distributions.",
    analysis_kronick_title: "Dorothy Kronick (UC Berkeley)",
    analysis_kronick_text: "Detected anomalies in distributions and historical patterns.",
    analysis_gelman_title: "Andrew Gelman (Columbia)",
    analysis_gelman_text: "Statistical red flags associated with result manipulation.",
    analysis_mebane_title: "Walter Mebane (U. Michigan)",
    analysis_mebane_text: "Forensic electoral analysis with consistent irregularities.",
    analysis_read_link: "Read analysis",

    // International
    international_title: "International assessments of transparency and process integrity",
    international_intro:
      "Organizations with independent methodologies agree: the process failed basic democratic standards.",
    card_carter_title: "The Carter Center",
    card_carter_text: "\"Venezuela's election did not meet international standards and cannot be considered democratic.\"",
    btn_read_report: "Read Report",
    card_un_title: "UN Panel of Experts",
    card_un_text: "\"In sum, the CNE's results management process fell short of the basic transparency and integrity measures essential to holding credible elections.\"",
    btn_read_statement: "Read Statement",
    card_eu_title: "European Union",
    card_eu_text: "\"The results made public by the CNE on August 2 cannot be recognized without evidence to support them.\"",
    btn_view_declaration: "View Declaration",
    card_oas_title: "OAS",
    card_oas_text: "\"The complete manual for fraudulent handling of the electoral result was applied in Venezuela on Sunday night, in many cases in a very rudimentary manner.\"",
    btn_view_communique: "View Communiqué",

    // Action
    action_title: "What you can do",
    action_text: "Help share verifiable evidence and primary sources.",
    action_share_btn: "Share evidence",
    action_actas_btn: "See citizen actas",
    action_github_btn: "Open source",

    // Share & Footer
    share_title: "Share verifiable evidence",
    press_kit_title: "Press kit",
    press_kit_subtitle: "Downloadable summary with key facts, sources, and timeline.",
    press_kit_item1: "Executive summary with verifiable framing.",
    press_kit_item2: "Legal deadlines and post-election audits.",
    press_kit_item3: "Primary sources and citizen actas.",
    press_kit_cta_download: "Download kit (MD)",
    press_kit_cta_repo: "Repository",
    press_kit_contents_title: "Includes",
    press_kit_content1: "ES/EN summary ready to cite.",
    press_kit_content2: "Verification checklist.",
    press_kit_content3: "References with direct links.",
    footer_rights: "Citizen Electoral Observatory. This site is not affiliated with the CNE.",
    footer_opensource: "Open Source"
  }
};

const DEFAULT_LANG = 'es';
const PAGE_TITLES = {
  es: 'Incumplimientos verificables del CNE — Elecciones 2024',
  en: 'Verifiable CNE breaches — 2024 Election',
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
const HERO_SUPTITLE_PLACEHOLDER = '{{days}}';
const HERO_SUPTITLE_DATE_PLACEHOLDER = '{{date}}';
const HERO_LAST_VERIFIED = '2026-01-15';
const CREDIBILITY_DOCS_PLACEHOLDER = '{{count}}';
const CREDIBILITY_DATE_PLACEHOLDER = '{{date}}';
const CREDIBILITY_DOCS_COUNT = 7;
const CREDIBILITY_LAST_DATA_UPDATE = '2025-05-27';
let latestCounter2Days = null;

function formatHeroSuptitle(lang, days) {
  const safeLang = getSafeLang(lang);
  const template = translations[safeLang].hero_suptitle || '';
  const resolvedDays = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : null;
  const daysText = resolvedDays === null ? '0' : String(resolvedDays);
  const dateText = HERO_LAST_VERIFIED || '';
  return template
    .replace(HERO_SUPTITLE_DATE_PLACEHOLDER, dateText)
    .replace(HERO_SUPTITLE_PLACEHOLDER, daysText);
}

function formatCredDocs(lang) {
  const safeLang = getSafeLang(lang);
  const template = translations[safeLang].cred_docs || '';
  return template.replace(CREDIBILITY_DOCS_PLACEHOLDER, String(CREDIBILITY_DOCS_COUNT));
}

function formatCredUpdate(lang) {
  const safeLang = getSafeLang(lang);
  const template = translations[safeLang].cred_update || '';
  const dateText = CREDIBILITY_LAST_DATA_UPDATE || '';
  return template.replace(CREDIBILITY_DATE_PLACEHOLDER, dateText);
}

function updateHeroSuptitle(days) {
  if (Number.isFinite(days)) {
    latestCounter2Days = Math.max(0, Math.floor(days));
  }

  const heroSuptitle = document.querySelector('[data-i18n="hero_suptitle"]');
  if (!heroSuptitle) {
    return;
  }

  heroSuptitle.textContent = formatHeroSuptitle(currentLang, latestCounter2Days);
}

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

    if (key === 'hero_suptitle') {
      el.textContent = formatHeroSuptitle(resolvedLang, latestCounter2Days);
    } else if (key === 'cred_docs') {
      el.textContent = formatCredDocs(resolvedLang);
    } else if (key === 'cred_update') {
      el.textContent = formatCredUpdate(resolvedLang);
    } else if (key === 'mission_text') {
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

function initShareButtons() {
  const shareButtons = document.querySelectorAll('[data-share-platform]');
  if (!shareButtons.length) {
    return;
  }

  const bypassNativeSharePlatforms = new Set(['instagram', 'tiktok']);

  shareButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      const shareUrl = window.location.href;
      const platform = button.dataset.sharePlatform || '';
      const usesNativeShare = !bypassNativeSharePlatforms.has(platform);
      const shareData = {
        title: document.title,
        text: document.title,
        url: shareUrl,
      };

      if (!usesNativeShare) {
        event.preventDefault();
        if (navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(shareUrl);
          } catch (error) {
            console.warn('Unable to copy share URL:', error);
          }
        }

        const fallbackUrl = button.getAttribute('href');
        if (fallbackUrl) {
          window.open(fallbackUrl, '_blank', 'noopener');
        }
        return;
      }

      if (!navigator.share && !navigator.clipboard) {
        return;
      }

      event.preventDefault();

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          return;
        } catch (error) {
          if (error && error.name === 'AbortError') {
            return;
          }
        }
      }

      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(shareUrl);
        } catch (error) {
          console.warn('Unable to copy share URL:', error);
        }
      }

      const fallbackUrl = button.getAttribute('href');
      if (fallbackUrl) {
        window.open(fallbackUrl, '_blank', 'noopener');
      }
    });
  });
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
  initShareButtons();

  const langBtn = document.getElementById('toggleLang');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const newLang = currentLang === 'es' ? 'en' : 'es';
      updateLanguage(newLang);
    });
  }
});
