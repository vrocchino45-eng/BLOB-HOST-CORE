# GSL-4E1A — Bounded Explorer foundation
Mode: implementation / isolated convergence. Scope: controller module, local preview, unit tests. **Not wired into live BLOB**.

## Design
- Bounded explorer: environmental interest within 165px target radius from Core; observed guide outside 205px raises a return request. Actual position is owned by motion integration.
- Priority: unexpected loss > support > curiosity > idle. Deliberate release suppresses concern.
- Persistent behavior state and dwell/recovery windows. No resets of motion position or velocity.
- Controller returns a target and telemetry, never writes LS1 or Core state.
- GSL-4C coefficients are copied provisionally into the preview only. Runtime motion owner remains unchanged.

## Install
Extract ZIP into any folder; run `node GSL4E1A_tests.mjs`; open `GSL4E1A_PREVIEW.html` through a local server (ES module imports may be blocked under file://). In the extracted folder run `python -m http.server 8765` and open `http://localhost:8765/GSL4E1A_PREVIEW.html`.

## Acceptance / regression
- Test 7 behavior conditions using Node.
- Observe bounded target, smooth preview motion, interruption and recovery.
- No gameplay integration, LS1/HC modifications, or audio changes.
- Next: inspect actual current Guide integration and choose an event adapter; don't insert speculative LS1 hooks.

## Known limits
The preview is synthetic, fixed geometry; support/concern are triggered by buttons. Behavior timers are demonstration values pending playtest. No automatic obstacle avoidance. The observed-position range warning does not forcibly teleport the Guide.
