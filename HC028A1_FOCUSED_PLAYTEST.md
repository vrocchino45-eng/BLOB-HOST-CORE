# HC028A1 Focused Playtest — Confusion Calibration

## Goal

Test whether the telemetry detector agrees with *your* experience without changing gameplay.

## Run

1. Play normally for roughly 5–10 minutes with **F1** available.
2. Do not deliberately manufacture a confusion loop.
3. If you genuinely reach a point where you are trying things but understanding is no longer advancing, press **Shift+M** once.
4. If you instead spend a long time quietly observing something interesting, you may also mark it. That is useful because the detector should **not** necessarily classify quiet observation as semantic churn.
5. At the end press **Shift+T** and save the JSON.

## What to compare

At a marked point inspect:

- `playtest.marker.percept.detectorAgreement`
- `context.informationGainAge`
- `context.semanticChurnActive`
- `context.semanticChurnScore`
- recent Pulse / Absorb / Stabilize / target-switch counts
- `sonar.redundant_max_resolution`
- `analysis.attempt.outcome`
- `wallT` versus `simT`

## Desired result

Busy dead confusion should usually produce `semantic_churn_active` near the marker. Productive quiet observation may correctly remain `no_churn_detected` or `low_gain_unconfirmed`.

This is detector calibration, not a pass/fail test of the player.
