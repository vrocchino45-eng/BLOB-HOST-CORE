# HC031F1B Build Report — Crawlable Surface Authority + Host Contact Shelf

## Why this pass exists

HC031F1A proved that mesh-derived surface truth can improve stand-off and tendril causality, but the playtest showed that "nearby visible mesh" is not a sufficient ecological rule. Large translucent shells and decorative volumes could still compete with surfaces that visually read as anatomy the Core should actually grip.

HC031F1B replaces generic visible-mesh eligibility with explicit authored ecological surface authority and adds the first small continuation area built around that rule.

## Runtime changes

1. Added `CrawlableSurfaceRegistry` with four first-proof profiles: `membrane_stable`, `scar_brace`, `soft_tissue`, and `residue_weak`.
2. Added `HostContactShelfSystem`, a continuation inside `CELL_MEMBRANE_NURSERY_001` rather than a new gated region.
3. The shelf authors four crawlable surfaces plus one intentionally non-crawlable connective visual.
4. `CoreSurfaceTruthSystem` now ignores all unregistered visible meshes. Candidate surfaces must carry explicit crawlable metadata and match the active cell.
5. Surface truth publishes surface ID, profile ID, material family, adhesion, load tolerance, compliance, and future verb-transmission values.
6. `PlayerMovementController` remains sole translation owner. Existing tendril pull is modestly scaled by authored adhesion + load tolerance so scar carries body load better than residue.
7. `CoreTendrilSurfaceContactSystem` publishes the same ecological surface identity with its attachment state.
8. Existing Shift+1 focused test platform now places the Core just outside the Host Contact Shelf. No new debug control was added.
9. Generic visible meshes are explicitly non-eligible for surface truth. The authored movement envelope remains the fallback/safety surface outside registered ecology.

## Surface profiles

- **Stable membrane:** forgiving adhesion, moderate load carriage, balanced future verb transmission.
- **Scar brace:** strongest adhesion/load carriage and strongest future Pulse transmission.
- **Soft tissue:** good grip but high compliance; intended to deform under later load feedback.
- **Weak residue:** temporary grip, poor recoil/load carriage, high future Absorb affinity.

The `verbTransmission` values are data only in this pass. HC031F1B does **not** change Pulse, Absorb, Stabilize, combat output, targeting, or progression.

## Scope intentionally not added

No anchored Pulse yet, no wall/ceiling guarantee, no edge wrap, no new ability buttons, no material tearing, no moving Vascular wall, no Grave history synthesis, no new gate, and no new region transition.

## Validation

- HC031F1B authored-surface contract: PASS
- RecipeData load: PASS
- undefined `this.method()` audit: PASS
- runtime JS syntax: 127/127 PASS
- JSON parse: 473/473 PASS
- relative import resolution: PASS
- 16 locked parent gameplay/runtime/visual owners: byte-identical to HC031F1A
- runtime source delta from HC031F1A: 8 files
- bounded surface-traction ordering proof: scar > membrane > residue PASS

## Render limitation

This packaged checkpoint does not include `node_modules`, so Vite rendering is not run in-container. The focused acceptance test is the in-engine Shift+1 Host Contact Shelf pass described in `HC031F1B_FOCUSED_PLAYTEST.md`.
