# HC-031C2 Package Manifest

Primary runtime differences from HC031C1:
- `src/combat/FragmentHarvestFieldGrammar.js` — new bounded fragment-field rule helper.
- `src/combat/GraveRuptureHarvestSystem.js` — spatial debris pull/contact capture.
- `src/core/GameRuntime.js` — supplies camera to rupture owner.
- `src/core/SessionTelemetrySystem.js` — v1.26 field-capture telemetry.

Validation:
- `scripts/validateHC031C2FragmentFieldCapture.mjs`
