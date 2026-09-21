# HC028C Build Report — Vascular World Rhythm Grammar Prototype

## Mode
Design-foundation prototype / convergence experiment.

## Parent
HC-028B1 — Transition Resolution + Convergence Reachability.

## Purpose
Test the new World Composition Grammar in one existing area without widening content or creating a second timing authority. Vascular should feel like one mathematically organized living system because current, anatomy, particles, charge and restrained audio all interpret the same Host clock.

## Architectural finding
The project already contained the correct foundation:

- HC022F: one authoritative `HostRhythmSystem` / `world_is_the_metronome` clock.
- HC022G: regional interpretations of that same Host rhythm.
- HC027L1: Vascular presentation windows reinforcing Pulse / Absorb / Stabilize without new progression authority.

HC028C extends those owners instead of adding a second rhythm timer.

## Implemented

### 1. World Composition Registry
Added `src/world/WorldCompositionRegistry.js` as the profile owner.

Only Vascular receives an explicit profile in this prototype:

- key: **P-S-A**
- dominant: Pulse
- secondary: Stabilize
- tertiary: Absorb
- meter: **4/4**
- two bars per existing 5.8-second Host cycle
- tempo: **~82.759 BPM**
- octave: **micro_local**
- beat phrase: **Pulse → Stabilize → Absorb → Stabilize**

Silt, Grave, Hub and all other cells continue using the legacy Host breath with no HC028C composition profile.

### 2. HostRhythmSystem extended, not duplicated
`HostRhythmSystem` remains the only world clock owner.

It now publishes optional composition metadata derived entirely from `runtimeSeconds` and the existing 5.8-second Host cycle:

- key / tonal center
- meter
- BPM
- octave
- beat count / beat in bar / beat phase
- current functional tone
- accent strength
- beat pulse
- bounded world-flow and mote-speed scale

No `setInterval`, `setTimeout`, `Date.now`, `performance.now`, or region-local timing loop was added.

### 3. Vascular movement rhythm
The existing Vascular current now receives a subtle shared-beat modulation.

- minimum flow scale: **0.96**
- maximum flow scale: **1.06**
- maximum deviation from pre-HC028C flow: **±6%**

This is a feel layer, not a requirement. Vascular cadence reads, route completion, Pulse windows and return truth remain separate.

### 4. Vascular visual rhythm
The existing assets interpret the same beat:

- vessel envelope
- wall folds
- idle valve motion
- charge body
- current motes

No geometry, particle pass or draw call was added.

### 5. Restrained world-beat audio
`EventAnchoredHostAudioSystem` adds a low, quiet world-beat tone while the Vascular profile is active.

Functional pitch ratios:

- Stabilize = 1.00
- Absorb = 1.25
- Pulse = 1.50

The HC027D1 mix constants and all bus gains remain unchanged. The new tones use the existing ambience bus.

### 6. Debug readability
F1 Playtest Trace now displays the world signature, for example:

`World: P-S-A · 4/4 · 82.759 bpm · beat 1/4 pulse · micro_local`

This is debug-only. No gameplay HUD meter or timing prompt was added.

### 7. World Composition Grammar v0.1
Added `WORLD_COMPOSITION_GRAMMAR_v0_1.md` to record the design language:

`World Signature = Key + Meter + Tempo + Octave + Matter + Force + Geometry + Ecology`

The document also records the 3 roots → 6 relational keys → future 12 counterpart modes direction. Only the Vascular prototype is implemented here.

## Locked from HC028B1
Byte-identical parent files include:

- `src/player/PlayerMovementController.js`
- `src/morph/LocalCellBoundaryMorphSystem.js`
- `src/routes/SiltPressureRouteSystem.js`
- `src/routes/GraveMemoryRouteSystem.js`

Therefore the HC028B1 Hub reachability repair, Vascular/Silt proximity return behavior, Silt adhesion repair, Silt gameplay and Grave gameplay are not reworked in HC028C.

## Explicitly not changed
- no new region or route
- no new objective
- no controller remap
- no new Core state
- no new chemistry
- no beat-timed input requirement
- no beat-timed route completion
- no rhythm HUD
- no new geometry
- no new draw calls
- no Silt/Grave key or meter assignment yet
- no Strand-B / 12-mode implementation yet

## Runtime source scope
HC028B1: 93 source JS modules.

HC028C: **94** source JS modules.

The only new runtime module is `WorldCompositionRegistry.js`.

## Validation
PASS:

- all 94 source JS files: `node --check`
- `validate:hc028c`
- `validate:current`
- `validate:recipe-data`
- undefined `this.method()` audit
- 350/350 public JSON parse
- dynamic Host rhythm proof: Vascular = P-S-A / 4/4 / ~82.759 BPM
- no independent timer proof
- flow modulation bounded 0.96–1.06
- HC028B1 movement/morph owners retained

## Environment limitation
`npm run build` cannot execute in this handoff because local `node_modules/vite` is not included. The observed failure is `MODULE_NOT_FOUND` for `node_modules/vite/bin/vite.js`, not a source syntax/contract failure.

## Playtest question
Do not judge this by whether the player can consciously count 1-2-3-4.

The prototype succeeds if Vascular feels more like **one organism with a pulse** before the player consciously identifies its meter.
