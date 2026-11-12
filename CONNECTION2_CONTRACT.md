# CONNECTION2 — Vascular coherence response candidate

Status: proposed model/contract, not implemented. November 10, 2026.

## Pass title, mode and milestone

**Title:** CONNECTION2 — test one Core-to-tissue response. **Project:** BLOB: HOST CORE. **Mode:** Audit/model first; Feature implementation is a subsequent bounded step if the comparison passes. **Milestone:** make the accepted R3/R4/R5 subset more coherent toward R6. **Purpose:** determine whether the already-published Stabilize coherence can produce a useful, bounded difference in Vascular directional calming without duplicating player handling or changing goal permissions.

## Ownership and allowed scope

CoreEmbodimentSystem remains placement authority. CoreRadialPerformanceSystem remains physiology/reserve authority. VascularRhythmRouteSystem reads the existing publication and remains the only owner of this local current response. PlayerMovementController remains the movement consumer. HostConditionSystem, authenticated Silt effects, progression and the Core engine keep their existing responsibilities.

Model scope: actual owner comparisons plus a temporary, explicitly identified candidate function outside normal startup. Later implementation scope: Vascular's directional current calculation and a small diagnostic publication of the factor actually applied; existing flow visualization may consume actual flow. No new update owner, registry reordering, region table, chemical material, stronger phase-six power or duplicate stamina modifier.

Inspect before implementation: updateTraversalMaterialResponse, applyDynamicCurrent and every traversalStabilizeCalm reader; the existing radial coherence publication; CoreTopologyEnvironmentalHandling; movement's topology suppression and verb environmental-flow multiplier; Host/Silt factor separation; Core Work input suppression; B03 source navigation and return bot behavior.

## Candidate law to compare

Keep the existing 0–1 traversal calm envelope, its input/proximity eligibility and rise/decay timing intact. Do not multiply or accumulate a new factor into that stored envelope, since presentation and other code already consume it.

For eligible world Stabilize inside the Vascular living current, with an active valid radial publication:

    coherenceFactor = clamp(published stabilize coherence, 0.85, 1.15)
    directionalCalm = 1 - 0.34 * existingCalmEnvelope * coherenceFactor

Use directionalCalm in the one existing Vascular directional-flow multiplication. Do not apply the factor a second time in player movement. Keep swirl's existing 0.68 calm law unchanged in this first scope. Keep existing Pulse, Absorb, rhythm, Silt receipt and Host pressure factors separate and multiplicative.

The [0.85, 1.15] range is a modelling candidate, not a locked gameplay coefficient or a result shipped by CONNECTION1. Missing/inactive/non-finite physiology, inactive local eligibility and Core Work yield factor 1. Preserve the old response law and envelope decay in those cases; do not make missing data a penalty. Coherence exactly 1 and a disabled candidate must reproduce the old calculation exactly. Balanced placement is not arbitrarily forced to 1: use the actual existing published value if the candidate is enabled.

At a full calm envelope the candidate directional factor ranges 0.609–0.711 around the existing 0.66. That is algebra for comparison, not a measured player speed or success-rate claim. Deep would generally get stronger local calming and membrane weaker local calming from their existing coherence. Fatigue may change that relationship over time; do not hard-code a permanent placement ranking under unequal reserve histories.

## Locked and forbidden scope

Lock all existing goals, valve ranges, 0.18-second source relationship, 2-second handoff travel, 0.75-second receiver settle, target selection, first-visit cadence windows, credits, duplicate guards, six-phase unlock, paired reserve law, Silt mass/contact/seat/native return, Guide, world/Core Work controls, camera, movement model, audio level and return folds.

Do not alter those rules to accommodate a bot. A bot failure is diagnosed using state and path traces before changing the game. Preserve declaration of prior-progress, topology, pose or reserve fixtures.

Delete/disable targets: none currently identified. An experimental candidate stays outside normal boot until accepted. Do not leave an old and new current writer active together.

## Visual and feel targets

The tissue/current should respond to the Core the player actually assembled. Deep should offer a steadier local hold, membrane should keep its faster-output/higher-consumption character, and mixed placement should remain viable. Existing Core/world feedback should agree with actual flow. No extra permanent HUD panel, invisible timing gate, random misfire or mandatory optimal build.

If the candidate is too subtle, overwhelming or redundant alongside existing Core handling, record that finding and revise or reject the candidate. A changed number alone does not justify implementation. Human comparison remains required before calling its feel accepted.

## Acceptance and bot matrix

| Check | Required comparison or failure case |
| --- | --- |
| W01: owner response | Four placements × full/low fixed reserve × neutral/peak Host × absent/present authenticated Silt load, with matched Stabilize on/off comparisons. Use the actual published coherence and current owner. Distinguish fixed-reserve fixtures from naturally exhausted play. |
| Neutral parity | Candidate disabled, coherence 1, missing/inactive profile, malformed value, no Stabilize, outside living-current range and Core Work preserve the specified old law. No extra current from invalid data. |
| Bounds and recovery | Finite positive directional factors; no reversal, no accumulation on repeated frames; zero dt cannot advance the envelope; release decays normally; reload does not promise saved state. |
| Cause separation | Host pressure stays an independent maximum 3% current reduction; Silt authenticated load/cursors/receipts stay identical. A coherence response emits no Silt, Vascular-applied-Silt or Grave receipt and no credit/material. |
| Existing verb combinations | Stabilize alone, Stabilize + Absorb, and real released Pulse overlap retain their existing other factors. New coherence is applied once to directional calm only; no swirl, target, charge, cost or goal-threshold change. |
| W02: combined movement | Feed actual current through the existing topology reception, generic verb-flow, pressure and slip chain. Measure with/against-current motion and recovery, full/low reserve, plus existing reachability/Hub suppression. Never infer player motion from the local flow scalar alone. |
| Placement/mode boundary | Retain registry order and its prior-publication cadence. Compare entry/exit from Core Work, placement changes, neutral/incomplete topology, world return and held-input interruption; no stale enhanced factor or deferred impulse replay. |
| W03: running browser | Observe actual Core publication → local factor → current → movement-facing output, render/feedback consistency, and mode return. Record any topology/pose/history fixtures. Preserve real input path and report browser errors. |
| Integration regression | Affected owner checks plus the complete B03 regional goal → six-phase → Hub → reserve/Core Work arc. Preserve mass eight, single completion publication, no duplicate credit. B01/Host and B02/Silt checks are selected when their affected contracts or unresolved behavior warrant them; full suite at the integration closeout. |
| Human comparison | Short normal play using actual Core placement controls, without debug-number coaching. Confirm useful directional-calming difference, readable cause and retained traversal freedom. Keep recordings under 25 minutes if one is needed. |

The W01/W02/W03 names reserve a test grouping for this candidate; they are not existing passing Bot Series 1 cases. Keep the current D/M/G/H/T/P/B groups and checkpoint history unchanged.

## Implementation sequence and release decision

1. Build the matched disabled/enabled candidate model outside production. Measure isolated local response and combined player-motion consequences against existing source, recording topology, reserve, input, Host phase, Silt load and safe-dt assumptions.
2. Reject or revise any candidate that requires changed goals/controls, hides doubled handling, makes return navigation unreliable, or provides no useful distinction. Model success is permission to continue the bounded implementation, not human acceptance.
3. Implement through the existing Vascular owner only; add the diagnostic factor from the actual calculation. Include affected bot cases with that implementation, not as a later cleanup pass.
4. Run the affected checks and B03, investigate any control-driver failures separately, then perform the planned readability/human comparison and integration closeout before anatomy expansion.

**Notes for later passes:** Absorb and Pulse may merit separate measured tissue-response contracts after this one proves useful. Mutable macro Host recovery, new chemical identities, earned twelve-phase and new anatomy remain outside this candidate.
