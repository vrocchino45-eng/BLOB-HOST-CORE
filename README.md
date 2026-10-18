# BLOB HOST CORE — LS1E1R: Restore Observation Recording Hotkeys

**Apply OVER LS1E1**. This is a narrow changed-files-only overlay, not a whole game.

## Root cause

The LS1E1 `src/debug/WorldObjectCensusSystem.js` still implements Alt+Shift+R, Alt+Shift+E, and the top-left recording indicator. But the shipped LS1E1 `GameRuntime.js` never imports, constructs, or registers that class. Without `init()`, no keyboard listener or REC element exists. Existing observation JSONs from D2P1 do not prove that the new LS1E1 runtime actually binds the recorder.

## Changed files

- `src/core/GameRuntime.js` — imports `WorldObjectCensusSystem`, constructs one shared instance in `createDebugSystems()` using the live scene and frameState, registers it eagerly in `registerRuntimeSystems()` with `{update:false}`. This is global (no region scope or lazy initialization), independent of Silt/Vascular/Grave mount state.
- `src/debug/WorldObjectCensusSystem.js` — guards `init()` against repeated listener registration; ignores auto-repeated Alt+Shift+R/E events to prevent accidental double toggling/export. Recording, aggregation, Host provenance, Silt accounting and output JSON format are otherwise unchanged.
- `scripts/validateRecorderRepair.mjs` — stand-alone minimal DOM/keyboard smoke and source wiring assertions (not needed by game at runtime).

Do not delete or replace existing `HostConnectionReceiptLedger.js`, Silt/Grave/Vascular route files, or any earlier LS overlays.

## Playtest

1. Copy the `src/` paths into the same paths in your **LS1E1** project. Restart Vite or hard reload the game page to ensure the new GameRuntime module is loaded.
2. Click inside the game window. Press **Alt+Shift+R once**: top-left red-bounded badge should show `● REC 00:00` and count up. Press again to stop: a `REC STOPPED` notice should briefly appear.
3. Press **Alt+Shift+E**: browser should download `BLOB_LS1E1_OBSERVATION.json`. You may also export while REC is active.
4. Run a normal Silt release → Vascular signal-only check. Ensure the new Host connection and existing material ownership rules remain unchanged.

If the shortcut still fails, check the browser DevTools console for startup exceptions and verify that `src/core/GameRuntime.js` actually contains `worldObjectCensusSystem` registration. In Chrome, focus the game tab before triggering the shortcut; browser/system shortcuts or extensions can intercept combinations before the app receives them.

## Validation / limitations

- 21/21 dedicated Node assertions including real recorder class under fake DOM and key dispatch.
- 35/35 LS1E1 source validations, 18/18 source-to-Vascular smoke assertions, 25/25 D2P1 regressions.
- Actual headless Chromium **isolated recorder DOM**: Alt+Shift+R shows `REC`, stops; Alt+Shift+E downloads expected JSON; no page exceptions.
- Both changed JS source files pass `node --check`.
- **Not tested:** full Vite/WebGL game playthrough with complete dependency installation. Chromium proof exercises recorder in a focused page, not entire game.

**No other behavior changes:** Core controls, material identity, native trajectories, seat visual, geography, three-function grammar, Vascular response, Grave memory, progression, Host ledger, or audio.
