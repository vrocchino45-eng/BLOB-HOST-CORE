# HC027C Build Report — Radial Power / Endurance Performance Law

Parent: HC027B Triadic Core Engine Foundation

## Pass mode
Convergence / physiology gameplay proof

## Purpose
Prove that the existing Deep / Inner / Membrane retained-anatomy topology can create a legible performance personality without changing the locked 3 → 6 → 12 engine grammar or creating duplicate ownership.

## Allowed scope
- read the topology already published by `CoreEmbodimentSystem`
- add one dedicated radial-performance owner
- translate zone distribution into continuous performance traits
- add one normalized endurance reserve
- expose boost-only performance consequences through the existing movement owner
- add compact playtest telemetry
- add build contract and focused validation

## Forbidden scope
- changing the Pulse / Absorb / Stabilize engine sequence
- making 3 / 6 / 12 into power tiers
- adding new geometry or non-triadic architecture
- creating a second Core Work/topology owner
- moving the player directly from the physiology system
- changing ordinary non-boost traversal
- adding route/progression/growth consequences
- adding random misfires, redline failures, or stochastic loss of control
- speculative edits to neighboring systems

## Locked systems
- `CoreEngineSystem` — engine architecture / sequencing / RPM telemetry
- `CoreEmbodimentSystem` — retained-anatomy placement, topology, and spatial chemistry
- `PlayerMovementController` — movement translation
- existing chemistry / Host response / contact / attachment owners
- progression and route topology

## Implementation
### One continuous radial law
The system uses the existing count of three retained pieces across Deep / Inner / Membrane. Each zone contributes a trait vector and the current Core profile is their weighted blend.

**Deep**
- output 0.88
- response 0.88
- endurance capacity 1.55
- recovery 1.50
- efficiency 1.35
- stability 1.30

**Inner**
- output 1.00
- response 1.08
- endurance capacity 1.05
- recovery 1.05
- efficiency 1.12
- stability 1.05

**Membrane**
- output 1.18
- response 1.20
- endurance capacity 0.72
- recovery 0.65
- efficiency 0.72
- stability 0.70

This makes pure Deep the diesel extreme, pure Membrane the race extreme, Inner the controlled/efficient middle, and mixed topologies continuous interpolations rather than bespoke exceptions.

### Endurance law
Existing activity produces normalized demand:
- boost = 1.00
- absorb = 0.30
- stabilize = 0.20
- pulse = short transient demand up to 0.42

Reserve drain scales inversely with endurance capacity × efficiency. Recovery scales with the profile's recovery trait. Falling reserve applies a stability-mediated fatigue factor.

### First consequence boundary
Only boost consumes the movement modifiers in this pass:
- boost acceleration reflects output × response × fatigue
- boost speed reflects output / response character × fatigue
- ordinary movement remains multiplier 1.0

`CoreRadialPerformanceSystem` publishes these values; `PlayerMovementController` remains the sole movement consumer/translator.

## Acceptance tests
- pure Deep endurance capacity > Inner > Membrane
- pure Deep recovery > Inner > Membrane
- pure Membrane output > Inner > Deep
- pure Membrane boost output > pure Deep
- 1:1:1 remains near neutral/balanced
- under the same six-second full-boost stress, Deep retains substantially more reserve than Membrane
- after equal recovery time, Deep recovers substantially faster than Membrane
- normal traversal is unchanged
- changing 3 / 6 / 12 does not alter radial performance traits
- no performance source reads engine phase count or architecture

## Regression result
- HC027C focused validator PASS
- HC027B and HC027A PASS
- HC026 / HC025 / HC024 / HC023 inherited regression chain PASS
- RecipeDataSystem PASS
- undefined-method audit PASS

## What this proves
The Core now has two orthogonal structural ideas instead of one overloaded stat system:
1. **3 → 6 → 12** tells us how its three fundamental functions are resolved/cycled.
2. **Deep → Inner → Membrane** tells us how the same Core is biased toward endurance, control, or front-line output.

That preserves room for later combinations instead of collapsing every design choice into a single linear upgrade path.

## Next decision after playtest
First judge whether the diesel/control/race contrast is physically legible and fun. If it is, the next pass can deepen consequences carefully (for example verb-specific physiology or stability behavior) while keeping the two-axis architecture locked. If it is not, tune HC027C rather than layering another system on top.
