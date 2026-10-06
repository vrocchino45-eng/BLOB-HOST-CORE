# BLOB HC-031W2A — Frame Truth Runtime Instrumentation

**Parent:** uploaded HC-031W1 project (`BLOB-HOST-CORE.zip`), project package version `0.31.54`, main build ID `HC-031W1`.

This is a **changed-files-only overlay**, not a standalone game. The W1 build ID and game physics were intentionally retained so all existing W1 validation and save/telemetry expectations remain valid. The **new diagnostic identity** is under `developerTruth.frameTruth.pass = "HC-031W2A"` in Shift+T telemetry.

## Apply
1. Preserve a copy of the working HC-031W1 folder (or commit its current contents).
2. Stop the Vite server.
3. Extract the ZIP directly into the root of the **matching** BLOB-HOST-CORE project; overwrite exactly the listed paths. There are no files to delete.
4. Do not replace `node_modules`, `.git`, user saves, runtime data or game configuration.
5. Run `node scripts/validateHC031W2AFrameTruth.mjs` and `npm run validate:current`.
6. Run the game normally on Windows, as before. At the end of a session press **Shift+T**. Open the exported JSON and inspect `developerTruth.frameTruth`.

### Controlled comparison
Refresh the game before each test so each run has its own telemetry session. Keep browser size, Core/camera start, route and debug HUD configuration the same. Play ~2 minutes in Surface Wake **without** screen recording; press Shift+T. Refresh, repeat the same route **with** recording; press Shift+T. For both, note whether the game was foreground/visible and the recording configuration. Then, if useful, repeat in a dense Hub/Comb location and Aperture. Upload both JSONs; a short video from the recorded run is optional.

`frameTruth` exports `total`, rolling 10-second `windows`, and up to 40 exceptional frame gaps. Each window includes actual animation-loop callback rate, raw/simulation/discarded seconds, p50/p95/max frame intervals, current-cell identity, update/render phase timing, renderer draw-call/primitive counts, hidden/unfocused frame counts and a snapshot of existing slowest-system samples. Stage timing is current-frame work; the `rawDt` interval includes the **previous** callback and event-loop waiting, so do not attribute any single raw gap solely to the current-frame stage.

**No gameplay timing correction yet.** `dt = Math.min(rawDt, 0.05)` remains unchanged. W2A first measures its loss; changing it without physics/contact validation would be premature.

## Rollback
Restore these three existing runtime files from your HC-031W1 backup and delete the one new observer and its one test file:
- `src/core/GameRuntime.js`
- `src/core/SessionTelemetrySystem.js`
- `src/core/SystemRegistry.js`
- delete `src/core/FrameTruthObserver.js`
- delete `scripts/validateHC031W2AFrameTruth.mjs`

## Scope locks
No changes to input, PlayerMovementController, targeting, contact, routes, ecology, camera logic, visual materials, audio mix, baseline datasets or session schema version (`blob.session.telemetry.v1.52`). The existing `SystemRegistry` timing sampler now gets **current** raw delta instead of the previously published delta.

## Known limitations
This is read-only app-level instrumentation, not an independent GPU timer or encoded MP4 FPS analysis. A window with a hidden/unfocused frame only establishes observed state at a callback, not a full-time visibility trace. The supplied Windows-origin node_modules tree lacks Linux Rollup's native optional binary; `npm run build` could not run in the Linux packaging container, while JS syntax and existing script regressions passed. No measured improvement is claimed until your side-by-side runs are available.
