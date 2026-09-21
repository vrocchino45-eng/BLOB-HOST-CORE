# HC026A Build Report — Hub/Core Spatial Mirror

## Parent
HC025C — Contact Surface Coverage Lock

## Intent
Prove the blueprint's micro/macro mirror as a live spatial relationship: the player's current Core chemistry layout should be readable again at Hub scale without destabilizing the Hub's navigational topology.

## Implementation

### Chemistry source
`CoreEmbodimentSystem` remains the chemistry owner and publishes `frameState.spatialCoreChemistry`.

`HubChamberFoundationSystem` reads:
- placements
- Deep / Inner / Membrane depth
- 10-state topology
- exact three-piece XYZ telemetry
- current cloud-pattern label

### Macro mapping
Hub radial targets:
- Deep Core: 1.28 units from Hub center
- Inner Body: 2.62 units
- Membrane: 4.18 units

Each family begins from its existing authored Hub territory direction. Exact Core XYZ direction is blended at 0.34 influence before computing the macro target.

### Mirrored existing anatomy
- Grave Memory return echo
- Vascular Rhythm return echo
- Silt Pressure return echo

No new Hub visual-owner system was added.

### Whole-Core Hub topology
The existing central cradle petals and basin receive smoothed Deep / Inner / Membrane emphasis. This makes the Hub center itself echo the current 3:0 / 2:1 / 1:1:1 Core distribution.

### Debug test harness
Existing P test anatomy can expose a faint progression-neutral Hub mirror preview. Ctrl+3 jumps directly to Hub for iteration.

## Explicit locks
- route gates stationary
- route corridors stationary
- destinations stationary
- no route/progression/objective mutation
- no new movement or collision behavior
- no new region
- no new source module
- contact authority remains HC025C

## Validation
- HC026A dedicated validator: PASS
- full HC026A -> HC023A predecessor chain: PASS
- RecipeDataSystem load: PASS
- undefined-method audit: PASS
- active source count: 88

## Live acceptance target
The Hub should clearly resemble the Core's current internal arrangement while still being immediately recognizable as the same Hub the player learned earlier.
