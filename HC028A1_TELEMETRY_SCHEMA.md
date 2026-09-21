# HC028A1 Telemetry Schema — v1.1

Schema: `blob.session.telemetry.v1.1`

## Timebase

Each event/sample/snapshot carries:

- `t`: canonical monotonic wall-session seconds;
- `wallT`: explicit canonical wall-session seconds;
- `simT`: simulation/runtime seconds.

Session metadata exports `wallDurationSeconds`, `simDurationSeconds`, and `wallMinusSimSeconds`.

## Analysis events

### `semantic.information_gain`
Emitted when the player's available understanding materially changes: sensing resolution increases/new source resolution, cell transition, persistent consequence, Host relationship, or Core topology change.

### `sonar.redundant_max_resolution`
Emitted when a sonar answer is already at resolution stage 3 and another return does not add sensing resolution.

### `analysis.attempt.outcome`
Summarizes a Pulse/Absorb/Stabilize attempt after a short observation window as `information_gain` or `no_gain`.

### `rhythm.semantic_churn.entered` / `cleared`
Read-only detector for high effort without information gain. It intentionally distinguishes active confusion from quiet observation.

### `playtest.marker`
Shift+M now captures a 12-second contextual window and detector agreement.

## Perceptual boundary

The future blind agent may consume `percept` fields only. `developer` and `developerTruth` remain diagnostic-only and may contain authored IDs/classes.
