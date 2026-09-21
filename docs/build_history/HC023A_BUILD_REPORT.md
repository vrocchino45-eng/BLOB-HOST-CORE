# HC023A — Gameplay Density Rebaseline & Platform Audit

## Mode
AUDIT / REBASELINE / SAFE CLEANUP. No new gameplay.

## Goal
Create a clean platform for adding roughly ten minutes of meaningful play inside the spaces already available, targeting an exploratory run around 22 minutes without padding traversal or increasing mandatory wait timers.

## Current active-source audit
Before cleanup:
- 102 JS modules
- ~47,223 source lines

Static import reachability found **17 JS modules / 6,231 lines** that were not reachable from `src/main.js`.
They were historical Grave/Signal Chorus/debug/tight-camera implementations and were not executing in the current runtime.

They are preserved in:
`docs/source_archive/HC023A_UNREACHABLE_SOURCE_ARCHIVE.zip`

and removed from active `src/`.

After cleanup:
- 85 active JS modules
- ~40,992 active source lines
- every active JS module is intended to be reachable from `main.js`

This is primarily a maintenance/convergence improvement, not an FPS claim: unimported modules were already not running.

## Documentation hygiene
15 accumulated HC020-HC022 root reports were moved into `docs/build_history/`.
Only the current build report remains at root alongside README/CHANGELOG/KNOWN_ISSUES/LOCK_STATUS.

## Startup/data finding
`RecipeDataSystem.loadAll()` still issues **85 static JSON loads**.
35 loaded datasets currently have no direct consumer outside RecipeDataSystem.

Do **not** simply delete those yet. RecipeDataSystem also performs validation/compatibility work against historical datasets. The correct compression is to split:
1. active runtime recipe pack,
2. validation/reference pack,
3. archived compatibility data.

That is a real future performance/startup target, but not safe to mix blindly into this audit.

## Existing mandatory rhythm that should NOT be lengthened
- Guide convergence already requires path familiarity and at least 2.4 seconds before ready.
- Grave already contains 1.15s Stabilize + 1.25s safe-transfer + 0.72s settle requirements.
- Vascular already requires 3 cadence reads on a 2.35s beat plus deep traversal and Stabilize recovery.
- Silt already requires read + 1.05s brace + 0.68s selective Absorb + deep traversal.
- Hub already requires reading all three route positions plus its memory state.

HC023 gameplay density should go **between and around these requirements**, not make them longer.

## +10 minute density target
The implementation map is in:
`public/data/build/hc023aGameplayDensityMap.json`

Target added time:
- ~6.75 minutes from first-time engaged interaction/recognition.
- ~3.75 minutes from optional discovery and experimentation.
- ~10.5 minutes total available density.
- experienced play should become significantly faster through learned vocabulary.

### Allocation
Surface: +1.75 min
Guide: +1.50 min
Hub: +1.25 min
Grave: +2.00 min
Vascular: +2.00 min
Silt: +2.00 min

## Compression / retirement decisions
### RETIRE / ARCHIVED NOW
- 17 unreachable source modules.
- accumulated root build reports.

### KEEP
- current region owners, working verbs, Core anatomy, Host rhythm, movement/camera, route completion logic.

### MIGRATE LATER
- RecipeDataSystem's mixed runtime/validation/archive loading.
- compatibility/planning recipe datasets that remain loaded only because validation currently depends on them.

### FORBIDDEN FOR THE 22-MINUTE TARGET
- longer corridors for the sake of time;
- more required cadence reads;
- longer Stabilize/Absorb hold timers;
- extra objective pages;
- new region;
- new primary verb;
- duplicate regional gameplay owner.

## Implementation platform
HC023B should begin with **Surface + Guide density composition** using existing systems. New play must reuse:
Scan / Pulse / Stabilize / Absorb, Host rhythm, ambient ecology, interaction families, mechanical combinations and Core consequence memory.

The rule is: **more situations, not more systems.**
