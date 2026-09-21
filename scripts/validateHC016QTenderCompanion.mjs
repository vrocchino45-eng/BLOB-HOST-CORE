import fs from "node:fs";
const entity=fs.readFileSync(new URL("../src/ecology/EntitySystem.js",import.meta.url),"utf8");
const runtime=fs.readFileSync(new URL("../src/core/GameRuntime.js",import.meta.url),"utf8");
const recipes=JSON.parse(fs.readFileSync(new URL("../public/data/ecology/entityRecipes.json",import.meta.url),"utf8"));

for(const proof of [
  "evaluateTenderBond(frameState, inNursery)",
  "updateTenderCompanion(entity, dt, frameState, distance)",
  "updateTenderCare(frameState, dt, inNursery)",
  'role: "care_repair_companion"',
  'navigationAuthority: false',
  'routeGuidanceAuthority: "GuideOrbiter"'
]) if(!entity.includes(proof)) throw new Error(`Tender companion proof missing: ${proof}`);

if(!runtime.includes('register("entitySystem", this.entitySystem);'))
  throw new Error("EntitySystem is not globally registered for conditional bonded follow.");

if(runtime.includes('register("entitySystem", this.entitySystem, regionScoped);'))
  throw new Error("Old active-region EntitySystem registration still present.");

const list=recipes.recipes ?? recipes;
const tender=list.find((item)=>item.id==="nursery_membrane_tender_001");
if(!tender?.interaction?.companionBond) throw new Error("Tender companion contract missing from recipe.");
if(tender.interaction.companionBond.navigationAuthority !== false)
  throw new Error("Tender incorrectly granted navigation authority.");

console.log("[HC016Q] Nursery Membrane Tender identified + care companion role PASS");
console.log("[HC016Q] Guide navigation authority remains separate PASS");
