# BLOB / BOT1-C — Watcher Owner Acceptance

## Purpose

BOT1-B proved that Pulse reaches the game, but not that the Watcher recognizes moving matter. Source inspection establishes the **actual Surface Wake rule**: a **live traveling packet** and **Core-to-packet distance <= the configured read range** (default 3.4 units). Aiming at a membrane mote is not the Watcher criterion. BOT1-C adds an owner-authored, read-only Pulse result tagged by exact `pulseEventId` and sampled by REC1; it does not change the owner acceptance branch or progression.

## Installation (Windows PowerShell, in BLOB-HOST-CORE)

Extract `BLOB_BOT1C_WATCHER_DELTA` into your project root. The guarded check must print **`BOT1B_READY`**. If `DIFFERENT`, stop; never force an overwrite.

```powershell
node BLOB_BOT1C_WATCHER_DELTA/apply.mjs --check
node BLOB_BOT1C_WATCHER_DELTA/apply.mjs --apply
node BLOB_BOT1C_WATCHER_DELTA/validate.mjs
npm run build
```

With `npm run dev` in another terminal:

```powershell
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/bot1c_browser.py --url http://127.0.0.1:5173 --browser-channel chrome --headed --seconds 16 --output BOT1C_RESULTS
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/analyze_bot1c.py BOT1C_RESULTS
Compress-Archive -Path .\BOT1C_RESULTS\* -DestinationPath .\BOT1C_RESULTS.zip -Force
```

Upload `BOT1C_RESULTS.zip` for review. Default suite runs four separate fresh-world recordings, ~16 seconds each: (1) passive baseline, (2) stationary Pulse, (3) limited camera movement/locomotion plus Pulse, and (4) Absorb-only control. No hidden target IDs, coordinate writes, automatic aim, or owner-derived bot decisions.

## Evidence meanings

- `game-pulse-event`: a canonical input, **not** Watcher acceptance.
- `bot1c-watcher-pulse-owner-result`: the SurfaceWakeGameplaySystem's **pulse ID, packet active, distance, range, acceptance, reason** recorded in REC1.
- `bot1c-watcher-owner-state-change`: poll-time owner packet-identification, cycle and fold-invitation state.
- `packet_pulse_read_accepted`: an owner-accepted moving-matter Pulse read; **not** proof the Listening Fold completed.
- `packet_out_of_read_range` / `no_active_packet`: proximity or timing miss, respectively.

The observer mirrors the owner rules and, if an initially out-of-range held Pulse becomes eligible later, records its accepted result under the same ID. REC1's 150ms polling can miss transient phases; actual owner witness fields persist until the next result. Aiming at a visible object is not the acceptance rule.

## Locked systems and rollback

The patch changes **no gameplay physics, ability thresholds, target eligibility, owner progression, Host receipts, or 3/6/12 behavior**. It adds read-only instrumentation in `SurfaceWakeGameplaySystem` and `WorldObjectCensusSystem` plus pure calculations and bot test scripts.

```powershell
node BLOB_BOT1C_WATCHER_DELTA/apply.mjs --revert
```

The installer preserves original bytes in `BLOB_BOT1C_WATCHER_DELTA/backups/`. It supports CRLF-only differences in the original baseline, rejects drifted files, and refuses rollback if installed source was subsequently edited.

## Verification limits

The local numerical and syntax checks do not prove browser appearance or Windows build success. Run `npm run build` and the four real browser scenarios; only then assess whether genuine packet reads occur and whether the HUD represents them accurately.
