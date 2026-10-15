# LS1D1D0 — Material Identity Foundation (changed files only)

Apply paths at repository root on **LS1A-Silt-Habitat-Foundation** after LS1D1C. Preserve all existing files.

Adds an engine-independent identity ledger for the eight existing Silt grains. Origin signature, mass and composition remain stable when grip ownership changes. The route publishes the identity snapshot in existing route telemetry; it does not spawn objects, change grip selection, camera, movement, or chemistry.

Run `node scripts/validateLS1D1D0MaterialIdentity.mjs` and `node scripts/validateLS1D1CCameraAim.mjs`.

**Important:** This is the first contained subpass, not complete LS1D1D. Camera crosshair lock and Silt grip still have separate target authorities; do not treat the crosshair as proof of grip selection yet. Next subpass converges target IDs, then adds fragment ownership. No new gameplay was asserted as tested.
