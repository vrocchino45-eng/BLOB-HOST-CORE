# HC-004A — Acceptance Tests

## Boot

- [ ] `npm install` completes.
- [ ] `npm run dev` starts.
- [ ] Build label shows `HC-004A`.
- [ ] Opening slice still boots from Membrane Nursery.
- [ ] Debug hidden playtest mode still works.

## Validation

- [ ] `npm run validate:grave-route-plan` passes.
- [ ] `npm run validate:recipe-data` passes.
- [ ] `npm run audit:undefined-methods` passes.
- [ ] `npm run build` passes.

## Planning Data

- [ ] `public/data/planning/graveRouteRuntimePlanning_HC004A.json` exists.
- [ ] Selected route is `ROUTE_GRAVE_MEMORY_RESIDUE_SCAR_001`.
- [ ] Planned cell is `CELL_GRAVE_MEMORY_RESIDUE_BED_001`.
- [ ] Planned cell is not present in runtime `localCellRecipes.json` yet.
- [ ] Planned objects are not present in runtime `chemObjectRecipes.json` yet.
- [ ] Dominant domains are residue, scar, seed, and signal.
- [ ] Route planning forbids gates, doors, teleports, old chamber exits, stage-node loaders, and branch select menus.

## Regression

- [ ] Required opening slice remains unchanged.
- [ ] Optional Bloom Residue fork remains playable.
- [ ] No new route appears in runtime.
- [ ] No new morph activates.
- [ ] No old gate/chamber/exit logic returns.
