import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { Group, Scene } from 'three';
import { LocalChemistryContextSystem } from '../src/chemistry/LocalChemistryContextSystem.js';
import { GameRuntime } from '../src/core/GameRuntime.js';
import { SystemRegistry } from '../src/core/SystemRegistry.js';
import { SURFACE_MATERIAL_RESPONSE_SCOPE } from '../src/interaction/MaterialResponseScope.js';
import { VerbCompositionSystem } from '../src/interaction/VerbCompositionSystem.js';
import { CoreEmbodimentSystem } from '../src/player/CoreEmbodimentSystem.js';
import { CoreRadialPerformanceSystem } from '../src/player/CoreRadialPerformanceSystem.js';

const readData = (path) => JSON.parse(readFileSync(new URL(`../public/data/${path}`, import.meta.url), 'utf8'));
const host = readData('hosts/HOST_ALPHA_WOUNDED_NURSERY.json');
const { cellId, objectIds:[scarId] } = SURFACE_MATERIAL_RESPONSE_SCOPE;
const cell = readData('world/localCellRecipes.json').find(({ id }) => id === cellId);
const scar = readData('chemistry/chemObjectRecipes.json').find(({ id }) => id === scarId);
const stepSeconds = 0.04;
let startupCase = 0;

async function bootRuntime(context, search = '') {
  const document = { title:'BLOB', querySelector:() => ({}) };
  const globals = { document, window:{ location:{ search } } };
  const originals = Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  let runtime;
  const start = context.mock.method(GameRuntime.prototype, 'start', function () {
    runtime = this;
    // Exercise the application entry and constructor without booting WebGL.
    return new Promise(() => {});
  });
  try {
    for (const [key, value] of Object.entries(globals)) {
      Object.defineProperty(globalThis, key, { configurable:true, value });
    }
    const url = new URL('../src/main.js', import.meta.url);
    url.searchParams.set('case', String(startupCase++));
    await import(url.href);
  } finally {
    start.mock.restore();
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
  return { runtime, title:document.title };
}

function mountScar(runtime, zone, pieceCount = 3) {
  const frameState = {
    frame:0, runtimeSeconds:0, activeCellId:cellId, activeHostId:host.id,
    input:{ stabilizeHeld:true },
    firstSliceRuntimeMount:{ activeSystemIds:['reactiveStateGrammarSystem'] },
    targeting:{ relationshipActive:true, relationshipTargetId:scarId },
    coreEngine:Object.freeze({ phaseCount:3 }),
    returnRegionEngine:Object.freeze({ unlockedPhaseCount:3, creditCount:0 })
  };
  const scene = new Scene();
  const playerRoot = new Group();
  const recipes = { get(group) { return group === 'hosts' ? host : cell; } };
  const embodiment = new CoreEmbodimentSystem({ scene, playerRoot, frameState });
  const counts = { deep_core:0, inner_body:0, membrane:0, [zone]:pieceCount };
  frameState.spatialCoreChemistry = {
    counts, retainedPieceCount:pieceCount, topology:embodiment.getWholeCoreTopology(counts, pieceCount)
  };
  Object.assign(runtime, {
    recipeDataSystem:recipes, frameState, localCellRecipe:cell, playerCore:playerRoot,
    visualComposer:{}, coreEmbodimentSystem:embodiment
  });
  runtime.createChemistrySystems();
  runtime.chemObjectSystem.objects.push({ recipe:scar, root:new Group(), cellId });

  const radial = new CoreRadialPerformanceSystem({ playerRoot, frameState });
  const reactive = runtime.reactiveStateGrammarSystem;
  const registry = new SystemRegistry();
  registry.register('localChemistryContextSystem', new LocalChemistryContextSystem({ recipeDataSystem:recipes, frameState }));
  registry.register('targetingSystem', { update() {} });
  registry.register('verbCompositionSystem', new VerbCompositionSystem({ frameState }));
  registry.register('reactiveStateGrammarSystem', reactive, { runtimeScope:'active_region', lazyInit:true });
  registry.register('coreRadialPerformanceSystem', radial);

  return {
    frameState, reactive,
    get condition() { return reactive.states.get(scarId).condition01; },
    tick(steps = 1) {
      for (let i = 0; i < steps; i += 1) {
        frameState.frame += 1;
        frameState.runtimeSeconds += stepSeconds;
        registry.update(stepSeconds, frameState);
      }
    }
  };
}

test('Standard startup uses Core coherence in the mounted scar repair path', async (context) => {
  const { runtime, title } = await bootRuntime(context);
  assert.equal(title, 'BLOB');
  const rates = ['deep_core', 'inner_body', 'membrane'].map((zone) => {
    const world = mountScar(runtime, zone);
    assert.equal(world.reactive.repairTrialEnabled, true);
    world.tick(12);
    assert.equal(world.frameState.coreEngine.phaseCount, 3);
    assert.deepEqual(world.frameState.returnRegionEngine, { unlockedPhaseCount:3, creditCount:0 });
    return { condition:world.condition, factor:world.reactive.lastRepairFactor };
  });
  assert.ok(rates[0].factor > rates[1].factor && rates[1].factor > rates[2].factor);
  assert.ok(rates[0].condition < rates[1].condition && rates[1].condition < rates[2].condition);
});

test('The explicit comparison keeps the original repair rate and the trial marker', async (context) => {
  const comparison = await bootRuntime(context, '?coreRepairTrial=0');
  const deep = mountScar(comparison.runtime, 'deep_core');
  const membrane = mountScar(comparison.runtime, 'membrane');
  deep.tick(12);
  membrane.tick(12);
  assert.equal(deep.reactive.lastRepairFactor, 1);
  assert.equal(membrane.reactive.lastRepairFactor, 1);
  assert.equal(deep.condition, membrane.condition);
  assert.equal(comparison.title, 'BLOB');

  const trial = await bootRuntime(context, '?coreRepairTrial=1');
  assert.equal(trial.runtime.coreRepairTrial, true);
  assert.equal(trial.title, 'BLOB [Core repair trial]');
});

test('Incomplete, stale and inspection samples retain the existing repair guards', async (context) => {
  const { runtime } = await bootRuntime(context);
  const forming = mountScar(runtime, 'deep_core', 2);
  forming.tick(2);
  assert.equal(forming.reactive.lastRepairFactor, 1);

  const world = mountScar(runtime, 'deep_core');
  world.tick();
  assert.equal(world.reactive.lastRepairFactor, 1);
  world.tick();
  assert.ok(world.reactive.lastRepairFactor > 1);
  world.frameState.frame += 1;
  world.tick();
  assert.equal(world.reactive.lastRepairFactor, 1);

  const condition = world.condition;
  world.frameState.inspectionCamera = { active:true };
  world.tick();
  assert.equal(world.condition, condition);
  assert.equal(world.reactive.lastRepairFactor, 1);
});
