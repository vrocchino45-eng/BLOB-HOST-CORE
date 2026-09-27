# HC-031O1 Delta Apply

Required parent: **HC-031O — Host Continuation / First Route Legibility**

1. Create/check out a new branch from your committed HC031O branch, e.g. `HC031O1-Host-Continuation-Directional-Read`.
2. Extract this ZIP into the root of `BLOB-HOST-CORE` and replace matching files.
3. No files are deleted.
4. Run:

```powershell
npm run validate:current
```

Expected first line of the pass result:

`[HC031O1] PASS`

5. Commit as:

`HC031O1 - Host Continuation Directional Read`

6. Run the focused playtest and export telemetry with Shift+T.
