import fs from "node:fs";
const main=fs.readFileSync(new URL("../src/main.js", import.meta.url),"utf8");
const html=fs.readFileSync(new URL("../index.html", import.meta.url),"utf8");
const boundary=fs.readFileSync(new URL("../src/morph/LocalCellBoundaryMorphSystem.js", import.meta.url),"utf8");
const overlay=fs.readFileSync(new URL("../src/debug/RecipeDebugOverlay.js", import.meta.url),"utf8");
const manifest=JSON.parse(fs.readFileSync(new URL("../public/data/build/buildManifest.json", import.meta.url),"utf8"));
const audit=JSON.parse(fs.readFileSync(new URL("../public/data/build/hc018eHotfix1Audit.json", import.meta.url),"utf8"));
const must=(x,m)=>{if(!x)throw new Error(m)};

must(main.includes('buildId: "HC-018E"'),"runtime build id not HC018E");
must(main.includes('buildLabel: "Gameplay Rhythm Convergence"'),"runtime build label stale");
must(html.includes("HC-018E"),"browser title stale");
must(overlay.includes("Source manifest (compat)"),"compat manifest label unclear");
must(!overlay.includes("PERFORMANCE CAPTURE HC016N"),"stale performance heading remains");
must(manifest.id==="HC-015N","compat source manifest was dangerously rewritten");

must(boundary.includes("readyAge >= 0.38"),"return ready dwell missing");
must(boundary.includes("returnTriggerArmed"),"return arming latch missing");
must(boundary.includes("return requires ready dwell + released interact + fresh interact"),"guard telemetry missing");

for(const k of ["routeCompletionRulesChanged","movementChanged","cameraChanged","chemistryChanged","interactionRangeChanged"])
  must(audit[k]===false,`scope lock violated: ${k}`);

console.log("[HC018E HOTFIX1] current runtime identity HC018E PASS");
console.log("[HC018E HOTFIX1] compatibility manifest preserved PASS");
console.log("[HC018E HOTFIX1] explicit return-fold re-arm guard PASS");
console.log("[HC018E HOTFIX1] gameplay tuning locks PASS");
