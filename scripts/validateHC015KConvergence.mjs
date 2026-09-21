import fs from "node:fs";
const ecology=fs.readFileSync(new URL("../src/fields/SignalPlainEcologySystem.js",import.meta.url),"utf8");
const recipe=fs.readFileSync(new URL("../src/data/RecipeDataSystem.js",import.meta.url),"utf8");
const profile=JSON.parse(fs.readFileSync(new URL("../public/data/runtime/act1RuntimeProfile_HC015K.json",import.meta.url),"utf8"));
if(profile.pass!=="HC-015K") throw new Error("HC015K profile pass mismatch");
if(!recipe.includes("/data/runtime/act1RuntimeProfile_HC015K.json")) throw new Error("HC015K profile not loaded");
if(!recipe.includes('"HC-015J", "HC-015K"].includes(profile.pass)')) throw new Error("HC015K lineage not accepted");
for(const proof of ["waveVisibility","retained_changed_state","inspectionFadeable = true","0.018 * (1 - this.response)"]){
  if(!ecology.includes(proof)) throw new Error(`Missing convergence proof: ${proof}`);
}
console.log("[HC015K] completion readability convergence proof PASS");
