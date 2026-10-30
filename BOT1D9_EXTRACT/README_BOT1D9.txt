BLOB: HOST CORE — G1-D9 CAMERA / TRANSLATION CALIBRATION
========================================================
MODE: BOT-ONLY / SHORT CONTROLLED DIAGNOSTIC. GAMEPLAY SOURCE FROZEN.

WHY D9: D8 reduced boundary pressure from D7 but did not reach the Fold.
D8's online steering still cannot distinguish real travel, camera turning,
ambient flow, and repeated scenery with enough confidence to choose a route.
Your human REC1 demonstrates that the Fold route itself is traversable.

NEW FILES (flat ZIP; only changed files):
  bot1d9_calibration.py   fixed 3-view calibration grammar and visual measurements
  bot1d9_browser.py       actual Chrome input, REC1 checkpoints, screenshots
  analyze_bot1d9.py      independent offline owner referee; NEVER used by bot
  test_bot1d9.py         offline unit/policy tests; no real browser run asserted
  README_BOT1D9.txt      this file
  BOT1D9_MANIFEST.json   package provenance and strict scope

REQUIRES preinstalled scripts from D3/D5/D6/D7/D8 in:
  BLOB_BOT1_REAL_INPUT_HARNESS\scripts\
Requires Python + Pillow + Playwright from prior BOT1 tests.

INSTALL (PowerShell in Documents\GitHub\BLOB-HOST-CORE root)
Save BOT1D9_CAMERA_TRANSLATION_CALIBRATION_20261029.zip into that root.

Expand-Archive -LiteralPath .\BOT1D9_CAMERA_TRANSLATION_CALIBRATION_20261029.zip -DestinationPath .\BOT1D9_EXTRACT -Force
Copy-Item -Path '.\BOT1D9_EXTRACT\*.py' -Destination '.\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\' -Force
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d9.py

Expected: 60 offline assertions and OFFLINE_CALIBRATION_POLICY_PASS.
No live browser or Fold progress claimed by offline tests.

With npm run dev running in another terminal at http://127.0.0.1:5173:
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d9_browser.py --browser-channel chrome --headed --seconds 185 --seed 11 --checkpoint-every 45 --output BOT1D9_RESULTS

AFTER the run finishes:
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d9.py BOT1D9_RESULTS
Compress-Archive -Path .\BOT1D9_RESULTS\* -DestinationPath .\BOT1D9_RESULTS.zip -Force
Upload BOT1D9_RESULTS.zip for audit.

WHAT IT TESTS:
- D3's existing nursery acquisition, stopping when public HUD announces Fold.
- Three precommitted camera headings: center, left, right.
- At each heading, W/S/A/D movements with neutral idle before the action.
- Looks are isolated from translation; screenshot response compared with idle.
- Referee pairs sparse REC1 owner positions with trial windows AFTER recording.
- Visual repeat at end is a descriptor similarity, NOT proof of same location.
- Captures cumulative REC1 checkpoint every 45 seconds and final export.

PASS / FAIL RULES:
- Gate A: Full calibration course and adequate independently paired REC1 samples.
  Even if sufficient, status is SAMPLED_FOR_REVIEW, NOT physical causation proven.
- Gate B: Deliberately NOT tested: this is not a route loop optimization pass.
- Gate C: Owner confirms inApproach=true / stageIndex>=1, if accidentally reached.
  Otherwise NOT_PASSED; this is not the primary D9 aim.
- Missing owner samples => UNKNOWN, never zero movement or success.

LOCKED:
- No BLOB gameplay, Fold target range/geometry, Core targeting, or camera code.
- No Guide physics, Host chemistry, Silt/Vascular/Grave or 3→6→12 grammar.
- No owner REC1 access for online actions; no human Fold world coords in bot.
- Preserve all HC, LS1, BOT0/BOT1 historical tags and old experiments.
- Cleanup optional: do not commit BOT1D9_EXTRACT or large RESULT folders.

KNOWN LIMITS:
- Held keyboard durations are NOT calibrated camera-angle measurements.
- Pixel motion may be particles, water, parallax, or camera stabilization.
- REC1 movement owner is sampled; brackets can include free drift or other time.
- Successful diagnostic != solved Fold direction. Explicit visual route cue may
  be the next design candidate if localization remains unresolvable.
