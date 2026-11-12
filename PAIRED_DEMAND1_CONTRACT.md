# BLOB: HOST CORE — PAIRED-DEMAND1

November 9, 2026. Mode: physiology ownership audit, offline comparison and next-pass contract. Status: proposed, numerically exercised, not implemented in the game or accepted in human play. Current production remains CORE-READ1 on the accepted SILT-MODE1 / Silt II baseline. No installation.

## Player problem and intended behavior

The earned six-phase architecture currently changes sequencing and presentation without a physiological consequence. Use its counterpart structure to support concurrent verb work: after earning six-phase, combining existing functions should consume reserve slightly more efficiently. A single function keeps its existing demand. Six-phase does not increase peak output, extend targeting, remove commitment movement penalties, grant material or finish objectives.

CoreRadialPerformanceSystem already owns reserve, recovery, radial traits and fatigue-dependent performance modifiers. It is the narrow owner for this proposed effect. CoreEngineSystem continues to consume progression and sequence phases; it must not become a second reserve owner. CoreEmbodimentSystem remains the placement source. ReturnRegionEngineSystem remains the sole credit/unlock owner.

## Inspected existing law

Deep placement favors reserve, recovery and stability; membrane favors response/output with higher consumption and risk; inner favors control. Existing simultaneous verb demand is multiplied by the composition demand multiplier, combined with boost demand and capped at one. Reserve drain then depends on the radial capacity/efficiency profile. Reserve subsequently affects fatigue-dependent verb and boost modifiers.

The existing radial owner is independent of architecture: identical input/topology produces identical reserve at three and six. Registry order already publishes progression before both Core engine and radial performance, so the proposed consumer need not reorder systems.

Do not erase the diesel/race/control distinction. Do not call this new chemical material simulation: it is a first physiological consequence of the earned engine architecture, using existing Core placement and reserve.

## Rejected version

An initial in-memory model discounted only the secondary contribution before the existing demand cap. In a five-second paired hold with composition multiplier 1.2, the eventual demand still saturated at one in all tested placements. Reserve gains were below half a percentage point in Deep/Inner/balanced and zero in the membrane case (which depleted). It passed boundary checks but failed to provide a useful sustained effect. Do not ship that version or increase its coefficient merely to overpower the cap.

## Candidate law for the next implementation pass

Use actual positive demand contributions already calculated by the radial owner: Pulse release envelope, committed Absorb and committed Stabilize. Held-but-unreleased Pulse must not invent a new demand signal in this pass.

Let S be their sum, M the largest contribution, and sharedFraction = (S − M) / S, or zero when S is zero. Keep the existing capped demand calculation. Apply a bounded coordination factor to reserve drain only:

    coordinationFactor = 1 − 0.20 × sharedFraction
    effectiveDrain = existingDrain × coordinationFactor

The 0.20 coefficient is a prototype tuning candidate, not locked global grammar. For two equal demands this reduces drain by 10%; for three equal demands it reduces drain by 13⅓%. It does not reduce demand to zero or turn drain into recovery. A single contributor gets no discount. Apply the factor after demand capping so it remains observable under saturated verb demand.

Eligibility: complete active radial topology, progression publication unlockedPhaseCount at least six, and boost not held. Use the earned ceiling, not the currently displayed architecture. O preview at an unearned three-phase ceiling grants nothing. Previewing twelve after earning six does not add a stronger factor. Future earned twelve gets at most this same earned-six law until its own contract is defined; this is not new twelve-phase content.

Boost and boost-plus-verbs retain the original drain law in this initial scope. Idle recovery rate, capacity, radial weights, commitment timing, composition multiplier, individual verb costs, peak power and targeting remain unchanged. Existing radial/risk/commitment tradeoffs remain; no separate idle upkeep penalty is proposed.

Conserving reserve can indirectly preserve fatigue-dependent verb/boost performance later. That is an intended consequence of the existing fatigue law, not a promise that all movement outputs remain numerically identical after different reserve histories. At the same reserve and placement, existing modifiers must remain identical.

## Offline measurements

Five active seconds from full reserve, Absorb + Stabilize, composition demand multiplier 1.2, fixed topology, dt 0.02 seconds. These are controlled model results, not gameplay or human-feel claims.

| Placement | Current reserve, 3 or 6 | Proposed earned-six reserve | Difference |
| --- | ---: | ---: | ---: |
| Deep 3:0:0 | 80.22% | 82.04% | +1.82 percentage points |
| Inner 0:3:0 | 63.73% | 67.18% | +3.45 percentage points |
| Membrane 0:0:3 | 14.20% | 22.70% | +8.50 percentage points |
| Balanced 1:1:1 | 63.52% | 67.00% | +3.49 percentage points |

Membrane still consumes reserve much faster than Deep. The larger absolute savings there follow its higher original drain; the formula has no region/zone-specific bonus table.

28 controlled comparisons passed for the candidate: current architecture independence, exact three-phase parity, unchanged idle/single Absorb/boost/boost-plus-verbs, and positive bounded paired drain across four placements. The rejected model also passed those boundary checks, which demonstrates why passing tests alone does not establish useful behavior. The two models use different initial reserves as recorded in their results; compare each model against its own baseline, not absolute values across models.

## Implementation boundary

Purpose: deliver a measurable earned-six effect through the existing reserve owner. Allowed scope: narrow change in CoreRadialPerformanceSystem, its existing publication and minimal existing HUD feedback while coordination is actually reducing drain. Update owner documentation or recipe assertions only if the new legitimate consumer responsibility contradicts an existing description. CoreEngineSystem remains read-only toward gameplay.

Locked systems: accepted regional goals and their completion receipts; credit thresholds and duplicate protection; Silt matter/contact/seat/trajectory; Guide; camera and movement controls; Core placement ownership; geometry and sequencing; audio reference; first returns and Hub connections. No new buttons, hard timing gate, new material, passive credits, Phase III/IV content or save system.

Delete/disable targets: none in production. Offline modified-source imports are test-only and must never be imported by normal startup.

Visual/feel target: during genuine concurrent verb demand, make the reduced drain legible with restrained existing Core/HUD feedback. Do not tie permission to an exact firing slot or rhythm beat. The existing paired visual structure remains the architecture representation. A numerical gain needs a short play comparison before treating feel as accepted.

## Required acceptance and regression cases

1. Preserve exact baseline reserve and publication behavior at the three-phase earned ceiling across single and combined verbs, boost, idle and topology changes.
2. At five credits, O six/twelve previews grant no discount. At six earned credits, actual concurrent demand receives the bounded factor; changing only debug architecture does not change it.
3. Single function, zero demand, incomplete topology, boost and boost-plus-verbs retain their original laws. Pulse overlap uses the real existing release envelope; holding Pulse alone introduces no demand.
4. Verify two- and three-function bounds, nonnegative reserve, no spontaneous recovery under load, no frame-based accumulation and no unbounded state. Test zero dt and existing safe-dt clamping.
5. Preserve capacity/recovery, radial trait ordering, composition cost escalation and all direct modifiers when reserve is held equal. Measure indirect fatigue consequences separately.
6. Publish actual coordination eligibility, factor and effective drain from the reserve owner. HUD must not imply a saving when demand is zero, single-function, disabled by boost or blocked by incomplete topology. Never use presentation as completion proof.
7. Running browser must consume progression from its existing owner, show an eligible versus ineligible comparison and preserve Core inspection/world return. Any prior-progress fixtures must be declared. Full regional gameplay need not be replayed merely to label a reserve comparison.
8. Build, guarded delta installer, affected credit/consumer and reserve regressions must pass. Preserve locked source hashes. Rerun Silt material/Guide tests only if affected source or unresolved behavior justifies them. No long recording request.

Human acceptance is pending because no physiology patch exists yet. The next pass may implement this candidate within these boundaries, measure its effects in the runtime and adjust the prototype coefficient only with recorded evidence. Keep older checkpoints indexed.
