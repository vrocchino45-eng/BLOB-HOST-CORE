# BLOB — BOT1-D9R corrected calibration audit

**Existing recording only. No new gameplay, bot navigation, or REC1 data collected.**

Original verdict: `INSUFFICIENT_PAIRED_OWNER_SAMPLES`. Corrected evidence-coverage status: `TRANSLATION_SAMPLED_CAMERA_ONLY_UNMEASURED`.

| Metric | Reading |
|---|---:|
| Trials | 16 |
| Paired translation trials | 12 |
| Paired look-only trials | 0 |
| Free translation trials | 5 |
| Attached translation trials | 6 |
| Attachment-change trials | 1 |
| Median partial free displacement | 1.995 |
| Median partial attached displacement | 0.72 |
| Fold stages reached | 0 |

## Owner movement pairs observed *within* trials

| Trial | Heading | Key | Visual > idle | Owner samples | Partial delta | Attachment |
|---:|---|---|---|---:|---:|---|
| 0 | center | w | True | 2 | 1.406 | free |
| 1 | center | s | True | 2 | 2.299 | free |
| 2 | center | a | True | 2 | 2.063 | free |
| 3 | center | d | True | 2 | 1.995 | free |
| 4 | left | j | True | 0 | unknown | not sampled |
| 5 | left | w | False | 2 | 0.366 | attached |
| 6 | left | s | False | 2 | 0.454 | attached |
| 7 | left | a | False | 2 | 4.765 | changed_during_trial |
| 8 | left | d | True | 2 | 1.873 | free |
| 9 | left | l | True | 0 | unknown | not sampled |
| 10 | right | l | False | 0 | unknown | not sampled |
| 11 | right | w | True | 2 | 0.5 | attached |
| 12 | right | s | True | 2 | 0.941 | attached |
| 13 | right | a | False | 2 | 1.151 | attached |
| 14 | right | d | False | 2 | 1.055 | attached |
| 15 | right | j | False | 0 | unknown | not sampled |

## Interpretation

D9 collected two owner movement positions within each of twelve move trials. The old evaluator falsely marked them unpaired because it demanded pre-action and post-action samples outside each window.
The four look-only trials produced no in-trial movement-owner positions. This cannot certify that camera-only input produces no translation.
Much of the movement course occurred while attached to the surface; therefore movement differences by camera heading cannot be attributed to camera orientation alone.

## Evidence restrictions

- REC1 movement samples are event/sampling conditioned. The absence of look-only samples is unknown movement, not zero displacement.
- Movement deltas are between two owner samples INSIDE each trial, not full action start/end ground truth.
- Surface attachment and environmental flow confound the camera-relative motor calibration.
- A visible scene-motion score does not prove a unique landmark, travel direction, Fold bearing, or successful interaction.
- Do not feed post-run owner samples or Fold distance into the online bot policy.
