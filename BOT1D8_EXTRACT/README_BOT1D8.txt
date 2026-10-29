BLOB — BOT1-D8 / G1-D8 MOTION-GROUNDED WAYFINDING
=================================================
MODE: BOT_ONLY / DIAGNOSE + CONVERGE. BLOB game source FROZEN.
WHY: D7 visually chose the right view 19/20 times; 40/41 post-invitation
owner movement samples had boundary distance >= .999 with positive pressure.
Human G1-D6 REC1 owner completed Fold; no source/game physics changes authorized.

NEW FILES (direct install):
  bot1d8_motion.py     screenshot-only motion proxy vs idle, NO world proof
  bot1d8_policy.py     balanced camera + fixed-camera movement / retreat strategy
  bot1d8_browser.py    real-input browser runner / cumulative REC1 checkpoints
  analyze_bot1d8.py   independent offline movement-owner/Fold referee
  test_bot1d8.py      synthetic offline test suite

REQUIRES existing in BLOB_BOT1_REAL_INPUT_HARNESS/scripts:
  bot1d3_browser.py, bot1d6_browser.py, bot1d6_policy.py,
  bot1d7_vision.py, analyze_bot1d6.py, and earlier dependencies.
  Python playwright and Pillow installed from earlier passes.

INSTALL: Save ZIP in C:\...\Documents\GitHub\BLOB-HOST-CORE project root.
In VS Code PowerShell, RUN EACH COMPLETE COMMAND SEPARATELY.

Expand-Archive -LiteralPath .\BOT1D8_MOTION_GROUNDED_20261028.zip -DestinationPath .\BOT1D8_EXTRACT -Force
Copy-Item -Path '.\BOT1D8_EXTRACT\*.py' -Destination '.\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\' -Force
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d8.py

Keep npm run dev active in another terminal, http://127.0.0.1:5173:
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d8_browser.py --browser-channel chrome --headed --seconds 240 --seed 11 --checkpoint-every 45 --output BOT1D8_RESULTS
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d8.py BOT1D8_RESULTS
Compress-Archive -Path .\BOT1D8_RESULTS\* -DestinationPath .\BOT1D8_RESULTS.zip -Force
Upload BOT1D8_RESULTS.zip.

SUCCESS GATE: owner inApproach:true or stageIndex>=1 (Fold approach).
SECONDARY: lower owner boundary-pressure fraction vs D7 historical
40/41, with real displacement and controlled camera-vs-move observations.
DO NOT ACCEPT: visual novelty, screenshot motion, pulse key events,
Guide shimmer, or Fold invitation as stage completion.

LIMITATIONS:
- Pixel motion/patch tracking is a rough perceptual proxy, not 3D motion,
  collision truth, distance to Fold, or a learned optical-flow controller.
- Only REFEREE reads REC1 events after actions. The live bot does NOT.
- D7 and D8 are not matched-state A/B tests; no guarantee of improved route.
- No gameplay change, no Fold threshold edits, no Guide physics, no LS1
  source modifications, no Silt-Vascular-Grave circuit changes.
- Only changed/new script files. Preserve the existing HC/LS1 history.
