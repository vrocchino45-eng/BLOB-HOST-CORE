# BLOB: HOST CORE — HC016A R0 Rebuild Architecture Rebaseline

## Pass mode
AUDIT / CONVERGENCE ONLY. No gameplay expansion.

## Locked authority
1. `BLOB_HOST_CORE_REBUILD_BLUEPRINT_v0_1` — primary rebuild architecture / experience.
2. `HOST_CORE_Blueprint_v1_reference_docs` — compatible detail/content reference.
3. Chemistry/world registries — authored data authority where compatible.
4. `HC015N_HOTFIX2` — implementation checkpoint, not design authority.
5. Earlier builds — historical/reference only.

## Runtime finding
The current build already contains a real rebuild-compatible substrate:
- `LocalCellMorphSystem` reads `morphPlans` and `localCellRecipes`.
- `ChemObjectSystem` spawns cell contents from `chemObjectRecipes`.
- `BondSystem` reads authored `bondRecipes`.
- visual composition is recipe-driven.
- `activeCellId` is already widely propagated.
- Signal Plain and Membrane Ridge have useful gameplay experiments.

However, that substrate is not yet the dominant architecture.

The runtime still registers **46 active systems**, including explicit Hub Chamber, route, threshold, Objective and Gate ownership. `GateSystem` remains a transition owner and computes locked/readable/crossable/crossed gate states. `FirstSliceTransitionCoordinator` still prepares named Hub, Grave, Vascular, Silt, Comb and Aperture destination system sets. The source-authority file also still named the older `HOST_CORE_Blueprint_v1` as primary before this pass.

## KEEP
These are structurally compatible and should survive R1 unless a deeper dependency audit disproves it.

- `SystemRegistry`
- `RecipeDataSystem` data-loading role
- `ChemObjectSystem`
- `BondSystem`
- `ChemObjectVisualComposer`
- `EnvironmentVisualComposer`
- `PlayerMovementController`
- `CoreEmbodimentSystem`
- `LocalCellMorphSystem` concept and recipe-driven morph plans
- `MorphStateSelector`
- `TargetFocusRegistry` / `TargetingSystem` as interaction utilities
- controller comfort/input
- debug area jump, diagnostics and chemistry debug as non-authoritative tooling
- Signal Plain gameplay concept
- Membrane Ridge movement-reading concept

## MIGRATE
Good work exists here, but ownership or framing conflicts with the rebuild.

- `ObjectiveSystem` → observational/debug guidance only; it must not own world truth.
- `GuidePromptSystem` → interpret Host/local chemistry state, not gate/level state.
- `PlaytestHudSystem` → continue as read-only telemetry; remove progression authority assumptions.
- `FirstSliceTransitionCoordinator` → become local-cell streaming/preparation coordinator rather than named level-transition coordinator.
- `HubChamberFoundationSystem` / `HubInvestigationGameplaySystem` → reinterpret as signal/nerve convergence anatomy.
- Grave route systems → scar/memory anatomy and chemistry.
- Vascular route → vascular/Flux anatomy.
- Silt route → pressure/tissue anatomy.
- Comb Threshold → filtering/membrane morphology, not a hard threshold.
- Aperture Fields → widened host ecology/local-cell family.
- Signal Plain → signal-bearing anatomy driven increasingly by generic chemistry/state.
- Membrane Ridge → membrane-pressure anatomy driven increasingly by movement + material state.
- `CoreGrowthSystem` → persistent composition/perception progression rather than primarily growth presentation.
- region registries/runtime profiles → compatibility metadata during migration, not primary spatial authority.

## RETIRE / DISABLE TARGETS
Do not delete these in HC016A. R1 must first remove their dependencies and prove regression safety.

- `GateSystem` as a gameplay transition owner.
- gate `locked/readable/crossable/crossed` progression as world architecture.
- hard `runtimeTransitionAdapter: GateSystem` crossings.
- Hub-as-level-select behavior.
- threshold-as-hard-gate behavior.
- chamber/route identity as primary runtime ownership.
- build-pass whitelists used as gameplay compatibility authority.
- any debug/HUD state capable of causing gameplay state.

## UNKNOWN / REQUIRES R1 TRACE
- exact amount of legacy chamber code still reachable through registries.
- whether all visible route/threshold geometry has recipe provenance.
- which route completion flags are required by chemistry versus only by GateSystem.
- whether local-cell streaming can fully replace current destination mounting without temporary adapters.
- whether all current player composition fields are persistent and materially affect chemistry.
- whether Signal Plain / Membrane Ridge can be expressed through generic chemistry without losing their useful authored behavior.

## Critical ownership conflict
Current runtime has two architectural languages operating simultaneously:

### Rebuild-compatible language
`localCellRecipes -> morphPlans -> ChemObjectSystem/BondSystem -> activeCellId`

### Legacy/compatibility language
`region/chamber/route -> ObjectiveSystem -> GateSystem -> transition adapter -> destination mount`

R1 should not add another layer between these. It should make the first chain authoritative and reduce the second to compatibility adapters until removable.

## R1 dependency order
1. **State ledger** — define HostState, LocalCellState, ChemistryState, PlayerCompositionState and PresentationState boundaries.
2. **Transition ownership split** — separate destination preparation/streaming from GateSystem crossing rules.
3. **Local-cell coordinator** — make `activeCellId + morph state` sufficient to prepare/activate adjacent anatomy.
4. **Gate compatibility adapter** — GateSystem reads the new morph state temporarily but can no longer initiate world transitions.
5. **Objective demotion** — objectives become derived observations from authoritative Host/Cell/Chemistry state.
6. **Guide/HUD demotion verification** — prove neither can mutate progression.
7. **Hub/Threshold migration seam** — reinterpret first existing hard transition as continuous anatomy without changing its content yet.
8. **Regression run** — Surface Wake through current Aperture content must remain testable.
9. **Remove first gate dependency** only after the same route succeeds through morph/local-cell authority.
10. Repeat dependency removal incrementally; do not mass-delete legacy systems.

## R1 acceptance gate
R1 is complete only when:
- at least one current hard transition works with GateSystem unable to initiate it;
- destination preparation is owned by local-cell/morph infrastructure;
- Objective/Guide/HUD correctly describe the transition but cannot cause it;
- chemistry and player state survive the transition;
- debug jump remains available but explicitly bypasses normal progression;
- no new gameplay/content was required to prove the architecture.

## Strategic test
Every future implementation must answer:

**What macro Host cause produces this micro experience?**

and:

**Does this make BLOB more like a living Host chemistry system, or more like a collection of levels?**
