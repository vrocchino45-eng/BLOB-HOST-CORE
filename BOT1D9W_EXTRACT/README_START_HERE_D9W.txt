BLOB: HOST CORE — G1-D9W
Stage 3 Stabilize + seed-13 Watcher acquisition (two separate gates)
Date: 2026-10-30

AUTHORITY / SCOPE
- Four NEW bot-harness Python scripts; no gameplay, Fold, Guide, chemistry, or physics changes.
- Preserves D9V/D9U and D9S code; D9W imports them from the same scripts folder.
- Bot choices use only ordinary HUD text, prior ordinary inputs and elapsed time.
- Never use REC1 owner coordinates or packet distance for action choices.
- Stage 3 Q hold after Pulse is an EXPERIMENT, because the public HUD may be stale.
- An independent REC1 referee alone decides whether Stage 2 and Stage 3 occurred.

PREREQUISITES
- Existing BLOB_BOT1_REAL_INPUT_HARNESS\scripts with all prior D9V dependencies installed.
- D9S read-only neutral-motion observer still installed in gameplay recorder.
- Python with Playwright and Chromium/Chrome working from prior BOT1 tests.
- npm run dev active in another VS Code terminal.

INSTALL (PowerShell, from BLOB-HOST-CORE root; run one line at a time)
Expand-Archive -LiteralPath '.\BOT1D9W_STAGE3_AND_ACQUISITION_20261030.zip' -DestinationPath '.\BOT1D9W_EXTRACT' -Force
Copy-Item -Path '.\BOT1D9W_EXTRACT\*.py' -Destination '.\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\' -Force
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\test_bot1d9w.py

EXPECTED OFFLINE
Ran 27 tests ... OK
Test count includes one replay against previous D9V evidence only if file mounted in creator environment;
on your Windows machine, that test is explicitly skipped if the previous D9V ZIP is unavailable.

RUN (3 fresh contexts, 2 Stage3 seed11 and 1 Watcher seed13)
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\bot1d9w_browser.py --browser-channel chrome --headed --runs 3 --seeds 11,11,13 --modes stage3,stage3,acquisition --seconds 145 --checkpoint-every 45 --output BOT1D9W_RESULTS

OFFLINE EVALUATION
py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\analyze_bot1d9w.py BOT1D9W_RESULTS --modes stage3,stage3,acquisition
Compress-Archive -Path .\BOT1D9W_RESULTS\* -DestinationPath .\BOT1D9W_RESULTS.zip -Force
Upload BOT1D9W_RESULTS.zip to ChatGPT.

GATES
Stage3 gate: each of first two runs must show authentic Stage 2 followed by owner Stage 3,
plus a recorded Q Stabilize start inside the bot's bounded hold window. This temporal pairing
does not prove the input caused the result by itself.
Acquisition gate: third run must show real Watcher-owner-accepted Pulse and Fold invitation.
If REC1 is not complete, the referee reports INCONCLUSIVE rather than FAILED.

NOTES
- Stage3 behavior is a fixed-course test, not generalized navigation.
- Seed13 mode intentionally DOES NOT execute the Fold course. It tests acquisition only.
- A successful Watcher acquisition on seed13 does not count as a Stage3 success.
- Same seed twice is a repeatability check, not a performance guarantee.
- Keep recorder checkpoints and REC1 outputs; do not commit large result folders to Git.
