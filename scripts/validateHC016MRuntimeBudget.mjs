import fs from "node:fs";
const profile=JSON.parse(fs.readFileSync(new URL("../public/data/runtime/act1RuntimeProfile_HC016M.json",import.meta.url),"utf8"));
const recipe=fs.readFileSync(new URL("../src/data/RecipeDataSystem.js",import.meta.url),"utf8");
const registry=fs.readFileSync(new URL("../src/core/SystemRegistry.js",import.meta.url),"utf8");
const runtime=fs.readFileSync(new URL("../src/core/GameRuntime.js",import.meta.url),"utf8");

if(profile.id !== "ACT1_RUNTIME_PROFILE_HC014G") throw new Error("Successor profile identity changed.");
if(profile.pass !== "HC-015N") throw new Error("Unsupported successor pass identity.");
if(profile.sourceAuthority !== "HOST_CORE_Blueprint_v1_reference_docs.zip") throw new Error("Authoritative source changed.");
if(!profile.regions.aperture_fields.systemIds.includes("membraneRidgeGameplaySystem"))
  throw new Error("Membrane Ridge is not mounted with Aperture.");
if(!recipe.includes('act1RuntimeProfile_HC016M.json'))
  throw new Error("RecipeDataSystem does not load HC016M profile.");
if(runtime.includes('registry.register("gateSystem"'))
  throw new Error("GateSystem was re-registered.");
for(const proof of ["timingSampleEveryFrames = 60","slowestSampledSystems","sampledUpdateMs"])
  if(!registry.includes(proof)) throw new Error(`Timing telemetry missing: ${proof}`);
console.log("[HC016M-HF1] successor-compatible runtime profile PASS");
console.log("[HC016M-HF1] Membrane Ridge mount + sampled updater telemetry PASS");
