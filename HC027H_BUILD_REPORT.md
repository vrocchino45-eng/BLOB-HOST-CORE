# HC027H Build Report — Traversal Intention Architecture

## Purpose
Convert one existing space from “follow the highlighted thing” to “notice several different things and choose what interests you” without adding mechanics, geometry, objectives or progression.

## Implementation
The Signal Plain already contained three spatially separated receptors. HC027H reuses them. The previous nearest-unread presentation gave one receptor dominant emissive/halo/route-marker treatment. HC027H removes that authored answer and gives all unread receptors simultaneous readability through three motion signatures.

### Signatures
1. **slow_breath** — low-frequency scale/emissive breathing, slow halo drift.
2. **paired_chirp** — faster peaking emissive/scale pulse and quicker halo rotation.
3. **shear_drift** — lateral rotational/shear motion and tether sway.

Proximity contributes a small common lift only. Existing route-marker meshes are set to zero opacity.

## Text hierarchy
Signal Plain Guide/HUD copy now describes differences and explicitly avoids naming a required receptor/order during the first inquiry. Debug telemetry still exposes distances and internal state for diagnosis.

## Scope
Active source changes are limited to:
- `SignalPlainEcologySystem.js`
- `GuidePromptSystem.js`
- `PlaytestHudSystem.js`
- `RecipeDataSystem.js` status allowlist
- `main.js` build identity

Core sensory, ambient material, audio and engine owners are unchanged.

## Verification
- HC027H focused contract PASS
- inherited HC027G1/G/F/E/D1/D/C/B/A and HC026–HC023 current regressions PASS
- RecipeDataSystem PASS
- undefined-method audit PASS
- 92 JS syntax PASS
- 320 JSON parse PASS

## Environment limitation
The handoff has no local `node_modules/three` or Vite executable, so Three.js-instantiating legacy Signal Plain tests and Vite production bundling cannot be run here.
