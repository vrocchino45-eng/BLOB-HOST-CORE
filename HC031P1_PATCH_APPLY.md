# HC031P1 Patch Apply

Required parent: **HC031P — First Host Destination Commitment**.

1. Create a new branch from the committed HC031P branch, not from `main`.
2. Extract `BLOB-HOST-CORE_HC031P1_DELTA.zip` into the repository root.
3. Allow matching files to replace existing files.
4. Run:

```powershell
npm run validate:current
```

Expected first line of the pass result:

`[HC031P1] PASS — first Grave destination permission is decoupled from whole-Hub screen truth...`

5. Commit as:

`HC031P1 - First Destination Commitment Unblock`

6. Publish the branch, run the focused playtest, and export telemetry with Shift+T.
