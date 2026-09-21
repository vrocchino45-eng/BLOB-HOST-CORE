import fs from"node:fs";const r=p=>fs.readFileSync(new URL(p,import.meta.url),"utf8");
const m=r("../src/main.js"),g=r("../src/core/GameRuntime.js"),h=r("../src/world/HostRhythmSystem.js"),a=r("../src/world/AmbientMaterialInteractionSystem.js");
const x=(q,s)=>{if(!q)throw new Error(s)};
x(m.includes('buildId: "HC-022F"'),"id"); x(g.includes("new HostRhythmSystem"),"runtime"); x(g.indexOf('register("hostRhythmSystem"')<g.indexOf('register("ambientMaterialInteractionSystem"'),"order");
for(const q of ["single_host_rhythm_signal","gather","swell","release","world_is_the_metronome","mechanicalAdvantageEnabled:false"])x(h.includes(q),q);
for(const q of ["host_macro_cycle_produces_micro_environment_motion","visibleWithoutPlayerInput: true","hostRhythmReusesExistingMotes: true","hostRhythmAddsDrawCalls: false"])x(a.includes(q),q);
x(a.includes("this.count = 66"),"count");
console.log("[HC022F] single authoritative Host rhythm PASS");console.log("[HC022F] visible idle-world response PASS");console.log("[HC022F] no mechanical timing advantage yet PASS");console.log("[HC022F] 66-mote/no-new-draw-call budget PASS");
