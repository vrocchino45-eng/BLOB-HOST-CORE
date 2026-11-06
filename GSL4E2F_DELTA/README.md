# GSL-4E2F — Guide–Host interpretation receipt

Reviewed against the supplied 2026-11-05 `src.zip`. This is an opt-in, read-only integration slice.

## Install (repository root, PowerShell)

```powershell
Expand-Archive -LiteralPath .\BLOB_GSL4E2F_INTERPRETATION_DELTA.zip -DestinationPath .\GSL4E2F_DELTA -Force
py .\GSL4E2F_DELTA\GSL4E2F_APPLY.py
```

Note: the installer expects `src/ecology/OrbiterSystem.js` to match the uploaded source exactly. It writes one backup and changes only that JS file.

## Validation

Start Vite as usual. Ctrl+Shift+F9 enables GSL; default is OFF. Inspect `frameState.guideInterpretation` through existing debug tools, or capture telemetry if available. Check `event`, `intention`, `expressionAllowed`, and `movementOwner` during contact/release/recovery. The physical expression now reads this record.

## Boundaries

No LS1 movement/contact writes, no Guide navigation changes, no sound/light additions, no new imports. The preexisting `GSL4E2B_ReadOnlyAdapter.mjs` dependency is outside `src.zip` and must remain present in the repository root. No full Vite runtime test was performed here.

## Rollback

```powershell
Copy-Item .\src\ecology\OrbiterSystem.js.GSL4E2F.bak .\src\ecology\OrbiterSystem.js -Force
```
