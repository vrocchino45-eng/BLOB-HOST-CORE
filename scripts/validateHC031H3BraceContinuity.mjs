import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const root=process.cwd();
const read=(rel)=>fs.readFileSync(path.join(root,rel),"utf8");
const hash=(rel)=>crypto.createHash("sha256").update(fs.readFileSync(path.join(root,rel))).digest("hex");
const fail=(m)=>{throw new Error(`[HC031H3] ${m}`)};
const need=(s,t,l)=>{if(!s.includes(t)) fail(`${l} missing: ${t}`)};
const forbid=(s,t,l)=>{if(s.includes(t)) fail(`${l} forbidden: ${t}`)};
const projection=read("src/interaction/StabilizedProjectionSystem.js");
const movement=read("src/player/PlayerMovementController.js");
const support=read("src/player/CoreTendrilSupportPlaneSystem.js");
const telemetry=read("src/core/SessionTelemetrySystem.js");
const composition=read("src/interaction/VerbCompositionSystem.js");
const main=read("src/main.js");
const contract=JSON.parse(read("public/data/build/hc031h3BraceContinuityContract.json"));
[
  'attachment.authority === "authored_suction_support"',
  'attachment.authoredSuctionSupportActive',
  'attachment.authoredSuctionSupportSurfaceId',
  'attachment.authoredSuctionSupportCount',
  '"authored_suction_attachment_continuity"',
  'contactIntegrationPass: "HC-031H3"',
  'authoredAttachmentContinuityBraceActive:',
  'requiresSurfaceAnchor: false'
].forEach(t=>need(projection,t,"projection continuity"));
forbid(projection,'this.continuityGrace','projection-owned continuity timer');
[
  'this.authoredSuctionSupportGrace = 0.22',
  'authoredSuctionSupportSurfaceId: this.authoredSuctionSupportSurfaceId',
  'authoredSuctionSupportCount: this.authoredSuctionSupportCount',
  'governingContactLaw: "surface_truth_authorizes_seal_anchor_carries_identity_and_support_plane_drives_physical_contact"'
].forEach(t=>need(movement,t,"movement-owned grace"));
[
  'source: "sealed_anchor_carried_surface_identity"',
  'currentSurfaceTruthRequiredAfterSeal: false'
].forEach(t=>need(support,t,"support plane lock"));
[
  'stabilizedProjectionLiveAnchorBraceActive:',
  'stabilizedProjectionAttachmentContinuityBraceActive:',
  'stabilizedProjectionContinuityStrength01:',
  'stabilizedProjectionExternalBraceSource:'
].forEach(t=>need(telemetry,t,"telemetry proof"));
[
  'cohere_project:',
  'meaning: "controlled_directional_push"',
  'pulseStabilize: "cohere_then_project_as_controlled_push"'
].forEach(t=>need(composition,t,"HC029C grammar"));
need(main,'buildId: "HC-031H3"',"build identity");
if(contract.continuityLaw.addsNewGraceTimer!==false) fail("H3 added a second grace timer");
if(contract.continuityLaw.movementOwnsGraceTimer!==true) fail("movement no longer owns grace");
if(contract.lockedTruth.focusedProjectionRequiresSurfaceAnchor!==false) fail("focused projection became surface gated");
if(contract.lockedTruth.freeSpaceSelfBracePreserved!==true) fail("free-space self brace not locked");
if(contract.lockedTruth.locomotionTuningChanged!==false) fail("locomotion tuning changed in H3 contract");
const locked=JSON.parse(read("public/data/build/hc031h3LockedParentHashes.json"));
for(const [rel,expected] of Object.entries(locked.files)){if(hash(rel)!==expected) fail(`locked parent owner changed: ${rel}`)}
console.log(`[HC031H3] PASS — Stabilized Projection honors movement-owned authored-suction continuity without changing locomotion; ${Object.keys(locked.files).length} parent owners locked.`);
