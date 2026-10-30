# BLOB — G1-D9 Camera/Translation Calibration Referee

**Status:** CAPTURED | **Course complete:** True

| Gate | Verdict |
|---|---|
| A / camera vs translation owner-correlated samples | INSUFFICIENT_PAIRED_OWNER_SAMPLES |
| B / reduced navigation loops | NOT_TESTED_AS_ROUTE |
| C / Listening Fold approach | NOT_PASSED |

| Metric | Value |
|---|---|
| eventCount | 1288 |
| checkpointOnly | False |
| invitationSeconds | 16.111 |
| maxFoldStageIndex | 0 |
| minOwnerFoldFocusDistance | 4.107 |
| probeCount | 16 |
| ownerMovementSampleCount | 29 |
| pairedSampleCount | 0 |
| perKindOwnerBracketDeltas | {'move': {'count': 0, 'median': None}, 'look': {'count': 0, 'median': None}} |

## Each controlled trial

| Heading | Action | Visual movement | Owner-bracketed delta | Sample coverage |
|---|---|---|---|---|
| center | move w | True | unknown | UNKNOWN_NO_BRACKET |
| center | move s | True | unknown | UNKNOWN_NO_BRACKET |
| center | move a | True | unknown | UNKNOWN_NO_BRACKET |
| center | move d | True | unknown | UNKNOWN_NO_BRACKET |
| left | look j | True | unknown | UNKNOWN_NO_BRACKET |
| left | move w | False | unknown | UNKNOWN_NO_BRACKET |
| left | move s | False | unknown | UNKNOWN_NO_BRACKET |
| left | move a | False | unknown | UNKNOWN_NO_BRACKET |
| left | move d | True | unknown | UNKNOWN_NO_BRACKET |
| left | look l | True | unknown | UNKNOWN_NO_BRACKET |
| right | look l | False | unknown | UNKNOWN_NO_BRACKET |
| right | move w | True | unknown | UNKNOWN_NO_BRACKET |
| right | move s | True | unknown | UNKNOWN_NO_BRACKET |
| right | move a | False | unknown | UNKNOWN_NO_BRACKET |
| right | move d | False | unknown | UNKNOWN_NO_BRACKET |
| right | look j | False | unknown | UNKNOWN_NO_BRACKET |

## Proof boundaries

- D9 is **calibration only**. It intentionally does not optimize route progress.
- No owner position is available to the bot; REC1 scoring occurs after completion.
- A look-only trial may have world drift due to flow. A move trial may hit a boundary.
- A landmark descriptor repeat is not a unique landmark ID or Fold bearing.
- Sparse owner snapshots may not bracket every short look-only action.
- The gameplay, Guide physics, Host circuitry, and 3/6/12 remain unchanged.

Recorder owner events adjudicate observed progression; visual intelligibility, player intent, Guide assistance, and a complete Host circuit are not proven. Checkpoints while captureActive=true are cumulative partial captures. Bracketed world-position deltas include environmental drift. Calibration is not target bearing or navigational competency.
