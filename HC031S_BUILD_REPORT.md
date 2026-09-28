# HC031S — Silt Pressure Relationship Currentization

## Parent
HC-031R — Vascular Relationship Currentization

## Mode
Convergence / existing-area currentization. Silt is migrated in place; it is not rebuilt.

## Why this pass exists
HC031R proved that an existing route can keep its authored anatomy and identity while moving its internal permission logic onto the modern HC031 relationship grammar. The next audit found the same opportunity in Silt: its compressed path, five living ribs, pressure field, porous-vs-packed appetite pocket, recoverable squeeze, deep release organ, return breath, retained pressure/density consequence and boundary plumbing are already useful. The outdated part was the first pressure read: a route-local Pulse inside a hidden progress/range band could set `pressureRead` by itself.

HC031S removes Pulse-alone permission while preserving Silt's distinct identity.

## Canonical law
- **Stabilize establishes / holds the environmental pressure relationship.**
- **Pulse projects through that relationship to read compression.**
- **The same Stabilize hold continues naturally into bracing the living ribs.**
- **Absorb remains appetite / inward draw. The player physically approaches the matter body they intend to draw.**
- **Packed residue still produces a recoverable squeeze; learned pressure/brace state is not erased.**
- **The existing deep release still forms `return_breath`; Silt does not cross its own boundary.**

Silt pressure is an environmental relationship surrounding the Core. HC031S does not modify `TargetingSystem` or create a noun-targeting exception.

## KEEP
- Existing expanded compressed Silt path.
- Five authored asymmetric living ribs.
- Tight → open appetite pocket → tight spatial grammar.
- Existing pressure/compression physical feel.
- Existing porous nutrient and two packed-residue bodies.
- Existing selective appetite consequence.
- Existing recoverable compression failure and Stabilize recovery.
- Existing deep pressure-release organ.
- Existing outward `return_breath` and return fold.
- Existing `pressure_density` return consequence in Core/Hub recomposition.
- `PlayerMovementController` movement authority.
- `LocalCellBoundaryMorphSystem` crossing/history authority.

## REBIND
The first Silt read now uses the common physical grammar:

1. Enter the authored low-rib pressure-reading band.
2. Hold Stabilize briefly to establish the environmental pressure relationship.
3. Pulse while Stabilize remains held.
4. Lock the pressure read.
5. Continue holding Stabilize to brace/release the ribs.

A Pulse without the pressure relationship cannot set the read.

## Appetite choice in HC031S
HC031S intentionally keeps the appetite pocket as a **spatial-body choice** rather than widening scope into global targeting:

- physically approach the warm porous body and hold Absorb to receive it;
- physically approach packed residue and hold Absorb to trigger the existing recoverable squeeze;
- Absorb does not retarget the global aim owner;
- `TargetingSystem` remains hash-locked unchanged.

If the focused playtest still feels like Absorb is choosing for the player rather than the player choosing matter, that becomes a separate HC031S1 attention-ownership pass. S does not speculate ahead of playtest evidence.

## Compatibility
Existing fields remain available for route history, Core growth, Hub consequence, saves/debug surfaces, and older consumers:
- `pressureRead`
- `pressureReadCount`
- `ribsReleased`
- `safeMatterAbsorbed`
- `compressionFailure`
- `failureCount`
- `failureRecovered`
- `returnFoldReady`

Canonical new fields include:
- `pressureReadSequence`
- `pressureRelationshipHeld`
- `pressureRelationshipReady`
- `pressureRelationshipSeconds`
- `minimumPressureRelationshipHoldSeconds`
- `lastPressureReadChord`
- `unboundPulseCount`
- `appetiteDrawSequence`
- `lastAppetiteDrawKind`
- `appetiteSelectionMode`
- `currentization`

## Player-facing language
Silt HUD / next-action language now describes:
- catching pressure with Stabilize;
- Pulsing through a held pressure relationship;
- keeping the same Stabilize hold to brace living ribs;
- physically approaching porous matter before Absorb;
- recovering packed-residue compression without losing learned state.

It no longer tells the player that one naked Pulse is the pressure-reading solution.

## Telemetry
Schema: `blob.session.telemetry.v1.42`

New read-only events:
- `silt.pressure_relationship_read`
- `silt.selective_draw.completed`
- `silt.relationship_route.completed`

These expose the actual causal chain without feeding back into gameplay.

## Locked / forbidden scope
HC031S does not change:
- global movement or attachment
- global targeting
- global verb strength
- Hub route ordering
- Grave gameplay
- Vascular gameplay
- Comb gameplay
- Aperture gameplay
- controller mapping
- abilities
- route crossing ownership

19 neighboring gameplay owners are SHA-256 locked unchanged.

## Validation
`npm run validate:current` passes:
- HC031S pressure-relationship validator
- syntax checks
- RecipeDataSystem validation
- undefined-method audit

The focused validator proves:
- Pulse alone inside the correct Silt read pocket cannot set the pressure read;
- Stabilize establishes the environmental pressure relationship;
- Stabilize→Pulse sets exactly one pressure read;
- the same Stabilize hold can continue into the existing rib brace;
- packed residue still produces recoverable compression without erasing the read/brace;
- Stabilize still recovers the worst state;
- porous matter can still be deliberately drawn by spatial approach;
- packed residue remains intact;
- the existing deep release forms `return_breath`;
- Silt does not cross its own boundary;
- telemetry records read → selective draw → route completion causality;
- 19 neighboring gameplay owners remain unchanged.

## Next decision
Focused Silt playtest. If the route reads naturally and telemetry records one pressure relationship read, one selective porous draw and one route completion with a normal Hub return, HC031S locks. Then the next planned currentization target is Comb, unless Silt playtest evidence specifically proves that the appetite pocket needs an S1 aim/attention pass first.
