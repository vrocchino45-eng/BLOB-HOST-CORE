# HC028A1 Build Report — Telemetry Calibration + Confusion Detection

Parent: **HC028A — Structured Session Telemetry Foundation**  
Frozen gameplay baseline: **HC027L1_GOLDEN_INQUIRY_BASELINE_01**

## Purpose

HC028A proved that structured telemetry can reconstruct a real play session, but the first human Shift+M marker exposed two evidence-layer defects:

1. the session `t` value used simulation time and drifted from the recorded video/wall clock;
2. the old semantic-stagnation flag failed to identify a high-effort/no-information-gain confusion loop.

HC028A1 fixes the telemetry layer only. No Golden Inquiry gameplay or balance is changed.

## Human calibration evidence

Calibration session: `f5cdd5cd-0438-4077-933c-d25627f101c8`.

The manual confusion marker occurred after a pattern characterized by repeated max-resolution sonar, frequent target switching, repeated Pulse/Absorb/Stabilize attempts, and no new sonar resolution, persistent consequence, relationship, or cell transition. HC028A1 encodes that *class* of pattern as semantic churn rather than hard-coding the specific location or authored IDs.

## Added

- `blob.session.telemetry.v1.1`.
- Monotonic wall-session time (`wallT`) plus independent simulation time (`simT`) on events, movement samples, and Core snapshots.
- Session `wallDurationSeconds`, `simDurationSeconds`, and `wallMinusSimSeconds` for video/server alignment.
- Explicit `semantic.information_gain` events for new/resolved sensing, cell transition, persistent consequence, Host relationship, and Core topology change.
- `sonar.redundant_max_resolution` events when the player keeps probing a source that is already at resolution stage 3.
- Rolling 12-second semantic-churn detector driven by player effort without information gain.
- `analysis.attempt.outcome` records for Pulse/Absorb/Stabilize attempts, resolving to `information_gain` or `no_gain` after a short observation window.
- Rich Shift+M marker context: recent event counts, top anonymous sources, information-gain age, churn score/context, current anonymous cell/target, reserve, Core weights, and detector agreement.
- F1/Status telemetry readouts for clock drift, information-gain age, churn, redundant max-resolution sensing, and no-gain attempts.

## Semantic churn rule

Quiet observation is deliberately not enough to trigger churn. A candidate requires:

- at least ~6 seconds since information gain;
- high recent effort in a rolling 12-second window;
- and evidence of repeated/varied attempts such as repeated max-resolution sensing, many verb attempts, or multiple verbs plus target switching.

A real information gain clears the active churn state.

## Authority

`SessionTelemetrySystem` remains the final read-only runtime observer. It has no gameplay, input, movement, chemistry, targeting, route, progression, objective, audio, or presentation authority.

## Scope proof

Only six runtime source files differ from HC028A:

- `src/core/SessionTelemetrySystem.js`
- `src/debug/RecipeDebugOverlay.js`
- `src/ui/StatusPageSystem.js`
- `src/main.js`
- `src/debug/DebugDisplaySystem.js` (build/pass identity only)
- `src/debug/DebugAreaJumpSystem.js` (hot-button description only)

The 13 HC027L1 Golden Inquiry gameplay owners remain SHA-256 locked.

## Validation

- HC028A1 calibrated dynamic proof: PASS.
- Human-marker-class semantic churn signature: PASS.
- Marker-context detector agreement: PASS.
- Dual wall/simulation clock drift proof: PASS.
- Attempt/no-gain outcome proof: PASS.
- HC027L1/L/K/K1 regressions: PASS.
- RecipeData: PASS.
- Undefined-method audit: PASS.
- 93/93 JS syntax: PASS.
- 346/346 public JSON parse: PASS.
- 13 Golden gameplay-owner hashes: PASS.

Production Vite bundling remains unavailable in this handoff environment because local `node_modules/vite` is not present.
