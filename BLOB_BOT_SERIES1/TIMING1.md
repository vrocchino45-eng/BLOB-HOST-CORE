# BOT-TIMING1 — browser bot timing correction

Extract this ZIP into your BLOB-HOST-CORE project root and replace the included test-tool files. Keep the existing BLOB_BOT_SERIES1 folder, its installed dependencies, fixtures, reports and original manifest. This overlay changes no src/public files and needs no dependency reinstall.

Rerun only the previously failing scenario:

```powershell
node .\BLOB_BOT_SERIES1\run.mjs --browser --case=B03
```

Send the newly created timestamped report folder as a ZIP.

## Findings from your upload

B01 and B02 passed. B03 stopped at the Vascular receive wait, before it reached Silt. No browser errors were recorded and production files were unchanged. The game clock was only 20.85 seconds at failure after 294.1 wall seconds. The previous bot used a 40-wall-second navigation cutoff and a 15-wall-second receive cutoff. The old report omitted the Vascular navigation/receiver state, so it cannot prove exactly which cutoff prevented completion.

## Changes

- Vascular navigation gets 40 actual simulation seconds; Hub navigation gets 50. Each also has a 10-minute wall watchdog, so stalled simulations still fail.
- The Vascular receive wait allows up to two wall minutes. Other B03 state waits and brief Pulse/contact timing also allow slow frames. Pulse holds observe actual runtime time rather than advancing or writing it.
- Browser workers have a 30-minute hard watchdog. This is an automated execution limit, not a human playtest recording request.
- --case=B03 executes only B03. Invalid IDs and conflicting modes fail before starting a run. Excluded scenarios remain NOT_RUN.
- Navigation snapshots and Vascular failure diagnostics preserve distances, goal state and elapsed times.

Assertions, credit requirements, conserved mass and declared prior-progress/contact fixtures are retained. No game-clock injection, goal forcing or automatic passing on timeout was added. These bots do not establish human feel or a campaign earned from zero.

## Validation

The complete corrected B03 passed locally in 77.8 seconds: Vascular five credits; Silt six credits, six-phase and mass 8; keyboard Hub return; paired reserve and Core Work checks. No browser errors; production fingerprint unchanged. Runner negative controls, six case-selection/argument checks and simulation-clock observer checks passed.

A separate Vascular timing control delayed animation callbacks by two wall seconds, omitted only the initial Host-peak wait, and never wrote game time or goal state. The original bot reproduced the same 15-second receive timeout while the actual goal was 93.3% settled. See TIMING1_EVIDENCE.json for the corrected control outcome and exact report references. The corrected slow-frame Vascular control passed with the same goal/credit assertions. Your machine's corrected B03 result is still pending.
