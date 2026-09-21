import fs from "node:fs";
const surface=fs.readFileSync(new URL("../src/opening/SurfaceWakeGameplaySystem.js",import.meta.url),"utf8");
const prompt=fs.readFileSync(new URL("../src/guide/GuidePromptSystem.js",import.meta.url),"utf8");
const main=fs.readFileSync(new URL("../src/main.js",import.meta.url),"utf8");
const audit=JSON.parse(fs.readFileSync(new URL("../public/data/build/hc019cReadabilityAudit.json",import.meta.url),"utf8"));
const must=(x,m)=>{if(!x)throw new Error(m)};
must(main.includes('buildId: "HC-019C"'),"build identity stale");
for(const s of ["ambiguous_unread","identified_unsafe","hazard_retracting_under_stabilize","coherent_safe"])
  must(surface.includes(s),`missing visual state ${s}`);
must(surface.includes("visualLanguage"),"material visual-language telemetry missing");
must(prompt.includes("The carried matter is still ambiguous."),"reduced state prompt missing");
must(prompt.includes("The packet has become coherent."),"safe state prompt missing");
must(audit.gameplayChanged===false,"readability pass changed gameplay");
for(const k of ["crossingAuthorityChanged","completionRulesChanged","movementChanged","cameraChanged","chemistryChanged","verbRulesChanged"])
  must(audit[k]===false,`lock violated ${k}`);
console.log("[HC019C] material visual state language PASS");
console.log("[HC019C] reduced instruction dependence PASS");
console.log("[HC019C] gameplay/crossing/completion locks PASS");
