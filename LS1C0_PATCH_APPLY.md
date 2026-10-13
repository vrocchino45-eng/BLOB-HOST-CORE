# BLOB LS1C0 — Universal Quick Look Inspector — Patch Apply

## Baseline
Apply on top of the **working LS1B Silt closed-material-cycle build** (that build already includes LS1A and LS1A2). Existing HXP2A1 Hub material work can remain installed. This is an incremental **changed-files-only** patch, not a full repo replacement.

1. Commit or back up the currently functioning project in GitHub Desktop.
2. Unzip this patch outside the project.
3. Merge the included `src` and `scripts` folders into the corresponding folders at your project root; allow overwrite of matching files. **Do not delete the original folders or the other project files.**
4. From your project terminal run `npm run dev` as usual and refresh the browser. Existing Vite/Windows dependency setup remains yours.
5. Press **F4** to toggle Quick Look. On an Xbox controller, **hold LB + RB together for about 0.6 seconds**. This does not replace View/Select, F1/F2/F3, or other gameplay mappings.

## Patch contents
- `src/ui/QuickLookInspectorSystem.js` — new read-only inspector presentation
- `src/core/GameRuntime.js` — initializes and registers inspector late in normal runtime order
- `scripts/validateLS1C0QuickLookDesignInspector.mjs` — structural and live-data smoke tests

No asset changes, no new route data, no change to Vite config, no modification of chemistry or player controls.

## Known limitations
The inspector is a **first prototype**. It can identify the canonical active region and any already-targeted object, not arbitrary scenery from a new camera raycast. Silt gets verified detailed information; other regions get the shared inspector and honest identification/fallback, with full details to be added later. This prototype does not automatically calculate what percentage more geometry or sediment a region needs.
