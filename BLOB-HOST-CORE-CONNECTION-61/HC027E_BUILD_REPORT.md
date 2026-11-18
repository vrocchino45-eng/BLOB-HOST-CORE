# HC027E Build Report — Consequence Rhythm / System Turn-Taking

## Build identity
- Build: **HC-027E**
- Version: **0.27.6**
- Parent: **HC-027D1**
- Mode: presentation convergence / consequence legibility
- New source modules: **0**
- Active source modules: **92**
- New regions: **0**

## Purpose
Convert the existing playtest material into a more legible gameplay rhythm without widening gameplay scope.

The 19-minute HC027C playtest showed:
- early/Core-heavy moments were visually oversaturated
- later traversal was spatially clearer but frequently too passive
- existing actions often produced answers too briefly for those answers to become the next readable beat

HC027E therefore changes **presentation priority and consequence duration**, not authored progression.

## Modified presentation owners
- `InteractionCompositionSystem`
- `AmbientMaterialInteractionSystem`
- `CoreVerbPhysicalizationSystem`
- `EntitySystem`
- `OrbiterSystem`
- `PlaytestHudSystem`

No new gameplay owner was introduced.

## Consequence rhythm
`InteractionCompositionSystem` now identifies these existing resolution events:
- Pulse return
- Absorb capture
- Stabilize lock
- Core Work commit
- route-state change

Hold times:
| Existing resolution | Presentation hold |
|---|---:|
| Pulse return | 1.08 s |
| Absorb capture | 1.24 s |
| Stabilize lock | 1.34 s |
| Core Work commit | 0.74 s |
| Route state change | 0.92 s |

Stabilize uses a latch so a held lock does not continuously manufacture new consequence events.

## Core Work hierarchy fix
A real opacity-ownership bug was corrected in `AmbientMaterialInteractionSystem`.

Previously, interaction composition could request ambient suppression and a later opacity assignment would overwrite much of it. HC027E applies `presentationOpacityScale` in the final material-opacity calculation.

Targets:
- selected anatomy ambient suppression: 0.76
- held anatomy ambient suppression: 0.84
- companion yield: 0.86
- held effect suppression: 0.38

This is a presentation correction, not a change to Core Work mechanics or chemistry.

## Quiet traversal
After approximately 1.35 seconds of quiet movement, existing world material may gradually regain visual notice up to 0.24.

It does not:
- spawn content
- choose targets
- create objectives
- add arrows
- add gates
- alter route topology
- extend travel time

## World after-answer language
Existing Host material can briefly express:
- `sonar_answer_afterglow`
- `metabolic_afterflow`
- `coherence_lock_afterglow`
- `core_work_yield`

These are short visual-response states on existing material.

## Audio lock
HC027D1 is the approved reference listening level and is unchanged.

Verified exact retained values:
- master 0.82
- buses: Core 1.85 / Verbs 2.15 / World 1.95 / Ambience 1.35 / Event 1.40
- panner ref 4.2
- rolloff 0.42
- safety compressor remains present

## Regression proof
PASS:
- HC027E focused behavior validator
- HC027D1 audio reference validator
- HC027D sensory/sonar validator
- HC027C/C1 radial performance + audio reliability
- HC027B triadic engine
- HC027A event-anchored audio
- HC026 traversal/spatial-memory chain
- HC025 contact/attachment chain
- HC024 Core Work/topology/chemistry chain
- HC023 living-state/platform chain
- RecipeDataSystem
- undefined `this.method()` audit

Static integrity:
- 92 JS modules syntax PASS
- 312 public JSON files parse PASS

## Environment limitation
`node_modules` is not part of the handoff, so the local Vite executable is absent. A Vite production bundle is therefore not claimed for this environment.
