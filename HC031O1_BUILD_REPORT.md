# HC-031O1 — Host Continuation Directional Read

Parent: **HC-031O — Host Continuation / First Route Legibility**

Mode: **convergence / route presentation**

## Purpose

HC031O proved that the existing Surface Wake → Guide Threshold continuation is functional and no longer seed-gated. Its telemetry also exposed a readability gap: the Host continuation was revealed at 17.075 s, but the first continuous morph was not entered until 122.460 s (~105.4 s later).

The concrete presentation bug was in the Watcher: runtime semantics said `turning_toward_listening_fold`, while its body-facing code still tracked the player. HC031O1 makes that cue physically truthful and gives the already-authored Listening Fold a short reveal emphasis.

## Changes

- `EntitySystem`
  - When the existing fold invitation is open and no nursery packet owns attention, the Nursery Watcher physically orients toward `surface_wake_listening_fold_001`.
  - A small living scan remains so the Watcher does not become a rigid objective arrow.
  - The Watcher gains **no route authority**.
  - Read-only userData reports route-cue target/mode for inspection.
- `SurfaceWakeLayeredInteractionSystem`
  - For 5.5 s after the existing continuation reveal, the already-existing Fold core/ring/lobes/light receive a bounded reveal pulse while stage 0 is active.
  - No new geometry, entity, particles, route, or progression owner is added.
  - Read-only state exposes directional cue activity/target/mode.
- Identity/tooling
  - Build `HC-031O1`, package `0.31.34`.
  - HC031O route/progression owners remain hash-locked.
  - Telemetry schema remains `blob.session.telemetry.v1.37`; reveal-to-entry time is still measured from existing events.

## Locked / forbidden scope

Unchanged:
- HC031O reveal criteria and dual reveal paths.
- Optional safe-seed rule.
- Listening Fold stage timing/requirements.
- `LocalCellMorphSystem` crossing ownership and trigger law.
- K→N movement/attachment/verb/targeting grammar.
- N2 reacquisition law.
- Ecology interpretation/memory/matter-coupling logic.
- Guide Threshold and second morph.
- Region topology.

## Validation

`npm run validate:current` passes:
- HC031O1 directional-read validator.
- JS syntax checks.
- RecipeDataSystem load validation.
- undefined `this.method()` audit.

The HC031O1 validator includes a runtime proof where the player and Listening Fold are in different directions: the Watcher enters `turning_toward_listening_fold`, physically rotates closer to the Fold than the player, and retains `routeAuthority: false`.

20 neighboring gameplay owners are SHA-256 locked unchanged.

`npm run build` still cannot execute in this Linux container because the uploaded Windows `node_modules` tree lacks `@rollup/rollup-linux-x64-gnu`. This is the same environment-specific Rollup optional-binary limitation seen in earlier passes, not a source validation failure.
