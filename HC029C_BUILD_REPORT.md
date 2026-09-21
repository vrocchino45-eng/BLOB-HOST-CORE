# HC-029C Build Report — Verb Composition Grammar

Parent: **HC-029B — Relationship Effect Ownership**

## Mode

Convergence / interaction-language pass.

## Purpose

HC029C turns simultaneous Pulse / Absorb / Stabilize input into one bounded relational grammar. It does **not** add abilities. It makes combinations inherit the HC029A retained relationship and the HC029B effect-ownership rule so the same target remains the subject of the combined action.

## Locked foundation

- HC029A candidate scoring, retention, release grace, handoff cooldown and camera-intent thresholds.
- HC029B Pulse broad inquiry + focused relationship response.
- HC029B Absorb relationship ownership through BondSystem.
- HC029B focused Stabilize + weaker ambient Host Stabilize.
- Controller mapping, camera ownership, movement, routes, progression, ecology and authored content.

## Allowed scope

Intentional runtime JS diff vs HC029B is limited to:

1. `src/main.js` — build identity only.
2. `src/core/GameRuntime.js` — register the single composition owner between targeting and Bond.
3. `src/interaction/VerbCompositionSystem.js` — canonical chord meaning and bounded modifiers.
4. `src/chemistry/ChemObjectSystem.js` — Pulse response consumes composition modifiers without retargeting.
5. `src/chemistry/BondSystem.js` — Absorb pull/progress/rotation consumes same-target composition modifiers.
6. `src/player/CoreVerbPhysicalizationSystem.js` — visual coherence/tension reads the same composition state.
7. `src/player/CoreRadialPerformanceSystem.js` — existing endurance owner charges bounded extra demand for composed strain.
8. `src/player/CoreVerbEngineCouplingSystem.js` — presentation chord naming follows HC029C when available.

Exactly **103** other runtime JS owners are SHA-256 locked to HC029B.

## Forbidden scope

- no targeting threshold retune
- no manual target-cycle button
- no camera snap or forced facing
- no new reticle/HUD targeting layer
- no fourth verb or new base ability
- no new controller input
- no route/progression change
- no ecology behavior change
- no new region/content work

## Composition grammar

### Pulse + Stabilize — `cohere_project`

Meaning: **controlled directional push**.

The retained target still receives Pulse, but the directional response is reduced and ordered while ambient inquiry is quieter. Stabilize gains faster coherence and lower wobble. The result should read as shaping/projecting something that is being held coherent, not as two unrelated VFX layers.

### Absorb + Stabilize — `cohere_draw`

Meaning: **coherent controlled draw**.

Absorb remains inward and metabolizing, but target spin and pull are restrained while Stabilize maintains order. Progress remains possible; this is not a freeze state.

### Pulse + Absorb — `exchange`

Meaning: **opposed push/pull tension**.

The two opposing verbs no longer simply apply full strength at once. Focused Pulse, Absorb pull and Absorb progress are all reduced for a short Pulse-release envelope, producing a brief relational tension state.

### Pulse + Absorb + Stabilize — `full_system`

Meaning: **high-strain equilibrium**.

This is deliberately **not a super move**. Net motion and incorporation are strongly suppressed while all three functions are engaged. The existing endurance owner applies a 1.32 composition-demand multiplier, so maintaining the state has a real physiological cost without inventing a second stamina resource.

## Pulse timing

Pulse is release-fired. `ChemObjectSystem` still updates before `TargetingSystem`; HC029C preserves that runtime order. Focused Pulse therefore consumes the already-resolved prior-frame relationship/composition established while X is held. After release, HC029C keeps a short Pulse intent envelope (0.34 s quick / 0.62 s charged) so exchange/equilibrium remains perceptible rather than existing for one frame.

## Delete / disable targets

None. HC029C does not add a legacy compatibility path or duplicate targeting owner.

## Visual / feel target

The player should be able to predict the combination from the primitive verbs:

- stabilize + push = controlled push
- stabilize + pull = controlled draw
- push + pull = tension
- push + pull + stabilize = costly equilibrium

The same retained relationship must remain visually and physically legible throughout.

## Acceptance tests

1. Single Pulse, Absorb and Stabilize still behave like HC029B.
2. LT + X produces a more controlled focused push and quieter ambient response.
3. LT + RT draws the same target with visibly reduced spin while still permitting absorption.
4. RT + X creates brief tension rather than full simultaneous push and incorporation.
5. LT + RT + X suppresses net target motion and raises endurance demand.
6. No composition can choose a different target from HC029A targeting.
7. Releasing the combination returns smoothly to the remaining primitive verb.

## Regression tests

- HC029A target handoff feel unchanged.
- HC029B focused/ambient ownership unchanged when verbs are used singly.
- no movement/camera/input remap.
- no route or progression mutation.
- no ecology mutation.
- full-system composition does not bypass absorb compatibility or chemistry rules.

## Validation result

- HC029C composition contract + behavioral smoke test: **PASS**
- RecipeDataSystem load: **PASS**
- undefined `this.method()` audit: **PASS**
- runtime JS syntax: **111/111 PASS**
- public JSON parse: **434/434 PASS**
- non-scope runtime owner lock: **103/103 PASS**
- runtime JS diff vs HC029B: exactly **8** files listed in Allowed scope
- HC029A `TargetingSystem.js`: hash-locked / unchanged

A Vite production-build attempt was made, but `npm ci` did not complete before the environment cutoff. The partial `node_modules` directory was removed and is not included. Browser/controller feel remains the final authority for composition tuning.
