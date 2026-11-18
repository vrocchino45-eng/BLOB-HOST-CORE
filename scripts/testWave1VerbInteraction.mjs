import assert from "node:assert/strict";
import { test } from "node:test";
import * as THREE from "three";
import { BondSystem } from "../src/chemistry/BondSystem.js";
import { ChemObjectSystem } from "../src/chemistry/ChemObjectSystem.js";
import { GameRuntime } from "../src/core/GameRuntime.js";
import { SystemRegistry } from "../src/core/SystemRegistry.js";
import { InputSystem } from "../src/input/InputSystem.js";
import { StabilizedProjectionSystem } from "../src/interaction/StabilizedProjectionSystem.js";
import { VerbCompositionSystem } from "../src/interaction/VerbCompositionSystem.js";
import { CoreRadialPerformanceSystem } from "../src/player/CoreRadialPerformanceSystem.js";

const stepSeconds = 1 / 60;
const pulse = { pulsePressed: true, pulseEventId: 1, pulseReleaseKind: "quick" };
const stabilize = { stabilizeHeld: true };
const absorb = { absorbHeld: true };

function makeInteraction(zone) {
  const frameState = {
    frame: 0,
    runtimeSeconds: 0,
    chemObjectState: {},
    playerKinematics: { cameraRelativeForward: { x: 0, y: 0, z: -1 } },
    firstSliceRuntimeMount: {
      activeSystemIds: ["chemObjectSystem", "hostRhythmSystem", "targetingSystem", "bondSystem"]
    },
    spatialCoreChemistry: zone && {
      retainedPieceCount: 3,
      counts: { deep_core: 0, inner_body: 0, membrane: 0, [zone]: 3 },
      topology: { id: zone, complete: true }
    }
  };
  const playerRoot = new THREE.Group();
  const objects = new Map([
    ["front", [0, 0, -0.8]],
    ["side", [0.75, 0, -0.4]],
    ["distant", [0, 0, -4.3]]
  ].map(([id, position]) => [id, {
    id,
    spawn: { position },
    visual: {},
    chemistry: { bondTypes: ["soft_bond"], absorbDifficulty: 0.2 },
    behavior: { onAbsorb: true }
  }]));
  const bondRecipes = new Map([["soft_bond", { id: "soft_bond", behavior: {} }]]);
  const recipeDataSystem = {
    data: { chemObjectRecipes: objects, bondRecipes },
    get(group, id) { return this.data[group].get(id); }
  };
  const visualComposer = {
    scene: new THREE.Scene(),
    compose({ position }) {
      const root = new THREE.Group();
      root.position.fromArray(position);
      return root;
    }
  };
  const chemistry = new ChemObjectSystem({
    recipeDataSystem, visualComposer, playerRoot, frameState,
    localCellRecipe: { id: "test_cell", contents: { chemObjects: [...objects.keys()] } }
  });
  const radial = new CoreRadialPerformanceSystem({ frameState, playerRoot });
  const registry = new SystemRegistry();
  let nextTargetId = "front";
  let earlyContacts;
  const runtime = {
    registry,
    chemObjectSystem: chemistry,
    hostRhythmSystem: {
      update(_dt, frame) { if (frame.input.pulsePressed) earlyContacts = [...frame.pulse.affectedObjects]; }
    },
    targetingSystem: {
      update(_dt, frame) {
        const previous = frame.targeting;
        frame.targeting = {
          active: Boolean(nextTargetId),
          relationshipActive: Boolean(nextTargetId),
          relationshipSequence: (previous?.relationshipSequence ?? 0) + Number(previous?.relationshipTargetId !== nextTargetId),
          relationshipTargetId: nextTargetId ?? "none",
          targetId: nextTargetId ?? "none",
          candidateId: "side"
        };
      }
    },
    verbCompositionSystem: new VerbCompositionSystem({ frameState }),
    bondSystem: new BondSystem({ recipeDataSystem, chemObjectSystem: chemistry, playerRoot, frameState }),
    stabilizedProjectionSystem: new StabilizedProjectionSystem({ frameState }),
    coreRadialPerformanceSystem: radial
  };
  GameRuntime.prototype.registerRuntimeSystems.call(new Proxy(runtime, {
    get(owner, key) { return owner[key] ?? {}; }
  }));

  return {
    frameState,
    chemistry,
    radial,
    setTarget(id) { nextTargetId = id; },
    get earlyContacts() { return earlyContacts; },
    item(id = "front") { return chemistry.objects.find(({ recipe }) => recipe.id === id); },
    tick(input = {}, steps = 1) {
      for (let step = 0; step < steps; step += 1) {
        frameState.input = input;
        frameState.frame += 1;
        frameState.runtimeSeconds += stepSeconds;
        registry.update(stepSeconds, frameState);
      }
      return frameState.verbComposition;
    }
  };
}

test("Stabilize establishes control only on the retained target and clears it on handoff or release", () => {
  const game = makeInteraction();
  const initial = game.tick(stabilize);
  const held = game.tick(stabilize, 30);
  assert.equal(held.chord, "cohere");
  assert.equal(held.control.targetId, "front");
  assert.ok(held.control.strength01 > initial.control.strength01);
  assert.ok(held.effects.targetMotionDamping01 > 0);

  game.setTarget("side");
  const handedOff = game.tick(stabilize);
  assert.equal(handedOff.control.targetId, "side");
  assert.equal(handedOff.control.strength01, initial.control.strength01);
  assert.equal(game.tick(absorb).control, null);
  assert.equal(game.tick({ resonanceHeld: true }).control.strength01, initial.control.strength01);

  game.setTarget(null);
  const unbound = game.tick(stabilize);
  assert.equal(unbound.control, null);
  assert.equal(unbound.effects.targetMotionDamping01, 0);
});

test("Controller X releases one Pulse, RT holds Absorb, and LT holds Stabilize", (context) => {
  const buttons = Array.from({ length: 17 }, () => ({ pressed: false, value: 0 }));
  const pad = { index: 0, id: "Test gamepad", mapping: "standard", axes: [0, 0, 0, 0], buttons };
  const priorNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { getGamepads: () => [pad] } });
  context.after(() => {
    if (priorNavigator) Object.defineProperty(globalThis, "navigator", priorNavigator);
    else Reflect.deleteProperty(globalThis, "navigator");
  });

  const input = new InputSystem();
  const frame = { frame: 0, runtimeSeconds: 0, input: {}, inputSource: {} };
  function readActions() {
    frame.frame += 1;
    frame.runtimeSeconds += stepSeconds;
    input.update(stepSeconds, frame);
    const { pulseHeld, pulsePressed, absorbHeld, stabilizeHeld } = frame.input;
    return { pulseHeld, pulsePressed, absorbHeld, stabilizeHeld };
  }

  buttons[2].value = 1;
  assert.deepEqual(readActions(), { pulseHeld: true, pulsePressed: false, absorbHeld: false, stabilizeHeld: false });
  buttons[2].value = 0;
  assert.deepEqual(readActions(), { pulseHeld: false, pulsePressed: true, absorbHeld: false, stabilizeHeld: false });
  buttons[7].value = 1;
  assert.deepEqual(readActions(), { pulseHeld: false, pulsePressed: false, absorbHeld: true, stabilizeHeld: false });
  buttons[7].value = 0;
  buttons[6].value = 1;
  assert.deepEqual(readActions(), { pulseHeld: false, pulsePressed: false, absorbHeld: false, stabilizeHeld: true });
});

test("Pulse publishes broad discovery early and applies recoil once to the current step's targets", () => {
  const game = makeInteraction();
  game.setTarget("side");
  game.tick();
  game.setTarget("front");
  game.tick({ ...stabilize, ...pulse });
  const response = game.frameState.pulse;
  assert.deepEqual(game.earlyContacts, ["front", "side"]);
  assert.deepEqual(response.affectedObjects, game.earlyContacts);
  assert.equal(response.focusedObject, "front");
  assert.equal(response.focusSource, "retained_relationship");
  assert.equal(response.stabilizedProjectionMode, "self_braced");
  assert.deepEqual(response.ambientObjects, ["side"]);
  const velocity = game.chemistry.getResponseState(game.item()).velocity;
  assert.ok(velocity.z < 0);
  const releasedVelocity = velocity.clone();
  game.chemistry.applyPulseToObjects(game.frameState);
  assert.ok(velocity.equals(releasedVelocity));
  assert.equal(game.item().root.position.z, -0.8);

  game.frameState.firstSliceRuntimeMount.activeSystemIds = [];
  game.tick({ ...pulse, pulseEventId: 2 });
  assert.equal(game.frameState.pulse, response);
  assert.ok(velocity.equals(releasedVelocity));

  const unbound = makeInteraction();
  unbound.setTarget(null);
  unbound.tick({ ...stabilize, ...pulse });
  assert.equal(unbound.frameState.pulse.focusSource, "stabilized_projection_direction");
  assert.equal(unbound.frameState.pulse.focusedObject, "front");
  assert.equal(unbound.frameState.targeting.relationshipActive, false);
});

test("Pulse and Absorb oppose each other while Stabilize contains the draw", () => {
  function interact(input, preparation = {}) {
    const game = makeInteraction();
    game.tick(preparation, 45);
    const composition = game.tick(input);
    return {
      chord: composition.chord,
      pulse: game.chemistry.getResponseState(game.item()).velocity.length(),
      pull: game.item().root.position.z + 0.8,
      spin: game.item().root.rotation.y,
      progress: game.frameState.bondState.absorbProgress
    };
  }
  const pushed = interact(pulse);
  const drawn = interact(absorb);
  const opposed = interact({ ...pulse, ...absorb });
  assert.equal(opposed.chord, "exchange");
  assert.ok(opposed.pulse > 0 && opposed.pulse < pushed.pulse);
  assert.ok(opposed.pull > 0 && opposed.pull < drawn.pull);
  assert.ok(opposed.progress > 0 && opposed.progress < drawn.progress);

  const controlled = interact({ ...absorb, ...stabilize }, stabilize);
  assert.equal(controlled.chord, "cohere_draw");
  assert.ok(controlled.spin > 0 && controlled.spin < drawn.spin);
  assert.ok(controlled.progress > opposed.progress);
});

test("Core configuration and endurance shape interaction output, control, and cost", () => {
  function measure(zone, reserve = 1) {
    const game = makeInteraction(zone);
    game.radial.reserve01 = reserve;
    const held = game.tick(stabilize, 45);
    const endurance = game.frameState.corePerformance.endurance;
    const stabilizeCost = game.frameState.corePerformance.verbModifiers.stabilize.costMultiplier;
    game.tick({ ...pulse, ...absorb });
    const recoil = game.chemistry.getResponseState(game.item()).velocity.length();
    const pull = game.item().root.position.z + 0.8;
    game.tick(absorb, 16);
    const priorProgress = game.frameState.bondState.absorbProgress;
    game.tick(absorb);
    return {
      control: held.control.strength01,
      reserve: endurance.reserve01,
      stabilizeCost,
      recoil,
      pull,
      progress: game.frameState.bondState.absorbProgress - priorProgress
    };
  }
  const deep = measure("deep_core");
  const membrane = measure("membrane");
  const fatigued = measure("membrane", 0.12);
  assert.ok(deep.control > membrane.control);
  assert.ok(deep.reserve > membrane.reserve);
  assert.ok(deep.stabilizeCost < membrane.stabilizeCost);
  assert.ok(membrane.recoil > deep.recoil && membrane.recoil > fatigued.recoil);
  assert.ok(membrane.pull > deep.pull && membrane.pull > fatigued.pull);
  assert.ok(membrane.progress > deep.progress && membrane.progress > fatigued.progress);
  assert.ok(membrane.control > fatigued.control);
});
