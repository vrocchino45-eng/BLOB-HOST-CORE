# HC031I3 — Focused Playtest

Target length: **two to three minutes**.

1. Press **Shift+1** and move camera-forward through membrane and scar.
2. Continue on the same line. The tan residue wash should now sit naturally after scar rather than off to the left.
3. Approach residue without using a verb. Only a low amber proximity response should appear.
4. Use **Stabilize + Pulse** while residue is recognized but not attached. Look for an incomplete, wavering amber hex. This is an attempt, not success.
5. Establish suction contact on residue and repeat **Stabilize + Pulse**. The hex should close and brighten.
6. During a brief suction handoff, the closed confirmed hex may persist for about 1.2 seconds, but the Core must not remain mechanically attached because of the visual hold.
7. Export with **Shift+T**.

Telemetry acceptance:

- `amber_residue_proximity` occurs without creating yield imprint
- `amber_open_hex_attempt` occurs with attempt count greater than zero
- `amber_hex_coherence` occurs only with confirmed trigger count greater than zero
- residue attachment or braced recoil produces nonzero yield/cohesion imprint
- no blocked movement, errors, or normal-play regression
