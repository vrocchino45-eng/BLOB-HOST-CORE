# HC027B Build Report — Triadic Core Engine Foundation

## Build
`HC-027B — Triadic Core Engine Foundation`

Parent: `HC-027A — Event-Anchored Host Sound Foundation`

## Goal
Create one continuous, inspectable physiological substrate for future power/endurance, functional rooting, verb integration, and plasticity. The substrate must derive all legal engine geometry from the Core's three fundamental functions rather than arbitrary phase counts.

## Implemented
### Authoritative engine owner
Added `CoreEngineSystem`, mounted after player movement/input and before Core growth/embodiment reads. It owns only:
- architecture identity
- phase sequencing
- firing order
- cycle progress
- RPM/load telemetry

It explicitly owns none of:
- movement
- verb strength/effect
- chemistry
- retained-anatomy placement
- progression
- growth/plasticity

### 3 → 6 → 12 geometry law
- 3 phases = 1 Pulse + 1 Absorb + 1 Stabilize
- 6 phases = 2 of each function
- 12 phases = 4 of each function

Firing order preserves Pulse → Absorb → Stabilize at every resolution layer.

### RPM/load marker
Operating load is inferred read-only from existing movement/boost/verb activity and mapped to an approximately 3000–10000 Core-RPM readout. RPM is explicitly analogous biological workload, not literal revolutions-per-minute simulation.

### Embodiment/audio/readability
- Core embodiment contains a 12-node-capacity engine visualization and exposes only the nodes belonging to the current 3/6/12 architecture.
- Current firing phase receives the strongest visual emphasis.
- Existing HC027A audio owner reads engine state and produces subtle cadence without gaining gameplay authority.
- Playtest HUD exposes architecture, RPM, and current phase in Core Inspection/Core Work.

### Debug comparison
`O` cycles 3 → 6 → 12 for testing. It does not write progression or growth state.

## Deliberately not implemented
- power or endurance advantages
- Deep/Inner/Membrane engine personality
- Grave/Vascular/Silt engine modifiers
- energy reserve/depletion
- redline/misfire/stall consequences
- automatic architecture growth
- behavioral plasticity
- non-triadic/prime geometry

These are held back so HC027B proves the engine grammar without conflating it with tuning consequences.

## Validation result
PASS:
- `validate:hc027b`
- full `validate:current` HC027B → HC023A regression chain
- RecipeDataSystem
- undefined-method audit
- all 90 active JS source modules through `node --check`
- all 302 public JSON files parse successfully

Direct engine simulation also confirmed:
- default 3-phase architecture
- debug cycling reaches 6 then 12
- 12-phase firing order contains exactly 4 Pulse, 4 Absorb, and 4 Stabilize phases
- RPM responds to read-only operating load

## Environment limitation
This checkpoint does not contain `node_modules`, so a production Vite bundle was not executed in this environment. Static/runtime-contract validation is green; local Vite playtesting remains the final experiential check.

## Next intended pass
`HC027C — Power / Endurance / Radial Performance Law`

Prove three topology personalities separately from engine architecture:
- Deep-heavy = reserve / recovery / sustained endurance
- Inner-heavy = processing / transmission / control
- Membrane-heavy = response / output / consumption / instability risk

Then layer anatomy-specific consequences on top only after the topology law itself reads clearly.
