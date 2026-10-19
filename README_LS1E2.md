# BLOB — LS1E2 / First Functional Vascular Receiving Circuit

**Mode:** bounded functional connection pass. **Status:** source and isolated method tests passed; user browser acceptance pending.

## Purpose

The prior LS1E1 signal-only receipt bridge was verified in the real build: an authenticated deliberate Silt grain release was recorded by the Host ledger, and a Vascular corner indicator displayed its provenance. LS1E2 adds one *real, bounded Vascular-local environmental response* to those receipts. It is the final pass of the Host bridge before the separate invisible circuit-architecture design discussion. It does not implement a generalized circuit editor or circuit framework.

## Install

Apply over the **LS1E1T** build (itself applied over LS1E1R/LS1E1). Extract this ZIP at the project root, merging only the listed paths. Restart the Vite server or hard-refresh. Do **not** replace the entire 1500-file project.

Changed source:
- `src/routes/VascularRhythmRouteSystem.js` — integrate a Vascular-owned receiver; use its bounded membrane state in directional current, existing vessel tissue/motes, and diagnostic; publish the local response separately from the old read-only observation.
- `src/debug/WorldObjectCensusSystem.js` — record Vascular receipt applications and include local response in JSON; keep the established Alt+Shift+R / Alt+Shift+E shortcuts and `BLOB_LS1E1_OBSERVATION.json` export name for compatibility; the **JSON pass field is LS1E2**.

New source:
- `src/routes/VascularSiltSignalReceiver.js` — small deterministic, bounded, route-owned receiver with strict provenance checks, monotonic receipt dedupe, saturation, and active-only relaxation. This is a **single proof component**, not a general network implementation.

Tests: `scripts/validateLS1E2.mjs`, `scripts/smokeLS1E2.mjs`.

## Behavior

1. An **already authentic** Silt deliberate release is accepted by the existing Host ledger as provenance (`observed_only`, no transported grain).
2. Only while Vascular is mounted, its independent receiver reads the verified receipts. Each is applied once. A release contributes 0.14–0.195 units of *signal-derived membrane load*. The total is clamped 0–0.85. This is **not mass or electrical charge**; it is a circuit-inspired rule used to structure an organic response.
3. The Vascular receiver load relaxes with time **only while Vascular is active**, not during off-route updates. It persists across Vascular exit/re-entry within the current runtime without replaying old receipts.
4. Existing Vascular current flow scales by `1 - load * 0.085`, so its maximum reduction is 7.225%, with no change to flow direction or to Vascular's original rhythm, relationship-read, completion, objective, or gate authorities.
5. Existing vessel envelope, braids, wall folds, and motes show a restrained, coherent living membrane response. No new object, target, prompt, or physics proxy is created.
6. The lower-right label changes to `VASCULAR / SILT SIGNAL RECEIVED · LOCAL RESPONSE`, showing the latest grain ID, receipt count, membrane load, and current scale. It explicitly states *No grain arrival / no progression credit*.
7. Existing Host read-only observation remains unchanged; an additional `frameState.vascularRhythmRoute.siltSignalResponse` records the **actual Vascular-local authority**.

**Not included:** Silt material entering Vascular; real material transport; Silt local authority changed; new save persistence; Grave memories; altered chemistry; progression credit; generalized resistor/capacitor implementation; off-route Vascular simulation.

## Focused browser test (approximately 4–6 minutes)

1. Start the game fresh with LS1E2 applied. Start recording with `Alt+Shift+R` before a Silt disturbance if practical.
2. In Silt, aim at a grain and grip with **LT+A**. Deliberately release the grain while **not seating it** (use the same reliable technique verified in LS1E1T); one authentic `released-with-trajectory` is sufficient. Stabilize/Absorb/Pulse must still feel as they did in LS1E1T.
3. Navigate into Vascular through existing traversal. Look for **`SILT SIGNAL RECEIVED · LOCAL RESPONSE`** near the bottom-right. Confirm nonzero `Membrane load` and `current ×0.xxx` (smaller than 1.000).
4. Compare nearby Vascular tissue motion, luminescence and current feel with an unmodified baseline or first visit without Silt disturbance. The response is deliberately modest, not a new dramatic particle effect.
5. Spend ~20 seconds in Vascular; load should slowly relax. Leave/reenter: previous receipt count must not multiply, and the stored local load should resume; the ordinary Vascular rhythm, stabilization, and return pathway must remain accessible.
6. Stop capture with `Alt+Shift+R`; export with `Alt+Shift+E`. **The compatibility filename remains `BLOB_LS1E1_OBSERVATION.json`**; inside, `pass` is `LS1E2-VERIFIED-VASCULAR-LOCAL-RESPONSE`. Upload the JSON and mention whether the tissue response was perceptible. If possible, attach one Vascular screenshot.

### Acceptance

- On a fresh runtime with **zero** verified Silt disturbances, receiver count=0, load=0 and flow scale=1; no remote-response indicator.
- With a verified Silt deliberate-release receipt, `summary.hostConnections.vascularLocalResponse.receivedTotal > 0` and `directionalFlowScale < 1`, with an observable membrane response when Vascular is active.
- `summary.eventCounts['vascular-silt-signal-received']` records distinct receipts applied **during the capture**; any receipts applied before REC begin are represented in finalAuthority/summary, not replayed as new capture events.
- Old receipts cannot retrigger by crossing the boundary. Malformed receipts, plain Pulse, region-hidden release, and plate seating cannot create a Vascular response.
- Silt retains eight grain identities, plate extraction/reseat, targeting, Pulse/Absorb/Stabilize, trajectory, and its authoritative route progression.
- Vascular keeps its own rhythm, current relationship reads, recovery, return-fold and bounded movement. No phantom grain, no materials crossing cells, no route credit, no save-file side effects.

## Build controls and validation

- **Allowed:** Vascular receiver state + modest Vascular-local flow and tissue response, minimal recorder observation, dedicated tests.
- **Forbidden:** modifying the Host ledger's provenance truth, Silt source mechanics, progression, authority ownership, region transitions, 3→6→12 engine, new material transfer, future general-purpose circuit libraries.
- **Locks:** source provenance (`LS1E1`), Silt targeting fix (`LS1E1T`), recorder (`LS1E1R`), rhythm/route mechanics, authoritative material conservation.
- **Retire/delete targets:** none in this bounded pass; do not add a parallel global state owner or a duplicate routing system.
- **Visual/feel target:** muted Vascular membrane contraction/brightness and slight current modulation tied to actual local receiver state, without screenspace clutter or a new waypoint.

### Tested

- `node scripts/validateLS1E2.mjs` — 19/19 isolated receiver/ownership/telemetry contract checks.
- `node scripts/smokeLS1E2.mjs` — 3/3 actual Vascular method checks with external Three.js mocked: flow calculation, wall-fold/envelope response, active-only notice behavior.
- `node scripts/validateLS1E1.mjs` — 35/35.
- `node scripts/regressD2P1.mjs` — 25/25.
- `node scripts/validateRecorderRepair.mjs` — recorder checks successful.
- `node scripts/validateLS1E1T.mjs` — 13/13.
- Node syntax checks for all changed/new source and scripts.

**Limit:** no installed `three`/Vite dependency tree in the build container; no full browser/scene performance test claimed. Older Three.js-dependent validation programs cannot run without project dependencies. User's gameplay test is the acceptance gate.

## Next discussion after this field test

**Invisible Host Circuit Framework — Circuit-to-World Translation Proof:** plan an engineering vocabulary (resistance, accumulation, one-way conduction, gating, memory, feedback) that translates through BLOB's established 3→6→12 chemistry/anatomy/rhythm grammar into organic objects and regions. First prove a generic behavioral arrangement can be reused with different regional/lore expressions, rather than implementing electronic-themed objects in player space. No additional runtime circuit system is included in LS1E2.
