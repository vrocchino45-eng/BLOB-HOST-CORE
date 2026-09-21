import fs from "node:fs";
import assert from "node:assert/strict";
import * as THREE from "three";
import { CombThresholdFoundationSystem } from "../src/thresholds/CombThresholdFoundationSystem.js";

const read = (p) => fs.readFileSync(p, "utf8");
const json = (p) => JSON.parse(read(p));
const manifest = json("public/data/build/buildManifest.json");
const profile = json("public/data/runtime/act1RuntimeProfile_HC014I.json");
const recipe = json("public/data/thresholds/combThresholdFoundation_HC013A.json");

assert.equal(manifest.id, "HC-014I");
assert.equal(manifest.version, "0.0.142");
assert.equal(profile.pass, "HC-014I");
assert.equal(recipe.movementBounds.terminalApproachAfterReads, 6);
assert.deepEqual(recipe.movementBounds.terminalApproachCenterOffset, [0, 0, -5.8]);
assert.deepEqual(recipe.movementBounds.terminalApproachRadii, [4.4, 3.6, 7.8]);
assert.equal(recipe.apertureDestinationContract.sealReadRange, 2.15, "HC-014I must not inflate the seal trigger");

const frameState = {
  activeCellId: "CELL_COMB_THRESHOLD_FILTER_001",
  buildManifest: manifest,
  buildId: manifest.id,
  physicalFeel: {},
  combThresholdPlayable: { successfulFilterReads: 5, challengeComplete: false, apertureRevealWitnessed: false }
};
const scene = new THREE.Scene();
const playerRoot = new THREE.Object3D();
playerRoot.position.set(0, 0, 0);
const recipeDataSystem = {
  data: {
    combThresholdFoundation: recipe,
    firstSliceRuntimeProfile: profile
  }
};
const system = new CombThresholdFoundationSystem({ recipeDataSystem, scene, playerRoot, frameState });
system.init();
system.onRuntimeMount(frameState);
assert.equal(frameState.physicalFeel.movementBounds.terminalApproachActive, false);
assert.deepEqual(frameState.physicalFeel.movementBounds.center, { x: 0, y: 0, z: -4.8 });
assert.deepEqual(frameState.physicalFeel.movementBounds.radii, { x: 3.9, y: 3.1, z: 6.9 });

// 6/6 opens traversal room around the *existing* authored membrane.
frameState.combThresholdPlayable.successfulFilterReads = 6;
system.update(1 / 60, frameState);
const bounds = frameState.physicalFeel.movementBounds;
assert.equal(bounds.terminalApproachActive, true);
assert.deepEqual(bounds.center, { x: 0, y: 0, z: -5.8 });
assert.deepEqual(bounds.radii, { x: 4.4, y: 3.6, z: 7.8 });
assert.equal(bounds.owner, "PlayerMovementController");
assert.equal(bounds.tuningOwner, "CombThresholdFoundationSystem");
assert.equal(bounds.centerSource, "gate_preserved_entry_plus_terminal_aperture_approach_offset");

const seal = new THREE.Vector3(...recipe.apertureDestinationContract.sealPosition);
const range = recipe.apertureDestinationContract.sealReadRange;
const c = new THREE.Vector3(bounds.center.x, bounds.center.y, bounds.center.z);
const r = bounds.radii;
const norm = (p) => Math.sqrt(
  ((p.x-c.x)/r.x)**2 + ((p.y-c.y)/r.y)**2 + ((p.z-c.z)/r.z)**2
);
assert(norm(seal) < 0.75, "seal center must sit comfortably inside the terminal movement ellipsoid");
// Sample the full interaction sphere on each principal axis. Every sampled point must be physically reachable.
for (const p of [
  seal.clone().add(new THREE.Vector3(range,0,0)),
  seal.clone().add(new THREE.Vector3(-range,0,0)),
  seal.clone().add(new THREE.Vector3(0,range,0)),
  seal.clone().add(new THREE.Vector3(0,-range,0)),
  seal.clone().add(new THREE.Vector3(0,0,range)),
  seal.clone().add(new THREE.Vector3(0,0,-range))
]) {
  assert(norm(p) <= 1, `seal interaction sphere sample must remain reachable: ${p.toArray()}`);
}

const source = read("src/thresholds/CombThresholdFoundationSystem.js");
assert.match(source, /terminalApproachActive/);
assert.match(source, /terminalApproachRadii/);
assert.doesNotMatch(source, /sealReadRange\s*\+|sealReadRange\s*\*/);
console.log("HC-014I Comb terminal membrane reachability validation passed.");
