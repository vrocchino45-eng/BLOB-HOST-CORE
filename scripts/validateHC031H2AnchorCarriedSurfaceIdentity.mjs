import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const root=process.cwd();
const read=(rel)=>fs.readFileSync(path.join(root,rel),"utf8");
const hash=(rel)=>crypto.createHash("sha256").update(fs.readFileSync(path.join(root,rel))).digest("hex");
const fail=(m)=>{throw new Error(`[HC031H2] ${m}`)};
const need=(s,t,l)=>{if(!s.includes(t)) fail(`${l} missing: ${t}`)};
const forbid=(s,t,l)=>{if(s.includes(t)) fail(`${l} forbidden: ${t}`)};
const tendrils=read("src/player/CoreTendrilSurfaceContactSystem.js");
const support=read("src/player/CoreTendrilSupportPlaneSystem.js");
const movement=read("src/player/PlayerMovementController.js");
const projection=read("src/interaction/StabilizedProjectionSystem.js");
const telemetry=read("src/core/SessionTelemetrySystem.js");
const composition=read("src/interaction/VerbCompositionSystem.js");
const main=read("src/main.js");
const pkg=JSON.parse(read("package.json"));
const contract=JSON.parse(read("public/data/build/hc031h2AnchorCarriedSurfaceIdentityContract.json"));
[
  "anchorSurface: this.createSurfaceRelation()",
  "surface: this.serializeSurfaceRelation(tendril.anchorSurface)",
  "anchorCarriesAuthoredSurfaceIdentity: true",
  "currentSurfaceTruthRequiredAfterSeal: false",
  "surface_truth_authorizes_seal_then_anchor_carries_surface_identity_until_peel_release"
].forEach(t=>need(tendrils,t,"tendril carried identity"));
[
  'source: "sealed_anchor_carried_surface_identity"',
  'carriedSurfaceIdentity: true',
  'supportActivationLaw: "sealed_world_anchor_with_carried_authored_surface_identity"',
  'currentSurfaceTruthRequiredAfterSeal: false'
].forEach(t=>need(support,t,"support plane"));
forbid(support,"!surfaceTruth.valid","support same-frame SurfaceTruth gate");
[
  "plane.carriedSurfaceIdentity === true",
  'this.tendrilSupportSurfaceId !== "none"',
  'governingContactLaw: "surface_truth_authorizes_seal_anchor_carries_identity_and_support_plane_drives_physical_contact"'
].forEach(t=>need(movement,t,"movement carried support"));
forbid(movement,"const surfaceMatches = (plane.surfaceId","movement same-frame surface match");
[
  "support.carriedSurfaceIdentity === true",
  '"anchor_carried_surface_identity"',
  'contactIntegrationPass: "HC-031H2"',
  "requiresSurfaceAnchor: false"
].forEach(t=>need(projection,t,"stabilized projection integration"));
[
  "anchorCarriedSurfaceIdentityActive:",
  "supportPlaneSource:",
  "stabilizedProjectionExternalBraceSource:",
  "stabilizedProjectionSurfaceId:"
].forEach(t=>need(telemetry,t,"telemetry proof"));
[
  'cohere_project:',
  'meaning: "controlled_directional_push"',
  'pulseStabilize: "cohere_then_project_as_controlled_push"'
].forEach(t=>need(composition,t,"HC029C grammar"));
need(main,'buildId: "HC-031H2"',"build identity");
if(!contract.contactLaw.surfaceTruthAuthorizesAtSeal) fail("seal authorization law missing");
if(!contract.contactLaw.anchorCarriesSurfaceIdentityUntilPeelRelease) fail("anchor retention law missing");
if(contract.contactLaw.currentSurfaceTruthRequiredAfterSeal!==false) fail("same-frame SurfaceTruth still required after seal");
if(contract.lockedTruth.focusedProjectionRequiresSurfaceAnchor!==false) fail("focused projection became surface gated");
if(contract.lockedTruth.movementAuthority!=="PlayerMovementController") fail("movement authority changed");
if(pkg.dependencies?.["three-mesh-bvh"]||pkg.dependencies?.["three-ik"]||pkg.dependencies?.rapier) fail("unexpected external locomotion/physics dependency");
const locked=JSON.parse(read("public/data/build/hc031h2LockedParentHashes.json"));
for(const [rel,expected] of Object.entries(locked.files)){if(hash(rel)!==expected) fail(`locked parent owner changed: ${rel}`)}
console.log(`[HC031H2] PASS — anchors retain authored surface identity through support/movement/projection handoff; ${Object.keys(locked.files).length} parent owners locked.`);
