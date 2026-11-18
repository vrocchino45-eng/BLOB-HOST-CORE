# BLOB Connection 63 — Hub route access delta

Baseline: BLOB-HOST-CORE-CONNECTION-61.zip. Changed-files-only patch.

## Install
Copy `src/morph/LocalCellBoundaryMorphSystem.js` into the matching path in your project (back up your current file first). Copy `scripts/checkC63HubRouteAccess.mjs` likewise.

## Test (PowerShell from project root)
`node scripts/checkC63HubRouteAccess.mjs`
`node --check src/morph/LocalCellBoundaryMorphSystem.js`
`npm run build`

## Behavior
Vascular and Silt no longer require Grave return or Grave objective completion merely to enter from the Hub. Hub active, destination prepared and interaction range still gate actual entry. Three-route convergence and Comb progression are unchanged.

## Limitations
Static checks and syntax pass on this patch; browser/controller traversal, return journeys and full regression suite still require execution in the working project. Do not treat this as human-playtest approved.

## Scope
Only one gameplay file changed. The test file is new. Historical archives and Connection 61 remain untouched.
