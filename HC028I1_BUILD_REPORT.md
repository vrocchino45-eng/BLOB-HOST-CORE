# HC-028I1 Build Report — Comb Re-entry + Return Arming Hotfix

## Reported failure
Entering Comb immediately returned the player to Hub, after which Comb appeared unavailable for a reliable revisit.

## Traced cause
The fault is in `LocalCellBoundaryMorphSystem`, not Comb gameplay or HC028I ecology. Comb mounts at the player's arrival position. Its authored return fold sits only **0.75 units** from that entry anchor while the return fold has a **1.45-unit proximity radius**. The generic proximity return therefore considered the player ready to return on the first Comb frame. In addition, completed return-boundary state was not generically reset on later visits, leaving a latent one-shot revisit problem across route returns.

## Repair
- Keep Comb geometry and gameplay unchanged.
- Keep route returns spatial/proximity-resolved; no new A/E return requirement.
- Proximity return boundaries now begin disarmed on a fresh source-cell visit.
- They arm only after the player moves beyond `interactionRange + 0.30`.
- Once armed, returning into the existing fold resolves normally.
- Completed return state resets on each fresh visit to a return boundary's source cell, making revisits genuinely repeatable.

## Locked
HC028I ecology resonance, Tender/Watcher behavior, Hub deliberate destination commit, Comb synthesis gameplay, region composition, Core topology, verbs, movement tuning, chemistry, audio, and telemetry schema remain unchanged.

## Validation
- HC028I1 contract validator PASS.
- Historical HC028I validator intentionally remains identity-bound to `HC-028I` and is not weakened for this descendant hotfix; HC028I1 instead hash-locks 101 untouched runtime owners to the parent tree.
- Recipe-data validator PASS.
- Undefined-method audit PASS.
- Runtime JS syntax PASS.
- Public JSON parse PASS.
- 101 untouched runtime JS owners hash-locked to parent.
- Vite browser render unavailable because handoff package has no local `node_modules`.
