# HC027J1 Build Report — Verb Hierarchy / Pulse Reachability

## Mode
Feel / convergence pass inserted between HC027J and HC027K.

## Problem from playtest
Persistent consequences were functioning, but the three verbs still read too similarly, their visual priority competed with surrounding Host layers, and returned sonar information could look visible while feeling spatially unreachable.

## Implemented
### Pulse commitment
- Existing Pulse input now measures physical hold duration and emits on release.
- Under ~0.34 s = quick Pulse.
- Beyond ~0.34 s = charged Pulse; ~1.28 s reaches full visual charge.
- Quick Pulse preserves the 4.25 actionable gameplay radius.
- Charged Pulse preserves that local radius but can gather presentation-only structural echoes beyond it, topping out around 9.75 at full charge.

### Pulse visual hierarchy
- While charging, the Core compresses inward; shell/engine geometry pulls inward and the nucleus intensifies.
- Ambient/Guide competition yields as charge increases.
- On release, the outgoing front becomes thicker/larger and remains visually committed for its entire release window.
- While the Pulse front travels, it remains the primary composition layer until Host contact/return becomes primary.
- Charged release produces a short visible sensory ringing/recovery on the Core.

### Reachability
- Local returns remain tight, sharp and spatially attached to the responding object/surface.
- Deep structural returns are broad, softer and ghosted so they read as structure sensed through the Host rather than a reachable waypoint.
- Local HC027F approach/read behavior remains 3.6 / 1.65.

### Absorb / Stabilize
- Held Absorb develops a directional multi-ring intake funnel, stronger tether and more obvious material intake tension; Core silhouette becomes intake-biased.
- Held Stabilize uses a three-axis coherence lattice, clearer regulation tether and increasingly symmetrical Core silhouette.

### Audio
- Added restrained Pulse charge, stronger charged release, and lower/ghostlier deep-return signatures.
- HC027D1 master, bus gains, spatial attenuation and compressor values remain unchanged.

## Authority boundaries
No waypoint, route line, target, objective, reward, progression, collision, movement, chemistry-range or save-state authority was added. HC027C radial performance values were not changed. HC027K remains deferred.

## Source scope
Gameplay/presentation changes are confined to InputSystem, CoreSensoryResponseSystem, CoreVerbPhysicalizationSystem, CoreEmbodimentSystem, InteractionCompositionSystem, AmbientMaterialInteractionSystem, EventAnchoredHostAudioSystem, PlaytestHudSystem and the existing GameRuntime input schema. RecipeDataSystem only recognizes the new camera-profile status. Build/profile/validator governance was advanced to HC027J1.

## Validation result
PASS: HC027J1 focused contract, full current regression chain through HC023A, RecipeDataSystem and undefined-method audit. All source modules pass Node syntax checks and all public JSON parses. Production Vite build remains unavailable only because this handoff does not include local node_modules/Vite/Three.js.
