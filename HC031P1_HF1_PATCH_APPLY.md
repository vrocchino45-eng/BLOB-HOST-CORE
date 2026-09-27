# HC-031P1-HF1 Patch Apply

Required parent: **HC-031P1 — First Destination Commitment Unblock**.

1. Create a new branch from the committed HC031P1 branch, for example:
   `HC031P1-HF1-Destination-Commit-Latch`
2. Extract the delta ZIP into the repository root and replace matching files.
3. Run:
   `npm run validate:current`
4. Expect `[HC031P1-HF1] PASS`, syntax PASS, recipe-data PASS, and undefined-method audit PASS.
5. Commit as:
   `HC031P1-HF1 - Destination Commit Latch`
6. Publish the branch.
7. Run the focused playtest and export telemetry with Shift+T.

No files are deleted by this delta.
