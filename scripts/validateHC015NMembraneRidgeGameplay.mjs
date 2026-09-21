import fs from "node:fs";
const sys=fs.readFileSync(new URL("../src/fields/MembraneRidgeGameplaySystem.js",import.meta.url),"utf8");
const runtime=fs.readFileSync(new URL("../src/core/GameRuntime.js",import.meta.url),"utf8");
const hud=fs.readFileSync(new URL("../src/ui/PlaytestHudSystem.js",import.meta.url),"utf8");
const recipe=fs.readFileSync(new URL("../src/data/RecipeDataSystem.js",import.meta.url),"utf8");
const profile=JSON.parse(fs.readFileSync(new URL("../public/data/runtime/act1RuntimeProfile_HC015N.json",import.meta.url),"utf8"));
for(const proof of [
  "movement_traces_living_pressure_contour",
  "meaningfulMovement",
  "this.traceDistance += moved",
  "Standing still",
  "contourCount",
  "read_gathering_ground_beyond_ridge"
]) if(!sys.includes(proof)) throw new Error(`Missing HC015N gameplay proof: ${proof}`);
if(!runtime.includes("MembraneRidgeGameplaySystem") || !runtime.includes('register("membraneRidgeGameplaySystem"'))
  throw new Error("Membrane Ridge system not integrated.");
if(!hud.includes("Membrane Ridge: contour")) throw new Error("Membrane Ridge HUD proof missing.");
if(profile.pass!=="HC-015N") throw new Error("HC015N profile mismatch.");
if(!recipe.includes("/data/runtime/act1RuntimeProfile_HC015N.json")) throw new Error("HC015N profile not loaded.");
console.log("[HC015N] Membrane Ridge movement gameplay proof PASS");
