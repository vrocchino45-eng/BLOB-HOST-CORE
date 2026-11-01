# BOT1-D10A — Guided target closure and recovery sweep A/B

**Gate:** `ASSISTED_ALL_PASSED`
**Owner Stage 5:** 4/4
**Nature:** assisted real-input tests; no world RNG seed diversity, no autonomous discoverability.

| Profile | Accepted reads | Invitation | Stage 1 | Certified Stage 5 | Q end paired | Public cue | Closure actions |
|---|---:|---|---|---|---|---|---:|
| golden | 1 | True | True | True | True | None | 0 |
| guided | 1 | True | True | True | True | True | 6 |
| recovery | 2 | True | True | True | True | True | 0 |
| recovery_control | 2 | True | True | True | True | True | 0 |

## A/B evidence (not a causal experiment)
{
  "pairedArmsPresent": true,
  "sweepStage5": true,
  "noSweepStage5": true,
  "sweepPeelActions": 6,
  "controlPeelActions": 0,
  "outcomeDiffers": false,
  "causalConclusion": "NOT_PROVEN_SINGLE_PAIR_NONDTERMINISTIC_BROWSER"
}

## Limits
No runtime gameplay changed. Real browser signals are public HUD and input/time only.
REC1 owner states, attachment samples, Fold focusDistance and Host receipts are examined only after runs.
The D9Z guided deficit of ~0.34 world units informed a fixed microstep hypothesis, not live coordinate tracking.
Recovery sweep versus no-sweep is one paired observation and not proof of causality.
