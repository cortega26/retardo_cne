# Plan 005: Complete keyboard interaction for navigation disclosures

> Executor instructions: Start only after Plan 004 is DONE. Read this fully, run every verification command, and update the index row when complete.
>
> Drift check: git diff --stat 0f766e9..HEAD -- src/components/Navbar.astro public/assets/js/navbar-behavior.js tests/regression.spec.js

## Status

- Priority: P2
- Effort: M
- Risk: MED
- Depends on: plans/004-make-navbar-initialization-idempotent.md
- Category: accessibility / UX
- Planned at: commit 0f766e9, 2026-07-29

## Why this matters

The primary navigation has custom disclosure buttons for dense evidence links. Click and Escape work, but opening a disclosure leaves focus on its trigger and keyboard users must Tab through every link. Add predictable keyboard behavior without misrepresenting ordinary navigation as an ARIA application menu.

## Current state

- Navbar.astro lines 50-68 pairs a button with a plain unordered list; equivalent pairs start at lines 76 and 93.
- navbar-behavior.js lines 67-84 toggles disclosures; lines 103-117 only handles Escape.
- Keep normal unordered-list and anchor semantics. Do not add role=menu, role=menubar, or role=menuitem.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Claims | npm run verify:claims | exit 0 |
| Lint | npm run lint | exit 0 |
| Focused test | npx playwright test tests/regression.spec.js --grep "navbar keyboard" | pass |
| Full E2E | npm run test:e2e | all pass |
| Build | npm run build | exit 0 |

## Scope

In scope: src/components/Navbar.astro, public/assets/js/navbar-behavior.js, tests/regression.spec.js, plans/README.md.

Out of scope: ARIA-menubar conversion, navigation text/destinations, mobile layout, and focus trapping.

## Steps

### Step 1: Implement the disclosure keyboard contract

For each trigger, native Enter/Space stays intact. ArrowDown opens and focuses first link; ArrowUp opens and focuses last link. When focus is inside an open disclosure, ArrowDown/ArrowUp wrap through links, Home/End go first/last, and Escape closes plus restores trigger focus. Tab/Shift+Tab must remain native and never be trapped.

Implement through the existing trigger aria-controls menu relationship, using Plan 004’s idempotent lifecycle. Keep pointer behavior.

Verify: npm run lint returns exit 0.

### Step 2: Correct markup only if necessary

Ensure every trigger aria-controls value identifies its menu and every menu is labelled by its trigger. Preserve localized labels and regular anchors. Add no ARIA menu roles.

Verify: npm run build returns exit 0.

### Step 3: Add keyboard tests

On desktop, focus evidenceDropdown; ArrowDown must focus the first link; ArrowUp wraps to last; Home/End move to first/last; Escape closes and restores trigger focus; Tab must move out rather than trap. Use document.activeElement only if locator assertions cannot express focus.

Verify: npx playwright test tests/regression.spec.js --grep "navbar keyboard" passes.

### Step 4: Run release gates

Run every command above and mark plan 005 DONE.

Verify: npm run verify:claims && npm run lint && npm run test:e2e && npm run build returns exit 0.

## Done criteria

- [ ] All three disclosures follow the keyboard contract.
- [ ] Escape restores trigger focus.
- [ ] Links retain normal anchor semantics; no ARIA menu roles exist.
- [ ] Focused/full tests, claims validation, lint, and build pass.
- [ ] Only scoped files changed; index row is DONE.

## STOP conditions

- Plan 004 is not DONE.
- Requirements now call for a full ARIA menubar; stop for an interaction-design decision.
- Changes prevent top-level links or Tab navigation.

## Maintenance notes

When adding a dropdown, preserve its button-menu relationship and include it in keyboard tests. Use standard navigation semantics unless the entire navbar is deliberately redesigned as a menubar.
