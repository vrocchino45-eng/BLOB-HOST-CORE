# HC-028F1 Build Report — Hub Deliberate Route Commit

## Parent
HC-028F — All Built Region Composition Embodiment

## Problem addressed
The Hub still inherited older activation friction even after the rest of the control grammar had converged. First route departure depended on the legacy Hub investigation completion, outbound Hub boundaries expected Pulse, and post-three-route progression retained the spiral / center / final-Pulse convergence. This made the Hub behave like another puzzle rather than an orientation space.

## Implemented
- All four outbound Hub boundaries now use **A/E deliberate commit**: Grave, Vascular, Silt and Comb.
- Hub commitment is authored through the existing `DeliberateCommitmentSystem`; A was not restored as generic interact.
- A route offer appears only when the Hub foundation is readable, the destination is awake/prepared, and the Core is physically near that route body.
- The existing `LocalCellBoundaryMorphSystem` owns the consequence and performs a short non-teleport guided approach toward the route mouth before the destination cell becomes active.
- Manual movement yields only during that short deliberate guided approach.
- Hub outbound entries are repeatable after a return so the visible A offer can never become a false one-shot interaction.
- First Grave departure no longer requires completion of the old Pulse-all-routes Hub investigation.
- After all three actual route consequences have returned, the Hub resolves them into the Comb selector automatically; the old mandatory spiral/final-Pulse convergence is retired as a progression requirement.
- Route returns remain spatial/proximity-resolved.
- Hub presentation now emphasizes the currently commit-ready route body rather than relying on HUD text.

## Locked
18 gameplay/composition/control owners are SHA-256 locked to HC-028F, including Grave/Vascular/Silt/Comb/Aperture gameplay owners, 3→6→12 Core engine, verb systems, HC028D2 commitment owner, input/control map, Host rhythm/composition, resonance, audio reference, Surface and Guide gameplay.

## Runtime diff
No runtime module was added or removed. Runtime source count remains **98**.

Intentional runtime changes:
- `src/hub/HubChamberFoundationSystem.js`
- `src/hub/HubInvestigationGameplaySystem.js`
- `src/morph/LocalCellBoundaryMorphSystem.js`
- `src/morph/LocalCellBoundaryRecipeRegistry.js`
- `src/player/PlayerMovementController.js`
- `src/systems/ObjectiveSystem.js`
- `src/guide/GuidePromptSystem.js` prompt fallback cleanup
- `src/ui/PlaytestHudSystem.js` diagnostic fallback cleanup
- `src/main.js` build identity only

## Validation
- HC028F1 contract validator: PASS
- RecipeDataSystem load validation: PASS
- undefined `this.method()` audit: PASS
- all **98** runtime JS files: `node --check` PASS
- all **374** public JSON files: parse PASS
- parent lock hashes: PASS

Vite render was not executed because the handoff package does not contain local `node_modules`.
