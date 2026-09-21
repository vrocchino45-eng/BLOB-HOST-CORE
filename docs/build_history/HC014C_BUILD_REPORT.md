# BLOB: HOST CORE — HC-014C Build Report

## Pass
Hub → Comb → Aperture Progression Readability

## Purpose
Repair the player-facing readability failure seen in HC-014B screenshots without changing the established progression chain or adding content.

## Changes
- Preserved GateSystem ownership and the existing Hub convergence → Comb → Aperture requirements.
- Quieted prior Hub route corridors, territory backdrops, gates, and central cradle after three-route convergence so they become retained context instead of competing destinations.
- Increased the six-rib Combward body's opacity/emission after convergence, with stronger response when the player is near or inside its actual interaction range.
- Added screenshot diagnostics for active gate distance, interaction range, inside/outside state, expected input, awake state, destination mount, requirements, and playable readiness.
- Added HC-014C runtime profile/manifest identity while retaining HC-014B Aperture scale behavior.
- No ecology, entities, abilities, verbs, combat, crafting, new region, or progression requirement added.

## Acceptance
- `npm run validate:current` passes end-to-end.
- HC-014C focused progression-readability validation passes.
- HC-014B Aperture scale lock and HC-014A arrival boundary validations pass unchanged.
- Undefined-method audit passes.
- Production build passes.

## Player test
After three-route convergence in Hub, the Combward body should now dominate the composition. In the left debug panel, use `GATE PROXIMITY`: `inside:YES` plus `crossable:YES` means Pulse/X should cross. In Comb after synthesis, the same diagnostics identify whether the player is inside the Aperture seal; the expected input there is Stabilize + Pulse.
