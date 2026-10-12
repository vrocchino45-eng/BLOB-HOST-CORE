# LS1A2 — Build and test report

## Source baseline
Reconstructed archived `BLOB-HOST-CORE.zip` + W2A performance chain + W2B3.1 visual chain + optional HXP2A1 + LS1A. This is not a direct read of the user's latest local Git checkout. Deliver only the three-file code delta above.

## What changed
- Existing Silt habitat membranes/folds, isolated filler pebbles and thin connector strands replaced **within `SiltPressureRouteSystem`**, without a new render owner.
- Three irregular, inward-facing stone cavity surfaces; explicit triangle apertures at each authored throat junction so no false sealed visual doorway; overlapping hollow seep connections.
- Continuous spine stone liner along the original pressure path, three deposited sediment beds and twelve large irregular peripheral stone inclusions.
- 96 pooled, *visual-only* grains, driven from authored seeds; positions recomputed from absolute time, with no allocation or spawning each frame.
- Near-wall fade to keep the locked visual hierarchy legible, no global lighting or camera changes. Region-only diagnostics identify LS1A2.
- Old Silt authored path, controller envelope, verbs, pressure route, yellow packet, failure/recovery, progression and Hub fold untouched. No physical rock colliders introduced.

## Automated checks — PASS
- `validateLS1A2SiltContainedGeologicMedium.mjs`: **23 meshes, ~6,916 triangles**, one Points draw object for 96 reusable grains; all authored LS1A centers and connections inside original Silt controller boundary; ray tests verify stone mesh openings at every authored cavity connection; 20-minute sampled visual animation never grows geometry/particle count or compounds wall scale; no matter/progression introduced; geology disappears on cell unmount.
- `validateLS1ASiltHabitatFoundation.mjs`: old Silt pressure/Stabilize/Pulse/Absorb/return and single credit, spatial envelope, all habitats reachable, total geometry limits PASS.
- `validateHC016VSiltSpatialExpansion.mjs`: original 24.20-unit pressure path and rule locks PASS.
- W2B2, W2B3, W2B3.1 visual grammar checks PASS.
- HXP2A1 retained Hub material check PASS, including optional overlay.
- W2A5.4 GPU-primed live admission; HC031W1 HF1 target-clear; HC031W1 stabilized aim/local contact smoke; HC031U2.1 intent latch; RecipeData load; undefined-this-method audit PASS.

## Not claimed
No interactive browser/GPU/controller test was performed here; player needs to confirm composition, actual movement, and whether masses look like stone/silt instead of an overlay. Geologic surfaces do not have authoritative solid collision (the preexisting PlayerMovementController ellipsoid still owns outer movement bounds), so camera/player occlusion and apparent walk-through remain acceptance risks. Full Linux production build is not certified from the archived Windows dependencies; no production-build success claimed. No regenerating matter, simulation ledger, or independent ecology in this pass.

**Decision:** candidate for LS1A2 human acceptance; do not start LS1B physics until the larger visual geography reads correctly.
