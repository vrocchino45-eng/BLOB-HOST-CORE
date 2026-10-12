# LS1A2 — Apply

**Prerequisite:** The **LS1A Silt Habitat Foundation** patch must already be applied over the W2B3.1 baseline. HXP2A1 is optional; no overlapping HXP2A1 files.

1. Commit or back up your current working LS1A state using GitHub Desktop.
2. Extract this ZIP. **Merge** `src`, `public`, and `scripts` into the matching folders at the root of `BLOB-HOST-CORE`.
3. Replace the two matching Silt code/data files when prompted. The new `scripts/validateLS1A2SiltContainedGeologicMedium.mjs` is added.
4. **Do not delete** existing folders or other files. There is no full repository or `node_modules` inside this archive.
5. Run `node scripts/validateLS1A2SiltContainedGeologicMedium.mjs` and `node scripts/validateLS1ASiltHabitatFoundation.mjs`, then start your usual local Vite game and controller.
6. Test Silt before making a commit, then record an LS1A2 acceptance commit if it works.

Files changed: `src/routes/SiltPressureRouteSystem.js`, `public/data/routes/siltPressureRouteCircuit_HC012A.json`; new validator as listed above. No global code or route contract edits. The source was reconstructed from the archived project plus historical W2A/W2B, HXP2A1 and LS1A patches; your exact live Git HEAD was not readable. Check for local conflicts if your Silt code was independently edited.
