# HC-006KD — Hub Post-Commit Presentation Sync

## Purpose
Synchronize all player-facing Hub presentation after the first Status Page self-reading commits and GateSystem marks Grave Memory crossable.

## Ownership
- `ObjectiveSystem` owns Hub completion.
- `GateSystem` owns Grave Memory readability/crossability.
- `HubChamberFoundationSystem` owns post-commit Hub presentation.
- Retained `SignalChorusReturnStateSystem` remains historical state only while Hub presentation owns the cell.

## Repair
1. The lower tissue panel now checks Hub presentation ownership before retained Signal Chorus return state.
2. Post-commit tissue text says Grave Memory is crossable and identifies the two dormant routes.
3. The active Grave Memory gate visual reads the GateSystem-published crossable state and gains a stronger breathing cue.
4. Region-tab active route status prefers current crossable state over stale completed-return wording.

## Forbidden
No gate logic, objective logic, route content, Grave internals, Vascular/Silt activation, Comb Threshold, or Aperture Fields changes.
