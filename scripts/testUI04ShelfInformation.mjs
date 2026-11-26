import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectPlayerInformation } from '../src/ui/PlayerInformationModel.js';
import { PlaytestHudSystem } from '../src/ui/PlaytestHudSystem.js';

const hostId = 'HOST_ALPHA_WOUNDED_NURSERY';
const cellId = 'CELL_SILT_PRESSURE_ROUTE_001';
const targetId = 'silt_porosity_shelf';
const receiverId = 'silt_porosity_shelf_front';
const text = 'Flow · Current accepted 0.40 · pressure 0.20 · resistance 0.30 · shelf imprint 0.10';

function fixture() {
  const step = { hostId, cellId, mountSequence: 2, frame: 40, substep: 1 };
  const result = {
    ...step,
    owner: 'silt:RegionalTerritoryExpansion',
    targetId, receiverId, actionSequence: 4,
    acceptedCurrent01: 0.4, pressure01: 0.2, resistance01: 0.3,
    after: { imprint: 0.1 }
  };
  const frame = {
    activeHostId: hostId, activeCellId: cellId, frame: 40, runtimeSimulationSubstepIndex: 1,
    firstSliceRuntimeMount: { mountSequence: 2, activeRuntimeCellId: cellId, activeSystemIds: ['siltPressureRouteSystem'] },
    quickLookInspector: { coreLabelsEnabled: true },
    siltPressureRoute: { active: true },
    runtimeExecution: { frame: 40, executedSystemIds: ['targetingSystem'] },
    targeting: { active: true, attentionActive: true, attentionTargetId: targetId, targetId },
    coreFlow: { step, result, lastResult: result, actionSequence: 4, contactValid: true, reason: 'contact' }
  };
  const hud = new PlaytestHudSystem({ recipeDataSystem: { data: {} }, frameState: frame });
  const read = () => hud.resolveHudState(frame, true).flowLine;
  const context = () => hud.resolveHudState(frame,true).contextualLabel?.text;
  return { frame, read, context };
}

test('current authoritative projection is the displayed delivery and leaves gameplay fields unchanged', () => {
  const { frame, read, context } = fixture();
  frame.playerInformation = projectPlayerInformation(frame);
  assert.equal(frame.playerInformation.accepted.flow.actualRecipient, receiverId);
  Object.defineProperty(frame.coreFlow.result, 'pressure01', { get() { assert.fail('Owner fallback was used'); } });
  assert.equal(read(), text);
  assert.equal(context(), 'Shelf · current accepted, resistance felt');
  assert.equal(frame.coreFlow.result.after.imprint, 0.1);
});

test('missing or stale projection uses only the fresh owner sample', () => {
  const { frame, read } = fixture();
  assert.equal(read(), text);
  frame.playerInformation = projectPlayerInformation(frame);
  frame.playerInformation = { ...frame.playerInformation,
    accepted: { flow: { ...frame.playerInformation.accepted.flow, actionSequence: 3, pressure01: 0.9 } } };
  assert.equal(read(), text);
  frame.coreFlow.overloaded = true;
  assert.match(read(), /Overload · current limited 0.40/);
});

test('prior step, earlier action and remount cannot display historical flow as current', () => {
  const { frame, read, context } = fixture();
  frame.playerInformation = projectPlayerInformation(frame);
  frame.coreFlow.actionSequence = 5;
  assert.doesNotMatch(read(), /Current accepted/);
  frame.coreFlow.actionSequence = 4;
  frame.runtimeSimulationSubstepIndex++;
  assert.doesNotMatch(read(), /Current accepted/);
  frame.runtimeSimulationSubstepIndex--;
  frame.firstSliceRuntimeMount.mountSequence++;
  assert.doesNotMatch(read(), /Current accepted/);
  assert.doesNotMatch(context() ?? '', /current accepted/);
  assert.equal(frame.coreFlow.lastResult.acceptedCurrent01, 0.4);
});

test('labels, menu, inspection, Core Work and release retain their existing presentation gates', () => {
  const { frame, read } = fixture();
  frame.playerInformation = projectPlayerInformation(frame);
  frame.quickLookInspector.coreLabelsEnabled = false;
  assert.equal(read(), '');
  frame.quickLookInspector.coreLabelsEnabled = true;
  frame.statusPage = { open: true };
  assert.equal(read(), '');
  frame.statusPage.open = false;
  frame.inspectionCamera = { active: true, coreWorkActive: true };
  assert.equal(read(), '');
  frame.inspectionCamera = { active: false, coreWorkActive: false };
  frame.coreFlow = { ...frame.coreFlow, contactValid: false, result: null, phase: 'recovering' };
  assert.equal(read(), 'Flow · Released · recovering');
});
