# HC031R — Vascular Relationship Currentization

## Parent
HC-031Q — Return Consequence Canonicalization

## Mode
Convergence / existing-area currentization. Vascular is migrated in place; it is not rebuilt.

## Why this pass exists
The HC031Q full playthrough proved the current runtime can already traverse the complete Act-1 structural chain through Grave, Vascular, Silt, Comb, and into Aperture Fields. The Vascular audit found a narrower problem: Vascular's anatomy, flow, rhythm, recovery, return current, retained Core/Hub consequence, and boundary plumbing are useful, but the route's three progression reads still depended on a hidden cadence-window timing check driven directly from route-local input.

HC031R keeps the route's identity while rebinding its completion language to the HC031 physical grammar.

## Canonical law
- **Stabilize establishes / holds the living-current relationship.**
- **Pulse projects through that relationship.**
- **Rhythm alignment changes read quality and synchronization gain only.**
- **Rhythm is not a hidden permission window.**
- **Absorb remains a non-gating draw-wake expression of the current.**

Vascular current is an environmental relationship surrounding the Core. HC031R does not create a noun-targeting exception or modify `TargetingSystem`; aim remains authoritative for targetable nouns.

## KEEP
- Existing Catmull-Rom vessel path and three authored valve depths.
- Existing charge/current visual language and Host rhythm composition.
- Existing flow forces and PlayerMovementController authority.
- Existing turbulence, circulation integrity, and recoverable Stabilize behavior.
- Existing route depth and final settling requirements.
- Existing outward return-current reversal and return fold.
- Existing `LocalCellBoundaryMorphSystem` crossing/history ownership.
- Existing Vascular retained consequence on Core and Hub.
- Existing Vascular relay ecology.

## REBIND
The three route reads are now canonical current-relationship reads:

1. Reach the next authored valve while inside the living current.
2. Hold Stabilize briefly to establish the current relationship.
3. Pulse through that relationship.
4. Lock exactly one read.

A Pulse without the relationship does not advance the route even if it is perfectly aligned to the old cadence window.

A valid Stabilize→Pulse read **does** advance the route outside the old cadence window. Beat alignment is retained only as a quality modifier.

## Compatibility
`lockedCadenceReads` and `requiredCadenceReads` remain published as compatibility aliases so ObjectiveSystem, route history, CoreGrowth, Hub consequence, saves/debug surfaces, and older consumers do not need a migration at the same time.

Canonical new fields include:
- `relationshipReads`
- `requiredRelationshipReads`
- `relationshipReadSequence`
- `currentRelationshipHeld`
- `currentRelationshipReady`
- `currentRelationshipSeconds`
- `activeValveDistance`
- `lastRelationshipReadBeatAligned`
- `lastRelationshipReadQuality`
- `lastRelationshipReadChord`
- `unboundPulseCount`
- `currentization`

## Player-facing language
Vascular HUD / next-action language now describes:
- riding to the next valve,
- establishing the current with Stabilize,
- projecting through it with Pulse,
- settling the retained current before return.

It no longer instructs the player to hit a precise bright beat as progression permission.

## Telemetry
Schema: `blob.session.telemetry.v1.41`

New read-only events:
- `vascular.relationship_read`
- `vascular.relationship_route.completed`

A relationship-read event records:
- read count / required count
- environmental-current relationship source
- `stabilize_then_pulse`
- beat aligned yes/no
- read quality
- chord
- active-valve distance
- route depth
- synchronization / integrity / turbulence
- explicit `inputTimingGate:false`

## Locked / forbidden scope
HC031R does not change:
- global movement or attachment
- global targeting
- global verb strength
- Hub route ordering
- Grave gameplay
- Silt gameplay
- Comb gameplay
- Aperture gameplay
- controller mapping
- abilities
- route crossing ownership

18 neighboring gameplay owners are SHA-256 locked unchanged.

## Validation
`npm run validate:current` passes:
- HC031R relationship-currentization validator
- syntax checks
- RecipeDataSystem validation
- undefined-method audit

The focused validator proves:
- aligned Pulse without Stabilize/current relationship cannot advance a read;
- all three Stabilize→Pulse reads can succeed deliberately outside the legacy beat window;
- the legacy cadence alias remains synchronized with canonical relationship reads;
- existing depth/coherence/settle rules still form the return current;
- Vascular does not cross its own boundary;
- telemetry v1.41 records causal relationship reads;
- 18 neighboring owners remain unchanged.

## Next
Focused Vascular playtest. If the route reads naturally and telemetry records three relationship reads followed by one currentized completion and a normal Hub return, HC031R locks. Then HC031S audits/currentizes Silt using the same KEEP / REBIND / RETIRE method.
