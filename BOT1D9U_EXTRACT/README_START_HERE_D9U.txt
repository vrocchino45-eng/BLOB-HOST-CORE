BLOB / HOST CORE — G1-D9U (Arrival and Settling) — 2026-10-29
========================================================

PURPOSE
Make the Stage-1 approach found in BOT1-D9T repeatable by slowing/settling
near arrival and observing only visible HUD instructions. This is a BOUNDED
fixed-course experiment, not a general route planner or a Fold completion bot.

REQUIRES
- BLOB-HOST-CORE repository in the current PowerShell working directory
- BOT1 real input harness already working with BOT1-D9S and BOT1-D9T
- D9S recorder-only neutral observation patch still installed
- npm run dev running separately at http://127.0.0.1:5173
- Python, Playwright, Chrome as used in D9T

CHANGED FILES ONLY — NO BLOB GAMEPLAY CHANGES
  bot1d9u_policy.py
  bot1d9u_browser.py
  analyze_bot1d9u.py
  test_bot1d9u.py
  README_START_HERE_D9U.txt
  D9U_MANIFEST.json

INSTALL (each command individually in PowerShell)
  Expand-Archive -LiteralPath '.\BOT1D9U_ARRIVAL_SETTLING_20261029.zip' -DestinationPath '.\BOT1D9U_EXTRACT' -Force
  Copy-Item -Path '.\BOT1D9U_EXTRACT\*.py' -Destination '.\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\' -Force

CHECK
  py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d9u.py
  Expected: Ran 25 tests, OK (offline, not gameplay proof)

RUN (npm run dev in separate terminal)
  py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d9u_browser.py --browser-channel chrome --headed --runs 3 --seed 11 --seconds 145 --checkpoint-every 45 --output BOT1D9U_RESULTS

ANALYZE + ZIP
  py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d9u.py BOT1D9U_RESULTS --expected-runs 3
  Compress-Archive -Path '.\BOT1D9U_RESULTS\*' -DestinationPath '.\BOT1D9U_RESULTS.zip' -Force
Upload BOT1D9U_RESULTS.zip for the comparison against D9T.

POLICY
- Acquire Watcher invitation using the same visible objective-first actions
  as D9T; reproduce its first nine calibration trials unchanged.
- Perform travel-left as up-to-2.20-second hold, reading PUBLIC HUD after
  each 0.20-second slice. Stop left immediately on visible Fold-answer cue.
- Release key and allow .78 seconds neutral settle. If no public answer,
  allow at most two .20-second left corrections, each followed by .88 seconds
  neutral settling. Stop if any Fold-answer cue appeared, even transiently.
- Stop there; do not automatically attempt subsequent Fold stages.
- Never read REC1, Fold distance, owner position, hidden camera transforms,
  or hidden Guide state to select an online action.

INDEPENDENT REFEREE
- Counts only complete final REC1 exports; checkpoints alone are inconclusive.
- Requires owner-certified Stage 1 within the arrival window. Visible HUD
  alone is not success. Approach-only is not Stage 1.
- Reports max sampled approach/focus dwell, public cues, guide reaction,
  and any attachment contamination in the left movement window.
- Gate: 3 of 3 fresh Stage-1 certifications. If 3/3, repeat with a changed seed
  or timing before claiming a stable regression.

CAVEATS
- This fixed-course experiment does NOT show intelligent landmark navigation.
- Real-time input timing varies despite equal seed; outcomes may differ.
- Other stateful gameplay effects and neutral drift are not held constant.
- The scripted route does not modify the Fold range, physics, Guide, Silt,
  Vascular, Grave, or 3/6/12 systems.
