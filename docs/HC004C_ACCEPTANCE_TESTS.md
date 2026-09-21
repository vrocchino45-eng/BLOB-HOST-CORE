# HC-004C — Acceptance Tests

## Required Commands

```bash
npm run validate:grave-visual-composer
npm run validate:grave-route-recipe-pack
npm run validate:grave-route-plan
npm run validate:recipe-data
npm run validate:gold-candidate
npm run audit:undefined-methods
npm run build
```

## Visual Composer Checks

- [ ] All six HC-004B Grave visual recipes have composer support.
- [ ] Environment visual recipes are owned by `EnvironmentVisualComposer`.
- [ ] Chem-object visual recipes are owned by `ChemObjectVisualComposer`.
- [ ] No Grave visual recipe falls through to `visual_composer_fallback`.
- [ ] Composer methods instantiate visible child objects without throwing.

## Runtime Lock Checks

- [ ] `CELL_GRAVE_MEMORY_RESIDUE_BED_001` remains `authored_recipe_pack_not_runtime_active`.
- [ ] Grave chem objects remain `authored_recipe_pack_not_runtime_spawned`.
- [ ] Grave cell is not referenced by morph plans.
- [ ] Grave cell has no target focus rule.
- [ ] No old gates, doors, teleports, stage-node loaders, branch menu, or old chamber runtime returns.

## Gold Candidate Checks

- [ ] Opening chain remains preserved.
- [ ] Optional Bloom fork remains preserved.
- [ ] Debug-hidden playtest mode remains preserved.
- [ ] Production build passes.
