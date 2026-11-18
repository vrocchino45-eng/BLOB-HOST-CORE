# HC024D1 Build Report — Body Topology Chemistry

## Mode
Implementation / visual chemistry proof.

## Purpose
Prove that arranging the three retained anatomies inside the Core creates immediately readable internal body states before any world-facing buffs or gates are attached.

## Implementation
### Retained anatomy inputs
- Grave Memory
- Vascular Rhythm
- Silt Pressure

### Body zones
- Deep Core
- Inner Body
- Membrane

### Fundamental interaction count
3 retained anatomies × 3 zones = **9**.

### Whole-Core topology count
- 3 all-in-one-zone states
- 6 two-to-one states
- 1 one-each state

Total = **10** topology states.

## Visual rules
- Deep-heavy: retained anatomy compacts; nucleus gains visual authority; exterior quiets.
- Inner-heavy: middle body/mantle gains circulation and breathing authority.
- Membrane-heavy: retained anatomy expands; exterior silhouette and membrane activity strengthen.
- Three-Way Balance: nucleus, inner body, and membrane share a coordinated quiet pulse.
- Family identity remains visible; zone presentation does not replace Grave/Vascular/Silt visual language with generic colored tokens.

## Runtime telemetry
`frameState.spatialCoreChemistry` publishes:
- current retained piece count
- each piece's zone and interaction
- Deep/Inner/Membrane counts
- whole-Core topology id/label/distribution
- selected piece chemistry
- topology change count
- explicit lock that world consequences are disabled

## Locked systems
No movement, collision, contact, gates, objectives, progression, geography, route completion, inventory, or conventional recipe crafting changes.

## Validation
- `validate:hc024d1`: PASS
- full `validate:current` predecessor chain: PASS
- RecipeDataSystem load: PASS
- undefined-method audit: PASS
- all 88 active JS files `node --check`: PASS
- local source import graph: PASS

## Live test question
Can the player move Grave/Vascular/Silt between Deep Core / Inner Body / Membrane and visually understand both:
1. what each individual piece became, and
2. what kind of whole Core the 3:0 / 2:1 / 1:1:1 arrangement produced?
