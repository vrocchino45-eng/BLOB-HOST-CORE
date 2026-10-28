BLOB — BOT1-D4: Listening Fold Wayfinding
========================================
CHANGE SCOPE: 4 Python test scripts only; NO game code modified.
BASELINE: BOT1-D3 scripts present under BLOB_BOT1_REAL_INPUT_HARNESS/scripts,
          GUIDE0-W recorder already installed and npm run build previously passed.

WHY
BOT1-D3 earned the Watching Fold invitation through a clean matter reading,
but then repeated forward moves, camera changes and Pulse. Its nearest owner
reported Fold distance was 3.402 world units, without entering the first
approach stage. BOT1-D4 isolates the next objective with bounded spatial scans,
visible HUD stage recognition, and independent REC1 owner adjudication.

INSTALL (PowerShell from BLOB-HOST-CORE project root)
1) Save BOT1D4_WAYFINDING.zip into project root (or use the real saved ZIP path).
2) Expand-Archive -LiteralPath .\BOT1D4_WAYFINDING.zip -DestinationPath .\BOT1D4_EXTRACT -Force
3) Copy-Item .\BOT1D4_EXTRACT\*.py .\BLOB_BOT1_REAL_INPUT_HARNESS\scripts\ -Force
4) py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/test_bot1d4.py

RUN: With npm run dev open in a second terminal (default http://127.0.0.1:5173):
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/bot1d4_browser.py --browser-channel chrome --headed --profiles lanes,lobes --seconds 135 --seed 11 --output BOT1D4_RESULTS

ANALYZE AND PACKAGE
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/analyze_bot1d4.py BOT1D4_RESULTS
Compress-Archive -Path .\BOT1D4_RESULTS\* -DestinationPath .\BOT1D4_RESULTS.zip -Force
Upload BOT1D4_RESULTS.zip.

QUICK SINGLE PROFILE, if desired:
py BLOB_BOT1_REAL_INPUT_HARNESS/scripts/bot1d4_browser.py --browser-channel chrome --headed --profiles lanes --seconds 110 --seed 11 --output BOT1D4_RESULTS

BOT CONTROLS: Standard browser keyboard: WASD move, IJKL camera, X Pulse,
Q Stabilize. No teleport, target ID, owner coordinates, Guide hidden sensing,
or REC1 evidence informs a choice. Guide witness is an independent referee.

Owner authentication is necessary to claim progress:
  1. Watcher accepted clean reading + invitation (not merely Pulse button)
  2. Fold active/inApproach or stageIndex >= 1 (not merely close visually)
  3. Owner confirms later stages 2-4 (Pulse / sustained Q / response / release)
  4. completed=true and stageIndex 5 for final completion.

PROFILES
- lanes: bounded lateral sweeps and forward/reverse lanes; camera changes only
  between full scan cycles, preserving local movement directions.
- lobes: four cardinal probing directions, deliberate reframe and new-lobe scan.

IMPORTANT LIMITATIONS
The bot still cannot see and understand objects like a human player. Neither
profile receives exact Fold location or material class. These are experimental
search patterns, not optimal navigation. A bot failure does not prove a game
collision, HUD, or Guide defect. Results vary with packet cycles and seeds.

VALIDATION DONE BY ASSISTANT
- Python syntax passed.
- 24 offline policy and owner-verdict assertions passed.
- Earlier BOT1-D3 REC1 replay: accepted clean/invitation; min Fold 3.402,
  no inApproach, stage 0, no completion (correctly classified).
- A local browser fixture navigation attempt was blocked by the environment's
  browser security policy; no BLOB browser or Windows production test claimed.
