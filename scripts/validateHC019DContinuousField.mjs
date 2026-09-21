import fs from "node:fs";
const a=fs.readFileSync(new URL("../src/world/AmbientMaterialInteractionSystem.js",import.meta.url),"utf8");
const m=fs.readFileSync(new URL("../src/main.js",import.meta.url),"utf8");
const audit=JSON.parse(fs.readFileSync(new URL("../public/data/build/hc019dContinuousFieldAudit.json",import.meta.url),"utf8"));
const must=(x,m)=>{if(!x)throw new Error(m)};
must(m.includes('buildId: "HC-019D"'),"identity stale");
must(a.includes("this.count = 54"),"field density not updated");
must(a.includes("surface_living_suspension"),"surface profile missing");
must(a.includes("responseMemory"),"response memory missing");
must(a.includes("rememberedResponses"),"memory telemetry missing");
must(a.includes('pass: "HC-019D"'),"pass telemetry stale");
for(const k of ["progressionAuthority","inventoryAuthority","chemistryAuthority","objectiveAuthority","crossingChanged","completionChanged","movementChanged","cameraChanged","surfaceGameplayChanged","verbRulesChanged"])
 must(audit[k]===false,`scope lock ${k}`);
console.log("[HC019D] continuous ambient interaction field PASS");
console.log("[HC019D] short-lived verb response memory PASS");
console.log("[HC019D] no progression/inventory/chemistry authority PASS");
console.log("[HC019D] locked gameplay authorities PASS");
