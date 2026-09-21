import fs from "node:fs";
const read=p=>fs.readFileSync(new URL(p,import.meta.url),"utf8");
const main=read("../src/main.js"), host=read("../src/world/HostRhythmSystem.js"),
grave=read("../src/routes/GraveMemoryRouteSystem.js"),
vascular=read("../src/routes/VascularRhythmRouteSystem.js"),
silt=read("../src/routes/SiltPressureRouteSystem.js");
const must=(x,m)=>{if(!x)throw new Error(m)};
must(main.includes('buildId: "HC-022G"'),"identity");
must(host.includes("single_host_rhythm_signal"),"host authority");
for(const x of ["delayed_weighted_compression","directional_traveling_surge","lagged_compression_and_settling"]) must((grave+vascular+silt).includes(x),x);
must(grave.includes("gameplayAuthority: false"),"grave authority");
must(vascular.includes("gameplayAuthority: false"),"vascular authority");
must(silt.includes("gameplayAuthority: false"),"silt authority");
must(!vascular.includes("frameState.hostRhythmForce"),"vascular force regression");
must(!silt.includes("frameState.hostRhythmForce"),"silt force regression");
console.log("[HC022G] one Host rhythm / regional interpretation PASS");
console.log("[HC022G] Grave weighted delay PASS");
console.log("[HC022G] Vascular traveling surge PASS");
console.log("[HC022G] Silt lagged compression PASS");
console.log("[HC022G] no gameplay-force authority PASS");
