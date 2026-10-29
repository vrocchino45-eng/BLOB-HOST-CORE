BLOB: HOST CORE — G1-D5 Spatial Localization & Locomotion Baseline
October 28, 2026

SCOPE: NEW PYTHON TEST SCRIPTS ONLY. No JS gameplay, Guide, Fold, controls,
progression, 3/6/12, geometry or Host circuit modifications.

WHAT IS BEING TESTED
- Probe bot: use already validated BOT1-D3 spatial sweep for Watcher invitation,
  then short camera-relative movements plus a read of visible pixel change.
  Two consecutive weak scene changes trigger a different movement direction.
- Optional MANUAL baseline: human controls the same running BLOB game in a Chrome
  window under the same owner/REC1 witness, without warp/debug shortcuts.
- Independent evaluator, run only AFTER REC1 export: Fold stage, owner-reported
  proximity, locomotion mode, attachment state, low-progress events, Guide state.

CRITICAL MEANING
- Pixel difference is NOT distance, motion, world direction, or evidence of a Fold.
  It can be due to ambient animation, camera/Guide/particle movement.
- Bot never reads owner coordinates, packet type, Fold distance, REC1 or attachment
  state to decide movement. Owner data goes to an independent post-run referee.
- A human baseline is explicitly human-driven, not autonomous bot success.
- Success requires owner inApproach=true or stageIndex >=1 after a real invitation.
  Merely reaching ~3-4 units is not completion.

INSTALL (ZIP HAS FOUR .py FILES AND ONE README AT ITS ROOT)
1. Download BOT1D5_SPATIAL_PROBE.zip onto the Windows PC, NOT your phone.
2. Extract with Windows File Explorer to a folder called BOT1D5_EXTRACT next to src.
3. In your VS Code PowerShell project root, run ONE LINE EACH:

Copy-Item -Path '.\BOT1D5_EXTRACT\*.py' -Destination '.\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\' -Force
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d5.py

Requires your existing BOT1-D3, BOT1-D4 and GUIDE0-W baseline, and Pillow
(py -m pip install pillow). No npm build necessary because gameplay is untouched.

RUN (with npm run dev running in another terminal)

py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d5_browser.py --browser-channel chrome --headed --profiles probe --seconds 145 --seed 11 --output BOT1D5_RESULTS

OPTIONAL HUMAN CONTROL BASELINE (separate normal-controls browser run):

py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d5_browser.py --browser-channel chrome --headed --profiles human --seconds 145 --seed 11 --output BOT1D5_HUMAN_RESULTS

To compare both, use --profiles probe,human and one results folder. In manual
mode, click the Chrome game if necessary and control the Core normally. Start
with the same actions you would use as a player. No debug warps. The script
automatically exports REC1 after the session; save screenshots as available.

ANALYZE AND ZIP (choose the folder actually passed to --output):

py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d5.py BOT1D5_RESULTS
Compress-Archive -Path .\BOT1D5_RESULTS\* -DestinationPath .\BOT1D5_RESULTS.zip -Force

UPLOAD BOT1D5_RESULTS.zip. No game changes should be committed for this pass.

SOURCE OWNERSHIP
- bot1d5_policy.py: deterministic short movement and rendered screenshot
  heuristic only; cannot access gameplay owner.
- bot1d5_browser.py: actual browser input + REC1 export after playing.
- analyze_bot1d5.py: independent owner/Guide/mobility referee after run.
- test_bot1d5.py: tests and synthetic fixtures only.

If the bot fails to acquire the invitation, that run does not evaluate Fold
wayfinding. If the human succeeds but bot fails, prioritize bot perception.
If both fail and owner mobility shows impeded attached samples, inspect
movement and path cues with video before altering authored geometry.
