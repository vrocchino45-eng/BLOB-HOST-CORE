import fs from "node:fs";
const registry=fs.readFileSync(new URL("../src/core/SystemRegistry.js",import.meta.url),"utf8");
const overlay=fs.readFileSync(new URL("../src/debug/RecipeDebugOverlay.js",import.meta.url),"utf8");
const runtime=fs.readFileSync(new URL("../src/core/GameRuntime.js",import.meta.url),"utf8");

for(const proof of [
 "hitchSampleThresholdMs = 45.0",
 "timingSampleReason",
 "updateShareOfFrame",
 "hitchClassification",
 "worstSampleSnapshot",
 "non_update_bound"
]) if(!registry.includes(proof)) throw new Error(`Registry performance capture missing: ${proof}`);

for(const proof of [
 "PERFORMANCE CAPTURE HC016N",
 "Updater sample:",
 "Worst updater sample:",
 "LIKELY RENDER / ALLOCATION / GC",
 "UPDATER HOTSPOT"
]) if(!overlay.includes(proof)) throw new Error(`Debug performance panel missing: ${proof}`);

if(!runtime.includes('pass: "HC-016N"'))
  throw new Error("GameRuntime performanceCapture identity missing.");

console.log("[HC016N] hitch-triggered updater capture + readable debug panel PASS");
