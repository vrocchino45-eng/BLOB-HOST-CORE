# HC-028D2 Build Report — Deliberate Commitment Grammar

## Purpose
HC-028D2 makes the A/E control semantically distinct from movement and the three Core verbs. The pass does not add a new A mechanic. It removes generic A requirements where the existing world/verb grammar can already express the outcome.

## Implemented
- Added `DeliberateCommitmentSystem` as a non-authoritative intent interface.
- World A/E now reports `commit_reserved`; an unoffered press has no gameplay consequence.
- Signal Plain receptors become read only after their embodied Absorb / Pulse / Stabilize response actually occurs. A no longer marks them observed.
- Ambient material inquiry is now carried by Pulse. A no longer performs a generic scan/read.
- Grave→Hub, Comb→Hub and Aperture→Comb completed return folds now use resolved proximity traversal, matching Vascular/Silt return behavior.
- Core Work keeps A/E for grab/place because internal placement is an intentional arrangement action. Core Work entry remains D-Pad Down / G.
- Stale route/camera/Guide action text was updated to match the live mapping.
- Session telemetry advances to `blob.session.telemetry.v1.5`, distinguishing `action.commit_pressed` from `action.deliberate_commitment`.

## Control grammar
- Movement: where do I put myself?
- Pulse / Absorb / Stabilize: how do I physically relate to this?
- A / E: what meaningful or persistent choice am I deliberately making?
- Core Work A / E: intentional internal grab/place arrangement.

## Locked systems
HC-028D1 verb-engine coupling, HC-028D Core/world resonance, Core engine sequencing, 3→6→12 gyroscopic presentation, Vascular rhythm, movement/convergence reachability, Vascular/Silt route gameplay, targeting, chemistry and verb strength remain outside D2 authority.

## Validation
- HC028D2 deliberate commitment validator: PASS
- RecipeData load validation: PASS
- Undefined `this.method()` audit: PASS
- Runtime JS syntax: PASS
- Public JSON parse: PASS
- Parent lock hashes for 11 untouched owners: PASS

## Production note
The package does not contain local `node_modules`, so a Vite production render is not part of container validation.
