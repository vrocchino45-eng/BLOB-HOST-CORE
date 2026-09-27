# HC031P1 — First Destination Commitment Unblock

## Parent
HC031P — First Host Destination Commitment

## Mode
Narrow hotfix / convergence repair.

## Telemetry finding from HC031P
The P playtest reached the Hub-compatible Signal Chorus cell but never produced a Hub destination opportunity. Summary evidence:
- hub destination availability events: 0
- hub destination commit events: 0
- deliberate commitments: 0
- reserved commit presses: 44
- player remained in CELL_SIGNAL_CHORUS_NERVE_001 after arriving there

The runtime audit found the first Grave route's `awake`, commitment candidate, and boundary readiness all indirectly depended on `hubChamberFoundation.completed`. That completion includes HC010C's strict screen-composition proof (all three route territories simultaneously readable in the camera, overlap limits, target-state clearance, etc.). A presentation validator was therefore acting as progression authority.

## Repair
HC031P1 separates first-destination commitment permission from whole-Hub screen truth.

First Grave entry now follows:
1. active cell is Hub / Signal Chorus
2. Grave destination is prewarmed/prepared
3. authored Grave route wakes
4. existing Grave route body visibly reveals
5. player approaches within the existing commitment radius
6. A/E publishes the existing deliberate destination commitment
7. LocalCellBoundaryMorphSystem performs the existing Hub→Grave morph

The stricter whole-Hub screen truth still runs and remains useful for presentation validation. It is not deleted or weakened; it simply no longer owns the first Grave commitment permission.

## Explicit locks
Unchanged:
- movement / attachment
- Pulse / Absorb / Stabilize physical grammar
- targeting / attention ownership
- Surface Wake and Guide route logic
- authored Hub→Grave route identity, trigger, and 2.15 interaction radius
- automatic crossing remains false
- Grave gameplay
- later Vascular / Silt / Comb route ordering and prerequisites

## Telemetry
Schema: `blob.session.telemetry.v1.39`

Adds read-only `hub.destination.readiness_changed` so the next playtest can distinguish:
- route body revealing
- destination preparing
- outside commit radius
- ready for deliberate commit

Existing proof chain remains:
`hub.destination.available → hub.destination.committed → transition.entered → route.resolved`

## Validation
`npm run validate:current` — PASS
- HC031P1 ownership/runtime proof PASS
- syntax PASS
- recipe-data PASS
- undefined-method audit PASS
- 17 neighboring gameplay owners hash-locked unchanged

Production Vite build remains unavailable in the Linux verification container because the inherited Windows `node_modules` tree lacks Rollup's Linux optional native binary. This is unchanged and not a source validation failure.
