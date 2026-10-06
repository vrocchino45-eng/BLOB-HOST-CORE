# HC-031W2A2 — Transient Render Budget

## Base requirement
Apply this patch only after **HC-031W2A1 — Cost Reduction**. The W2A1 telemetry export should already identify `optimizationPass: HC-031W2A1` before this overlay is applied.

## Apply
1. Stop the Vite dev server.
2. Back up the active BLOB project folder.
3. Extract this ZIP over the project root, preserving the included `src/` and `scripts/` paths.
4. Run:
   - `node scripts/validateHC031W2A2TransientRenderBudget.mjs`
   - `node scripts/validateHC031W2A1CostReduction.mjs`
   - `node scripts/validateHC031W2AFrameTruth.mjs`
   - `node scripts/smokeHC031W1StabilizedAimLocalContact.mjs`
   - `node scripts/auditUndefinedThisMethods.mjs`
5. Restart Vite with the project's normal `npm run dev` command.
6. Open a new game tab and hard refresh once.

## Expected runtime identity
The player-facing build remains `HC-031W1`. The diagnostic export should now contain:

`developerTruth.frameTruth.optimizationPass = "HC-031W2A2"`

The 50 ms simulation cap is intentionally unchanged in this pass.

## Focused test
Run 60–120 seconds in Surface Wake. Use Pulse heavily enough to create overlapping sonar responses, move across/near authored surfaces, and if convenient begin the Surface Wake -> Scar Flow Fold transition. No video is required for this test.

Export with **Shift+T**.

The JSON should now expose, per Frame Truth window:
- `pulseFronts`
- `pulseFrontBudget`
- `pulseContours`
- `pulseContourSegments`
- `pulseReturnMotes`
- `contactFlashes`
- `transparentZeroCulled`
- `transparentRenderCandidates`
- `lastRenderOwnerCensus`

`lastRenderOwnerCensus.topOwners` is the key new diagnostic. It estimates the scene roots responsible for visible renderables, draw calls, triangles, line segments, wireframes and fully transparent renderables.

## Rollback
Restore the backed-up W2A1 versions of the modified files and delete:
- `src/presentation/RenderBudgetSystem.js`
- `scripts/validateHC031W2A2TransientRenderBudget.mjs`

No save data, authored region data, input mapping, movement tuning, chemistry, ecology, audio or progression data are modified by this patch.
