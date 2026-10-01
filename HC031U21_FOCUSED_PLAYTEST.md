# HC031U2.1 Focused Playtest — Relationship Intent Latch

Apply over **HC031U2**.

1. Reload and confirm build `HC-031U2.1`.
2. Shift+8, complete Signal Plain/Ridge, enter Gathering Ground normally.
3. Let both ambient reads happen first.
4. Near the Watcher: hold Stabilize, tap/release Pulse once, then **keep Stabilize / the relationship** while the answer develops. HUD should show `INT Wxx%` increasing instead of `BRK`.
5. Near a relay: hold Stabilize, initiate Absorb, then keep the stabilized relationship while the relay answers. HUD should show `INT Rxx%`.
6. Reach `LIFE 6/6`.
7. Release, wander away locally, return after cooldown, repeat one understood relationship. Confirm `LOOP` rises above 0.
8. Deliberately abandon one retry by moving away or switching intent long enough. Confirm an interruption still occurs.
9. Shift+T export telemetry.

## Acceptance
- `gatheringGroundUniqueEncounterCompletions = 6`
- reactive completions = 2 first-read relationships
- cross-territory completions = 2
- normal deliberate Watcher/relay attempts do not repeatedly interrupt on Pulse/Absorb release
- at least one rearm/recurrence after real release + cooldown
- `gatheringGroundOngoingResponseCycles >= 1`
- memory can remain/return `coherent` during Stabilize-led play
- no movement-progress block or T6 continuity regression
