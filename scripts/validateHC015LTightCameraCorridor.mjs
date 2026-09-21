import fs from "node:fs";
const occ=fs.readFileSync(new URL("../src/camera/InspectionOcclusionSystem.js",import.meta.url),"utf8");
const sig=fs.readFileSync(new URL("../src/fields/SignalPlainEcologySystem.js",import.meta.url),"utf8");
const recipe=fs.readFileSync(new URL("../src/data/RecipeDataSystem.js",import.meta.url),"utf8");
const profile=JSON.parse(fs.readFileSync(new URL("../public/data/runtime/act1RuntimeProfile_HC015L.json",import.meta.url),"utf8"));
for(const proof of [
  "dual_target_multi_ray_protected_corridor",
  "nearCameraFadeRadius",
  "corridorRadius",
  "const offsets = [",
  "Math.max(0.008"
]) if(!occ.includes(proof)) throw new Error(`Missing HC015L occlusion proof: ${proof}`);
if(!sig.includes("corridorRadius: 0.68") || !sig.includes("nearCameraFadeRadius: 2.25"))
  throw new Error("Signal Plain does not request HC015L corridor tuning.");
if(profile.pass!=="HC-015L") throw new Error("HC015L runtime profile mismatch.");
if(!recipe.includes("/data/runtime/act1RuntimeProfile_HC015L.json")) throw new Error("HC015L profile is not loaded.");
if(!recipe.includes('"HC-015J", "HC-015K", "HC-015L"].includes(profile.pass)'))
  throw new Error("HC015L profile lineage rejected.");
console.log("[HC015L] Tight Camera protected sight corridor proof PASS");
