import fs from "node:fs";
const sys = fs.readFileSync(new URL("../src/world/AmbientMaterialInteractionSystem.js", import.meta.url), "utf8");
const runtime = fs.readFileSync(new URL("../src/core/GameRuntime.js", import.meta.url), "utf8");
const audit = JSON.parse(fs.readFileSync(new URL("../public/data/build/hc017cAmbientMaterialAudit.json", import.meta.url), "utf8"));
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
must(sys.includes("this.count = 42"), "bounded mote count missing");
must(sys.includes("distance < 4.25"), "Pulse response does not preserve existing radius");
must(sys.includes("absorbHeld && this.compatible[i]"), "compatible Absorb response missing");
must(sys.includes("stabilizeHeld && distance < 2.25"), "Stabilize ordering missing");
must(sys.includes("progressionAuthority: false"), "non-progression contract missing");
must(runtime.includes('ambientMaterialInteractionSystem'), "runtime integration missing");
must(audit.progressionAuthority === false, "ambient system owns progression");
must(audit.inventoryAuthority === false, "ambient system owns inventory");
for (const k of ["routeTruthChanged","gateTruthChanged","chemistryTruthChanged","coreGrowthChanged","cameraChanged","movementChanged","verbAuthorityChanged"])
  must(audit[k] === false, `scope lock violated: ${k}`);
console.log("[HC017C] bounded ambient field PASS");
console.log("[HC017C] Pulse scatter / Absorb draw / Stabilize order PASS");
console.log("[HC017C] no progression, inventory, route or gate authority PASS");
