# HC027J2 Build Report — Verb Power / Cost / Physiology Integration

## Mode
Feel / bounded mechanical integration pass between HC027J1 and HC027K.

## Purpose
HC027J1 established readable verb commitment. HC027J2 makes that commitment mechanically meaningful through the existing Deep / Inner / Membrane physiology law rather than through ability levels or discrete class buffs.

## Implemented

### Pulse
- Quick Pulse remains the 4.25 local/actionable query.
- Charged Pulse charge timing now reads the radial performance profile from the prior frame.
- Deep-heavy charges more deliberately; Membrane-heavy charges faster; Inner remains controlled/intermediate.
- Charged structural presentation reach is physiology-colored without extending chemistry/targeting authority.
- Deep structural echo count and sensory recovery burden now reflect radial control/stability.
- Charged release creates a much larger endurance demand than quick Pulse, especially for Membrane-heavy output.

### Absorb
- Sustained hold now ramps a commitment value.
- Existing BondSystem pull/progress/range consume the physiology owner’s continuous output profile.
- Membrane-heavy produces stronger immediate draw; Deep-heavy produces less burst pull but sustains it far longer.
- Sustained Absorb progressively reduces movement while held; normal movement returns immediately on release.

### Stabilize
- Sustained hold now ramps commitment and endurance demand.
- Existing Signal Plain affordance/coherence response consumes the physiology owner’s continuous stability/efficiency profile.
- Deep-heavy holds strong coherence with high reserve; Membrane-heavy is less stable and more expensive; Inner remains controlled/intermediate.
- Sustained Stabilize progressively anchors mobility while held.

### Visual exertion
- Existing HC027J1 silhouettes remain authoritative.
- Verb strength now colors Core intensity and sustained effort.
- Lower reserve adds subtle visible exertion rather than a cooldown banner.

## Continuous physiology proof
Two-second sustained tests using the actual CoreRadialPerformanceSystem produced:
- Absorb reserve: Deep ~97% > Inner ~93% > Membrane ~75%.
- Pulse charge rate: Deep 0.86x / Inner 1.02x / Membrane 1.18x.
- Absorb output: Deep ~0.77x / Inner ~1.06x / Membrane ~1.26x.
- Stabilize coherence: Deep ~1.37x / Inner ~1.05x / Membrane ~0.66x.

These are consequences of the existing weighted radial trait profile; no separate Deep/Inner/Membrane ability table was added.

## Locked authority
- CoreEngineSystem 3→6→12 architecture unchanged.
- HC027D1 EventAnchoredHostAudioSystem byte-identical to HC027J1.
- InteractionCompositionSystem and AmbientMaterialInteractionSystem byte-identical to HC027J1.
- Quick/local Pulse gameplay range remains 4.25.
- No waypoint, objective, reward, progression, route, save-state, random failure, or new ability authority.
- HC027K next-question chaining remains deferred.

## Validation
- HC027J2 focused/static + dynamic physiology validator PASS.
- RecipeDataSystem load validation PASS.
- Undefined `this.method()` audit PASS.
- 92 source JS modules syntax PASS.
- 328 public JSON files parse PASS.
- Locked-owner hash checks PASS.

Production Vite bundle remains unavailable in this handoff because local `node_modules/vite` is not included.
