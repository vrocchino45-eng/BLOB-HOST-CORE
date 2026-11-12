# BOT-SILT1 — Silt interactions on actual game frames

Extract into your BLOB-HOST-CORE project root and replace the included bot files. Requires Bot Series 1 with BOT-TIMING1 and BOT-STEERING1 already applied. No dependency reinstall. Existing dependencies and report history are preserved. No gameplay source file changes.

```powershell
node .\BLOB_BOT_SERIES1\run.mjs --browser --case=B03
```

Upload the newly generated timestamped report folder as a ZIP.

## Findings

Your latest report confirms Vascular completion and publication. B03 then reached its Silt seating wait and timed out. At failure the grain was no longer held, its attempt had reset to await_grip, and no Silt completion had published. No browser errors or source changes were recorded. The failed report does not retain the intermediate contact state, so it cannot establish precisely when contact was lost.

## Correction

The Silt bot now executes acquisition, bracing, Pulse inputs, seat, extraction and release on actual game ticks, avoiding remote command round trips between those time-sensitive decisions. It waits for each real owner state and records the actual transitions. It sends synthetic DOM keyboard events through InputSystem. It wraps tick only during the Silt arc, calls the original tick once per real frame, and releases keys/restores the method on completion or error.

The earlier history/near-grain, one accepted contact placement, and one player release-clearance pose remain explicit fixtures. Those poses are not newly earned movement. The driver does not write goal proofs, clock, phase-two credit, material ownership or native-return results. It checks mass 8 on every driver tick; actual native return must earn six credits/six-phase. Driver limits are 90 simulation seconds and 15 wall minutes within the existing worker watchdog. A failed seat or missing imprint fails rather than forcing the next stage.

## Validation

The complete normal B03 passed in 77.5 seconds, including Vascular five credits, Silt six credits/six-phase, conserved mass, Hub return, paired reserve and Core Work. A second run retained all those assertions while delaying animation callbacks by 2000 wall milliseconds and Silt evaluation return values by 8000 wall milliseconds; only its initial Host-peak wait was omitted. Both recorded no browser errors and unchanged production fingerprints. See SILT1_EVIDENCE.json for exact results and the slow-run duration.

Your corrected B03 result remains pending. Prior B01/B02 uploaded passes remain separate. This remains scripted keyboard-pipeline testing with declared fixtures, not a physical gamepad, human-feel or campaign-from-zero acceptance.
