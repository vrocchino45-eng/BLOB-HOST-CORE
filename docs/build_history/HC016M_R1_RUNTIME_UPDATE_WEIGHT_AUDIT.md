# BLOB: HOST CORE — HC016M

## Mode
R1 RUNTIME UPDATE-WEIGHT AUDIT / MOUNT PROFILE REBASELINE.

## Primary finding
The SystemRegistry already has a sound active-region suppression mechanism:
`runtimeScope: active_region` systems update only when their id exists in
`firstSliceRuntimeMount.activeSystemIds`.

The bigger problem was that the mount profile had become stale while the runtime architecture evolved.

`RecipeDataSystem` was still loading `act1RuntimeProfile_HC015N.json`, whose internal identity and ownership were older and still:
- declared retired GateSystem as a global/transition owner;
- carried deleted dormant compatibility ids;
- omitted `membraneRidgeGameplaySystem` from Aperture Fields.

Because Membrane Ridge is registered `active_region`, omission from the profile means SystemRegistry skips its update.

## HC016M correction
A new `act1RuntimeProfile_HC016M.json` is now the loaded profile.

It:
- uses the rebuild blueprint as source authority;
- removes GateSystem from global/transition ownership;
- declares LocalCellBoundaryMorphSystem as the later boundary owner;
- removes HC016L-deleted compatibility ids;
- includes Comb/Aperture in the preview path;
- mounts `membraneRidgeGameplaySystem` with Aperture Fields;
- recalculates each active-region update budget from shared + local systems.

## Runtime profiling
SystemRegistry now samples per-system update duration once every 60 frames rather than timing every update every frame.

During sampled frames it publishes:
- `runtimeExecution.sampledUpdateMs`
- `runtimeExecution.slowestSampledSystems`
- `runtimeExecution.slowSystemIds`
- average/max/last sampled milliseconds per executed system

Slow threshold: 2.0 ms.

This lets gameplay video/screenshots/debug captures tell us which system is actually expensive instead of guessing from file size.

## Registration/update shape
- registered systems: 47
- global registrations: 15
- active-region registrations: 32

Active-region systems are already skipped outside their mounted region. HC016M therefore does **not** blindly suppress additional global systems yet.

## Why
PlayerMovement, input, mode ownership, boundary morphing, objective derivation, Guide, Core growth, visual composition, and HUD cross region boundaries. Throttling them without measurements risks introducing latency or stale state.

The next optimization should be driven by `slowestSampledSystems` from real play.

## Next
Run HC016M through the normal path and debug jumps, especially Aperture -> Signal Plain -> Membrane Ridge. If the sampled telemetry identifies expensive global or local systems, HC016N can target those specific owners. If no updater is individually expensive but transition gaps remain, the next investigation should move to scene allocation/geometry/material preparation and garbage collection rather than update-loop suppression.
