# HC031R — Focused Vascular Currentization Playtest

## Goal
Verify that Vascular now reads as a relationship with living circulation rather than a hidden rhythm-button test.

## Fast entry
Use **Shift+5** to jump to the Flow / Vascular Physiology test platform.

A normal Hub→Vascular entry is also valid, but the debug platform is preferred for this focused pass.

## 4–6 minute test
1. Enter / reset Vascular.
2. At the first visible valve/current handoff, **Pulse by itself** a few times. Do not hold Stabilize yet.
   - The vessel may visibly answer.
   - The route must **not** award a current read just because the Pulse happened on a beat.
3. Move with the current to the valve.
4. Hold **Stabilize** briefly until the relationship visibly settles.
5. While still holding Stabilize, **Pulse once**.
   - This should lock one current read.
   - Do not try to time the bright beat deliberately.
6. Repeat at the second and third valve.
7. After 3/3 reads, hold Stabilize inside the current until circulation settles/reverses.
8. Follow the return current and use the existing return fold back to Hub if the debug-start state permits it.
9. Export with **Shift+T**.

## Feel target
The intended thought should be:

> "I brace into this circulation, then send something through it."

Not:

> "I wait for the timing window and press the rhythm button."

Rhythm should still be obvious and satisfying. Better alignment can look/sound stronger, but mistiming alone should not reject an otherwise valid established relationship.

## Telemetry acceptance
Look for exactly three:
- `vascular.relationship_read`

Then one:
- `vascular.relationship_route.completed`

For at least one of the three reads, `beatAligned:false` is desirable proof that timing is quality-only.

Each read should show:
- `relationship: environmental_current`
- `action: stabilize_then_pulse`
- increasing `readCount` 1 → 2 → 3
- `inputTimingGate:false`

Then existing telemetry should still show:
- `route.resolved` → `vascular_route` / `return_current`
- `transition.available` for the Vascular return fold
- normal return to Hub if you complete the fold.

## Regression checks
- Vascular current still pushes/carries the Core.
- Fighting flow can still create recoverable turbulence.
- Stabilize still calms/reweaves turbulence.
- Absorb still makes a local draw-wake and is not required for route completion.
- No forced relocation.
- No new target-lock behavior.
- No new button.
- Return fold still behaves as before.
- Grave / Silt / Hub / Comb / Aperture behavior is unchanged.
