# BLOB GSL-4D4 — Behavioral Expression Recognition

**Mode:** isolated mock validation. **Purpose:** determine whether Guide behavior is more legible than simple motion cues, before any live integration.

Open `GSL4D4_MOTION_RECOGNITION_LAB.html` in a modern browser. Click **Start 24-trial blind test**, watch each ~3.6-second clip, select Idle/Curiosity/Support/Concern, then click **Export one JSON**. Upload `GSL4D4_MOTION_RECOGNITION.json` for analysis. You may replay clips; replays are counted. Answer buttons and animation remain in one viewport.

**Allowed scope:** synthetic Guide target choreography, isolated recognition interface and JSON telemetry. **Forbidden:** LS1/HC locomotion, Core physics, runtime integration, cue timing and audio. No files overwritten in the game source.

**Conditions:** reference (simple motion targets) versus behavioral (anticipation, approach, hold, recoil and return). Both share the same reproduced GSL-4C-style integration coefficients and simple circular silhouette; target choreography is the experimental variable. This is **not** a direct comparison to original GSL-4D1 implementation.

**Acceptance:** 24 completed trials; JSON with per-trial answers, sampled positions and confusion matrix; behavioral condition should exceed reference, especially for support and concern. This is an exploratory single-viewer test; no statistical or visual authority for live gameplay. Regression: no modification to game, no sound, no network requests, no motion solver differences between conditions.

**Next decision:** inspect per-state accuracy, confusion pairs, replays and position traces. If behavior is legible, visually inspect short clips before integrating; if not, revise choreography rather than silhouettes.
