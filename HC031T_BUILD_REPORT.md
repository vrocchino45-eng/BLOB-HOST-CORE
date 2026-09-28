# HC031T Build Report — Open Territory / Adjacent Host Proof

## Identity
- Build: `HC-031T`
- Parent: `HC-031S`
- Package: `0.31.41`
- Telemetry: `blob.session.telemetry.v1.43`
- Mode: continuous Host adjacent-territory proof

## Purpose
Turn one existing Aperture Fields background/ghost destination — `gathering_ground_cluster` — into a real neighboring Host territory without adding a world-map UI, teleport, new active cell, or new controller vocabulary.

## Canonical world rule
**Background is unresolved world, not decorative nothing.**

The proof uses three simulation/detail rings:
1. **Ring C — distant**: Gathering Ground exists as a low-detail Host silhouette.
2. **Ring B — neighbor**: camera aim + Pulse can resolve it remotely; Stabilize can establish a bounded remote relationship; Absorb receives only a weak inward answer.
3. **Ring A — local**: after Membrane Ridge is read, existing Aperture movement bounds expand and connective anatomy becomes physically traversable. Approaching Gathering Ground promotes it to local presentation without changing `activeCellId`.

## What changed
- Added `ApertureAdjacentTerritorySystem`.
- Reused the existing `gathering_ground_cluster` destination identity instead of inventing a new region.
- Added low-cost neighboring anatomy and connective tissue from Membrane Ridge toward Gathering Ground.
- Expanded `ApertureFieldsArrivalSystem` bounds only after Membrane Ridge completion.
- Updated Aperture guidance/objective metadata so Gathering Ground is no longer described as a non-playable endpoint.
- Added read-only telemetry for remote observation, remote relationship, traversal opening, and continuous local entry.

## What did not change
- `PlayerMovementController` still owns player movement.
- `TargetingSystem` is unchanged.
- Pulse/Absorb/Stabilize strength and controller mappings are unchanged.
- `SignalPlainEcologySystem` and `MembraneRidgeGameplaySystem` are unchanged.
- No active-cell transition is created for Gathering Ground.
- No route history, Hub, Grave, Vascular, Silt, Comb, chemistry, or entity-AI ownership changes.
- HC031S Silt internals are untouched. HC031S remains source-validated but still awaits its player acceptance run.

## Movement-volume behavior
Before Signal Plain completion:
- existing Aperture arrival bounds.

After Signal Plain completion:
- existing deeper-field bounds.

After Membrane Ridge completion:
- `adjacent_gathering_territory_open_ellipsoid`
- center remains authored by `ApertureFieldsArrivalSystem`
- radii expand to approximately `32 x 15 x 52`
- no teleport or player-position mutation.

## Telemetry v1.43
New events:
- `world.adjacent_territory.observed`
- `world.adjacent_territory.relationship_established`
- `world.adjacent_territory.traversal_opened`
- `world.adjacent_territory.entered`

The intended causal chain is:
`distant silhouette -> Pulse observation -> remote Stabilize relationship -> Membrane Ridge read -> connective anatomy opens -> continuous physical approach -> local territory`

## Validation
`npm run validate:current` — PASS.

HC031T validator proves:
- Gathering Ground begins as Ring C distant context.
- Pulse can resolve it remotely into Ring B.
- Stabilize establishes a bounded remote relationship.
- Membrane Ridge completion opens the adjacent territory without moving the player.
- Aperture movement bounds remain owned by `ApertureFieldsArrivalSystem`.
- Physical approach reaches Ring A inside the same active cell.
- all four telemetry events are emitted.
- 22 neighboring gameplay owners are hash-locked unchanged.

Additional checks:
- undefined `this.method()` audit — PASS
- RecipeDataSystem loadAll — PASS
- syntax checks — PASS

`npm run build` still fails in this Linux verification environment because the inherited Windows `node_modules` tree does not contain Rollup's Linux optional binary `@rollup/rollup-linux-x64-gnu`. This is the same environment mismatch seen in prior passes and is not a source-validation failure.
