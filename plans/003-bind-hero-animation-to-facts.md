# Plan 003: Keep hero count animation tied to the evidence source

> Executor instructions: Execute only this plan’s scope, run every verification command, and update its status row when done.
>
> Drift check: git diff --stat 0f766e9..HEAD -- src/components/Hero.astro tests/regression.spec.js

## Status

- Priority: P1
- Effort: S
- Risk: LOW
- Depends on: none
- Category: evidence UI integrity bug
- Planned at: commit 0f766e9, 2026-07-29

## Why this matters

The hero is the primary factual contrast. Its server-rendered endpoint comes from FACTS.citizenActas, but the animation uses a separate hard-coded number. A future evidence update could visibly contradict the source. Browser code must use the existing data-final attribute.

## Current state

- Hero.astro line 36 emits data-final from FACTS.citizenActas.
- Hero.astro lines 81-100 contain a hard-coded const final = 25575 and use it for animation.
- tests/regression.spec.js is the repository’s browser regression suite.

Do not change facts, translations, evidence claims, styles, animation duration, or easing.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Claims | npm run verify:claims | exit 0 |
| Lint | npm run lint | exit 0 |
| Focused test | npx playwright test tests/regression.spec.js --grep "hero count" | pass |
| Build | npm run build | exit 0 |

## Scope

In scope: src/components/Hero.astro, tests/regression.spec.js, plans/README.md.

Out of scope: src/data/facts.ts, translations, evidence copy, and styles.

## Steps

### Step 1: Parse emitted data safely

Replace the hard-coded endpoint with a finite numeric value parsed from the element data-final attribute. If missing or malformed, return without starting animation and retain Astro’s server-rendered value. Keep reduced-motion behavior, separators, duration, and easing.

Verify: npm run lint returns exit 0.

### Step 2: Test both locale endpoints

Add a Playwright test named hero count. Read data-final, wait for the 1.8 second animation plus a small deterministic buffer, then assert Spanish text is dot formatted and English text at /en/ is comma formatted. Do not assert intermediate frames.

Verify: npx playwright test tests/regression.spec.js --grep "hero count" passes.

### Step 3: Run release gates

Run all commands above and mark plan 003 DONE.

Verify: npm run verify:claims && npm run lint && npm run build returns exit 0.

## Done criteria

- [ ] No hard-coded animation endpoint remains.
- [ ] Missing or invalid data leaves server-rendered text intact.
- [ ] Spanish and English endpoint tests pass.
- [ ] Claims validation, lint, and build pass; index row is DONE.

## STOP conditions

- FACTS.citizenActas is not decimal numeric data.
- Multiple elements share the hero id.
- Test requires changing evidence data or translations.

## Maintenance notes

Future animated evidence values should follow the same rule: data modules supply facts; client code only parses, formats, and animates them.
