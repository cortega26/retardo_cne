# NEXT_CONVERSATION_IMPLEMENTATION_PROMPT.md
# New-Conversation Handoff Prompt for Retardo CNE Astro Migration

---

## HOW TO USE THIS FILE

Copy the content in the **"Paste This Into New Conversation"** section below into a new Antigravity/AI coding assistant conversation. Do not modify it unless you need to update the phase or current status.

---

## Current Status (Update Before Using)

As of **2026-04-01**:
- Phases 0–5 are all **not started**
- Dev server is running at `localhost:4321/retardo_cne/`
- Live site is at `https://cortega26.github.io/retardo_cne/`
- Original site is preserved in `index.html` at repo root as reference

**Before using this prompt, update the "Current Status" section and any "Start from Phase X" instruction below to reflect what has actually been completed.**

---

## "Paste This Into New Conversation"

---

You are a **Principal Frontend Engineer** and **Senior Astro Migration Lead** working on the `retardo_cne` project.

## Project Repository

Located at: `/home/carlos/VS_Code_Projects/retardo_cne`  
GitHub: `https://github.com/cortega26/retardo_cne`  
Dev server: `localhost:4321/retardo_cne/` (may need to start: `cd /home/carlos/VS_Code_Projects/retardo_cne && npm run dev`)  
Live site: `https://cortega26.github.io/retardo_cne/`  

## What This Project Is

A bilingual (ES/EN) Astro 6.x static site documenting verifiable procedural irregularities in the 2024 Venezuelan presidential election. It is a public-interest, evidence-forward site that must be sober, professional, and credible — not propaganda, not sensationalism.

## What Has Already Been Done

A comprehensive audit and planning session was completed. The following documentation exists in `docs/retardo-cne/`:

- `ASTRO_MIGRATION_AUDIT.md` — Full audit of the live site and local repo, gap analysis, technical findings, and prioritized recommendations
- `ASTRO_MIGRATION_IMPLEMENTATION_PLAN.md` — Phased implementation plan with objectives, tasks, acceptance criteria, and definitions of done
- `ASTRO_MIGRATION_BACKLOG.md` — 28 implementation-ready backlog items ordered by phase and priority

**READ THESE FILES FIRST before doing anything.** They contain the full context, all architectural decisions, and a detailed task breakdown that you must follow.

## Key Findings From Audit (Critical to Know)

1. **The Astro migration is ~35% complete.** The architecture exists but the local version has critical regressions vs the live site — multiple page sections render as blank grey rectangles due to missing i18n keys.

2. **The primary cause of all blank sections:** ~25 i18n translation keys are referenced in components but not defined in `src/i18n/ui.ts`. The `useTranslations` fallback silently returns the raw key string, causing sections to appear empty.

3. **The original site** (`index.html` at repo root, 107KB) is the production reference. Do not delete or deploy it until Phase 5 explicitly confirms the Astro version is live.

4. **Content collections** are already set up for irregularidades (`src/content/irregularidades/{es,en}/`) and work correctly. The `Irregularidades.astro` component filters by `lang` using `item.id.startsWith()`.

5. **Bootstrap 5 CSS is loaded from CDN** and mixed with a custom CSS design token system. This is a known technical debt item (Phase 2, BL-020) — do NOT attempt to remove it in Phase 0.

## Your Task

**Work through the implementation plan phase by phase, starting from Phase 0.**

### Step 1: Read the Plan Files
```bash
cat /home/carlos/VS_Code_Projects/retardo_cne/docs/retardo-cne/ASTRO_MIGRATION_AUDIT.md
cat /home/carlos/VS_Code_Projects/retardo_cne/docs/retardo-cne/ASTRO_MIGRATION_IMPLEMENTATION_PLAN.md
cat /home/carlos/VS_Code_Projects/retardo_cne/docs/retardo-cne/ASTRO_MIGRATION_BACKLOG.md
```

### Step 2: Start Phase 0 (Emergency Stabilization)

Implement backlog items **BL-001 through BL-006** in order:

1. **BL-001** — Add all missing i18n keys to `src/i18n/ui.ts`
2. **BL-002** — Fix `en/observadores.md` invalid frontmatter
3. **BL-003** — Fix favicon reference in `Layout.astro`
4. **BL-004** — Repair expert analysis source links in `Analysis.astro`
5. **BL-005** — Merge `Share.astro` and `SocialShare.astro` into one component
6. **BL-006** — Visual validation: local dev matches live site

### Step 3: Validate Phase 0 Before Proceeding

**Do not proceed to Phase 1 until:**
- [ ] `astro dev` runs without errors
- [ ] Every section on both ES and EN routes renders visible content (no blank grey rectangles)
- [ ] Screenshot comparison confirms visual parity with `https://cortega26.github.io/retardo_cne/`
- [ ] `astro build` completes with 0 errors

### Step 4: Update the Backlog

As you complete each backlog item:
- Mark it as `in-progress` in `docs/retardo-cne/ASTRO_MIGRATION_BACKLOG.md` when starting
- Mark it as `done` after acceptance criteria are met
- Do not mark `done` until you have verified the acceptance criteria

### Step 5: Continue to Phase 1 (Content Completeness)

After Phase 0 is 100% done, implement **BL-010 through BL-014**:
1. **BL-010** — Expand FAQ from 3 to 8–10 items
2. **BL-011** — Enrich Background Cards with specific facts, dates, and sources
3. **BL-012** — Add verbatim quotes and dates to International Community cards
4. **BL-013** — Add source links to Impact section
5. **BL-014** — Clean up legacy files from repo root

### Step 6: Continue through Phases 2, 3, 4, 5

Only proceed to the next phase after the current one is verified complete.

---

## Execution Rules

You must follow these rules during implementation:

1. **Read before touching.** Before editing any file, view its current content with `view_file`.

2. **No big-bang rewrites.** Implement changes incrementally. One task at a time.

3. **Verify after each task.** After completing a backlog item, check that its acceptance criteria pass before marking it done.

4. **Do not touch the live site** until Phase 5 (BL-063) explicitly manages deployment.

5. **Do not remove Bootstrap** until Phase 2 (BL-020) — doing it earlier will break the layout.

6. **Cross-reference the original `index.html`** when you need to know what copy or content the live site had. It is at `/home/carlos/VS_Code_Projects/retardo_cne/index.html`.

7. **When adding i18n keys** (BL-001), add to BOTH the `es` and `en` blocks. Never add a key to only one language.

8. **When adding new source URLs**, verify they are live and accurate before committing. Use `read_url_content` to check.

9. **When the backlog says "both languages"**, both `es/` and `en/` content files must be updated before marking the item done.

10. **Update `ASTRO_MIGRATION_BACKLOG.md`** status fields as you work. This is the project's living state document.

---

## Reference Architecture

```
retardo_cne/
├── src/
│   ├── components/          ← 20 Astro components (navigation, sections, UI)
│   │   ├── Navbar.astro
│   │   ├── Hero.astro
│   │   ├── [other sections]
│   │   └── ...
│   ├── content/
│   │   └── irregularidades/ ← Content collection (7 ES + 7 EN markdown files)
│   │       ├── es/
│   │       └── en/
│   ├── i18n/
│   │   ├── ui.ts            ← ~190 translated strings per language (PRIMARY)
│   │   └── utils.ts         ← getLangFromUrl, useTranslations helpers
│   ├── layouts/
│   │   └── Layout.astro     ← Root HTML shell, CDN links, SEO meta
│   ├── pages/
│   │   ├── index.astro      ← ES homepage (all sections)
│   │   └── en/
│   │       └── index.astro  ← EN homepage (all sections)
│   └── styles/
│       └── global.css       ← CSS design token system (168 lines)
├── assets/
│   └── data/
│       └── translations.json ← 50KB secondary translation source (fallback)
├── public/                  ← Static assets served at /retardo_cne/
├── docs/
│   └── retardo-cne/         ← Migration documentation (4 files)
├── index.html               ← Original live site (DO NOT DELETE UNTIL PHASE 5)
└── astro.config.mjs         ← base: '/retardo_cne', i18n config, sitemap
```

## Key Failure Modes to Avoid

- **Silent i18n failures:** `useTranslations` returns the key string on miss — always check rendered output, not just that the JS ran
- **One-language-only updates:** Every `ui.ts` addition must have both ES and EN values
- **Premature Bootstrap removal:** Breaks layout; only do this in Phase 2 as specified
- **Deleting files without grep-checking references first:** Always `grep -rn filename src/ astro.config.mjs package.json` before deleting
- **Marking items done without acceptance criteria check:** Follow the criteria in the backlog, not your intuition

---

*This handoff prompt was generated on 2026-04-01 by a comprehensive migration audit session. Update the "Current Status" section at the top before reuse.*
