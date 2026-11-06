# GSL-4E2E — Layered Guide Expression

This is a guarded, expression-only patch against the **GSL-4E2D installed** OrbiterSystem.js, SHA256 `3476d85ca30f5b7869a512dc581391cce7cd9f0cf45c3e45c34f2f6af1e46852`.

## Install
Place ZIP in BLOB-HOST-CORE repository root and extract there. In PowerShell:

```powershell
Expand-Archive -LiteralPath '.\BLOB_GSL4E2E_LAYERED_EXPRESSION_DELTA.zip' -DestinationPath '.' -Force
py .\GSL4E2E_APPLY.py
```

If the hash check fails, STOP. Do not force the patch. Upload the current `src/ecology/OrbiterSystem.js` for a rebase.

## Behavior
The existing OrbiterSystem remains authoritative for movement, target, orientation, authored interactions and Core Work. This patch only modifies Guide root scale after the original scale calculation. Support broadens the orb; concern contracts/heightens it. The expression interpolates smoothly and returns to neutral after the event. Core Work forces a return to neutral. Existing pulse animation and region target selection remain active. GSL starts OFF and is toggled with Ctrl+Shift+F9.

## Runtime checks
Start Vite as normal, toggle GSL ON, trigger attachment recovery and unexpected loss. Observe the Guide's shape and compare with GSL OFF. `frameState.gsl4e2eDebug` exposes `expressionMode`, `expressionWeight`, `expressionApplied`, `movementOwner`, `coreWorkProtected`. No additional console spam is added.

## Rollback
Stop the game, then restore `src/ecology/OrbiterSystem.js.GSL4E2E.bak` over `src/ecology/OrbiterSystem.js`. Keep the backup until regression tests pass.

## Scope
No edits to LS1 physics, attachment state, camera, audio, or OrbiterVisualComposer. Visual effectiveness remains unverified until gameplay capture. This is a provisional shape expression, not the full GSL-4E1C choreography or bounded explorer runtime integration.
