BLOB — BOT1-D7 / G1-D7 VISUAL-DIRECTIONAL EXPLORATION
===================================================
MODE: Instrumented exploration / convergence; NO gameplay source modifications.
SOURCE: BOT1-D6 failure and owner-certified 14:50 human Fold completion.

WHAT CHANGES:
  - bot1d7_vision.py: color/material landmark CANDIDATES and viewpoint descriptors
  - bot1d7_browser.py: screenshots, three-view survey, persistent forward movement
  - analyze_bot1d7.py: independent owner REC1 referee and clear limits
  - test_bot1d7.py: offline policy, visual and referee tests (42 assertions)

What this does NOT do:
  - It is NOT learned human navigation or a classifier trained to recognize Fold.
  - Cyan structures may be scenery; no candidate is called a Fold or waypoint.
  - Viewpoint novelty is NOT world displacement, target distance, or evidence of progress.
  - Neither the policy nor the runner uses REC1, Fold coordinates, owner state,
    debug warp, or target packet properties to select movement.
  - Not a modification to Guide, Core, Host circuit, runtime or 3/6/12 systems.

REQUIRES in BLOB_BOT1_REAL_INPUT_HARNESS/scripts:
  bot1d3_browser.py, bot1d3_motion.py, bot1d5_policy.py,
  bot1d6_browser.py, bot1d6_policy.py, analyze_bot1d6.py.
  Python Playwright and Pillow from earlier passes.

POWERSHELL — one command per line; commands assume terminal in BLOB-HOST-CORE:

1. Save BOT1D7_VISUAL_DIRECTION_20261028.zip in project root.
2. Expand-Archive -LiteralPath .\BOT1D7_VISUAL_DIRECTION_20261028.zip -DestinationPath .\BOT1D7_EXTRACT -Force
3. Copy-Item -Path '.\BOT1D7_EXTRACT\*.py' -Destination '.\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\' -Force
4. py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d7.py
   Expected: 42 offline assertions passed. This is NOT a real game pass.

Keep `npm run dev` active in a second terminal, 127.0.0.1:5173.
5. py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d7_browser.py --browser-channel chrome --headed --seconds 240 --seed 11 --checkpoint-every 45 --output BOT1D7_RESULTS
6. py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d7.py BOT1D7_RESULTS
7. Compress-Archive -Path .\BOT1D7_RESULTS\* -DestinationPath .\BOT1D7_RESULTS.zip -Force
8. Upload BOT1D7_RESULTS.zip for G1-D7 owner/visual comparison.

Pass gate: owner inApproach or stageIndex>=1. Best: stageIndex==5 and
completed:true. A mere Fold invitation is stage 0, NOT a passing Fold route.

Recorder checkpoints every 45s protect against premature browser exit.
Each checkpoint is cumulative partial evidence, independent referee labels
incomplete captures instead of pretending the bot completed the level.

NOTE: This pass deliberately keeps the existing D3 nursery-acquisition action
pattern so we can isolate changes AFTER the Fold invitation. It does not fix
nursery contamination, Guide communication, or Host receipt propagation.
