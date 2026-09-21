# HC-028E Build Report — Regional Composition Triad

## Parent
HC-028D2 — Deliberate Commitment Grammar

## Purpose
Prove that Vascular, Silt and Grave can feel like different regional "sentences" while sharing the same Host clock, Core verbs, 3→6→12 engine, resonance grammar and commitment controls.

## Implemented
- Added authored Silt profile: **A-S-P / 3/4 / 2 bars per Host cycle / ~62.1 BPM**.
- Added authored Grave profile: **S-A-P / 12/8 / one 3+3+3+3 compound bar per Host cycle**.
- Preserved Vascular exactly as **P-S-A / 4/4 / ~82.8 BPM** with the established 0.96–1.06 flow modulation bounds.
- Generalized `CoreWorldResonanceSystem` from Vascular-only to any authored shared-Host-clock composition.
- Generalized `EventAnchoredHostAudioSystem` so regional rhythm/bass articulation is profile-authored instead of hard-coded to Vascular.
- Added Silt presentation phrase: gather → brace → pressure-read/release.
- Added Grave presentation phrase: hold triplet → draw triplet → return triplet → settle triplet.
- Added restrained Silt/Grave world replies to Core↔World resonance.

## Authority boundary
HC028E changes composition/presentation only. It does not change:
- route completion,
- objective/progression truth,
- verb power/range/cost,
- A/Commit behavior,
- controller mapping,
- Silt or Grave movement physics,
- Core engine timing,
- Core Work,
- targeting/chemistry.

Silt and Grave composition profiles explicitly publish movement scales of 1.0 and no timing-gate authority.

## Audio direction
The pass establishes **regional rhythm/bass identity**, not a soundtrack style-copy. Vascular remains more transmitting/forward, Silt lower and pressure-weighted, Grave lower still with quiet compound echoes. HC027D1 master/bus calibration is unchanged.

## Runtime diff intent
Changed runtime owners are limited to:
- `WorldCompositionRegistry.js`
- `HostRhythmSystem.js`
- `CoreWorldResonanceSystem.js`
- `SiltPressureRouteSystem.js`
- `GraveMemoryRouteSystem.js`
- `EventAnchoredHostAudioSystem.js`
- `main.js` build identity

Core engine, embodiment, verb coupling/physicalization, movement, D2 commitment/input/control mapping, Vascular route gameplay, morph ownership and telemetry are parent-hash locked.

## Validation
`validate:hc028e` dynamically proves all three cell→profile mappings, meters/tempos, profile-driven audio voices, generalized Core↔World resonance, Vascular movement preservation, Silt/Grave zero movement modulation, no rhythm authority, parent owner hashes and runtime source count.

## Validation result
- `validate:hc028e` — PASS
- recipe-data load — PASS
- undefined `this.method()` audit — PASS
- runtime JS syntax — **97/97 PASS**
- public JSON parse — **368/368 PASS**
- parent runtime diff — **7 intentional modified files, 0 added, 0 removed**
- locked parent owners — **11/11 hash matched**

The handoff tree does not include installed `node_modules`, so a Vite production render was not executed in this packaging environment.
