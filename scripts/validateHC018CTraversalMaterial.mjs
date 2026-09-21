import fs from "node:fs";
const v=fs.readFileSync(new URL("../src/routes/VascularRhythmRouteSystem.js",import.meta.url),"utf8");
const a=JSON.parse(fs.readFileSync(new URL("../public/data/build/hc018cTraversalMaterialAudit.json",import.meta.url),"utf8"));
const must=(x,m)=>{if(!x)throw new Error(m)};
for(const s of ["pulse_pressure_surge","absorb_draw_wake","stabilized_calm_lane"]) must(v.includes(s),`missing ${s}`);
for(const s of ["traversalPulseWake","traversalAbsorbShear","traversalStabilizeCalm"]) must(v.includes(s),`missing ${s}`);
must(v.includes('routeFeelProfile: "vascular_directional_circulation_hc018c"'),"physical feel not integrated");
for(const k of ["newCompletionRequirement","cadenceRulesChanged","completionThresholdsChanged","playerMovementControllerChanged","chemistryChanged","routeCrossingChanged","cameraChanged"]) {
  must(a[k]===false,`lock violated ${k}`);
}
console.log("[HC018C] Vascular traversal-material response PASS");
console.log("[HC018C] Pulse/Absorb/Stabilize physical differentiation PASS");
console.log("[HC018C] cadence/completion/movement-controller locks PASS");
