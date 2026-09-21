import fs from "node:fs";
const recipes=fs.readFileSync(new URL("../src/morph/LocalCellBoundaryRecipeRegistry.js",import.meta.url),"utf8");
const generic=fs.readFileSync(new URL("../src/morph/LocalCellBoundaryMorphSystem.js",import.meta.url),"utf8");
const gate=fs.readFileSync(new URL("../src/systems/GateSystem.js",import.meta.url),"utf8");

for(const proof of [
  'id: "hub_to_comb"',
  'gateId: "hub_to_comb_threshold"',
  'readiness: "hub_comb_entry"',
  'id: "comb_to_hub"',
  'gateId: "comb_threshold_to_hub_chamber"',
  'readiness: "comb_return"'
]) if(!recipes.includes(proof)) throw new Error(`Missing Comb recipe proof: ${proof}`);

for(const proof of [
  "hubCombEntryReadiness(recipe, frameState)",
  "combReturnReadiness(recipe, frameState)",
  'recipe.completion === "comb_entry"',
  'recipe.completion === "comb_return"'
]) if(!generic.includes(proof)) throw new Error(`Missing generic Comb proof: ${proof}`);

for(const gateId of ["hub_to_comb_threshold","comb_threshold_to_hub_chamber"])
  if(!gate.includes(`gate.id === "${gateId}"`)) throw new Error(`Gate observer branch missing: ${gateId}`);

console.log("[HC016H] Hub <-> Comb generic boundary migration PASS");
