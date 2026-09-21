import fs from "node:fs";
const occ=fs.readFileSync(new URL("../src/camera/InspectionOcclusionSystem.js",import.meta.url),"utf8");
const ridge=fs.readFileSync(new URL("../src/fields/MembraneRidgeGameplaySystem.js",import.meta.url),"utf8");
const hud=fs.readFileSync(new URL("../src/ui/PlaytestHudSystem.js",import.meta.url),"utf8");

for(const proof of [
  "fadeCandidates = []",
  "candidateRefreshInterval = 0.65",
  "occlusionSampleInterval = 0.075",
  "intersectObjects(this.fadeCandidates, false)",
  "reduceCachedAmbientDensity",
  'performanceMode: "cached_mesh_candidates_sampled_occlusion"'
]) if(!occ.includes(proof)) throw new Error(`Tight-camera optimization missing: ${proof}`);

if(occ.includes("intersectObjects(this.scene.children, true)"))
  throw new Error("Recursive whole-scene tight-camera raycast still present.");

if(!ridge.includes("currentPlayableEndpoint: this.completed") ||
   !ridge.includes("nextGameplayImplemented: false"))
  throw new Error("Membrane Ridge endpoint contract missing.");

if(!hud.includes("CURRENT PLAYABLE ENDPOINT"))
  throw new Error("HUD does not clearly mark current endpoint.");

console.log("[HC016P] cached/sampled Tight Camera occlusion PASS");
console.log("[HC016P] Membrane Ridge current endpoint made explicit PASS");
