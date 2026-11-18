# HC027D1 Build Report — Audio Reference Level / Dynamic Range Calibration

## Purpose
Calibrate BLOB's procedural audio around the primary playtest hearing reference before more sounds are added.

Observed HC027D reference:
- system/output volume was effectively maxed
- zoomed-out audio was audible but faint
- zoomed-in audio was louder as intended, but still faint

HC027D1 target:
- normal play should be comfortably audible around 60–70% system output on the same listening setup
- far sound remains quieter than close sound
- close Core sound remains more intimate than zoomed-out sound
- future hard impacts, strain, large Host responses, and cinematic events retain meaningful space above ordinary play

## Audio ownership
`EventAnchoredHostAudioSystem` remains the one procedural Web Audio owner.

HC027D1 adds an internal bus graph:

`source -> spatial panner -> bus -> master -> safety compressor -> output`

Buses:
- **Core 1.85** — engine cadence and Core Work manipulation
- **Verbs 2.15** — Pulse emission, Absorb process, Stabilize process
- **World 1.95** — Pulse returns, contact, landmarks, chemistry response
- **Ambience 1.35** — low-priority Host-cycle bed
- **Event 1.40** — unlock confirmation and reserved future high-importance events

Master gain: **0.82**

Approximate direct gain lift versus HC027D before spatial attenuation:
- Core: **+7.0 dB**
- Verbs: **+8.3 dB**
- World: **+7.4 dB**
- Ambience: **+4.2 dB**
- Event: **+4.6 dB**

This is intentionally not one uniform loudness increase. Normal functions move upward most; ambience rises less so it can remain below gameplay information.

## Spatial calibration
HC027D:
- ref distance 2.8
- max distance 34
- rolloff 0.62

HC027D1:
- ref distance **4.2**
- max distance **42**
- rolloff **0.42**

The distance law is still inverse/HRTF. It has not been removed or flattened.

Approximate attenuation improvement from the panner alone:
- 5 units: +2.8 dB
- 10 units: +4.3 dB
- 20 units: +5.4 dB
- 34 units: +6.0 dB

So the intended read becomes:

**far = quiet but readable -> medium = normal -> close = intimate/present**

rather than:

**far = barely detectable -> close = still faint**

## Output safety / headroom
A `DynamicsCompressorNode` now sits after the master as a safety stage:
- threshold: -4 dB
- knee: 3 dB
- ratio: 8:1
- attack: 0.003 s
- release: 0.16 s

Its purpose is not loudness normalization. Ordinary procedural tones should remain below it. It protects against transient summing when several procedural layers overlap after the reference-level lift.

Design headroom target for future content: **about 8 dB above normal gameplay hierarchy**.

## Gameplay locks
HC027D1 changes no gameplay system.

Preserved:
- Pulse range = 4.25
- Pulse emit/contact/return timing law
- Deep/Inner/Membrane sensory wave speeds
- Absorb gameplay
- Stabilize gameplay
- HC027C radial endurance/output law
- boost-only radial movement consequence
- normal movement
- HC027B 3→6→12 engine grammar
- chemistry authority
- route/progression authority
- collision authority
- region topology

## Playtest telemetry
The playtest HUD state now exposes:
- mix revision
- master gain
- target system-output reference
- target headroom
- bus gains
- output safety-compression settings

This keeps screenshot/video diagnostics interpretable without turning audio calibration into gameplay UI.

## Validation
- HC027D1 focused validator PASS
- HC027D sonar/verb behavior regression PASS
- complete HC023A → HC027D1 inherited chain PASS
- 92 active JS modules syntax PASS
- 310 public JSON files parse PASS
- RecipeDataSystem PASS
- undefined-method audit PASS
- local historical import/platform checks PASS through inherited validators

## Environment limitation
This handoff still does not contain `node_modules`. A Vite production bundle cannot be certified in this environment until dependencies are available. This is an environment limitation, not a reported source validation failure.
