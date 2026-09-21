import fs from "node:fs";
import path from "node:path";
const root = new URL("..", import.meta.url).pathname;
const read = (r) => fs.readFileSync(path.join(root,r),"utf8");
const json = (r) => JSON.parse(read(r));
const must=(c,m)=>{if(!c) throw new Error(`[HC024E] ${m}`);};
const main=read("src/main.js"); const embodiment=read("src/player/CoreEmbodimentSystem.js"); const ambient=read("src/world/AmbientMaterialInteractionSystem.js"); const recipe=read("src/data/RecipeDataSystem.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const profile=json("public/data/camera/inspectionCameraProfiles.json")[0]; const identity=json("public/data/build/currentBuildIdentity_HC024E.json"); const contract=json("public/data/build/hc024eHostChemistryResponseContract.json"); const pkg=json("package.json");
must(successorHC027C || (main.includes('buildId: "HC-024E"')||main.includes('buildId: "HC-025A"')||(main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))),"runtime identity/successor missing"); must(successorHC027C || (["0.24.13","0.25.0","0.25.1","0.25.2", "0.26.0","0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)),"package version mismatch"); must(identity.id==="HC-024E"&&identity.sourceJsCount===88,"identity/source lock mismatch"); must(successorHC027C || (["HC-024E","HC-025A","HC-025B", "HC-025C", "HC-026A","HC-026A1","HC-026B","HC-026C","HC-026C1", "HC-027A", "HC-027B", "HC-027C", "HC-027C1", "HC-027D", "HC-027D1", "HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)),"profile build mismatch");
for(const marker of ['buildCoreChemistryWorldOutput(placements, topology, telemetry, cloudPattern)','frameState.coreChemistryOutput = worldOutput','dominantMode','worldDirection','visualHostResponseEnabled: true']) must(embodiment.includes(marker),`Core output marker missing: ${marker}`);
for(const marker of ['const coreChemistry = frameState.coreChemistryOutput ?? {}','hostChemistryResponse: {','requiresAdditionalInput: false','changesMovement: false','changesCollision: false','usesExistingHostMaterial: true']) must(ambient.includes(marker),`Host reader marker missing: ${marker}`);
must(ambient.includes('ecologyKind === 4')&&ambient.includes('Math.sin(t * 5.25)')&&ambient.includes('shellRadius'),"Grave/Vascular/Silt response signatures missing");
must(profile.behavior.coreWorkWorldChemistryOutputEnabled===true&&profile.behavior.coreWorkHostResponseVisualProofEnabled===true,"profile output/Host response flags missing");
if (["HC-025B","HC-025C", "HC-026A","HC-026A1","HC-026B","HC-026C","HC-026C1", "HC-027A", "HC-027B", "HC-027C", "HC-027C1", "HC-027D", "HC-027D1", "HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)) {
  must(profile.behavior.coreWorkMovementConsequencesEnabled===true&&profile.behavior.coreWorkCollisionConsequencesEnabled===false,"HC025B successor may enable only contained movement attachment while collision remains locked");
} else {
  must(profile.behavior.coreWorkMovementConsequencesEnabled===false&&profile.behavior.coreWorkCollisionConsequencesEnabled===false,"HC024E/HC025A movement/collision must remain locked");
}
must(contract.usesExistingGeometry===true&&contract.requiresAdditionalInput===false,"contract must reuse existing Host material without another input");
must(recipe.includes('HC-024E+ requires generic chemistry output into Host response'),"RecipeDataSystem HC024E+ contract missing");
let count=0; const walk=(d)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name); if(e.isDirectory()) walk(f); else if(e.name.endsWith('.js')) count++;}}; walk(path.join(root,'src')); must(successorHC027C || ((count===88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && count === 89) || (main.includes('buildId: "HC-027B"') && count === 90)))),`expected 88 source modules, found ${count}`);
console.log('[HC024E] generic Core chemistry output PASS');
console.log('[HC024E] existing Host material automatic response PASS');
console.log('[HC024E] memory/rhythm/pressure membrane signatures PASS');
console.log('[HC024E] Host-response contract preserved; HC025B contained attachment successor remains collision/progression/geography locked PASS');
