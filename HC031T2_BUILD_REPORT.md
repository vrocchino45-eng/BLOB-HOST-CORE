# HC031T2 — Canonical Aperture World Anchor Repair

## Why this pass exists
HC031T1 telemetry proved the player was still physically constrained: 33 `movement.boundary_clamped` events occurred and the Gathering Ground observation / relationship / traversal / entry counters all remained zero. Twenty-one clamps occurred even after Signal Plain completed and the larger HC031T1 observation ellipsoid became active.

The new telemetry exposed the actual root cause. `Shift+8` stages the player at Signal Plain during the same first update in which Aperture systems mount. `ApertureFieldsArrivalSystem` and `SignalPlainEcologySystem` captured the intended region origin first, then Signal Plain moved the player. Systems registered afterward — `MembraneRidgeGameplaySystem` and `ApertureAdjacentTerritorySystem` — captured that staged player position as a new `entryAnchor`.

That split one apparent world into two coordinate frames. The visible Aperture landmarks stayed at the original origin while Membrane Ridge and the HC031T/T1 Gathering Ground interaction body were shifted by the Signal Plain debug offset.

## Repair
`ApertureFieldsArrivalSystem` now publishes the canonical `entryAnchor` for this continuous field. Signal Plain, Membrane Ridge, and Gathering Ground consume that anchor on mount. The live player position is only a fallback if the canonical owner is unavailable.

No movement radii were enlarged. The HC031T1 pre-open volume was already correct when evaluated against the intended coordinates: all three Ridge contours fit inside it while Gathering Ground remains outside until traversal opens.

## Scope locks
No PlayerMovementController changes. No TargetingSystem changes. No controller changes. No Signal Plain mechanic changes. No Membrane Ridge trace-rule changes. No encounter additions. No active-cell transition or teleport.

## Identity
- Build: `HC-031T2`
- Parent: `HC-031T1`
- Package: `0.31.43`
- Telemetry: `blob.session.telemetry.v1.45`
