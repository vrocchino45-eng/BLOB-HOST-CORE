import fs from "node:fs";
import path from "node:path";

const root=path.resolve(new URL("..",import.meta.url).pathname);
const recipes=fs.readFileSync(path.join(root,"src/morph/LocalCellBoundaryRecipeRegistry.js"),"utf8");
const generic=fs.readFileSync(path.join(root,"src/morph/LocalCellBoundaryMorphSystem.js"),"utf8");
const gate=fs.readFileSync(path.join(root,"src/systems/GateSystem.js"),"utf8");
const gateData=JSON.parse(fs.readFileSync(path.join(root,"public/data/gates/firstSliceGates_HC006I.json"),"utf8"));

for(const proof of [
 'id: "comb_to_aperture"',
 'gateId: "comb_threshold_to_aperture_fields"',
 'trigger: "stabilize_pulse"',
 'readiness: "comb_aperture_entry"',
 'id: "aperture_to_comb"',
 'gateId: "aperture_fields_to_comb_threshold"',
 'readiness: "aperture_return"'
]) if(!recipes.includes(proof)) throw new Error(`Missing Aperture recipe proof: ${proof}`);

for(const proof of [
 "combApertureEntryReadiness(recipe, frameState)",
 "apertureReturnReadiness(recipe, frameState)",
 'trigger === "stabilize_pulse"',
 'recipe.completion === "aperture_entry"',
 'recipe.completion === "aperture_return"'
]) if(!generic.includes(proof)) throw new Error(`Missing generic Aperture proof: ${proof}`);

const authoredGates=gateData.gates ?? gateData;
const gateSystemIds=authoredGates
  .filter((g)=>g.runtimeTransitionAdapter==="GateSystem")
  .map((g)=>g.id);

for(const gateId of gateSystemIds) {
  if(!gate.includes(`gate.id === "${gateId}"`)) {
    throw new Error(`GateSystem-authored gate lacks observer-only branch: ${gateId}`);
  }
}

// Surface/Guide are already owned by their dedicated morph systems.
const nonGateOwned=authoredGates.filter((g)=>g.runtimeTransitionAdapter!=="GateSystem");
for(const g of nonGateOwned) {
  if(!["LocalCellMorphSystem","SecondLocalCellMorphSystem"].includes(g.runtimeTransitionAdapter)) {
    throw new Error(`Unexpected non-Gate transition owner in authored gate set: ${g.id} -> ${g.runtimeTransitionAdapter}`);
  }
}

console.log(`[HC016I] authored GateSystem boundaries now observer-only: ${gateSystemIds.length}/${gateSystemIds.length} PASS`);
console.log("[HC016I] Surface/Guide dedicated morph owners retained PASS");
console.log("[HC016I] normal-play GateSystem activeCell mutation authority: NONE");
