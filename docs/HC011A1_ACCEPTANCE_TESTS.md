# HC-011A1 Acceptance Tests

## Automated

1. Complete the real Vascular cadence circuit and lock all three reads.
2. Apply 178 further Pulse events and verify risk, synchronization, integrity, turbulence, and completion state cannot worsen.
3. Verify the ignored post-read Pulse count is published for diagnostics.
4. Force `sync:0`, `integrity:0`, and `turbulence:1` after `3/3`.
5. Hold Stabilize without moving and verify recovery completes within 3.5 seconds.
6. Verify the third valve's authored depth satisfies the deep-route requirement.
7. Verify current reversal, objective completion, and return readiness follow recovery.
8. Return through `GateSystem` with player position preserved.
9. Verify Silt remains awake but non-crossable and all inherited route state remains intact.
10. Verify F1 selects Vascular and publishes Stabilize range, distance, in-range state, held input, and ignored Pulse count.
11. Run the complete inherited validation chain, production build, served-output check, and archive-integrity check.

## Live

1. Load the build and reach Vascular after Grave return.
2. Pulse-read all three valves.
3. Continue pressing Pulse several times after `3/3`; confirm the route no longer scatters further.
4. Stop pressing Pulse and hold `LT` inside the braided vessel.
5. Confirm recovery feedback begins immediately and the charge settles into the gold reversed current.
6. Follow the current to the remembered fold and press `A` or `E` to return.
7. Confirm Hub regains ownership and both Grave memory and the unopened Silt contract remain intact.
8. Open F1 and confirm Vascular is the active flow owner and the post-read evidence matches the live state.
