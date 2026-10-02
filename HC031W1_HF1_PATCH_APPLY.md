# HC031W1-HF1 — Target Clear Startup Hotfix

**Apply directly over HC031W1 (0.31.54), NOT HC031W or HC031V.** This is a small changed-files-only overlay, not a standalone game. No deletions or `node_modules` changes.

1. Stop the Vite dev server.
2. Extract this ZIP into the BLOB project root, choosing **overwrite/replace** when prompted.
3. Restart Vite and hard-refresh the game (Ctrl+Shift+R in Chrome).
4. Confirm the `intent is not defined` ReferenceError has disappeared, including after Shift+8 cell jump.
5. Optional focused check from the project root: `node scripts/validateHC031W1HF1TargetClear.mjs`.

**Cause:** `TargetingSystem.createEmptyTargetingState()` referenced `intent` without declaring it. The cell transition calls this method through `update() → clearForOwnershipChange() → clearTargetState()`.

**Repair:** derive `intent` locally from `frameState.input` inside `createEmptyTargetingState()`. Preserves the intended LT-sensitive `verbRetargetingAllowed` reporting. No targeting selection/steering, ecology, surface, progression, controller mapping, or telemetry tuning changes.

Note: The in-game build label remains HC031W1 for this one-line hotfix. The HF1 name identifies the overlay, not a new gameplay milestone.
