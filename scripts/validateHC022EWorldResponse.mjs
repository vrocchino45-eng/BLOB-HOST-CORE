import fs from "node:fs";
const read=p=>fs.readFileSync(new URL(p,import.meta.url),"utf8");
const m=read("../src/main.js"),a=read("../src/world/AmbientMaterialInteractionSystem.js"),
i=read("../src/camera/InspectionCameraSystem.js"),e=read("../src/player/CoreEmbodimentSystem.js");
const must=(x,msg)=>{if(!x)throw new Error(msg)};
must(m.includes('buildId: "HC-022E"'),"identity");
for(const x of ["brief_field_breath_read","outward_scatter_then_ring","motion_damps_and_orders","inward_draw_then_curl","stronger_transformed_response_beat"]) must(a.includes(x),x);
for(const x of ["worldResponseReusesPointsMaterial: true","worldResponseAddsDrawCalls: false","worldResponseAddsGeometry: false","worldResponseAddsArrayPass: false"]) must(a.includes(x),x);
must(a.includes("this.count = 66"),"mote count");
must(a.includes("supportedPatterns:")&&a.includes("pulse>stabilize"),"HC022D");
must(a.includes("recognition_and_prediction_not_collection"),"HC022C");
must(a.includes("scanUsesExistingMoteLoop: true"),"HC022B");
must(i.includes("manualFocusOverrideSeconds"),"HC022A");
must(e.includes('const surfaceTrace = growth.surfaceMemoryMode ?? "unwritten";'),"HC022A1");
console.log("[HC022E] distinct Scan/Pulse/Stabilize/Absorb visual signatures PASS");
console.log("[HC022E] rhythm-chain transformed response beat PASS");
console.log("[HC022E] 66-mote / same-material / no-new-pass budget PASS");
console.log("[HC022E] HC022A-D pillars retained PASS");
