# HC-015A Build Report

## Milestone
First Aperture Ecology Loop — Signal Plain.

## Base
Rebuilt directly from the confirmed HC-014L runnable package.

## Scope
- Adds `SignalPlainEcologySystem` as the first bounded ecology gameplay owner in Aperture Fields.
- Keeps `ApertureFieldsArrivalSystem` as presentation owner.
- Keeps Comb progression, GateSystem ownership, Aperture camera/movement bounds, landmark positions, and Ctrl/Cmd+1..8 debug jumps locked.
- Does not add combat, crafting, inventory, nutrients, abilities, factions, new gates, or Act 2 region progression.

## Playable Loop
1. Enter or debug-jump to Aperture (`Ctrl+8`).
2. Approach Signal Plain.
3. Observe three distinct local signal nodes with Interact/A.
4. Duplicate observations do not advance progress.
5. After 3/3, move into the receptive center and hold Stabilize.
6. When READY, use a fresh Pulse.
7. Signal Plain releases a local visual field response and returns the player to free exploration.

## Ownership
- `SignalPlainEcologySystem`: local ecology state/interaction/presentation response only.
- `ApertureFieldsArrivalSystem`: Arrival Shelf and field presentation.
- `PlayerMovementController`: movement/collision.
- `GateSystem`: crossings/history.
- `DebugAreaJumpSystem`: debug-only cell access; does not award ecology progress.

## Validation
PASS:
- `node scripts/validateSignalPlainFirstEcologyHC015A.mjs`
- `node scripts/validateSignalPlainDebugJumpHC015A.mjs`
- `npm run validate:recipe-data`
- `npm run audit:undefined-methods`
- `npm run build`

Historical HC-014x validators that hard-code earlier build IDs are retained as historical checks and were not rewritten to claim successor identity.

## Production Bundle
Initial JS: ~1,490.47 kB minified / ~370.99 kB gzip.
Large-bundle warning remains known technical debt.
