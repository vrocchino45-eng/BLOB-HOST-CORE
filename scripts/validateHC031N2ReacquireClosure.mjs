import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as THREE from "three";
import { PlayerMovementController } from "../src/player/PlayerMovementController.js";
import { SessionTelemetrySystem } from "../src/core/SessionTelemetrySystem.js";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));
const hash = (rel) => crypto.createHash("sha256")
  .update(read(rel).replace(/\r\n?/g, "\n"), "utf8")
  .digest("hex");
const fail = (message) => { throw new Error(`[HC031N2] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };

const movement = read("src/player/PlayerMovementController.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const main = read("src/main.js");
const pkg = json("package.json");
const contract = json("public/data/build/hc031n2ReacquireClosureContract.json");
const locked = json("public/data/build/hc031n2LockedHashes.json");

need(main, 'buildId: "HC-031N2"', "build identity");
need(main, 'buildLabel: "Reacquire Closure"', "build label");
if (pkg.version !== "0.31.32") fail("package version mismatch");
if (contract.parent !== "HC-031N1") fail("parent mismatch");
if (contract.mode !== "convergence_movement_hotfix") fail("mode mismatch");

[
  'this.attachmentReleaseClearance >= 0.26',
  'this.attachmentCooldown = 0.55',
  '0.54',
  'this.attachmentStrength * 0.40',
  'peelTension01 * 0.34',
  'different_surface_after_deliberate_peel',
  'this.attachmentDetachReason === "deliberate_away_input"',
  'reacquireCandidateSurfaceId !== blockedReleaseSurfaceId',
  'this.attachmentCooldown <= 0'
].forEach((token) => need(movement, token, "reacquire closure law"));

[
  'blob.session.telemetry.v1.36',
  'pass: "HC-031N2"',
  'surfaceReacquireDifferentSurfaceUnblocks',
  'differentSurfaceAvailable',
  'reacquireUnblockFromSurfaceId',
  'reacquireUnblockToSurfaceId',
  'validation.physical_language.world_answer',
  '"reacquired_contact", 8'
].forEach((token) => need(telemetry, token, "N2 telemetry"));

for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked neighboring gameplay owner changed: ${rel}`);
}

const makeController = ({ supportSurfaceId, detachReason = "deliberate_away_input", cooldown = 0, y = 0.10 }) => {
  const frameState = {
    coreChemistryOutput: {},
    tightInspectionCamera: { coreWorkActive: false },
    coreTendrilSupportPlane: { carriedSurfaceIdentity: true },
    verbComposition: { intent: {} },
    verbPhysicalGrammar: { mode: "idle", effects: {} }
  };
  const playerRoot = new THREE.Object3D();
  playerRoot.position.set(0, y, 0);
  const camera = new THREE.PerspectiveCamera();
  const controller = new PlayerMovementController({
    playerRoot,
    camera,
    frameState,
    localCellRecipe: { physicalFeel: {} }
  });
  controller.tendrilSupportPlaneActive = true;
  controller.tendrilSupportCount = 1;
  controller.tendrilSupportSurfaceId = supportSurfaceId;
  controller.tendrilSupportCentroid.set(0, 0, 0);
  controller.tendrilSupportNormal.set(0, 1, 0);
  controller.tendrilSupportAdhesion = 0.8;
  controller.tendrilSupportLoadTolerance = 0.8;
  controller.boundarySurfaceNormal.set(0, 1, 0);
  controller.attachmentDetachReason = detachReason;
  controller.attachmentReleaseSurfaceId = "HOST_CONTACT_CONTINUATION_SCAR_BRACE_01";
  controller.attachmentReleasePoint.set(0, 0, 0);
  controller.attachmentReleaseNormal.set(0, 1, 0);
  controller.attachmentReleaseStartDistance = 0.10;
  controller.attachmentCooldown = cooldown;
  controller.attachmentReacquireBlocked = true;
  return { controller, frameState };
};

// Same-surface snap-back remains blocked below the original 0.26 m clearance.
{
  const { controller, frameState } = makeController({ supportSurfaceId: "HOST_CONTACT_CONTINUATION_SCAR_BRACE_01" });
  controller.updateChemistryAttachmentState(0.05, frameState);
  if (!controller.attachmentReacquireBlocked) fail("same-surface snap-back was unblocked below 0.26 clearance");
  if (controller.attachmentActive) fail("same release surface reacquired prematurely");
}

// Different valid support cannot bypass the existing 0.55 s cooldown.
{
  const { controller, frameState } = makeController({
    supportSurfaceId: "HOST_CONTACT_CONTINUATION_MEMBRANE_02",
    cooldown: 0.55
  });
  controller.updateChemistryAttachmentState(0.05, frameState);
  if (!controller.attachmentReacquireBlocked) fail("different support bypassed active cooldown");
}

// After cooldown, a different valid support clears stale release ownership even
// though old-normal clearance is still zero; acquisition may proceed immediately.
{
  const { controller, frameState } = makeController({ supportSurfaceId: "HOST_CONTACT_CONTINUATION_MEMBRANE_02" });
  controller.updateChemistryAttachmentState(0.05, frameState);
  if (controller.attachmentReacquireBlocked) fail("different support did not clear stale deliberate-peel block");
  if (controller.attachmentReacquireUnblockReason !== "different_surface_after_deliberate_peel") fail("different-support unblock reason missing");
  if (controller.attachmentReacquireUnblockFromSurfaceId !== "HOST_CONTACT_CONTINUATION_SCAR_BRACE_01") fail("unblock source surface mismatch");
  if (controller.attachmentReacquireUnblockToSurfaceId !== "HOST_CONTACT_CONTINUATION_MEMBRANE_02") fail("unblock destination surface mismatch");
  if (controller.attachmentReleaseClearance >= 0.26) fail("different-support proof accidentally satisfied old clearance rule");
  if (!controller.attachmentActive || controller.attachmentOwnerSurfaceId !== "HOST_CONTACT_CONTINUATION_MEMBRANE_02") fail("different valid support did not reacquire");
}

// Forced release behavior remains unchanged: a different support does not invoke
// the deliberate-peel escape path.
{
  const { controller, frameState } = makeController({
    supportSurfaceId: "HOST_CONTACT_CONTINUATION_MEMBRANE_02",
    detachReason: "sustained_contact_loss"
  });
  controller.updateChemistryAttachmentState(0.05, frameState);
  if (!controller.attachmentReacquireBlocked) fail("forced detach incorrectly used deliberate different-surface escape");
}

// Original clearance path remains valid for the same release surface.
{
  const { controller, frameState } = makeController({
    supportSurfaceId: "HOST_CONTACT_CONTINUATION_SCAR_BRACE_01",
    y: 0.40
  });
  controller.updateChemistryAttachmentState(0.05, frameState);
  if (controller.attachmentReacquireBlocked) fail("same-surface clearance path no longer unblocks");
  if (controller.attachmentReacquireUnblockReason !== "release_clearance_reached") fail("clearance unblock reason mismatch");
}

// Read-only telemetry must distinguish the new unblock cause.
{
  let clockMs = 0;
  const frameState = {
    buildId: "HC-031N2",
    buildLabel: "Reacquire Closure",
    runtimeSeconds: 0,
    activeCellId: "CELL_MEMBRANE_NURSERY_001",
    input: { pulseEventId: 0 },
    targeting: {},
    playerAttachment: { active: false, state: "free", reacquireBlocked: true },
    corePerformance: { endurance: { reserve01: 1 } }
  };
  const observer = new SessionTelemetrySystem({ frameState, monotonicNowMs: () => clockMs });
  frameState.playerAttachment = {
    active: false,
    state: "free",
    reacquireBlocked: false,
    reacquireUnblockReason: "different_surface_after_deliberate_peel",
    reacquireUnblockFromSurfaceId: "HOST_CONTACT_CONTINUATION_SCAR_BRACE_01",
    reacquireUnblockToSurfaceId: "HOST_CONTACT_CONTINUATION_MEMBRANE_02",
    reacquireCandidateSurfaceId: "HOST_CONTACT_CONTINUATION_MEMBRANE_02",
    releaseSurfaceId: "none",
    releaseClearance: 0.098
  };
  clockMs += 50;
  observer.observeSurfaceDetachment(frameState);
  const event = observer.events.find((item) => item.type === "movement.surface_reacquire_unblocked");
  if (!event) fail("reacquire unblock telemetry event missing");
  if (event.developer?.reason !== "different_surface_after_deliberate_peel") fail("reacquire unblock telemetry reason mismatch");
  if (!event.percept?.differentSurfaceAvailable || event.percept?.clearanceReached) fail("reacquire unblock percept classification mismatch");
  if (event.developer?.fromSurfaceId !== "HOST_CONTACT_CONTINUATION_SCAR_BRACE_01") fail("telemetry from-surface mismatch");
  if (event.developer?.toSurfaceId !== "HOST_CONTACT_CONTINUATION_MEMBRANE_02") fail("telemetry to-surface mismatch");
  if (observer.buildSummary().surfaceReacquireDifferentSurfaceUnblocks !== 1) fail("summary did not count different-surface unblock");
  if (observer.exportSession().session.implementationPass !== "HC-031N2") fail("implementationPass identity mismatch");
}

console.log(`[HC031N2] PASS — same-surface 0.26 clearance preserved, 0.55 s cooldown preserved, deliberate peel can hand reacquire ownership to a different valid Host support, forced-detach behavior unchanged, telemetry v1.36, and ${Object.keys(locked.files).length} neighboring gameplay owners verified unchanged.`);
