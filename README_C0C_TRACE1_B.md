# BLOB: HOST CORE — C0C-TRACE1-B / Applied presentation telemetry

## Purpose

C0C5 proved the **Silt cause → Host ledger → Vascular receiver** state transition. TRACE1-A proved source wiring; players could not distinguish the visual response. TRACE1-B measures values of the **already-animated** Vascular objects and **already-assigned** local current during a real browser run. It is **instrumentation only**, not VIS1 or a new visual response. No visual/audio tuning, new mesh, material transport, route progress, control map, or physics logic has been implemented.

## Package: changed-files delta, no blind overwrite

This ZIP adds only seven files to your project. `src/routes/VascularRhythmRouteSystem.js` and `src/debug/WorldObjectCensusSystem.js` are **not** inside it. A guarded patcher edits these two existing files **only after both original SHA-256 hashes match** our audited reference. It creates `.C0C_TRACE1_B_BACKUP` for each and supports safe `--revert`.

### Install in PowerShell, from BLOB-HOST-CORE project root

1. Extract the ZIP **into your current project root**, preserving folder names. This copies only new scripts, a JSON patch spec and documentation.
2. Preflight (read-only):
   ```powershell
   node scripts/applyC0CTrace1B.mjs --check
   ```
   Both entries must say `ORIGINAL`. If one says `DIFFERENT`, **do not force** the patch: share the current owner file(s) for a source-aware reconciliation.
3. Apply:
   ```powershell
   node scripts/applyC0CTrace1B.mjs --apply
   ```
4. Validate:
   ```powershell
   node scripts/validateC0CTrace1B.mjs
   node scripts/testC0CTrace.mjs --source=src/routes/VascularRhythmRouteSystem.js
   npm run build
   ```
   The `testC0CTrace.mjs` tool is from TRACE1-A. Optionally run earlier C0C2–C0C5 tests. A yellow Vite chunk-size warning is not necessarily a build failure.

### Record a focused session

1. Fresh browser reload; start recorder with **Alt+Shift+R** before acting in Silt.
2. Generate 2–5 authentic Silt grain-release causes, then enter Vascular without reloading.
3. Keep Vascular mounted for approximately 45–75 seconds, observing current and membrane. Recorder now samples actual applied presentation values approximately **every 500ms** while mounted, using REC1's existing 150ms sampling loop. It writes event type `vascular-presentation-sample`.
4. Stop with **Alt+Shift+R** and export with **Alt+Shift+E**.
5. Move JSON to project root, then use your actual filename **in quotation marks**:
   ```powershell
   node scripts/analyzeC0CTrace1B.mjs "YOUR_ACTUAL_FILENAME.json" --out C0C_TRACE1_B_RUN.json
   ```
   `YOUR_ACTUAL_FILENAME.json` is an example, **not** an existing file. Upload the real recording and optionally screenshots/video of Vascular if you want a perceptual comparison.

### What it measures

- Vascular receiving-state membrane load, flow scale and receipt count.
- Existing `frameState.physicalFeel` current strength and vector magnitude.
- **Applied** vessel opacity/emissive intensity, mean wall-fold Y-scale ratio/opacity/emission, braid emission, current-mote emission/opacity and first-mote position.
- Read-only formula-derived Silt source terms (for separating tiny Silt contributions from total visual material values).
- Other concurrent presentation drivers—contraction, synchronization, turbulence, verb accents and Host rhythm—to prevent false attribution.

The current viewer output is not proof of real rendered pixel contrast or player perception. A trace of varying material values does **not** establish that the visual effect is noticeable. `SOURCE` contribution terms are the formulas used by existing code, while `applied` terms are sampled mesh/material state.

### Rollback

```powershell
node scripts/applyC0CTrace1B.mjs --revert
```

Rollback refuses if either patched source file differs from the exact expected TRACE1-B output. Backups remain for inspection. If you edit the instrumented owners after applying, **do not force rollback**; use Git or reconcile manually.

### Locked boundaries

- Silt state, movement/controls, three verbs and grip, chemistry, source ledger and Vascular receipt validation remain untouched.
- No changes to physics, current magnitude formula, material ownership, progression or rendering logic.
- No new Vascular animation or sound—VIS1 can be pursued only after measuring what existing presentation does.
- Existing REC1 JSON schema/header preserved; adds a typed optional event; old recordings remain valid but have no TRACE1-B samples.

## Milestone interpretation

**TRACE1-B offline pass** means instrumented readings reproduce mock object values, do not mutate the scene/receiver/frame, and are captured with the intended throttle. **Browser/field acceptance remains pending** until an instrumented REC1 recording is analyzed on the user's current local build.
