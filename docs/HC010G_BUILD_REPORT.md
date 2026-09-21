# HC-010G Build Report

## Outcome

HC-010G replaces two decorative Hub promises with verified runtime destinations while refusing to expose unfinished route gameplay.

## Architecture

- `ModeController` and `RegionRegistry` recognize Vascular Rhythm and Silt Pressure as authored Act 1 regions.
- `Act1RouteContractSystem` is the sole shared destination-foundation owner and runs only under the active route mount.
- `GateSystem` verifies destination mounts, evaluates wake and playable readiness, selects the nearest Hub gate, owns entry/return, and persists route history.
- `ObjectiveSystem` publishes incomplete route-circuit state without allowing contract geometry to complete progression.
- `FirstSliceTransitionCoordinator` may prepare the new destination owner but cannot mount it or alter progression.

## Safety boundary

Grave return changes Vascular and Silt from dormant to awake/gameplay-pending. It does not make either gate crossable. The gate requires both an authored destination and `playableReady: true`; HC-010G ships both route records with that flag false.

## Preserved baseline

The complete Surface → Guide → Hub → Grave → Hub path remains authoritative. Grave consequence, prompt ownership, screen truth, local movement boundary, return composition, landmark anatomy, and all inherited validators remain required.

## Verification

- Focused adversarial three-route contract proof: passed.
- Complete inherited validation chain: passed.
- Production compilation: passed.
- Served browser bytes: matched `dist` exactly.
- Production asset: `assets/index-DxnuUOvT.js`.
- Only build note: the retained non-blocking Vite chunk-size warning.

## Successor

`HC-011A` may promote only Vascular Rhythm to playable readiness after its continuous rhythm/current circuit is implemented and validated. Silt Pressure must remain mounted but non-crossable.
