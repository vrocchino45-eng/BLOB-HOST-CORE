import fs from "node:fs";
import assert from "node:assert/strict";
import * as THREE from "three";
import { CombThresholdPlayableSystem } from "../src/thresholds/CombThresholdPlayableSystem.js";

const read = (p) => fs.readFileSync(p, "utf8");
const json = (p) => JSON.parse(read(p));
const manifest = json("public/data/build/buildManifest.json");
const profile = json("public/data/runtime/act1RuntimeProfile_HC014I.json");
const playableRecipe = json("public/data/thresholds/combThresholdPlayable_HC013B.json");
const foundationRecipe = json("public/data/thresholds/combThresholdFoundation_HC013A.json");

assert.ok(["HC-014G", "HC-014I"].includes(manifest.id));
assert.equal(manifest.version, manifest.id === "HC-014I" ? "0.0.142" : "0.0.140");
assert.equal(profile.id, manifest.id === "HC-014I" ? "ACT1_RUNTIME_PROFILE_HC014G" : manifest.id === "HC-014G" ? "ACT1_RUNTIME_PROFILE_HC014G" : "ACT1_RUNTIME_PROFILE_HC014G");
assert.equal(profile.pass, manifest.id === "HC-014I" ? "HC-014I" : "HC-014G");
assert.deepEqual(foundationRecipe.apertureDestinationContract.sealPosition, [0, 0, -10.8]);
assert.equal(foundationRecipe.apertureDestinationContract.sealReadRange, 2.15);

const frame = {
  activeCellId: "CELL_COMB_THRESHOLD_FILTER_001",
  frame: 100,
  input: { pulsePressed: false, pulseEventId: -1, stabilizeHeld: true },
  firstSliceRuntimeMount: { profileId: "ACT1_RUNTIME_PROFILE_HC014G" },
  act1RouteHistory: { hubThreeRouteConvergenceCompleted: true, combEntered: true },
  combThresholdFoundation: {
    active: true,
    entryPosition: { x: 0, y: 0, z: 0 },
    apertureSealDistance: 2.14,
    apertureSealReadRange: 2.15,
    apertureSealInteractionRange: 2.15
  }
};
const recipeDataSystem = { data: { combThresholdPlayable: playableRecipe } };
const playerRoot = new THREE.Object3D();
const system = new CombThresholdPlayableSystem({ recipeDataSystem, playerRoot, frameState: frame });
system.init();
system.onRuntimeMount(frame);
system.bandCompleted.fill(true);
system.successfulReadCount = playableRecipe.interaction.requiredFilterReads;
system.coherence = 1;
system.elapsed = 0;

// Deliberately place the legacy hidden Z target out of range while the visible
// foundation-owned 3D seal says the player is inside. HC-014D must honor the visible seal.
playerRoot.position.set(0, 0, -7.0);
frame.input = { pulsePressed: false, pulseEventId: 100, stabilizeHeld: true };
system.update((playableRecipe.interaction.finalMembraneStabilizeSeconds ?? 0.55) + 0.02, frame);
frame.input = { pulsePressed: true, pulseEventId: 101, stabilizeHeld: true };
system.update(0.001, frame);
assert.equal(frame.combThresholdPlayable.finalSealAuthority, "CombThresholdFoundationSystem.apertureSealDistance");
assert.equal(frame.combThresholdPlayable.finalSealInside, true);
assert.equal(frame.combThresholdPlayable.finalSealRange, 2.15);
assert.equal(frame.combThresholdPlayable.challengeComplete, true, "visible foundation-owned seal must complete synthesis even when legacy Z-only target would fail");

frame.input = { pulsePressed: false, pulseEventId: 101, stabilizeHeld: true };
frame.frame += 1;
frame.combThresholdFoundation.apertureSealDistance = 2.14;
system.update(playableRecipe.interaction.finalRevealSeconds, frame);
assert.equal(frame.combThresholdPlayable.apertureRevealWitnessed, true);
assert.equal(frame.combThresholdPlayable.apertureCrossable, true);

const playableSource = read("src/thresholds/CombThresholdPlayableSystem.js");
assert.match(playableSource, /CombThresholdFoundationSystem\.apertureSealDistance/);
assert.match(playableSource, /foundation\.apertureSealDistance/);
const overlaySource = read("src/debug/RecipeDebugOverlay.js");
assert.match(overlaySource, /SYNTHESIS SEAL dist:/);
assert.match(overlaySource, /APERTURE GATE reveal:/);
console.log("HC-014D Aperture seal reachability validation passed.");
