# HC031S — Focused Silt Currentization Playtest

## Purpose
Verify that Silt now reads as pressure/appetite expressed through the same physical relationship grammar used elsewhere, without losing its own compressed identity.

## Fast entry
Use **Shift+6** to jump to the Silt Pressure test platform.

A normal Hub→Silt entry is also valid, but the debug platform is preferred for this focused pass.

## Test — about 4–6 minutes
1. Enter / reset Silt.
2. Move into the first low-rib pressure-reading band.
3. **Pulse by itself once.** It should *not* award the pressure read.
4. Hold **Stabilize** briefly.
5. While still holding Stabilize, press **Pulse once**.
6. Keep Stabilize held and confirm the living ribs continue opening from the same relationship.
7. Release Stabilize after the ribs are open.
8. In the appetite pocket, first approach one dark packed-residue body and hold **Absorb** long enough to trigger the squeeze once.
9. Confirm the route compresses but the earlier pressure read / rib brace are not lost.
10. Hold Stabilize until the passage recovers.
11. Move deliberately to the warm porous body and hold **Absorb**.
12. Confirm the porous body is accepted while both dark packed bodies remain.
13. Travel to the deep pressure organ and let the route settle into the return breath.
14. Follow the return breath / fold toward Hub if convenient.
15. Export telemetry with **Shift+T**.

## Feel questions
The most important human observations are:
- Does **Stabilize → Pulse** read naturally as “catch pressure, then send a read through it”?
- Does keeping Stabilize held into the rib brace feel like one continuous action rather than two checklist steps?
- When choosing porous versus packed matter, do **you** feel like you chose what Absorb acted on?
- Is the packed-residue squeeze readable as a consequence of your draw rather than an arbitrary failure?
- Does recovery feel physical and forgiving without erasing learned progress?
- Does the route remain recognizably Silt rather than feeling like Vascular with different colors?

## Telemetry acceptance
Expected:
- exactly **1** `silt.pressure_relationship_read`
- that event reports `action: stabilize_then_pulse`
- `pulseAloneCanReadPressure: false`
- exactly **1** `silt.selective_draw.completed`
- selection should be `porous_nutrient`
- packed residue remains intact
- exactly **1** `silt.relationship_route.completed`
- completion retains `pressure_density`
- route resolves to `return_breath`
- zero `movement.progress_blocked` events

The intentional packed-residue test may record one failure/recovery cycle. That is expected.

## Regression
- Pulse alone cannot read Silt pressure.
- No forced relocation.
- No new controller mapping.
- Vascular behavior unchanged.
- Grave behavior unchanged.
- Hub route commitments unchanged.
- Comb/Aperture behavior unchanged.
- Silt return crossing remains owned by `LocalCellBoundaryMorphSystem`.

## Decision after telemetry
If the pressure relationship works but the porous-vs-packed Absorb choice still feels automatic or ambiguous, do **not** reopen all of Silt. Scope a small HC031S1 appetite-attention ownership pass. Otherwise lock S and continue to Comb currentization.
