# BLOB: HOST CORE — HC015N HOTFIX2

## Root cause
Signal Plain's local state completed correctly and Membrane Ridge could unlock, but the higher-level Aperture objective remained authored as a permanent foundation-only proof:

- `complete: false`
- `foundationOnly: true`
- `fullEcologyMounted: false`
- `ecologyGameplayReady: false`

This allowed the receptor/center gold rings to settle correctly while the objective layer could continue to present Signal Plain as unfinished.

## Fix
- ObjectiveSystem now observes `signalPlainEcology.completed`.
- Signal Plain completion marks the Aperture arrival objective complete and clears its blocker.
- Objective ownership exposes `MembraneRidgeGameplaySystem` as continuation owner.
- Signal Plain Guide prompt relinquishes ownership after completion.
- Membrane Ridge gets a dedicated higher-priority Guide prompt.
- Aperture Guide copy becomes state-aware after Signal Plain completion.
- Playtest HUD fallback explicitly follows Signal Plain -> Membrane Ridge.

## Locked
No changes to receptor logic, ranges, Stabilize/Pulse timing, gold-ring settling, Membrane Ridge movement gameplay, movement bounds, camera, targeting, or rewards.
