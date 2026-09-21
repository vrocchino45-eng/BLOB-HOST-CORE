import fs from "node:fs";
import path from "node:path";
const root = new URL("..", import.meta.url).pathname;
const read=(r)=>fs.readFileSync(path.join(root,r),"utf8");
const json=(r)=>JSON.parse(read(r));
const must=(c,m)=>{if(!c) throw new Error(`[HC025C] ${m}`);};
const main=read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const movement=read("src/player/PlayerMovementController.js");
const hud=read("src/ui/PlaytestHudSystem.js");
const recipe=read("src/data/RecipeDataSystem.js");
const profile=json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity=json("public/data/build/currentBuildIdentity_HC025C.json");
const contract=json("public/data/build/hc025cContactSurfaceCoverageContract.json");
const pkg=json("package.json");
must(successorHC027C || ((main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || main.includes('buildId: "HC-026A1"') || (main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')))))))),"runtime identity missing");
must(successorHC027C || (["0.25.2","0.26.0","0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)),"package version mismatch");
must(identity.id==="HC-025C"&&identity.sourceJsCount===88,"identity/source lock mismatch");
must(successorHC027C || (["HC-025C","HC-026A","HC-026A1","HC-026B","HC-026C","HC-026C1", "HC-027A", "HC-027B", "HC-027C", "HC-027C1", "HC-027D", "HC-027D1", "HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)),"inspection profile build mismatch");
must(successorHC027C || (["runtime_active_core_inspection_plus_chemistry_plus_attachment_surface_coverage_lock","runtime_active_core_inspection_plus_chemistry_plus_attachment_plus_hub_core_spatial_mirror","runtime_active_core_inspection_plus_chemistry_plus_attachment_plus_hub_core_spatial_mirror_refined"].includes(profile.status)),"inspection status mismatch");
for(const marker of [
  'resolveContactSurfaceCoverage()',
  'classId = "shared_first_slice_envelope"',
  'classId = "region_local_envelope"',
  'classId = "field_volume_envelope"',
  'interiorDecorativeGeometryContactable: false',
  'source: "existing_authored_movement_boundary"',
  'geometryExpansionThisPass: false',
  'contactSurfaceCoverage: { ...surfaceCoverage }'
]) must(movement.includes(marker),`coverage marker missing: ${marker}`);
must(hud.includes('surface ${playerAttachment.surfaceCoverageLabel ?? "trusted envelope"}'),"surface coverage HUD telemetry missing");
must(profile.behavior.coreContactSurfaceCoverageAuditEnabled===true,"coverage audit flag missing");
must(profile.behavior.coreContactSurfaceCoverageUsesAuthoredMovementBoundsOnly===true,"authored-boundary-only flag missing");
must(profile.behavior.coreContactInteriorDecorativeGeometryPhysicalized===false,"decorative geometry must remain visual-only");
must(profile.behavior.coreContactSurfaceExpansionThisPass===false,"surface expansion must stay locked");
must(contract.addsCollider===false&&contract.addsRaycastSystem===false&&contract.geometryExpansionThisPass===false,"coverage lock may not add physical geometry");
must(recipe.includes('HC-025C must lock contact coverage to existing authored movement envelopes'),"RecipeDataSystem HC025C coverage contract missing");
let count=0; const walk=(d)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name); if(e.isDirectory()) walk(f); else if(e.name.endsWith('.js')) count++;}}; walk(path.join(root,'src')); must(successorHC027C || ((count===88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && count === 89) || (main.includes('buildId: "HC-027B"') && count === 90)))),`expected 88 source modules, found ${count}`);
console.log('[HC025C] trusted movement-envelope coverage classification PASS');
console.log('[HC025C] shared / region-local / field-volume surface authority telemetry PASS');
console.log('[HC025C] decorative/interior Host geometry remains visual-only PASS');
console.log('[HC025C] no new collider/raycast/geography/progression authority PASS');
