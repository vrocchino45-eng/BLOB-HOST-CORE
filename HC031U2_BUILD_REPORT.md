# HC031U2 BUILD REPORT — Persistent Living Ecology + Encounter Pacing

Parent: **HC031U1 — Gathering Ground Alive Pass 1 / Startup Lifecycle Hotfix**  
Version: **0.31.50**  
Telemetry: **`blob.session.telemetry.v1.48`**  
Scope: Gathering Ground encounter pacing, recurrence, interaction memory, telemetry/readability only.

## Why this pass exists

The HC031U1 human test proved all six Gathering Ground encounters functioned, but the player-facing ecology exhausted itself quickly while underlying entity/matter systems continued changing. U2 keeps the same encounter identities and turns them into a persistent local ecology rather than adding more checklist content.

## U2 correction

- Retains exactly the same six encounter IDs from HC031U1.
- Ambient Watcher and relay reads are delayed and sustained so arrival has observation time.
- Watcher `Stabilize + Pulse` requires a sustained 2.4-second response phase.
- Relay `Stabilize + Absorb` requires a sustained 2.8-second response phase.
- Breaking a chord or leaving the local response body interrupts the response and applies retry backoff.
- Completed reactive relationships rearm only after release + cooldown.
- Recurrent Watcher/relay answers can propagate fresh Ridge Echo Return / Matter Spill Return cycles.
- `LIFE` remains the initial six-identity read; `LOOP` tracks recurrent response cycles.
- Interaction memory exposes `quiet_observer`, `coherent`, or `guarded` without gaining progression authority.
- Telemetry v1.48 records rearm, recurrence, memory changes, LOOP count, and memory mode.

## Deterministic bot convergence

Six fixed profiles pass behavioral convergence:

| Profile | 30s | 60s | 120s | LOOP | MEM | Interrupted | Same-frame reactive |
|---|---:|---:|---:|---:|---|---:|---:|
| normal_explorer | 6/6 | 6/6 | 6/6 | 2 | coherent | 0 | 0 |
| slow_observer | 2/6 | 2/6 | 2/6 | 0 | quiet_observer | 0 | 0 |
| aggressive_verb_user | 2/6 | 2/6 | 2/6 | 0 | guarded | 111 | 0 |
| boundary_traversal_stress | 1/6 | 1/6 | 1/6 | 0 | coherent | 64 | 0 |
| backtracker | 4/6 | 6/6 | 6/6 | 0 | coherent | 0 | 0 |
| chaotic_fixed_seed | 1/6 | 2/6 | 2/6 | 0 | guarded | 99 | 0 |

The important convergence result is behavioral separation, not the raw interruption counts: deliberate play resolves, observation can remain ambient-only, backtracking preserves progress, and unstable pressure no longer grants free reactive completion.

## Frozen from T6/U1

No changes to:
- Ridge 3-of-3 completion law;
- Aperture movement bounds / Gathering Ground entry radius;
- same-cell / no-teleport continuity;
- PlayerMovementController;
- TargetingSystem;
- Signal Plain;
- controls/input mapping;
- Vascular / Silt;
- encounter identity count.

These owners are hash-locked by `hc031u2LockedParentHashes.json`.

## Validation

`npm run validate:current` **PASS**:
- HC031U2 structural validation;
- deterministic persistent ecology smoke: LIFE 6/6, LOOP 2, MEM coherent;
- six-profile bot convergence;
- HC031U1 startup lifecycle contract;
- HC031U structural inheritance;
- HC031T5 Ridge trace smoke at 30/60/120/144 FPS;
- undefined-method audit;
- RecipeData load;
- JS syntax checks.

`npm run build` cannot execute in this Linux workspace because the recovered Windows `node_modules` lacks Rollup's Linux optional native package `@rollup/rollup-linux-x64-gnu`. Dependencies were not modified and `node_modules` is not shipped.
