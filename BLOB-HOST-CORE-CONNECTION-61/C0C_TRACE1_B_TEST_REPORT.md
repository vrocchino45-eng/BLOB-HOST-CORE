# C0C-TRACE1-B — Test report

**Result: OFFLINE_READ_ONLY_PRESENTATION_TRACE_PASS**

- Tested a guarded copy of `VascularRhythmRouteSystem.js` (SHA-256 before `0ed9698e90625401e14d86f2f8da970590aed0d0bff7a6f6a44c194d98a9dfbe`) and recorder `WorldObjectCensusSystem.js` (SHA-256 before `05d8eea702871d844b046917b10717ce1512156c31c48d5fcf200958efc93844`).
- Patcher `--check`, `--apply`, idempotent reapply, `--revert`, and reapply tested on an isolated source copy.
- `node scripts/validateC0CTrace1B.mjs`: **28 offline assertions passed**.
- Verified patched owners can be converted back byte-exactly to the audited originals by reversing only TRACE1-B's insertions. No original owner statements were modified.
- Test fixture verifies measured vessel, fold, braid, mote and current values, 500ms recorder throttling, muted capture while inactive, and no mutation of scene/receiver/frame during measurement.
- Synthetic analyzer run: `PRESENTATION_VALUES_RECORDED_NOT_PERCEPTUAL_PROOF`.
- Previous TRACE1-A JSON run: `INCOMPLETE_NO_PRESENTATION_SAMPLES` (correctly incomplete, not failed).
- Both modified JS files passed `node --check` in the isolated test copy.
- Previous TRACE1-A source audit and fixtures passed again against the instrumented Vascular owner: **16 assertions**.

**Pending user-local:** `npm run build`, earlier circuit regressions, new instrumented REC1 session, Vascular response visibility judgment.

**Limits:** No browser screenshot was simulated; no Three.js/Vite rendering was executed here. Measurements are object material/transform parameters, not actual pixels nor perceived change. Sampling every ~500ms may miss brief pulses; REC1's own source rings and sampling caveats remain.
