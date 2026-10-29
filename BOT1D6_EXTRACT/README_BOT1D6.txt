BLOB — BOT1-D6 HUMAN-REFERENCE NAVIGATION (2026-10-28)
====================================================
TYPE: Additive bot test scripts only. No BLOB gameplay/HUD/Guide changes.
BASIS: G1D6 authenticated human REC1, 14:50, Fold completion at 1:19.
LIMITATION: This is a demonstration-INFORMED SCRIPTED policy, not machine learning
or a bot with frame-level human perception. Human coordinates and owner flags
are NEVER made available to the online action-selection policy.

REQUIRES installed existing BOT1-A / D3 / D4 / D5 harness scripts:
  bot1d3_browser.py  bot1d3_motion.py
  bot1d4_policy.py
  bot1d5_policy.py
  and Playwright + Pillow already used in earlier tests.

Windows PowerShell / VS Code — run each command separately:

1. Save BOT1D6_HUMAN_REFERENCE_NAV_20261028.zip in BLOB-HOST-CORE root.
2. Extract (file paths are flat, not nested):
   Expand-Archive -LiteralPath .\BOT1D6_HUMAN_REFERENCE_NAV_20261028.zip -DestinationPath .\BOT1D6_EXTRACT -Force
3. Install only four new files, without touching existing source:
   Copy-Item -Path '.\BOT1D6_EXTRACT\*.py' -Destination '.\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\' -Force
4. Validate:
   py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d6.py
   Expected: 42 assertions passed without the original human reference.

In a SECOND terminal launch npm run dev. With the game at http://127.0.0.1:5173:
5. Run one 210-second test:
   py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d6_browser.py --browser-channel chrome --headed --seconds 210 --seed 11 --checkpoint-every 45 --output BOT1D6_RESULTS
6. Analyze:
   py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d6.py BOT1D6_RESULTS
7. Package:
   Compress-Archive -Path .\BOT1D6_RESULTS\* -DestinationPath .\BOT1D6_RESULTS.zip -Force
8. Upload BOT1D6_RESULTS.zip for independent analysis.

IMPORTANT: checkpoints are intentionally exported while REC1 capture is ACTIVE.
They are cumulative partial evidence files named REC1_CHECKPOINT_0045s.json etc.
The final REC1.json is exported after recording stops. If browser closes and
final REC1.json is missing, the evaluator uses the newest valid checkpoint and
labels it incomplete; it does NOT invent completion or extra events.

GATE/ACCEPTANCE: At least one accepted clean Watcher read, Fold invitation,
owner-confirmed Fold approach and stage progress. Full owner completion is the
stronger pass. Owner state is strictly evaluation-only. The Guide's animation
and HUD remain independent witnesses; neither proves physical assistance.

PLACEMENT/HIERARCHY: G1-D6 first; GUIDE1-A contrast sensing+communication next;
then a separate Silt->Vascular->Grave->Silt integrated circuit test. No new
3/6/12 physiology or region content is included in this package.

LOCAL VERIFICATION: 47 assertions pass when the human REC1 source is provided.
This is NOT confirmation of success in the real Windows/Chrome game.
