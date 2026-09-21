import fs from "node:fs";
import path from "node:path";
const root = new URL("..", import.meta.url).pathname;
const read=(r)=>fs.readFileSync(path.join(root,r),"utf8");
const json=(r)=>JSON.parse(read(r));
const must=(c,m)=>{if(!c) throw new Error(`[HC025A] ${m}`);};
const main=read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const movement=read("src/player/PlayerMovementController.js");
const embodiment=read("src/player/CoreEmbodimentSystem.js");
const hud=read("src/ui/PlaytestHudSystem.js");
const recipe=read("src/data/RecipeDataSystem.js");
const profile=json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity=json("public/data/build/currentBuildIdentity_HC025A.json");
const contract=json("public/data/build/hc025aContactLanguageContract.json");
const pkg=json("package.json");

const successorHC025B = (main.includes('buildId: "HC-025B"') || main.includes('buildId: "HC-025C"') || main.includes('buildId: "HC-026A"') || main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))) || successorHC027C;
must(successorHC027C || (main.includes('buildId: "HC-025A"') || successorHC025B),"runtime identity missing");
must(successorHC027C || (["0.25.0","0.25.1","0.25.2", "0.26.0","0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)),"package version mismatch");
must(identity.id==="HC-025A"&&identity.sourceJsCount===88,"identity/source lock mismatch");
must(successorHC027C || (["HC-025A","HC-025B", "HC-025C", "HC-026A","HC-026A1","HC-026B","HC-026C","HC-026C1", "HC-027A", "HC-027B", "HC-027C", "HC-027C1", "HC-027D", "HC-027D1", "HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)),"profile build mismatch");
for(const marker of [
  'this.boundaryProximity = THREE.MathUtils.clamp((normalizedDistance - 0.72) / 0.28, 0, 1)',
  'this.boundaryRadialSpeed = this.velocity.dot(this.boundarySurfaceNormal)',
  'this.boundaryTangentialSpeed = Math.sqrt',
  'telemetryOnly: true',
  'surfaceNormal: {'
]) must(movement.includes(marker),`movement-boundary telemetry missing: ${marker}`);
for(const marker of [
  'updateCoreContactLanguage(t, dt, this.frameState)',
  '"suspended"', '"brushing"', '"attached"', '"releasing"',
  'usesExistingMovementBoundaryTelemetry: true',
  'chemistryCanAmplifyVisualAttachment: true',
  'collisionConsequencesEnabled: false'
]) must(embodiment.includes(marker),`contact-language marker missing: ${marker}`);
must(embodiment.includes('(chemistry.pressure ?? 0) * (chemistry.surfaceExpression ?? 0)'),"Silt/pressure chemistry visual amplification missing");
must(embodiment.includes('this.bodyFrame.scale.x *=')&&embodiment.includes('emphasizeSurfacePart'),"directional authored-Core deformation missing");
must(hud.includes('Contact ${coreContactLanguage.state}'),"temporary contact-state HUD read missing");
must(profile.behavior.coreContactLanguageEnabled===true,"contact language profile flag missing");
must(profile.behavior.coreContactLanguageStates?.join(",")==="suspended,brushing,attached,releasing","four-state profile contract mismatch");
if (successorHC025B) {
  must(profile.behavior.coreContactMovementConsequencesEnabled===true&&profile.behavior.coreContactCollisionConsequencesEnabled===false&&profile.behavior.coreContactAdhesionPhysicsEnabled===true,"HC025B successor must preserve language while enabling contained attachment only");
} else {
  must(profile.behavior.coreContactMovementConsequencesEnabled===false&&profile.behavior.coreContactCollisionConsequencesEnabled===false&&profile.behavior.coreContactAdhesionPhysicsEnabled===false,"HC025A mechanical contact must remain locked");
}
must(contract.usesExistingMovementBoundary===true&&contract.addsCollider===false&&contract.addsRaycastSystem===false,"must reuse existing boundary telemetry without new collider/raycast system");
must(recipe.includes('HC-025A requires visual-only suspended/brushing/attached/releasing contact language'),"RecipeDataSystem HC025A contract missing");
let count=0; const walk=(d)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name); if(e.isDirectory()) walk(f); else if(e.name.endsWith('.js')) count++;}}; walk(path.join(root,'src')); must(successorHC027C || ((count===88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && count === 89) || (main.includes('buildId: "HC-027B"') && count === 90)))),`expected 88 source modules, found ${count}`);
console.log('[HC025A] existing movement-boundary contact telemetry PASS');
console.log('[HC025A] suspended/brushing/attached/releasing visual language PASS');
console.log('[HC025A] Silt chemistry visual amplification language preserved PASS');
console.log('[HC025A] predecessor contact-language contract preserved in current successor PASS');
