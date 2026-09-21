import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031H1] ${message}`); };
const requireText = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };
const forbidText = (source, token, label) => { if (source.includes(token)) fail(`${label} forbidden legacy coupling remains: ${token}`); };

const movement = read("src/player/PlayerMovementController.js");
const tendrils = read("src/player/CoreTendrilSurfaceContactSystem.js");
const support = read("src/player/CoreTendrilSupportPlaneSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const composition = read("src/interaction/VerbCompositionSystem.js");
const stabilizedProjection = read("src/interaction/StabilizedProjectionSystem.js");
const main = read("src/main.js");
const pkg = JSON.parse(read("package.json"));
const contract = JSON.parse(read("public/data/build/hc031h1UnifiedPhysicalContactAuthorityContract.json"));

[
  'this.attachmentAuthority = "none"',
  'const legacyChemistryCanAdhere = Boolean(',
  'const authoredSuctionSupportNow = Boolean(',
  'const authoredSuctionCanAdhere = Boolean(contactAllowed && authoredSuctionSupportRetained)',
  'const canAdhere = authoredSuctionCanAdhere || legacyChemistryCanAdhere',
  '"authored_suction_support"',
  'requiresSiltMembrane: false',
  'legacySiltMembraneAttachmentSupported: true',
  'authoredSuctionSupportCanAttach: true',
  'governingContactLaw: "registered_crawlable_surface_plus_valid_suction_support_is_physical_contact"'
].forEach((token) => requireText(movement, token, "unified movement contact"));
forbidText(movement, 'const canAdhere = !coreWorkActive\n      && !convergenceReachability.active\n      && siltZoneId === "membrane"', "movement universal Silt gate");

[
  'const mechanicalContactEligible = Boolean(this.surfaceTruthActive && sealedCount > 0)',
  'active: mechanicalContactEligible',
  'physicalContactLaw: "authored_surface_plus_world_planted_suction_support"',
  'physicalContactEligible: mechanicalContactEligible'
].forEach((token) => requireText(tendrils, token, "tendril physical contact request"));

[
  'pass: "HC-031H1"',
  'supportActivationLaw: "sealed_world_anchor_plus_authored_surface_truth"',
  'independentOfLegacyAttachmentGate: true',
  'surfaceTruthStillOwnsEligibility: true'
].forEach((token) => requireText(support, token, "support-plane activation"));
forbidText(support, '!locomotion.active || sealed.length === 0', "support-plane circular gate");

[
  'attachmentAuthority:',
  'authoredSuctionSupportActive:',
  'authoredSuctionSupportCount:',
  'authoredSuctionSupportSurfaceId:',
  'tendrilSupportPlaneActive:',
  'stabilizedProjectionSurfaceBraced:'
].forEach((token) => requireText(telemetry, token, "telemetry contact proof"));

// HC031G and HC029C grammar remain untouched reference authorities.
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
requireText(main, 'buildId: "HC-031H1"', "build identity");

if (!contract.contactLaw.authoredSuctionCanEstablishAttachmentWithoutSiltMembrane) fail("authored suction remains chemistry-gated");
if (!contract.contactLaw.legacySiltMembraneAttachmentStillSupported) fail("legacy chemistry attachment was removed rather than retained");
if (contract.contactLaw.nonCrawlableGeometryCanAttach !== false) fail("non-crawlable geometry became attachable");
if (contract.lockedTruth.focusedProjectionRequiresSurfaceAnchor !== false) fail("focused projection became surface-gated");
if (contract.lockedTruth.movementAuthority !== "PlayerMovementController") fail("movement authority changed");

if (pkg.dependencies?.["three-mesh-bvh"] || pkg.dependencies?.["three-ik"] || pkg.dependencies?.rapier) {
  fail("HC031H1 must not add an external locomotion/physics dependency");
}

const locked = JSON.parse(read("public/data/build/hc031h1LockedParentHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  const actual = hash(rel);
  if (actual !== expected) fail(`locked parent owner changed: ${rel}`);
}

// Pure contact-law sanity checks mirroring the bounded authority split.
const canAttach = ({ contactAllowed=true, authored=false, legacyStrength=0, siltZone="none" }) => {
  const legacy = contactAllowed && siltZone === "membrane" && legacyStrength >= 0.45;
  const authoredOk = contactAllowed && authored;
  return { active: authoredOk || legacy, authority: authoredOk ? "authored_suction_support" : legacy ? "legacy_chemistry_membrane" : "none" };
};
const scarWithoutSilt = canAttach({ authored:true, siltZone:"none", legacyStrength:0 });
if (!scarWithoutSilt.active || scarWithoutSilt.authority !== "authored_suction_support") fail("authored scar suction cannot establish physical attachment without Silt");
const legacyMembrane = canAttach({ authored:false, siltZone:"membrane", legacyStrength:0.72 });
if (!legacyMembrane.active || legacyMembrane.authority !== "legacy_chemistry_membrane") fail("legacy membrane attachment no longer works");
const decorative = canAttach({ authored:false, siltZone:"none", legacyStrength:0 });
if (decorative.active) fail("non-authored/decorative contact can attach without legacy chemistry");

console.log(`[HC031H1] PASS — authored suction support and movement attachment share one physical contact law; HC031G verb grammar locked; ${Object.keys(locked.files).length} parent owners locked.`);
