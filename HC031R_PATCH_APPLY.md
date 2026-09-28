# HC031R Patch Apply

Required parent: **HC-031Q — Return Consequence Canonicalization**

1. Create branch `HC031R-Vascular-Relationship-Currentization` from the committed HC031Q branch.
2. Extract `BLOB-HOST-CORE_HC031R_DELTA.zip` into the repository root and overwrite changed files.
3. Run `npm run validate:current`.
4. Commit as `HC031R - Vascular Relationship Currentization`.
5. Publish the branch.
6. Run the focused Vascular test (`Shift+5`) and export telemetry with `Shift+T`.

No files are deleted by this delta.
