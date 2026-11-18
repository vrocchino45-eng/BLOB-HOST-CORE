# HC023D HOTFIX1 — Dynamic Debug Module Restore

## Symptom
Vite stopped at startup with:
`Failed to resolve import "../debug/RecipeDebugOverlay.js" from "src/core/GameRuntime.js"`.

## Root cause
HC023A archived 17 files as unreachable. Its reachability audit missed literal dynamic imports used by `GameRuntime.scheduleDeferredDebugPanels()`. Three debug modules were therefore archived even though Vite and the live runtime still require them:

- `src/debug/RecipeDebugOverlay.js`
- `src/debug/ChemistryDebugPanel.js`
- `src/debug/RuntimeDiagnosticSummary.js`

## Repair
The exact original files were restored from `docs/source_archive/HC023A_UNREACHABLE_SOURCE_ARCHIVE.zip`. No replacement implementation was invented.

The active source count is corrected from 85 to 88 for HC023B/C/D successor validation. HC023A's historical audit artifact remains intact as evidence of the original cleanup decision.

## Scope lock
No gameplay, Hub memory echo, living-state logic, movement, camera, progression, route, geometry, particle, or interaction behavior changed.

## Regression protection
A new validator resolves every relative import in active `src`, including literal dynamic imports, so this class of archive mistake is caught before packaging.
