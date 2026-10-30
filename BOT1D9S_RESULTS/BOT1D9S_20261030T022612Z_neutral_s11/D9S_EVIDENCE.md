# G1-D9S — neutral-motion and movement calibration

**Coverage gate:** `PAIRED_NEUTRAL_AND_TRANSLATION_REFERENCE_READY`

| Owner recorder evidence | Value |
|---|---:|
| REC1 events | 1290 |
| Neutral owner samples | 156 |
| Active movement owner samples | 17 |
| Calibration trials | 13 |
| Fold approach owner-certified | True |

| Trial | Kind | Heading | Owner pairs | Attachment/input evidence | Partial displacement |
|---:|---|---|---|---|---:|
| 0 | idle | center | 4 | PAIRED_FREE | 0.095 |
| 1 | look | center | 3 | PAIRED_FREE | 0.048 |
| 2 | idle | left | 5 | PAIRED_FREE | 0.12 |
| 3 | look | left | 4 | PAIRED_FREE | 0.107 |
| 4 | idle | center | 4 | PAIRED_FREE | 0.117 |
| 5 | move | center | 3 | PAIRED_FREE | 2.385 |
| 6 | idle | center | 4 | PAIRED_FREE | 0.538 |
| 7 | move | center | 3 | PAIRED_FREE | 4.414 |
| 8 | idle | center | 5 | PAIRED_FREE | 0.558 |
| 9 | move | center | 3 | PAIRED_FREE | 4.682 |
| 10 | idle | center | 5 | PAIRED_FREE | 0.457 |
| 11 | move | center | 3 | ATTACHMENT_CHANGED | 2.884 |
| 12 | idle | center | 5 | PAIRED_ATTACHED | 0.073 |

## Proof restrictions

- D9S is measurement only, not navigation or semantic landmark recognition.
- Look/idle owner pairs are read-only evidence of partial displacement, not zero-motion guarantees.
- Camera yaw/pitch is not exposed: timed look inputs do not certify actual camera angle.
- Environmental flow and previous velocity contaminate measured displacement.
- Surface-attached and cross-cell trials are excluded from free-movement calibration.
- No owner state, Fold bearing or camera transforms influence browser action choices.
- Partial displacement is between samples inside a trial, not exactly at input edges.
