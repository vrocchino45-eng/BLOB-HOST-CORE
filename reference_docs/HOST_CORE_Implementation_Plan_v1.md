# HOST CORE Implementation Plan v1

## 23. Implementation Identity

The active project identity is:

```text
Universe: BLOB
Game Line: BLOB: HOST CORE
Blueprint: HOST_CORE_Blueprint_v1
Build Root: BLOB/
First Build: BLOB/HOST_CORE_V001_foundation_slice/
```

All build folders live inside the root BLOB folder. Each build folder uses:

```text
HOST_CORE_VXXX_short_description
```

Example:

```text
BLOB/
  HOST_CORE_V001_foundation_slice/
  HOST_CORE_V002_surface_wake_interaction_loop/
  HOST_CORE_V003_guide_threshold_crossing/
```

---


## 24. V001 Folder Layout

```text
BLOB/
  HOST_CORE_V001_foundation_slice/
    package.json
    index.html
    vite.config.js
    README.md
    CHANGELOG.md
    KNOWN_ISSUES.md
    LOCK_STATUS.md
    reference_docs/
      HOST_CORE_Blueprint_v1.md
      HOST_CORE_Blueprint_v1.txt
      HOST_CORE_Blueprint_v1.docx
      HOST_CORE_Implementation_Plan_v1.md
      HOST_CORE_Controls_UI_Camera_v1.md
      HOST_CORE_Chemistry_Core_Growth_v1.md
    public/
      assets/
        images/
        audio/
        fonts/
        data/
    src/
      main.js
      runtime/
      engine/
      modes/
      systems/
      world/
      ui/
      debug/
```

---


## 25. Runtime Architecture

Active rule:

```text
Modes own scene behavior.
Systems own reusable gameplay.
Registries own authored content.
UI displays state only.
Blueprint travels with the build.
```

### Runtime Flow

```text
InputController
  -> Current Mode
  -> Systems update state
  -> GameState stores truth
  -> CameraRig frames world
  -> PromptSystem + HudSystem read state
  -> CanvasRenderer draws scene
```

### Systems

- HostCoreGame: top-level orchestration
- GameState: current truth/state
- InputController: physical input reading
- ControlMap: input-to-action mapping
- CanvasRenderer: drawing
- CameraRig: framing
- LandingMode / ThresholdMode / HubMode / RailMode / CinematicMode / StatusMode: scene behavior
- PlayerCoreSystem: player body state
- CoreGrowthSystem: stage progression
- ChemistrySystem: reactions, risk, chemistry lean
- AbilitySystem: ability execution
- NutrientSystem: nutrients
- EntitySystem: behavior ecology
- OrbiterSystem: bonds/guidance
- GateSystem: crossing logic
- ObjectiveSystem: objective progress
- PromptSystem: current prompt
- HudSystem: HUD display
- StatusPage: menu display
- ValidationReport: data integrity checks

---


## 26. Runtime Update Loop

Each frame should update in this order:

```text
1. SceneLoop calculates delta time.
2. InputController reads input.
3. ControlMap converts input to actions.
4. Current Mode receives actions.
5. PlayerCoreSystem updates movement/body state.
6. AbilitySystem resolves ability use.
7. ChemistrySystem resolves reactions and risks.
8. NutrientSystem updates resources.
9. EntitySystem updates entities.
10. OrbiterSystem updates guidance/bonds.
11. ObjectiveSystem checks progress.
12. GateSystem checks crossing availability.
13. PromptSystem chooses current prompt.
14. CameraRig frames scene.
15. CanvasRenderer draws world.
16. HudSystem draws HUD.
17. Debug overlay draws only if enabled.
```

HUD is last. HUD reads state. HUD does not alter state.

---


## 27. Registry Philosophy

Registries define authored truth. Systems execute rules.

Bad pattern:

```text
if region is Surface Wake, manually add growth and open gate in the renderer.
```

Good pattern:

```text
RegionRegistry defines objective.
ObjectiveSystem completes objective.
GateRegistry defines requirement.
GateSystem unlocks gate.
HudSystem displays the prompt.
```

---


## 28. First-Slice Registry Requirements

### Regions

- surface_wake
- guide_threshold
- hub_chamber

Each region must define: id, displayName, act, regionType, hostFunction, movementMode, cameraProfile, dominantChemistry, verbsIntroduced, objective, gateOut, cinematicBeat, visualLanguage.

### Gates

- surface_to_guide_threshold
- guide_to_hub_chamber

Each gate must define: from, to, type, requirements, interaction, prompts, cinematic.

### Objectives

- surface_absorb_first_nutrient
- guide_stabilize_and_cross
- hub_read_route_gates

Each objective must define: regionId, displayText, steps, onComplete.

### Chemistry

V001 begins with:

- pulse_nectar
- shell_pith
- spore_milk
- signal_pollen

### Abilities

V001 begins with:

- pulse
- absorb
- stabilize
- guide_scan

---


## 29. Build Pass Plan

### HOST_CORE_V001 - Foundation Slice Shell

Goal: boot cleanly inside BLOB/HOST_CORE_V001_foundation_slice, move player core in Surface Wake, show minimal HUD, include reference docs.

### HOST_CORE_V002 - Surface Wake Interaction Loop

Add first nutrient, pulse, absorb, growth, Guide tether, soft membrane/seam, gate priming.

### HOST_CORE_V003 - Guide Threshold Crossing

Add ThresholdMode, Guide Threshold, stabilize zone, pressure/current, crossing gate.

### HOST_CORE_V004 - Hub Chamber Route Readability

Add hub layout, three gates, one active route, dormant gates, route markers, first memory shard.

### HOST_CORE_V005 - HUD and Status Page Lock

Add minimal HUD, ability petals, Status Page tabs for Core, Chemistry, Region, Controls, and controller navigation.

### HOST_CORE_V006 - Core Growth and Chemistry Bias

Add chemistry lean tracking, first nutrient effects, risk states, and core tint/mutation.

### HOST_CORE_V007 - First Entity Ecology

Add Spore Grazer and Threshold Knot with food/fear/function/failure states.

### HOST_CORE_V008 - Camera and Cinematic Pass

Add first awakening reveal, threshold crossing pull, hub reveal, camera profiles, guide target bias.

### HOST_CORE_V009 - First Route Preview

Add first route preview from Hub. Vascular recommended first because it recovers rail/camera movement strengths without making the whole game rail-based.

### HOST_CORE_V010 - First Slice Lock

Bug fix, tune controls, validate registry data, write lock status, package reference docs.

---


## 30. Future Growth / Expansion / Change Framework

The game should grow by deepening systems, not replacing them every few builds.

Rule:

```text
New region = new authored data + reused systems + maybe one new mechanic if needed
```

Every build folder should include:

```text
README.md
CHANGELOG.md
KNOWN_ISSUES.md
LOCK_STATUS.md
reference_docs/
```

Build states:

```text
experimental | testing | stable | locked | deprecated | archived
```

---


## 31. System Extension Points

| Expansion Type | Add To |
|---|---|
| New region | RegionRegistry, GateRegistry, ObjectiveRegistry, CameraProfileRegistry, VisualLanguageRegistry |
| New ability | AbilityRegistry, CoreGrowthRegistry, OrbiterRegistry, ChemistryRegistry, ControlMap if needed |
| New orbiter | OrbiterRegistry, ability unlock data, StatusPage, region placement data |
| New chemistry | ChemistryRegistry, NutrientRegistry, Reaction rules, Risk/recovery table |
| New entity | EntityRegistry, EntitySystem archetypes, Region placement data |

Do not hardcode new region behavior inside runtime systems unless the system itself is being expanded.

---


## 32. Feature Flag System

The runtime should include feature flags from the start.

```text
enableStatusPage
enableController
enableRailMode
enableEntities
enableCinematics
enableExperimentalRoute
showDebug
```

This allows systems to exist without destabilizing the first slice.

---


## 33. Performance Budget Rules

V001 target:

```text
60 FPS target
30 FPS minimum acceptable
Canvas-first
No heavy 3D by default
Debug overlay optional
```

Each region should define budgets:

```text
maxEntities
maxParticles
maxObstacles
maxParallaxLayers
hudRefreshMs
```

This avoids degrading visuals blindly without understanding the bottleneck.

---


## 34. Save / Progression Compatibility

V001 does not need full save/load, but the data model should anticipate future saves.

Future save fields:

```text
buildLine
saveVersion
currentRegion
coreStage
chemistryLean
abilitiesUnlocked
orbitersBonded
completedObjectives
unlockedGates
discoveredChemistry
discoveredEntities
discoveredRelics
routeStates
hostState
worldStateFlags
```

Rule: never rename a saved field without a migration note.

---


## 35. Legacy Feature Recovery Plan

Older builds are a parts archive, not active source of truth.

Recovery process:

```text
1. Identify old build/source.
2. Identify useful behavior.
3. Identify why it worked.
4. Identify what broke or drifted.
5. Rebuild it into HOST_CORE architecture.
6. Validate inside current slice.
7. Document migration in CHANGELOG.
```

Recoverable features:

- old rail feel -> RailMode + CameraRig profile
- old cinematic camera -> CinematicSystem + camera profiles
- old navigable obstacle areas -> region archetypes + obstacle grammar
- old entity/nutrient loops -> EntitySystem + NutrientSystem + ChemistrySystem
- old orbiter/lore behavior -> OrbiterRegistry + PromptSystem + StatusPage
- old ability cues -> AbilityRegistry + ability petals
- old HUD/menu improvements -> HudSystem + StatusPage

---


## 36. Runtime Debug and Validation

Debug tools are allowed, but isolated.

URL flags:

```text
?blobDebug=1
?blobPerf=1
?blobGod=1
?blobRegion=hub_chamber
```

Debug overlay shows: build, FPS, mode, region, player position, active objective, target, entity count, nutrient count, gate status, risk states, input mode.

Validation checks must confirm regions, gates, objectives, camera profiles, abilities, chemistry references, and first slice path.

---


## 38. Scope Control Rule

Do not build Act 2, full 3D, full crafting, full combat, full orbiters, or full open ecology until:

```text
Surface Wake -> Guide Threshold -> Hub Chamber
```

is stable and documented.

Expansion order:

```text
1. Foundation slice
2. First route
3. Hub return
4. Comb Threshold
5. Aperture Fields
6. First Act 2 ecology chain
7. Inversion prototype
8. Host-scale / Beyond prototype
```

---


## 39. Blueprint Governance

Active source hierarchy:

1. HOST_CORE_Blueprint_v1 defines current game direction.
2. Chemistry Workbook defines interaction law.
3. Region/Registry Specs define authored playable content.
4. Runtime Systems execute reusable behavior.
5. Visual Renders/Diagrams define destination mood and scale.
6. Legacy Builds are recoverable feature references only.

Blueprint updates are classified as:

```text
Patch Note -> small clarification
Blueprint Revision -> system definition update
Blueprint Version -> major direction change
```

Each build must include the blueprint it was built from.

---


## 40. Final Active Decision

The active game line is:

```text
BLOB: HOST CORE
HOST_CORE_Blueprint_v1
BLOB/HOST_CORE_V001_foundation_slice
```

The active implementation rule is:

```text
Modes own scene behavior.
Systems own reusable gameplay.
Registries own authored content.
UI displays state.
Blueprint travels with the build.
```

The active first playable proof is:

```text
Surface Wake -> Guide Threshold -> Hub Chamber
```

This document should travel with every HOST_CORE build in the `reference_docs/` folder and should be treated as the current source-of-truth until replaced by a named blueprint revision or version.

