# BLOB GSL-4E2C — Runtime Toggle & Diagnostics

**Dependency:** GSL-4E2B installed successfully. This is a small opt-in debug patch, not a complete GSL4E1C integration.

From the project root after extracting the ZIP:

```powershell
powershell -ExecutionPolicy Bypass -File .\GSL4E2C_APPLY.ps1
powershell -ExecutionPolicy Bypass -File .\GSL4E2C_VERIFY.ps1
```

Start BLOB normally. GSL is OFF by default. While the game page is focused, press **Ctrl+Shift+F9** to toggle GSL ON/OFF. Open browser developer console (F12) to see `[GSL4E2C]` event diagnostics. It reports interpreted event, attachment status, reason, and whether authored Guide behavior took precedence. The toggle resets adapter transition history to avoid stale reactions.

Test original Guide with OFF, then ON during attachment, deliberate release, unexpected loss, and Core Work. **Important:** Ctrl+Shift+F9 is a provisional debug shortcut; if the browser/OS intercepts it, report that and we will remap. The diagnostics do not establish correct live behavior until playtested.

Rollback: stop the game, copy `src/ecology/OrbiterSystem.js.GSL4E2C.bak` over `src/ecology/OrbiterSystem.js`. Do not overwrite changes made after applying this patch without reviewing differences.

Scope: only `src/ecology/OrbiterSystem.js` is modified. No LS1, movement, visual composer, audio or telemetry files changed. This patch assumes the GSL4E2B code matches its original insertion anchors; the installer aborts otherwise.
