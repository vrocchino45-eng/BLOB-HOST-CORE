import fs from "node:fs";
const audit=JSON.parse(fs.readFileSync(new URL("../public/data/build/hc016sRouteScaleSpatialAudit.json",import.meta.url),"utf8"));
const grave=JSON.parse(fs.readFileSync(new URL("../public/data/routes/graveMemoryRouteCircuit_HC010B.json",import.meta.url),"utf8"));
const vascular=JSON.parse(fs.readFileSync(new URL("../public/data/routes/vascularRhythmRouteCircuit_HC011A1.json",import.meta.url),"utf8"));
const silt=JSON.parse(fs.readFileSync(new URL("../public/data/routes/siltPressureRouteCircuit_HC012A.json",import.meta.url),"utf8"));

if(audit.mode !== "SPATIAL AUDIT / NO GAMEPLAY MUTATION") throw new Error("HC016S mode changed.");
if(grave.movementBounds.radii.join(",") !== "4.25,3.1,6.8") throw new Error("Grave runtime geometry mutated during audit.");
if(vascular.anatomy.pathPoints.at(-1)[2] !== -5.72) throw new Error("Vascular path mutated during audit.");
if(silt.anatomy.pathPoints.at(-1)[2] !== -5.42) throw new Error("Silt path mutated during audit.");
if(audit.targetSpatialGrammar.grave.recommendedPrimaryDepth !== 18) throw new Error("Grave target missing.");
if(audit.targetSpatialGrammar.vascular.recommendedPathLength !== 24) throw new Error("Vascular target missing.");
if(audit.targetSpatialGrammar.silt.recommendedPrimaryPathLength !== 20) throw new Error("Silt target missing.");
console.log("[HC016S] current route scale measured PASS");
console.log("[HC016S] Core-size lock + route-specific spatial targets PASS");
console.log("[HC016S] no runtime route mutation PASS");
