import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as THREE from "three";
import { EntitySystem } from "../src/ecology/EntitySystem.js";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));
const hash = (rel) => crypto.createHash("sha256")
  .update(read(rel).replace(/\r\n?/g, "\n"), "utf8")
  .digest("hex");
const fail = (message) => { throw new Error(`[HC031O1] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };
const angleDistance = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

const entity = read("src/ecology/EntitySystem.js");
const layered = read("src/opening/SurfaceWakeLayeredInteractionSystem.js");
const wake = read("src/opening/SurfaceWakeGameplaySystem.js");
const morph = read("src/morph/LocalCellMorphSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const main = read("src/main.js");
const pkg = json("package.json");
const contract = json("public/data/build/hc031o1HostContinuationDirectionalReadContract.json");
const locked = json("public/data/build/hc031o1LockedHashes.json");

need(main, 'buildId: "HC-031O1"', "build identity");
need(main, 'buildLabel: "Host Continuation Directional Read"', "build label");
if (pkg.version !== "0.31.34") fail("package version mismatch");
if (contract.parent !== "HC-031O") fail("parent mismatch");
if (contract.mode !== "convergence_route_presentation") fail("mode mismatch");

[
  'getObjectByName?.("surface_wake_listening_fold_001")',
  'routeCueTargetId = fold.name',
  'body_orients_to_listening_fold',
  'routeAuthority = false',
  'entity.state = "turning_toward_listening_fold"'
].forEach((token) => need(entity, token, "Watcher directional read"));

[
  'const routeCueWindowSeconds = 5.5',
  'existing_fold_reveal_pulse',
  'addsRouteGeometry = false',
  'directionalCueActive',
  'directionalCueTargetId'
].forEach((token) => need(layered, token, "Fold reveal emphasis"));

[
  'surface_relationship_to_community_memory_to_host_matter_answer',
  'safeSeedRemainsOptionalNourishment'
].forEach((token) => need(wake, token, "HC031O reveal law"));
[
  'seedRouteGateRemoved: true',
  'host_continuation_revealed_move_near_scar_or_signal',
  'pulse_contact_started_no_gate_morph'
].forEach((token) => need(morph, token, "HC031O morph law"));
need(telemetry, 'pass: "HC-031O1"', "telemetry build identity");
need(telemetry, 'blob.session.telemetry.v1.37', "telemetry schema lock");

for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked gameplay owner changed: ${rel}`);
}

{
  const scene = new THREE.Scene();
  const fold = new THREE.Object3D();
  fold.name = "surface_wake_listening_fold_001";
  fold.position.set(10, 0, 0);
  fold.visible = true;
  scene.add(fold);

  const playerRoot = new THREE.Object3D();
  playerRoot.position.set(0, 0, 10);
  const frameState = {
    runtimeSeconds: 4,
    surfaceWakeEcology: {},
    nurseryCircuit: { foldInvitation: true, packetActive: false },
    entityReciprocalBehavior: { byEntityId: {} },
    playerComposition: { scar: 0 }
  };
  const system = new EntitySystem({
    recipeDataSystem: { data: { localCellRecipes: { values: () => [] } } },
    visualComposer: { scene },
    playerRoot,
    localCellRecipe: {},
    frameState
  });
  const watcherRoot = new THREE.Object3D();
  watcherRoot.position.set(0, 0, 0);
  watcherRoot.userData = {};
  const watcher = {
    root: watcherRoot,
    basePosition: watcherRoot.position.clone(),
    baseScale: 1,
    pulseAge: 999,
    state: "idle",
    lastReaction: "none"
  };
  system.updateWatcher(watcher, 1, frameState, 2);
  const foldYaw = Math.PI / 2;
  const playerYaw = 0;
  if (watcher.state !== "turning_toward_listening_fold") fail("Watcher semantic route-cue state regressed");
  if (!watcher.root.userData.routeCueActive) fail("Watcher route cue did not become physically active");
  if (watcher.root.userData.routeCueTargetId !== "surface_wake_listening_fold_001") fail("Watcher did not target the authored Listening Fold");
  if (angleDistance(watcher.root.rotation.y, foldYaw) >= angleDistance(watcher.root.rotation.y, playerYaw)) {
    fail("Watcher facing remained closer to player than Listening Fold");
  }
  if (watcher.root.userData.routeAuthority !== false) fail("Watcher accidentally gained route authority");
}

console.log(`[HC031O1] PASS — HC031O route law remains locked, Watcher physical facing now agrees with its Listening-Fold semantic cue, existing Fold meshes receive only a bounded 5.5 s reveal emphasis, telemetry remains v1.37/read-only, and ${Object.keys(locked.files).length} neighboring owners verified unchanged.`);
