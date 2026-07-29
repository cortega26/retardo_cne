# Plan 001: Prevent timer announcements from interrupting reading

> Executor instructions: Follow every step and verification gate. If a STOP condition occurs, stop and report; do not improvise. Update this plan’s status in plans/README.md when complete.
>
> Drift check: git diff --stat 0f766e9..HEAD -- src/components/Counter.astro public/assets/js/page-behavior.js tests/regression.spec.js

## Status

- Priority: P1
- Effort: S
- Risk: LOW
- Depends on: none
- Category: accessibility bug
- Planned at: commit 0f766e9, 2026-07-29

## Why this matters

The elapsed-time counter changes every second. Its container is a polite live region, so screen readers can repeatedly announce four changing values while people read legal evidence. Preserve the visual timer but make it passive.

## Current state

- src/components/Counter.astro renders counter cards.
- public/assets/js/page-behavior.js hydrates them and updates their numbers every second.
- tests/regression.spec.js:4-12 contains the existing counter test.

At Counter.astro lines 43-48, the counter uses aria-live=polite. Page behavior lines 42-62 change child text each second. Do not change labels, units, values, cadence, or legal content.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Claims | npm run verify:claims | exit 0 |
| Lint | npm run lint | exit 0 |
| Focused test | npx playwright test tests/regression.spec.js --grep counter | pass |
| Build | npm run build | exit 0 |

## Scope

In scope: src/components/Counter.astro, tests/regression.spec.js, plans/README.md.

Out of scope: public/assets/js/page-behavior.js unless markup alone cannot solve it; counter copy, timing, values, and evidence data.

## Git workflow

Use branch advisor/001-stop-live-counter-announcements. Match conventional commits already in history, such as fix: ground expert analysis claims. Do not push or commit unless instructed.

## Steps

### Step 1: Remove continuous announcements

Remove aria-live=polite from the counter container. Do not replace it with aria-live=off, since no live-region contract is needed.

Verify: npm run lint returns exit 0.

### Step 2: Add the regression assertion

Extend the existing counter test. It must still assert numeric seconds render and additionally assert that the counter has no aria-live attribute.

Verify: npx playwright test tests/regression.spec.js --grep counter passes.

### Step 3: Run release gates

Run all Commands above, then mark plan 001 DONE.

Verify: npm run verify:claims && npm run lint && npm run build returns exit 0.

## Done criteria

- [ ] Counter is not a live region.
- [ ] Focused test passes.
- [ ] Claims validation, lint, and build pass.
- [ ] No out-of-scope files changed; status row is DONE.

## STOP conditions

- A documented requirement says the clock must announce continually.
- Focused test fails twice after a reasonable correction.
- Removing the attribute requires changing content or timer timing.

## Maintenance notes

For future user-triggered updates, announce only a concise result in a dedicated status region; never make a continuous timer live.
