# LS1B — installation (changed files only)

**Required baseline:** your accepted **LS1A2** build (which itself follows LS1A and W2B3.1). HXP2A1 may be present; LS1B does not replace its Hub file. This archive was generated from the reconstructed archive + W2A/W2B locks + optional HXP2A1 + LS1A + LS1A2, not a direct snapshot of your current Git checkout.

1. Stop the Vite dev server; back up / commit your current working state in GitHub Desktop.
2. Open the patch ZIP and **merge** the included `src`, `public` and `scripts` folders into the root of your `BLOB-HOST-CORE` project. Overwrite the matching **files**, not the whole directories. Keep all other files in place.
3. In your project terminal, run `node scripts/validateLS1BLivingSiltMaterialCycle.mjs`, and `node scripts/validateLS1A2SiltContainedGeologicMedium.mjs`.
4. Launch normally with `npm run dev` and test Silt. Do **not** try to apply directly over W2B3.1 without LS1A and LS1A2: the patch uses their authored habitat anchors and geometry.
5. If it behaves correctly, stage/commit only the six code/data/validator files from this package. Do not delete older route systems or move branches.

No `node_modules`, generated build, or complete project archive included. The filename and debug build version are intentionally unchanged from HC-031W1; the material snapshot publishes `pass: LS1B` in `frameState.siltPressureRoute.livingMaterialCycle`.
