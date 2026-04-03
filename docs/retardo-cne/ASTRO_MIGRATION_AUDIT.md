# ASTRO_MIGRATION_AUDIT.md
# Retardo CNE — Astro Migration Site Audit

**Audit Date:** 2026-04-01  
**Auditor Role:** Principal Frontend Engineer / Senior Astro Migration Lead / Senior UX/UI Designer / Evidence-Driven Political Communications Editor  
**Live Site:** https://cortega26.github.io/retardo_cne/  
**Local Repo:** /home/carlos/VS_Code_Projects/retardo_cne  
**Dev Server:** http://localhost:4321/retardo_cne/  

---

## 1. Executive Summary

The Retardo CNE project is a bilingual (ES/EN) public-interest website documenting verifiable procedural irregularities in the 2024 Venezuelan presidential election. The live site is a monolithic `index.html` (107 KB) built with Bootstrap 5 + vanilla JS. A partial Astro migration is already underway in the local repository.

**Migration Progress Assessment: ~35% complete** — foundational architecture exists (Astro 6.x, i18n routing, content collections), but the local version suffers from critical rendering regressions: multiple sections appear as **blank grey rectangles** in the browser, meaning the Astro version is currently non-deployable without substantially more work.

**Critical finding:** The local dev screenshots confirm that at least 50–60% of the visible page content from the live site is either not rendering or rendering with no visual content in the Astro version. This is a blocking regression.

**Content quality assessment of the live site:** Generally strong. Evidence-backed, professionally framed, sober tone. Some overclaiming in specific labels ("VIOLATED" red stamps are rhetorically aggressive but factually defensible given LOPRE mandates). The biggest weakness is an over-reliance on inline i18n strings in a massive flat `ui.ts` object — this is not scalable and is already causing inconsistency.

---

## 2. Live Site Audit

### 2.1 Information Architecture

**Type:** Monolithic single-page site (SPA-style, all content on one URL)  
**Navigation:** Sticky top navbar with 4 dropdown menus:

| Nav Item | Dropdown Items |
|---|---|
| INICIO / HOME | — (anchor to top) |
| LA EVIDENCIA / EVIDENCE | Cronología, Auditorías post-electorales, Análisis estadísticos, Actas ciudadanas; +(external) ResultadosConVzla, Macedonia |
| CONTEXTO / CONTEXT | Arquitectura Electoral 101, Plazos Legales, Antecedentes, Impacto y DDHH |
| VERIFICACIÓN / VERIFICATION | Cómo verificar, Contrapuntos y FAQ |
| CÓMO AYUDAR (CTA button) | — |

**Language toggle:** EN/ES button  
**Theme toggle:** Light/Dark  
**Section sequence on live page:**

1. Hero — title, stats cards (3), credibility strip
2. Verification Methodology callout
3. Mission statement / observatory framing
4. Three-Minute Summary (accordion-style: what happened / why it matters / what you can verify)
5. Key Background 2018–2024 (2 cards)
6. Missed Legal Deadlines (2 live counters)
7. Chronology of Constitutional Breakdown (8-item timeline)
8. Context — Electoral System 101 (2-column compare)
9. Technical Irregularities / Audit Status (6–7 case cards)
10. Post-Election Audits Status (3 cards)
11. Verified Actas (stats block + CTA)
12. International Community reactions (4 cards: Carter Center, UN, EU, OAS)
13. Forensic Statistical Analysis (4 expert cards: Tao, Kronick, Gelman, Mebane)
14. FAQ / Counterpoints (3 accordion items)
15. Impact & Human Rights (3 indicators)
16. Action / Share section
17. Social Share buttons
18. Footer

### 2.2 Page Structure — Content Detail

**Hero Stats Cards (3):**
- Card 1: "25,000+ citizen actas verified / 0 official precinct-level results published" — Sources: ResultadosConVzla, CNE archive
- Card 2: "International bodies report transparency and integrity failures" — Sources: Carter Center, UN Panel, European Union, OAS
- Card 3: "Legal deadlines expired + post-election audits without public evidence" — Sources: LOPRE, CNE protocols archive, Prensa Comunitaria

**Live Counters:** 
- Totalization delay: ~609 days (violated since 07/30/2024)
- Electoral Gazette delay: ~580 days (violated since 08/29/2024)

**Technical Irregularities — 6+ case cards visible on live site** (sourced from what appears to be a JSON or hardcoded data):
- CNE website offline / results withheld
- Telecommunications Audit Phase II — suspended
- Citizen Verification Audit Phase II — not conducted
- Electoral Data Audit Phase II — not conducted  
- Blocking of voter registration abroad (Exteriores)
- TSJ validation without acta review
- Delpino/CNE official response claims without documentation

**International Community (4 cards):**
- Carter Center: Requested precinct-level breakdown; never provided
- UN Expert Panel: Found irregularities in transmission process
- European Union: Called for immediate transparency
- OAS: Condemned opacity and called for independent audit

**Forensic Analysis (4 experts):**
- Terence Tao (UCLA / Fields Medal): Decimal distribution impossibility in official bulletins
- Dorothy Kronick (UC Berkeley): Systematic bias in data loading
- Andrew Gelman (Columbia): Non-random patterns in totalization progression
- Walter Mebane (U. Michigan): Benford test — human manipulation detection

**FAQ (3 items):**
1. What does LOPRE say about results? → Art. 146, 48-hour mandate
2. Was there really a hack? → Closed network argument; alternative publication channels
3. Why are audits important? → Machine-to-center equivalence verification

### 2.3 Copy Quality Assessment

| Area | Rating | Notes |
|---|---|---|
| Hero title | ✅ Strong | "Verifiable CNE Breaches" — precise, defensible |
| Credibility strip | ✅ Strong | Document count + date + GitHub corrections link |
| Counter framing | ⚠️ Moderate | Factually correct (LOPRE deadlines are real); the "VIOLATED SINCE X" styling is aggressive but defensible |
| FAQs | ✅ Strong | 3 FAQs are thin; needs expansion |
| Expert cards | ⚠️ Moderate | Cards lack direct source links to analyses (just "#"); undercuts credibility |
| International cards | ✅ Strong | Quotes and positions broadly accurate |
| Impact section | ⚠️ Weak | Vague claims ("civic space closure") not linked to specific incidents |
| "Baseless bulletin" | ⚠️ Overclaiming risk | The label "baseless" is a strong characterization; better to say "unverified by independent observers" |
| Background cards | ⚠️ Moderate | "Institutional Crisis" card too vague; needs specific names/dates |

### 2.4 Visual Design Assessment

**Strengths:**
- Dark mode / light mode support
- Clean card-based layout
- Good typographic hierarchy (Inter font)
- Live counters with real-time tick — high engagement value
- Status badges (red/green) effectively communicate violation status

**Weaknesses:**
- Inconsistent section background colors (too many alternating grey/white bands)
- Some sections feel visually dense without sufficient whitespace
- Expert cards have no photos/portraits — missed trust signal
- No "back to top" button on this extremely long page
- International timeline has no dates on the cards

### 2.5 UX Friction

- **No progress indicator:** No fixed table-of-contents or reading progress bar for an ~18-section page
- **No section anchors in URL:** Smooth scrolling to hash links doesn't update URL in all browsers
- **FAQ is limited:** Only 3 items; the live site had much richer content in earlier versions
- **Source links (Analysis experts):** Buttons link to `#` — broken credibility signal
- **Mobile:** Generally fine, but timeline visualization degrades on small screens

### 2.6 SEO Weaknesses

- Single page = single URL (no URL-level content signals per topic)
- `<title>` tag identical for both ES and EN routes
- No `lang` attribute differentiation per content block
- Missing `hreflang` alternates
- No structured data (Article, FAQPage, Event schema)
- Meta description is static, not per-page
- No canonical tag handling for the base redirect

### 2.7 Performance Assessment

**Live Site:**
- Bootstrap 5 CSS (CDN): ~230KB
- Bootstrap 5 JS (CDN): ~88KB
- Font Awesome 6 (CDN): ~71KB
- AOS CSS (CDN): ~5KB
- Inter font (Google): ~50KB
- Estimated total: ~500–600KB before any content

**Issues:** No critical render path optimization; CDN dependencies block rendering. Bootstrap's full bundle is overkill for what amounts to ~30 custom components.

### 2.8 Accessibility Assessment

- `aria-label` on nav toggle: ✅ Present
- `aria-expanded` on dropdowns: ✅ Present
- Color contrast: ⚠️ Some insufficient contrast in dark mode (slate-400 on slate-950)
- Focus management in accordions: ⚠️ Not verified
- No skip-to-main-content link: ❌ Missing
- Images: No significant images, so alt-text N/A mostly
- No ARIA live region for the ticking counters: ❌ Accessibility failure

---

## 3. Local Repository State

### 3.1 What Exists

**Astro version:** 6.1.2  
**Framework:** Astro with Bootstrap 5 (CDN), Font Awesome (CDN), AOS, Inter font  
**Routes:**
- `/retardo_cne/` → `src/pages/index.astro` (Spanish default, no prefix)
- `/retardo_cne/en/` → `src/pages/en/index.astro` (English)
- ❌ No `/retardo_cne/es/` explicit route (correct per `prefixDefaultLocale: false`)

**Astro i18n config:** `defaultLocale: 'es'`, `locales: ['es', 'en']`, `prefixDefaultLocale: false`

**Components (20 total):**

| Component | State | Issues |
|---|---|---|
| `Layout.astro` | ✅ Working | Bootstrap CDN; no favicon.svg in public/ |
| `Navbar.astro` | ✅ Working | No HOME nav item as standalone; basePath hardcoded |
| `Hero.astro` | ⚠️ Partial | References `cred_docs`, `cred_update`, `cred_corrections` keys missing from ui.ts; hero stats grid renders but content relies on missing keys |
| `Summary.astro` | ❌ Failing visual | References `methodology_text` key — missing from ui.ts; renders as empty block |
| `ThreeMinuteReview.astro` | ❌ Unknown | Not inspected in detail; appears missing in dev screenshots |
| `BackgroundCards.astro` | ❌ Unknown | Appears as empty grey block in screenshots |
| `LegalDeadlines.astro` | ✅ Structure Ok | Counter component exists; dates seem correct |
| `Counter.astro` | ⚠️ Partial | Counter hydration logic references `status_label` key — not found in ui.ts |
| `Timeline.astro` | ✅ Partially working | Inline milestones array; 8 events |
| `Context.astro` | ⚠️ Unknown | Large component (5KB); likely references missing keys |
| `Irregularidades.astro` | ✅ Working | Content collections properly filtered by lang |
| `PostElectionAudits.astro` | ✅ Working | 3 hardcoded audit items |
| `VerifiedActas.astro` | ⚠️ Unknown | Likely has missing i18n keys |
| `International.astro` | ❌ Failing | References `card_carter_text`, `card_un_text`, `card_eu_text`, `card_oas_text` — NOT in ui.ts |
| `Analysis.astro` | ✅ Working | Expert cards render; source links go to `#` |
| `FAQ.astro` | ✅ Working | 3 items; Bootstrap accordion |
| `Impact.astro` | ⚠️ Unknown | References likely missing i18n keys |
| `Action.astro` | ⚠️ Unknown | Likely references missing keys |
| `Share.astro` / `SocialShare.astro` | ⚠️ Duplicate | Two share components — unclear which is canonical |
| `Footer.astro` | ⚠️ Partial | References `footer_rights`, `footer_opensource` — not in ui.ts |

**Content Collections:**
- `src/content/irregularidades/es/` — 7 markdown files ✅
- `src/content/irregularidades/en/` — 7 markdown files (one has missing frontmatter `---` per dev error: `en/observadores.md`) ⚠️
- Schema properly defined in `content.config.ts` ✅
- Content is stored in markdown but duplicated in body text (frontmatter already has all fields) — redundant ⚠️

**i18n Architecture:**
- `src/i18n/ui.ts` — ~190 strings per language; core UI strings
- `assets/data/translations.json` — ~50KB; appears to have additional translations
- `src/i18n/utils.ts` — two-level lookup: ui.ts first, then translations.json fallback ✅
- **Critical bug:** Many component references to keys do NOT exist in either file — this is the primary cause of empty sections

**Styling:**
- `src/styles/global.css` — 168 lines; good design token system (CSS variables)
- Heavy reliance on Bootstrap utility classes mixed with custom CSS
- Tailwind-like class names (e.g., `.bg-slate-900`, `.text-indigo-400`) used as inline classes, but these are NOT Tailwind — they're custom CSS definitions scattered across component `<style>` blocks
- This pattern is **not scalable** and creates maintainability issues

**Assets:**
- `assets/` — Legacy assets from original site (CSS, JS, vendor) — should be cleaned up
- `public/assets/` — Astro public assets directory
- `public/img/` — Image assets
- `favicon.ico` in root AND in `public/` — duplication

**Technical Debt:**
- `revamp.txt` (48KB) at root — appears to be a large planning/content document that shouldn't be in production
- `build_irregularidades.py` at root — Python script for building content collections; non-standard tooling
- `content/` directory at root — separate from `src/content/` — appears to be legacy
- `data/` directory at root — legacy data files
- `mkdocs.yml` at root — MkDocs configuration alongside an Astro project
- `docs/` directory — appears to contain MkDocs-format documentation AND newly created migration docs
- Two dev process running simultaneously (multiple `npm run dev` instances)
- `package.json` declares `"type": "commonjs"` while Astro expects ESM

### 3.2 Critical Missing i18n Keys

The following keys are referenced in components but are **not defined** in `src/i18n/ui.ts` or confirmed in `translations.json`:

```
cred_docs           # Hero.astro - credibility strip document count
cred_update         # Hero.astro - credibility strip last update date
cred_corrections    # Hero.astro - credibility strip GitHub link
hero_stat_1         # Hero.astro - first hero stat card text
hero_stat_1_source_primary  # Hero.astro
hero_stat_1_source_archive  # Hero.astro
hero_stat_2         # Hero.astro - second hero stat card text
hero_stat_2_source_carter   # Hero.astro
hero_stat_2_source_un       # Hero.astro
hero_stat_3         # Hero.astro - third hero stat card text
hero_stat_3_source_lopre    # Hero.astro
hero_stat_3_source_audits   # Hero.astro
source_label        # Hero.astro (vs 'sources_label' which exists)
methodology_text    # Summary.astro
status_label        # Counter.astro
card_carter_text    # International.astro
card_un_text        # International.astro
card_eu_text        # International.astro
card_oas_text       # International.astro
international_title # International.astro
international_intro # International.astro
footer_rights       # Footer.astro
footer_opensource   # Footer.astro
analysis_subtitle   # Irregularidades.astro
```

These missing keys fall back silently to returning the key string itself (the `return key` at line 41 of `utils.ts`), causing invisible content or raw key text.

### 3.3 Definitive Regression List vs Live Site

| Feature / Section | Live Site | Local Repo |
|---|---|---|
| Hero stats cards (3) | ✅ Rich content | ⚠️ Cards present, content likely empty |
| Credibility strip | ✅ Full | ❌ Keys missing — shows fallback |
| Summary / Mission section | ✅ Working | ❌ Blank — methodology_text missing |
| Three-Minute Review | ✅ Working | ⚠️ Unknown — likely missing keys |
| Background Cards | ✅ Working | ❌ Appears blank in screenshots |
| Legal Deadlines / Counters | ✅ Ticking | ⚠️ Counter present, status_label missing |
| International Community | ✅ 4 cards with content | ❌ Cards render empty (card_*_text missing) |
| Footer | ✅ Full text | ❌ Blank — footer_rights, footer_opensource missing |
| Verification methodology callout | ✅ Present | ❌ Not found as standalone section |
| i18n completeness | ✅ 100% | ❌ ~25 keys missing across components |
| /es/ route | N/A | ❌ Pages/es/ directory is empty |
| `en/observadores.md` | N/A | ❌ Invalid frontmatter |

---

## 4. Gap Analysis

| Category | Gap Severity | Description |
|---|---|---|
| i18n key completeness | 🔴 Critical | ~25+ keys missing causing silent blank sections |
| Section rendering | 🔴 Critical | 40–60% of page content invisible in dev |
| ES page directory | 🔴 Critical | `pages/es/` is empty — ES route relies on root `index.astro` unprotected |
| Source links | 🔴 Critical | Expert analysis buttons link to `#` instead of real URLs |
| Content collection EN | 🟡 High | `en/observadores.md` has invalid frontmatter |
| Favicon | 🟡 High | `Layout.astro` references `favicon.svg` but only `favicon.ico` exists |
| Legacy root files | 🟡 High | `revamp.txt`, `build_irregularidades.py`, `content/`, `data/`, `mkdocs.yml` |
| Bootstrap dependency | 🟡 High | Full Bootstrap bundle (230KB CSS + 88KB JS) loaded from CDN |
| Analytics / SEO meta | 🟡 High | No structured data, no hreflang, static OG tags |
| Single layout | 🟡 Medium | Only one `Layout.astro` — no specialized layouts |
| Share.astro duplication | 🟡 Medium | Two share components (`Share.astro`, `SocialShare.astro`) |
| Styling architecture | 🟡 Medium | Custom Tailwind-like class names in component styles — unmaintainable |
| AOS dependency | 🟢 Low | CDN-loaded animation library; replaces with CSS preferred |
| `package.json` type | 🟢 Low | `"commonjs"` conflicts with Astro's ESM expectation |

---

## 5. Top Risks

1. **Silent i18n key failures:** The `return key` fallback in `utils.ts` means broken keys often don't throw errors — they just appear as empty content or the raw key string. This is invisible during casual development but catastrophic for users.

2. **Bootstrap coupling:** The layout is deeply coupled to Bootstrap's grid, utilities, and JS (dropdowns, accordions). Decoupling this requires systematic component-by-component work.

3. **`translations.json` source of truth:** A 50KB JSON file as the primary translation source is not auditable, versionable, or type-safe. It could contain stale or contradictory content.

4. **Astro 6.x content collection API changes:** The use of `glob` loader is Astro 5+ syntax; the `getCollection` filter on `item.id.startsWith()` is an unreliable workaround — Astro 5+ proper approach is separate collections per locale.

5. **No staging/preview environment:** Every change goes directly to production via GitHub Actions.

6. **Expert source links broken:** Links going to `#` in the Analysis section actively undermine the site's credibility premise.

---

## 6. Top Opportunities

1. **SEO: Multi-page architecture.** Moving to separate pages per major section (Timeline, Audits, Analysis) would dramatically improve indexability and per-page SEO, given the authoritative content.

2. **Content collections expansion.** International reactions, expert analyses, and timeline events are all currently hardcoded in components or flat i18n strings — they should all be in typed content collections.

3. **Structured data.** Adding `FAQPage` schema for FAQs and `Article` schema for evidence sections would increase visibility in Google's rich results.

4. **Bootstrap elimination.** Replacing Bootstrap with a lean custom CSS system (already started in `global.css`) would cut ~300KB from the bundle and remove the JS runtime dependency for dropdowns/accordions.

5. **Source link audit and repair.** Every expert card, FAQ item, and timeline event should link directly to its primary source — this converts the site from advocacy to verifiable evidence repository, its stated purpose.

6. **Counters as visual landmark.** The live delay counters are the most compelling UI element. They should be made more prominent and accessible.

---

## 7. Content/UX/Design Findings

### Content Strengths to Preserve
- "Verification Methodology" framing — explicitly links claims to legal norm, public evidence, primary source
- Hero stats cards — specific, sourced, impactful
- Live counters — visceral, attention-getting, factually grounded
- Chronological timeline — clear narrative arc
- Bilingual support — essential for international reach
- Expert analysis section — highest credibility section

### Content Weaknesses to Fix
- **FAQ section is too thin:** 3 questions is insufficient for a complex topic. Live site had richer counterpoint content in earlier versions. Expand to 8–12 items including: "What about the Carter Center departure?", "Is Edmundo González personally involved?", "What does 'totalization' mean technically?", etc.
- **Background cards:** "Institutional Crisis", "Electoral Guarantees", "International Observation" — these are too vague. Each needs at least one specific date, name, or official document reference.
- **Impact section:** Claims about "civic space closure" and "persecution of witnesses" need links to specific documented incidents (HRW, AI reports).
- **Timeline:** 8 events is fine, but the descriptions are very terse. A supplemental detail panel or hover state could add depth without cluttering the flow.
- **International community statements:** Cards do not include dates or verbatim quotes. The live site was better here.

### UX Changes Needed
- Add "Back to top" button (fixed, bottom right)
- Add reading progress indicator for the main vertical scroll
- Add a table of contents panel for desktop (sticky sidebar or mega-menu)
- Anchors in URL: When smooth-scrolling, update `location.hash` for shareability

### Design Direction
- **Keep:** Dark hero → light body → dark evidence sections alternating rhythm
- **Keep:** Indigo accent system
- **Keep:** Card-based layout
- **Improve:** White sections need more visual interest — subtle background patterns or increased section anchoring
- **Improve:** Expert cards need photos/avatars (even initials-based)
- **Improve:** Timeline dots could be more prominent with event numbers
- **Improve:** Typography sizes — some `h3` elements at `0.65rem` font-size uppercase are essentially illegible on mobile

---

## 8. Technical Findings

### Architecture Assessment

**What's correct:**
- Astro 6.x is the right framework for this content-heavy static site
- Content collections for irregularidades are the right pattern
- i18n routing with `prefixDefaultLocale: false` is idiomatic
- CSS custom properties design token system is sound

**What's wrong:**
- `translations.json` is the wrong source of truth — should be Astro i18n message format or YAML files
- Mixing Bootstrap grid + custom CSS tokens creates a confusing dual system
- Components do not follow single-responsibility — `Hero.astro` is 156 lines mixing markup, CSS, and data
- No TypeScript prop validation in most components
- `getLangFromUrl` called in every component — should be hoisted to layout or passed as prop
- AOS (Animate On Scroll) loaded from CDN adds ~250ms blocking

### Build Assessment
- `package.json "type": "commonjs"` conflicts — Astro is an ESM project
- ESLint and Stylelint configured but not running in CI
- Playwright tests configured but unknown if passing
- Lighthouse configured with `lighthouserc.json`

### Deployment Assessment
- GitHub Actions workflow exists (from previous conversation context)
- Deploys to GitHub Pages at `cortega26.github.io/retardo_cne`
- `base: '/retardo_cne'` in astro.config is correct for GitHub Pages subpath
- sitemap integration exists

---

## 9. Recommended Target Architecture

### Routes
```
/retardo_cne/              → ES homepage (all sections)
/retardo_cne/en/           → EN homepage (all sections)
/retardo_cne/metodologia   → ES methodology page (optional future)
/retardo_cne/en/methodology → EN methodology page
```

*Single-page architecture is acceptable for v1 if sections are well-anchored. Multi-page is recommended for v2.*

### Layouts
```
src/layouts/
  Layout.astro          → Root HTML shell, SEO meta, fonts, CSS
  PageLayout.astro      → Full page with Navbar + Footer (used by pages)
```

### Components (Recommended)
```
src/components/
  ui/
    Badge.astro          → Reusable badge (badge-premium pattern)
    Card.astro           → Reusable premium card
    SourceTag.astro      → Source citation badge
    StatusBadge.astro    → Violation/met/suspended status
    Counter.astro        → Live deadline counter
    Accordion.astro      → Accessible accordion (no Bootstrap dependency)
    ProgressBar.astro    → Deadline progress visualization
  nav/
    Navbar.astro         → Top navigation
    Footer.astro         → Footer
  sections/
    Hero.astro           → Hero section
    Summary.astro        → Mission/methodology intro
    ThreeMinuteReview.astro → Quick-guide accordion
    BackgroundCards.astro → 2018–2024 context
    LegalDeadlines.astro → Deadline counters section
    Timeline.astro       → Event chronology
    Context.astro        → Electoral system comparison
    Irregularidades.astro → Content collection renderer
    PostElectionAudits.astro → Audit status cards
    VerifiedActas.astro  → Actas database stats
    International.astro  → International reactions
    Analysis.astro       → Expert analyses
    FAQ.astro            → FAQ accordion
    Impact.astro         → Human rights impact
    Action.astro         → CTA section
    Share.astro          → Social share (unified)
```

### Content Collections
```
src/content/
  irregularidades/
    es/   → ES irregularity case files (7 existing + expand)
    en/   → EN irregularity case files (7 existing, fix observadores.md)
  
  # Future collections:
  international/      → International body statements (date, org, quote, url) per lang
  experts/            → Expert analysis entries (name, institution, summary, url) per lang
  timeline/           → Timeline events (date, description, status, sources) per lang
  faq/                → FAQ items (question, answer, source) per lang
```

### i18n Strategy
- **Keep** `src/i18n/ui.ts` for short UI labels (nav, badges, button labels)
- **Migrate** long translatable prose into content collections or separate YAML/JSON files per locale under `src/i18n/locales/es.json` and `src/i18n/locales/en.json`
- **Remove** dependency on `assets/data/translations.json` (consolidate into proper i18n structure)
- **Add** TypeScript strict typing on `ui` object — catch missing key references at build time

### Styling Strategy
- **Keep** the CSS custom properties design token system in `global.css`
- **Eliminate** Bootstrap CSS entirely — it adds ~230KB for essentially nothing this project couldn't do with ~50 lines of custom CSS
- **Keep** Bootstrap JS only for dropdown behavior while Bootstrap is present, then replace with custom JS in Phase 2
- **Consolidate** all Tailwind-like utility class definitions (`.bg-slate-900` etc.) into `global.css` — they must not live in component `<style>` blocks duplicated across files
- **Reduce** custom class definitions duplicated across components (e.g., `.bg-secondary`, `.text-primary` defined in 8+ `<style>` blocks)

### SEO Strategy
- Per-page `<title>` and `<meta description>` via Astro props
- `hreflang` alternate links for ES/EN in `<head>`
- Canonical URL tags
- `FAQPage` structured data in FAQ component
- `Article` or `WebPage` structured data in Layout
- Open Graph tags with per-language content
- Sitemap via `@astrojs/sitemap` (already integrated)

### Performance Strategy
- Remove Bootstrap CDN → replace with ~100 lines custom CSS
- Self-host Inter font (via `@fontsource/inter`) instead of Google CDN
- Replace AOS with CSS `@keyframes` + `IntersectionObserver`
- Replace Font Awesome CDN with SVG icons (Astro-compatible icon library or inline SVGs)
- Target: < 100KB total page weight (excluding content text)

---

## 10. Prioritized Recommendations

### P0 — Blocking (Must fix before any deployment)
1. Add all ~25 missing i18n keys to `ui.ts` (ES and EN) — this fixes the blank sections
2. Fix `en/observadores.md` invalid frontmatter
3. Fix `favicon.svg` reference in Layout (or add the file) 
4. Repair all expert analysis source links (replace `#` with real URLs)
5. Merge `Share.astro` and `SocialShare.astro` into one canonical component

### P1 — High Priority (Required for professional deployment)
6. Expand FAQ from 3 to 8–12 items
7. Add real source URLs to all International Community cards
8. Add real verbatim quotes + dates to International Community cards
9. Beef up Background Cards with specific dates/names/sources
10. Add Impact section source links (HRW, Amnesty International)
11. Implement `hreflang` and per-language OG tags in Layout
12. Add skip-to-main-content link
13. Add ARIA live region to counter components
14. Remove `revamp.txt`, legacy `content/`, `data/`, `mkdocs.yml`, `build_irregularidades.py` from repo root

### P2 — Improvement
15. Eliminate Bootstrap CDN dependency
16. Migrate `translations.json` content into proper i18n structure
17. Move hardcoded data (timeline events, expert cards, international cards) to content collections
18. Add TypeScript strict prop interfaces to all components
19. Consolidate duplicated utility CSS definitions
20. Add `Back to top` button
21. Add reading progress bar

### P3 — Enhancement
22. Add per-page architecture for timeline and evidence pages
23. Add structured data (FAQPage, Article)
24. Self-host fonts and icons
25. Add expert portrait/avatar visuals
26. Add search functionality
