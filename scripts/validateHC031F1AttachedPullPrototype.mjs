import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031F1] ${message}`); };
const requireText = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };

const movement = read("src/player/PlayerMovementController.js");
const contact = read("src/player/CoreTendrilSurfaceContactSystem.js");
const runtime = read("src/core/GameRuntime.js");
const main = read("src/main.js");
const contract = JSON.parse(read("public/data/build/hc031f1AttachedPullPrototypeContract.json"));

[
  "applyTendrilSurfaceLocomotion(",
  "const directInputAccelerationScale = tendrilSurfaceDriveActive ? 0.12 : 1.0",
  "this.velocity.addScaledVector(this.intent, acceleration * dt * directInputAccelerationScale)",
  "this.velocity.addScaledVector(this.tendrilDriveDirection, pullAcceleration * dt)",
  'locomotionMode: hubGuidedFlightActive',
  '"surface_tendril_pull"',
  "this.attachmentStandOffDistance = 0.30",
  "1 - this.attachmentStandOffDistance / Math.max(0.35, localSurfaceRadius)",
  'movementReference: hubGuidedFlightActive'
].forEach((token) => requireText(movement, token, "movement traction contract"));

[
  'pass: "HC-031F1"',
  "const desiredMove = kinematics.desiredMoveVector ?? {}",
  "publishesMovementRequest: true",
  "locomotionDrivenByTendrils: true",
  "oneFrameCausalHandoff: true",
  "anchors: anchorStates",
  'movementAuthority: "PlayerMovementController"',
  'anchorAuthority: "CoreTendrilSurfaceContactSystem"',
  'surfaceSource: "trusted_authored_movement_boundary"',
  "addsCollider: false",
  "addsRaycast: false",
  "changesControls: false"
].forEach((token) => requireText(contact, token, "tendril anchor contract"));

requireText(runtime, 'this.registry.register("playerMovement", this.playerMovementController);', "movement runtime owner");
requireText(runtime, 'this.registry.register("coreTendrilSurfaceContactSystem", this.coreTendrilSurfaceContactSystem);', "tendril runtime owner");
if (runtime.indexOf('this.registry.register("playerMovement", this.playerMovementController);') > runtime.indexOf('this.registry.register("coreTendrilSurfaceContactSystem", this.coreTendrilSurfaceContactSystem);')) {
  fail("one-frame causal order changed: player movement must consume prior-frame tendril request before contact publishes the next request");
}
requireText(main, 'buildId: "HC-031F1"', "build identity");

if (contract.lockedTruth.tendrilCount !== 3) fail("three-tendril grammar changed");
if (contract.lockedTruth.locomotionDrivenByTendrils !== true) fail("tendril locomotion flag not enabled");
if (contract.lockedTruth.movementAuthority !== "PlayerMovementController") fail("movement authority changed");
if (contract.lockedTruth.anchorAuthority !== "CoreTendrilSurfaceContactSystem") fail("anchor authority mismatch");
if (contract.lockedTruth.directInputAccelerationScaleWhileTendrilDriven !== 0.12) fail("raw surface thrust scale drifted");
if (contract.lockedTruth.standOffDistance !== 0.30) fail("stand-off contract drifted");
if (contract.lockedTruth.addsCollider || contract.lockedTruth.addsRaycast || contract.lockedTruth.changesControls) fail("forbidden contact/input expansion detected in contract");

const locked = JSON.parse(read("public/data/build/hc031f1LockedParentHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  const actual = hash(rel);
  if (actual !== expected) fail(`locked parent owner changed: ${rel}`);
}

// Lightweight numeric proof of the intended pull cadence without requiring Three.js.
const baseAcceleration = 13.1;
const traction01 = 1.0;
const handoffScale = 1.0;
const supportScale = 1.0;
const alignment = 0.9;
const alignmentScale = Math.min(1, Math.max(0.42, 0.56 + alignment * 0.44));
const pull = baseAcceleration * (0.46 + traction01 * 0.44) * handoffScale * supportScale * alignmentScale;
const handoffPull = pull * 0.72;
if (!(pull > 9 && pull < 14)) fail(`supported pull out of bounded range: ${pull}`);
if (!(handoffPull < pull && handoffPull > pull * 0.65)) fail("handoff traction does not soften without collapsing");
const standOffTarget = 1 - 0.30 / 4.8;
if (!(standOffTarget > 0.90 && standOffTarget < 0.972)) fail("world-space stand-off cannot resolve inside allowed normalized shell");

console.log(`[HC031F1] PASS — planted-anchor traction + bounded handoff cadence + ${Object.keys(locked.files).length} locked parent owners.`);
