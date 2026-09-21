# BLOB: HOST CORE — HC-015D Build Report

## Mode
Convergence / live-frame ecology readability.

## Purpose
Correct the Signal Plain frame using the actual rendered/runtime behavior observed in HC-015C, and eliminate successor identity drift.

## Code-derived findings
- HC-015C's spatial proof validated authored coordinates but did not validate screen-space obstruction.
- Aperture presentation tissue marked `inspectionFadeable` could remain visually dominant inside the Signal Plain gameplay pocket.
- Ctrl+Shift+8 relocated the Core but did not provide a short authored framing handoff toward Signal Plain.
- HC-015C was packaged inside a folder still named HC015B, allowing visible identity drift despite current manifest/main values.

## HC-015D changes
- Non-gameplay Aperture presentation tissue progressively softens as the Core enters the Signal Plain pocket (8.5–19 unit transition).
- Signal Plain organ and ecology receptors remain separate and fully readable.
- Ctrl+Shift+8 now publishes a 2.8-second temporary framing request toward Signal Plain after resetting the local encounter.
- GameRuntime blends the camera target toward Signal Plain during that short debug framing window, then returns camera control normally.
- No ecology success, observation, gate, route, or progression is granted by the debug jump.
- Current build identity synchronized to HC-015D in main, manifest, package metadata, runtime profile, and package folder.

## Locked systems
- 3 unique receptor observations -> Stabilize -> READY -> fresh Pulse state machine.
- Normal Ctrl+8 Aperture arrival.
- Aperture movement bounds.
- Comb/Aperture progression and return path.
- Player-owned camera controls after the temporary debug framing handoff.

## Validation
- `validateSignalPlainLiveFrameHC015D.mjs` — PASS
- `validateSignalPlainFirstEcologyHC015A.mjs` — PASS
- `validateSignalPlainDebugJumpHC015A.mjs` — PASS
- `validateRecipeDataLoad.mjs` — PASS (Build HC-015D)
- `auditUndefinedThisMethods.mjs` — PASS
- `npm run build` — PASS
- Historical `validateSignalPlainPlaySpaceHC015C.mjs` rejects HC-015D only because it hard-codes the HC-015C pass identity; its historical assertion was not weakened.
