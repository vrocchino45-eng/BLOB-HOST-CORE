# HC-004F Acceptance Tests

## Must pass

```text
The first playable minute still loads and progresses.
Surface Wake, Scar Flow Fold, and Signal Chorus Nerve remain locked.
Bloom Residue Fork remains optional.
The Grave morph remains no-gate and no-teleport.
Grave arrival readability remains active before the read loop.
The Grave read loop becomes active only inside CELL_GRAVE_MEMORY_RESIDUE_BED_001.
The Guide prompts the player to read before absorb.
The HUD shows Grave loop progress / next action.
The player cannot safely transfer silt before enough reading.
Only residue_silt_cloud_001 can complete the safe transfer.
old_core_husk_memory_001 remains unconsumed.
scar_lock_plate_001 remains unconsumed.
inheritance_seed_remnant_001 remains unconsumed.
No old gates, doors, teleports, branch menu, old chamber runtime, dialogue tree, quest log, or combat return.
```

## Regression checks

```bash
npm run validate:grave-read-loop
npm run validate:grave-arrival-readability
npm run validate:grave-morph-prototype
npm run validate:grave-visual-composer
npm run validate:grave-route-recipe-pack
npm run validate:grave-route-plan
npm run validate:recipe-data
npm run validate:gold-candidate
npm run audit:undefined-methods
npm run build
```

## Manual playtest notes

```text
1. Start from the opening slice.
2. Confirm the locked first playable minute still behaves normally.
3. Reach the optional Bloom Residue Fork.
4. Trigger the Grave no-gate morph only through the intended readiness flow.
5. On Grave arrival, read the space before trying to absorb.
6. Verify early absorb attempts are refused/warned.
7. Complete the read sequence.
8. Verify only the silt cloud can transfer.
9. Verify preserved Grave objects remain visible.
```
