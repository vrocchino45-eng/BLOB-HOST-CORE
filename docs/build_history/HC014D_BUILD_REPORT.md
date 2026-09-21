# BLOB: HOST CORE — HC-014D Build Report

## Pass
HC-014D — Aperture Seal Reachability Fix

## Reference build
HC-014C — Hub → Comb → Aperture Progression Readability

## Defect addressed
Live controller testing reached the visible Comb Aperture-facing seal after all six filter reads, but the final synthesis trigger would not activate.

## Root cause
Comb had two competing definitions of the final seal interaction:

- `CombThresholdFoundationSystem` owned the visible physical seal at authored offset `[0, 0, -10.8]` and published a true 3D player distance with authored read range `2.15`.
- `CombThresholdPlayableSystem` independently used legacy `finalSealZ: -10.25` and `finalSealRange: 1.15`, measuring Z distance only.

The visible environmental doorway and gameplay synthesis condition therefore did not share one authority.

## Fix
- `CombThresholdFoundationSystem` remains sole physical seal authority.
- Foundation now publishes the world/local seal position plus the true 3D seal distance and authored range.
- `CombThresholdPlayableSystem` consumes `combThresholdFoundation.apertureSealDistance` and `apertureSealReadRange` during live runtime.
- The legacy Z-only target remains only as a fallback for historical isolated test fixtures where foundation state is intentionally absent.
- Final synthesis and GateSystem crossing now use the same physical seal volume.
- The final reveal remains two-step by design: complete synthesis, allow dilation/reveal to finish, then use a fresh Stabilize + Pulse to cross. Repositioning is not required if the player remains inside the seal volume.

## Screenshot diagnostics
The debug overlay now publishes separate lines for:

- `SYNTHESIS SEAL dist / range / inside / authority`
- `APERTURE GATE reveal / witnessed / complete / crossable`

This distinguishes a synthesis-position problem from a GateSystem eligibility problem in screenshots.

## Scope locks preserved
- No ecology expansion.
- No new entities, nutrients, crafting, combat, abilities, or base verbs.
- No movement-layout redesign.
- No changes to Grave, Vascular, Silt, Hub convergence, or six-filter read requirements.
- GateSystem remains sole crossing/history owner.
- Existing Aperture arrival scale/camera work remains intact.

## Validation
- `npm run validate:aperture-seal-reachability` — PASS
- `npm run validate:current` — PASS
- `npm run audit:undefined-methods` — PASS (inside current chain)
- `npm run build` — PASS

The focused validator deliberately places the player where the old hidden Z-only target would fail while foundation reports the player inside the visible 2.15-unit seal volume. HC-014D correctly completes synthesis from the foundation-owned physical seal.

## Production bundle
Initial entry chunk: approximately 1,473.33 kB minified / 366.22 kB gzip.
The existing large-bundle warning remains.

## Live acceptance still required
Controller retest of Comb → Aperture is required. At the seal, the screenshot HUD should show `SYNTHESIS SEAL ... inside:YES`. Complete final synthesis with Stabilize + Pulse, wait for reveal/witnessed state, then use a fresh Stabilize + Pulse while remaining in the same seal volume to cross into Aperture Fields.
