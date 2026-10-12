# HC-031W2B3.1 — Directional Relationship Readability

## Apply over
Apply this patch directly over **HC-031W2B3 — Verb / Target Relationship Grammar**.

Do not delete `src` or `scripts`. Merge these folders into the existing BLOB project and replace matching files.

Changed files:
- `src/targeting/TargetingSystem.js`
- `src/presentation/VisualHierarchyCompressionSystem.js`
- `scripts/validateHC031W2B2PulseSonarSpatialReveal.mjs`
- `scripts/validateHC031W2B3VerbTargetRelationshipGrammar.mjs`
- `scripts/validateHC031W2B31DirectionalRelationshipReadability.mjs` (new)

After copying:
1. Stop Vite with `Ctrl+C` if it is running.
2. Copy the patch `src` and `scripts` folders into the project root and choose **Replace files in destination**.
3. Restart with `npm run dev`.
4. Hard refresh the browser (`Ctrl+Shift+R`).
5. Run the focused visual test in `HC031W2B31_FOCUSED_PLAYTEST.md`.
6. If accepted, commit as `HC031W2B3.1 Directional Relationship Readability`.

This patch does not change the visible HC-031W1 build identity.
