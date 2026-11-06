# GSL-4E2E — Rebased layered expression

This patch targets the uploaded current `src/ecology/OrbiterSystem.js` with SHA-256 `d5966265b0a2382cf23355d9f0c571af2b37bd39ec203cc7ddb0566c7a854a9c`. It preserves the GSL-4E2D diagnostics.

From the BLOB-HOST-CORE repository root, extract the ZIP and run:

```powershell
py .\GSL4E2E_REBASED_APPLY.py
```

The installer stops without modifying the source if the hash differs. It creates `src/ecology/OrbiterSystem.js.GSL4E2E.bak` before changing the source. It modifies only Guide scale, not position, movement, LS1, or audio. GSL is OFF at startup; toggle Ctrl+Shift+F9.

To verify syntax, run `node --check .\src\ecology\OrbiterSystem.js` and start BLOB normally. For rollback, copy the GSL4E2E backup over `src/ecology/OrbiterSystem.js` with the game stopped.

Test support on attachment recovery, concern on unexpected contact loss, and neutral shape with GSL OFF. The patch has not been gameplay-tested.
