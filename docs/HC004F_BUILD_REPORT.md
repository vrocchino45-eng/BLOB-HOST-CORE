# HC-004F Build Report

## Build

```text
HC-004F — Grave Read-Before-Absorb Interaction Loop
Version: 0.0.52
```

## Completed

```text
Added GraveReadBeforeAbsorbSystem.
Added graveReadBeforeAbsorbRecipes.json.
Added TARGET_FOCUS_GRAVE_MEMORY_001.
Added Grave read-loop Guide prompts.
Added HUD read-loop progress and next-action support.
Added Grave target colors.
Updated Grave local cell status/gameplay loop for minimal HC-004F loop.
Updated build manifest/package identity.
Added HC-004F validator.
Updated older Grave validators to permit HC-004F without weakening legacy-route bans.
```

## Validation results

```text
npm install                                      passed with 1 low severity vulnerability note
npm run validate:grave-read-loop                passed
npm run validate:grave-arrival-readability      passed
npm run validate:grave-morph-prototype          passed
npm run validate:grave-visual-composer          passed
npm run validate:grave-route-recipe-pack        passed
npm run validate:grave-route-plan               passed
npm run validate:recipe-data                    passed
npm run validate:gold-candidate                 passed
npm run audit:undefined-methods                 passed
npm run build                                   passed
```

## Build notes

```text
Vite large chunk warning still appears after production build.
npm install reports 1 low severity vulnerability.
```

## Lock decision

```text
grave_read_before_absorb_loop_active_pending_stability
```

HC-004F is ready for manual playtest and stability review. It should not be widened into full Grave route logic until readability and safe-transfer timing are confirmed.
