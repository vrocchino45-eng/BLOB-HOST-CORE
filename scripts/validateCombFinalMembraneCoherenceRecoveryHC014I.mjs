import fs from "node:fs";
import assert from "node:assert/strict";
import * as THREE from "three";
import { CombThresholdPlayableSystem } from "../src/thresholds/CombThresholdPlayableSystem.js";

const read = (p) => fs.readFileSync(p, "utf8");
const json = (p) => JSON.parse(read(p));
const manifest = json("public/data/build/buildManifest.json");
const profile = json(manifest.id === "HC-014K" ? "public/data/runtime/act1RuntimeProfile_HC014K.json" : manifest.id === "HC-014J" ? "public/data/runtime/act1RuntimeProfile_HC014J.json" : "public/data/runtime/act1RuntimeProfile_HC014I.json");
const recipe = json("public/data/thresholds/combThresholdPlayable_HC013B.json");

assert.ok(["HC-014I", "HC-014J", "HC-014K"].includes(manifest.id));
assert.equal(manifest.version, manifest.id === "HC-014K" ? "0.0.144" : manifest.id === "HC-014J" ? "0.0.143" : "0.0.142");
assert.equal(profile.pass, manifest.id === "HC-014K" ? "HC-014K" : manifest.id === "HC-014J" ? "HC-014J" : "HC-014I");
assert.equal(recipe.interaction.finalMembraneCoherenceRecoveryPerSecond, 0.28);

const frame = {
  activeCellId: "CELL_COMB_THRESHOLD_FILTER_001",
  frame: 900,
  input: { pulsePressed: false, pulseEventId: 1, stabilizeHeld: true },
  firstSliceRuntimeMount: { profileId: "ACT1_RUNTIME_PROFILE_HC014G" },
  act1RouteHistory: { hubThreeRouteConvergenceCompleted: true, combEntered: true },
  combThresholdFoundation: {
    active: true,
    entryPosition: { x: 0, y: 0, z: 0 },
    apertureSealDistance: 0.94,
    apertureSealReadRange: 2.15,
    apertureSealInteractionRange: 2.15
  }
};
const recipeDataSystem = { data: { combThresholdPlayable: recipe } };
const playerRoot = new THREE.Object3D();
const system = new CombThresholdPlayableSystem({ recipeDataSystem, playerRoot, frameState: frame });
system.init();
system.onRuntimeMount(frame);
system.bandCompleted.fill(true);
system.successfulReadCount = recipe.interaction.requiredFilterReads;
// Recreate the live screenshot failure: 6/6, inside the seal, Stabilize held,
// but coherence softened below the 0.70 final threshold.
system.coherence = 0.50;

for (let i = 0; i < 120 && !frame.combThresholdPlayable?.membraneReady; i += 1) {
  frame.frame += 1;
  frame.input = { pulsePressed: false, pulseEventId: 1, stabilizeHeld: true };
  system.update(1 / 60, frame);
}
assert.equal(frame.combThresholdPlayable.finalSealInside, true);
assert.equal(frame.combThresholdPlayable.stabilizeHeld, true);
assert.ok(frame.combThresholdPlayable.coherence >= recipe.interaction.minimumCoherenceForFinalRead,
  "holding Stabilize inside the final membrane must recover softened coherence after 6/6");
assert.equal(frame.combThresholdPlayable.coherenceReady, true);
assert.equal(frame.combThresholdPlayable.membraneReady, true,
  "membrane must progress to READY after coherence recovery without requiring another filter");

frame.frame += 1;
frame.input = { pulsePressed: true, pulseEventId: 2, stabilizeHeld: true };
system.update(1 / 60, frame);
assert.equal(frame.combThresholdPlayable.challengeComplete, true,
  "fresh Pulse at READY must complete the existing membrane handshake");

const source = read("src/thresholds/CombThresholdPlayableSystem.js");
assert.match(source, /finalMembraneCoherenceRecoveryPerSecond/);
assert.match(source, /final_membrane_coherence_recovering/);
const overlay = read("src/debug/RecipeDebugOverlay.js");
assert.match(overlay, /MEMBRANE HANDSHAKE coherence:/);
console.log("HC-014I Comb final membrane coherence recovery validation passed.");
