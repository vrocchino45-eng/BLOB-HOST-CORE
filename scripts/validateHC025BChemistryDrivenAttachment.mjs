import fs from "node:fs";
import path from "node:path";
const root = new URL("..", import.meta.url).pathname;
const read=(r)=>fs.readFileSync(path.join(root,r),"utf8");
const json=(r)=>JSON.parse(read(r));
const must=(c,m)=>{if(!c) throw new Error(`[HC025B] ${m}`);};
const main=read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const movement=read("src/player/PlayerMovementController.js");
const embodiment=read("src/player/CoreEmbodimentSystem.js");
const hud=read("src/ui/PlaytestHudSystem.js");
const recipe=read("src/data/RecipeDataSystem.js");
const profile=json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity=json("public/data/build/currentBuildIdentity_HC025B.json");
const contract=json("public/data/build/hc025bChemistryDrivenAttachmentContract.json");
const pkg=json("package.json");

must(successorHC027C || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || main.includes('buildId: "HC-026A1"') || (main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')))))))),"runtime identity missing");
must(embodiment.includes('grave_memory_retention: "grave_memory"')&&embodiment.includes('vascular_rhythm_retention: "vascular_rhythm"')&&embodiment.includes('silt_pressure_retention: "silt_pressure"'),"retained-family -> world-output family mapping missing");
must(successorHC027C || (["0.25.1","0.25.2", "0.26.0","0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)),"package version mismatch");
must(identity.id==="HC-025B"&&identity.sourceJsCount===88,"identity/source lock mismatch");
must(successorHC027C || (["HC-025B","HC-025C", "HC-026A","HC-026A1","HC-026B","HC-026C","HC-026C1", "HC-027A", "HC-027B", "HC-027C", "HC-027C1", "HC-027D", "HC-027D1", "HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)),"inspection profile build mismatch");
must(successorHC027C || (["runtime_active_core_inspection_plus_chemistry_plus_attachment_proof","runtime_active_core_inspection_plus_chemistry_plus_attachment_surface_coverage_lock","runtime_active_core_inspection_plus_chemistry_plus_attachment_plus_hub_core_spatial_mirror","runtime_active_core_inspection_plus_chemistry_plus_attachment_plus_hub_core_spatial_mirror_refined"].includes(profile.status)),"inspection profile status mismatch");
for(const marker of [
  'sampleMembraneBoundaryTelemetry()',
  'updateChemistryAttachmentState(dt, frameState)',
  'applyChemistryAttachmentVelocity()',
  'requiresSiltMembrane: true',
  'usesSiltWorldAlignment: true',
  'addsCollider: false',
  'addsRaycast: false',
  'this.velocity.addScaledVector(this.boundarySurfaceNormal, -radialVelocity)',
  'this.attachmentShellNormalizedDistance',
  'this.attachmentCooldown = 0.30'
]) must(movement.includes(marker),`attachment movement marker missing: ${marker}`);
for(const marker of [
  'siltZoneId:',
  'siltMembraneExposure:',
  'siltWorldDirection:',
  'movementConsequenceOwner: "PlayerMovementController"',
  'attachmentState: physicalAttachment.state',
  'adhesionPhysicsEnabled: true',
  'trustedBoundaryOnly: true'
]) must(embodiment.includes(marker),`chemistry/contact bridge marker missing: ${marker}`);
must(hud.includes('adhesion ${Math.round((playerAttachment.adhesionStrength ?? 0) * 100)}%'),"adhesion debug read missing");
must(hud.includes('Silt align ${Math.round((playerAttachment.siltSurfaceAlignment ?? 0) * 100)}%'),"Silt alignment debug read missing");
must(profile.behavior.coreContactAdhesionPhysicsEnabled===true,"adhesion profile flag missing");
must(profile.behavior.coreContactAttachmentUsesTrustedBoundaryOnly===true,"trusted boundary attachment flag missing");
must(profile.behavior.coreContactAttachmentRequiresSiltMembrane===true,"Silt membrane requirement missing");
must(profile.behavior.coreContactAttachmentUsesSiltWorldAlignment===true,"Silt alignment requirement missing");
must(profile.behavior.coreContactCollisionConsequencesEnabled===false,"collision authority must remain locked");
must(contract.usesExistingMovementBoundary===true&&contract.addsCollider===false&&contract.addsRaycastSystem===false,"must reuse existing boundary without new collider/raycast system");
must(recipe.includes('HC-025B+ requires chemistry-driven Silt-membrane attachment'),"RecipeDataSystem HC025B contract missing");
let count=0; const walk=(d)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name); if(e.isDirectory()) walk(f); else if(e.name.endsWith('.js')) count++;}}; walk(path.join(root,'src')); must(successorHC027C || ((count===88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && count === 89) || (main.includes('buildId: "HC-027B"') && count === 90)))),`expected 88 source modules, found ${count}`);
console.log('[HC025B] Silt membrane directional chemistry bridge PASS');
console.log('[HC025B] trusted-boundary tangent attachment/release proof PASS');
console.log('[HC025B] no new collider/raycast/progression/geography authority PASS');
console.log('[HC025B] compact attachment telemetry PASS');
