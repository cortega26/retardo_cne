# Auditoría 2 — Front-end y UX/UI

**Fecha:** 2026-06-02 · **Stack:** Astro 6 (static, i18n ES/EN) + Bootstrap 5.3 + FontAwesome 7 + CSS propio · **Alcance:** layout, estilos, render real (desktop 1280px y móvil 390px, claro/oscuro), arquitectura de CSS/assets.

> **Método:** build de producción (`astro build`), servido local, medición de secciones y capturas full-page con Playwright forzando render, e inspección de `src/styles/global.css`, `public/assets/css/modern.css` (2021 líneas), `bridge.css` y `src/layouts/Layout.astro`.

---

## 0. Veredicto

**Estado: limpio pero genérico y técnicamente frágil. 5.5/10.**

No se ve "roto" para el usuario que hace scroll — renderiza, es responsive y tiene modo oscuro. Pero **se ve como una plantilla por defecto** (Bootstrap + gris claro + tarjetas uniformes), tiene **un bug tipográfico muy visible en el titular principal**, una **arquitectura de CSS fragmentada** producto de una migración a Astro a medio terminar, y una **monotonía visual** que hace que 16 secciones de evidencia fuerte se sientan planas e interminables (13.600 px en desktop, ~25.300 px en móvil).

> **Aclaración importante:** las capturas full-page muestran "secciones vacías", pero **es un artefacto de `content-visibility:auto`** en herramientas de captura. El usuario real que hace scroll **sí ve todo el contenido**. No es un bug de contenido en blanco. (Sí causa otros problemas — ver A2.)

---

## 1. Bug crítico

### B1 — El titular `<h1>` se parte a mitad de palabra
En el hero se lee **"Incumplimiento​s verificables del CNE"**: la palabra "Incumplimientos" (15 caracteres) se corta porque [`global.css:236-244`](../../src/styles/global.css#L236-L244) combina `max-width: 10.6ch` con `overflow-wrap: anywhere`. Cualquier palabra más larga que ~10 caracteres se rompe en seco, sin guion correcto.
**Impacto:** es lo primero que se ve. Un titular partido a media palabra es la señal #1 de "sitio descuidado". Anula gran parte del trabajo de credibilidad del contenido.
**Fix:** quitar `overflow-wrap: anywhere` del `h1`, subir `max-width` (p. ej. `16ch`/`20ch`) y dejar que `text-wrap: balance` haga el salto entre palabras. Verificar también en EN ("Verifiable Breaches by the CNE").

---

## 2. Arquitectura técnica (alta prioridad)

### A1 — CSS fragmentado y pesado: migración a Astro incompleta
El `<head>` carga **cinco** capas de estilo que compiten:
1. Bootstrap 5.3 **completo** (`bootstrap.min.css`)
2. FontAwesome 7 **completo** (`all.min.css`)
3. `modern.css` (**2021 líneas**, el design system real)
4. `global.css` (398 líneas, estilos del hero/nav en Astro)
5. `bridge.css` — existe **solo** para mapear los nombres de clase de los componentes Astro a los de `modern.css`.

`bridge.css` es un *code smell* clarísimo: es el pegamento de una migración legacy→Astro que quedó a medias. Bootstrap se carga entero pero el sitio usa un design system propio (apenas se usa el grid/utilidades). FontAwesome completo por unos pocos íconos.
**Impacto:** peso innecesario (CSS + fuentes de íconos), especificidad en guerra entre 3 hojas, mantenibilidad baja (¿dónde edito un color? en `modern.css`, `global.css` o `bridge.css`).
**Fix:** consolidar a **una** fuente de verdad. Eliminar `bridge.css` renombrando clases en los componentes; sustituir Bootstrap por el grid nativo (CSS Grid/Flex ya en uso) o, si se rehace, por Tailwind; sustituir FontAwesome completo por SVG inline de los ~10 íconos usados.

### A2 — `content-visibility: auto` con `contain-intrinsic-size: 1px 1000px`
[`modern.css:1933-1943`](../../public/assets/css/modern.css#L1933-L1943) aplica esta optimización a casi todas las secciones. El tamaño intrínseco fijo de **1000px** casi nunca coincide con la altura real (algunas secciones miden 2.400-2.600px). Consecuencias para el usuario:
- **Saltos de scroll / layout shift** al acercarse a una sección (la barra de scroll "miente").
- **Anclas imprecisas**: los CTA del hero (`#cronologia`, `#verificacion`) y los enlaces del navbar pueden aterrizar en el lugar equivocado porque la altura estimada ≠ real hasta que se renderiza.
- Rompe capturas/PDF/print y algunos lectores.
**Fix:** o quitar `content-visibility` (el sitio no es tan grande como para necesitarlo), o ajustar `contain-intrinsic-size` por sección a un valor realista, o usarlo solo en las secciones genuinamente largas y homogéneas.

### A3 — Fuentes self-hosted con subsets innecesarios
Se sirven Sora + Source Sans 3 vía `@fontsource`, pero el repo arrastra woff/woff2 de subsets **cyrillic, greek, vietnamese y latin-ext** (decenas de archivos en `dist/_astro/`). El sitio es solo ES/EN → con **latin** basta.
**Fix:** importar solo el subset `latin` (y `latin-ext` si se quiere acentuación amplia). Reduce descargas y `dist`.

### A4 — Triplicado de árboles de assets
Conviven `assets/`, `public/assets/`, `public/vendor/` y `dist/assets/` con copias de `modern.css`, `bootstrap`, JS y logos, más `docs/retardo-cne/archive/legacy-site/original-index.html`. No está claro cuál es la fuente de verdad.
**Fix:** dejar `public/` como única fuente, borrar `assets/` raíz y el legacy, y documentar en README qué se edita.

---

## 3. UX / Diseño visual (prioridad media)

### D1 — Monotonía y jerarquía débil
**Cada** sección sigue el mismo molde: `badge` centrado en mayúsculas → `H` en mayúsculas → subtítulo → tarjetas en grilla, todo sobre gris claro. Sin variación de ritmo, sin imágenes ancla, sin una sola visualización de datos. 16 bloques iguales hacen que la evidencia fuerte se sienta plana y la página, interminable.
**Fix:** introducir variación deliberada — alternar fondos (claro/oscuro/acento), secciones a ancho completo vs. contenidas, y al menos **1-2 visualizaciones reales** (la curva de totalización de Gelman, la distribución de dígitos de Tao, un mapa/heatmap de mesas) que conviertan datos en imagen memorable.

### D2 — Ritmo vertical excesivo
`--section-gap` y los paddings generan huecos enormes; combinado con D1, refuerza la sensación de vacío. Apretar el espaciado vertical y agrupar visualmente las secciones relacionadas (p. ej. "Plazos + Cronología + ¿Cómo funciona?" como un bloque "El proceso").

### D3 — Disciplina de color
Conviven azul (marca), rojo (incumplimiento) y verde (proceso legal/checks) más los colores de los badges de estado. Sin un sistema semántico documentado, el rojo a veces es "malo" y a veces es solo acento. Definir tokens: 1 color de marca, 1 semántico negativo, 1 positivo, neutros — y usarlos con consistencia.

### D4 — Móvil: columna única de ~25.300 px
Todo se apila en una sola columna larguísima. Las comparativas a dos columnas (Proceso legal vs Ejecución) y las tablas densas son difíciles de seguir en móvil. Considerar tabs/acordeones para las comparativas y "ver más" para secciones largas.

### D5 — Densidad de los contadores
Los dos contadores grandes (`672 días 15 23 12`) dominan visualmente "Plazos legales" pero comunican menos que una frase clara ("672 días sin resultados desagregados — Art. 146 LOPRE"). Mantener el número grande, reducir el ruido de las cifras de horas/min/seg (poco relevantes a esa escala) y atar la fuente.

---

## 4. Accesibilidad (verificar / corregir)

- **Titulares en mayúsculas + `letter-spacing` negativo** en cadenas largas: peor legibilidad y peor para lectores con dislexia. Reservar mayúsculas para badges cortos.
- **Estado por color**: los badges combinan color **y** texto ("INCUMPLIDO"), lo cual es correcto para daltonismo — mantener ese patrón en cualquier rediseño.
- Verificar **contraste** del texto `text-muted` sobre gris claro (probable fallo AA) y de los badges de bajo contraste.
- Confirmar **estados de foco** visibles en nav, dropdowns y CTAs (navegación por teclado).
- Confirmar **`alt`** en logos (Carter, ONU, UE, OEA) y jerarquía de encabezados (un solo `h1`; hoy hay `h2`/`h3` mezclados en tarjetas del hero).
- Validar el **modo oscuro** con las mismas pruebas de contraste.

---

## 5. Sobre el "revamp con plantilla de Astro"

**Aclaración:** el sitio **ya está en Astro**. No hace falta "migrar a Astro"; lo que falla es el **sistema de diseño**, no el framework. Tres caminos:

| Opción | Qué implica | Esfuerzo | Resultado |
|--------|-------------|----------|-----------|
| **A. Refactor dirigido** | Arreglar B1/A1-A4, consolidar a un solo CSS (quitar Bootstrap + bridge), apretar espaciado, 1 viz. Misma estructura. | Bajo-Medio | Pasa de "plantilla" a "sólido y limpio". Bajo riesgo. |
| **B. Nuevo design system propio** | Tokens de diseño + Tailwind (o CSS moderno), recomponer secciones con jerarquía y ritmo variados, 2-3 visualizaciones de datos. Reusa el contenido. | Medio | Identidad propia, "se ve serio y profesional". Equilibrio recomendado. |
| **C. Adoptar un theme Astro premium** | Tomar una plantilla pulida (p. ej. de tipo editorial/dossier) y migrar el contenido. | Medio-Alto | Mejor acabado visual "out of the box", pero hay que adaptar i18n, componentes y data; riesgo de volver a heredar CSS ajeno. |

**Recomendación:** **B con A como primer sprint.** Primero arreglar lo frágil (B1, A1-A4) — es rápido y elimina las señales de "descuidado". Luego construir un design system propio ligero (tokens + Tailwind) en lugar de adoptar una plantilla genérica: un observatorio de evidencia gana más con una identidad sobria y propia que con un theme de marketing. Mantener Astro, i18n y la arquitectura de componentes actual (que es razonable).

---

## 6. Backlog priorizado (impacto / esfuerzo)

| ID | Acción | Impacto | Esfuerzo |
|----|--------|---------|----------|
| B1 | Arreglar corte de palabra del `h1` | Alto | Trivial |
| A1 | Consolidar CSS: quitar Bootstrap + bridge.css | Alto | Medio |
| A2 | Corregir/quitar `content-visibility` + `intrinsic-size` | Alto | Bajo |
| D1 | Romper la monotonía: ritmo + 1-2 visualizaciones | Alto | Medio-Alto |
| A3 | Subsets de fuente solo `latin` | Medio | Bajo |
| D3 | Tokens de color semánticos | Medio | Bajo |
| D2 | Apretar ritmo vertical | Medio | Bajo |
| A4 | Limpiar árboles de assets duplicados | Medio | Bajo |
| §4 | Auditoría de accesibilidad (contraste, foco, alt) | Medio-Alto | Medio |
| D4 | UX móvil (tabs/acordeones en comparativas) | Medio | Medio |
| D5 | Simplificar contadores | Bajo | Bajo |
