import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StatusPageSystem } from '../src/ui/StatusPageSystem.js';
import { ObjectiveSystem } from '../src/systems/ObjectiveSystem.js';
import { GateSystem } from '../src/systems/GateSystem.js';
import { GateRegistry } from '../src/world/GateRegistry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateStatusPageCompletionCommitHC006KB] ${message}`);
};

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/data/build/buildManifest.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (['HC-012A', 'HC-012B', 'HC-012C', 'HC-013A', 'HC-013B', 'HC-013C', "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)) {
  assert(manifest.version === (manifest.id === 'HC-014I' ? '0.0.142' : manifest.id === 'HC-014G' ? '0.0.140' : manifest.id === 'HC-014F' ? '0.0.139' : manifest.id === 'HC-014E' ? '0.0.138' : manifest.id === 'HC-014D' ? '0.0.137' : manifest.id === 'HC-014C' ? '0.0.136' : manifest.id === 'HC-014B' ? '0.0.135' : manifest.id === 'HC-014A' ? '0.0.134' : manifest.id === 'HC-013D' ? '0.0.133' : manifest.id === 'HC-013C' ? '0.0.132' : manifest.id === 'HC-013B' ? '0.0.131' : manifest.id === 'HC-013A' ? '0.0.130' : manifest.id === 'HC-012C' ? '0.0.129' : manifest.id === 'HC-012B' ? '0.0.128' : '0.0.127') && pkg.version === manifest.version, 'HC-012A/HC-012B Status lineage identity mismatch.');
} else if (manifest.id === 'HC-011B') {
  assert(manifest.version === '0.0.126' && pkg.version === manifest.version, 'HC-011B Status lineage identity mismatch.');
} else if (manifest.id === 'HC-011A1') {
  assert(manifest.version === '0.0.125' && pkg.version === manifest.version, 'HC-011A1 Status lineage identity mismatch.');
} else if (manifest.id === 'HC-011A') {
  assert(manifest.version === '0.0.124' && pkg.version === manifest.version, 'HC-011A Status lineage identity mismatch.');
} else if (manifest.id === 'HC-010G') {
  assert(manifest.version === '0.0.123' && pkg.version === manifest.version, 'HC-010G Status lineage identity mismatch.');
} else if (manifest.id === 'HC-010F') {
  assert(manifest.version === '0.0.122' && pkg.version === manifest.version, 'HC-010F Status lineage identity mismatch.');
} else if (manifest.id === 'HC-010E') {
  assert(manifest.version === '0.0.121' && pkg.version === manifest.version, 'HC-010E Status lineage identity mismatch.');
} else if (manifest.id === 'HC-010D') {
  assert(manifest.version === '0.0.120' && pkg.version === manifest.version, 'HC-010D Status lineage identity mismatch.');
} else if (manifest.id === 'HC-010C') {
  assert(manifest.version === '0.0.119' && pkg.version === manifest.version, 'HC-010C Status lineage identity mismatch.');
} else if (manifest.id === 'HC-010B') {
  assert(manifest.version === '0.0.118' && pkg.version === manifest.version, 'HC-010B Status lineage identity mismatch.');
} else if (manifest.id === 'HC-010A') {
  assert(manifest.version === '0.0.117' && pkg.version === manifest.version, 'HC-010A Status lineage identity mismatch.');
} else {
assert([['HC-006KB','0.0.96'], ['HC-006KC','0.0.97'], ['HC-006KD','0.0.98'], ['HC-007A','0.0.99'], ['HC-007B','0.0.100'], ['HC-007C','0.0.101'], ['HC-007D','0.0.102', '0.0.103', '0.0.104', '0.0.105'], ['HC-007E','0.0.103', '0.0.104', '0.0.105'], ['HC-008B','0.0.104'], ['HC-008C','0.0.105'], ['HC-008D','0.0.106'], ['HC-008E','0.0.107', '0.0.108'], ['HC-008F','0.0.108'], ['HC-008G','0.0.109'], ['HC-009A','0.0.110'], ['HC-009B','0.0.111'], ['HC-009C','0.0.112'], ['HC-009D','0.0.113'], ['HC-009E','0.0.114'], ['HC-009F','0.0.115'], ['HC-009G','0.0.116']].some(([id, version]) => manifest.id === id && manifest.version === version), 'manifest identity mismatch.');
assert(['0.0.96','0.0.97', '0.0.98', '0.0.99','0.0.100', '0.0.101', '0.0.102', '0.0.103', '0.0.104', '0.0.105', '0.0.106', '0.0.107', '0.0.108', '0.0.109', '0.0.110', '0.0.111', '0.0.112', '0.0.113', '0.0.114', '0.0.115', '0.0.116'].includes(pkg.version), 'package version mismatch.');
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

const objectiveRegistry = {
  getByRegionId: () => ({
    id: 'hub_read_route_gates',
    regionId: 'hub_chamber',
    displayText: 'Read the central junction, distinguish the three route states, register the first memory fragment, then open the Status Page for the core self-reading.',
    steps: [
      'hub_junction_anchor_readable',
      'three_route_gate_layout_readable',
      'active_route_identity_distinguished',
      'first_memory_fragment_readable',
      'first_status_page_use'
    ],
    onComplete: 'lock_first_slice_hub_foundation'
  })
};
const regionRegistry = { getByRuntimeCellId: () => ({ id: 'hub_chamber' }) };
const gatesData = JSON.parse(fs.readFileSync(path.join(root, 'public/data/gates/firstSliceGates_HC006I.json'), 'utf8'));
const gateRegistry = new GateRegistry(gatesData);

const frameState = {
  frame: 1200,
  activeCellId: 'CELL_SIGNAL_CHORUS_NERVE_001',
  currentMode: {
    id: 'hub_mode', regionId: 'hub_chamber', regionDisplayName: 'Hub Chamber',
    label: 'Hub Mode', hostFunction: 'internal Host junction', gateOutId: 'hub_first_route_gate_set', visualLanguageId: 'hub_chamber_route_chorus'
  },
  input: { statusPageTogglePressed: true },
  playerComposition: {}, chemistry: {}, bondState: {}, chemObjectState: {}, controlMap: {},
  surfaceWakeLayeredInteraction: {}, localCellMorph: {},
  guideThresholdLayeredInteraction: {}, secondLocalCellMorph: {},
  signalChorusLayeredInteraction: { completed: true },
  hubChamberFoundation: {
    active: true,
    completed: true,
    centralAnchorReadable: true,
    threeRouteLayoutReadable: true,
    activeRouteIdentityDistinguished: true,
    firstMemoryFragmentReadable: true,
    activeRouteId: 'grave_memory_route',
    routeCount: 3,
    dormantRouteCount: 2,
    routes: [
      { id: 'grave_memory_route', displayName: 'Grave Memory', activeRoute: true, runtimeStatus: 'readable_self_reading_pending' },
      { id: 'vascular_rhythm_route', displayName: 'Vascular Rhythm', activeRoute: false, runtimeStatus: 'dormant' },
      { id: 'silt_pressure_route', displayName: 'Silt Pressure', activeRoute: false, runtimeStatus: 'dormant' }
    ]
  },
  objectiveState: { id: 'hub_read_route_gates', progress: 0.8, complete: false }
};

const status = new StatusPageSystem({ appRoot: new FakeElement(), frameState });
const objectives = new ObjectiveSystem({ objectiveRegistry, regionRegistry, frameState });
const gates = new GateSystem({ gateRegistry, frameState });
status.init();
status.activeTabIndex = 2; // Region tab: the live screenshot that exposed the stale 80% readout.

// StatusPageSystem runs early for input suppression. The open event must commit immediately,
// while presentation rendering waits until later systems have consumed that commit.
status.update(1 / 60, frameState);
assert(frameState.statusPage.open === true, 'Status Page did not open.');
assert(frameState.statusPage.firstHubUseComplete === true, 'First Hub use did not commit on the open event.');
assert(frameState.statusPage.firstHubUseCommittedOnOpen === true, 'Commit-on-open diagnostic missing.');
assert(frameState.statusPage.firstHubUseCommitFrame === 1200, 'Commit frame was not captured.');
assert(frameState.objectiveState.progress === 0.8, 'Test precondition failed: objective should still be stale before ObjectiveSystem runs.');

objectives.update(1 / 60, frameState);
assert(frameState.objectiveState.progress === 1, 'ObjectiveSystem did not consume the open-event commit in the same tick.');
assert(frameState.objectiveState.complete === true, 'Hub objective did not complete in the same tick.');

gates.update(1 / 60, frameState);
const graveGate = frameState.firstSliceGates.hub_to_grave_memory_route;
assert(graveGate.crossable === true && graveGate.status === 'crossable', 'GateSystem did not unlock Grave Memory in the same tick.');

// Emulate HubChamberFoundationSystem's later same-tick presentation publication.
frameState.hubChamberFoundation.routes[0].runtimeStatus = 'crossable';
frameState.hubChamberFoundation.fullHubComplete = true;
frameState.hubChamberFoundation.firstStatusPageUseComplete = true;

// Deferred render runs after the runtime update stack and must see the newly committed truth.
await Promise.resolve();
assert(status.content.innerHTML.includes('100%'), 'Region tab remained at stale 80% after the open-event commit.');
assert(status.content.innerHTML.includes('crossable'), 'Region tab did not show the same-tick crossable route state.');

// Opening outside Hub must still remain a read-only inspection and cannot satisfy the prerequisite.
const outsideFrame = {
  frame: 1300,
  activeCellId: 'CELL_GRAVE_MEMORY_RESIDUE_BED_001',
  currentMode: { id: 'legacy_route_mode', regionId: 'outside_first_slice' },
  input: { statusPageTogglePressed: true },
  playerComposition: {}, chemistry: {}, bondState: {}, chemObjectState: {}, objectiveState: {}, hubChamberFoundation: {}, controlMap: {}
};
const outsideStatus = new StatusPageSystem({ appRoot: new FakeElement(), frameState: outsideFrame });
outsideStatus.init();
outsideStatus.update(1 / 60, outsideFrame);
assert(outsideFrame.statusPage.firstHubUseComplete === false, 'Opening Status Page outside Hub incorrectly committed firstHubUse.');

console.log('HC-006KB Status Page completion commit validation passed.');
