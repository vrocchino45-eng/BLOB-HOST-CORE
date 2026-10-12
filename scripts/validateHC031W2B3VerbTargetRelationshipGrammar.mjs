import assert from "node:assert/strict";
import fs from "node:fs";
import * as THREE from "three";
import { TargetingSystem } from "../src/targeting/TargetingSystem.js";
import { VisualHierarchyCompressionSystem } from "../src/presentation/VisualHierarchyCompressionSystem.js";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const targetingSource = read("../src/targeting/TargetingSystem.js");
const hierarchySource = read("../src/presentation/VisualHierarchyCompressionSystem.js");

// Canonical relationship grammar: Pulse points down/outward, Absorb up/inward,
// Stabilize describes target condition/coherence without gaining targeting authority.
assert.match(targetingSource, /pulseDirection: "outward_down_triangle"/);
assert.match(targetingSource, /absorbDirection: "inward_up_triangle"/);
assert.match(targetingSource, /pulse_core_to_noun_absorb_noun_to_core_camera_facing/);
assert.match(targetingSource, /this\.pulseTriangle\.rotateZ\(Math\.PI\)/);
assert.match(targetingSource, /this\.pulseTriangle\.quaternion\.copy\(this\.camera\.quaternion\)/);
assert.match(targetingSource, /this\.absorbTriangle\.quaternion\.copy\(this\.camera\.quaternion\)/);
assert.match(targetingSource, /closureLaw: "4_to_6_to_8_to_12_as_disorder_resolves"/);
assert.match(targetingSource, /changesTargetingAuthority: false/);
assert.match(targetingSource, /changesVerbPower: false/);
assert.match(hierarchySource, /relationshipGrammarPass: "HC-031W2B3\.1"/);
assert.match(hierarchySource, /target_condition_and_directional_relationship_travel/);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
camera.position.set(0, 1, 4);
camera.lookAt(0, 0, 0);
scene.add(camera);
const playerRoot = new THREE.Group();
playerRoot.position.set(0, 0, 0);
scene.add(playerRoot);
const targetRoot = new THREE.Group();
targetRoot.position.set(0, 0, -2);
targetRoot.visible = true;
scene.add(targetRoot);
scene.updateMatrixWorld(true);

const frameState = {
  runtimeSeconds: 1.25,
  targeting: {
    relationshipActive: true,
    relationshipVerbs: ["pulse"],
    lockStrength: 0.8,
    targetKind: "absorbable",
    reticleState: "assist"
  },
  reactiveStateGrammar: {
    objects: {
      probe: { stage: "unstable", condition01: 0.72, presentedCondition01: 0.72 }
    },
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
  distance: 2
};
targeting.relationshipTargetId = "probe";

targeting.updateRelationshipGlyphs(frameState);
assert.equal(targeting.pulseTriangle.visible, true);
assert.equal(targeting.absorbTriangle.visible, false);
assert.equal(frameState.verbTargetRelationshipGrammar.pass, "HC-031W2B3.1");
assert.equal(frameState.verbTargetRelationshipGrammar.pulseDirection, "outward_down_triangle");
assert.equal(frameState.verbTargetRelationshipGrammar.directionalTravelLaw, "pulse_core_to_noun_absorb_noun_to_core_camera_facing");
const pulseDistanceFromCore = targeting.pulseTriangle.position.distanceTo(playerRoot.position);
assert.ok(pulseDistanceFromCore > 0 && pulseDistanceFromCore < playerRoot.position.distanceTo(targetRoot.position));

frameState.targeting.relationshipVerbs = ["absorb"];
targeting.updateRelationshipGlyphs(frameState);
assert.equal(targeting.pulseTriangle.visible, false);
assert.equal(targeting.absorbTriangle.visible, true);
const absorbDistanceFromCore = targeting.absorbTriangle.position.distanceTo(playerRoot.position);
assert.ok(absorbDistanceFromCore > 0 && absorbDistanceFromCore < playerRoot.position.distanceTo(targetRoot.position));
assert.equal(frameState.verbTargetRelationshipGrammar.absorbDirection, "inward_up_triangle");

// Stabilize boundary reports real target condition and regularizes as the target
// itself becomes more coherent. It is not a generic lock-on ring.
frameState.targeting.relationshipVerbs = ["stabilize"];
frameState.reactiveStateGrammar.objects.probe = { stage: "failing", condition01: 0.9, presentedCondition01: 0.9 };
frameState.verbPhysicalization.stabilizeProgress = 0;
targeting.updateRelationshipGlyphs(frameState);
assert.equal(targeting.coherenceBoundary.visible, true);
assert.equal(frameState.verbTargetRelationshipGrammar.coherenceSides, 4);
assert.equal(frameState.verbTargetRelationshipGrammar.stabilizeMeaning, "condition_and_coherence_not_target_selection");

frameState.reactiveStateGrammar.objects.probe = { stage: "strained", condition01: 0.48, presentedCondition01: 0.48 };
frameState.verbPhysicalization.stabilizeProgress = 0.1;
targeting.updateRelationshipGlyphs(frameState);
assert.equal(frameState.verbTargetRelationshipGrammar.coherenceSides, 6);

frameState.reactiveStateGrammar.objects.probe = { stage: "coherent", condition01: 0.22, presentedCondition01: 0.22 };
frameState.verbPhysicalization.stabilizeProgress = 0.25;
targeting.updateRelationshipGlyphs(frameState);
assert.equal(frameState.verbTargetRelationshipGrammar.coherenceSides, 8);

frameState.reactiveStateGrammar.objects.probe = { stage: "coherent", condition01: 0.1, presentedCondition01: 0.1 };
frameState.verbPhysicalization.stabilizeProgress = 0.8;
targeting.updateRelationshipGlyphs(frameState);
assert.equal(frameState.verbTargetRelationshipGrammar.coherenceSides, 12);
assert.ok(frameState.verbTargetRelationshipGrammar.residualDisorder01 < 0.1);

// W2B3 promotes grammar above generic support, but still caps it below target-body response.
const hierarchy = new VisualHierarchyCompressionSystem({
  scene,
  targetingSystem: targeting,
  coreVerbPhysicalizationSystem: null,
  frameState
});
targeting.pulseTriangle.material.opacity = 0.5;
targeting.absorbTriangle.material.opacity = 0.5;
targeting.coherenceBoundary.material.opacity = 0.4;
frameState.verbTargetRelationshipGrammar.reactiveStage = "unstable";
hierarchy.compressTargetingGlyphs(true, 1, frameState);
assert.ok(targeting.pulseTriangle.material.opacity <= 0.26 && targeting.pulseTriangle.material.opacity > 0.20);
assert.ok(targeting.absorbTriangle.material.opacity <= 0.26 && targeting.absorbTriangle.material.opacity > 0.20);
assert.ok(targeting.coherenceBoundary.material.opacity <= 0.24 && targeting.coherenceBoundary.material.opacity > 0.16);

console.log("HC031W2B3 Verb / Target Relationship Grammar locks PASS");
