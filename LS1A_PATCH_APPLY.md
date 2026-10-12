# Applying LS1A — Silt Habitat Foundation

**Expected install:** Existing HC-031W2B3.1 baseline; HXP2A1 may also be installed. This patch touches neither HXP2A1 Hub files nor the W2B-targeting and visual files.

1. Make a GitHub Desktop commit/checkpoint of your current tested build.
2. Extract this ZIP. Copy/merge its **`src`**, **`public`**, and **`scripts`** folders to your existing BLOB project **root**; choose to overwrite only matching files. **Do not delete** existing folders or any of the original 1,500+ files.
3. Stop and restart your Vite dev server (`npm run dev`) and refresh browser (`Ctrl+Shift+R`). Build identity remains HC-031W1 / 0.31.54 intentionally.
4. Optionally run `node scripts/validateLS1ASiltHabitatFoundation.mjs` and `node scripts/validateHC016VSiltSpatialExpansion.mjs` from the root.
5. Run the focused LS1A Silt roaming test. Do not mistake the absence of renewable pieces for failure: LS1B is the material-cycle pass.
6. Only commit/lock LS1A after you verify the controller can reach all three habitats and still complete/return from Silt.

**Changed files only:** `src/routes/SiltPressureRouteSystem.js`, `public/data/routes/siltPressureRouteCircuit_HC012A.json`, `public/data/routes/act1RouteContracts_HC012A.json`, and **new** `scripts/validateLS1ASiltHabitatFoundation.mjs`. No node_modules, giant repo archive or deletions.

**Rollback:** Revert the LS1A Git commit or restore those three original files; remove the new validator. No save/schema migration introduced.
