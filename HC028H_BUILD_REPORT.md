# HC-028H — Core Topology Resonance Integration

## Purpose
Connect the already-existing Deep / Inner / Membrane Core topology to the newer regional composition and Core↔World resonance stack without creating a second topology system or retuning gameplay.

## Audit finding
The parent already contains `CoreRadialPerformanceSystem` (HC027C). It owns continuous topology physiology and already influences reserve, boost and verb character. HC028H does **not** replace or retune it. The parent file is hash-locked unchanged.

`CoreEmbodimentSystem` already resolves 10 whole-Core topology states: 3 all-in-one distributions, 6 two-to-one distributions, and 1 three-way balance.

## Added bridge
`CoreTopologyResonanceSystem` reads the canonical topology/performance state and interprets four embodied properties:

- **Response** — normalized from the existing HC027C `response` trait.
- **Inertia** — normalized from the existing HC027C `enduranceCapacity` trait.
- **Coherence** — normalized from the existing HC027C `stability` trait.
- **Exposure** — reuses HC024E's authored zone exposure law: Deep 0.06, Inner 0.28, Membrane 1.0.

No new gameplay trait table is introduced.

## Presentation behavior
- High-response topology takes on a regional world imprint more quickly.
- High-inertia topology lets that imprint decay more slowly.
- High-coherence topology presents the gyro as more held/settled.
- High-exposure topology makes regional coupling more visible.
- Balanced 1:1:1 topology reads as `triadic_adaptive` rather than as a numerical optimum.

Core/world canonical timing coherence is still computed by `CoreWorldResonanceSystem`; HC028H adds an embodied presentation layer around it rather than retiming the engine.

## Topology modes
- `buffered_long_memory`
- `controlled_transmission`
- `exposed_quick_response`
- `triadic_adaptive`
- `buffered_mixed`
- `controlled_mixed`
- `expressive_mixed`

These are descriptive presentation modes, not player-facing classes or skill-tree labels.

## Telemetry
Telemetry schema advances to `blob.session.telemetry.v1.6` and records `core.topology_resonance.mode_changed` plus response/inertia/coherence/exposure/world-imprint values in Core snapshots.

## Runtime changes
Intentional runtime changes from HC028G:
- add `src/player/CoreTopologyResonanceSystem.js`
- wire the bridge in `GameRuntime`
- extend `CoreWorldResonanceSystem` presentation with topology context
- let `CoreEmbodimentSystem` display topology-dependent firing sharpness/imprint persistence
- extend `SessionTelemetrySystem`
- update build identity

## Locked gameplay
28 parent owners are hash-locked, including:
- `CoreRadialPerformanceSystem`
- `PlayerMovementController`
- `CoreEngineSystem`
- verb physicalization/coupling/sensory owners
- Input/ControlMap/DeliberateCommitment
- Host rhythm/composition/regional physical embodiment/lift readability
- Hub, Vascular, Silt, Grave, Comb and Aperture gameplay owners
- chemistry, bond and audio authorities

HC028H adds no movement modifier, verb modifier, route change, input timing gate, progression authority or engine retiming.

## Validation
- HC028H contract: PASS
- canonical pure-Deep / pure-Inner / pure-Membrane / balanced topology interpretation: PASS
- 28 parent-owner hashes: PASS
- recipe-data load: PASS
- undefined-method audit: PASS
- 100 runtime JS files syntax checked: PASS
- 380 public JSON files parsed: PASS

Vite render is not executed because the handoff tree does not include local `node_modules`.
