# LS1A — Build / validation report

**Baseline:** Archived HC-031W1 source reconstructed with W2A performance, W2B3.1 grammar and optional HXP2A1 Hub patch overlaid for regression. Delivery is a *delta* to that baseline. User's exact local Git HEAD was not directly available; code file overlap/reconciliation should be checked if local Silt files have independent changes.

## Verified implementation
- Added `habitatFoundation` authored data to the existing Silt route recipe: Reservoir near current appetite pocket, Garden laterally left, Veins laterally right/deeper; 4 anatomical connectors. No new route or region ID.
- Enlarged only Silt's existing Act 1 entry-anchored ellipsoid from **[6.8, 4.25, 21.2]** to **[13.8, 6.25, 26.8]** (x/y/z). Vascular remains `[4.5, 3.2, 22.5]`.
- Added three softly transparent concave membranes, irregular open muscular folds, fixed sediment anatomy and physical orientation strands; all targeting suppressed and explicitly visual-only. New habitat presentation totals **34 meshes / ~6,780 triangles**, bounded and created once on init, hidden when Silt is unmounted.
- Applied *local* movement relief inside lateral habitats; original Silt passage's pressure read, brace, yellow packet, packed-matter failure and return are still owned by `SiltPressureRouteSystem`.
- Published read-only `siltPressureRoute.habitatFoundation` diagnostics (habitat ID / relief / foundation scope), no ecology economy.

## Automated checks
- `node scripts/validateLS1ASiltHabitatFoundation.mjs` — **PASS**: authored positions & 4 connection anchors fit live PlayerMovementController ellipsoid; three locations are recognized; existing pressure→brace→porous Absorb→deep release→return remount works; exactly one route absorb credit; capped additional geometry.
- `node scripts/validateHC016VSiltSpatialExpansion.mjs` — **PASS**.
- `node scripts/validateHC031W2B2PulseSonarSpatialReveal.mjs` — **PASS**.
- `node scripts/validateHC031W2B3VerbTargetRelationshipGrammar.mjs` — **PASS**.
- `node scripts/validateHC031W2B31DirectionalRelationshipReadability.mjs` — **PASS**.
- `node scripts/validateHXP2A1HubRetainedCradleMaterial.mjs` — **PASS** with HXP2A1 overlay.
- `node scripts/validateHC031W2A54PrimedChildLiveAdmission.mjs` — **PASS**.
- `node scripts/validateHC031W1HF1TargetClear.mjs` — **PASS**.
- `node scripts/smokeHC031W1StabilizedAimLocalContact.mjs` — **PASS**.
- `node scripts/validateHC031U21RelationshipIntentLatch.mjs`, `node scripts/smokeHC031U21RelationshipIntentLatch.mjs` — **PASS**.
- `node scripts/validateRecipeDataLoad.mjs`, `node scripts/auditUndefinedThisMethods.mjs` — **PASS**.

## Existing historical test limitations / not claimed
- The archived original W1 whole-file hash validator expects `CoreSurfaceTruthSystem.js` *before* W2A code changes and fails on **known legitimate W2A drift**; the W1 behavioral smoke and HF1 regression pass. No validator was changed to hide this.
- HC031S's old validator pins package `0.31.40`, but current version is `0.31.54`. Its pressure behavior is directly exercised by the LS1A integrated validator.
- Several historical files for older transition tests have been retired; not used to certify LS1A.
- No rendered GPU/browser/real Xbox-controller acceptance test was performed in this container, and no 20-minute live sandbox claim is made.
- Linux full-production `npm run build` was **not** asserted; archived Windows optional Rollup binary limitations are known. Initial-load GPU stall performance must be field tested.

**Status:** LS1A code candidate ready for human acceptance. LS1B is blocked on the feel/reachability proof and then requires unique, conserved matter identity and actual transfer, not decorative motes.
