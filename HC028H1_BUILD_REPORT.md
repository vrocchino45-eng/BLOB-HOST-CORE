# HC-028H1 Build Report — Topology-Conditioned Environmental Handling

## Parent
HC-028H — Core Topology Resonance Integration

## Purpose
HC028H made the existing Deep / Inner / Membrane Core topology readable to the regional resonance stack without changing gameplay. HC028H1 takes the next deliberately small step: the same topology may now subtly change **how already-existing Host environmental force is received**.

This is not a second topology system, a new movement model, or a region-specific buff table.

## Audit result before implementation
`CoreRadialPerformanceSystem` already owns topology gameplay physiology from HC027C. It remains byte-identical in HC028H1. `CoreTopologyResonanceSystem` also remains byte-identical and continues to be the canonical newer interpretation of response / inertia / coherence / exposure.

HC028H1 therefore adds one bridge only:

`CoreTopologyResonanceSystem` → `CoreTopologyEnvironmentalHandlingSystem` → `PlayerMovementController`

## New runtime owner
### `CoreTopologyEnvironmentalHandlingSystem`
Reads the canonical HC028H topology properties and publishes two bounded environmental-reception modifiers:

- `environmentalCouplingMultiplier` — range **0.92–1.09**
- `fluidSlipDampingMultiplier` — range **0.94–1.07**

Both are derived continuously from response, inertia, coherence and exposure. There is no per-region table and no named-topology lookup table.

Representative pure-state results from validation:

- Deep / buffered: environmental coupling ≈ **0.932×**
- Inner / controlled: ≈ **0.982×**
- 1:1:1 / adaptive: ≈ **0.995×**
- Membrane / exposed: ≈ **1.071×**

The intended physical read is:

- **Deep-heavy:** Host current moves the Core a little less and fluid drag takes longer to reclaim it — buffered / inertial.
- **Membrane-heavy:** Host current takes hold faster and fluid slip resolves faster — exposed / coupled.
- **Inner-heavy:** close to baseline, controlled/transmissive.
- **1:1:1:** deliberately close to the established movement baseline.

## Movement integration
`PlayerMovementController` remains the sole movement owner. HC028H1 changes only two existing environmental terms:

1. existing Host-flow acceleration is multiplied by the bounded topology coupling scale;
2. existing fluid-slip damping is multiplied by the bounded topology slip scale.

HC028H1 does **not** multiply:

- player input acceleration,
- normal speed limit,
- boost acceleration/speed,
- verb mobility or verb power,
- boundary pressure generation,
- regional force generation,
- route completion.

### Reachability safeguards
Topology handling is forced back to **1.0× / 1.0×** during:

- Hub deliberate guided route commit;
- convergence-reachability safety envelopes.

This prevents topology from restoring the older Hub/convergence obstruction problem.

## Lift-field continuity
HC028G `LiftFieldReadabilitySystem` remains byte-identical. Because it reads `playerKinematics.environmentalForceVector` after movement has resolved, its streamlines automatically visualize the **actual post-topology force the Core received**. No new thermal/updraft map was added.

## Telemetry
Schema advanced to `blob.session.telemetry.v1.7`.

Added:

- `core.topology_environmental_handling.mode_changed`
- coupling/slip values in movement samples
- coupling/slip values in Core snapshots
- suppression state for guided/convergence safety

Telemetry remains observer-only.

## Runtime diff from HC028H
Intentional runtime changes only:

- `src/player/CoreTopologyEnvironmentalHandlingSystem.js` — new bridge
- `src/player/PlayerMovementController.js` — consumes two bounded environmental modifiers
- `src/core/GameRuntime.js` — creates/registers bridge before movement
- `src/core/SessionTelemetrySystem.js` — v1.7 observation
- `src/main.js` — build identity

All other promised gameplay/system owners are parent-hash locked.

## Locked parent owners
**30** HC028H owners validate byte-identical, including:

- `CoreRadialPerformanceSystem`
- `CoreTopologyResonanceSystem`
- `CoreWorldResonanceSystem`
- `CoreEmbodimentSystem`
- Core engine / verb systems
- Host rhythm / regional composition / physical embodiment
- HC028G lift-field readability
- Hub commit / route owners
- chemistry, input/control mapping and audio authority

## Validation
Passed:

- `validate:hc028h1`
- `validate:recipe-data`
- `audit:undefined-methods`
- **101/101** runtime JS syntax checks
- **383/383** public JSON parse checks
- 30 parent-owner SHA-256 locks

Vite production render was not executed because this handoff tree does not contain local `node_modules`.

## Build identity
- Build: **HC-028H1**
- Package version: **0.28.14**
- Parent: **HC-028H**
