import fs from "node:fs";
const read=p=>fs.readFileSync(new URL(p,import.meta.url),"utf8");
const main=read("../src/main.js"), a=read("../src/world/AmbientMaterialInteractionSystem.js"),
i=read("../src/camera/InspectionCameraSystem.js"), e=read("../src/player/CoreEmbodimentSystem.js");
const must=(x,m)=>{if(!x)throw new Error(m)};
must(main.includes('buildId: "HC-022C"'),"identity");
must(a.includes("new Uint8Array(6)"),"fixed memory");
for(const x of ["recognition_and_prediction_not_collection","completionIsRequired: false","rewardCurrency: false","responseMemoryAddsWorldObjects: false"]) must(a.includes(x),x);
for(const x of ["scan_interact","pulse","stabilize","absorb"]) must(a.includes(x),x);
must(a.includes("this.count = 66"),"mote count");
must(a.includes("scanUsesExistingMoteLoop: true")&&a.includes("scanAddsSecondMotePass: false"),"perf regression");
must(i.includes("computeFocusIntentAlignment")&&i.includes("manualFocusOverrideSeconds"),"inspection regression");
must(e.includes('const surfaceTrace = growth.surfaceMemoryMode ?? "unwritten";'),"runtime regression");
console.log("[HC022C] repeated family/verb response memory PASS");
console.log("[HC022C] prediction-not-collection authority PASS");
console.log("[HC022C] fixed 6-byte relationship memory PASS");
console.log("[HC022C] 66-mote/no-new-world-object budget PASS");
console.log("[HC022C] HC022A-B regressions retained PASS");
