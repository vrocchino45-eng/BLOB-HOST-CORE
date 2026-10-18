# BLOB: HOST CORE — LS1E1 / First Verified Host Connection Receipt

**Install type:** Changed-files-only ZIP overlay. Not a full game. **Apply over the currently working D2P1 stack** (D2N1V plate seating + D2O1 trajectory memory + D2P1 three-habitat probe). Do not replace your full project with the LS1E0 audit archive. Keep previous HC/LS build tags indexed.

**Mode:** Narrow integration / convergence. **Milestone:** Silt authoritative cause → shared Host provenance → Vascular read-only diagnostic. **No** cross-cell grain transport yet.

## Modified files

- `src/core/HostConnectionReceiptLedger.js` **NEW**. A single runtime-instance Host provenance ledger. Accepts only valid deliberate `silt-trajectory:released-with-trajectory` decisions for one of eight Silt IDs. Deduplication uses the monotonic Silt decision sequence; the 64 most recent receipts are retained, while cumulative accepted/rejected/duplicate counts survive ring rollover. Each record includes origin, velocity, source receipt sequence, and explicit no-transfer/no-credit flags.
- `src/core/GameRuntime.js` **CHANGED**. Instantiates the Host ledger once and passes the same instance to the existing Silt and Vascular route systems. No new scheduler or region-crossing authority.
- `src/routes/SiltPressureRouteSystem.js` **CHANGED**. Hands the Host ledger an already-authored successful deliberate-release decision after the Silt decision recorder commits it. It does not treat region-hidden releases, plain Pulse, seating, or inputs as remote causes. Still owns all Silt motion/grip/seat logic.
- `src/routes/VascularRhythmRouteSystem.js` **CHANGED**. Publishes `vascularRhythmRoute.hostConnectionObservation` and a compact bottom-right read-only notice while Vascular is active, provided the Host has at least one source receipt. The notice explicitly says **SIGNAL ONLY** and **No grain arrival / no current change**. Existing currentization/cadence/return remains authoritative.
- `src/debug/WorldObjectCensusSystem.js` **CHANGED**. Exposes `hostConnections` and `vascularHostObservation` in the observation JSON, observes each new Host receipt once, and maintains lifetime capture totals separately from the 2,500-detail ring. Counts remain meaningful after detail rollover, although a separate source trace gap can still lose route-level receipts before capture sees them.
- `scripts/validateLS1E1.mjs`, `scripts/smokeLS1E1.mjs`, `scripts/regressD2P1.mjs` **NEW**. Node validation scripts. No extra runtime dependency other than the game's existing `three` installation for the direct smoke test.

## Explicit locks and exclusions

**LOCKED:** LS1A/D2P1 Garden/Reservoir/Veins geometry, the eight Silt material IDs and owner ledger, current material phases and native orbit, D2O1 spring 0.44 / drag 0.74 / max speed 2.1 / max acceleration 1.8, existing grip range and verbs, D2N1V socket, Vascular and Grave objectives, Core 3→6→12, Core radial physiology, Host rhythm profiles, existing return-region credits, camera, input mapping, audio reference.

**NO IMPLEMENTATION:** grain mass moving across route-cell boundaries; off-route grain simulation; globally saved cause history; Vascular receiver/redirect/contact condition; Vascular current amplification due to Silt; Grave imprint of this new cause; force, collision, chemical reaction, intake, route unlock. **Delete/disable targets:** none.

The Host ledger is persistent **within one open game runtime**, not browser reload/save persistence. Its provenance is not a physical stream or material ledger. Vascular only *reads* it; the actual grain remains under Silt ecology authority.

## Playtest: first real Silt → Vascular evidence loop

1. Install the files above over D2P1, retaining the original full game and existing dependencies. Run the usual Vite dev server and load BLOB. Start observation with **Alt + Shift + R** while in Silt.
2. Grip a moving Silt grain (**LT + A**), perturb it using the already-working Pulse/Absorb motion, and **release without seating**. This commits a `released-with-trajectory` event. It should still follow its usual D2O1 altered trajectory; no new effect should appear in Silt.
3. Return through the *existing* route flow and enter **Vascular**. Look for the discreet **VASCULAR / REMOTE CAUSE · SIGNAL ONLY** indicator near the lower-right edge. It should identify the Silt grain and count, but no physical Silt grain should appear in Vascular and Vascular current behavior must be unchanged.
4. Leave and revisit Vascular. The notice should still point to the same cause. Then revisit Silt if practical: eight grain identities still exist, the prior plate seating still works, and no remote cause consumed a grain.
5. Use **Alt + Shift + R** to stop, then **Alt + Shift + E** to export `BLOB_LS1E1_OBSERVATION.json`. Include a short note whether the Vascular signal was clearly readable and whether gameplay still felt unchanged.

**Negative test:** Start a fresh runtime, enter Vascular without any deliberate Silt release in that runtime. No remote-cause notice should appear. A grain released by leaving Silt with an active grip is tagged `region-hidden` and does **not** earn a Host connection cause. A seated grain similarly creates no release-cause receipt.

## Data to inspect in JSON

- `summary.hostConnections.finalState.records[]`: `id`, `sourceCellId`, `sourceReceiptSequence`, `subjectId`, `origin`, `releaseVelocity`, `materialTransfer:false`, `routeCredit:false`.
- `summary.hostConnections.vascularReadOnlyView`: signal-only most recent cause and `materialArrived:false` / `circulationChanged:false`.
- `events[]`: `host-silt-cause-observed` for each new cause recorded after capture start (up to the bounded 2,500 detailed events).
- `summary.captureRetention`: cumulative observed event count, retained details, dropped details, and independent Silt trace gaps.
- `summary.heldMaterialMotion`: cumulative recorded receipt sums and canonical Silt pull delta, now independent of recorder detail rollover. Source trace gaps remain an explicit proof limit.
- `finalAuthority.siltPlateSeat`, `finalAuthority.siltTrajectory`, `finalAuthority.hostConnections`: intact route-local truth.

## Validation and limits

Passed locally: **35/35** focused unit/source tests, **18/18** direct Silt route event-to-Vascular indicator smoke assertions using the actual class methods with a test Three stub, and **25/25** existing D2P1 regression checks — total **78/78**. All assembled JavaScript relative imports resolve (166 checked); patched JavaScript syntax checks pass. Verified `GameRuntime.js` source matches the newer LS1D1B baseline before this overlay.

**Not run:** full Vite production build or rendered browser/controller test. Dependency installation stalled in this container, leaving no usable `vite` or `three` packages for full compilation. The direct smoke used a temporary test-only `three` stub — never put that stub in the user's project. In-game diagnostic layout, Vascular return, and multi-cell visual continuity still require user playtesting.

## E1 acceptance / next pass

E1 passes if deliberate Silt releases create deduplicated source causes; Vascular exposes them without simulating arrival, alteration of circulation or progress; and Silt identities/seat/motion remain unchanged. If confirmed, **E2** can define a real Vascular receiving surface/contact condition and establish a distinct environmental consequence; don't claim Silt matter is physically transported until that independent proof exists.
