# BLOB Connection 63 — Browser traversal acceptance

Status: NOT YET VERIFIED. Logic-level checks are separate from browser acceptance.

Run one fresh session starting from Surface Wake. For each route, attempt entry without completing Grave first. Record actual behavior, not expected behavior.

| Scenario | Pass / Fail / Not tested | Notes |
|---|---|---|
| Surface Wake -> Guide -> Hub | | |
| Hub -> Grave via approach + A | | |
| Grave -> Hub return | | |
| Hub -> Vascular without Grave completion | | |
| Vascular -> Hub return | | |
| Hub -> Silt without Grave completion | | |
| Silt -> Hub return | | |
| Camera recovers after each transition | | |
| Player can move immediately after each transition | | |
| Route memory/objective state persists on return | | |
| Three-route convergence behaves as authored | | |
| No extra mandatory touch/Pulse ritual at Hub | | |

If a step fails, note route, action/button, expected vs observed behavior, and whether it reproduces. Keep any video under 25 minutes; a focused 5–10 minute clip is preferred.

## Integration handoff
Do not advance to C64 until transitions and return paths pass or are logged as scoped blockers. C64 will test one Core configuration -> environmental response -> Core telemetry -> persistent state loop. No new mechanics should be added before that baseline is demonstrated.
