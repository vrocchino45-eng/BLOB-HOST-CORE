# LS1D1A — Isolated Grip Authority (not gameplay integrated)

This is a deliberately limited first patch: a pure state authority plus focused validator. It does **not** wire into GameRuntime, input dispatch, SiltLivingMaterialCycle, scene meshes, or HUD. No in-game grip is available after applying this patch alone.

Merge paths at repository root and run:

    node scripts/validateLS1D1AGripAuthority.mjs

Next integration must coordinate: A press precedence with DeliberateCommitmentSystem; suspend selected unit progression in SiltLivingMaterialCycle without changing unit count/mass; route draw position override; deterministic release into cycle; Living HUD state; regression checks for ordinary A and Core Work A.
