import fs from "node:fs";

const recipe=JSON.parse(fs.readFileSync(
  new URL("../public/data/routes/siltPressureRouteCircuit_HC012A.json",import.meta.url),"utf8"));
const contract=JSON.parse(fs.readFileSync(
  new URL("../public/data/routes/act1RouteContracts_HC012A.json",import.meta.url),"utf8"));
const system=fs.readFileSync(
  new URL("../src/routes/SiltPressureRouteSystem.js",import.meta.url),"utf8");

const points=recipe.anatomy.pathPoints;
let length=0;
for(let i=1;i<points.length;i++){
  const a=points[i-1], b=points[i];
  length += Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
}

if(recipe.spatialExpansion?.pass!=="HC-016V") throw new Error("Missing HC016V spatial contract.");
if(recipe.spatialExpansion.coreScaleChanged!==false) throw new Error("Core scale lock violated.");
if(recipe.spatialExpansion.gameplayRulesChanged!==false) throw new Error("Gameplay rules changed.");
if(length < 20) throw new Error(`Expanded Silt path too short: ${length}`);
if(recipe.appetite.safeOffset[0] < 1.5) throw new Error("Porous-choice pocket was not widened.");
if(Math.abs(recipe.appetite.denseOffsets[0][0]) < 1.5) throw new Error("Dense choice spacing was not widened.");
if(recipe.completion.pressureReadRequired!==true ||
   recipe.completion.ribsReleasedRequired!==true ||
   recipe.completion.selectiveAbsorbRequired!==true ||
   recipe.completion.packedResidueMustRemain!==true)
  throw new Error("Silt completion contract changed.");
if(recipe.constraints.newAbilities!==0 ||
   recipe.constraints.newEntities!==0 ||
   recipe.constraints.combat!==false ||
   recipe.constraints.directActiveCellMutation!==false)
  throw new Error("Forbidden gameplay scope activated.");

const silt=contract.routes.find(r=>r.id==="silt_burrow_route");
if(!silt) throw new Error("Silt route contract missing.");
if(silt.movementBounds.radii[2] < 20) throw new Error("Silt movement depth not expanded.");
if(silt.movementBounds.radii[0] < 6) throw new Error("Silt decision-pocket lateral movement not expanded.");

if(!system.includes("156") || !system.includes("new THREE.IcosahedronGeometry(0.62, 1)"))
  throw new Error("Expanded Silt presentation tuning missing.");

console.log(`[HC016V] expanded Silt path ${length.toFixed(2)} units PASS`);
console.log("[HC016V] wider appetite decision pocket PASS");
console.log("[HC016V] movement envelope + gameplay-rule locks PASS");
