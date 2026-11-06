# GSL-4E2B source-guarded integration candidate

This is an **opt-in** integration, OFF by default. No changes to LS1/player movement or audio. Requires the exact OrbiterSystem.js from the handoff; otherwise stops without editing.

Run from repository root after extracting ZIP there:

```powershell
node .\GSL4E2B_tests.mjs
powershell -ExecutionPolicy Bypass -File .\GSL4E2B_APPLY.ps1
```

The patch adds a read-only event adapter and a very limited support/concern target override only when the existing Guide has no authored target, pulse response or Core Work. It does **not** yet install the full GSL-4E1C expressive choreography; this is a first live wiring slice. The GSL flag is deliberately not wired to a hotkey; for a controlled test set `frameState.gsl4e2bEnabled = true` at the existing debug initialization point, then restore false. Do not modify PlayerMovementController. Backup: `src/ecology/OrbiterSystem.js.GSL4E2B.bak`.

Acceptance: disabled runtime behavior unchanged; deliberate release does not cause concern; unexpected loss does; authored targets win; no LS1 modifications. Run existing game build and short playtest after enabling.
