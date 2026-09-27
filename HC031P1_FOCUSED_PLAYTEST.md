# HC031P1 Focused Playtest — First Destination Commitment Unblock

## Purpose
Prove that the first Hub destination no longer waits on the whole-Hub screen-composition validator.

## Duration
About 4–6 minutes is enough.

## Run
1. Play Surface Wake → Guide → Signal Chorus / Hub normally.
2. On first Hub arrival, stop for a moment and let the route bodies reveal.
3. Look for the Grave route's existing corridor/body wave. You do not need all three routes on screen at once.
4. Move toward Grave Memory.
5. When close, press **A once**. Do not repeatedly mash A unless nothing happens.
6. If the Host begins carrying you into Grave, let the morph complete.
7. Spend ~30–60 seconds in Grave so arrival is unambiguous.
8. Export telemetry with **Shift+T**.

## Pass evidence
Telemetry should contain, in order:
- at least one `hub.destination.readiness_changed`
- `hub.destination.available`
- `action.deliberate_commitment`
- `hub.destination.committed`
- `transition.entered` with gate `hub_to_grave_memory_route`
- `route.resolved` with `arrived_in_grave_memory`

The important diagnostic is that readiness may report `foundationCompleted: false` and `wholeHubScreenTruthVerified: false` while still reporting `screenTruthRequiredForCommit: false` and later becoming commit-ready.

## Regression checks
- Grave is still the only first route offered.
- Vascular and Silt do not become first-entry alternatives.
- approaching Grave alone does not auto-cross.
- Pulse/Absorb/Stabilize still behave normally.
- A outside the Grave commitment radius does not enter the route.
