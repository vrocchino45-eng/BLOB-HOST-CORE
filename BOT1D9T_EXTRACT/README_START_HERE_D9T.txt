BLOB / BOT1-D9T — controlled Fold approach replication (2026-10-29)

MODE: VALIDATION / NO GAMEPLAY CHANGES

This package contains FOUR new Python scripts, nothing to install into the game.
It requires the previous D9S harness scripts already installed, including:
  bot1d9s_browser.py, bot1d9s_protocol.py, bot1d6_browser.py,
  bot1d3_browser.py, bot1d6_policy.py
D9S observer may remain installed; no additional source modification is made.

Goal: reproduce the D9S fixed camera/translation course from the visible
Watcher invitation through the 2.2-second leftward movement trial. Three
fresh browser contexts repeat the same course and seed. NO bot decisions
are influenced by owner coordinates, Fold distance, or REC1 data.

INSTALL (run each command individually from BLOB-HOST-CORE project root):
  Expand-Archive -LiteralPath '.\BOT1D9T_FOLD_APPROACH_REPLICATION_20261029.zip' -DestinationPath '.\BOT1D9T_EXTRACT' -Force
  Copy-Item -Path '.\BOT1D9T_EXTRACT\*.py' -Destination '.\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\' -Force

TEST:
  py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d9t.py

RUN (with npm run dev in another terminal):
  py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d9t_browser.py --browser-channel chrome --headed --runs 3 --seed 11 --seconds 145 --checkpoint-every 45 --output BOT1D9T_RESULTS

ANALYZE:
  py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d9t.py BOT1D9T_RESULTS --expected-runs 3

ZIP RESULTS:
  Compress-Archive -Path '.\BOT1D9T_RESULTS\*' -DestinationPath '.\BOT1D9T_RESULTS.zip' -Force

Upload BOT1D9T_RESULTS.zip.

WHAT COUNTS:
- Stage 1 must be confirmed by bot1d-listening-fold-owner-state in REC1.
- The independent scorer checks left-trial X displacement and attachment
  only AFTER the run; data never guide browser actions.
- A readable HUD, Guide animation, or visual movement alone cannot confer a pass.
- If any run lacks REC1 or course completion, report INSUFFICIENT evidence,
  not 'failed to navigate'.
- 3/3 = all repeated; 2/3 = partially repeated; 1/3 or 0/3 = not reliable.
- A fixed-route success doesn't imply learned directional perception.

LIMITS:
- Each run acquires its own Watcher invitation via public HUD and ordinary
  browser inputs; acquisition timing can vary and may fail.
- Timed look keys do not certify actual camera yaw.
- The baseline crossing may depend on source game state, camera and flow.
- No gameplay, Guide, Core, Fold, 3/6/12, chemistry or Host circuits changed.
