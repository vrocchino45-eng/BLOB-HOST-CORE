# HC-031P Delta Apply

Required parent: **HC-031O1 — Host Continuation Directional Read**

Recommended Git branch:

`HC031P-First-Host-Destination-Commitment`

1. Start from the committed/published HC031O1 branch.
2. Create the new branch from the **currently checked-out HC031O1 branch**, not `main`.
3. Extract `BLOB-HOST-CORE_HC031P_DELTA.zip` into the repository root.
4. Replace matching files.
5. Run:

```powershell
npm run validate:current
```

Expected first line from the focused validator:

`[HC031P] PASS`

6. Commit as:

`HC031P - First Host Destination Commitment`

7. Publish the branch, run the focused playtest, and export telemetry with Shift+T.

No files are deleted by this delta.
