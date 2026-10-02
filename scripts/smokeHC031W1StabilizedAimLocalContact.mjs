import assert from "node:assert/strict";
import * as THREE from "three";
import { TargetingSystem } from "../src/targeting/TargetingSystem.js";
import { GatheringGroundAliveSystem } from "../src/fields/GatheringGroundAliveSystem.js";
import { CoreSurfaceTruthSystem } from "../src/player/CoreSurfaceTruthSystem.js";
import { EntitySystem } from "../src/ecology/EntitySystem.js";

const CELL = "CELL_APERTURE_FIELDS_ARRIVAL_001";

function makeExternal(id, x, y, z, {
  scope = "macro_world",
  priority = 0,
  relationshipRange = null,
  targetKind = scope === "local_entity" ? "living_entity" : "host_territory"
} = {}) {
  const root = new THREE.Object3D();
  root.position.set(x, y, z);
  root.visible = true;
  root.userData = {};
  return {
    id,
    label: id,
    cellId: CELL,
    targetKind,
    root,
    focusRoots: [root],
    domains: scope === "local_entity" ? ["host", "organism", "signal"] : ["host", "territory"],
    externalPriority: priority,
    attentionScope: scope,
    relationshipRange,
    maxRelationshipDistance: relationshipRange,
    source: scope === "local_entity" ? "EntitySystem:smoke" : "ApertureAdjacentTerritorySystem:smoke"
  };
}

function makeFrameState({ entered = false } = {}) {
  return {
    activeCellId: CELL,
    input: {
      stabilizeHeld: false,
      resonanceHeld: false,
      pulseHeld: false,
      pulsePressed: false,
      absorbHeld: false,
      cameraLookX: 0,
      cameraLookY: 0
    },
    inputSource: { stabilizeTriggerValue: 0, rightStickMagnitude: 0 },
    targetFocus: { suppressTargeting: false, allowedCells: [CELL] },
    controllerOnboarding: { tuning: { targeting: { scoreDistanceRange: 6, assistStateDistance: 5.65, lockDistance: 5 } } },
    adjacentHostTerritory: { enteredTerritory: entered },
    worldAttentionCandidates: { active: false, items: [] },
    entityAttentionCandidates: { active: false, items: [] }
  };
}

function settle(system, frameState, steps = 4, dt = 0.06) {
  for (let i = 0; i < steps; i += 1) system.update(dt, frameState);
}

// 0) The actual EntitySystem publisher exposes local Gathering Ground organism nouns only after entry.
{
  const watcherRoot = new THREE.Object3D(); watcherRoot.visible = true;
  const relayRoot = new THREE.Object3D(); relayRoot.visible = true;
  const frameState = { activeCellId: CELL, adjacentHostTerritory: { enteredTerritory: true } };
  const fakeEntitySystem = {
    entities: [
      {
        instanceId: "gathering_ground_watcher_001",
        root: watcherRoot,
        recipe: { id: "membrane_watcher_001", label: "Watcher", chemistry: { domains: ["host", "signal"] }, ecologyGrammar: { relationshipRange: 4.6 } },
        distributionRole: "gathering_ground_perimeter_witness",
        homeCellIds: [CELL]
      },
      {
        instanceId: "gathering_ground_relay_a_001",
        root: relayRoot,
        recipe: { id: "vascular_relay_001", label: "Relay", chemistry: { domains: ["host", "vascular"] }, ecologyGrammar: { relationshipRange: 4.9 } },
        distributionRole: "gathering_ground_exchange_relay_a",
        homeCellIds: [CELL]
      }
    ]
  };
  EntitySystem.prototype.publishLocalAttentionCandidates.call(fakeEntitySystem, frameState, CELL);
  assert.equal(frameState.entityAttentionCandidates.active, true);
  assert.equal(frameState.entityAttentionCandidates.items.length, 2);
  assert.ok(frameState.entityAttentionCandidates.items.every((item) => item.attentionScope === "local_entity"));
  assert.deepEqual(frameState.entityAttentionCandidates.items.map((item) => item.targetKind).sort(), ["living_relay", "living_watcher"]);
}

// 1) Preserve the authored PRE-ENTRY remote relationship used by T4/T6.
{
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
  const playerRoot = new THREE.Object3D();
  scene.add(playerRoot);
  const macro = makeExternal("gathering_ground_cluster", 0, 0, -20, { scope: "macro_world", priority: 2.2 });
  scene.add(macro.root);
  camera.lookAt(macro.root.position);
  camera.updateMatrixWorld(true);

  const frameState = makeFrameState({ entered: false });
  frameState.worldAttentionCandidates = { active: true, items: [macro] };
  const system = new TargetingSystem({ scene, camera, playerRoot, chemObjectSystem: { objects: [] }, frameState });
  system.init();
  settle(system, frameState, 4, 0.06);
  assert.equal(frameState.targeting.attentionTargetId, "gathering_ground_cluster");
  frameState.input.stabilizeHeld = true;
  frameState.input.resonanceHeld = true;
  frameState.inputSource.stabilizeTriggerValue = 1;
  system.update(0.06, frameState);
  assert.equal(frameState.targeting.relationshipTargetId, "gathering_ground_cluster", "pre-entry remote Stabilize relationship must remain valid");
}

// 2) Once local, macro relationship is suppressed and LT+RS can steer between local organisms.
{
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
  const playerRoot = new THREE.Object3D();
  scene.add(playerRoot);
  const macro = makeExternal("gathering_ground_cluster", 0, 0, -18, { scope: "macro_world", priority: 2.2 });
  const watcher = makeExternal("gathering_ground_watcher_001", 0, 0, -4.0, { scope: "local_entity", priority: 3.8, relationshipRange: 4.6, targetKind: "living_watcher" });
  const relay = makeExternal("gathering_ground_relay_a_001", 2.4, 0, -4.0, { scope: "local_entity", priority: 3.5, relationshipRange: 4.9, targetKind: "living_relay" });
  scene.add(macro.root, watcher.root, relay.root);

  const frameState = makeFrameState({ entered: true });
  frameState.worldAttentionCandidates = { active: true, items: [macro] };
  frameState.entityAttentionCandidates = { active: true, items: [watcher, relay] };
  camera.lookAt(watcher.root.position);
  camera.updateMatrixWorld(true);
  const system = new TargetingSystem({ scene, camera, playerRoot, chemObjectSystem: { objects: [] }, frameState });
  system.init();
  settle(system, frameState, 4, 0.06);
  assert.equal(frameState.targeting.attentionTargetId, "gathering_ground_watcher_001", "local Watcher should own centered aim");

  frameState.input.stabilizeHeld = true;
  frameState.input.resonanceHeld = true;
  frameState.inputSource.stabilizeTriggerValue = 1;
  system.update(0.06, frameState);
  assert.equal(frameState.targeting.relationshipTargetId, "gathering_ground_watcher_001");

  camera.lookAt(relay.root.position);
  camera.updateMatrixWorld(true);
  frameState.input.cameraLookX = 0.92;
  frameState.inputSource.rightStickMagnitude = 0.92;
  system.update(0.05, frameState);
  system.update(0.05, frameState);
  system.update(0.05, frameState);
  assert.equal(frameState.targeting.attentionTargetId, "gathering_ground_relay_a_001", "LT+RS should redirect attention to centered local Relay after short dwell");
  assert.equal(frameState.targeting.relationshipTargetId, "gathering_ground_relay_a_001", "Stabilize relationship must follow deliberate local redirect");
  assert.equal(frameState.targeting.relationshipReason, "stabilize_rs_redirected_aim_owned_target");
  assert.ok(frameState.controllerTargetingAudit.stabilizeRedirectSequence >= 1);
  assert.equal(frameState.controllerTargetingAudit.relationshipScope, "local_entity");

  // A sweep back toward the macro body while still local must not steal the working relationship.
  camera.lookAt(macro.root.position);
  camera.updateMatrixWorld(true);
  system.update(0.06, frameState);
  system.update(0.06, frameState);
  assert.equal(frameState.targeting.relationshipTargetId, "gathering_ground_relay_a_001", "macro territory must not steal LT+RS local working relationship after entry");
}

// 3) A pre-existing far macro relationship is dropped when the territory becomes local.
{
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
  const playerRoot = new THREE.Object3D();
  scene.add(playerRoot);
  const macro = makeExternal("gathering_ground_cluster", 0, 0, -20, { scope: "macro_world", priority: 2.2 });
  scene.add(macro.root);
  camera.lookAt(macro.root.position);
  camera.updateMatrixWorld(true);
  const frameState = makeFrameState({ entered: false });
  frameState.worldAttentionCandidates = { active: true, items: [macro] };
  const system = new TargetingSystem({ scene, camera, playerRoot, chemObjectSystem: { objects: [] }, frameState });
  system.init();
  settle(system, frameState, 4, 0.06);
  frameState.input.stabilizeHeld = true;
  frameState.input.resonanceHeld = true;
  frameState.inputSource.stabilizeTriggerValue = 1;
  system.update(0.06, frameState);
  assert.equal(frameState.targeting.relationshipTargetId, "gathering_ground_cluster");
  frameState.adjacentHostTerritory.enteredTerritory = true;
  system.update(0.06, frameState);
  assert.equal(frameState.targeting.relationshipTargetId, "none", "far macro relationship should be suppressed once Gathering Ground is local");
  assert.equal(frameState.targeting.relationshipReason, "stabilize_macro_relationship_suppressed_local_context");
}

// 4) Gathering Ground now authors three real crawlable surfaces using the existing registry.
{
  const scene = new THREE.Scene();
  const playerRoot = new THREE.Object3D();
  scene.add(playerRoot);
  const watcherRoot = new THREE.Object3D();
  watcherRoot.visible = true;
  watcherRoot.position.set(3.5, 8.5, -54.2);
  const relayARoot = new THREE.Object3D();
  relayARoot.visible = true;
  relayARoot.position.set(0.4, 7.2, -58.4);
  const relayBRoot = new THREE.Object3D();
  relayBRoot.visible = true;
  relayBRoot.position.set(-3.8, 10.2, -53.8);
  scene.add(watcherRoot, relayARoot, relayBRoot);
  const entities = [
    { instanceId: "gathering_ground_watcher_001", recipeId: "membrane_watcher_001", root: watcherRoot },
    { instanceId: "gathering_ground_relay_a_001", recipeId: "vascular_relay_001", root: relayARoot },
    { instanceId: "gathering_ground_relay_b_001", recipeId: "vascular_relay_001", root: relayBRoot }
  ];
  const frameState = {
    activeCellId: CELL,
    adjacentHostTerritory: { enteredTerritory: true },
    entityRelationshipGrammar: { byEntityId: {}, primary: { entityId: "none", interpretation: "ambient_listening", engagement01: 0 } },
    input: {},
    runtimeSeconds: 0,
    playerKinematics: { movementBoundary: { surfaceNormal: { x: 0, y: 1, z: 0 } } }
  };
  const alive = new GatheringGroundAliveSystem({
    scene,
    playerRoot,
    frameState,
    entitySystem: { entities },
    apertureFieldsArrivalSystem: { entryAnchor: new THREE.Vector3(0, 0, 0) }
  });
  alive.init();
  alive.update(0.05, frameState);
  assert.equal(alive.contactSurfaces.length, 3);
  assert.deepEqual(alive.contactSurfaces.map((surface) => surface.userData.crawlableSurfaceProfileId).sort(), ["membrane_stable", "residue_weak", "scar_brace"].sort());
  assert.ok(alive.contactSurfaces.every((surface) => surface.userData.targetingSuppressed === true));
  assert.equal(frameState.gatheringGroundAlive.contactSurfaceProof.authoredSurfaceCount, 3);

  // Place the Core just above the Watcher membrane and prove CoreSurfaceTruth sees the authored registry entry.
  playerRoot.position.copy(alive.watcherMembraneSurface.position).add(new THREE.Vector3(0, 0.55, 0));
  scene.updateMatrixWorld(true);
  const surfaceTruth = new CoreSurfaceTruthSystem({ scene, playerRoot, frameState });
  surfaceTruth.init();
  surfaceTruth.update(0.3, frameState);
  assert.equal(frameState.surfaceCapabilityAudit.authoredSurfaceCount, 3, "active Aperture cell should expose the three W1 authored surfaces");
  assert.equal(frameState.surfaceCapabilityAudit.hasAuthoredSurfaces, true);
  assert.ok(["membrane_stable", "scar_brace", "residue_weak"].includes(frameState.surfaceCapabilityAudit.nearestProfileId));
}

console.log("HC031W1 stabilized aim + local contact smoke PASS");
console.log("- pre-entry remote Gathering Ground relationship preserved");
console.log("- local Watcher/Relay nouns share camera targeting vocabulary");
console.log("- LT+RS deliberately redirects Stabilize relationship between local organisms");
console.log("- far macro relationship suppressed after territory entry");
console.log("- 3 authored Gathering Ground crawlable surfaces visible to CoreSurfaceTruthSystem");
