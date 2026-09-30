# HC031U1 Focused Playtest

## Purpose
Prove the HC031U startup-order crash is closed before evaluating encounter feel.

## Apply
Apply HC031U1 directly over HC031U.

## Fast acceptance
1. Reload/start the game normally.
2. Confirm there is **no red startup error panel** mentioning `GatheringGroundAliveSystem` dependencies.
3. Confirm the normal opening scene renders and controls respond.
4. Use `Shift+8` for the Aperture test path.
5. Complete the existing T6 flow: Ridge 3/3 → OPEN → Gathering Ground OBS3/REL → physical entry.
6. Once local, wait briefly for ambient ecology, then try:
   - Stabilize + Pulse near the Watcher;
   - Stabilize + Absorb near either relay.
7. Export telemetry with `Shift+T`.

## Expected
- Build identity: `HC-031U1`.
- No startup exception.
- T6 traversal behavior unchanged.
- `LIFE` ecology HUD appears after Gathering Ground becomes local.
- Encounter telemetry remains schema v1.47.

## Fail immediately if
- startup still produces the dependency error;
- Aperture/Ridge traversal differs from T6;
- Gathering Ground ecology appears before local entry;
- movement or targeting behavior changes before the Alive territory.
