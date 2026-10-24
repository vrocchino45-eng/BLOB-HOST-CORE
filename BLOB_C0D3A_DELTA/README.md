# BLOB — C0D3-A: Grave II inherits authenticated Host history

This change follows the existing **Grave II second-visit environment** rather than adding a generic reward in Silt. Only the Grave return-layout owner changes.

## Behavior
- Grave I completes as before. On a later qualifying Grave visit, the existing second-phase anatomy expands.
- If Grave I has already received actual Host-authenticated Vascular applied effects, its bounded memory pressure now influences Grave II resonance by `+0.15 * clamp(memoryPressure,0,1)`.
- The existing `return_octave_resonance_v2` equation, 3→6→12 phase counts, coupled Grave II landmarks, resolution requirements, route crossing, and completed credits are untouched.
- With no accepted memory, first visit, off-route, or bad memory shape, computed layout numbers remain identical to C0D2. No remote simulation or physical transfer occurs.
- The extra input telemetry is `frameState.returnRegionEngine.graveLayout.inputs.c0d3GraveIIHostMemory`.
- This is the inward Grave II connection; an independent **Grave II resolution → Host → Silt** relay is proposed for C0D3-B, *not* installed here.

## Install
Extract `BLOB_C0D3A_DELTA` next to your project `src` and `package.json`.

```powershell
node BLOB_C0D3A_DELTA/apply.mjs --check
node BLOB_C0D3A_DELTA/apply.mjs --apply
node BLOB_C0D3A_DELTA/validate.mjs
npm run build
```

The first check must print `C0D2_READY`. If it prints `DIFFERENT`, STOP. Do not force-install or overwrite any local edits.

## Rollback

```powershell
node BLOB_C0D3A_DELTA/apply.mjs --revert
```

## Scope
One owner file; no movement, input, Vascular, Silt, Grave I, Grave II objective, chemistry, current, visual assets, or progression authority changed. Archive history remains indexed. This project is intended for your existing C0D2 build.

## Testing limitation
Offline contract and installer/rollback tested here. Windows production build and browser perceptual behavior are not verified here.
