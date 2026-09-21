# HC028C2 Build Report — Gyroscopic Phase Engine + Vascular Accent Grammar

Parent: **HC028C1 — Phase Architecture Visual Readability**

## Why this pass exists
Two playtest findings were clear:

1. HC028C made Vascular feel like one repeating living pulse, but the **4/4 meter itself did not read strongly enough**. The world had periodicity without a clear accent hierarchy.
2. HC028C1 made 3→6→12 countable, but the equatorial triangle/hexagon/dodecagon created an unwanted **top/bottom axis** and read more like an indicator ring than the Core's internal engine.

HC028C2 fixes both presentation problems without changing route truth, 3→6→12 engine sequencing, or the HC028C movement-force range.

## Core phase engine presentation
`CoreEngineSystem` remains the authoritative physiology/sequencing owner and is unchanged.

`CoreEmbodimentSystem` now renders the existing 3→6→12 firing data as a **spherical tri-axial gyroscope**:

- Pulse, Absorb, and Stabilize each occupy one orthogonal great-circle firing plane.
- **3-phase:** one firing position per function; large, discrete firing impulses and more visible precession.
- **6-phase:** two opposed firing positions per function; paired/counterbalanced motion.
- **12-phase:** four firing positions per function; dense, near-continuous turbine-like motion.
- The assembly precesses around all three axes and therefore has **no fixed top or bottom**.
- Stabilize visually reduces precession and increases coherence; it does not freeze orientation and gains no new gameplay authority.
- The `O` architecture cycle remains debug-only.

The HC028C1 flat triangle/hexagon/dodecagon outline is retired from the live visual path.

## Vascular 4/4 accent grammar
The HC028C Host clock, key, meter, tempo, and movement-force range are preserved:

- Key: **P-S-A**
- Meter: **4/4**
- Tempo: **~82.759 BPM**
- Two bars per 5.8-second Host breath
- Movement flow scale remains **0.96–1.06**
- No timing gate or route-completion authority

HC028C2 separates **perceptual accent** from the already-proven movement accent:

1. **Pulse — transmit/downbeat**: strongest outward vessel/charge emphasis.
2. **Stabilize — catch/hold**: deformation tightens and briefly reads as a held frame.
3. **Absorb — receive/draw**: tissue and visible stream gather inward.
4. **Stabilize — settle/prepare**: quietest resolving beat before the next downbeat.

Perceptual accent pattern: `[1.00, 0.28, 0.64, 0.22]`

Movement accent pattern remains HC028C: `[1.00, 0.42, 0.68, 0.46]`

The wall-fold rhythm was also made non-compounding: each frame now returns to the authored base scale before applying temporary rhythmic deformation.

## Locked behavior
Unchanged / locked:

- `CoreEngineSystem` sequencing, RPM and 3→6→12 law
- InputSystem / `O` ownership
- HC028B1 Hub convergence reachability
- HC028B1 Vascular/Silt resolved-fold transition model
- Vascular cadence/completion truth
- Silt gameplay
- Grave gameplay
- Core radial performance
- chemistry and Core Work placement
- controller mapping

## Validation
PASS:

- `validate:hc028c2`
- inherited `validate:hc028c`
- recipe-data validation
- undefined-method audit
- all **94** runtime JS files through `node --check`
- all **356** public JSON files parse

The new HC028C2 validator also carries forward the relevant HC028B1 reachability/transition assertions because the historical HC028B1 validator describes its original 93-file build identity and is not a whole-tree validator for later descendants.

## Environment limitation
The supplied source package does not contain a complete local `node_modules`, so a Vite production render is not claimed here. Live controller/video verification remains required for visual feel.

## Runtime diff against HC028C1
Exactly six runtime files differ from the parent and no runtime modules were added or removed:

- `src/main.js`
- `src/player/CoreEmbodimentSystem.js`
- `src/world/HostRhythmSystem.js`
- `src/world/WorldCompositionRegistry.js`
- `src/routes/VascularRhythmRouteSystem.js`
- `src/audio/EventAnchoredHostAudioSystem.js`

Older pass validators such as HC027B/HC028B1 are build-identity-bound and are not treated as descendant whole-tree validators. HC028C2 instead hash-locks their relevant owners and explicitly reasserts their governing laws in `validateHC028C2GyroPhaseAccentGrammar.mjs`.
