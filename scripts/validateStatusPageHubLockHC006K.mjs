import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StatusPageSystem } from '../src/ui/StatusPageSystem.js';
import { ControlMap } from '../src/input/ControlMap.js';
import { ObjectiveSystem } from '../src/systems/ObjectiveSystem.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

class FakeElement {
  constructor() {
    this.style = {};
    this.children = [];
    this.innerHTML = '';
    this.textContent = '';
    this.scrollTop = 0;
  }
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); return child; }
}

globalThis.document = {
  body: new FakeElement(),
  createElement: () => new FakeElement()
};

const frameState = {
  currentMode: { id: 'hub_mode', regionId: 'hub_chamber', regionDisplayName: 'Hub Chamber' },
  activeCellId: 'CELL_SIGNAL_CHORUS_NERVE_001',
  input: { statusPageTogglePressed: true },
  playerComposition: { form: 0.3, flux: 0.2, scar: 0.1, seed: 0.3, signal: 0.1 },
  chemistry: { form: 0.2, flux: 0.2, scar: 0.1, seed: 0.3, signal: 0.2 },
  bondState: {},
  chemObjectState: {},
  objectiveState: {},
  hubChamberFoundation: { routes: [] },
  controlMap: { controller: {}, keyboard: {} }
};

const status = new StatusPageSystem({ appRoot: new FakeElement(), frameState });
status.init();
status.update(0.016, frameState);
assert(frameState.statusPage.open === true, 'Status Page did not open from toggle input.');
assert(frameState.statusPage.firstHubUseComplete === true, 'First Hub Status Page use did not complete.');
assert(frameState.statusMode.active === true, 'Status Mode did not activate.');
assert(frameState.statusMode.uiMutatesGameplayState === false, 'Status Mode must remain read-only for gameplay truth.');
assert(frameState.input.moveX === 0 && frameState.input.pulsePressed === false, 'Gameplay input was not suppressed while Status Page was open.');

frameState.input = { statusTabNextPressed: true };
status.update(0.016, frameState);
assert(frameState.statusPage.activeTab === 'Chemistry', 'LB/RB-style next tab did not cycle to Chemistry.');
frameState.input = { menuRightPressed: true };
status.update(0.016, frameState);
assert(frameState.statusPage.activeTab === 'Region', 'D-Pad Right did not cycle to Region.');
frameState.input = { cancelPressed: true };
status.update(0.016, frameState);
assert(frameState.statusPage.open === false, 'Cancel did not close Status Page.');

const controlMap = new ControlMap();
const buttons = new Map();
const button = (index) => buttons.get(index) ?? { down: false, value: 0 };
buttons.set(8, { down: true, value: 1 });
const mapped = controlMap.mapGamepad({
  leftX: 0, leftY: 0, rightX: 0, rightY: 0,
  triggerLeft: 0, triggerRight: 0,
  button,
  pressedEdge: (index, down) => index === 8 && down
});
assert(mapped.statusPageTogglePressed === true, 'View/Select is not mapped to Status Page toggle.');

const objectiveRegistry = {
  getByRegionId: () => ({
    id: 'hub_read_route_gates',
    regionId: 'hub_chamber',
    displayText: 'Hub objective',
    steps: ['hub_junction_anchor_readable','three_route_gate_layout_readable','active_route_identity_distinguished','first_memory_fragment_readable','first_status_page_use'],
    onComplete: 'lock_first_slice_hub_foundation'
  })
};
const regionRegistry = { getByRuntimeCellId: () => ({ id: 'hub_chamber' }) };
const objectiveFrame = {
  activeCellId: 'CELL_SIGNAL_CHORUS_NERVE_001',
  surfaceWakeLayeredInteraction: {}, localCellMorph: {},
  guideThresholdLayeredInteraction: {}, secondLocalCellMorph: {},
  signalChorusLayeredInteraction: { completed: true },
  hubChamberFoundation: {
    active: true, completed: true, centralAnchorReadable: true,
    threeRouteLayoutReadable: true, activeRouteIdentityDistinguished: true,
    firstMemoryFragmentReadable: true, activeRouteId: 'grave_memory_route', routeCount: 3, dormantRouteCount: 2
  },
  statusPage: { firstHubUseComplete: false }
};
const objectives = new ObjectiveSystem({ objectiveRegistry, regionRegistry, frameState: objectiveFrame });
objectives.update(0.016, objectiveFrame);
assert(objectiveFrame.objectiveState.progress === 0.8, 'Hub objective should be 80% before first Status Page use.');
assert(objectiveFrame.objectiveState.complete === false, 'Hub objective completed before first Status Page use.');
assert(objectiveFrame.objectiveState.blocker === 'open_status_page_with_view_select_or_tab', 'Hub objective blocker does not point to Status Page use.');
objectiveFrame.statusPage.firstHubUseComplete = true;
objectives.update(0.016, objectiveFrame);
assert(objectiveFrame.objectiveState.progress === 1, 'Hub objective did not reach 100% after Status Page use.');
assert(objectiveFrame.objectiveState.complete === true, 'Hub objective did not complete after Status Page use.');

const objectiveJson = JSON.parse(fs.readFileSync(path.join(root, 'public/data/objectives/firstSliceObjectives_HC006I.json'), 'utf8'));
const hubObjective = objectiveJson.find((item) => item.id === 'hub_read_route_gates');
assert(hubObjective?.steps?.includes('first_status_page_use'), 'Authored Hub objective is missing first_status_page_use.');

const gameRuntimeSource = fs.readFileSync(path.join(root, 'src/core/GameRuntime.js'), 'utf8');
assert(gameRuntimeSource.includes('StatusPageSystem'), 'GameRuntime does not register StatusPageSystem.');
assert(gameRuntimeSource.includes('statusPageSystem'), 'StatusPageSystem runtime registration missing.');

console.log('HC-006K Status Page and Hub lock validation passed.');
