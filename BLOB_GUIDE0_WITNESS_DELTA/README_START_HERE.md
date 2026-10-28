# BLOB — GUIDE0-W: Core–Guide cross-owner witness

**Baseline:** BOT1-D installed and working. This is a **read-only recorder patch**, not a Guide gameplay upgrade. It adds no Guide animation or knowledge, and changes no Pulse or packet acceptance.

## Why

BOT1-D recorded an accepted Pulse on scar-touched moving matter (`tender_strained_scar_spread`) but no Guide reaction data. The Folded Lantern warns about an explicitly selected scar object, which is not proven to be the same thing as a scar-touched traveling packet. The Guide's response to any nearby Pulse is not the Watcher's accepted read.

## Install (project root)

1. Extract this delta folder beside `src/` and `BLOB_BOT1_REAL_INPUT_HARNESS/`.
2. `node BLOB_GUIDE0_WITNESS_DELTA/apply.mjs --check` — **must** say `BOT1D_READY` (or already installed).
3. `node BLOB_GUIDE0_WITNESS_DELTA/apply.mjs --apply`
4. `node BLOB_GUIDE0_WITNESS_DELTA/validate.mjs`
5. `npm run build`

To revert: `node BLOB_GUIDE0_WITNESS_DELTA/apply.mjs --revert` (only when unchanged since installation). Source-drift refusal is intentional; do not force-overwrite your checkout. Installer preserves original bytes for rollback, including Windows CRLF.

## Capture without changing the bot

With `npm run dev` running separately:

```
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/bot1d_browser.py --browser-channel chrome --headed --seconds 110 --seed 11 --output GUIDE0_RESULTS
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/analyze_guide0.py GUIDE0_RESULTS
Compress-Archive -Path .\GUIDE0_RESULTS\* -DestinationPath .\GUIDE0_RESULTS.zip -Force
```

This repeats the established BOT1-D HUD-only agent with fresh GUIDE0 telemetry. The bot cannot inspect the Guide state, packet class, or owner coordinates to decide its actions.

## What is recorded

- `guide0-core-guide-state`: sampled Guide posture, target, reaction, proximity, prompt ownership and nursery owner state (state changes + 5-second heartbeat).
- `guide0-pulse-owner-pair`: canonical Pulse ID and genuine owner accept/reject, paired with contemporary Guide and prompt observations.
- `guide0-nursery-outcome-pair`: accepted owner outcome (scar/clean), alongside Guide and prompt snapshots.

**Non-claims:** A Guide wave may simply acknowledge the Core; it is not Watcher read acceptance. `guide_physically_holding_selected_core_piece` remains pose-only without a gameplay-owned force receipt. REC1 polls at ~150ms; a sampled simultaneous reaction is not causation proof. The HUD-only bot cannot identify clean packets if the player-facing information does not distinguish them.

## Decision gate

Use the uploaded `GUIDE0_RESULTS.zip` to decide whether GUIDE1 needs better material perception, prompt/visual coordination, or physics assistance. Do not add those behaviors before examining evidence. The authentic Host circuit and 3/6/12 remain locked.
