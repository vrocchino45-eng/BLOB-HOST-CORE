BLOB — BOT1-D9R: CORRECTED OFFLINE CALIBRATION REFEREE

This is an analyzer-only correction. It changes no bot behavior, gameplay,
Fold geometry, Guide, Host chemistry, or recorder. You do not need to rerun D9.

Copy the two new Python files to BLOB_BOT1_REAL_INPUT_HARNESS\scripts.
They depend on the existing BOT1-D6 / BOT1-D9 analysis modules already installed.

In VS Code PowerShell, from the BLOB-HOST-CORE project root:

py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d9r.py
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d9r.py BOT1D9_RESULTS

Outputs:
- BOT1D9_RESULTS\BOT1D9R_EVIDENCE.json
- BOT1D9_RESULTS\<run>\BOT1D9R_EVIDENCE.md
- BOT1D9_RESULTS\<run>\BOT1D9R_TRIALS.csv

The previous referee requires positions BEFORE AND AFTER each trial;
the recorder recorded two samples INSIDE all 12 translation trials.
The corrected referee counts internal pairs as partial motion evidence.
Look-only trials still have no owner positions. It does NOT claim
camera-only zero translation or valid Fold navigation.

Existing D9 evidence in this package is copied from the uploaded real run.
No owner coordinates were used by the online bot.
