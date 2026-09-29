# HC031T4 — Gathering Ground Attention Handoff

**Parent:** HC031T3 — Membrane Ridge World Release Readability  
**Build:** HC-031T4  
**Version:** 0.31.45  
**Telemetry schema:** unchanged at `blob.session.telemetry.v1.45`

## Why this pass exists

HC031T3 made the third Membrane Ridge contour visibly release the world, but the released objective could still say “read what gathers beyond the ridge” while canonical Targeting reported `Target: none`. Gathering Ground had its own private macro-aim calculation, but it was not participating in the HC031M aim-owned noun grammar.

That mismatch made the handoff feel dead: the Guide referred to a world body that the player’s canonical attention system did not acknowledge.

## Change

HC031T4 adds one generic extension to canonical attention: **world-scale attention candidates**.

`ApertureAdjacentTerritorySystem` now publishes Gathering Ground as one semantic Host-territory noun with several visible focus roots (body, membranes, response halos). `TargetingSystem` can consume that provider without converting the territory into a ChemObject. Aim still chooses the noun; verbs still only modify the relationship.

When the camera settles on any substantial visible part of Gathering Ground:

- `Target` can become `gathering_ground_cluster`.
- the playtest trace reports `Host link: Gathering Ground · attention`;
- the GG debug line reports `ATTN`;
- Pulse can advance the existing remote observation chain;
- Stabilize can establish the existing remote relationship;
- no invisible center point is required.

## Files intentionally changed

- `src/fields/ApertureAdjacentTerritorySystem.js`
- `src/targeting/TargetingSystem.js`
- `src/targeting/TargetFocusRegistry.js`
- `src/guide/GuidePromptSystem.js`
- `src/debug/RecipeDebugOverlay.js`
- `src/ui/PlaytestHudSystem.js`
- `src/main.js`
- `package.json`
- `package-lock.json`
- `scripts/validateHC031T4GatheringGroundAttentionHandoff.mjs`

## Locked / unchanged

The validator hash-locks the following parent owners:

- `PlayerMovementController`
- `ApertureFieldsArrivalSystem`
- `MembraneRidgeGameplaySystem`
- `SignalPlainEcologySystem`
- `GameRuntime`
- `SessionTelemetrySystem`
- `InputSystem`
- `ChemObjectSystem`
- `CoreVerbPhysicalizationSystem`

So this pass does **not** widen movement again, change ring completion, remap controls, rewrite chemistry, or alter telemetry authority.

## Telemetry

No schema bump is required. Existing canonical attention events now provide the missing proof:

- `attention.candidate.changed`
- `attention.owner.changed`
- `attention.target.changed`

The existing adjacent-territory events remain the progression proof:

- `world.adjacent_territory.observed`
- `world.adjacent_territory.relationship_established`
- `world.adjacent_territory.traversal_opened`
- `world.adjacent_territory.entered`

## Validation

`npm run validate:current` passes, including:

- HC031T4 attention-handoff validator
- undefined `this.method()` audit
- RecipeData load validation
- syntax checks for every intentionally changed JS owner

## Acceptance

After the third Ridge contour:

1. look toward any substantial visible part of Gathering Ground;
2. `Target` should become `gathering_ground_cluster` without pressing a verb;
3. `Host link` should report Gathering Ground attention and GG should show `ATTN`;
4. Pulse should advance `OBS1 → OBS2 → OBS3`;
5. Stabilize should establish `REL Y`;
6. the existing opened connection remains the physical route forward;
7. no teleport, new cell, hidden center-point hunt, or movement retune is involved.
