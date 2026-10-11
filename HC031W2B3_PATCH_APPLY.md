# HC-031W2B3 Patch Apply

Apply this patch **over HC-031W2B2 — Pulse/Sonar Spatial Reveal**.

1. Back up the current project or commit/stash local edits.
2. Copy the patch contents into the project root, preserving `src/` and `scripts/` paths.
3. Allow these files to overwrite their W2B2 versions:
   - `src/targeting/TargetingSystem.js`
   - `src/presentation/VisualHierarchyCompressionSystem.js`
   - `scripts/validateHC031W2B2PulseSonarSpatialReveal.mjs`
4. Add `scripts/validateHC031W2B3VerbTargetRelationshipGrammar.mjs`.
5. Restart Vite and hard-refresh the browser.
6. Run `node scripts/validateHC031W2B3VerbTargetRelationshipGrammar.mjs` if desired before playtesting.

The visible gameplay build identity remains HC-031W1. W2B3 is a presentation/convergence pass, not a new gameplay baseline.
