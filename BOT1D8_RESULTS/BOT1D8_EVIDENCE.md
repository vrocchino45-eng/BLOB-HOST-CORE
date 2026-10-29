# BOT1-D8 — Motion-Grounded Wayfinding Field Audit

Independent REC1 scoring. Online policy never reads owner state, Fold distance, or hidden coordinates.

## BOT1D8_20261029T034706Z_motion_s11

**Verdict:** INVITED_NO_FOLD_STAGE / NOT_PASSED

| Evidence | Value |
|---|---|
| eventCount | 3214 |
| watcherAcceptedReads | 1 |
| minimumOwnerFocusDistanceWhenAvailable | 5.052 |
| maxStageIndex | 0 |
| ownerCertifiedFoldComplete | False |
| checkpointOnly | False |
| motionProbeCount | 34 |
| cameraOnlyProbeCount | 15 |
| motionAboveAmbientCount | 23 |
| visualRevisitCount | 21 |
| checkpointCount | 5 |
| droppedRecorderDetails | 0 |
| owner.invitationSeconds | 16.144 |
| owner.postInvitationMovementSamples | 49 |
| owner.ownerPressurePositiveSamples | 39 |
| owner.ownerAtBoundaryWithPressureSamples | 39 |
| owner.ownerBoundaryRatio | 0.796 |
| owner.postInvitationAttachedSamples | 0 |
| owner.firstSamplePosition | [1.585, 0.046, -3.305] |
| owner.lastSamplePosition | [3.165, 0.622, -4.081] |
| owner.sampledStartEndDistance | 1.852 |
| owner.sampledCumulativeDistance | 59.743 |
| owner.minimumNormalizedBoundaryDistance | 0.732 |

**Milestones:** {'invitation': 16.144}
**Steering keys (look-only):** {'j': 10, 'l': 5}

## Acceptance and proof boundaries

- PASS requires the Fold owner `inApproach` or stageIndex >=1; screenshot motion alone never passes.
- Boundary escape is observed only by offline movement-owner samples, not a bot-side claim.
- D7 and D8 comparisons are historical benchmarks, not equal-seed replay conditions.
- The Guide and Host chemistry, geometry, and 3/6/12 remain frozen.

Recorder owner events adjudicate observed progression; visual intelligibility, player intent, Guide assistance, and a complete Host circuit are not proven. Checkpoints while captureActive=true are cumulative partial captures.
