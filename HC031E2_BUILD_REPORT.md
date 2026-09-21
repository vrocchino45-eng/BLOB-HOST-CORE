# HC031E2 Build Report — Unified Tendril Language

## Purpose

Playtest feedback identified that the blue tendrils trailing the Core in open space still looked like a separate decorative system from the newer suction tendrils. HC031E2 converges that split without changing movement or contact mechanics.

## Runtime changes

1. Added `src/visual/CoreTendrilVisualLanguage.js` as a presentation-only shared palette/proportion contract.
2. Replaced the old `player_seed_trailing_veil_*` cone meshes in `ChemObjectVisualComposer` with three segmented travel tendrils.
3. Each free tendril now has the same anatomy hierarchy as contact tendrils: Core-side root, three tapered tendon segments, and a folded sucker tip.
4. `CoreEmbodimentSystem` now animates those travel tendrils as relaxed trailing limbs rather than scaling cone veils.
5. `CoreTendrilSurfaceContactSystem` now reads the same shared material family and publishes occupied tendril indices for visual handoff only.
6. Free tendril index N fades when contact tendril index N becomes occupied, preserving the impression of three limbs rather than six.

## Explicit non-goals

HC031E2 does not move the Core with tendrils, modify collision, add raycasts, add controls, alter targeting/Bond/verbs, change Grave logic, or change rupture/progression systems.

## Validation

- HC031E2 unified tendril contract: PASS
- RecipeData load: PASS
- undefined `this.method()` audit: PASS
- runtime JS syntax: PASS
- JSON parse: PASS
- relative import resolution: PASS
- 15 locked parent gameplay/runtime owners: byte-identical to HC031E1
