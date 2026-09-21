# HC019A — Route State / Transition Authority Audit

## Mode
AUDIT ONLY. No gameplay behavior is changed in this pass.

## Why this pass exists
The HC018E playthrough showed two things that must be separated before further implementation:
1. BLOB's newer material/verb language is improving, but progression is still largely recognized by route/objective state.
2. One route endpoint returned to Hub too readily. HC018E HOTFIX1 added a deliberate return re-arm guard, but we should not assume that proves every return path is clean.

## Proven architecture
`LocalCellBoundaryMorphSystem` is the crossing/return authority. Grave, Vascular and Silt publish route truth; boundary recipes decide when an active-cell crossing is allowed. This separation should remain locked.

The HOTFIX1 return guard is present in the audited checkpoint:
- readiness dwell
- interact-release frame
- fresh interact press

## Main conclusion
Do **not** replace the transition system in HC019B.

Instead, convert one early-route obstacle so the route's completion/objective truth is caused by a physical material-state result:

player action
→ material state change
→ environmental/traversal consequence
→ objective observes that result
→ existing boundary system permits crossing

That is the smallest change capable of replacing the old 'reach trigger / satisfy flag / proceed' feel without destabilizing the runtime.

## HC019B locked scope
One obstacle in the first-playable route only.

Forbidden:
- new regions
- new verbs
- new crossing owner
- global route rewrite
- new persistence/progression database
- chemistry expansion

## Return-to-Hub regression requirement
The next playable build must explicitly test:
- arriving at a return fold does not leave automatically
- the action that completes route gameplay cannot also trigger return
- a released Interact frame occurs before return is armed
- only a new deliberate Interact triggers crossing
- route identity before and after crossing is visible in debug telemetry

## Acceptance
HC019A passes when it produces an auditable authority map and leaves gameplay byte-identical to HC018E HOTFIX1.
