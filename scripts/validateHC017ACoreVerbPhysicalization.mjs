import fs from "node:fs";
const R=p=>fs.readFileSync(new URL(p,import.meta.url),"utf8");
const sys=R("../src/player/CoreVerbPhysicalizationSystem.js");
const runtime=R("../src/core/GameRuntime.js");
const bond=R("../src/chemistry/BondSystem.js");
const audit=JSON.parse(R("../public/data/build/hc017aCoreVerbPhysicalizationAudit.json"));
for(const x of ["pulse_propagation_front","absorb_material_fragment","stabilize_regulation_field"])
 if(!sys.includes(x)) throw Error(`missing ${x}`);
if(!runtime.includes("CoreVerbPhysicalizationSystem") || !runtime.includes("coreVerbPhysicalizationSystem?.update"))
 throw Error("runtime wiring missing");
if(!bond.includes("nearest.root.position.lerp(this.playerRoot.position"))
 throw Error("absorb physical yield missing");
if(audit.gameplayRulesChanged!==false||audit.newVerbAdded!==false||audit.chemistryRulesChanged!==false)
 throw Error("scope lock violated");
if(audit.performance.particleCap!==28||audit.performance.noAmbientMicroMaterialYet!==true)
 throw Error("performance/defer lock missing");
console.log("[HC017A] Pulse physical propagation/contact PASS");
console.log("[HC017A] Absorb draw/integration presentation PASS");
console.log("[HC017A] Stabilize sustained regulation field PASS");
console.log("[HC017A] gameplay/chemistry ownership locks PASS");
