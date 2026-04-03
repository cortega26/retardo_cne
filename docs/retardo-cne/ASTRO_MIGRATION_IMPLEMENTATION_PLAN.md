# ASTRO_MIGRATION_IMPLEMENTATION_PLAN.md
# Retardo CNE — Astro Migration Implementation Plan

**Version:** 1.0  
**Created:** 2026-04-01  
**Based on:** ASTRO_MIGRATION_AUDIT.md  
**Repo:** https://github.com/cortega26/retardo_cne  

---

## Overview

This plan converts the findings from the Site Audit into a sequenced, phase-by-phase implementation roadmap. It is structured to minimize regression risk by stabilizing the current state before adding new work.

**Guiding principles:**
1. Fix before build — stabilize regressions before adding features
2. Content before design — get all content rendering correctly before visual polish
3. Type-safety first — introduce TypeScript interfaces to components as we touch them
4. No big-bang rewrites — each phase is independently deployable

---

## Phase 0 — Emergency Stabilization (1–2 days)

### Objective
Restore the local dev version to feature parity with the live site. Fix all blocking regressions identified in the audit. After this phase, the Astro version should be deployable without any visible regressions.

### Tasks

#### P0-T1: Audit and repair all missing i18n keys
**Files:** `src/i18n/ui.ts`, `assets/data/translations.json`

For each missing key identified in the audit, add the correct translation to `ui.ts` for both `es` and `en` locales. Cross-reference with the live `index.html` (107KB file at root) for the exact wording.

**Keys to add (minimum):**
```typescript
// ui.ts — add to BOTH es and en blocks:
cred_docs           // "Documentos oficiales/legales enlazados: {count}" / "Official/legal documents linked: {count}"
cred_update         // "Última actualización de datos: {date}" / "Last data update: {date}"
cred_corrections    // "Correcciones: GitHub Issues" / "Corrections: GitHub Issues"
hero_stat_1         // Card 1 text (actas)
hero_stat_2         // Card 2 text (international failures)  
hero_stat_3         // Card 3 text (legal deadlines)
hero_stat_1_source_primary
hero_stat_1_source_archive
hero_stat_2_source_carter
hero_stat_2_source_un
hero_stat_3_source_lopre
hero_stat_3_source_audits
source_label        // "Fuente primaria:" / "Primary source:"
methodology_text    // Full methodology description text
status_label        // "ESTADO:" / "STATUS:"
card_carter_text    // Carter Center statement text
card_un_text        // UN Panel statement text
card_eu_text        // EU statement text
card_oas_text       // OAS statement text
international_title // "International Reactions" / "Reacciones Internacionales"
international_intro // Intro paragraph for International section
footer_rights       // Rights/attribution text
footer_opensource   // "Open Source" / "Código Abierto"
analysis_subtitle   // Subtitle for Irregularidades section (separate from badge_analysis)
```

**Acceptance criteria:**
- `npm run dev` runs without console errors
- Every section renders visible content (no blank grey rectangles)
- No i18n key strings leak as raw text on either ES or EN route
- `grep -r 'return key' src/i18n/utils.ts` is NOT triggering for any real content

#### P0-T2: Fix `en/observadores.md` invalid frontmatter
**File:** `src/content/irregularidades/en/observadores.md`

Open the file. Add proper frontmatter delimiters (`---`). Verify the `id`, `title`, `afirmacion`, `norma`, `evidencia`, `impacto` fields match the structure in `content.config.ts`. Cross-reference with `es/observadores.md` for content.

**Acceptance criteria:**
- `astro build` completes without `InvalidContentEntryDataError`
- English Irregularidades section renders all 7 case cards

#### P0-T3: Fix favicon reference
**File:** `src/layouts/Layout.astro`

The layout references `favicon.svg` which does not exist. Either:
- Convert `public/favicon.ico` to SVG and add it as `public/favicon.svg`, OR
- Change the `<link rel="icon">` to point to `favicon.ico`

**Acceptance criteria:**
- No 404 for favicon in browser dev tools

#### P0-T4: Repair Analysis expert source links
**File:** `src/components/Analysis.astro`

Replace the `href="#"` placeholder on each expert's source button with real URLs:
- Terence Tao: His blog post on the decimal anomaly (publicly known URL)
- Dorothy Kronick: UC Berkeley / journal publication link
- Andrew Gelman: Statistical Modeling blog post
- Walter Mebane: University of Michigan research paper

**Acceptance criteria:**
- All 4 expert cards have working external source links
- Links open in `target="_blank" rel="noopener noreferrer"`

#### P0-T5: Merge share components
**Files:** `src/components/Share.astro`, `src/components/SocialShare.astro`

Determine which component is being used in `src/pages/index.astro`. Delete the redundant one. Ensure the surviving component implements all social share functionality (X/Twitter, WhatsApp, Telegram).

**Acceptance criteria:**
- Only one share component exists
- Share buttons function correctly on both ES and EN routes

### Dependencies
None — P0 is self-contained.

### Risk Controls
- Do NOT touch the live site or trigger a GitHub Actions deploy until all P0 tasks pass local dev validation
- Keep `index.html` (original live site) in the repo root as a reference and a production fallback

### Definition of Done — Phase 0
- [ ] Local dev at `localhost:4321/retardo_cne/` visually matches live site at `cortega26.github.io/retardo_cne/`
- [ ] Local dev at `localhost:4321/retardo_cne/en/` visually matches live site EN language mode
- [ ] `astro build` completes with 0 errors
- [ ] No i18n fallback keys visible in rendered HTML
- [ ] Lighthouse score ≥ 70 on Performance (without Bootstrap optimization yet)

### Verification Steps
1. Side-by-side screenshot comparison of live site vs local dev (all major sections)
2. `astro build && astro preview` — test deployment build
3. `grep -r 'return key' ` check in utils.ts to verify fallback path is not the likely path
4. Browser dev tools Network tab — confirm no 404s

---

## Phase 1 — Content Completeness and Accuracy (2–4 days)

### Objective
Bring all site content to its highest possible accuracy and credibility. Fix all thin, vague, or unsupported content blocks. Expand FAQs. Add missing source citations. Make the site fully trustworthy as an evidence archive.

### Tasks

#### P1-T1: Expand FAQ from 3 to 8–12 items
**File:** `src/components/FAQ.astro` + `src/i18n/ui.ts`

Add the following categories of questions (both ES and EN):
1. What does LOPRE say about results? (exists) ✓
2. Was there really a hack? (exists) ✓
3. Why are audits important? (exists) ✓
4. **[NEW]** What is the difference between totalization and the Electoral Gazette?
5. **[NEW]** What did the Carter Center find specifically?
6. **[NEW]** Are the citizen actas (minutes) legally valid documents?
7. **[NEW]** What does "precinct-level results" mean technically?
8. **[NEW]** Did any court rule on these issues?
9. **[NEW]** What happened to witnesses and volunteers after July 28?
10. **[NEW]** What is the Macedonia del Norte case study?

Sources for each FAQ answer must be cited. Use a consistent format: `Art. X LOPRE`, `[Institution] Report [Date]`, or `[Publication]`.

**Acceptance criteria:**
- FAQ accordion contains 8–10 items
- Each item has a source citation
- All strings are properly i18n'd in ES and EN

#### P1-T2: Enrich Background Cards with specifics
**File:** `src/components/BackgroundCards.astro` + `src/i18n/ui.ts`

The 3 background cards (Institutional Crisis, Electoral Guarantees, International Observation) currently have single-sentence descriptions. Expand each to:
- At least 2–3 specific facts with dates
- At least one named source link

Example for "Institutional Crisis":
> In 2021, the TSJ appointed 5 new CNE rectors without AN participation (ruling Magistrates Colmenares, Zerpa). In February 2024, opposition candidate registration was blocked without legal basis.

**Acceptance criteria:**
- Each card has ≥2 specific facts with dates
- At least 1 source link per card

#### P1-T3: Add verbatim quotes and dates to International Community cards
**Files:** `src/components/International.astro` + `src/i18n/ui.ts`

The International section currently shows 4 org cards with generic descriptions. Upgrade to:
- Include actual verbatim or near-verbatim quote from each body's official statement
- Include the date of the statement
- Include a direct link to the original document

Add a `date`, `quote`, and `url` field to the org objects in `International.astro`.

**Acceptance criteria:**
- Each card shows: org name, statement date, verbatim or paraphrased quote, link
- All links are live (verified by clicking)

#### P1-T4: Add source links to Impact section
**File:** `src/components/Impact.astro` + `src/i18n/ui.ts`

"Persecution of witnesses and volunteers" needs to link to documented cases. Candidates:
- HRW Venezuela 2024 election report
- Amnesty International Venezuela 2024 report
- PROVEA (Venezuelan NGO) documentation

**Acceptance criteria:**
- Each impact indicator has at least one source link

#### P1-T5: Clean up repo root
**Files:** Multiple root-level files

Remove or relocate:
- `revamp.txt` → Move to `docs/retardo-cne/archive/` or delete
- `build_irregularidades.py` → If still needed, move to `scripts/`; if not, delete
- `content/` (root-level) → Verify it's not referenced anywhere; delete if legacy
- `data/` (root-level) → Verify it's not referenced anywhere; delete if legacy
- `mkdocs.yml` → If MkDocs is still needed for separate docs, isolate; if not, delete

**Acceptance criteria:**
- Repo root contains only: `.astro/`, `.git/`, `.github/`, `.gitattributes`, `.gitignore`, `.eslintrc.cjs`, `.prettierrc.json`, `.stylelintrc.json`, `astro.config.mjs`, `package.json`, `package-lock.json`, `playwright.config.js`, `lighthouserc.json`, `node_modules/`, `public/`, `src/`, `docs/`, `tests/`, `README.md`

### Dependencies
- P0 must be complete before P1

### Risk Controls
- For all new content (Q&A text, quotes, source URLs) — verify each source URL before committing
- Do not delete root-level files without `grep -r` confirming they have no active references

### Definition of Done — Phase 1
- [ ] FAQ has 8+ items, all sourced
- [ ] Background Cards have specific facts+dates+sources
- [ ] International Community cards have quotes+dates+links
- [ ] Impact section has HRW/Amnesty source links
- [ ] Repo root contains only expected files
- [ ] All external links verified as live (not 404)

### Verification Steps
1. Read through site in both ES and EN — any vague unsupported claim that a skeptic could dismiss?
2. Click every external link — note any 404s or broken redirects
3. Run `astro build` — confirm 0 errors

---

## Phase 2 — Architecture and Technical Quality (3–5 days)

### Objective
Improve architectural quality, reduce technical debt, remove dependency on Bootstrap CDN, and establish a sustainable component/styling architecture.

### Tasks

#### P2-T1: Eliminate Bootstrap CSS CDN dependency
**Files:** `src/layouts/Layout.astro`, `src/styles/global.css`, all component `<style>` blocks

Replace Bootstrap's CSS with a focused custom CSS implementation:

1. **Grid system:** Implement a simple 12-column grid system (`row`, `col-*`) in `global.css` — this is ~80 lines
2. **Button system:** Port existing button styles from `global.css` — already mostly done
3. **Typography:** Already using custom system
4. **Utilities:** Migrate only the Bootstrap utilities actually used (flexbox, spacing, display)

**What to keep from Bootstrap JS (temporarily):** The collapse/accordion and dropdown JavaScript behaviors. These will be removed in a later phase.

**Acceptance criteria:**
- Bootstrap CSS CDN link removed from Layout.astro
- All sections render identically without Bootstrap CSS
- `astro build` succeeds
- Lighthouse Performance score improves by ≥15 points

#### P2-T2: Consolidate duplicate CSS utility definitions
**Files:** All component `<style>` blocks

The following class definitions exist in multiple component files:
- `.bg-secondary`, `.bg-surface`, `.text-primary`, `.text-secondary`, `.border-subtle`
- `.bg-success`, `.bg-danger`, all color utilities

Move all global utility classes to `global.css`. Component `<style>` blocks should only contain component-specific styles.

**Acceptance criteria:**
- No utility class definition appears in more than one `<style>` block
- Run `grep -n "\.bg-secondary" src/components/*.astro` → 0 results

#### P2-T3: Migrate hardcoded data to content collections

Move the following from i18n strings / component JavaScript objects to proper Astro content collections:

**a) Timeline events** → New collection `src/content/timeline/{es,en}/`
```typescript
// Schema:
{
  id: number,
  date: string,
  event: string,
  status: 'normal' | 'violation' | 'overdue' | 'suspended' | 'met',
  sources: string[],
  sourceUrls: string[].optional()
}
```

**b) International community reactions** → New collection `src/content/international/{es,en}/`
```typescript
// Schema:
{
  id: string,
  org: string,
  orgShort: string,
  date: string,
  quote: string,
  summary: string,
  url: string,
  icon: string
}
```

**c) Expert analyses** → New collection `src/content/experts/{es,en}/`
```typescript
// Schema:
{
  id: string,
  name: string,
  institution: string,
  role: string,
  summary: string,
  url: string,
  finding_type: 'statistical' | 'legal' | 'observational'
}
```

Update corresponding components to use `getCollection()` instead of hardcoded arrays.

**Acceptance criteria:**
- Timeline events are in markdown/json content files
- International cards are data-driven from collection
- Expert cards are data-driven from collection
- Both ES and EN content files exist for each collection
- `astro build` completes with 0 errors

#### P2-T4: Add TypeScript prop interfaces to all components
**Files:** All `src/components/*.astro`

Add properly typed `interface Props` blocks to every component that accepts props:
- `Counter.astro` (already has Props ✅)
- All others currently use `Astro.props` without typing

**Acceptance criteria:**
- Every component has a typed `interface Props` or is marked as having no props
- `@astrojs/check` (`astro check`) reports 0 type errors

#### P2-T5: Add SEO metadata infrastructure
**File:** `src/layouts/Layout.astro`, `src/pages/index.astro`, `src/pages/en/index.astro`

Update `Layout.astro` to accept and render:
```typescript
interface Props {
  title: string;
  description: string;
  lang: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  canonical?: string;
  hreflangEs?: string;
  hreflangEn?: string;
}
```

Add `hreflang` links pointing to `/retardo_cne/` and `/retardo_cne/en/`.  
Use per-language title and description from i18n.  
Ensure OG `og:locale` matches language.

**Acceptance criteria:**
- Each page has a unique `<title>` in the correct language
- `<link rel="alternate" hreflang="es">` and `<link rel="alternate" hreflang="en">` present on both routes
- `<meta name="description">` has content relevant to the page

#### P2-T6: AOS → CSS + IntersectionObserver
**Files:** `src/layouts/Layout.astro`, `src/pages/index.astro`, all components with `data-aos`

Replace AOS library with native CSS animations:
1. Add CSS `@keyframes fadeUp`, `@keyframes fadeRight`, etc. to `global.css`
2. Add `.animate-on-scroll` class pattern using `IntersectionObserver` in a small `<script is:inline>` in Layout
3. Replace all `data-aos="fade-up"` attributes with `class="animate-on-scroll"` (or similar)
4. Remove AOS CDN link and npm package

**Acceptance criteria:**
- AOS CDN link removed from Layout.astro
- Scroll animations still work on all sections
- `document.querySelectorAll('[data-aos]').length === 0` in browser console

### Dependencies
- P0 + P1 should be complete before P2
- P2-T1 (Bootstrap removal) is the highest risk task — do it last in P2 after other P2 tasks are done and tested

### Risk Controls
- P2-T1 (Bootstrap removal) must be done on a separate branch and reviewed via screenshot comparison before merging
- When migrating to content collections (P2-T3), keep the old hardcoded arrays commented out until the collection-based approach is verified

### Definition of Done — Phase 2
- [ ] Bootstrap CSS CDN removed
- [ ] No duplicated CSS utility definitions across component `<style>` blocks
- [ ] Timeline, International, Experts are content-collection-driven
- [ ] All components have TypeScript prop interfaces
- [ ] SEO metadata is correct on both ES and EN routes
- [ ] AOS removed; CSS animations working
- [ ] `astro check` returns 0 errors
- [ ] `astro build` returns 0 errors
- [ ] Lighthouse Performance ≥ 85

### Verification Steps
1. `astro check` → 0 errors
2. `astro build` → 0 errors
3. Lighthouse CLI test on built site
4. Screenshot comparison vs Phase 0 baseline
5. Click all external links → no 404s

---

## Phase 3 — Design Polish and UX Enhancement (2–3 days)

### Objective
Elevate the visual quality and user experience to a professional, sober, editorial standard. The site should feel like a serious institutional resource, not an activist blog.

### Tasks

#### P3-T1: Add skip-to-main link and ARIA improvements
**Files:** `src/layouts/Layout.astro`, `src/components/Counter.astro`

1. Add `<a href="#main-content" class="skip-link">Skip to main content</a>` as first element in `<body>`
2. Add `id="main-content"` to `<main>` element in index pages
3. Add `aria-live="polite"` to counter output elements
4. Verify FAQ accordion has proper `aria-expanded` management (currently uses Bootstrap JS)
5. Add `aria-label` to all icon-only buttons

**Acceptance criteria:**
- Keyboard navigation: Tab → "Skip to main" → Tab → Navbar → Tab through all interactive elements
- Screen reader: Counter announces updates via ARIA live region
- WAVE tool produces 0 errors

#### P3-T2: Add Back to Top button
**File:** New component `src/components/ui/BackToTop.astro`

Implement a fixed-position "Back to Top" button that:
- Appears after scrolling 300px
- Uses smooth scroll
- Has a clear icon and accessible label
- Is styled consistently with the design system

**Acceptance criteria:**
- Button appears/disappears based on scroll position
- Smooth, functional scroll to top

#### P3-T3: Design improvements
**Files:** Multiple component `<style>` blocks, `global.css`

1. **Expert cards:** Add an initials-based avatar (colored circle with expert initials) — no external images needed
2. **Timeline:** Make timeline dots more prominent (16px → 20px, use indigo ring)
3. **Counter section:** Add a subtle radial gradient behind each counter for visual depth
4. **FAQ accordion:** Polish open/closed state styling — add a smooth transition and indigo left border on open state
5. **Section transitions:** Add subtle dividers between sections using `border-top: 1px solid var(--border-subtle)` consistently
6. **International cards:** Add org logos via SVG icons (already using Font Awesome; find appropriate icons)

**Acceptance criteria:**
- Expert cards have avatar initials circles
- Timeline is visually cleaner with more prominent dots
- Section dividers are consistent

#### P3-T4: Reading progress indicator
**File:** `src/layouts/Layout.astro` or new `src/components/ui/ReadingProgress.astro`

Implement a thin progress bar at the top of the viewport (below navbar) that fills as the user scrolls.

**Acceptance criteria:**
- Progress bar fills smoothly as user scrolls
- Bar is visible in both light and dark mode
- No impact on layout below

#### P3-T5: Mobile UX improvements
**Files:** Various component `<style>` blocks

1. Increase minimum touch target sizes to 44×44px
2. Fix any small `font-size` values (anything below `0.7rem`) — replace with `0.7rem` minimum
3. Fix overflow on the Context section's 2-column comparison table on narrow screens
4. Ensure all source links are tappable on mobile

**Acceptance criteria:**
- No font-size below `0.7rem` in rendered content
- No horizontal overflow at 375px viewport width
- All interactive elements pass 44px touch target minimum

### Dependencies
- P2 must be complete before P3 (clean CSS architecture makes P3 work safer)

### Definition of Done — Phase 3
- [ ] Skip-to-main link present
- [ ] Counter ARIA live region working
- [ ] Back to Top button implemented
- [ ] Expert initials avatars visible
- [ ] FAQ accordion has polished transitions
- [ ] Reading progress bar present
- [ ] No mobile horizontal overflow at 375px
- [ ] WAVE accessibility audit: 0 errors

---

## Phase 4 — Advanced SEO and Structured Data (1–2 days)

### Objective
Maximize discoverability and search engine understanding of the site's content.

### Tasks

#### P4-T1: FAQPage structured data
**File:** `src/components/FAQ.astro`

Add `<script type="application/ld+json">` with FAQPage schema:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does LOPRE say...",
      "acceptedAnswer": { "@type": "Answer", "text": "..." }
    }
  ]
}
```

**Acceptance criteria:**
- Google Rich Results Test validates FAQPage schema
- All FAQ items included in structured data

#### P4-T2: WebPage / Article structured data
**File:** `src/layouts/Layout.astro`

Add global `WebPage` schema with:
- `name`, `description`, `url`, `inLanguage`
- `publisher` (the observatory)
- `dateModified` from last commit date or static date

**Acceptance criteria:**
- Google Structured Data Testing Tool validates

#### P4-T3: Sitemap optimization
**File:** `astro.config.mjs`

Configure sitemap to include:
- Both ES and EN routes
- Correct `hreflang` alternates in sitemap
- Prioritize homepage entry

**Acceptance criteria:**
- `/retardo_cne/sitemap-index.xml` is accessible
- Both routes appear in sitemap

### Dependencies
- P2 (SEO metadata infrastructure) must be complete

### Definition of Done — Phase 4
- [ ] FAQPage schema validates
- [ ] WebPage schema validates
- [ ] Sitemap is correct and accessible

---

## Phase 5 — Production Hardening and CI/CD (1 day)

### Objective
Ensure the site can be deployed reliably with confidence, with automated quality checks.

### Tasks

#### P5-T1: Fix package.json type conflict
**File:** `package.json`

Remove `"type": "commonjs"` — Astro expects ESM.

#### P5-T2: Configure ESLint and Stylelint for Astro
**Files:** `.eslintrc.cjs`, `.stylelintrc.json`

Add Astro-specific ESLint rules and ensure Stylelint ignores Astro-specific CSS patterns. Verify `npm run lint` passes with 0 errors on the repo.

#### P5-T3: Lighthouse CI configuration
**File:** `lighthouserc.json`

Set minimum thresholds:
```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.85}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

#### P5-T4: E2E test coverage
**Files:** `tests/`

Add Playwright tests for:
1. Both `/retardo_cne/` and `/retardo_cne/en/` load and render > 0 content cards
2. Language switcher navigates between routes
3. Theme toggle changes body class
4. All nav dropdown links scroll to correct section
5. Counter displays a number > 0

#### P5-T5: Remove original index.html from deployment
**File:** `index.html` (root)

The original monolithic `index.html` at the repo root is currently served by GitHub Pages at the same URL as the Astro-built output. Before removing it, confirm GitHub Actions is correctly deploying from `dist/` not from root. Once confirmed, move `index.html` to `docs/retardo-cne/archive/original-index.html` for reference.

**Acceptance criteria:**
- `https://cortega26.github.io/retardo_cne/` serves the Astro-built version
- `index.html` at root is not deployed to Pages

### Definition of Done — Phase 5
- [ ] `npm run lint` passes 0 errors
- [ ] `npm run test:e2e` passes all tests
- [ ] Lighthouse CI configured with meaningful thresholds
- [ ] GitHub Actions pipeline is green
- [ ] Live site at `cortega26.github.io/retardo_cne/` confirms Astro deployment

---

## Overall Sequencing Rationale

```
P0 (Emergency Stabilization)
  ↓ (site now deployable)
P1 (Content Completeness)
  ↓ (content now trustworthy)
P2 (Architecture & Tech Quality)
  ↓ (codebase now maintainable)
P3 (Design Polish & UX)
  ↓ (site now professional)
P4 (SEO & Structured Data)
  ↓ (site now discoverable)
P5 (Production Hardening)
  ↓ (site now releasable)
```

P0 must happen first because many improvements in later phases build on i18n keys, content collections, and component stability. You cannot meaningfully improve design or SEO if the content isn't rendering.

---

## Total Estimated Effort

| Phase | Effort |
|---|---|
| P0 — Emergency Stabilization | 1–2 days |
| P1 — Content Completeness | 2–4 days |
| P2 — Architecture & Tech Quality | 3–5 days |
| P3 — Design Polish & UX | 2–3 days |
| P4 — SEO & Structured Data | 1–2 days |
| P5 — Production Hardening | 1 day |
| **Total** | **10–17 days** |

---

## Notes for Handoff to New Implementation Conversation

Before opening a new implementation conversation, ensure the following are ready:
1. This plan file is committed to the repo
2. The ASTRO_MIGRATION_BACKLOG.md is committed to the repo
3. The NEXT_CONVERSATION_IMPLEMENTATION_PROMPT.md is available
4. The dev server is confirmed running at `localhost:4321`
5. The live site is still serving the original at `cortega26.github.io/retardo_cne/`
6. The original `index.html` is intact as reference material

The execution agent should **start with Phase 0** and verify completion against the Definition of Done checklist before proceeding to Phase 1.
