# BLOB — C0C-REC1 Full-Session Observation Recorder Repair

**Delivery:** changed-files-only overlay for the working **LS1E2** game tree. **Not** a full game. Does not implement C0C2 circuits. Preserve historical build numbering and LS1E2 gameplay behavior.

## Problem observed in the user's C0C recording

- 2026-10-21 capture: **4,592** recorder-observed events over ~11m43s.
- Only the latest **2,500** detailed records were exported; **2,092** were shifted out.
- First retained event is **259.03 seconds (~4m19s)** after recording began. Those earlier individual event details cannot be recovered from the exported JSON. The aggregate counters and the gameplay video remain valid within their stated limits.
- A separate **64-entry authoritative Silt source-ring** can still overflow *between* 150ms samples. This is a different issue and remains explicitly identified as a limitation.

## Files

- `src/debug/WorldObjectCensusSystem.js` — sole changed game source.
- `scripts/validateC0CRecorderFullSession.mjs` — offline smoke/retention test.
- `VALIDATION_C0C_REC1.json` — result for the test above.
- `C0C_CAUSAL_TRACE_NEXT.md` — next circuit-instrumentation design, **not implemented**.

## Installation

1. Backup current working LS1E2 game project.
2. Extract the ZIP **at the game project root** so `src/debug/WorldObjectCensusSystem.js` replaces that one file.
3. Restart Vite or refresh the browser and test recorder shortcuts. No new packages are needed.
4. Optional: `node scripts/validateC0CRecorderFullSession.mjs` from the project root to confirm the copied source.

**Important:** This patch is based on the LS1E2 version of `WorldObjectCensusSystem.js` distributed in the `BLOB_LS1E2_FIRST_FUNCTIONAL_VASCULAR_RECEIVER_CHANGED_FILES.zip` overlay, which matches the LS1E2 recorder semantics visible in the October 20 C0C JSON. If the current project has independently modified this file since LS1E2, compare/diff before overwriting it.

## What changed

- Recorder event details now use append-only per-capture retention; **no 2,500-detail automatic deletion**.
- A monotonically increasing `recorderEventOrdinal` identifies each recorder-observed event.
- REC badge displays elapsed time and live total event count, with `FULL` and a *large-file warning* starting at 10,000 events.
- Exported report gets `recorderRevision:"C0C-REC1"`, `recorderSchemaVersion:2`, stopped-at/duration, and a truthful `summary.captureRetention` report.
- Uses compact JSON encoding instead of 2-space pretty JSON to reduce download size without dropping events.
- The download name is now `BLOB_LS1E2_C0C_REC1_OBSERVATION.json` (old LS1E1 name was stale).
- Old Alt+Shift+R record toggle and Alt+Shift+E export remain exactly the same.

## Unchanged / proof limitations

- This version keeps all **events actually observed by this recorder**; it cannot recreate unsampled producer events, and it doesn't by itself instrument every pre-Hub, Hub, phase, tendril, label, shell, or resonance system.
- Game input mapping, Silt pressure and material behavior, Vascular local receiving response, progression, controls, graphics, sound, world logic, and source-ledger type/ownership are untouched.
- No automatic autosave. Export before refreshing/closing the tab; each new REC start replaces the previous stored capture after stopping.
- Long captures accumulate events in browser RAM until export; the 10,000 event badge is a file-size *warning*, not a retention cap. Typical focused sessions up to ~25 minutes are the intended use; export/stop between long sessions.
- Offline smoke validations are not full browser field-playthrough evidence.

## Field acceptance check

1. Start Alt+Shift+R at the opening. Confirm REC badge displays time, live total, and `FULL`.
2. Play 8–15 minutes, preferably exceeding 2,500 events; see the counter exceed 2,500 without resetting.
3. Stop Alt+Shift+R, export Alt+Shift+E.
4. Inspect JSON `summary.captureRetention`: `retainedDetails == totalEventsObserved`, `droppedDetails == 0`, `fullSessionRecorderDetailsRetained == true`. `events[0].type == "capture-started"` and last event is `capture-stopped`.
5. Check chronological `recorderEventOrdinal` from `1` to `events.length`.
6. Validate gameplay unchanged with focus on Pulse/Absorb/Stabilize, LT+A grip, Silt contact and Vascular response.

**Next step** is C0C-TRACE1, a separate read-only typed cause-lineage observation extension in the C0C circuit design. Do not interpret raw inputs as accepted world effects.
