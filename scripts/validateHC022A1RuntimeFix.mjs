import fs from "node:fs";
const read=p=>fs.readFileSync(new URL(p,import.meta.url),"utf8");
const main=read("../src/main.js");
const emb=read("../src/player/CoreEmbodimentSystem.js");
const ambient=read("../src/world/AmbientMaterialInteractionSystem.js");
const inspect=read("../src/camera/InspectionCameraSystem.js");
const must=(x,m)=>{if(!x)throw new Error(m)};

must(main.includes('buildId: "HC-022A1"'),"identity");
must(emb.includes('const surfaceTrace = growth.surfaceMemoryMode ?? "unwritten";'),"surfaceTrace scope fix");
must(emb.includes("deformBody(t, dt, speed, pressure, viscosity, boundaryPressure, boost)"),"deformBody dt signature");
must(/this\.deformBody\([\s\S]*?frameState\.runtimeSeconds \?\? 0,[\s\S]*?\bdt,[\s\S]*?\bboost[\s\S]*?\)/.test(emb),"deformBody dt call");
must(ambient.includes("pulse_echo_motes_answered"),"HC022A micro-play retained");
must(ambient.includes("moteCountIncreasedThisPass: false"),"HC022A perf retained");
must(inspect.includes("computeFocusIntentAlignment"),"HC022A inspection intent retained");
must(inspect.includes("manualFocusOverrideSeconds"),"HC022A manual unlock retained");

console.log("[HC022A1] startup scope fix PASS");
console.log("[HC022A1] latent dt scope fix PASS");
console.log("[HC022A1] HC022A feature set retained PASS");
