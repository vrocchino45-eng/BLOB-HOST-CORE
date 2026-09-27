# Applying HC-031O

Required parent: **HC-031N2 — Reacquire Closure**, on the repaired Git lineage.

1. Create a new Git branch from the committed HC031N2 branch, e.g.:
   `HC031O-Host-Continuation-First-Route-Legibility`
2. Extract this delta into the repository root.
3. Replace matching files when prompted.
4. Run:
   `npm run validate:current`
5. Expected targeted result begins:
   `[HC031O] PASS`
6. Commit the delta as:
   `HC031O - Host Continuation / First Route Legibility`
7. Publish the branch.
8. Run the focused playtest in `HC031O_FOCUSED_PLAYTEST.md` and export telemetry with Shift+T.

No files are deleted by this delta.
