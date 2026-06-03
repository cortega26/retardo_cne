# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
npm run lint:css         # Stylelint
npm run lint             # Both
npm run format           # Prettier

# Testing
npm run test:e2e         # Playwright (chromium only)
npx playwright test --ui # UI mode

# Performance
npm run lighthouse       # Lighthouse CI local (requires Chrome)
```

## Project

Static website documenting verified electoral violations by Venezuela's CNE during the 2024 presidential election. Audience: Venezuelan citizens. Tone: technical, evidence-first, legal-normative.

- **Stack**: Astro 6, Tailwind CSS v4 (incremental revamp from legacy modern.css/Bootstrap), TypeScript
- **Node**: 24 (per `.nvmrc` and CI)
- **Deploy**: GitHub Actions → GitHub Pages at tooltician.com/retardo_cne
- **CI** (`.github/workflows/ci.yml`): lint → build → Lighthouse CI on push/PR to main
- **Deploy** (`.github/workflows/deploy.yml`): build → deploy to GitHub Pages on push to main

## i18n

Bilingual site with Astro i18n. Spanish is default (no prefix in URL), English at `/en/`.

- **UI strings**: `src/i18n/ui.ts` — shared `ui` object with `es`/`en` keys, imported via `useTranslations(lang)`
- **Fallback strings**: `assets/data/translations.json` — loaded second by `src/i18n/utils.ts`
- All components receive `lang` and `t` (translator function) from their page, not via `Astro.currentLocale`
- Pages: `src/pages/index.astro` (ES), `src/pages/en/index.astro` (EN), `/metodologia` variants

## Content

Irregularidades content lives in `src/content/irregularidades/{es,en}/` as Markdown files, loaded via `src/content.config.ts` with Zod-schema validation (id, title, afirmacion, norma, evidencia, impacto, optional replica/sources).

The script `scripts/build_irregularidades.py` processes `.docx` files and generates `docs/irregularidades.md` + `data/sources.csv` — independent pipeline from the Astro site.

## Architecture (single-page app)

`src/pages/index.astro` imports components in order — they render as stacked in-page sections. Key sections:
**Hero → QuickFacts → Summary → ThreeMinuteReview → LegalDeadlines → Timeline → Context (Electoral Architecture) → Irregularidades → PostElectionAudits → VerifiedActas → International → Analysis → FAQ → BackgroundCards → Impact → Action → Share → Footer**

Each section is a component in `src/components/`. The layout (`src/layouts/Layout.astro`) handles SEO/meta tags, font loading, and legacy CSS bridge.

### Styling layering (revamp in progress)

1. **Legacy**: `public/assets/css/modern.css` + Bootstrap 5.3 (from old site, being phased out)
2. **Bridge**: `public/assets/css/bridge.css` — maps old class names to new tokens
3. **Design tokens**: `src/styles/theme.css` — Tailwind v4 `@theme` block (brand, breach, lawful, neutral palettes, typography, radii, shadows). No Tailwind preflight (avoids collision with Bootstrap)
4. **Global**: `src/styles/global.css` — token bridge variables, hero, navbar, card, focus-ring styles, responsive breakpoints
5. **Dark mode**: toggled via `body.dark-mode` class, persisted in localStorage. `theme-init.js` runs inline to prevent flash

### Key gotchas

- Tailwind's `.collapse` utility conflicts with Bootstrap's `.collapse` component — fixed in global.css with unlayered `visibility: visible` override
- Astro content collections use `glob()` loader, not legacy `Astro.glob()`
- Tests run against a static build served via `scripts/serve.js`, not against `astro dev`
- Base path is `/retardo_cne` — the static server and all `<link>`/`<script>` paths must account for it
