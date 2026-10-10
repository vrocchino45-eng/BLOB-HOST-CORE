import assert from "node:assert/strict";
import fs from "node:fs";
import * as THREE from "three";
import { CoreVerbPhysicalizationSystem } from "../src/player/CoreVerbPhysicalizationSystem.js";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const verbsSource = read("../src/player/CoreVerbPhysicalizationSystem.js");
const hierarchySource = read("../src/presentation/VisualHierarchyCompressionSystem.js");
const sensorySource = read("../src/player/CoreSensoryResponseSystem.js");

// W2B2 changes presentation sequencing, not Pulse gameplay authority.
assert.match(verbsSource, /pulseSpatialRevealPass: "HC-031W2B2"/);
assert.match(verbsSource, /outgoing_wave_yields_to_distance_tiered_contact_contour_then_directional_return/);
assert.match(verbsSource, /deep_fragment/);
assert.match(verbsSource, /deep_layer/);
assert.match(verbsSource, /deep_relation/);
assert.match(verbsSource, /materialPhases/);
assert.match(verbsSource, /arrivalLift = THREE\.MathUtils\.smoothstep/);
assert.match(verbsSource, /peakOpacity/);
assert.match(hierarchySource, /spatialRevealPass: "HC-031W2B2"/);
assert.match(hierarchySource, /pulse_return_and_local_relationship_change/);
assert.match(hierarchySource, /outgoing_spheres_rings_lines_and_distant_wireframes/);

// Existing sensory law, actionable range, echo timing, and deep-reach authority stay locked.
assert.match(sensorySource, /law: "pulse_is_embodied_sonar_emit_contact_return"/);
assert.match(sensorySource, /const localActionableRange = 4\.25/);
assert.match(sensorySource, /returnAt: contactAt \* 2/);
assert.match(sensorySource, /chargedStructuralReachIsPresentationOnly: true/);
assert.match(sensorySource, /deepAnswersCreateWaypoint: false/);
assert.match(sensorySource, /changesPulseRange: false/);

// Runtime tier resolver: repeat reads reveal more structure, while deep reads begin fragmented.
const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
scene.add(playerRoot);
const system = new CoreVerbPhysicalizationSystem({
  scene,
  playerRoot,
  chemObjectSystem: { objects: [] },
  frameState: {}
});
const frameState = { coreSensoryResponse: { maxRange: 8.0 } };
const local1 = system.resolvePulseSpatialReveal({ distance: 1.0, reachClass: "local_actionable", resolutionStage: 1 }, frameState);
const local3 = system.resolvePulseSpatialReveal({ distance: 1.0, reachClass: "local_actionable", resolutionStage: 3 }, frameState);
const deep1 = system.resolvePulseSpatialReveal({ distance: 6.0, reachClass: "deep_structural", resolutionStage: 1 }, frameState);
const deep3 = system.resolvePulseSpatialReveal({ distance: 6.0, reachClass: "deep_structural", resolutionStage: 3 }, frameState);

assert.equal(local1.spatialTier, "local_near");
assert.equal(local1.meshLimit, 2);
assert.equal(local3.meshLimit, 4);
assert.equal(deep1.spatialTier, "deep_fragment");
assert.equal(deep1.meshLimit, 1);
assert.equal(deep3.spatialTier, "deep_relation");
assert.equal(deep3.meshLimit, 3);
assert.ok(local1.baseOpacity > deep1.baseOpacity);
assert.ok(deep3.life > deep1.life);
assert.ok(deep1.propagationSpan > local1.propagationSpan);

// W2B2 must not increase the established transient geometry budgets.
assert.equal(system.maxPulseContours, 3);
assert.equal(system.maxPulseContourMeshes, 4);
assert.equal(system.maxPulseContourSegmentsPerMesh, 180);
assert.equal(system.maxPulseFronts, 3);
assert.equal(system.maxPulseReturnMotes, 10);

// Actual contour construction follows the tier resolver instead of painting every
// eligible mesh at once. Re-reading the same noun replaces, rather than stacks,
// the previous contour.
const targetRoot = new THREE.Group();
targetRoot.visible = true;
for (let index = 0; index < 4; index += 1) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.2 + index * 0.02, 0.18, 0.16),
    new THREE.MeshBasicMaterial()
  );
  mesh.position.x = index * 0.24;
  targetRoot.add(mesh);
}
scene.add(targetRoot);
system.chemObjectSystem.objects = [{ recipe: { id: "w2b2_probe" }, root: targetRoot }];

system.spawnPulseContour({
  id: "w2b2_probe", distance: 1.0, reachClass: "local_actionable", resolutionStage: 1
}, 0x9fe8ff, frameState);
assert.equal(system.pulseContours.length, 1);
assert.equal(system.pulseContours[0].root.children.length, 2);
assert.equal(system.pulseContours[0].spatialTier, "local_near");

system.spawnPulseContour({
  id: "w2b2_probe", distance: 1.0, reachClass: "local_actionable", resolutionStage: 3
}, 0x9fe8ff, frameState);
assert.equal(system.pulseContours.length, 1, "repeat read must refresh one contour instead of stacking duplicate cages");
assert.equal(system.pulseContours[0].root.children.length, 4);
assert.equal(system.pulseContours[0].materialPhases.length, 4);
assert.ok(system.pulseContours[0].materialPhases[0] < system.pulseContours[0].materialPhases[3]);

system.spawnPulseContour({
  id: "w2b2_probe", distance: 6.0, reachClass: "deep_structural", resolutionStage: 1
}, 0x9fe8ff, frameState);
assert.equal(system.pulseContours.length, 1);
assert.equal(system.pulseContours[0].root.children.length, 1);
assert.equal(system.pulseContours[0].spatialTier, "deep_fragment");

// Return cues grow toward the Core instead of fading from maximum brightness at
// contact, so the directional answer is strongest during the return phase.
system.spawnPulseReturnMote({
  position: { x: 2, y: 0, z: 0 }, distance: 2, reachClass: "local_actionable",
  resolutionStage: 1, returnTravelSeconds: 0.3, responseClass: "host_membrane"
}, 0xd0a7ff, frameState);
const localReturn = system.pulseReturnMotes.at(-1);
assert.ok(localReturn.startOpacity < localReturn.peakOpacity);

system.spawnPulseReturnMote({
  position: { x: 6, y: 0, z: 0 }, distance: 6, reachClass: "deep_structural",
  resolutionStage: 1, returnTravelSeconds: 0.6, responseClass: "dense_structure"
}, 0xf7dfba, frameState);
const deepReturn = system.pulseReturnMotes.at(-1);
assert.ok(deepReturn.startOpacity < deepReturn.peakOpacity);
assert.ok(deepReturn.startOpacity < localReturn.startOpacity);

console.log("HC031W2B2 Pulse/Sonar Spatial Reveal locks PASS");
