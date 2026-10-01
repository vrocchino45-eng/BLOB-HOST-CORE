# HC031U2.1 — Gathering Ground Relationship Intent Latch

## Parent
HC031U2 — Persistent Living Ecology + Encounter Pacing

## Why this pass exists
The first HC031U2 human run retained T6 continuity and improved ambient pacing, but reactive encounters were too brittle: 13 starts produced only 2 total completions, 11 interruptions, and no rearms or recurrences. Both reactive encounters repeatedly failed on `relationship_chord_broke_before_answer` even after strong valid initiation.

## Change
The exact composite chord is now an **initiation event**, not a frame-by-frame sustain requirement.

- Watcher: `cohere_project / stable_interrogation` starts the interrogation; `cohere / anchored_observation` sustains it.
- Relay: `cohere_draw / held_intake` starts intake; `cohere / flow_alignment` sustains it.
- Normal transient mismatch grace: 0.72s.
- Leaving the local body: 0.45s grace.
- Concrete retarget away from Gathering Ground: 0.50s grace.
- Progress freezes during grace rather than resetting immediately.
- Sustained incompatible intent still interrupts and returns the encounter to available with retry backoff.
- Recurrence now requires release of the sustained relationship, not merely release of the initiating Pulse/Absorb chord.

## Memory correction
`cohere` now contributes to coherent relationship memory alongside `cohere_project` and `cohere_draw`; Stabilize-only sustain no longer incorrectly accumulates pressure.

## Readability
HUD adds `INT W... R...` progress/break truth. Telemetry v1.49 adds Watcher/Relay intent latch, progress, break seconds, and break reason to movement samples.

## Locked systems
No movement, Ridge, Aperture bounds, targeting math, Signal Plain, Vascular, Silt, chemistry, controls, route, or cell ownership changes. No new encounter IDs.

## Validation
- HC031U/U1/U2 inherited structural validators PASS in reconstructed test root.
- HC031U2.1 structural validator PASS.
- HC031U2.1 deterministic relationship-intent smoke PASS: LIFE 6/6, LOOP 2, MEM coherent.
- Six-profile bot convergence PASS: normal explorer LIFE 6/6 / LOOP 2 / zero false interruptions; slow observer ambient-only; aggressive, boundary-stress, and chaotic profiles still interrupt; backtracker returns and reaches LIFE 6/6.
