# AGENTS.md

This is the source-of-truth guidance file for coding agents working in this
repository. `CLAUDE.md` at the repo root is a short pointer to this file —
edit this one.

## Commands

```sh
# Development
npm run dev              # Astro dev server (localhost:4321)
npm run build            # Static build to dist/
npm run preview          # Preview built site (requires build first)

# Static preview with correct base path
npm run build && PORT=4327 node scripts/serve.js dist

# Linting & format
npm run lint:js          # ESLint
npm run lint:css         # Stylelint (globs **/*.css only — does NOT lint
                          # <style> blocks inside .astro files)
npm run lint             # Both
npm run format            # Prettier

# Testing
npm run test:e2e         # Playwright (chromium only)
npx playwright test --ui # UI mode

# Evidence-integrity guardrail (required before lint/build)
npm run verify:claims    # Validates the reviewed expert-claim manifest

# Performance
npm run lighthouse       # Lighthouse CI local (requires Chrome)
```

<!-- DRIFT-CHECK:npm-scripts
dev, build, preview, lint:js, lint:css, lint, test:e2e, verify:claims, format, lighthouse
-->

## Project

Static website documenting verified electoral violations by Venezuela's CNE
during the 2024 presidential election. Audience: Venezuelan citizens. Tone:
technical, evidence-first, legal-normative.

- **Stack**: Astro 6, Tailwind CSS v4, TypeScript
- **Node**: 24 (per `.nvmrc` and CI)
- **Deploy**: GitHub Actions → GitHub Pages at tooltician.com/retardo_cne
- **CI** (`.github/workflows/ci.yml`): verified expert-claim manifest → lint →
  build → Lighthouse CI, plus a docs-drift check (see "Keeping this file
  current" below), on push/PR to main
- **Deploy** (`.github/workflows/deploy.yml`): build → deploy to GitHub Pages
  on push to main

## i18n

Bilingual site with Astro i18n. Spanish is default (no prefix in URL),
English at `/en/`.

- **UI strings**: `src/i18n/ui.ts` — shared `ui` object with `es`/`en` keys,
  imported via `useTranslations(lang)`
- **Fallback strings**: `assets/data/translations.json` — loaded second by
  `src/i18n/utils.ts`
- All components receive `lang` and `t` (translator function) from their
  page, not via `Astro.currentLocale`
- Pages: `src/pages/index.astro` (ES), `src/pages/en/index.astro` (EN),
  `/metodologia` variants

## Content

Irregularidades content lives in `src/content/irregularidades/{es,en}/` as
Markdown files, loaded via `src/content.config.ts` with Zod-schema
validation (`id`, `title`, `afirmacion`, `norma`, `evidencia`, `impacto`,
optional `replica`/`sources`/`publishedDate`/`reviewedDate`).

The script `scripts/build_irregularidades.py` processes `.docx` files and
generates `docs/irregularidades.md` + `data/sources.csv` — independent
pipeline from the Astro site.

### Evidence integrity — mandatory, no exceptions

This is an evidence-first public-interest site. A citation link is not enough:
every factual claim must say only what the cited source actually supports,
within the source's population, time period, method, and stated uncertainty.
Do not infer conclusions that a source does not make, merge conclusions from
different sources, or turn a statistical signal into proof of fraud.

The four expert summaries are a protected high-risk area. Their single source
of truth is `src/data/expert-claims.json`; rendered components must import that
manifest rather than maintaining a second paraphrase. Each record is required
to provide both language versions of the claim, the method, a material caveat,
the direct HTTPS primary-source URL, a precise locator, a statement of what the
source supports, and a retrieval date. `npm run verify:claims` enforces that
schema and CI runs it before lint/build. It catches missing provenance and
scope metadata; it does **not** establish that a paraphrase is true.

Before changing any evidence-backed text, agents and reviewers must complete
all of the following:

1. Open and read the original source, not a search snippet, press coverage, or
   a prior repository summary. Record a stable direct URL and a locator that a
   reviewer can find (page/section/paragraph/table).
2. Write a source-to-claim check: identify the exact object analysed, dataset,
   date/version, method, numerical denominator, and conclusion. Preserve every
   material limitation, conditional assumption, and alternative explanation in
   the public copy or its adjacent caveat.
3. Check scope before combining sources. In particular, Tao and Gelman discuss
   the first national bulletin announced by the CNE, while Kronick and Mebane
   evaluate opposition-published tally-sheet data. They must never be presented
   as four independent analyses of the same dataset or as jointly proving the
   same conclusion.
4. Update Spanish and English together. They must make the same factual claim,
   carry the same caveat, and link to the same underlying source unless the
   manifest expressly documents language-specific primary sources.
5. Run `npm run verify:claims`, `npm run build`, and the focused browser test
   before handoff. If the original source is inaccessible or does not support
   the wording, remove the assertion or label it explicitly as unverified; do
   not fill the gap from memory or plausible-sounding inference.

Forbidden formulations include: asserting that an analyst found a pattern,
method, probability, dataset, or conclusion absent from that analyst's work;
calling a model output proof of fraud when the source does not; and using
authority, institution, or a link as a substitute for the source's actual
claim. Any new high-risk factual section (elections, law, statistics, health,
security, or allegations of wrongdoing) must adopt an equivalent reviewed
claim manifest and CI validator before it is rendered.

## Architecture (single-page app)

`src/pages/index.astro` (and its EN mirror `src/pages/en/index.astro`)
import components in order — they render as stacked in-page sections. This
is a **5-act narrative**, not a generic marketing-page layout:

Navbar → SectionRail → Hero → Obligation → Existence → Anomaly →
MissingLink → Conclusion → Timeline → PostElectionAudits → Context →
Irregularidades → FAQ → BackgroundCards → PostInauguration → Impact →
Share → Action → Footer

<!-- DRIFT-CHECK:section-order
Navbar, SectionRail, Hero, Obligation, Existence, Anomaly, MissingLink, Conclusion, Timeline, PostElectionAudits, Context, Irregularidades, FAQ, BackgroundCards, PostInauguration, Impact, Share, Action, Footer
-->

Each section is a component in `src/components/`. The layout
(`src/layouts/Layout.astro`) handles SEO/meta tags, font loading, and the
skip-to-content link.

### Component inventory — not every file in `src/components/` renders

As of this writing, these components are **not imported directly by any
page** under `src/pages/` (some are still live indirectly, see notes below;
most render nowhere at all):

Analysis, Counter (live — imported by `Obligation.astro`, not by a page),
International, LegalDeadlines, QuickFacts, SourceList, Summary,
ThreeMinuteReview, VerifiedActas

<!-- DRIFT-CHECK:unimported-by-pages
Analysis, Counter, International, LegalDeadlines, QuickFacts, SourceList, Summary, ThreeMinuteReview, VerifiedActas
-->

Notes:

- `Counter` is the one exception: `Obligation.astro` imports it directly, so
  it _is_ live on the page despite not being imported by a page file. It
  stays in the list above (and in the drift-check block) only because the
  check's definition is "not imported under `src/pages/`," not "renders
  nowhere" — don't "fix" this by importing it directly into a page, and
  don't delete it as dead code.
- Every other name in the list above genuinely renders nowhere.
- `LegalDeadlines.astro` contains `<section id="main-content">`, which
  duplicates `<main id="main-content">` in `Layout.astro`. Rendering it
  as-is breaks the skip-to-content link and duplicates the `Counter`s
  `Obligation.astro` already shows.
- `Analysis.astro` and `Anomaly.astro` are near-duplicates covering the same
  four academics' statistical findings. Only `Anomaly.astro` is live
  (rendered at `#analisis-tecnico`). Editing `Analysis.astro` produces zero
  visible change — confirm with `grep -rn "components/<Name>" src/pages/`
  before styling anything under that section.

Before styling or "fixing" a component, confirm it's actually imported by a
page. Importing a currently-dead component to fill a perceived gap will
introduce duplicate ids/content — check anchors and ids first.

### Styling layering

The styling chain is three files imported by `Layout.astro`, in this order:

1. `src/styles/theme.css` — Tailwind v4 `@theme` block (design tokens:
   brand, breach, lawful, neutral palettes, typography, radii, shadows).
   Tailwind preflight **is** enabled here.
2. `src/styles/base.css` — replaces the old Bootstrap/`modern.min.css`
   bridge with hand-written base element styles.
3. `src/styles/global.css` — token bridge variables, hero, navbar, card,
   focus-ring styles, responsive breakpoints, and the card-taxonomy system
   (see below).

`public/vendor/css/modern.min.css` and `public/assets/css/bridge.css` still
exist as files in the repo but are **not referenced anywhere** in `src/` —
they are orphaned leftovers from the pre-Astro site, not part of the active
styling chain. Don't edit them expecting an effect on the live site.

Dark mode is driven by `public/assets/js/theme-init.js`, which reads
`localStorage`/`prefers-color-scheme` and sets **both** `data-theme` on
`<html>` (what `theme.css` tokens key off of) and a `body.dark-mode` class
(used by some component-level selectors) — inline in `<head>` to prevent a
flash of the wrong theme.

#### Card taxonomy (dossier design system)

The visual direction is a **"digital evidence dossier"**: rule lines,
exhibit tags, monospace metadata, stamped verdicts (solid-fill badges, sharp
corners), per-act accent colors. Deliberately _not_ skeuomorphic — no paper
grain, torn edges, or paperclip decorations; the subject matter (a withheld
government document) doesn't call for costume, it calls for structural
authority.

`.story-card` in `global.css` is a shared base with `!important` rules used
by stat tiles, case files, comparison panels, and impact notes. Type-specific
treatment lives in one block right after the `.story-card` base definition,
headed "Card taxonomy — dossier system", keyed by section `id` (`#obligacion`,
`#actas`, `#analisis`, `#analisis-tecnico`, `#auditorias`, `#impacto`).
Two components look like `.story-card` siblings but aren't: `Counter.astro`
(`.counter-card`) and `Obligation.astro`'s audit box (`.obligation-audits`) —
both have independently defined border/radius/background.

When adding a new "case file" or "stat tile" section, extend that taxonomy
block rather than writing new one-off card CSS.

## Known gotchas

- `npm run lint` only globs `**/*.css` — CSS inside `.astro` `<style>`
  blocks is never linted by `lint:css`.
- `tests/regression.spec.js` ("counter displays elapsed time") reads the
  live seconds digit and fails ~1 run in 60 when it happens to read `0`.
  Not a regression — re-run before investigating.
- Astro content collections use `glob()` loader, not legacy `Astro.glob()`.
- Tests run against a static build served via `scripts/serve.js`, not
  against `astro dev`.
- Base path is `/retardo_cne` — the static server and all `<link>`/
  `<script>` paths must account for it.

## Keeping this file current

This file is checked by an automated CI job
(`.github/workflows/ci.yml` → `docs-drift-check`, running
`scripts/check-docs-drift.mjs`) on every push and pull request to `main`.
The job re-derives three facts directly from the repo — the rendered
section order in `src/pages/index.astro`, the `npm run` scripts in
`package.json`, and which components in `src/components/` are unimported —
and diffs them against the `<!-- DRIFT-CHECK:* -->` blocks above. **If they
disagree, the CI job fails the build.**

This means: if your change adds, removes, or reorders a section on the page,
adds or removes an npm script, or changes which components are imported by
a page, you **must** update the matching `DRIFT-CHECK` block in this file in
the same PR, or CI will not go green. The job only checks the three facts
above (it cannot verify prose); it does not replace judgment for the rest of
this document. If you notice other guidance here has gone stale, fix it in
the same PR rather than leaving it for later — that's how this file drifted
out of sync with the codebase before.
