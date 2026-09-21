import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import * as THREE from "three";
import { CombThresholdPlayableSystem } from "../src/thresholds/CombThresholdPlayableSystem.js";

const root = process.cwd();
const json = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const manifest = json("public/data/build/buildManifest.json");
const recipe = json("public/data/thresholds/combThresholdPlayable_HC013B.json");
const profile = json("public/data/runtime/act1RuntimeProfile_HC014I.json");
assert.ok(["HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(manifest.version, manifest.id === "HC-014I" ? "0.0.142" : "0.0.140");
assert.equal(profile.id, manifest.id === "HC-014I" ? "ACT1_RUNTIME_PROFILE_HC014G" : "ACT1_RUNTIME_PROFILE_HC014G");
assert.equal(profile.pass, manifest.id === "HC-014I" ? "HC-014I" : "HC-014G");

const frame = {
  buildId: manifest.id,
  buildManifest: manifest,
  activeCellId: "CELL_COMB_THRESHOLD_FILTER_001",
  frame: 1,
  input: { pulsePressed: false, pulseEventId: 0, stabilizeHeld: true },
  firstSliceRuntimeMount: { profileId: profile.id },
  combThresholdFoundation: { active: true, entryPosition: { x: 0, y: 0, z: 0 }, apertureSealDistance: 99, apertureSealReadRange: 2.15 },
  act1RouteHistory: { hubThreeRouteConvergenceCompleted: true, combEntered: true, routeStates: {} }
};
const playerRoot = new THREE.Object3D();
const system = new CombThresholdPlayableSystem({ recipeDataSystem: { data: { combThresholdPlayable: recipe } }, playerRoot, frameState: frame });
system.init();
system.onRuntimeMount(frame);

const pulseAt = (z, eventId) => {
  playerRoot.position.set(0, 0, z);
  system.elapsed = 0; // cadence open
  frame.frame += 1;
  frame.input = { pulsePressed: true, pulseEventId: eventId, stabilizeHeld: true };
  system.update(0.001, frame);
  frame.input = { pulsePressed: false, pulseEventId: eventId, stabilizeHeld: true };
};

// Trying to skip directly to band 2 cannot earn it because band 1 remains authoritative.
pulseAt(recipe.interaction.filterBandZ[1], 1);
assert.equal(frame.combThresholdPlayable.successfulFilterReads, 0);
assert.equal(frame.combThresholdPlayable.currentBandNumber, 1);
assert.deepEqual(frame.combThresholdPlayable.completedBandNumbers, []);
assert.equal(frame.combThresholdPlayable.sequentialReadOrderEnforced, true);

// Earn band 1, then band 2 becomes the sole authority.
pulseAt(recipe.interaction.filterBandZ[0], 2);
assert.equal(frame.combThresholdPlayable.successfulFilterReads, 1);
playerRoot.position.set(0, 0, recipe.interaction.filterBandZ[0]);
frame.frame += 1; frame.input = { pulsePressed: false, pulseEventId: 2, stabilizeHeld: true };
system.update(0.001, frame);
assert.equal(frame.combThresholdPlayable.currentBandNumber, 2);
assert.match(frame.combThresholdPlayable.nextAction, /band 2\/6/);

// Recreate the exact human-play ambiguity from HC-014F: 1-4 and 6 recorded, 5 missing.
system.bandCompleted = [true, true, true, true, false, true];
system.successfulReadCount = 5;
playerRoot.position.set(0, 0, recipe.interaction.filterBandZ[5]);
frame.frame += 1; frame.input = { pulsePressed: false, pulseEventId: 3, stabilizeHeld: true };
system.update(0.001, frame);
assert.equal(frame.combThresholdPlayable.currentBandNumber, 5, "first incomplete band must own the target");
assert.deepEqual(frame.combThresholdPlayable.completedBandNumbers, [1,2,3,4,6]);
assert.equal(frame.combThresholdPlayable.activeBandDirection, "back");
assert.match(frame.combThresholdPlayable.nextAction, /Move back to mixed filter band 5\/6/);
assert.doesNotMatch(frame.combThresholdPlayable.nextAction, /band 6\/6/);

// Once 5 is restored, all six are complete and the membrane handshake may begin.
pulseAt(recipe.interaction.filterBandZ[4], 4);
assert.equal(frame.combThresholdPlayable.successfulFilterReads, 6);
assert.deepEqual(frame.combThresholdPlayable.completedBands, [true,true,true,true,true,true]);
frame.frame += 1; frame.input = { pulsePressed: false, pulseEventId: 4, stabilizeHeld: true };
system.update(0.001, frame);
assert.equal(frame.combThresholdPlayable.currentBandNumber, 6);
assert.equal(frame.combThresholdPlayable.sequentialReadOrderEnforced, true);

console.log("HC-014G Comb sequential read authority validation passed.");
