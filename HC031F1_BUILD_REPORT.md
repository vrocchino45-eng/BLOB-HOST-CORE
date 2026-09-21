# HC031F1 Build Report — Attached Pull Prototype

## Purpose

HC031E/HC031E1/HC031E2 established readable, unified suction-tendril anatomy but deliberately kept the tendrils presentation-only. HC031F1 crosses that boundary in a controlled way: planted anchors now mechanically influence attached surface movement without transferring translation ownership away from `PlayerMovementController`.

## Runtime changes

1. `CoreTendrilSurfaceContactSystem` now prefers current desired surface-tangent motion when choosing the forward basis for new anchors.
2. It publishes all three tendril anchor states, including world-space anchor positions, seal state, stretch, support count, traction envelope, and handoff state.
3. `PlayerMovementController` consumes that request on the next frame. This preserves deterministic owner order: movement first, contact/anchor publication second.
4. While an attached tendril request is active, raw stick thrust is reduced to 12% and used mainly as steering intention.
5. The movement owner chooses the sealed anchor most aligned with current tangent intent and blends the pull direction toward that physical anchor.
6. Two or more sealed supports provide full support; one support is deliberately weaker.
7. Peel/reach handoff reduces traction to 72%, making the Core visibly hesitate during load transfer without hard-stopping.
8. No-input attached movement damps tangential velocity to create a suctioned rest state.
9. Attached stand-off is now resolved in world units (~0.30) against the same trusted authored ellipsoid rather than relying on one fixed normalized shell value.
10. Tendon curvature and sucker size were slightly tuned toward softer load-bearing anatomy while preserving the HC031E2 visual family.

## Explicit non-goals

HC031F1 does not add new buttons, manual tendril selection, raycasts, colliders, mesh-surface pathfinding, wall/ceiling guarantees, edge wrapping, chemistry-material adhesion differences, route gates, combat changes, targeting/Bond changes, or regional-history synthesis.

## Validation

- HC031F1 attached-pull contract: PASS
- RecipeData load: PASS
- undefined `this.method()` audit: PASS
- runtime JS syntax: PASS (124/124)
- JSON parse: PASS (469/469)
- relative import resolution: PASS
- 17 locked parent gameplay/runtime/visual owners: byte-identical to HC031E2
- numeric traction cadence proof: PASS
- supported pull remains bounded; handoff traction is lower but nonzero; world-space stand-off resolves inside the trusted shell

## Runtime-render limitation

The checkpoint archive does not include `node_modules`, so the Vite scene was not rendered in-container. Controller feel, anchor cadence, and visual traction remain playtest acceptance items.
