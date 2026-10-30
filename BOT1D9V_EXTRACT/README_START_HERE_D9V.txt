BLOB / HOST CORE — G1-D9V: Stage 1 position retention and immediate Pulse
=======================================================================
Date: 2026-10-29

PURPOSE
Test if the D9U fixed arrival can reach owner-confirmed Fold Stage 2.
Repeat twice with seed 11, once with seed 13 to check an initial variant.
This is a controlled, nonprivileged browser experiment, NOT autonomous
navigation or full Fold completion.

DEPENDENCIES
- Existing BLOB-HOST-CORE repo and BOT1 harness scripts already working.
- D9T, D9U and D9S Python scripts remain in:
  BLOB_BOT1_REAL_INPUT_HARNESS\scripts\
- D9S neutral REC1 observation patch is still installed (for movement audits).
- Playwright + Chrome already installed from prior tests.
- Run npm run dev in a separate VS Code terminal before executing the bot.

THE ZIP CONTAINS ONLY 4 NEW PYTHON SCRIPTS, THIS README, AND A MANIFEST.
No gameplay changes; no installed files overwritten except if you manually
place a future version of the same D9V script names over these.

INSTALL (each as one command at the BLOB-HOST-CORE project root)
  Expand-Archive -LiteralPath '.\BOT1D9V_STAGE2_PULSE_20261029.zip' -DestinationPath '.\BOT1D9V_EXTRACT' -Force
  Copy-Item -Path '.\BOT1D9V_EXTRACT\*.py' -Destination '.\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\' -Force

OFFLINE TESTS
  py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d9v.py
Expected: Ran 27 tests; OK. Offline checks are not gameplay proof.

BROWSER TESTS — 3 fresh contexts, 2 with familiar seed, 1 with different seed
  py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d9v_browser.py --browser-channel chrome --headed --runs 3 --seeds 11,11,13 --seconds 145 --checkpoint-every 45 --output BOT1D9V_RESULTS

INDEPENDENT ANALYSIS
  py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d9v.py BOT1D9V_RESULTS --expected-runs 3

ZIP RESULTS FOR REVIEW
  Compress-Archive -Path '.\BOT1D9V_RESULTS\*' -DestinationPath '.\BOT1D9V_RESULTS.zip' -Force
Upload BOT1D9V_RESULTS.zip to ChatGPT for independent audit.

EXPERIMENTAL POLICY
- Acquire Watcher invitation with the D9U/D9T public-objective baseline.
- Perform identical first 9 fixed course actions and the D9U leftward crossing.
- Stop leftward movement upon the publicly visible Fold-answer cue.
- Check cue promptly after release. Attempt at most 2 short Pulse inputs (X),
  and only while the current public HUD still indicates the Fold-answer stage.
- Stop immediately if public instructions advance to stabilization/holding.
- Do not automatically attempt Stage 3+, modify game behavior, or use hidden
  position, REC1 owner state, focusDistance, Guide internal state, or telemetry
  APIs to guide the bot.

OFFLINE ACCEPTANCE
- REC1 final (not only checkpoints); full course + no dropped details.
- Owner Stage 1 in the bounded arrival window; Stage 2 independently recorded.
- A real REC1 game-pulse-event temporally matches the online X action, and the
  owner Stage 2 transition follows it.
- 3/3 Stage 2 under the varied-seed schedule is strong initial evidence;
  smaller counts are partial or failed tests, never silently promoted.
- Even 3/3 would NOT prove generally reliable navigation, Guide assistance,
  retained focusReady, or complete Fold Stage 5.

KEEP REFERENCE BUILD FROZEN FOR THIS TEST.
