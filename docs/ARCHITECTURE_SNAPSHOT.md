# HC-001N — Architecture Snapshot

## Runtime Systems

```text
GameRuntime
SystemRegistry
RecipeDataSystem
InputSystem
PlayerMovementController
ChemObjectSystem
BondSystem
TargetingSystem
EntitySystem
OrbiterSystem
VisualRecipeRegistry
VisualComposer
MotionSignatureSystem
PlaceholderValidator
RecipeDebugOverlay
ChemistryDebugPanel
```

## Data Files

```text
public/data/build/buildManifest.json
public/data/lock/hc001LockState.json
public/data/hosts/HOST_ALPHA_WOUNDED_NURSERY.json
public/data/world/anatomyRecipes.json
public/data/world/localCellRecipes.json
public/data/chemistry/chemicalDomains.json
public/data/chemistry/matterStates.json
public/data/chemistry/chemObjectRecipes.json
public/data/chemistry/bondRecipes.json
public/data/ecology/functionRecipes.json
public/data/ecology/entityRecipes.json
public/data/orbiters/orbiterRecipes.json
public/data/visual/visualCompositionRecipes.json
public/data/visual/placeholderReplacementRecipes.json
```

## Data-Driven Chain

```text
Host recipe
→ Local cell recipe
→ Cell contents
→ Chem object / entity / orbiter recipes
→ Visual recipes
→ Placeholder contracts
→ Runtime systems
```

## Current Technical Debt

### VisualComposer size

`VisualComposer.js` still owns most composition functions. Next architecture cleanup should split:

```text
ShapeGrammarSystem
MaterialVisualSystem
EntityVisualComposer
OrbiterVisualComposer
EnvironmentVisualComposer
```

### Vite chunk size

Three.js currently causes a chunk-size warning. This is not blocking but can be handled later with manual chunks.

### Debug panels

Debug panels are useful but visually large. Later they should become a collapsible dev overlay.

### No lock automation

Regression tests are documented manually. A later pass should add a lightweight data validation script.

## Recommended Next Technical Cleanup

If HC-001N locks, do not expand aggressively without soon planning:

```text
HC-002_PREP — VisualComposer split plan
HC-002_PREP — Local morph architecture
HC-002_PREP — debug overlay collapse/toggle
```
