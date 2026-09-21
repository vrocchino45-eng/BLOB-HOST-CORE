import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GateSystem } from '../src/systems/GateSystem.js';
import { GateRegistry } from '../src/world/GateRegistry.js';
import { ThirdLocalCellMorphSystem } from '../src/morph/ThirdLocalCellMorphSystem.js';
import { StatusPageSystem } from '../src/ui/StatusPageSystem.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const assert = (condition, message) => { if (!condition) throw new Error(`[validateHubDeparturePrerequisiteHC006KA] ${message}`); };

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/data/build/buildManifest.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
assert([['HC-006KA','0.0.95'], ['HC-006KB','0.0.96'], ['HC-006KC','0.0.97'], ['HC-006KD','0.0.98'], ['HC-007A','0.0.99'], ['HC-007B','0.0.100'], ['HC-007C','0.0.101'], ['HC-007D','0.0.102', '0.0.103', '0.0.104', '0.0.105'], ['HC-007E','0.0.103', '0.0.104', '0.0.105'], ['HC-008B','0.0.104'], ['HC-008C','0.0.105'], ['HC-008D','0.0.106'], ['HC-008E','0.0.107', '0.0.108'], ['HC-008E','0.0.107', '0.0.108'], ['HC-008E','0.0.107', '0.0.108'], ['HC-008F','0.0.108'], ['HC-008G','0.0.109']].some(([id, version]) => manifest.id === id && manifest.version === version), 'manifest identity mismatch.');
assert(['0.0.95','0.0.96', '0.0.97', '0.0.98', '0.0.99','0.0.100', '0.0.101', '0.0.102', '0.0.103', '0.0.104', '0.0.105', '0.0.106', '0.0.107', '0.0.108', '0.0.109'].includes(pkg.version), 'package version mismatch.');

const gatesData = JSON.parse(fs.readFileSync(path.join(root, 'public/data/gates/firstSliceGates_HC006I.json'), 'utf8'));
const gateRegistry = new GateRegistry(gatesData);
const gateFrame = {
  activeCellId: 'CELL_SIGNAL_CHORUS_NERVE_001',
  currentMode: { id: 'hub_mode', regionId: 'hub_chamber' },
  hubChamberFoundation: { completed: true },
  firstSliceObjectives: {
    hub_read_route_gates: { foundationComplete: true, complete: false }
  }
};
const gate = new GateSystem({ gateRegistry, frameState: gateFrame });
gate.update(1 / 60, gateFrame);
let graveGate = gateFrame.firstSliceGates.hub_to_grave_memory_route;
assert(graveGate.status === 'readable', 'Grave Memory must remain readable before first Hub Status Page use.');
assert(graveGate.readable === true && graveGate.crossable === false, 'Readable Grave route must not be crossable before prerequisite.');
assert(graveGate.departureBlockedBy === 'first_hub_status_page_use_pending', 'Gate blocker must identify first Hub Status Page use.');

gateFrame.firstSliceObjectives.hub_read_route_gates.complete = true;
gate.update(1 / 60, gateFrame);
graveGate = gateFrame.firstSliceGates.hub_to_grave_memory_route;
assert(graveGate.status === 'crossable' && graveGate.crossable === true, 'Grave Memory must become crossable only after Hub objective completion.');

const morph = new ThirdLocalCellMorphSystem({
  recipeDataSystem: {}, visualComposer: {}, chemObjectSystem: {}, playerRoot: {}, scene: {}, frameState: {}
});
morph.plan = { readiness: { requiredPlayerComposition: { signal: 0.12, seed: 0.30, scarMax: 0.24 } } };
morph.readinessLatched = true;
const morphFrame = {
  activeCellId: 'CELL_SIGNAL_CHORUS_NERVE_001',
  secondLocalCellMorph: { completed: true },
  signalChorusInteraction: {
    preparedForNextBranch: true,
    stage: 'signal_chorus_tuned',
    progress: 1,
    listenTrust: 1,
    answerStrength: 1,
    harmony: 1,
    bridgeWarmth: 1,
    forceRisk: 0,
    currentFocus: 'seed_signal_bridge_001'
  },
  signalChorusArrival: {},
  targeting: { targetId: 'seed_signal_bridge_001' },
  playerComposition: { signal: 0.4, seed: 0.5, scar: 0.1 },
  input: { pulsePressed: true },
  hubChamberFoundation: { completed: true },
  statusPage: { firstHubUseComplete: false },
  firstSliceGates: { hub_to_grave_memory_route: { status: 'readable', crossable: false } }
};
let trigger = morph.evaluateTrigger(morphFrame);
assert(trigger.ready === false && trigger.start === false, 'Legacy third morph must not become ready before first Hub Status Page use.');
assert(trigger.reason === 'first_hub_status_page_use_pending', 'Third morph must report the Hub Status Page prerequisite.');
assert(trigger.hubDeparturePrerequisiteComplete === false, 'Departure prerequisite must remain incomplete.');

morphFrame.statusPage.firstHubUseComplete = true;
morphFrame.firstSliceGates.hub_to_grave_memory_route = { status: 'crossable', crossable: true };
trigger = morph.evaluateTrigger(morphFrame);
assert(trigger.ready === true && trigger.start === true, 'Existing Grave runtime adapter must become eligible after first Hub Status Page use.');
assert(trigger.hubDeparturePrerequisiteComplete === true, 'Departure prerequisite must publish complete after Hub self-reading.');

class FakeElement {
  constructor() { this.style = {}; this.children = []; this.innerHTML = ''; this.textContent = ''; this.scrollTop = 0; }
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.children.push(child); return child; }
}
globalThis.document = { body: new FakeElement(), createElement: () => new FakeElement() };
const outsideFrame = {
  currentMode: { id: 'legacy_route_mode', regionId: 'outside_first_slice' },
  input: { statusPageTogglePressed: true },
  playerComposition: {}, chemistry: {}, bondState: {}, chemObjectState: {}, objectiveState: {}, hubChamberFoundation: {}, controlMap: {}
};
const status = new StatusPageSystem({ appRoot: new FakeElement(), frameState: outsideFrame });
status.init();
status.update(0.016, outsideFrame);
assert(outsideFrame.statusPage.open === true, 'Status Page should still be usable outside Hub.');
assert(outsideFrame.statusPage.firstHubUseComplete === false, 'Opening Status Page outside Hub must not satisfy firstHubUse.');

const thirdSource = fs.readFileSync(path.join(root, 'src/morph/ThirdLocalCellMorphSystem.js'), 'utf8');
assert(thirdSource.includes('first_hub_status_page_use_pending'), 'Third morph source is missing explicit Hub prerequisite guard.');
assert(thirdSource.includes('hubDeparturePrerequisiteComplete'), 'Third morph source is missing departure prerequisite state.');

console.log('HC-006KA Hub departure prerequisite validation passed.');
