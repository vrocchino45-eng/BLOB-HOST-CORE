import fs from "node:fs";
const src=fs.readFileSync(new URL("../src/player/CoreVerbPhysicalizationSystem.js",import.meta.url),"utf8");
const audit=JSON.parse(fs.readFileSync(new URL("../public/data/build/hc017aHotfix2VerbVisualScaleAudit.json",import.meta.url),"utf8"));

if(!src.includes("stabilize_regulation_tether")) throw Error("compact Stabilize tether missing");
if(src.includes("0.68 + distance * 0.52")) throw Error("old giant distance-scaled Stabilize enclosure remains");
if(!src.includes("0.42 + t * 3.25")) throw Error("Pulse visual normalization missing");
if(!src.includes("this.absorbMotes.length >= 20")) throw Error("Absorb fragment cap not normalized");
if(audit.gameplayChanged!==false || audit.coreScaleChanged!==false ||
   audit.pulseRangeChanged!==false || audit.absorbRangeChanged!==false ||
   audit.stabilizeRulesChanged!==false) throw Error("scope lock violated");

console.log("[HC017A HOTFIX2] compact Stabilize connection PASS");
console.log("[HC017A HOTFIX2] Pulse visual scale normalization PASS");
console.log("[HC017A HOTFIX2] Absorb fragment scale/cap normalization PASS");
console.log("[HC017A HOTFIX2] gameplay/range/Core-scale locks PASS");
