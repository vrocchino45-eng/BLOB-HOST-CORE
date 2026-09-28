# HC031Q Patch Apply

Required parent: **HC-031P1-HF1 — Destination Commit Latch**

1. Create a new branch from the committed HC031P1-HF1 branch.
2. Extract the HC031Q delta into the repository root and replace matching files.
3. Run:
   `npm run validate:current`
4. Expect `[HC031Q] PASS` plus the existing syntax, recipe-data, and undefined-method checks.
5. Commit as:
   `HC031Q - Return Consequence Canonicalization`
6. Publish the branch.
7. Run the focused playtest and export telemetry with Shift+T.

This pass intentionally changes no Grave, Vascular, Silt, movement, verb, targeting, or transition gameplay owner.
