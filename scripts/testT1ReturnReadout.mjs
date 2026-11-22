import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Object3D, PerspectiveCamera, Scene } from 'three';
import { HubChamberFoundationSystem } from '../src/hub/HubChamberFoundationSystem.js';
import { HubInvestigationGameplaySystem } from '../src/hub/HubInvestigationGameplaySystem.js';
import { DeliberateCommitmentSystem } from '../src/input/DeliberateCommitmentSystem.js';
import { ModeController } from '../src/modes/ModeController.js';
import { LocalCellBoundaryMorphSystem } from '../src/morph/LocalCellBoundaryMorphSystem.js';
import { LOCAL_CELL_BOUNDARY_RECIPES_HC016G } from '../src/morph/LocalCellBoundaryRecipeRegistry.js';
import { PlaytestHudSystem } from '../src/ui/PlaytestHudSystem.js';

const HUB_CELL = 'CELL_SIGNAL_CHORUS_NERVE_001';
const REAPPROACH = 'Move away, then approach the fold again';
const RETURN = 'Swim through to Hub';
const NATIVE = 'Follow the native route guidance.';
const spokes = [
  { name: 'Grave', route: 'grave', flag: 'hubToGraveReady', state: 'graveMemoryRoute' },
  { name: 'Vascular', route: 'vascular', flag: 'hubToVascularPlayableReady', state: 'vascularRhythmRoute' },
  { name: 'Silt', route: 'silt', flag: 'hubToSiltPlayableReady', state: 'siltPressureRoute' }
].map(spoke => ({
  ...spoke,
  entry: LOCAL_CELL_BOUNDARY_RECIPES_HC016G.find(recipe => recipe.id === `hub_to_${spoke.route}`),
  exit: LOCAL_CELL_BOUNDARY_RECIPES_HC016G.find(recipe => recipe.id === `${spoke.route}_to_hub`)
}));

function setup(labels, selected = spokes) {
  const playerRoot = new Object3D();
  playerRoot.position.set(12, 0, 12);
  const camera = new PerspectiveCamera();
  camera.position.set(12, 1, 17);
  const frameState = {
    frame: 0,
    activeCellId: HUB_CELL,
    input: {},
    act1RouteHistory: {},
    hubChamberFoundation: { active: true },
    transitionContinuity: Object.fromEntries(selected.map(spoke => [spoke.flag, true])),
    quickLookInspector: { coreLabelsEnabled: labels }
  };
  const scene = new Scene();
  const recipeDataSystem = { data: {} };
  const hub = new HubChamberFoundationSystem({ recipeDataSystem, scene, playerRoot, frameState });
  hub.recipe = {
    routes: selected.map(({ name, entry }, index) => ({
      id: entry.routeId, gateId: entry.gateId, displayName: name,
      status: 'dormant_route', position: [14 + index * 4, 0, 12]
    }))
  };
  hub.reveal = hub.routeIdentityReveal = 1;
  hub.spatialTruth.verified = true;
  const hud = new PlaytestHudSystem({ recipeDataSystem, frameState });
  const picker = new HubInvestigationGameplaySystem({ recipeDataSystem, scene, playerRoot, frameState });
  picker.recipe = { sourceCellId: HUB_CELL };
  const commit = new DeliberateCommitmentSystem({ frameState });
  const boundary = new LocalCellBoundaryMorphSystem({
    playerRoot, frameState, recipes: selected.flatMap(({ entry, exit }) => [entry, exit])
  });
  const mode = new ModeController({
    frameState, regionRegistry: {}, cameraProfileRegistry: {}, visualLanguageRegistry: {}
  });
  boundary.init();
  return { playerRoot, camera, frameState, hub, hud, picker, commit, boundary, mode };
}

test('Hub fallback names only prepared spokes and preserves commit and Comb priority', () => {
  const { frameState, hub, hud, picker, boundary } = setup(true);
  frameState.transitionContinuity.hubToSiltPlayableReady = false;
  boundary.publishCompatibilityReadModel(frameState);
  frameState.hubChamberFoundation = hub.createState(true, true);
  assert.equal(frameState.hubChamberFoundation.objectiveLine, 'Routes ready to approach: Grave, Vascular.');
  assert.match(hud.resolveHudState(frameState, true).primaryInstruction, /Press A \/ E when offered/);
  assert.match(frameState.hubChamberFoundation.guideLine, /readings are optional/);

  frameState.act1RouteHistory = { graveReturned: true, graveMemoryImprintCommitted: true };
  frameState.transitionContinuity.hubToSiltPlayableReady = true;
  boundary.publishCompatibilityReadModel(frameState);
  frameState.hubChamberFoundation = hub.createState(true, true);
  assert.equal(frameState.hubChamberFoundation.objectiveLine, 'Routes ready to approach: Grave, Vascular, Silt.');
  assert.match(frameState.hubChamberFoundation.guideLine, /pearl/);

  frameState.hubInvestigationGameplay = { threeRouteConvergence: { completed: true } };
  assert.match(hub.createState(true, true).objectiveLine, /Comb Threshold/);
  picker.updateCommitCandidate(frameState);
  picker.publishCommitmentOpportunity(frameState);
  assert.equal(hub.createState(true, true).nextAction, 'Press A / E to enter Grave.');
});

test('Each Hub spoke displays distinct commit, approach, and unavailable guidance', () => {
  for (const spoke of spokes) {
    const { frameState, playerRoot, hub, hud, picker, boundary } = setup(false, [spoke]);
    const readInstruction = () => {
      boundary.publishCompatibilityReadModel(frameState);
      frameState.hubChamberFoundation = hub.createState(true, true);
      picker.updateCommitCandidate(frameState);
      picker.publishCommitmentOpportunity(frameState);
      frameState.hubInvestigationGameplay = picker.createState(true);
      return hud.resolveHudState(frameState, true).primaryInstruction;
    };

    assert.equal(readInstruction(), `Press A / E to enter ${spoke.name}.`);
    assert.equal(frameState.hubRouteCommit.available, true);

    playerRoot.position.x = 11;
    assert.ok(readInstruction().startsWith(`Move closer to ${spoke.name}`));
    assert.equal(frameState.hubRouteCommit.available, false);

    playerRoot.position.x = 12;
    frameState.transitionContinuity[spoke.flag] = false;
    assert.match(readInstruction(), /^No route is ready yet\./);
    assert.equal(frameState.hubRouteCommit.available, false);
  }
});

function exerciseSpoke(spoke, labels) {
  const { playerRoot, camera, frameState, hub, hud, picker, commit, boundary, mode } = setup(labels, [spoke]);
  const { entry, exit } = spoke;
  const trace = [];
  const step = (dt = 1 / 60) => {
    frameState.frame += 1;
    boundary.update(dt, frameState);
    const cell = frameState.activeCellId;
    mode.publishRuntimeMount(frameState, { id: cell }, { id: cell }, null);
    const input = frameState.input;
    const inputBeforeReadout = { ...input };
    const instruction = hud.resolveHudState(frameState, true).primaryInstruction;
    assert.equal(frameState.input, input);
    assert.deepEqual(input, inputBeforeReadout);
    trace.push({
      cell, mount: frameState.firstSliceRuntimeMount.mountSequence,
      crossing: frameState.localCellBoundaryMorph.activeRecipeId,
      history: structuredClone(frameState.act1RouteHistory),
      input: { ...frameState.input },
      position: playerRoot.position.toArray(), facing: playerRoot.quaternion.toArray(),
      cameraPosition: camera.position.toArray(), cameraFacing: camera.quaternion.toArray()
    });
    return instruction;
  };
  const offer = () => {
    frameState.hubChamberFoundation = hub.createState(true, true);
    picker.updateCommitCandidate(frameState);
    picker.publishCommitmentOpportunity(frameState);
  };
  const press = (eventId) => {
    frameState.input = { interactPressed: true, interactEventId: eventId, flowDemand01: 0.7 };
    commit.update(0, frameState);
    picker.handleCommitEvent(frameState);
  };

  frameState.transitionContinuity[spoke.flag] = false;
  step();
  offer();
  assert.equal(picker.commitCandidate, null);
  assert.equal(hud.resolveHudState(frameState, true).primaryInstruction, 'No Hub route is ready yet.');
  frameState.transitionContinuity[spoke.flag] = true;
  playerRoot.position.x = 11;
  step();
  offer();
  assert.equal(picker.commitCandidate, null);
  playerRoot.position.x = 12;

  for (const [eventId, interrupt] of [[1, { cancelPressed: true }], [2, { coreWorkViewPressed: true }]]) {
    offer();
    press(eventId);
    assert.equal(frameState.hubRouteCommitRequest.routeId, entry.routeId);
    Object.assign(frameState.input, interrupt);
    picker.updateCommitLatch(frameState);
    step();
    assert.equal(frameState.hubRouteCommitRequest, null);
    assert.equal(frameState.activeCellId, HUB_CELL);
    assert.equal(boundary.activeRecipeId, null);
    frameState.input = {};
  }

  for (let visit = 0; visit < 2; visit += 1) {
    offer();
    press(3 + visit);
    step();
    assert.equal(boundary.activeRecipeId, entry.id);
    step(entry.durationSeconds);
    assert.equal(frameState.activeCellId, exit.sourceCellId);
    picker.update(0, frameState);

    const route = frameState[spoke.state] ??= {
      active: true, returnFoldDistance: 0.25, nextAction: NATIVE
    };
    if (visit === 0) {
      assert.equal(step(), NATIVE);
      route.returnFoldReady = true;
      assert.equal(step(), NATIVE);
      assert.equal(boundary.activeRecipeId, null);
      Object.assign(route, { completed: true, graveMemoryImprintCommitted: true });
    }
    const guidance = step();
    assert.equal(guidance, labels ? REAPPROACH : NATIVE);
    assert.equal(boundary.activeRecipeId, null);
    const guard = frameState.localCellBoundaryMorphById[exit.id].proximityReturnGuard;
    assert.equal(guard.armed, false);
    assert.equal(guard.departureDistance, exit.interactionRange + 0.30);

    if (labels) {
      frameState.statusPage = { open: true };
      assert.equal(hud.actionFromState(frameState), NATIVE);
      delete frameState.statusPage;
      frameState.inspectionCamera = { active: true };
      assert.equal(hud.actionFromState(frameState), NATIVE);
      delete frameState.inspectionCamera;
      frameState.tightInspectionCamera = { active: true, coreWorkActive: true };
      assert.match(hud.actionFromState(frameState), /Guide is attending the Core/);
      delete frameState.tightInspectionCamera;
    }

    route.returnFoldDistance = guard.departureDistance;
    step();
    assert.equal(frameState.localCellBoundaryMorphById[exit.id].proximityReturnGuard.armed, false);
    route.returnFoldDistance += 0.05;
    assert.equal(step(), labels ? RETURN : NATIVE);
    assert.equal(frameState.localCellBoundaryMorphById[exit.id].proximityReturnGuard.armed, true);

    if (spoke.route === 'grave') {
      frameState.graveResonanceGameplay = { active: true, nextAction: 'Read Grave II.' };
      assert.equal(hud.actionFromState(frameState), 'Read Grave II.');
      route.returnFoldDistance = exit.interactionRange + 0.05;
      assert.equal(step(), labels ? RETURN : 'Read Grave II.');
    }

    route.returnFoldDistance = 0.25;
    step();
    assert.equal(boundary.activeRecipeId, exit.id);
    step(exit.durationSeconds);
    assert.equal(frameState.activeCellId, HUB_CELL);
    assert.equal(frameState.act1RouteHistory.routeStates[entry.routeId].returnCount, visit + 1);
    assert.ok(![REAPPROACH, RETURN].includes(hud.actionFromState(frameState)));
    delete frameState.graveResonanceGameplay;
    frameState.input = {};
  }
  return trace;
}

for (const spoke of spokes) {
  test(`${spoke.name} entry, first return and revisit have identical owner traces with labels on and off`, () => {
    assert.deepEqual(exerciseSpoke(spoke, true), exerciseSpoke(spoke, false));
  });
}
