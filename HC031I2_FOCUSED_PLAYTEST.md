# HC031I2 — Focused Playtest

Target length: **about two minutes**.

1. Press **Shift+1**. The first readable surface should be the broad teal membrane rather than the red scar.
2. Move camera-forward. Confirm the sequence reads membrane → scar → residue.
3. Move while attached on membrane. Look for the teal pressure ring and swell.
4. Use **Stabilize + Pulse** on scar. Look for tightening orange bands.
5. Move onto residue and produce its amber yield/slump.
6. While attached to residue, hold **Stabilize**. A tighter amber hex should remain visible for about one second even if the suction contact visibly hands off.
7. Release Stabilize. The hex should relax; it must not keep the Core attached or braced.
8. Press **Shift+T**.

Telemetry acceptance:

- first post-jump ecology role: `living_membrane_path`
- `hostContactVisualGrammar`: `amber_hex_coherence` at least once
- `hostContactResidueCohereTriggerCount` greater than zero
- `hostContactResidueCohereVisualHold01` greater than zero after a valid trigger
- no movement-blocked events or regression outside the focused area
