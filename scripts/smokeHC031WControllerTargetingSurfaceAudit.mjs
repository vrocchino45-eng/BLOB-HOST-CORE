import assert from "node:assert/strict";
import * as THREE from "three";
import { TargetingSystem } from "../src/targeting/TargetingSystem.js";
import { CoreSurfaceTruthSystem } from "../src/player/CoreSurfaceTruthSystem.js";
import { applyCrawlableSurfaceMetadata } from "../src/world/CrawlableSurfaceRegistry.js";

const CELL = "CELL_APERTURE_FIELDS_ARRIVAL_001";

function makeTarget(id, x, y, z, priority = 0) {
  const root = new THREE.Object3D();
  root.position.set(x, y, z);
  root.visible = true;
  root.userData = { cellId: CELL };
  return {
    root,
    cellId: CELL,
    externalPriority: priority,
    absorbed: false,
    recipe: {
      id,
      label: id,
      chemistry: { domains: ["signal"], bondTypes: [], instabilityRisk: 0 },
      behavior: {}
    }
  };
}

{
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
  camera.position.set(0, 0, 0);
  camera.lookAt(0, 0, -1);
  camera.updateMatrixWorld(true);
  const playerRoot = new THREE.Object3D();
  scene.add(playerRoot);
  const targetA = makeTarget("audit_target_a", 0, 0, -3);
  const targetB = makeTarget("audit_target_b", 3, 0, -3);
  scene.add(targetA.root, targetB.root);
  const frameState = {
    activeCellId: CELL,
    input: { stabilizeHeld: false, resonanceHeld: false, cameraLookX: 0, cameraLookY: 0 },
    inputSource: { stabilizeTriggerValue: 0, rightStickMagnitude: 0 },
    targetFocus: { suppressTargeting: false, allowedCells: [CELL] },
    controllerOnboarding: { tuning: { targeting: { scoreDistanceRange: 6, assistStateDistance: 5.2, lockDistance: 5 } } },
    worldAttentionCandidates: { active: false, items: [] }
  };
  const system = new TargetingSystem({
    scene,
    camera,
    playerRoot,
    chemObjectSystem: { objects: [targetA, targetB] },
    frameState
  });
  system.init();
  system.update(0.11, frameState);
  system.update(0.13, frameState);
  assert.equal(frameState.targeting.attentionTargetId, "audit_target_a", "initial camera aim should own target A");

  frameState.input.stabilizeHeld = true;
  frameState.input.resonanceHeld = true;
  frameState.input.cameraLookX = 0.82;
  frameState.inputSource.stabilizeTriggerValue = 0.91;
  frameState.inputSource.rightStickMagnitude = 0.82;
  camera.lookAt(targetB.root.position);
  camera.updateMatrixWorld(true);
  system.update(0.08, frameState);

  assert.equal(frameState.targeting.candidateId, "audit_target_b", "right-stick camera direction should expose B as the better candidate");
  assert.equal(frameState.targeting.attentionTargetId, "audit_target_a", "accepted V policy should still protect the old attention owner while a verb is active");
  assert.equal(frameState.targeting.relationshipTargetId, "audit_target_a", "Stabilize should currently modify the protected attention owner");
  assert.equal(frameState.controllerTargetingAudit.stabilizeBlocksRedirectEvidence, true, "W must flag deliberate RS redirect evidence blocked by Stabilize protection");
  assert.equal(frameState.controllerTargetingAudit.findingCode, "stabilize_protects_old_attention_during_rs_redirect");
  assert.equal(frameState.controllerTargetingAudit.behaviorChanged, false);
}

{
  const scene = new THREE.Scene();
  const playerRoot = new THREE.Object3D();
  playerRoot.position.set(0, 0, 0);
  scene.add(playerRoot);
  const frameState = { activeCellId: CELL, playerKinematics: { movementBoundary: { surfaceNormal: { x: 0, y: 1, z: 0 } } } };
  const system = new CoreSurfaceTruthSystem({ scene, playerRoot, frameState });
  system.init();
  system.update(0.3, frameState);
  assert.equal(frameState.surfaceCapabilityAudit.authoredSurfaceCount, 0);
  assert.equal(frameState.surfaceCapabilityAudit.findingCode, "no_authored_crawlable_surfaces_in_active_cell");

  const surface = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshBasicMaterial());
  surface.position.set(0, -0.5, 0);
  applyCrawlableSurfaceMetadata(surface, {
    surfaceId: "HC031W_SMOKE_MEMBRANE",
    profileId: "membrane_stable",
    cellId: CELL,
    contactPriority: 0.1
  });
  scene.add(surface);
  scene.updateMatrixWorld(true);
  system.update(0.3, frameState);
  assert.equal(frameState.surfaceCapabilityAudit.authoredSurfaceCount, 1);
  assert.equal(frameState.surfaceCapabilityAudit.profileCounts.membrane_stable, 1);
  assert.equal(frameState.surfaceCapabilityAudit.hasAuthoredSurfaces, true);
}

console.log("HC031W controller/targeting + surface audit smoke PASS");
