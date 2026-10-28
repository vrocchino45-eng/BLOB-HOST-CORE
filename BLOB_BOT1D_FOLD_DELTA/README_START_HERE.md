# BLOB BOT1-D — Listening Fold Navigation and Stage Acceptance

**Starting point:** BOT1-C must be installed and working. BOT1-D does not change how any player ability or world system responds. It introduces a read-only REC1 observation of `SurfaceWakeLayeredInteractionSystem` and two new bot scripts; BOT1-C stays installed.

**Proof hierarchy**
1. BOT sees the nursery Pulse instruction (visible HUD).
2. BOT records an owner-accepted Pulse near moving matter (BOT1-C witness).
3. Nursery publishes Fold invitation and visible HUD invites movement.
4. BOT attempts movement and interactions using normal keys. A changed HUD is an instruction, NOT proof.
5. **Only the Fold gameplay owner** may establish `stageIndex >= 1` (approached) or `completed: true` at stage 5 (complete sequence).

The Fold's authored sequence is approach, observe by Pulse, hold resonance, watch response, release and settle. The bot cannot use authored coordinates, object IDs or runtime state to decide actions. Its exploration is intentionally simple: it may fail to navigate an object that a sighted player can reach. That is a bot-perception limitation, not a proven game bug.

## Install (Windows PowerShell from project root)

```powershell
node BLOB_BOT1D_FOLD_DELTA/apply.mjs --check
node BLOB_BOT1D_FOLD_DELTA/apply.mjs --apply
node BLOB_BOT1D_FOLD_DELTA/validate.mjs
npm run build
```

Initial check must report `BOT1C_READY`. On `DIFFERENT`, stop: don't overwrite changed files. To revert BOT1-D only, run `node BLOB_BOT1D_FOLD_DELTA/apply.mjs --revert`.

## Browser test

Run `npm run dev` in another terminal. Then:

```powershell
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/bot1d_browser.py --browser-channel chrome --headed --seconds 110 --seed 11 --output BOT1D_RESULTS
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/analyze_bot1d.py BOT1D_RESULTS
Compress-Archive -Path .\BOT1D_RESULTS\* -DestinationPath .\BOT1D_RESULTS.zip -Force
```

Upload `BOT1D_RESULTS.zip`. For Edge use `--browser-channel msedge`. Keep the test focused; 110s is enough for one initial run, and no long playtest video is required.

## Explicit limitations

- An accepted Watcher Pulse **does not** mean the Fold was reached.
- The Fold is not another region's Host receipt and grants no material arrival by itself.
- The bot does not understand 3D pixels. It uses the rendered HUD and deterministic direction probing; owner telemetry is read only after the run for evidence.
- If the HUD disappears or the bot fails to discover the Fold, that is not sufficient to classify a game geometry/access defect.
- The recorder can miss transitions between polls; preserve screenshots and raw REC1 when ambiguous.
