# HC-028D1 Focused Playtest — Verb ↔ Engine Coupling

## Purpose
Check whether the three canonical verbs now feel like functions of the same living gyroscopic Core rather than external effects attached to it.

## Test
1. Play normally at a camera distance where the Core interior is readable.
2. Tap/hold **Pulse** and watch the Pulse plane: it should brighten/expand and carry energy outward before the existing external Pulse expression.
3. Hold **Absorb** and watch the Absorb plane: it should tighten/contract and visibly carry energy inward.
4. Hold **Stabilize** and watch the Stabilize plane plus whole gyro: precession should settle without the Core gaining a fixed top/bottom.
5. Try **Stabilize + Pulse**, **Stabilize + Absorb**, and **Pulse + Absorb** naturally. Multiple pathways may coexist; no new gameplay effect is expected.
6. Briefly try all three. The Core may read as full-system load, but power/range/movement must remain unchanged.
7. Run Vascular normally and confirm HC-028D world resonance still reads without forcing verb timing.
8. Confirm A behaves exactly as before; HC-028D1 must not redefine it.

## Pass criteria
- You can tell which internal system is producing each verb without looking at button prompts.
- Pulse reads outward, Absorb inward, Stabilize coherent/steady.
- Combined inputs look related rather than like unrelated effects layered together.
- No combo grants hidden power, speed, route progress, or beat advantage.
- 3/6/12, Vascular rhythm, Hub reachability, and route returns behave exactly as in HC-028D.

## Telemetry
Schema `blob.session.telemetry.v1.4` records `core.verb_engine.chord_changed` with the current diagnostic chord and per-function drive. Telemetry remains read-only.
