# BLOB HOST CORE — LS1D1D2G Silt Verb Route Transaction Audit

**Changed-files patch; apply after LS1D1D2F REC_AND_AUTHORITY.**

## Exact replacements (2 existing files only)

- `src/routes/SiltPressureRouteSystem.js`
- `src/debug/WorldObjectCensusSystem.js`

No deletion. Do not apply the unapplied experimental `LS1D1D2E_AUTHORITY_GUARD` patch. Preserve all other source files.

## Source-based finding

- `SiltPressureRouteSystem.updatePlay()` handles **Pulse** as a pressure read/echo/unbound signal, and **Absorb** as distance-based porous-packet or packed-residue appetite selection. It does not use `siltGrip.heldId` as the receiver for Pulse force or as absorbable matter.
- `SiltGripAuthority` plus `MaterialIdentityLedger` manage held-grain identity and transfers between environment and grip, with release returning ownership to environment.
- `CoreVerbPhysicalizationSystem` explicitly labels committed Silt Absorb visuals `silt-committed-priority-preview-no-transfer`. The filament does not prove a material transfer.
- Other game systems have their own Pulse/chemistry routes; this patch does **not** claim to characterize those paths.

## Additions — diagnostics only

1. **Actual Silt route receipts** at Pulse and Absorb branch decisions, with monotonic sequence, frame, held-grain ID, prior aim candidate, selected environmental branch, and selection distances.
2. **Bounded 64-event ring** published under `frameState.siltPressureRoute.transactionTrace`. No new gameplay mechanics, selection priority, ownership, physics, movement, ecology, traversal, visuals, or progression.
3. **Existing observation recorder** collects every new route receipt since the previous 150ms sample (rather than guessing from button input). Starts at the current trace sequence so old receipts are not replayed; explicitly flags an overwritten ring gap.
4. The JSON retains the REC indicator, controller edges, input timestamps, material ledger and Silt progression counters. Adds route decision summary and existing presentation authority readout.

### Important proof limit

A receipt `heldGrainId: "silt-grain-01"` + `route: "retained-pressure-echo"` means the grain *was being held when Silt's environmental pressure handler processed Pulse*. It does **not** prove the grain received impulse. Likewise `decision: "no-spatial-packet-selected"` means Silt's spatial appetite handler found no eligible packet, even if a grain was held. Other systems are not ruled in or out.

## Short user playtest

1. Replace the two files above. Restart Vite if needed, and reload the game.
2. Press **Alt+Shift+R once**. Look for `● REC mm:ss`.
3. In Silt, hold **LT (Stabilize)**, aim at a grain, press **A** to commit.
4. While held, use **Pulse**, then **RT (Absorb)**, and move your aim off that grain.
5. Release with **A** or releasing LT.
6. Press **Alt+Shift+R again** to stop, then **Alt+Shift+E** to export `BLOB_LS1D1D2G_OBSERVATION.json`.
7. Upload the JSON. A 1–2 minute capture is sufficient.

## Validation

- Both changed JS files: `node --check` PASS.
- Actual `SiltPressureRouteSystem.updatePlay` branch behavior, run with a minimal THREE math stub and real route prototype + recorder integration: **14/14 PASS**.
- D2F backward-compatibility recorder/grip/material bot: **24/24 PASS**.
- ZIP integrity: PASS.
- Full Vite/Three rendered runtime: **NOT RUN** (package dependencies unavailable).
