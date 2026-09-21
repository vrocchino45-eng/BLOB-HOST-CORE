import fs from "node:fs";
const generic=fs.readFileSync(new URL("../src/morph/LocalCellBoundaryMorphSystem.js",import.meta.url),"utf8");
const recipes=fs.readFileSync(new URL("../src/morph/LocalCellBoundaryRecipeRegistry.js",import.meta.url),"utf8");
const runtime=fs.readFileSync(new URL("../src/core/GameRuntime.js",import.meta.url),"utf8");
const ledger=fs.readFileSync(new URL("../src/core/RuntimeStateLedgerSystem.js",import.meta.url),"utf8");
const gate=fs.readFileSync(new URL("../src/systems/GateSystem.js",import.meta.url),"utf8");

for(const boundary of [
 "hub_to_grave","grave_to_hub","hub_to_vascular","vascular_to_hub","hub_to_silt","silt_to_hub"
]) if(!recipes.includes(`id: "${boundary}"`)) throw new Error(`Missing boundary recipe ${boundary}`);

for(const proof of [
 "frameState.activeCellId = recipe.destinationCellId",
 "commitHistory(recipe, frameState)",
 "recipe_driven_continuous_anatomical_morph",
 "routeSpecificAdapterCount: 0"
]) if(!generic.includes(proof)) throw new Error(`Missing generic system proof: ${proof}`);

if(!runtime.includes('register("localCellBoundaryMorphSystem"'))
  throw new Error("Generic boundary system not registered.");

for(const oldName of [
 "HubVascularMorphTransitionSystem","VascularHubMorphReturnSystem",
 "HubSiltMorphTransitionSystem","SiltHubMorphReturnSystem",
 "HubGraveMorphTransitionSystem","GraveHubMorphReturnSystem"
]) if(runtime.includes(oldName)) throw new Error(`Old adapter still referenced: ${oldName}`);

if(!ledger.includes('owner: "LocalCellBoundaryMorphSystem"'))
  throw new Error("Ledger does not recognize generic boundary owner.");

for(const gateId of [
 "hub_to_vascular_route","vascular_route_to_hub_chamber",
 "hub_to_silt_burrow_route","silt_burrow_route_to_hub_chamber",
 "hub_to_grave_memory_route","grave_memory_to_hub_chamber"
]) if(!gate.includes(`gate.id === "${gateId}"`)) throw new Error(`Gate observer branch missing: ${gateId}`);

if(!gate.includes('migratedBoundaryOwner: "LocalCellBoundaryMorphSystem"'))
  throw new Error("Gate observer branches do not point to generic owner.");

console.log("[HC016G] six route adapters -> one recipe-driven boundary system PASS");
