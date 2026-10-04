# Verification: Homepage intro animation

Change ID: 003-intro-animation
Status: Draft
Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Date: 2026-10-04
Verified revision or working-tree description: Not implemented; working tree at `04c0d1d` with untracked `docs/`, `scripts/` and `intro.functions.tsx`

## Acceptance results

| Criterion | Pass / Fail / Not checked | Evidence |
| --- | --- | --- |
| AC-01 – AC-11 | Not checked | Awaiting plan acceptance and implementation |

## Command results

Pre-change baseline, 2026-10-04:

| Command | Exit code | Relevant result |
| --- | --- | --- |
| `bun --bun run verify` | 1 | `check` FAIL (22 errors, 5 warnings); `lint:ds` PASS; `typecheck` PASS; `build` PASS |

## Existing failures and regressions

The baseline `check` failures predate this change. The build regenerated `migrations/snapshots/*/contract.*`; those files were restored.

## UI or runtime inspection

Not run against the planned implementation. A reverted first attempt, using CSS keyframes before the switch to GSAP, showed the counter and lift timing working (seeked states: count 0 → 50 → 100 at 0 / 700 / 1400 ms; curtain fully lifted by 2400 ms). It also found the curtain could be dismissed early; the GSAP plan ties dismissal to the timeline's `onComplete` instead. That attempt used the `INTRO_COOKIE` server functions; the plan now uses per-tab `sessionStorage` instead.

## Limitations and follow-ups

Q3 (curtain colour) is open in the [spec](spec.md#risks-and-resolved-questions).

## Deployment

Not deployed.
