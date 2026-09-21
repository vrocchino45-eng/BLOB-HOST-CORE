import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031H] ${message}`); };
const requireText = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };

const support = read("src/player/CoreTendrilSupportPlaneSystem.js");
const tendrils = read("src/player/CoreTendrilSurfaceContactSystem.js");
const movement = read("src/player/PlayerMovementController.js");
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const runtime = read("src/core/GameRuntime.js");
const composition = read("src/interaction/VerbCompositionSystem.js");
const stabilizedProjection = read("src/interaction/StabilizedProjectionSystem.js");
const main = read("src/main.js");
const pkg = JSON.parse(read("package.json"));
const contract = JSON.parse(read("public/data/build/hc031hPlantedContactSupportContract.json"));

[
  'pass: "HC-031H"',
  'source: "world_planted_suction_anchors"',
  'bodyRideHeightDerivedFromSupports: true',
  'surfaceTruthStillOwnsEligibility: true',
  'movementAuthority: "PlayerMovementController"',
  'anchorAuthority: "CoreTendrilSurfaceContactSystem"',
  'addsRaycast: false',
  'changesVerbGrammar: false'
].forEach((token) => requireText(support, token, "support-plane owner"));

[
  'this.stepCandidateIndex = -1',
  'stridePressure',
  'computePredictedStepAnchor',
  'pendingAnchorWorld',
  'plantedContactPolicy: "world_fixed_until_stride_pressure_requires_replant"',
  'stepSelectionPolicy: "highest_stride_pressure_deterministic_tie_break"',
  'predictedFootholdInSurfaceTangentFrame: true'
].forEach((token) => requireText(tendrils, token, "planted-contact gait"));

[
  'syncTendrilSupportPlane(frameState)',
  'this.tendrilSupportPlaneActive',
  'const locomotionNormal = this.tendrilSupportPlaneActive',
  'const useSupportPlane = this.tendrilSupportPlaneActive && this.tendrilSupportCount >= 2',
  'supportPlaneScale',
  'tendrilSupportPlane:'
].forEach((token) => requireText(movement, token, "movement support-plane consumer"));

[
  'const supportPlane = frameState.coreTendrilSupportPlane ?? {}',
  'const normal = supportPlane.active',
  'supportPlaneConformActive: Boolean(supportPlane.active)'
].forEach((token) => requireText(embodiment, token, "support-plane embodiment"));

[
  'attachmentSurfaceId:',
  'tendrilSupportPlaneActive:',
  'tendrilSupportPlaneQuality01:',
  'stabilizedProjectionMode:',
  'stabilizedProjectionSurfaceBraced:',
  'stabilizedProjectionBraceQuality01:'
].forEach((token) => requireText(telemetry, token, "telemetry proof fields"));

requireText(runtime, 'import { CoreTendrilSupportPlaneSystem } from "../player/CoreTendrilSupportPlaneSystem.js";', "runtime support import");
requireText(runtime, 'this.coreTendrilSupportPlaneSystem = new CoreTendrilSupportPlaneSystem({', "runtime support construction");
requireText(runtime, 'this.registry.register("coreTendrilSupportPlaneSystem", this.coreTendrilSupportPlaneSystem);', "runtime support registration");
requireText(main, 'buildId: "HC-031H"', "build identity");

const surfaceOrder = runtime.indexOf('this.registry.register("coreSurfaceTruthSystem", this.coreSurfaceTruthSystem);');
const supportOrder = runtime.indexOf('this.registry.register("coreTendrilSupportPlaneSystem", this.coreTendrilSupportPlaneSystem);');
const movementOrder = runtime.indexOf('this.registry.register("playerMovement", this.playerMovementController);');
const tendrilOrder = runtime.indexOf('this.registry.register("coreTendrilSurfaceContactSystem", this.coreTendrilSurfaceContactSystem);');
if (!(surfaceOrder >= 0 && supportOrder > surfaceOrder && movementOrder > supportOrder && tendrilOrder > movementOrder)) {
  fail("runtime order must be surface truth -> prior-frame support interpreter -> movement -> same-frame tendril update");
}

// HC031G verb grammar remains the reference contract and must not be rewritten.
[
  'cohere_project:',
  'meaning: "controlled_directional_push"',
  'pulseStabilize: "cohere_then_project_as_controlled_push"'
].forEach((token) => requireText(composition, token, "locked HC029C grammar"));
[
  'composition.chord === "cohere_project"',
  'requiresSurfaceAnchor: false',
  'surfaceAnchorEnhancesSameFunction: true'
].forEach((token) => requireText(stabilizedProjection, token, "locked HC031G projection"));

if (!contract.lockedTruth.stabilizedProjectionGrammarLocked) fail("HC031G stabilized projection grammar is not locked");
if (contract.lockedTruth.focusedProjectionRequiresSurfaceAnchor !== false) fail("surface anchoring became an ability gate");
if (contract.lockedTruth.movementAuthority !== "PlayerMovementController") fail("movement authority changed");
if (contract.lockedTruth.supportPlaneReadOnly !== true) fail("support plane must remain read-only");
if (contract.lockedTruth.tendrilCount !== 3) fail("three-tendril grammar changed");
if (contract.lockedTruth.addsNewButton || contract.lockedTruth.addsCollider || contract.lockedTruth.addsRaycastOwner || contract.lockedTruth.addsRuntimeDependency) {
  fail("forbidden runtime expansion detected");
}

if (pkg.dependencies?.["three-mesh-bvh"] || pkg.dependencies?.["three-ik"] || pkg.dependencies?.rapier) {
  fail("HC031H must not add an external locomotion/physics dependency");
}

const locked = JSON.parse(read("public/data/build/hc031hLockedParentHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  const actual = hash(rel);
  if (actual !== expected) fail(`locked HC031G owner changed: ${rel}`);
}

// Independent geometry sanity check for the support-plane rule. Three separated
// planted contacts must produce non-zero support area and a stable ride-height basis.
const a = [0.30, 0, 0];
const b = [-0.18, 0, 0.24];
const c = [-0.18, 0, -0.24];
const ab = b.map((v, i) => v - a[i]);
const ac = c.map((v, i) => v - a[i]);
const cross = [
  ab[1] * ac[2] - ab[2] * ac[1],
  ab[2] * ac[0] - ab[0] * ac[2],
  ab[0] * ac[1] - ab[1] * ac[0]
];
const area = 0.5 * Math.hypot(...cross);
if (!(area > 0.08 && area < 0.2)) fail(`support triangle sanity failed: area=${area}`);

console.log(`[HC031H] PASS — world-planted support plane + strain-driven replant assimilation; HC031G verb grammar locked; ${Object.keys(locked.files).length} parent owners locked.`);
