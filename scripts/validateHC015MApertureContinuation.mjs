import fs from "node:fs";
const aperture=fs.readFileSync(new URL("../src/fields/ApertureFieldsArrivalSystem.js",import.meta.url),"utf8");
const hud=fs.readFileSync(new URL("../src/ui/PlaytestHudSystem.js",import.meta.url),"utf8");
const recipe=fs.readFileSync(new URL("../src/data/RecipeDataSystem.js",import.meta.url),"utf8");
const profile=JSON.parse(fs.readFileSync(new URL("../public/data/runtime/act1RuntimeProfile_HC015M.json",import.meta.url),"utf8"));

for(const proof of [
  "signalPlainCompleted",
  "continuationBlend",
  "membrane_ridge_arc",
  "signal_plain_opened_deeper_field_ellipsoid",
  "deeperFieldOpened: signalPlainCompleted",
  "move_deeper_toward_membrane_ridge"
]) if(!aperture.includes(proof)) throw new Error(`Missing HC015M continuation proof: ${proof}`);

if(!hud.includes("field changed / Membrane Ridge horizon open"))
  throw new Error("HC015M HUD continuation state missing.");
if(profile.pass!=="HC-015M") throw new Error("HC015M runtime profile mismatch.");
if(!recipe.includes("/data/runtime/act1RuntimeProfile_HC015M.json"))
  throw new Error("HC015M profile is not loaded.");
if(!recipe.includes('"HC-015J", "HC-015K", "HC-015L", "HC-015M"].includes(profile.pass)'))
  throw new Error("HC015M runtime lineage rejected.");

console.log("[HC015M] Aperture continuation / Membrane Ridge horizon proof PASS");
