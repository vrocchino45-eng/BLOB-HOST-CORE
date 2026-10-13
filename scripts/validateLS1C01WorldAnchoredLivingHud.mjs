import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { QuickLookInspectorSystem, buildQuickLookSnapshot, projectQuickLookAnchor }
  from '../src/ui/QuickLookInspectorSystem.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const runtime = readFileSync(resolve(root, 'src/core/GameRuntime.js'), 'utf8');
const ui = readFileSync(resolve(root, 'src/ui/QuickLookInspectorSystem.js'), 'utf8');
assert.match(runtime, /this\.quickLookInspectorSystem\.bindScene\(\{/);
assert.match(runtime, /this\.quickLookInspectorSystem\?\.syncCamera\(\)/);
assert.ok(runtime.indexOf('this.updateCamera(catchUp.simulatedSeconds)') < runtime.indexOf('this.quickLookInspectorSystem?.syncCamera()'));
for (const token of ['world-mute', 'world-bubbles', 'detailToggle', 'pointerEvents', 'getBoundingClientRect'])
  assert.ok(ui.includes(token), `missing HUD affordance ${token}`);
for (const prohibited of ['frameState.activeCellId =', 'frameState.targeting =', 'frameState.input =', 'frameState.siltPressureRoute ='])
  assert.ok(!ui.includes(prohibited), `HUD must not become gameplay owner: ${prohibited}`);

const camera = new THREE.PerspectiveCamera(60, 2, 0.1, 1000);
camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);
camera.updateProjectionMatrix();
camera.updateMatrixWorld();
const viewport = { left: 0, top: 0, width: 1000, height: 500 };
const core = new THREE.Group();
core.position.set(0, 0, 0);
const forward = projectQuickLookAnchor(core, camera, viewport, 80);
assert.ok(forward && Math.abs(forward.x - 500) < 0.01 && Math.abs(forward.y - 250) < 0.01,
  'Core must project to real central screen coordinates');
core.position.x = 2;
const moved = projectQuickLookAnchor(core, camera, viewport, 80);
assert.ok(moved?.x > forward.x + 60, 'Core bubble must move when Core moves');
core.position.set(0, 0, 22);
assert.equal(projectQuickLookAnchor(core, camera, viewport, 80), null, 'behind camera must not label');
core.position.set(50, 0, 0);
assert.equal(projectQuickLookAnchor(core, camera, viewport, 80), null, 'offscreen must not label');
core.position.set(0, 0, 0);
assert.equal(projectQuickLookAnchor(core, camera, viewport, 5), null, 'far-away object must not label');
const routeRoot = new THREE.Group();
routeRoot.position.set(3, 0, 0);
const packet = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial());
packet.position.set(-1, 0, 0);
routeRoot.add(packet);
routeRoot.updateMatrixWorld(true);
assert.ok(projectQuickLookAnchor(packet, camera, viewport, 80)?.x > forward.x,
  'nested region object must be projected with its world transform');

const frameState = {
  activeCellId: 'CELL_SILT_PRESSURE_ROUTE_001',
  coreEngine: { phaseCount: 6, currentPhaseFunction: 'stabilize' },
  targeting: { active: false, targetId: 'none' },
  siltPressureRoute: {
    active: true, safeMatterAbsorbed: false,
    habitatFoundation: { currentHabitatId: 'reservoir', active: true },
    livingMaterialCycle: { active: false, currentUnitCount: 8,
      counts: { reservoir: 8, veins: 0, garden_transit: 0, settled: 0, growing: 0, mature: 0, returning: 0 }}
  }
};
const inspector = new QuickLookInspectorSystem({ frameState });
const reservoir = new THREE.Group();
reservoir.position.set(0, 1, 0);
inspector.bindScene({ camera, playerRoot: core, siltRoute: {
  active: true, habitatLobes: [{ recipe: { id: 'reservoir' }, group: reservoir }],
  safePacket: packet
}, targetingSystem: null, viewportElement: null });
let descriptors = inspector.resolveBubbles(buildQuickLookSnapshot(frameState));
assert.deepEqual(descriptors.map(x => x.id), ['core', 'habitat', 'reservoirObject']);
assert.ok(descriptors.find(x => x.id === 'core').title.includes('6-PHASE'));
assert.ok(descriptors.find(x => x.id === 'reservoirObject').detail.includes('Hold RT'));
assert.ok(descriptors.find(x => x.id === 'habitat').anchor === reservoir);

frameState.siltPressureRoute.safeMatterAbsorbed = true;
frameState.siltPressureRoute.livingMaterialCycle.active = true;
frameState.siltPressureRoute.livingMaterialCycle.counts.reservoir = 3;
frameState.siltPressureRoute.habitatFoundation.currentHabitatId = 'garden';
const garden = new THREE.Group();
inspector.sceneRefs.siltRoute.habitatLobes.push({ recipe: { id: 'garden' }, group: garden });
inspector.sceneRefs.siltRoute.livingReservoirBody = new THREE.Group();
descriptors = inspector.resolveBubbles(buildQuickLookSnapshot(frameState));
assert.ok(descriptors.find(x => x.id === 'habitat').detail.includes('Settled'));
assert.ok(descriptors.find(x => x.id === 'reservoirObject').title.includes('REPLENISHING'));
assert.ok(!descriptors.some(x => x.detail.includes('one-time route packet')));

frameState.activeCellId = 'CELL_GRAVE_MEMORY_RESIDUE_BED_001';
frameState.targeting = { active: false, targetId: 'none' };
descriptors = inspector.resolveBubbles(buildQuickLookSnapshot(frameState));
assert.deepEqual(descriptors.map(x => x.id), ['core'], 'other regions must not leak Silt labels');

// 20-minute-long projection budget sweep (10Hz) cannot create gameplay objects.
const owned = inspector.bubbles.size;
for (let i = 0; i < 12000; i++) {
  core.position.x = Math.sin(i * .001) * 2;
  projectQuickLookAnchor(core, camera, viewport, 80);
}
assert.equal(inspector.bubbles.size, owned);
console.log('[LS1C0.1] real camera projection, moving Core, nested scene anchor, Silt live text, non-Silt fallback, no gameplay authority PASS');
