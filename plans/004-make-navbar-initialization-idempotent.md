# Plan 004: Make navbar initialization idempotent

> Executor instructions: Follow this plan exactly, verify every step, and update the plan index on completion.
>
> Drift check: git diff --stat 0f766e9..HEAD -- public/assets/js/navbar-behavior.js tests/regression.spec.js

## Status

- Priority: P2
- Effort: S
- Risk: MED
- Depends on: none
- Category: frontend lifecycle bug
- Planned at: commit 0f766e9, 2026-07-29

## Why this matters

The navbar script runs on DOM ready and on astro:page-load. Theme and language controls use element guards, but mobile toggle, dropdown, and document click/Escape handlers do not. Re-initialization can stack handlers, causing double toggles and unnecessary global work after repeated lifecycle events.

## Current state

- navbar-behavior.js lines 32-55 uses dataset.bound for theme/language.
- Lines 59-64 bind mobile-toggle click without a guard.
- Lines 67-84 bind dropdown clicks without a guard.
- Lines 87-117 bind document click and keydown handlers without a guard.
- Line 140 re-invokes initialization on astro:page-load.
- Existing navbar browser tests are at tests/regression.spec.js:123-190.

Keep this asset plain JavaScript. Do not change markup, global CSS, theme-init, labels, or page-behavior.js.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Lint | npm run lint | exit 0 |
| Focused test | npx playwright test tests/regression.spec.js --grep "navbar lifecycle" | pass |
| Full E2E | npm run test:e2e | all pass |
| Build | npm run build | exit 0 |

## Scope

In scope: public/assets/js/navbar-behavior.js, tests/regression.spec.js, plans/README.md.

Out of scope: Navbar.astro, styles, theme-init, labels, and page-behavior.js.

## Steps

### Step 1: Use one lifecycle guard

Make every handler owned by initializeNavbarBehavior idempotent. Prefer one document-level lifecycle state with cleanup-before-rebind or stable early return; element flags alone cannot protect document listeners. Retain the astro:page-load hook.

Verify: npm run lint returns exit 0.

### Step 2: Add repeated-lifecycle regression

At 390 by 844, load the home page, dispatch astro:page-load more than once, then assert one hamburger click opens and a second closes. Also assert a dropdown aria-expanded state changes exactly once per click.

Verify: npx playwright test tests/regression.spec.js --grep "navbar lifecycle" passes.

### Step 3: Run release gates

Run all commands above and mark plan 004 DONE.

Verify: npm run lint && npm run test:e2e && npm run build returns exit 0.

## Done criteria

- [ ] Repeated lifecycle events do not stack navbar handlers.
- [ ] Collapse and dropdowns keep existing behavior.
- [ ] Focused/full E2E and build pass.
- [ ] Only scoped files changed; index row is DONE.

## STOP conditions

- Script loading creates isolated global contexts that cannot share a document guard.
- Cleanup removes listeners owned by another script.
- Existing tests expose an unrelated viewport defect.

## Maintenance notes

Every future listener in this initializer must use the same lifecycle strategy. Review this after enabling Astro client navigation.
