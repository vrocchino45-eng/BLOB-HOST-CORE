import fs from "node:fs";
const s=fs.readFileSync(new URL("../src/world/AmbientMaterialInteractionSystem.js", import.meta.url),"utf8");
const a=JSON.parse(fs.readFileSync(new URL("../public/data/build/hc017eEnvironmentalDensityAudit.json", import.meta.url),"utf8"));
const must=(x,m)=>{if(!x)throw new Error(m)};
must(s.includes("this.count = 42"),"ambient count changed");
must(s.includes("resolveInteractionAnchor"),"interaction anchor reader missing");
must(s.includes("distance < 0.78"),"Core proximity wake missing");
must(s.includes("i % 6 === 0"),"sparse interaction clustering missing");
must(!s.includes("new THREE.Vector3(\n            -this.temp2.z"),"per-loop tangent allocation remains");
must(s.includes('pass: "HC-017E"'),"HC017E telemetry missing");
for(const k of ["progressionAuthority","targetingAuthority","inventoryAuthority","routeTruthChanged","gateTruthChanged","chemistryTruthChanged","verbRulesChanged","movementControllerChanged","cameraChanged"])
  must(a[k]===false,`scope lock violated: ${k}`);
must(a.nextRequiredStep==="full_playthrough_analysis","playthrough checkpoint missing");
console.log("[HC017E] bounded traversal wake PASS");
console.log("[HC017E] sparse world-space interaction signposting PASS");
console.log("[HC017E] progression/targeting/routes/gates/chemistry LOCKED");
console.log("[HC017E] full-playthrough checkpoint armed");
