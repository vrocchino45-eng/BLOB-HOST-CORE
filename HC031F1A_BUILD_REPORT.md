# HC031F1A Build Report — Surface Truth + Pull Readability

## Why this pass exists

The HC031F1 playtest proved that tendril anchors can mechanically influence the Core, but also exposed two failures: the Core could sink through a visible surface because attached stand-off still followed the older ellipsoid boundary, and continuous translation often remained visually stronger than the plant/load/pull cadence.

HC031F1A corrects those two failures without expanding traversal scope.

## Runtime changes

1. Added `CoreSurfaceTruthSystem`, a bounded local visible-mesh sampler. It publishes one nearby visible surface point/normal and owns no movement, adhesion, collision, route, or progression state.
2. Runtime order is now `CoreSurfaceTruthSystem -> PlayerMovementController -> CoreTendrilSurfaceContactSystem`.
3. `PlayerMovementController` prefers the visible local surface normal/point for attached tangent motion and stand-off correction. The authored ellipsoid remains the fallback/safety envelope.
4. Visible attached stand-off is ~0.38 world units and corrects only along the local surface normal.
5. Attached raw stick thrust is reduced from 12% to 4%; input is now primarily intention.
6. Newly sealed forward anchors receive a short stronger load pulse. Mature anchors retain lower continuous traction.
7. If no useful forward anchor is planted, the Core now hesitates while a tendril seeks/replants instead of continuing to skate.
8. Tendril anchors use the same local visible contact plane as movement when surface truth is valid.
9. Replant cadence is slightly tighter (`stepDistance 0.18`, `maxStretch 0.54`) so the load-transfer cycle is easier to perceive.
10. The current load-bearing tendril receives a subtle tension/emissive emphasis.
11. `CoreEmbodimentSystem` uses the same visible surface normal for contact deformation and adds a bounded ~6.5% directional stretch toward the currently loaded anchor. It never moves `playerRoot`.

## Scope intentionally not added

No manual tendril controls, colliders, navmesh, edge-wrap solution, arbitrary wall/ceiling traversal guarantee, chemistry adhesion redesign, targeting/Bond changes, verb changes, Grave changes, combat changes, progression changes, or regional-history synthesis.

## Validation

- HC031F1A contract: PASS
- RecipeData load: PASS
- undefined `this.method()` audit: PASS
- runtime JS syntax: 125/125 PASS
- JSON parse: 471/471 PASS
- relative import resolution: PASS
- 15 locked gameplay/runtime/visual owners: byte-identical to parent
- numeric visible stand-off correction proof: PASS
- numeric fresh-load / no-forward-anchor cadence proof: PASS
- runtime source delta from HC031F1: 6 files

## Render limitation

The archive does not include `node_modules`, so the Vite scene could not be rendered in-container. The next acceptance item is therefore visual/feel confirmation from a short playtest on one broad visible surface and one slope.
