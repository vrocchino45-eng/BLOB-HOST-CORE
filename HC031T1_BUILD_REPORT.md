# HC031T1 — Adjacent Territory Access + Detachment Truth

## Parent
HC-031T — Open Territory / Adjacent Host Proof

## Mode
Focused convergence repair. No new encounter content and no territory expansion beyond the existing Gathering Ground proof.

## Why this pass exists
The HC031T acceptance run proved HC031S successfully, but HC031T did not produce any adjacent-territory observation, relationship, traversal-open, or entry events. The player reported being unable to get farther through to the rings and seeing one tendril leg remain attached.

The runtime audit found two concrete causes. First, the third Membrane Ridge contour sat effectively on the pre-open Aperture movement ellipsoid, leaving almost no maneuvering clearance where the player was expected to finish the local ridge read and establish a remote read toward Gathering Ground. Second, the visual tendril system could accept boundary-derived `coreContactLanguage` contact even when PlayerMovementController reported no physical attachment and no authored surface truth. The invisible movement envelope could therefore look like a real suction support.

## Repair 1 — pre-open Aperture clearance
After Signal Plain completion but before Gathering Ground traversal opens, the authored movement volume is now:
- center local: `(5.0, 1.0, -24.0)`
- radii: `(32.0, 12.0, 43.0)`
- mode: `signal_plain_membrane_ridge_observation_ellipsoid`

This gives the three existing Membrane Ridge contours meaningful maneuvering clearance and creates a remote observation stand-off. Gathering Ground's center remains outside this pre-open ellipsoid. The larger HC031T open-territory ellipsoid still activates only after Membrane Ridge completion.

## Repair 2 — macro-body acquisition
`ApertureAdjacentTerritorySystem` no longer treats Gathering Ground as one hidden center point. It evaluates the visible ghost body, neighboring membranes, and response rings and uses the best-aligned macro-body element. The acquisition threshold is intentionally broad (`0.62`) because this is a landscape-scale Host body. `TargetingSystem` remains unchanged.

## Repair 3 — tendril detachment truth
`CoreTendrilSurfaceContactSystem` now distinguishes visual boundary contact from physical/authored surface truth. The safety ellipsoid by itself cannot authorize a sealed suction tendril. Real authored surface truth can still bootstrap the tendrils, and an existing PlayerMovementController attachment/release relationship still carries them through normal handoff.

## Repair 4 — telemetry / debug truth
Telemetry schema advances to `blob.session.telemetry.v1.44`. Movement samples now include the current boundary mode, normalized distance, pressure, and proximity. A sustained push against an authored movement envelope can emit `movement.boundary_clamped`, closing the blind spot exposed by the HC031T run. Adjacent-territory observation telemetry also records macro aim source/threshold/readiness.

The playtest HUD adds a compact Gathering Ground diagnostic while Aperture is active: distance, aim score/lock, observation count, relationship state, and open/closed state.

## Locked / forbidden scope
No change to PlayerMovementController, TargetingSystem, controller mapping, Signal Plain rules, Membrane Ridge rules, route/crossing ownership, chemistry, entity AI, Hub/Grave/Vascular/Silt/Comb gameplay, or active-cell architecture. No encounters are added in T1.

## Acceptance
1. Shift+8 can complete Signal Plain and all three Membrane Ridge contours without the third contour feeling pinned to an invisible wall.
2. Boundary-only contact cannot leave a visible sealed tendril.
3. Gathering Ground can be remotely Pulsed and observed before traversal opens.
4. Stabilize establishes the remote relationship.
5. Membrane Ridge completion opens the larger field volume.
6. The player physically enters Gathering Ground with no teleport and no active-cell change.
7. If the player pushes against a movement volume long enough to feel blocked, telemetry exposes it.

## Validation
`npm run validate:current` passes on the reconstructed HC031T parent with this delta applied:
- HC031T1 focused validator PASS
- undefined `this.method()` audit PASS
- RecipeDataSystem `loadAll` PASS
- syntax checks PASS
- 25 neighboring owners SHA-256 locked unchanged

No source file outside the declared T1 scope changed.
