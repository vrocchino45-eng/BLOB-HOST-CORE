# HC-031N2 — Reacquire Closure

Parent: **HC-031N1 — Physical-Language Causal Continuity** plus the two Windows validator portability fixes.

Mode: **convergence / narrow movement hotfix**

## Why this pass exists
The repaired HC031N1 playtest proved the causal chain through `world_answer` and `deliberate_release`, then stalled because the old release surface continued to own `attachmentReacquireBlocked` even while the Core later brushed a different authored Host support.

Observed failure pattern:
- deliberate peel from `HOST_CONTACT_CONTINUATION_SCAR_BRACE_01`;
- old-normal release clearance stayed below the existing 0.26 m same-surface requirement;
- later valid contact with `HOST_CONTACT_CONTINUATION_MEMBRANE_02` did not clear the stale scar release ownership;
- the N1 chain timed out at stage 7 instead of reaching `reacquired_contact`.

## Change
HC031N2 scopes the release block to the surface that was deliberately left.

The existing rules remain:
- release cooldown: **0.55 s**;
- same-surface re-entry requires **0.26 m** release-normal clearance;
- peel thresholds and hold thresholds unchanged;
- K1 tangent carry / outward release impulse unchanged;
- forced/involuntary detach behavior unchanged.

New rule:

> After a deliberate peel, once the existing cooldown has expired, a genuinely different valid Host support can clear the old release-surface ownership even if clearance from the old surface never reached 0.26 m.

This does not make attachment global or automatic. The new support must already be a valid authored/current contact candidate.

## Telemetry
Schema: `blob.session.telemetry.v1.36`

`movement.surface_reacquire_unblocked` now distinguishes:
- `release_clearance_reached`
- `different_surface_after_deliberate_peel`

It records from/to support IDs. Summary adds `surfaceReacquireDifferentSurfaceUnblocks`.

## Locked systems
16 neighboring gameplay owners are hash locked. HC031N2 does not retune targeting, verbs, camera, input mapping, chemistry, ecology, route/progression, or Host-contact response.

## Validation
`npm run validate:current` passes:
- HC031N2 runtime reacquire proof
- syntax validation
- RecipeDataSystem load validation
- undefined `this.method()` audit

Runtime proof verifies:
1. same release surface remains blocked below 0.26 m;
2. a different support cannot bypass the 0.55 s cooldown;
3. after cooldown, a different valid support clears stale deliberate-peel ownership and can attach while old-normal clearance is still below 0.26 m;
4. forced detach does not use the deliberate-peel escape;
5. original same-surface clearance still unblocks correctly.

## Production build note
The uploaded Windows `node_modules` remains unsuitable for a Linux Vite production build because of Rollup's platform-specific optional binary. Source/runtime validators are the authority for this delta in this environment.
