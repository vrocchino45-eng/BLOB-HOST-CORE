# HC024D2 Build Report — Whole-Core Topology Visual Readability

## Mode
Implementation / visual convergence.

## Purpose
Make the 10 existing whole-Core chemistry topologies visibly readable from the body itself before any chemistry state is allowed to alter world movement, contact, or progression.

## Design rule
The player should not need the HUD to know whether the body is primarily:
- concentrated at the Deep Core
- active through the Inner Body
- expressed at the Membrane
- balanced across all three

Two-to-one states combine those same layer languages rather than receiving unrelated bespoke skins.

## Implementation
### Smoothed layer weights
HC024D2 tracks smoothed visual weights for:
- Deep Core
- Inner Body
- Membrane
- Three-Way Balance

These weights are presentation-only and follow the existing HC024D1 zone counts.

### Deep visual authority
- stronger nucleus scale/emissive response
- contracted/quieter outer shell
- surface anatomy drawn inward

### Inner visual authority
- larger/more opaque mantle
- stronger mantle emissive pulse
- greater activity in existing growth nodes

### Membrane visual authority
- broader outer shell
- brighter boundary response
- petals/plates/nodes spread farther into the silhouette

### Three-Way Balance
A coordinated pulse keeps all three body layers legible without allowing any one layer to visually saturate the Core.

## Runtime telemetry
`playerRoot.userData.coreTopologyVisualRead` publishes:
- topology id/distribution
- smoothed Deep/Inner/Membrane weights
- balance weight
- nucleus/mantle/boundary dominance
- explicit `gameplayEnvelopeChanged: false`

## Locked systems
No movement, collision, contact mechanics, abilities, progression, geography, route completion, inventory, recipe menu, or input changes.

## Validation
- `validate:hc024d2`: PASS
- `validate:hc024d1`: PASS
- full predecessor regression chain: PASS
- RecipeDataSystem load: PASS
- undefined-method audit: PASS
- all 88 active JS source modules `node --check`: PASS

## Live test question
With HUD text ignored, are **3:0:0**, **0:3:0**, **0:0:3**, and **1:1:1** immediately distinguishable? If yes, do the six 2:1 arrangements naturally read as dominant + secondary combinations of the same body language?
