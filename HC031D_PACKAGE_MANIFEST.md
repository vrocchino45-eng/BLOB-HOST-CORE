# HC-031D Package Manifest

Primary runtime differences from HC031C2:
- `src/combat/RuptureConsequenceGrammar.js` — bounded consequence math.
- `src/combat/GraveRuptureConsequenceSystem.js` — residue settling + consequence owner.
- `src/combat/GraveRuptureHarvestSystem.js` — records residue creation time/parent only.
- `src/routes/GraveResonanceGameplaySystem.js` — consumes bounded prior-frame aftermath tendency.
- `src/core/GameRuntime.js` — wires/registers consequence owner after rupture.
- `src/core/SessionTelemetrySystem.js` — v1.27 consequence telemetry.

Validation:
- `scripts/validateHC031DRuptureConsequence.mjs`
