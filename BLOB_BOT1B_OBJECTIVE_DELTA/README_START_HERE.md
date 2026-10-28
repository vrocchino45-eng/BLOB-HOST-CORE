# BLOB — BOT1-B: Objective-First Real Input Test

**Build hierarchy:** G1-B, test-only convergence. **Baseline:** BOT1-A Real Input Harness. **Game source changes:** NONE.

The first BOT1-A real-browser test recorded 111 events. The HUD directed **Pulse the moving matter**, but the reader bot issued no Pulse. Its policy erroneously prioritized the word “Stabilize” in a hotkey legend. This patch fixes the bot policy, not the game's mechanics.

## Install in your existing BLOB project root

Unzip `BLOB_BOT1B_OBJECTIVE_DELTA` beside `BLOB_BOT1_REAL_INPUT_HARNESS`, then run:

```powershell
py BLOB_BOT1B_OBJECTIVE_DELTA/apply.py --check
py BLOB_BOT1B_OBJECTIVE_DELTA/apply.py --apply
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/validate_bot1_contract.py --project .
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/validate_bot1b_policy.py
```

`--check` must return **BOT1A_READY**, or **BOT1B_INSTALLED** if previously applied. If it returns `DIFFERENT`, **do not apply**. This installer protects the exact BOT1-A source and Windows CRLF equivalents, saves its original bytes, and refuses divergent or partially installed content.

## The first actual-game test

In a second VS Code terminal, run `npm run dev` and leave it running. Back in the original terminal:

```powershell
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/bot1_browser.py --url http://127.0.0.1:5173 --browser-channel chrome --headed --profiles reader --seeds 11 --duration 35 --output BOT1B_RESULTS
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/analyze_bot1b.py BOT1B_RESULTS
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/analyze_bot1.py BOT1B_RESULTS
Compress-Archive -Path .\BOT1B_RESULTS\* -DestinationPath .\BOT1B_RESULTS.zip -Force
```

If Vite prints a different port, use the printed URL. If Chrome is not installed, use `--browser-channel msedge` with Microsoft Edge.

Upload `BOT1B_RESULTS.zip` to compare action decisions, REC1 input events, HUD guidance, and screenshots. This first run is 35 seconds; do not run the longer profile matrix until the short run's actual BLOB evidence is verified.

## How BOT1-B behaves

- Reads the **first imperative ability directive** in visible HUD content. It ignores control-legend words while choosing the objective.
- Refuses world-directed actions in Core Inspection; attempts to return to world view, with a retry bound.
- Calibrates X (Pulse), right mouse (Absorb), Q (Stabilize) as independent events.
- Issues the requested verb in world view, then uses small deterministic camera/movement probes if feedback remains unclear. Limits repeated objective attempts to six per run.
- Saves `before_pulse.png` and `after_pulse.png`, existing start/mid/end screenshots, `RUN.json`, and `REC1.json`.
- Adds `BOT1B_EVIDENCE.json` and `BOT1B_EVIDENCE.md` with objective-to-input correlation.

**Important:** A `game-pulse-event` proves dispatch, not that the target was hit or the Watcher accepted it. A change to HUD text alone proves neither. This remains a HUD-text-only agent; the 3D pixels are captured but are not read by the bot. Later vision-guided navigation remains a separate gate.

## Revert

```powershell
py BLOB_BOT1B_OBJECTIVE_DELTA/apply.py --revert
```

The revert refuses to overwrite anything modified after installation. Deletes only the new BOT1-B evaluator/checker and restores the exact saved BOT1-A browser script. Does not delete the results folder.
