import assert from "node:assert/strict";
import fs from "node:fs";
import * as THREE from "three";
import { TargetingSystem } from "../src/targeting/TargetingSystem.js";
import { VisualHierarchyCompressionSystem } from "../src/presentation/VisualHierarchyCompressionSystem.js";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const targetingSource = read("../src/targeting/TargetingSystem.js");
const hierarchySource = read("../src/presentation/VisualHierarchyCompressionSystem.js");

assert.match(targetingSource, /pass: "HC-031W2B3\.1"/);
assert.match(targetingSource, /pulse_core_to_noun_absorb_noun_to_core_camera_facing/);
assert.match(targetingSource, /pulseTravel01 = 0\.12 \+ travelPhase \* 0\.76/);
assert.match(targetingSource, /absorbTravel01 = 0\.88 - travelPhase \* 0\.76/);
assert.match(targetingSource, /this\.pulseTriangle\.quaternion\.copy\(this\.camera\.quaternion\)/);
assert.match(targetingSource, /this\.absorbTriangle\.quaternion\.copy\(this\.camera\.quaternion\)/);
assert.match(hierarchySource, /relationshipGrammarPass: "HC-031W2B3\.1"/);
assert.match(hierarchySource, /stabilizeSupportRingsYieldToConditionBoundary: true/);
assert.match(hierarchySource, /stabilizeGrammarActive \? 0\.30 : 0\.50/);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
camera.position.set(3, 2, 5);
camera.lookAt(0, 0, 0);
scene.add(camera);
const playerRoot = new THREE.Group();
playerRoot.position.set(-0.5, 0.2, 0.5);
scene.add(playerRoot);
const targetRoot = new THREE.Group();
targetRoot.position.set(2.2, 0.8, -2.4);
scene.add(targetRoot);
scene.updateMatrixWorld(true);

const frameState = {
  runtimeSeconds: 0.10,
  targeting: {
    relationshipActive: true,
    relationshipVerbs: ["pulse"],
    lockStrength: 0.8,
    targetKind: "absorbable",
    reticleState: "assist"
  },
  reactiveStateGrammar: {
    objects: { probe: { stage: "unstable", condition01: 0.72, presentedCondition01: 0.72 } },
    focus: { stage: "unstable", condition01: 0.72, presentedCondition01: 0.72 }
  },
  verbPhysicalization: { stabilizeProgress: 0 }
};

const targeting = new TargetingSystem({
  scene,
  camera,
  playerRoot,
  chemObjectSystem: { objects: [] },
  frameState
});
targeting.init();
targeting.relationshipTarget = {
  root: targetRoot,
  recipe: { id: "probe", chemistry: { instabilityRisk: 0.72 } },
  distance: playerRoot.position.distanceTo(targetRoot.position)
};
targeting.relationshipTargetId = "probe";

targeting.updateRelationshipGlyphs(frameState);
const pulseEarly = targeting.pulseTriangle.position.clone();
const pulseEarlyTravel = frameState.verbTargetRelationshipGrammar.pulseTravel01;
frameState.runtimeSeconds = 0.32;
targeting.updateRelationshipGlyphs(frameState);
const pulseLater = targeting.pulseTriangle.position.clone();
const pulseLaterTravel = frameState.verbTargetRelationshipGrammar.pulseTravel01;
assert.ok(pulseLaterTravel > pulseEarlyTravel, "Pulse travel must advance Core -> noun");
assert.ok(pulseLater.distanceTo(targetRoot.position) < pulseEarly.distanceTo(targetRoot.position));

const cameraForward = new THREE.Vector3();
camera.getWorldDirection(cameraForward).normalize();
const pulseNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(targeting.pulseTriangle.quaternion).normalize();
assert.ok(Math.abs(pulseNormal.dot(cameraForward)) > 0.99, "Pulse triangle must remain camera-facing under oblique view");

frameState.targeting.relationshipVerbs = ["absorb"];
frameState.runtimeSeconds = 0.10;
targeting.updateRelationshipGlyphs(frameState);
const absorbEarly = targeting.absorbTriangle.position.clone();
const absorbEarlyTravel = frameState.verbTargetRelationshipGrammar.absorbTravel01;
frameState.runtimeSeconds = 0.32;
targeting.updateRelationshipGlyphs(frameState);
const absorbLater = targeting.absorbTriangle.position.clone();
const absorbLaterTravel = frameState.verbTargetRelationshipGrammar.absorbTravel01;
assert.ok(absorbLaterTravel < absorbEarlyTravel, "Absorb travel must advance noun -> Core");
assert.ok(absorbLater.distanceTo(playerRoot.position) < absorbEarly.distanceTo(playerRoot.position));
const absorbNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(targeting.absorbTriangle.quaternion).normalize();
assert.ok(Math.abs(absorbNormal.dot(cameraForward)) > 0.99, "Absorb triangle must remain camera-facing under oblique view");

// Stabilize keeps condition fixed on the noun and makes older support yield.
frameState.targeting.relationshipVerbs = ["stabilize"];
targeting.updateRelationshipGlyphs(frameState);
assert.equal(targeting.coherenceBoundary.visible, true);
assert.equal(frameState.verbTargetRelationshipGrammar.stabilizeMeaning, "condition_and_coherence_not_target_selection");

const stabilizeLine = { material: { opacity: 1 } };
const stabilizeField = new THREE.Group();
for (let i = 0; i < 3; i += 1) {
  stabilizeField.add(new THREE.Mesh(new THREE.RingGeometry(0.2, 0.22, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 1 })));
}
const hierarchy = new VisualHierarchyCompressionSystem({
  scene,
  targetingSystem: targeting,
  coreVerbPhysicalizationSystem: { stabilizeLine, stabilizeField },
  frameState
});
frameState.verbTargetRelationshipGrammar.stabilizeActive = true;
hierarchy.compressVerbPhysicalization(1, 0, frameState);
assert.ok(Math.abs(stabilizeLine.material.opacity - 0.22) < 1e-9);
for (const ring of stabilizeField.children) assert.ok(Math.abs(ring.material.opacity - 0.30) < 1e-9);

console.log("HC031W2B3.1 Directional Relationship Readability locks PASS");
