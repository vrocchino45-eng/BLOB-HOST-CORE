# HC031U Focused Playtest — Gathering Ground Alive Pass 1

Apply over HC031T6.

1. Use Shift+8 and complete the accepted Aperture sequence: Signal Plain -> Ridge 3/3 -> Gathering Ground OPEN -> enter Gathering Ground.
2. Confirm the HUD title changes to `GATHERING GROUND` and shows `LIFE 0/6 A0/2 R0/2 X0/2` (counts may begin advancing immediately).
3. Do nothing for a moment. Linger near the perimeter Watcher and watch the two relays exchange a visible Host-matter packet. Ambient should reach A2/2 without requiring verbs.
4. Near the Watcher, hold Stabilize and tap Pulse. Expect a stronger Watcher scan/answer and R1/2.
5. Near either relay, hold Stabilize + Absorb. Expect the exchange to reverse/brighten and R2/2.
6. Watch the consequences rather than immediately leaving: one answer should travel back toward Membrane Ridge; one surplus matter packet should travel toward Ridge and settle there. Cross-territory should reach X2/2.
7. Back away toward the Ridge, then return to Gathering Ground. T6 OPEN/entry state must remain intact.
8. Export with Shift+T.

## Telemetry acceptance
- membraneRidgeContourReads: 3
- membraneRidgeCompletions: 1
- adjacentTerritoryTraversalOpenings: 1
- adjacentTerritoryEntries: 1
- adjacentTerritoryObservations: <= 3 for the staged read (redundant Pulse no longer inflates this)
- gatheringGroundUniqueEncounterCompletions: target 6 in the focused test
- gatheringGroundEncounterCompletions: target 6
- no unexpected cell change or teleport
- boundary clamps may occur only at the outer expanded Aperture volume, not at the old doorway

Ignored/interrupted encounter events are useful, not automatic failures: they indicate where a freeform player walked away before reading an encounter.
