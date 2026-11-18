# Connection 61 — Windows runtime runner repair v7.8

The uploaded `runtime-results.zip` showed Node v24.14.0, npm 11.19.1, and a Python `FileNotFoundError: [WinError 2]` when `run_runtime_gate.py` tried to invoke `npm` as a subprocess executable. The original runner aborted before writing its JSON result or executing the game build.

This patch invokes `npm.cmd` on Windows, preserves `npm` elsewhere, and captures missing executable/time-out errors in the result rather than crashing. It also extends output capture for actionable build errors. The script remains read-only unless the optional `-Install` switch is explicitly used.

**Not verified here:** the repaired runner executing on Windows, the game's application build, or real Three.js gameplay. No production files changed.

Run from the game root (where `package.json` is located):

```powershell
.\runtime-test-v7.8\RUN_ON_WINDOWS.ps1
```

ZIP `runtime-test-v7.8/runtime-results` and upload it.
