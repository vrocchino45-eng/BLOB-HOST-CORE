# BLOB GSL-4B — Motion Character Calibration

Mode: isolated Guide lab. No HOST CORE runtime, physics, LS1 release, audio, or Guide event hook changes.

## Evidence
- Uploaded legacy and continuous GSL-4 telemetry are compared in `GSL4B_BASELINE_COMPARISON.json`.
- Continuous position and velocity persistence are demonstrated by telemetry; perceived personality still requires visual review.
- This is an experimental calibration, NOT a certified improvement.

## GSL-4B change
- Preserve GSL-4 baseline as an A/B option.
- Add per-phase spring and damping and acceleration cap: idle (.009/.18/.7), curiosity (.009/.19/.7), support (.007/.22/.55), concern (.019/.12/1.5). All are experimental values in lab units per integration step.
- Preserve existing targets, timing, GSL-1 light cues, silence and no-gameplay authority.

## Test
1. Open HTML, select GSL-4 continuous baseline; Play; export JSON.
2. Reset, select GSL-4B character profiles; Play; export JSON.
3. Compare visual urgency of concern, settling of support, curiosity hesitation, and boundary continuity.
4. Upload both JSON exports and a short 10–20 second video if appearance needs evaluation.

## Known limitation
The existing browser loop uses fixed-size integration steps but frame-based playback scheduling, and telemetry `vx/vy` are per-step displacement, not pixels/second. Avoid inferring physical acceleration units. GSL-4B does not yet establish live event integration or audio.

## Windows PowerShell
`cd "$HOME\Documents\GitHub\BLOB-HOST-CORE"`
`Expand-Archive -LiteralPath ".\BLOB_GSL4B_CHARACTER_CALIBRATION_DELTA.zip" -DestinationPath "." -Force`
`Start-Process ".\GSL4B_MOTION_CHARACTER_LAB.html"`
