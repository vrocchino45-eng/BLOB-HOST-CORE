# HC024C2 Build Report

- Build: `HC-024C2`
- Mode: retained-anatomy manipulation ownership correction
- Source modules: 88 (locked)
- New geometry: none
- New regions: none
- Chemistry: disabled
- Controller map: unchanged

## Purpose
Live play showed that RT/LT moved the Guide clearly while the Core appeared unchanged. Code review confirmed the prototype was manipulating tiny growth connection nodes rather than the larger retained anatomy the player perceived as Core pieces. HC024C2 corrects that ownership.

## Manipulable units
1. Grave Memory retention anatomy
2. Vascular Rhythm retention anatomy
3. Silt Pressure retention anatomy

Each unit keeps its existing internal pulse/breath/cadence animation and receives a persistent placement offset at its root.

## Validation
- `npm run validate:current` — PASS
- HC024C2 retained-anatomy ownership validator — PASS
- HC024C1 / HC024C / HC024B / HC024A regressions — PASS
- HC023D HOTFIX1 / HC023D / HC023C / HC023B / HC023A regressions — PASS
- RecipeDataSystem load — PASS
- undefined `this.method()` audit — PASS
- all 88 active source modules `node --check` — PASS

## Production build note
A fresh dependency install was attempted only to run the Vite production bundle, but dependency installation did not complete within this environment. No partial `node_modules` content is included in the checkpoint. Source/import/data validation is green.
