# BLOB — BOT1-D3 / GUIDE0-W: Evidence-Driven Acquisition

**Mode:** Test/convergence. **Foundation:** existing BOT1-D + GUIDE0-W source. **Gameplay code:** unchanged.

## Purpose

Compare a repeatable movement/camera sweep with a policy that uses only *unclassified motion in screenshots* to adjust the camera. Neither policy receives packet position, type, exact range or owner acceptance as input. Owner observations are scored **after** the run by REC1.

Do not interpret a screen-motion cue as a packet identification. The Guide, tissue, and environmental particles also move. Material class and success are independent owner results.

## Install

The ZIP has one outer folder, `BLOB_BOT1D3_PERCEPTION_TEST`. Extract it anywhere and **copy the five `.py` files inside its `BLOB_BOT1_REAL_INPUT_HARNESS/scripts` directory** to the existing `BLOB-HOST-CORE\BLOB_BOT1_REAL_INPUT_HARNESS\scripts` directory. The files are **new test files**, no `apply` step or gameplay source changes. Existing BOT1-A/B/C/D scripts remain. Requires already installed `GUIDE0-W` for the cross-owner evidence.

If the archive is in the BLOB project root, these PowerShell commands install only the new scripts:

```powershell
Expand-Archive -Path .\BLOB_BOT1D3_Perception_Acquisition_20261028.zip -DestinationPath .\BOT1D3_EXTRACT -Force
Copy-Item -Path .\BOT1D3_EXTRACT\BLOB_BOT1D3_PERCEPTION_TEST\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\*.py -Destination .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\
```

Run preflight:

```powershell
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/validate_bot1d3.py --project .
```

If any source check reports `STOP_SOURCE_MISMATCH`, **stop**. Do not patch code to make the test pass without checking current build provenance.

Playwright is already installed from BOT1-A; the optional visual-motion sensor uses Pillow:

```powershell
py -m pip install pillow
```

Start `npm run dev` in a different terminal. Then run **two fresh game sessions**, under two minutes each:

```powershell
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/bot1d3_browser.py --browser-channel chrome --headed --profiles sweep,motion --seconds 75 --seed 11 --output BOT1D3_RESULTS
```

Analyse and ZIP the exact folder:

```powershell
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/analyze_bot1d3.py BOT1D3_RESULTS
Compress-Archive -Path .\BOT1D3_RESULTS\* -DestinationPath .\BOT1D3_RESULTS.zip -Force
```

Upload `BOT1D3_RESULTS.zip` with screenshots. No 60-minute recordings needed.

## Acceptance gates

- G1-D3 **acquisition**: at least one normal-input Pulse is marked `packetPulseReadAccepted:true` by Watcher owner. REC1 counts exact Pulse ID/reason/range.
- Clean invitation: must additionally have `tender_fed_clean_matter` (owner-authored), `foldInvitation:true`, and visible HUD Fold invitation. A successful scar read does not count.
- Fold completion: only owner `completed:true` counts; merely seeing Fold text is not enough.
- GUIDE1-A: compare Guide `lastReaction`, `state` and `prompt` on rejected, accepted, clean, scar outcomes. With no clean/scar matched pair, say **UNKNOWN**.
- Input/camera proof: bot log and corresponding owner events; no assumed movement from key press alone.

## Locks

No changes to movement, camera, targeting, range 3.4, Pulse/Absorb/Stabilize, contamination cycles, Fold progression, Guide sensing, regional circuits, Host receipts, Core 3/6/12, or HUD. Test scripts never set world state or teleport. Bot policy cannot inspect REC1, frameState, object coordinates or packet type until the run ends. The evaluator receives real owner state only **after** export.

## Revert

Delete these five new scripts: `bot1d3_browser.py`, `bot1d3_motion.py`, `analyze_bot1d3.py`, plus `validate_bot1d3.py` and `test_bot1d3.py`. No old source was overwritten.
