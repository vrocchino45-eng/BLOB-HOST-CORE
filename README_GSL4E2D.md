# BLOB GSL-4E2D — Guide Ownership Diagnostics

Source-guarded, diagnostics-only patch for the exact `OrbiterSystem.js` supplied on November 5, 2026 (SHA-256 `a49585df7b1f307db5282df050d424ae809837aa3b2ebd5e6bc0c3f76c58b0b2`).

Extract both files into the **BLOB-HOST-CORE project root**. Then run:

```powershell
py .\GSL4E2D_APPLY.py
```

Start BLOB normally, press **Ctrl+Shift+F9** to enable GSL, and open F12 console. Entries marked `[GSL4E2D]` report `selected`, `applied`, `finalOwner`, `ownerReasons`, `suppressionReason`, and `finalGuideState` on transitions. These distinguish detection, selection, and actual final Guide state. Console may include multiple entries when target/ownership changes.

No LS1 changes. No Guide movement change. No new controls. GSL remains OFF by default. Existing GSL-4E2B adapter must remain in the project root. Existing GSL-4E2C toggle is preserved. The installer stops if the file differs from the uploaded source and backs up `src/ecology/OrbiterSystem.js` to `OrbiterSystem.js.GSL4E2D.bak` before writing.

Rollback (with BLOB stopped):

```powershell
Copy-Item '.\src\ecology\OrbiterSystem.js.GSL4E2D.bak' '.\src\ecology\OrbiterSystem.js' -Force
```

Test: GSL OFF original Guide, GSL ON recovery and unexpected loss, observe `applied`, verify authored Core Work and pulse responses remain dominant. Send a screenshot of `[GSL4E2D]` console output.
