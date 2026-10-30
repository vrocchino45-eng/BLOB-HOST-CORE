BLOB — G1-D9S NEUTRAL-MOTION CALIBRATION (2026-10-29)
=====================================================

Purpose: Resolve D9's camera-only REC1 sampling gap. D9's existing
C0D4-MOB1 movement sample is deliberately written only while movement
input is active. A camera-only trial therefore cannot be proven from
that channel. This package adds one separate, read-only neutral-owner
REC1 event, plus a fixed observation/calibration runner and offline referee.

Authority and scope:
- No locomotion physics, camera control, Fold geometry, Guide, chemistry,
  3/6/12, or progression changes.
- The guarded installer does change ONE instrumentation source file:
  src/debug/WorldObjectCensusSystem.js; it makes an exact backup first.
- Bot decisions never access REC1, owner positions, camera transforms,
  Fold coordinates, or game-private state. Owner data are offline referee only.
- A clean camera-relative calibration is NOT promised. Attached trials,
  region changes, insufficient samples, and input contamination are excluded.
- Timed camera-key presses do not establish measured camera yaw angles.

PREREQUISITES
- Run these commands from the repository root in VS Code PowerShell.
- Existing D3, D6, D9 Python scripts already installed in
  BLOB_BOT1_REAL_INPUT_HARNESS\scripts.
- Python, Playwright, Chrome and Vite game environment from prior BOT1 runs.
- Commit/save your current work if desired. The recorder patch is reversible.

INSTALL (each on its own PowerShell line)
1. Expand-Archive -LiteralPath '.\BOT1D9S_NEUTRAL_MOTION_20261029.zip' -DestinationPath '.\BOT1D9S_EXTRACT' -Force
2. Copy-Item -Path '.\BOT1D9S_EXTRACT\*.py' -Destination '.\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\' -Force
3. py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d9s.py
   EXPECTED: Ran 17 tests ... OK. These are offline tests only.
4. py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\install_bot1d9s_observer.py
   EXPECTED: INSTALLED (backup src\debug\WorldObjectCensusSystem.js.preD9S.bak)
   If it prints D9S_INSTALL_REFUSED, DO NOT force-copy a source file.
5. py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\install_bot1d9s_observer.py --check
   EXPECTED: D9S_OBSERVER_INSTALLED

RUNTIME
6. In another terminal: npm run dev
7. py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d9s_browser.py --browser-channel chrome --headed --seconds 190 --seed 11 --checkpoint-every 45 --output BOT1D9S_RESULTS
8. py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d9s.py BOT1D9S_RESULTS
9. Compress-Archive -Path '.\BOT1D9S_RESULTS\*' -DestinationPath '.\BOT1D9S_RESULTS.zip' -Force
10. Upload BOT1D9S_RESULTS.zip for analysis.

The pass succeeds at *measurement coverage*, not route navigation, if:
- At least two look-only trials and three idle trials have paired REC1
  samples while fully free and without active movement input;
- At least two translation trials have independent paired owner readings
  while free; and there is no cell transition during those trials.

If attachment prevents free samples, the audit reports the limitation.
Do NOT infer zero movement from absent REC1 samples, and do NOT feed the
owner values into the bot's online decision process.

RESTORE INSTRUMENTATION WHEN DONE
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\install_bot1d9s_observer.py --restore
(This restores the exact backed-up file, if the D9S tag remains present.)

A regenerated dist build or a modified debug code file is not needed in
this ZIP. Vite reloads the source after the guarded patch is applied.
