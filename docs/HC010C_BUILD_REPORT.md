# HC-010C Build Report

## Grave Ownership + Screen-Truth Lock

HC-010C repairs the ownership and visual-proof faults exposed by the live HC-010B screenshots. It does not add route breadth or change the retained Grave consequence circuit.

## Prompt and flow ownership

- `GuidePromptSystem` remains the single selection authority.
- The active cell overrides the previous ModeController mount during the exact GateSystem crossing frame.
- A region change clears prompt hold state and republishes one destination-owned prompt in the same update.
- Grave content is owned by `GraveMemoryRouteSystem`; Hub content is owned by `HubChamberFoundationSystem`.
- Hub unmount publishes an inactive foundation, clears its readability state, and releases any retained Hub prompt claim.
- `PlaytestHudSystem` and `RuntimeDiagnosticSummary` prioritize the active authored region, preventing stale Hub or Guide state from winning in Grave.
- Internal stage identifiers remain F1-only.

## Screen truth

`HubChamberFoundationSystem` still owns presentation truth, but its claim now requires projected evidence under the authored exploration camera:

- every route center is in view;
- every territory silhouette has at least the authored visible fraction;
- minimum route-center separation is at least `0.25` normalized screen units;
- maximum projected territory overlap is at most `0.48`;
- distant-Host viewport coverage remains below `0.33`;
- all physical, ownership, target, and screen checks remain true for six stable samples.

World-space spacing alone can no longer satisfy readability. Turning the camera away, collapsing projected territories, or enlarging the distant Host blocks the latch.

## Preserved architecture

- Surface Wake, Guide Threshold, and Hub budgets remain `15`, `13`, and `8`.
- Grave remains the six shared systems plus one `GraveMemoryRouteSystem`: budget `7`.
- `GateSystem` alone owns Hub entry and return.
- HC-010B remains the consequence-circuit owner.
- No new objective, ability, class, route, entity, cell, or updater was added.
- All 20 compatibility systems remain archived and unregistered.

## Verification

- Adversarial prompt-ownership and screen-truth simulation.
- Retained HC-010B consequence proof and HC-010A crossing proof.
- Complete inherited regression chain.
- Recipe/data validation and undefined-method audit.
- Production compile and served-output smoke test.
- Archive identity and compressed-entry integrity.
