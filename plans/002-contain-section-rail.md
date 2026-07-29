# Plan 002: Keep the desktop section rail reachable on short screens

> Executor instructions: Follow every step and verification gate. Stop and report instead of improvising if a STOP condition occurs. Update the index row on completion.
>
> Drift check: git diff --stat 0f766e9..HEAD -- src/components/SectionRail.astro tests/regression.spec.js

## Status

- Priority: P1
- Effort: S
- Risk: LOW
- Depends on: none
- Category: responsive UX bug
- Planned at: commit 0f766e9, 2026-07-29

## Why this matters

The index appears at widths from 1440px, but its 16 targets are at least 28px tall before group spacing and padding. On short desktop windows it can extend beyond both viewport edges, leaving destinations unreachable. It must remain readable and keyboard reachable without covering article content.

## Current state

- src/components/SectionRail.astro owns rail markup, CSS, and active-section behavior.
- The rail is fixed, centered vertically, and shown at minimum 1440px width.
- Its links have a 28px minimum height at lines 117-125.
- tests/regression.spec.js:150-190 uses explicit viewport sizing for responsive coverage.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Claims | npm run verify:claims | exit 0 |
| Lint | npm run lint | exit 0 |
| Focused test | npx playwright test tests/regression.spec.js --grep "section rail" | pass |
| Build | npm run build | exit 0 |

## Scope

In scope: src/components/SectionRail.astro, tests/regression.spec.js, plans/README.md.

Out of scope: rail labels and IDs, mobile reading-progress behavior, global CSS, and narrative section order.

## Steps

### Step 1: Constrain the rail

In component-local CSS, give the rail an explicit dynamic-viewport vertical limit and vertical overflow behavior. First and last links must be fully scrollable into view. Preserve fixed right-side placement and collapsed-label behavior; do not hide the rail merely because the window is short.

Verify: npm run lint returns exit 0.

### Step 2: Add a short-desktop regression

Add a Playwright test named section rail. At a 1440 by 600 viewport, assert the rail is visible, its bounding box stays within the viewport, and its final link can be focused and made visible in its scroll container. Use DOM bounding boxes rather than screenshots.

Verify: npx playwright test tests/regression.spec.js --grep "section rail" passes.

### Step 3: Run release gates

Run all commands above and mark plan 002 DONE.

Verify: npm run verify:claims && npm run lint && npm run build returns exit 0.

## Done criteria

- [ ] Rail has a viewport bound and vertical overflow behavior.
- [ ] All rail links are keyboard reachable at 1440 by 600.
- [ ] Focused test, claims validation, lint, and build pass.
- [ ] Only scoped files changed; index row is DONE.

## STOP conditions

- Short-desktop hiding is documented design direction.
- The containment fix overlaps the main reading column.
- Spanish and English target IDs differ.

## Maintenance notes

Every added rail item increases vertical footprint. Preserve the containment rule and update the viewport test if the breakpoint changes.
