# HC019E — Consequence Before Progression

## Mode
CAUSALITY CONVERGENCE. Final HC019 planned pass.

## Architectural change
HC019B created an explicit physical world state: `materialPassageOpen`.
HC019E makes the surrounding progression/presentation layers observe that state directly.

Surface Wake now follows:
player verb
→ safe material result
→ membrane passage physically opens
→ Listening Fold observes open passage and becomes available
→ player completes the existing Fold interaction
→ ObjectiveSystem observes those results
→ existing local morph/boundary systems handle handoff/crossing.

## Changed observers
- SurfaceWakeLayeredInteractionSystem: availability now requires the explicit open material passage,
  rather than generic `foldInvitation`/agency truth.
- ObjectiveSystem: publishes `authority: observer_only` plus the world state it is observing.
- OpeningPacingSystem: opening stage changes when the material passage is actually open.
- FirstSliceCohesionSystem: its retained nursery milestone now prefers the material passage result.

## Not changed
The system that *creates* the material result (SurfaceWakeGameplaySystem) is locked from HC019D.
Boundary/crossing, movement, camera, chemistry, verb rules and the HC019D ambient field are also locked.

## Acceptance
Debug telemetry should make it possible to prove the ordering:
world changes first; objectives/pacing/fold availability react afterward.
No objective flag should be required to create the membrane opening.
