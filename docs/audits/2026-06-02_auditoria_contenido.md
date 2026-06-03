# Auditoría 1 — Contenido, secuencia, credibilidad y estrategia de comunicación

**Fecha:** 2026-06-02 · **Sitio:** Retardo_CNE (Astro, ES/EN) · **Alcance:** `src/pages/index.astro` y los 16 componentes de la home, `src/i18n/ui.ts`, `src/components/*`.

> **Método:** lectura del copy real renderizado (no solo i18n), revisión de las fuentes enlazadas por sección, contraste con los dos docs de estrategia previos (`docs/strategy/*`) para distinguir lo ya implementado de lo pendiente.

---

## 0. Veredicto

**Estado: sólido en fondo, débil en arquitectura del mensaje. 6.5/10.**

La base probatoria es **mejor de lo que el sitio aparenta**: cada afirmación fuerte tiene fuente primaria o de alta autoridad (LOPRE, Centro Carter, Panel ONU, UE, OEA, HRW/ACNUDH, blogs/papers de Tao, Kronick, Gelman y Mebane con sus URLs reales). El reposicionamiento "fraude → incumplimientos verificables" de la estrategia previa **ya se aplicó** (hero, framing neutral, barra de credibilidad, source boxes en hero y FAQ).

El problema no es la evidencia: es que **el mensaje no está jerarquizado ni etiquetado**, la secuencia es plana (16 secciones de igual peso en un scroll interminable), y quedan inconsistencias y enlaces rotos que un periodista o verificador detectaría en 2 minutos y restarían seriedad.

---

## 1. Lo que ya está bien (no rehacer)

- **Framing neutral y verificable** en hero, misión y FAQ ("incumplimientos verificables", no "fraude").
- **Source boxes** en las 3 tarjetas del hero y en las 10 preguntas del FAQ (fuente + artículo legal + fecha).
- **FAQ excelente**: 10 Q&A que anticipan contraargumentos ("¿hubo hackeo?", "¿son válidas las actas?"), cada una con base legal y fuente. Es la columna vertebral de credibilidad del sitio.
- **Análisis forense bien citado**: 4 académicos con enlace directo a su publicación. (Ver matiz en §3.3.)
- **Comparativa "Proceso legal (LOPRE) vs Ejecución 2024"** paso a paso: patrón narrativo muy fuerte y escaneable.
- **Bilingüe ES/EN** completo, clave para alcance internacional.

---

## 2. Hallazgos críticos / alta prioridad

### C1 — "Ver metodología" es un enlace roto y no existe la página de método
`src/components/Summary.astro:13` enlaza `methodology_link` ("Ver metodología") a `#auditorias`, una sección que **no es** la metodología. No hay ninguna página `/metodologia` ni `/verificar` en el sitio Astro (`src/pages/` solo tiene `index.astro` y `en/index.astro`). El doc de estrategia da T05 ("Método y correcciones") por *finalizada*, pero solo existe en MkDocs (`docs/metodologia.md`), no en el sitio publicado.
**Por qué importa:** una página de método + correcciones es el sello de rigor periodístico. Prometerla y enlazar a una sección equivocada es peor que no tenerla.
**Acción:** crear `src/pages/metodologia.astro` (y `en/`) con: criterio mínimo de evidencia, niveles de fuente, política de correcciones y registro de actualizaciones. Enlazarla desde hero, Summary y footer.

### C2 — Faltan los *tags* de estado de evidencia (verificado / pendiente / en disputa)
Es la recomendación central de la estrategia de credibilidad (T04) y **sigue sin implementarse**. Hoy todo se presenta con el mismo peso de certeza. Cuando un hecho es "observado pero sin evidencia primaria publicada" (p. ej. "transmisión interrumpida deliberadamente", `audit_tele_note`) se afirma con la misma rotundidad que un plazo legal vencido y documentado.
**Por qué importa:** mezclar "hecho documentado" con "reportado/en disputa" es el vector #1 de ataque a la credibilidad.
**Acción:** añadir una etiqueta por afirmación fuerte: `Verificado` (fuente primaria + archivo), `Pendiente` (solo reportes secundarios), `En disputa`. Incluir una leyenda visible.

### C3 — Calibrar el lenguaje a la fuerza real de cada fuente
El bloque forense titula "coinciden en la anomalía" / "evidence of manipulation". Pero las fuentes citadas tienen **grados de certeza distintos**:
- **Tao** ("What are the odds II") es explícitamente *exploratorio* y prudente, no concluye fraude.
- **Gelman** titula su entrada "*suspicious* data pattern".
- **Mebane** (eForensics) es el más directo en afirmar manipulación.
Presentarlos como un consenso unánime de "manipulación" sobre-representa a Tao y Gelman.
**Acción:** una línea por experto que refleje su nivel real ("sugiere"/"considera improbable"/"detecta evidencia de"). Paradójicamente, citar con precisión los hace **más** creíbles, no menos.
> Nota técnica: las claves `analysis_*_summary` de `ui.ts` están **muertas** — `Analysis.astro` usa su propio array `experts`. Limpiar para evitar que alguien edite el texto equivocado.

### C4 — Inconsistencia de cifras clave
El número de mesas/actas aparece en tres formas: `25.000+` (hero), `25.575 de 30.026 mesas` (VerifiedActas) y `~30.000 mesas` (FAQ 7). Tres cifras distintas para la misma realidad, sin una nota que las concilie.
**Acción:** fijar una cifra canónica con fuente y fecha ("25.575 de 30.026 mesas digitalizadas — ResultadosConVzla, 3 ene 2025") y derivar de ahí los redondeos.

### C5 — Falta un TL;DR escaneable con la jerarquía del mensaje
El sitio entrega 16 secciones de igual peso. No hay un bloque inicial de "los 3-4 hechos más duros y verificables" que un lector con prisa (periodista, ONG, decisor) pueda absorber en 20 segundos. El hero tiene 3 tarjetas-stat, pero compiten con badges, barra de credibilidad y 2 CTAs.
**Acción:** un bloque "En 30 segundos" tras el hero: 3-4 hechos con su norma + fuente + estado, y un único CTA primario.

### C6 — Sin datos estructurados (JSON-LD)
No hay `FAQPage`, `Article`, `Dataset` ni `ItemList` (la estrategia SEO los pedía). Se pierde rich-snippet en buscadores y citabilidad por máquinas.
**Acción:** `FAQPage` para el FAQ (gran ROI, ya hay 10 Q&A), `Dataset` para las actas, `ItemList` para la cronología.

---

## 3. Hallazgos de prioridad media

### M1 — Secuencia / arquitectura de la información
Orden actual: Hero → Metodología → Cómo verificar → **Antecedentes** → Plazos → Cronología → ¿Cómo funciona? → Irregularidades → Auditorías → Actas → Internacional → Forense → FAQ → Impacto → Acción → Compartir.

Problemas:
- **"Antecedentes" (contexto histórico) llega demasiado pronto**, antes de la evidencia dura. Enfría el arranque. El contexto refuerza *después* de exponer el hecho principal.
- **El FAQ (lo más defensivo y citable) está enterrado** en la posición 13 de 16.
- El patrón narrativo de la propia estrategia (Hecho → Norma → Evidencia → Estado → Cómo verificar) **no se aplica de forma consistente** sección a sección.

**Secuencia propuesta:** Hero → **En 30 segundos (TL;DR)** → Plazos legales (el hecho más duro y binario) → Cronología → Evidencia/Actas → ¿Cómo funciona? (legal vs real) → Irregularidades → Auditorías → Análisis forense → Internacional → **FAQ/Contrapuntos** (subir) → Antecedentes (contexto, ahora sí) → Impacto/DDHH → Metodología → Acción/Compartir.

### M2 — "Cómo verificar" está mal etiquetado
La sección `guia` ("CÓMO VERIFICAR") explica **cómo funciona un acta** (impresión local → QR → carga), no **cómo el lector puede verificar** algo por sí mismo. El título promete una acción que el contenido no entrega.
**Acción:** o renombrar a "Cómo funciona la verificación del voto", o convertirla en una guía real de 3 pasos accionables ("1. Abre ResultadosConVzla → 2. Busca tu mesa → 3. Contrasta el QR/serial").

### M3 — CTAs aún emotivos
Persisten `badge_share: 'DIFUNDIR VERDAD'` / `'SPREAD TRUTH'` y `action_title: 'La transparencia es un derecho'`. La estrategia recomendó sustituir lo emotivo por accionable ("Compartir evidencia verificable"). "Difundir la verdad" suena a activismo, no a observatorio.

### M4 — Niveles de fuente sin etiquetar
Se mezclan fuentes oficiales (CNE/TSJ/Gaceta), de observadores (Carter, ONU, UE, OEA), de ONG (HRW/ACNUDH), académicas y ciudadanas (actas) sin una taxonomía visible. Etiquetar el *tipo* de fuente sube la auditabilidad.

### M5 — Faltan activos de citabilidad/acción para la audiencia primaria
No hay: kit de prensa descargable, bloque "Cómo citar este observatorio", ni un índice de fuentes con enlaces archivados y fecha de última verificación. Son justamente los activos que convierten visitas de periodistas/ONG en referencias.

### M6 — Fechas de "última verificación" solo globales
Hay una sola fecha global en el hero (`2025-05-27`). El estándar de credibilidad es fecha *por afirmación*, sobre todo en cifras que cambian (contador de días, nº de actas).

---

## 4. Prioridad baja

- **Glosario** para audiencia internacional (CNE, LOPRE, acta, Gaceta, totalización) — los lectores EN no tienen contexto.
- **Registro de incertidumbre** (uncertainty log) público: lista corta de ítems sin resolver con fecha y plan de cierre.
- **Caso Macedonia**: asegurar que el framing sea "referencia comparativa de buena práctica", nunca implicando equivalencia de procesos.
- Revisar superlativos residuales y el badge `ILEGAL` (es una conclusión jurídica; mejor "Sin base legal" o atarlo a la sentencia/artículo citado).

---

## 5. Estrategia de comunicación (lo más importante a definir)

Hoy el sitio intenta hablarle a todos a la vez (ciudadano venezolano, periodista, ONG/observador internacional, decisor político) y por eso ningún mensaje queda afilado. Antes de tocar más copy, decidir:

1. **Audiencia primaria.** Recomendación: **periodistas y organismos/ONG internacionales** (son quienes amplifican y citan; el bilingüe ya apunta ahí). El ciudadano es audiencia secundaria.
2. **Acción deseada #1.** Una sola, medible: **"citar/usar esta evidencia"** (descargar kit + enlazar). Lo demás (compartir, verificar) es secundario.
3. **Promesa de marca en una frase:** "El registro verificable, con fuente primaria, de los incumplimientos del CNE en 2024." Todo lo que no sirva a esa promesa, se recorta.
4. **Embudo:** TL;DR (30s) → evidencia con estado y fuente → FAQ/contrapuntos → metodología → kit de prensa/citar. Cada paso sube en compromiso y en confianza ("trust ladder").

---

## 6. Backlog priorizado (impacto / esfuerzo)

| ID | Acción | Impacto | Esfuerzo |
|----|--------|---------|----------|
| C1 | Página de Metodología y correcciones + arreglar enlace | Alto | Medio |
| C2 | Tags de estado de evidencia + leyenda | Alto | Medio |
| C5 | Bloque TL;DR "En 30 segundos" | Alto | Bajo |
| C3 | Calibrar lenguaje del bloque forense | Alto | Bajo |
| C4 | Unificar cifra canónica de actas/mesas | Alto | Bajo |
| C6 | Schema JSON-LD (FAQPage primero) | Medio-Alto | Bajo |
| M1 | Reordenar secuencia de secciones | Alto | Medio |
| M2 | Renombrar/rehacer "Cómo verificar" | Medio | Bajo |
| M5 | Kit de prensa + "Cómo citar" + índice de fuentes | Alto | Medio |
| M3 | Suavizar CTAs emotivos | Medio | Bajo |
| M4 | Etiquetar niveles de fuente | Medio | Medio |
| — | Glosario / uncertainty log / limpiar i18n muerto | Bajo | Bajo |
