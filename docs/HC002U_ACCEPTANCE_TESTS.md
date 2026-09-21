# HC-002U — Acceptance Tests

## Boot

- [ ] Run `npm install`.
- [ ] Run `npm run dev`.
- [ ] Build displays `HC-002U`.
- [ ] Schema validation reports `ok`.
- [ ] Target focus rules count is nonzero.

## Nursery Targeting

- [ ] Start in Membrane Nursery.
- [ ] `dormant_seed_nutrient_001` is prioritized before absorption.
- [ ] Holding `F` / controller `A` still pulls to the seed.
- [ ] Seed absorption still completes.

## Scar-Flow Targeting

- [ ] Complete first morph.
- [ ] Scar-Flow focus follows the Scar-Flow interaction stage.
- [ ] Current focus object gets the reticle.
- [ ] Old nursery objects do not steal focus.

## Signal-Chorus Targeting

- [ ] Complete second morph.
- [ ] Signal-Chorus focus follows the Signal-Chorus interaction stage.
- [ ] Seed-signal bridge is prioritized when the third morph is ready.
- [ ] Old Scar-Flow objects do not steal focus.

## Bloom-Residue Targeting

- [ ] Complete third morph.
- [ ] Bloom-Residue focus follows the Bloom-Residue interaction stage.
- [ ] Overgrowth warning tendril becomes priority when overgrowth risk rises.
- [ ] Seed-choice braid remains readable when the loop is prepared.

## Debug

- [ ] Full debug shows focus rule.
- [ ] Full debug shows preferred target.
- [ ] Full debug shows allowed cells.
- [ ] Compact debug shows target focus summary.
