// BOT1D11B — focused authored-surface eligibility validation (not gameplay proof).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { SiltPressureRouteSystem } from '../src/routes/SiltPressureRouteSystem.js';
import { CoreSurfaceTruthSystem } from '../src/player/CoreSurfaceTruthSystem.js';
import { HostContactShelfSystem } from '../src/world/HostContactShelfSystem.js';
import { readCrawlableSurfaceMetadata } from '../src/world/CrawlableSurfaceRegistry.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const recipe = JSON.parse(fs.readFileSync(path.join(projectRoot,'public/data/routes/siltPressureRouteCircuit_HC012A.json'),'utf8'));
const proof = recipe.hcCrawlableSurfaceProof;
assert.equal(proof?.pass,'BOT1D11B');
assert.equal(proof.surfaces.length, 1);
assert.equal(recipe.habitatFoundation.addsContactSurfaces, false,'LS1A original geometry remains visual-only');
assert.equal(recipe.habitatFoundation.visualOnlyAnatomy, true,'do not promote entire cavern walls');

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
scene.add(playerRoot);
const frame = {
  activeCellId: 'CELL_SILT_PRESSURE_ROUTE_001',
  runtimeSeconds: 0,
  frame: 0,
  physicalFeel: {},
  input: { stabilizeHeld: false, absorbHeld: false, pulsePressed: false, pulseEventId: 0 },
  verbComposition: { chord: 'idle', relationshipBound: false, intent: {} }
};
const silt = new SiltPressureRouteSystem({recipeDataSystem:{data:{siltPressureRouteCircuit:recipe}},scene,playerRoot,frameState:frame});
silt.init();
silt.update(0.016, frame); // mount Silt from current cell
assert.equal(silt.hcCrawlableSurfaceMeshes.length,1);
const mesh = silt.hcCrawlableSurfaceMeshes[0];
const meta = readCrawlableSurfaceMetadata(mesh);
assert.equal(meta?.surfaceId, proof.surfaces[0].id);
assert.equal(meta?.profileId, 'residue_weak');
assert.equal(meta?.cellId, frame.activeCellId);
assert.equal(mesh.userData.targetingSuppressed,true);
assert.notEqual(silt.envelope.userData.crawlableSurface, true, 'no blanket cavity labeling');

// Sample from ~0.46 above the mesh top: eligible for the existing owner raycast.
playerRoot.position.set(mesh.position.x, mesh.position.y + mesh.scale.y + 0.46, mesh.position.z);
scene.updateMatrixWorld(true);
const truth = new CoreSurfaceTruthSystem({scene,playerRoot,frameState:frame});
truth.init();
truth.update(0.05,frame);
assert.equal(frame.surfaceCapabilityAudit?.authoredSurfaceCount,1);
assert.equal(frame.coreSurfaceTruth?.valid,true,'raycast must recognize authored shelf');
assert.equal(frame.coreSurfaceTruth?.surfaceId,meta.surfaceId);
assert.equal(frame.coreSurfaceTruth?.mechanicalEligible,true,'within physical latch range');

// HC positive control: same registry/owner must also recognize the established Host shelf.
const nurseryScene = new THREE.Scene();
const nurseryPlayer = new THREE.Group();
nurseryScene.add(nurseryPlayer);
const nurseryFrame = { activeCellId: 'CELL_MEMBRANE_NURSERY_001' };
const host = new HostContactShelfSystem({scene:nurseryScene,playerRoot:nurseryPlayer,frameState:nurseryFrame});
host.init();
host.update(0.05,nurseryFrame);
nurseryScene.updateMatrixWorld(true);
const originalMembrane = host.surfaces[0];
const hostCenter = new THREE.Vector3();
originalMembrane.getWorldPosition(hostCenter);
nurseryPlayer.position.copy(hostCenter).add(new THREE.Vector3(0,originalMembrane.scale.y + 0.46,0));
nurseryScene.updateMatrixWorld(true);
const hostTruth = new CoreSurfaceTruthSystem({scene:nurseryScene,playerRoot:nurseryPlayer,frameState:nurseryFrame});
hostTruth.init();
hostTruth.update(0.05,nurseryFrame);
assert.equal(nurseryFrame.coreSurfaceTruth?.valid,true,'original Host shelf positive control');
assert.equal(nurseryFrame.coreSurfaceTruth?.mechanicalEligible,true);
// The Host shelf contains intersecting authored surfaces. Its raycast selects the
// closest/highest-priority eligible contact, not necessarily surfaces[0] (membrane).
// Verify the original membrane remains authored and the actual returned contact
// belongs to this Host shelf with its correct HC material profile.
const hostSurfaceMetadata = host.surfaces.map(readCrawlableSurfaceMetadata).filter(Boolean);
assert.ok(hostSurfaceMetadata.some(({surfaceId}) => surfaceId === 'HOST_CONTACT_SHELF_MEMBRANE'),
  'original membrane must remain an authored contact surface');
const observedHostSurface = hostSurfaceMetadata.find(
  ({surfaceId}) => surfaceId === nurseryFrame.coreSurfaceTruth?.surfaceId);
assert.ok(observedHostSurface,
  `Host raycast returned an unregistered surface: ${nurseryFrame.coreSurfaceTruth?.surfaceId}`);
assert.equal(observedHostSurface.cellId, nurseryFrame.activeCellId, 'Host cell scope');
assert.equal(nurseryFrame.coreSurfaceTruth.profileId, observedHostSurface.profileId,
  'Host raycast must retain the matched HC material profile');
console.log(`BOT1D11B Host positive control: ${observedHostSurface.surfaceId} (${observedHostSurface.profileId})`);

// Exit should hide Silt, and the candidate must no longer be considered active.
frame.activeCellId='CELL_SIGNAL_CHORUS_NERVE_001';
silt.update(0.05,frame);
truth.update(0.05,frame);
assert.equal(frame.surfaceCapabilityAudit?.authoredSurfaceCount,0,'do not leak Silt into another cell');
console.log('BOT1D11B PASS: authored residue shelf has HC metadata, raycast eligibility, and clean cell isolation.');
console.log('NOTE: no playerAttachment transition is asserted; physical latch/release requires live D11B testing.');
