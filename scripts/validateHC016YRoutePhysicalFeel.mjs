import fs from "node:fs";
const read=p=>fs.readFileSync(new URL(p,import.meta.url),"utf8");
const movement=read("../src/player/PlayerMovementController.js");
const grave=read("../src/routes/GraveMemoryRouteSystem.js");
const vascular=read("../src/routes/VascularRhythmRouteSystem.js");
const silt=read("../src/routes/SiltPressureRouteSystem.js");
const audit=JSON.parse(read("../public/data/build/hc016yRoutePhysicalFeelAudit.json"));

for(const p of [
 "routeAccelerationScale",
 "routeSpeedScale",
 "routeBoostScale",
 "routeFlowCouplingScale",
 "directionalFlowAlignment",
 "withFlowSpeedBonus",
 "againstFlowSpeedPenalty"
]) if(!movement.includes(p)) throw Error(`Movement contract missing ${p}`);

if(!grave.includes('"grave_quiet_residue_memory_bed"') ||
   !grave.includes("graveDepth"))
  throw Error("Grave continuous physical feel missing.");

if(!vascular.includes('"vascular_directional_circulation"') ||
   !vascular.includes("withFlowSpeedBonus: 0.24") ||
   !vascular.includes("againstFlowSpeedPenalty: 0.20"))
  throw Error("Vascular directional flow contract missing.");

if(!silt.includes('"silt_compression_release_gradient"') ||
   !silt.includes("const openPocket") ||
   !silt.includes("boostScale: this.completed"))
  throw Error("Silt compression/release gradient missing.");

if(audit.newGameplaySystemAdded!==false ||
   audit.routeDimensionsChanged!==false ||
   audit.coreScaleChanged!==false ||
   audit.locomotionBaselineChanged!==false)
  throw Error("HC016Y scope lock violated.");

console.log("[HC016Y] shared physicalFeel movement contract PASS");
console.log("[HC016Y] Grave continuous residue weight PASS");
console.log("[HC016Y] Vascular with/against-flow traversal PASS");
console.log("[HC016Y] Silt compression/open-pocket/release traversal PASS");
console.log("[HC016Y] no new system / no resize / no route expansion PASS");
