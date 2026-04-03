# ASTRO_MIGRATION_BACKLOG.md
# Retardo CNE — Astro Migration Execution Backlog

**Version:** 1.0  
**Created:** 2026-04-01  
**Based on:** ASTRO_MIGRATION_AUDIT.md + ASTRO_MIGRATION_IMPLEMENTATION_PLAN.md  

All items default to `status: todo`. Update status to `in-progress` or `done` as work progresses.

---

## How to Use This Backlog

1. Work items in **phase order** (P0 → P1 → P2 → P3 → P4 → P5)
2. Within each phase, work items in **ID order** unless dependencies require otherwise
3. Mark items `in-progress` before starting; mark `done` only after acceptance criteria are met
4. Do NOT skip to a later phase if earlier phase items are not `done`

---

## PHASE 0 — Emergency Stabilization (BLOCKING)

---

### BL-001
| Field | Value |
|---|---|
| **ID** | BL-001 |
| **Title** | Add all missing i18n keys to ui.ts |
| **Category** | frontend, i18n |
| **Priority** | P0 |
| **Status** | done |

**Completed:** 2026-04-01. Added 24 missing keys (ES + EN) to ui.ts covering: cred_docs, cred_update, cred_corrections, hero_stat_1–3 and all source labels, source_label, methodology_text, status_label, card_carter_text, card_un_text, card_eu_text, card_oas_text, international_title, international_intro, footer_rights, footer_opensource, analysis_subtitle.

**Problem Statement:**  
~25 keys referenced in components are not defined in `src/i18n/ui.ts`. The `useTranslations` fallback silently returns the key string, causing sections to render as empty or with raw key text. This is the primary cause of blank section regressions in the local dev version.

**Proposed Action:**  
1. Read `src/i18n/ui.ts` fully to understand existing key structure
2. Read each component file that renders blank (Hero.astro, Summary.astro, International.astro, Footer.astro, Counter.astro, etc.)
3. Extract all `t('key_name')` calls that reference undefined keys
4. Cross-reference with `index.html` (original live site) for the exact copy to use
5. Add each missing key to BOTH the `es` and `en` blocks in `ui.ts`
6. If a key exists in `assets/data/translations.json` but not in `ui.ts`, check if the utils.ts lookup chain resolves it — if yes, no change needed; if no, migrate it to `ui.ts`

**Minimum keys to add (both ES and EN):**
```
cred_docs, cred_update, cred_corrections
hero_stat_1, hero_stat_2, hero_stat_3
hero_stat_1_source_primary, hero_stat_1_source_archive
hero_stat_2_source_carter, hero_stat_2_source_un
hero_stat_3_source_lopre, hero_stat_3_source_audits
source_label (vs sources_label — check which components use which)
methodology_text
status_label
card_carter_text, card_un_text, card_eu_text, card_oas_text
international_title, international_intro
footer_rights, footer_opensource
analysis_subtitle
```

**Acceptance Criteria:**  
- Every section renders visible text content in both ES and EN routes
- `grep -rn "return key" src/i18n/utils.ts` fallback is not being triggered for any visible section
- No raw key strings visible in browser DOM (`document.body.innerText` inspection)
- `astro build` completes with 0 errors

**Dependencies:** None  
**Risk/Regression Notes:** Low risk — additive only. Do not remove or rename existing keys.

---

### BL-002
| Field | Value |
|---|---|
| **ID** | BL-002 |
| **Title** | Fix en/observadores.md invalid frontmatter |
| **Category** | content, architecture |
| **Priority** | P0 |
| **Status** | done |

**Completed:** 2026-04-01. Rewrote en/observadores.md with correct --- delimiters and all required fields (id, title, afirmacion, norma, evidencia, impacto, replica, sources).

**Problem Statement:**  
`src/content/irregularidades/en/observadores.md` triggers `InvalidContentEntryDataError` because it has invalid or missing YAML frontmatter delimiters. This prevents the EN content collection from loading all 7 irregularity case cards.

**Proposed Action:**  
1. Open `src/content/irregularidades/en/observadores.md`
2. Inspect the frontmatter — verify opening and closing `---` delimiters exist
3. Verify the required fields match the schema in `content.config.ts`:  
   `id` (number), `title` (string), `afirmacion` (string), `norma` (string), `evidencia` (string), `impacto` (string), `replica` (string, optional), `sources` (string[], optional)
4. Cross-reference with `src/content/irregularidades/es/observadores.md` for guidance
5. Repair the frontmatter so it parses correctly

**Acceptance Criteria:**  
- `astro dev` starts without `InvalidContentEntryDataError`
- EN route `/retardo_cne/en/` shows 7 irregularity case cards (not 6)
- `astro build` completes with 0 content collection errors

**Dependencies:** None  
**Risk/Regression Notes:** None — content-only fix.

---

### BL-003
| Field | Value |
|---|---|
| **ID** | BL-003 |
| **Title** | Fix favicon reference in Layout.astro |
| **Category** | frontend |
| **Priority** | P0 |
| **Status** | done |

**Completed:** 2026-04-01. Changed Layout.astro favicon link from favicon.svg to favicon.ico.

**Problem Statement:**  
`src/layouts/Layout.astro` has `<link rel="icon" type="image/svg+xml" href={basePath + '/favicon.svg'} />` but `public/favicon.svg` does not exist. Only `public/favicon.ico` and a root-level `favicon.ico` exist.

**Proposed Action:**  
Option A (preferred): Change the `<link rel="icon">` to:
```html
<link rel="icon" href={`${basePath}/favicon.ico`} />
```
Option B: Create a `public/favicon.svg` (a simple Venezuelan flag-inspired icon or a document icon matching the site brand).

**Acceptance Criteria:**  
- No 404 for favicon in browser Network tab
- Favicon visible in browser tab

**Dependencies:** None  
**Risk/Regression Notes:** None — trivial asset fix.

---

### BL-004
| Field | Value |
|---|---|
| **ID** | BL-004 |
| **Title** | Repair all expert analysis source links |
| **Category** | content, frontend |
| **Priority** | P0 |
| **Status** | done |

**Completed:** 2026-04-01. Added url field to experts array with verified URLs: Tao (terrytao.wordpress.com), Kronick (dorothykronick.com), Gelman (statmodeling.stat.columbia.edu), Mebane (websites.umich.edu/~wmebane). All links open target=_blank rel=noopener noreferrer.

**Problem Statement:**  
`src/components/Analysis.astro` has source buttons linking to `href="#"` for all 4 experts. This is a critical credibility failure — the site claims to be evidence-based but its expert analysis links go nowhere.

**Proposed Action:**  
Find and add the real URLs for each expert's analysis:
- **Terence Tao:** His blog post on July 28-29 2024 examining decimal distribution in Venezuela CNE bulletins (search: "Terence Tao Venezuela election 2024 blog")
- **Dorothy Kronick:** UC Berkeley faculty page or academic paper on Venezuelan election data (search: "Kronick Venezuela 2024 election analysis")  
- **Andrew Gelman:** Statistical Modeling, Causal Inference, and Social Science blog post (search: "Gelman Venezuela election 2024")
- **Walter Mebane:** University of Michigan research page or working paper (search: "Mebane Benford Venezuela 2024")

Update the `experts` array in `Analysis.astro` to include a `url` field; update the template to use `href={expert.url}`.

**Acceptance Criteria:**  
- All 4 expert cards have source buttons with real, working URLs
- Buttons open links in `target="_blank" rel="noopener noreferrer"`
- No source button links to `#`

**Dependencies:** None  
**Risk/Regression Notes:** Medium — must verify URLs are accurate and stable (prefer academic/institutional pages over social media).

---

### BL-005
| Field | Value |
|---|---|
| **ID** | BL-005 |
| **Title** | Merge Share.astro and SocialShare.astro into one component |
| **Category** | architecture, frontend |
| **Priority** | P0 |
| **Status** | done |

**Completed:** 2026-04-01. Confirmed SocialShare.astro had no imports anywhere in src/. Deleted SocialShare.astro. Share.astro (canonical) implements X/Twitter, WhatsApp, and Telegram.

**Problem Statement:**  
Both `src/components/Share.astro` and `src/components/SocialShare.astro` exist with overlapping functionality. `index.astro` imports `Share.astro`. `SocialShare.astro` may be an orphaned component. This creates confusion about which is canonical.

**Proposed Action:**  
1. Open both files and compare their features
2. Determine which is imported in `index.astro` (currently: `Share.astro`)
3. If `SocialShare.astro` has features not in `Share.astro`, merge them into `Share.astro`
4. Delete `SocialShare.astro`
5. Verify no other file imports `SocialShare.astro`

**Acceptance Criteria:**  
- Only one share component exists (`Share.astro`)
- Social share buttons (X/Twitter, WhatsApp, Telegram) are all working
- No orphaned component imports

**Dependencies:** None  
**Risk/Regression Notes:** None — verify no imports exist for the deleted file.

---

### BL-006
| Field | Value |
|---|---|
| **ID** | BL-006 |
| **Title** | Validate full visual parity between local dev and live site |
| **Category** | qa |
| **Priority** | P0 |
| **Status** | done |

**Completed:** 2026-04-01. astro build completed 0 errors. Visual screenshots confirmed all sections render with full content in ES and EN: credibility strip, international cards (4), footer rights/opensource, hero stat cards, summary methodology text, counter status labels. No blank grey rectangles.

**Problem Statement:**  
After completing BL-001 through BL-005, a systematic side-by-side comparison must confirm that the Astro local dev version matches the live site for all 18 sections.

**Proposed Action:**  
1. Open both `localhost:4321/retardo_cne/` and `cortega26.github.io/retardo_cne/` in separate windows
2. Scroll through each section in both and document any remaining visual differences
3. Repeat for EN route: `localhost:4321/retardo_cne/en/` vs live EN mode
4. Fix any remaining gaps found

**Acceptance Criteria:**  
- All 18 sections of the live site render in the local Astro version
- No section shows blank or fallback content
- Both ES and EN routes verified

**Dependencies:** BL-001, BL-002, BL-003, BL-004, BL-005  
**Risk/Regression Notes:** This is a gate — do not proceed to P1 until this passes.

---

## PHASE 1 — Content Completeness and Accuracy

---

### BL-010
| Field | Value |
|---|---|
| **ID** | BL-010 |
| **Title** | Expand FAQ from 3 to 8–10 items |
| **Category** | content |
| **Priority** | P1 |
| **Status** | done |

**Problem Statement:**  
The FAQ section has only 3 items, which is insufficient for a complex subject where skeptics will have many questions. The live site had richer counterpoint content.

**Proposed Action:**  
Add 5–7 new FAQ items (both ES and EN) covering:
1. (existing) What does LOPRE say about results?
2. (existing) Was there really a hack?
3. (existing) Why are audits important?
4. **[NEW]** What is the difference between totalization and the Electoral Gazette?
5. **[NEW]** What did the Carter Center specifically request?
6. **[NEW]** Are citizen actas (minutes) legally valid documents?
7. **[NEW]** What does "mesa" (precinct/table) level results mean technically?
8. **[NEW]** Did any Venezuelan court rule on the electoral disputes?
9. **[NEW]** What happened to witnesses and volunteers after July 28?
10. **[NEW]** What is the Macedonia del Norte case study and why does it matter?

Each FAQ must include a citation source. Add new keys to `ui.ts` or use content collections.

**Acceptance Criteria:**  
- FAQ accordion has 8+ items
- Each item has at least one source citation
- All items fully translated in ES and EN
- Accordion is functional (opens/closes correctly)

**Dependencies:** BL-006 (Phase 0 complete)  
**Risk/Regression Notes:** Adding new i18n keys — follow same pattern as BL-001.

---

### BL-011
| Field | Value |
|---|---|
| **ID** | BL-011 |
| **Title** | Enrich Background Cards with specific facts, dates, and sources |
| **Category** | content |
| **Priority** | P1 |
| **Status** | done |

**Problem Statement:**  
The 3 Background Cards ("Institutional Crisis", "Electoral Guarantees", "International Observation") have one-sentence vague descriptions with no specific dates or source citations. A skeptic can dismiss them in seconds.

**Proposed Action:**  
For each card, rewrite the content to include:
- At least 2 specific dates or events (e.g., "2021: TSJ appoints 5 CNE rectors...")
- At least 1 named institution or document
- At least 1 source link (add a `sources` array to each card object)

Example rewrites:
- **Institutional Crisis:** Cite TSJ rector appointments (2021), AN capacity removal (2017), Barinas re-election nullification (2022)
- **Electoral Guarantees:** Cite EU observer mission revocation (May 2024), Corina Yoris candidacy blocked (March 2024), diaspora voter registration blocks
- **International Observation:** Cite Carter Center withdrawal, EU reaction, specific dates

**Acceptance Criteria:**  
- Each card has ≥2 specific dated facts
- At least 1 external source link per card
- Both ES and EN versions updated

**Dependencies:** BL-006  
**Risk/Regression Notes:** All claims must be verifiable. Only add facts with confirmed sources.

---

### BL-012
| Field | Value |
|---|---|
| **ID** | BL-012 |
| **Title** | Add verbatim quotes and dates to International Community cards |
| **Category** | content, frontend |
| **Priority** | P1 |
| **Status** | done |

**Problem Statement:**  
The 4 International Community cards (Carter Center, UN, EU, OAS) show generic summaries without dates, quotes, or direct links to source documents. This is reputationally significant — these institutions' actual words are far more credible than a paraphrase.

**Proposed Action:**  
1. Find the actual official statements from each organization post-July 28, 2024
2. Add to each card:
   - **Date** of the statement
   - **Verbatim quote** (2–4 sentences max, in the organization's original language, with attribution)
   - **Direct URL** to source document
3. Update `International.astro` to display `date`, `quote`, and `url` fields
4. Add corresponding data to i18n strings or a new content collection (see BL-031 in Phase 2)

**Acceptance Criteria:**  
- Each card shows: org name, date, verbatim/paraphrased quote, working source link
- URL verified as accessible
- ES and EN versions available (quotes can be in original language with ES/EN context)

**Dependencies:** BL-006  
**Risk/Regression Notes:** Verbatim quotes must be accurate — misquoting international bodies is a major credibility risk.

---

### BL-013
| Field | Value |
|---|---|
| **ID** | BL-013 |
| **Title** | Add source links to Impact section |
| **Category** | content |
| **Priority** | P1 |
| **Status** | done |

**Problem Statement:**  
The Impact section has 3 indicators: "Civic Space Closure", "Institutional Legitimacy", "Global Isolation". These make claims about persecution of witnesses and volunteers that are unlinked to any specific documentation.

**Proposed Action:**  
For "Civic Space Closure" specifically:
- Link to Human Rights Watch Venezuela 2024 election report
- Link to Amnesty International documentation of arrests/persecution

For "Global Isolation":
- Link to a list of countries/organizations that did not recognize results

Add source links to the impact indicator objects in `Impact.astro`.

**Acceptance Criteria:**  
- Each impact indicator has at least 1 external source link
- All links verified as accessible

**Dependencies:** BL-006  
**Risk/Regression Notes:** "Persecution" claims carry strong connotations — ensure the HRW/AI sources specifically document what is claimed.

---

### BL-014
| Field | Value |
|---|---|
| **ID** | BL-014 |
| **Title** | Clean up legacy files from repo root |
| **Category** | architecture |
| **Priority** | P1 |
| **Status** | done |

**Problem Statement:**  
The repo root contains multiple files that are not part of the Astro build and add confusion + risk:
- `revamp.txt` (48KB planning document)
- `build_irregularidades.py` (Python script, non-standard tooling)
- `content/` directory (root-level, separate from `src/content/`)
- `data/` directory (root-level legacy data)
- `mkdocs.yml` (MkDocs config alongside Astro project)

**Proposed Action:**  
1. `grep -r "revamp.txt\|build_irregularidades\|^content/\|^data/" src/ astro.config.mjs package.json` — verify none are referenced in build
2. `revamp.txt` → move to `docs/retardo-cne/archive/revamp-notes.txt`
3. `build_irregularidades.py` → if needed, move to `scripts/`; if not, delete
4. `content/` (root) → verify not referenced, then delete
5. `data/` (root) → verify not referenced, then delete  
6. `mkdocs.yml` → if MkDocs is an active separate project, isolate; if not, delete

**Acceptance Criteria:**  
- `astro build` succeeds after cleanup
- Repo root contains only expected Astro project files
- No references to deleted files in any active source file

**Dependencies:** BL-006  
**Risk/Regression Notes:** HIGH — verify all `grep` checks before deleting. Never delete without confirmation of no references.

---

## PHASE 2 — Architecture and Technical Quality

---

### BL-020
| Field | Value |
|---|---|
| **ID** | BL-020 |
| **Title** | Eliminate Bootstrap CSS CDN dependency |
| **Category** | frontend, performance |
| **Priority** | P2 |
| **Status** | done |

**Problem Statement:**  
Bootstrap CSS loaded from CDN adds ~230KB to every page load, most of which is unused. The project already has a strong custom CSS design token system in `global.css`. Bootstrap's grid and utility classes are the only remaining reason to keep it.

**Proposed Action:**  
1. Audit which Bootstrap CSS classes are actually used: `grep -rn "col-\|row\|container\|d-flex\|d-none\|mt-\|mb-\|p-\|gap-" src/components/*.astro`
2. Implement a minimal grid in `global.css` (12-column flex grid, ~80 lines)
3. Implement the Bootstrap utilities actually used as custom classes in `global.css`
4. Remove the Bootstrap CSS CDN link from `Layout.astro`
5. Test all sections visually — fix any layout breaks
6. Keep Bootstrap JS for now (dropdowns, accordions still need it)

**Acceptance Criteria:**  
- Bootstrap CSS CDN removed from `Layout.astro`
- All sections render correctly (screenshot comparison vs Phase 0 baseline)
- Lighthouse Performance score improves by ≥15 points
- `astro build` succeeds

**Dependencies:** BL-006 (Phase 0 complete)  
**Risk/Regression Notes:** HIGH — must be done on a separate git branch. Requires systematic layout testing. Do this task LAST in Phase 2.

---

### BL-021
| Field | Value |
|---|---|
| **ID** | BL-021 |
| **Title** | Consolidate duplicate CSS utility definitions |
| **Category** | frontend, architecture |
| **Priority** | P2 |
| **Status** | done |

**Problem Statement:**  
CSS utility classes like `.bg-secondary`, `.bg-surface`, `.text-primary`, `.text-secondary`, `.border-subtle`, `.bg-success`, `.bg-danger` are defined in 8+ component `<style>` blocks. This violates DRY principle and makes theming changes require touching every component.

**Proposed Action:**  
1. `grep -rn "\.bg-secondary\|\.bg-surface\|\.text-primary\|\.text-secondary\|\.border-subtle" src/components/` — find all duplicated definitions
2. Move all definitions to `global.css` in a "Component Utilities" section
3. Remove duplicate definitions from individual component `<style>` blocks
4. Keep component-specific styles (unique to that component) in component `<style>` blocks

**Acceptance Criteria:**  
- `grep -n "\.bg-secondary" src/components/*.astro` → 0 matches (defined only in global.css)
- All sections render correctly after cleanup

**Dependencies:** BL-006  
**Risk/Regression Notes:** Medium — CSS specificity changes possible; test visually.

---

### BL-022
| Field | Value |
|---|---|
| **ID** | BL-022 |
| **Title** | Fix package.json type conflict |
| **Category** | architecture |
| **Priority** | P2 |
| **Status** | done |

**Problem Statement:**  
`package.json` declares `"type": "commonjs"` which conflicts with Astro's ESM expectation. This can cause subtle build issues and is semantically incorrect.

**Proposed Action:**  
Remove the `"type": "commonjs"` line from `package.json`. Verify no CommonJS-specific patterns (`require()`, `module.exports`) exist in Astro source files.

**Acceptance Criteria:**  
- `package.json` has no `"type"` field or has `"type": "module"`
- `astro build` succeeds
- No CJS-related errors in `astro dev`

**Dependencies:** None  
**Risk/Regression Notes:** Low — Astro handles module resolution internally.

---

### BL-023
| Field | Value |
|---|---|
| **ID** | BL-023 |
| **Title** | Replace AOS library with CSS + IntersectionObserver |
| **Category** | performance, frontend |
| **Priority** | P2 |
| **Status** | done |

**Problem Statement:**  
AOS (Animate On Scroll) is loaded from CDN, adding another external dependency. It adds ~250ms of blocking behavior. All its functionality can be replicated with 30–50 lines of native CSS + JavaScript.

**Proposed Action:**  
1. Add CSS keyframe animations to `global.css`:
   ```css
   @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
   @keyframes fadeRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: none; } }
   .animate-on-scroll { opacity: 0; }
   .animate-on-scroll.is-visible { animation: fadeUp 0.6s ease forwards; }
   ```
2. Add an `IntersectionObserver` script to `Layout.astro`:
   ```javascript
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); } });
   }, { threshold: 0.1 });
   document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
   ```
3. Replace all `data-aos="fade-up"` with `class="animate-on-scroll"` in components
4. Remove AOS CDN links from `Layout.astro`
5. Remove AOS imports from `index.astro` and `en/index.astro`

**Acceptance Criteria:**  
- No AOS CDN links in `Layout.astro`
- No `data-aos` attributes in any component
- Sections still animate in on scroll
- `document.querySelectorAll('[data-aos]').length === 0` in browser console

**Dependencies:** BL-006  
**Risk/Regression Notes:** Low — animation library replacement.

---

### BL-024
| Field | Value |
|---|---|
| **ID** | BL-024 |
| **Title** | Add TypeScript prop interfaces to all components |
| **Category** | architecture, frontend |
| **Priority** | P2 |
| **Status** | done |

**Problem Statement:**  
Most components use `Astro.props` without TypeScript `interface Props` declarations. This means prop type errors are invisible at build time.

**Proposed Action:**  
For every component, add (or verify existing) `interface Props { ... }` block listing all expected props. Components with no props should have an empty `interface Props {}` or no interface (Astro default).

Check existing: `Counter.astro` already has Props ✅  
Need to add: All other components that receive props via `Astro.props`.

**Acceptance Criteria:**  
- `astro check` reports 0 type errors
- Every component receiving props has a typed interface

**Dependencies:** BL-006  
**Risk/Regression Notes:** Low — additive type declarations.

---

### BL-025
| Field | Value |
|---|---|
| **ID** | BL-025 |
| **Title** | Add SEO metadata infrastructure to Layout.astro |
| **Category** | seo |
| **Priority** | P2 |
| **Status** | done |

**Problem Statement:**  
`Layout.astro` accepts only a `title` prop. It has:
- Static `<meta name="description">` (not per-language)
- Static `og:url` (hardcoded)
- No `hreflang` alternate links
- No `og:locale`
- No canonical URL

**Proposed Action:**  
Update `Layout.astro` to accept:
```typescript
interface Props {
  title: string;
  description: string;
  lang?: string;
  canonical?: string;
  hreflangEs?: string;
  hreflangEn?: string;
}
```

Add to `<head>`:
```html
<meta name="description" content={description} />
<link rel="canonical" href={canonical ?? Astro.url.href} />
<link rel="alternate" hreflang="es" href={hreflangEs ?? 'https://cortega26.github.io/retardo_cne/'} />
<link rel="alternate" hreflang="en" href={hreflangEn ?? 'https://cortega26.github.io/retardo_cne/en/'} />
<meta property="og:locale" content={lang === 'en' ? 'en_US' : 'es_VE'} />
```

Update `index.astro` and `en/index.astro` to pass language-appropriate descriptions.

**Acceptance Criteria:**  
- Each route has a language-appropriate `<meta name="description">`
- Both routes have `hreflang` alternates
- `og:locale` is correct per language
- No hardcoded URLs in Layout (use `Astro.site` instead)

**Dependencies:** BL-006  
**Risk/Regression Notes:** Low — `<head>` additions.

---

### BL-030
| Field | Value |
|---|---|
| **ID** | BL-030 |
| **Title** | Migrate timeline events to content collection |
| **Category** | architecture, content |
| **Priority** | P2 |
| **Status** | done |

**Problem Statement:**  
Timeline events are hardcoded as a JavaScript array in `Timeline.astro`, mixing data and presentation. They're not easily updatable, auditable, or localizable independently.

**Proposed Action:**  
1. Create `src/content/timeline/` collection with `es/` and `en/` subdirectories
2. Define schema in `content.config.ts`:
   ```typescript
   const timeline = defineCollection({
     loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/timeline' }),
     schema: z.object({
       id: z.number(),
       date: z.string(),
       event: z.string(),
       status: z.enum(['normal', 'violation', 'overdue', 'suspended', 'met']),
       sources: z.array(z.string()).optional(),
     })
   });
   ```
3. Create 8 markdown files per language (event_1.md through event_8.md)
4. Update `Timeline.astro` to use `getCollection('timeline')` filtered by lang
5. Remove hardcoded milestones array from `Timeline.astro`

**Acceptance Criteria:**  
- Timeline renders identically from content collection data
- Both ES and EN timeline data files exist
- `astro build` succeeds

**Dependencies:** BL-006  
**Risk/Regression Notes:** Medium — data migration; keep old array commented until verified.

---

### BL-031
| Field | Value |
|---|---|
| **ID** | BL-031 |
| **Title** | Migrate international reactions to content collection |
| **Category** | architecture, content |
| **Priority** | P2 |
| **Status** | done |

**Problem Statement:**  
International community data is hardcoded as a JavaScript array in `International.astro`. As BL-012 adds quotes and dates, this needs to move to a content collection.

**Proposed Action:**  
1. Create `src/content/international/` collection with `es/` and `en/` subdirectories
2. Schema:
   ```typescript
   z.object({
     id: z.string(),
     org: z.string(),
     orgShort: z.string(),
     date: z.string(),
     quote: z.string(),
     summary: z.string(),
     url: z.string().url(),
     icon: z.string(),
   })
   ```
3. Create 4 markdown files per language (carter.md, un.md, eu.md, oas.md)
4. Update `International.astro` to use `getCollection('international')` filtered by lang

**Acceptance Criteria:**  
- International section renders from collection data
- Both ES and EN data files exist with full content (quotes + dates + URLs)

**Dependencies:** BL-012, BL-006  
**Risk/Regression Notes:** Medium.

---

### BL-032
| Field | Value |
|---|---|
| **ID** | BL-032 |
| **Title** | Migrate expert analyses to content collection |
| **Category** | architecture, content |
| **Priority** | P2 |
| **Status** | done |

**Problem Statement:**  
Expert analysis data is hardcoded in `Analysis.astro`. After BL-004 adds real URLs, this data should be in a content collection.

**Proposed Action:**  
1. Create `src/content/experts/` collection with `es/` and `en/` subdirectories
2. Schema includes: `id`, `name`, `institution`, `role`, `summary`, `url`, `finding_type`
3. Create 4 markdown files per language
4. Update `Analysis.astro` to use `getCollection('experts')`

**Acceptance Criteria:**  
- Expert cards render from collection data (all 4 experts, both languages)
- Real URLs are included in all entries

**Dependencies:** BL-004, BL-006  
**Risk/Regression Notes:** Medium.

---

## PHASE 3 — Design Polish and UX

---

### BL-040
| Field | Value |
|---|---|
| **ID** | BL-040 |
| **Title** | Add skip-to-main-content link |
| **Category** | a11y |
| **Priority** | P3 |
| **Status** | done |

**Problem Statement:**  
No skip navigation link exists. Keyboard-only users must tab through the entire navbar before reaching main content.

**Proposed Action:**  
Add as the first child of `<body>` in `Layout.astro`:
```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```
Add CSS to `global.css`:
```css
.skip-link { position: absolute; transform: translateY(-100%); background: var(--indigo-600); color: white; padding: 0.5rem 1rem; z-index: 9999; }
.skip-link:focus { transform: translateY(0); }
```
Add `id="main-content"` to the `<main>` element in both page files.

**Acceptance Criteria:**  
- Tab once from page top → "Skip to main content" is visible
- Activating it jumps focus to main content area
- Link is hidden visually until focused

**Dependencies:** BL-020 (Phase 2) recommended but not blocking  
**Risk/Regression Notes:** None.

---

### BL-041
| Field | Value |
|---|---|
| **ID** | BL-041 |
| **Title** | Add ARIA live region to deadline counters |
| **Category** | a11y |
| **Priority** | P3 |
| **Status** | done |

**Problem Statement:**  
The live deadline counters update every second. Screen readers receive no announcement of these updates. This is both an accessibility failure and can create noise for AT users.

**Proposed Action:**  
In `Counter.astro`, update the counter grid div:
```html
<div id={id} class="counter-grid ..." aria-live="polite" aria-atomic="true" data-target={targetDate}>
```
Note: `aria-live="polite"` announces updates without interrupting. May want to use `aria-live="off"` and only announce on minute changes rather than every second — evaluate user impact.

**Acceptance Criteria:**  
- Counter has `aria-live` attribute
- Screen reader announces counter updates at appropriate intervals

**Dependencies:** None  
**Risk/Regression Notes:** Low.

---

### BL-042
| Field | Value |
|---|---|
| **ID** | BL-042 |
| **Title** | Add Back to Top button |
| **Category** | ux |
| **Priority** | P3 |
| **Status** | done |

**Problem Statement:**  
The site has 18 sections across one long scrollable area. There is no way to return to the top without extensive scrolling.

**Proposed Action:**  
Create `src/components/ui/BackToTop.astro`:
- Fixed position, bottom-right, appears after 300px scroll
- Contains an up-arrow icon and accessible label
- Smooth scroll to top on click
- Styled consistently with site design (indigo + slate)

Include in `Layout.astro` or both page files.

**Acceptance Criteria:**  
- Button appears after scrolling 300px
- Button disappears when at top
- Smooth scroll to top on click
- Has `aria-label="Back to top"`

**Dependencies:** BL-020 recommended  
**Risk/Regression Notes:** None.

---

### BL-043
| Field | Value |
|---|---|
| **ID** | BL-043 |
| **Title** | Add expert initials avatars to Analysis cards |
| **Category** | design |
| **Priority** | P3 |
| **Status** | done |

**Problem Statement:**  
Expert analysis cards use a generic microscope icon for all 4 experts. First-name initials avatars would add visual distinction and make the cards feel more personal and credible.

**Proposed Action:**  
Replace the `fa-microscope` icon box with an initials-based circular avatar:
```html
<div class="expert-avatar" style="background: linear-gradient(135deg, #4f46e5, #6366f1);">
  {expert.name.split(' ').map(n => n[0]).join('').slice(0,2)}
</div>
```
Style as a 56×56px circle with white text.

**Acceptance Criteria:**  
- Each expert card shows distinct initials in styled circle
- Initials are correctly extracted from full names (TT, DK, AG, WM)

**Dependencies:** BL-032  
**Risk/Regression Notes:** None.

---

### BL-044
| Field | Value |
|---|---|
| **ID** | BL-044 |
| **Title** | Fix mobile font-size minimums |
| **Category** | ux, a11y, design |
| **Priority** | P3 |
| **Status** | done |

**Problem Statement:**  
Several elements use `font-size: 0.65rem` or `font-size: 0.6rem` (approximately 10px). This is below WCAG's recommended minimum of ~12px for readable text. Examples: `label-heading` in Irregularidades, counter labels.

**Proposed Action:**  
1. `grep -rn "font-size.*0\.[456]" src/components/` — find all sub-12px font sizes
2. Update minimum to `0.7rem` (11.2px) for decorative labels, `0.75rem` for readable content

**Acceptance Criteria:**  
- No `font-size` below `0.7rem` in any rendered component
- Visual appearance still reasonable (labels shouldn't grow too large)

**Dependencies:** None  
**Risk/Regression Notes:** Low — may require minor layout adjustments.

---

### BL-045
| Field | Value |
|---|---|
| **ID** | BL-045 |
| **Title** | Fix mobile horizontal overflow in Context section |
| **Category** | ux |
| **Priority** | P3 |
| **Status** | done |

**Problem Statement:**  
The Context section features a two-column comparison table ("PROCESO LEGAL" vs "EJECUCIÓN 2024"). This layout may overflow horizontally on narrow viewports (375px iPhones).

**Proposed Action:**  
1. Test at 375px viewport width
2. If overflow exists: add `overflow-x: auto` to the comparison container, or refactor to a stacked single-column layout on mobile

**Acceptance Criteria:**  
- At 375px viewport, no horizontal scrollbar on any section
- Context comparison is readable on mobile

**Dependencies:** BL-020 recommended  
**Risk/Regression Notes:** None.

---

## PHASE 4 — SEO and Structured Data

---

### BL-050
| Field | Value |
|---|---|
| **ID** | BL-050 |
| **Title** | Add FAQPage structured data |
| **Category** | seo |
| **Priority** | P4 |
| **Status** | done |

**Problem Statement:**  
The FAQ section is eligible for Google rich results (FAQ cards in SERPs). Structured data markup is not present.

**Proposed Action:**  
Add `<script type="application/ld+json">` with `@type: "FAQPage"` to `FAQ.astro`. Build the JSON from the FAQ array data. Include both the question and the full answer text.

**Acceptance Criteria:**  
- Google Rich Results Test validates `FAQPage` markup
- All FAQ items included in schema
- Schema is present on both ES and EN routes

**Dependencies:** BL-010 (expanded FAQs)  
**Risk/Regression Notes:** None.

---

### BL-051
| Field | Value |
|---|---|
| **ID** | BL-051 |
| **Title** | Add WebPage structured data |
| **Category** | seo |
| **Priority** | P4 |
| **Status** | done |

**Problem Statement:**  
No structured data at the page level to help search engines understand the nature, language, and publisher of the content.

**Proposed Action:**  
Add `WebPage` or `Article` JSON-LD in `Layout.astro`:
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "...",
  "description": "...",
  "url": "...",
  "inLanguage": "es|en",
  "dateModified": "2026-04-01"
}
```

**Acceptance Criteria:**  
- Google Structured Data Testing validates
- Both ES and EN routes have appropriate schema

**Dependencies:** BL-025  
**Risk/Regression Notes:** None.

---

### BL-052
| Field | Value |
|---|---|
| **ID** | BL-052 |
| **Title** | Verify and optimize sitemap |
| **Category** | seo |
| **Priority** | P4 |
| **Status** | done |

**Problem Statement:**  
`@astrojs/sitemap` is configured but the output has not been verified for correctness with bilingual i18n routing.

**Proposed Action:**  
1. Run `astro build` → inspect `dist/sitemap-index.xml` and `dist/sitemap-0.xml`
2. Verify both `/retardo_cne/` and `/retardo_cne/en/` appear
3. If not, configure sitemap integration with `i18n` options
4. Verify sitemap is accessible at `cortega26.github.io/retardo_cne/sitemap-index.xml`

**Acceptance Criteria:**  
- Both language routes in sitemap
- Sitemap accessible at live URL

**Dependencies:** BL-025, BL-006  
**Risk/Regression Notes:** None.

---

## PHASE 5 — Production Hardening

---

### BL-060
| Field | Value |
|---|---|
| **ID** | BL-060 |
| **Title** | Configure ESLint and Stylelint to pass with 0 errors |
| **Category** | architecture, qa |
| **Priority** | P5 |
| **Status** | done |

**Problem Statement:**  
`npm run lint` status is unknown — linting may be failing silently, making code quality measurement unreliable.

**Proposed Action:**  
1. Run `npm run lint` and capture all errors
2. Fix any real errors
3. Configure rules to ignore Astro-specific patterns in `.eslintrc.cjs` and `.stylelintrc.json` if needed
4. Ensure `npm run lint` exits with code 0

**Acceptance Criteria:**  
- `npm run lint` exits with 0
- No suppressed errors (all ignores are intentional)

**Dependencies:** BL-020, BL-021, BL-022  
**Risk/Regression Notes:** None.

---

### BL-061
| Field | Value |
|---|---|
| **ID** | BL-061 |
| **Title** | Write E2E tests for critical user flows |
| **Category** | qa |
| **Priority** | P5 |
| **Status** | done |

**Problem Statement:**  
Playwright is configured (`playwright.config.js` exists) but test coverage is unknown. No automated regression prevention for the Astro migration.

**Proposed Action:**  
Write Playwright tests for:
1. ES homepage loads and title contains "CNE"
2. EN homepage loads and title contains "CNE"
3. Language switcher navigates between routes
4. Theme toggle changes `body.classList` to include `dark-mode`
5. At least one Irregularidades case card renders
6. FAQ accordion first item opens on click
7. Counter displays a number > 0

**Acceptance Criteria:**  
- `npm run test:e2e` passes all tests against `astro preview` build
- Tests run in CI (GitHub Actions)

**Dependencies:** BL-006  
**Risk/Regression Notes:** None — test-only task.

---

### BL-062
| Field | Value |
|---|---|
| **ID** | BL-062 |
| **Title** | Set Lighthouse CI thresholds |
| **Category** | performance, qa |
| **Priority** | P5 |
| **Status** | done |

**Problem Statement:**  
`lighthouserc.json` exists but its threshold configuration is not confirmed to match post-migration quality targets.

**Proposed Action:**  
Set minimum scores in `lighthouserc.json`:
```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.85}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

**Acceptance Criteria:**  
- `npm run lighthouse` passes against built site
- All 4 categories meet minimum scores

**Dependencies:** BL-020 (Bootstrap removal critical for Performance), BL-040–BL-045 (a11y fixes)  
**Risk/Regression Notes:** None.

---

### BL-063
| Field | Value |
|---|---|
| **ID** | BL-063 |
| **Title** | Confirm Astro deployment replaces index.html on GitHub Pages |
| **Category** | architecture, qa |
| **Priority** | P5 |
| **Status** | done |

**Problem Statement:**  
The original monolithic `index.html` at the repo root may still be served by GitHub Pages if the Actions deploy script is not correctly configured to deploy from `dist/`, not from root.

**Proposed Action:**  
1. Inspect `.github/workflows/` deploy workflow
2. Confirm it builds with `astro build` and deploys from `dist/` to GitHub Pages
3. After confirming, move `index.html` to `docs/retardo-cne/archive/original-index.html`
4. Trigger a deployment and verify `cortega26.github.io/retardo_cne/` serves the Astro version

**Acceptance Criteria:**  
- `cortega26.github.io/retardo_cne/` serves the Astro-built site (verify by checking page source for Astro markers or new component structure)
- GitHub Actions pipeline is green

**Dependencies:** All Phase 0 through Phase 4 items  
**Risk/Regression Notes:** HIGH — confirm backup of original `index.html` before any deployment.

---

## Backlog Summary

| Phase | Items | Total P0 | Total P1 | Total P2 | Total P3 |
|---|---|---|---|---|---|
| P0 Emergency | BL-001 through BL-006 | 6 | — | — | — |
| P1 Content | BL-010 through BL-014 | — | 5 | — | — |
| P2 Architecture | BL-020 through BL-032 | — | — | 8 | — |
| P3 Design/UX | BL-040 through BL-045 | — | — | — | 6 |
| P4 SEO | BL-050 through BL-052 | — | — | — | — |
| P5 Hardening | BL-060 through BL-063 | — | — | — | — |
| **Total** | **28 items** | | | | |

**Current Status:** All items `todo`  
**Phase 0 must be 100% complete before Phase 1 begins.**
