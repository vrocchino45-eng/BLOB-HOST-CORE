# HC-031W2B1 Patch Apply

Apply this patch **over HC-031W2A5.4**.

Copy the patch contents into the project root, preserving folders and overwriting only the listed files:

- `src/morph/GuideThresholdGameplaySystem.js`
- `src/morph/GuideThresholdLayeredInteractionSystem.js`
- `src/hub/HubChamberFoundationSystem.js`
- `scripts/validateHC031W2B1DepthHierarchyFoundation.mjs`

The convergence plan and handoff docs are reference files only; they do not need to be copied into the game project.

No dependencies changed. Do not replace `node_modules`, package files, data registries, controls, camera, or renderer timing files.

After apply:

1. Restart Vite.
2. Hard refresh / use a fresh browser tab.
3. Run `node scripts/validateHC031W2B1DepthHierarchyFoundation.mjs`.
4. Run the focused current smokes if desired:
   - `node scripts/validateHC031W2A54PrimedChildLiveAdmission.mjs`
   - `node scripts/smokeHC031W1StabilizedAimLocalContact.mjs`
   - `node scripts/validateHC031W1HF1TargetClear.mjs`
5. Do a focused visual playthrough through Surface Wake → Scar Flow / Guide → Hub.

Visible build identity intentionally remains HC-031W1. W2B1 is exposed inside the Guide/Hub runtime state as `visualHierarchyPass: "HC-031W2B1"`.
