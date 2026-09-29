import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { ApertureFieldsArrivalSystem } from "../src/fields/ApertureFieldsArrivalSystem.js";
import { SignalPlainEcologySystem } from "../src/fields/SignalPlainEcologySystem.js";
import { MembraneRidgeGameplaySystem } from "../src/fields/MembraneRidgeGameplaySystem.js";
import { ApertureAdjacentTerritorySystem } from "../src/fields/ApertureAdjacentTerritorySystem.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const readText = (p) => fs.readFileSync(path.join(root,p),"utf8");
const sha256 = (p) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root,p))).digest("hex");
const pkg=readJson("package.json");
const contract=readJson("public/data/build/hc031t2CanonicalApertureWorldAnchorContract.json");
const locked=readJson("public/data/build/hc031t2LockedHashes.json");
assert.equal(pkg.version,"0.31.43");
assert.equal(contract.pass,"HC-031T2");
assert.equal(contract.telemetrySchema,"blob.session.telemetry.v1.45");
assert.match(readText("src/main.js"),/buildId:\s*"HC-031T2"/);
assert.match(readText("src/core/SessionTelemetrySystem.js"),/blob\.session\.telemetry\.v1\.45/);

const scene=new THREE.Scene();
const playerRoot=new THREE.Group(); scene.add(playerRoot);
const camera=new THREE.PerspectiveCamera(70,1,0.1,500); scene.add(camera);
const frameState={
 buildId:"HC-031T2",buildLabel:"Canonical Aperture World Anchor Repair",activeCellId:"CELL_APERTURE_FIELDS_ARRIVAL_001",
 frame:1,runtimeSeconds:0,input:{pulsePressed:false,pulseEventId:0,stabilizeHeld:false,absorbHeld:false},
 signalPlainEcology:{completed:false},membraneRidgeGameplay:{completed:false},adjacentHostTerritory:{traversalOpen:false},physicalFeel:{},act1RouteHistory:{}
};

// Aperture arrival captures the region-space authoring origin before debug staging.
playerRoot.position.set(0,0,0);
const arrival=new ApertureFieldsArrivalSystem({scene,playerRoot,frameState});
arrival.init(); arrival.onRuntimeMount(frameState); arrival.update(0.05,frameState);
assert.deepEqual(frameState.apertureFieldsArrival.entryAnchor,{x:0,y:0,z:0});

// Signal Plain must consume that same anchor.
const signal=new SignalPlainEcologySystem({scene,playerRoot,frameState});
signal.init(); signal.onRuntimeMount(frameState);
assert.deepEqual(signal.entryAnchor.toArray(),[0,0,0]);

// Reproduce the HC031T1 debug-order failure: Signal Plain stages the player elsewhere
// before later systems mount. Authored systems must ignore this live player position.
playerRoot.position.set(-4.7,5.6,-24.8);
const ridge=new MembraneRidgeGameplaySystem({scene,playerRoot,frameState});
ridge.init(); ridge.onRuntimeMount(frameState);
const territory=new ApertureAdjacentTerritorySystem({scene,camera,playerRoot,frameState});
territory.init(); territory.onRuntimeMount(frameState);
assert.deepEqual(ridge.entryAnchor.toArray(),[0,0,0]);
assert.deepEqual(territory.entryAnchor.toArray(),[0,0,0]);

// T1 geometry remains valid when evaluated in the correct shared coordinate frame.
frameState.signalPlainEcology={completed:true,localResponse:1};
arrival.update(0.05,frameState);
const bounds=frameState.physicalFeel.movementBounds;
assert.equal(bounds.mode,"signal_plain_membrane_ridge_observation_ellipsoid");
const norm=(p)=>Math.hypot((p.x-bounds.center.x)/bounds.radii.x,(p.y-bounds.center.y)/bounds.radii.y,(p.z-bounds.center.z)/bounds.radii.z);
for (const p of [new THREE.Vector3(13.7,0.3,-40.4),new THREE.Vector3(18,1.3,-44),new THREE.Vector3(21.7,2.1,-47.4)]) {
  assert(norm(p)<0.82,`Ridge contour escaped canonical pre-open volume: ${norm(p)}`);
}
assert(norm(new THREE.Vector3(3.5,8.5,-62))>1,"Gathering Ground became local before Ridge completion.");
assert.deepEqual(territory.territoryWorld.copy(territory.entryAnchor).add(territory.territoryLocal).toArray(),[3.5,8.5,-62]);

for (const [relative,expected] of Object.entries(locked.files)) assert.equal(sha256(relative),expected,`Locked owner changed: ${relative}`);
console.log(`[HC031T2] PASS — one canonical Aperture world anchor survives debug player staging; Signal Plain, all Membrane Ridge contours, and Gathering Ground remain in one coordinate frame; T1 gating geometry remains intact; ${Object.keys(locked.files).length} neighboring owners are unchanged.`);
