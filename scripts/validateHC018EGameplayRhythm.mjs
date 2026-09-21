import fs from "node:fs";
const i=fs.readFileSync(new URL("../src/presentation/InteractionCompositionSystem.js",import.meta.url),"utf8");
const a=fs.readFileSync(new URL("../src/world/AmbientMaterialInteractionSystem.js",import.meta.url),"utf8");
const audit=JSON.parse(fs.readFileSync(new URL("../public/data/build/hc018eGameplayRhythmAudit.json",import.meta.url),"utf8"));
const must=(x,m)=>{if(!x)throw new Error(m)};
for(const beat of ["observe","move","manipulate","consequence","quiet","discover","transition"]) must(i.includes(`"${beat}"`),`missing beat ${beat}`);
must(i.includes("consequenceHold"),"consequence hold missing");
must(i.includes("ambientRhythmScale"),"ambient rhythm output missing");
must(a.includes("ambientRhythmScale"),"ambient rhythm not consumed");
for(const k of ["newGameplayMechanic","newProgressionAuthority","routeRulesChanged","completionThresholdsChanged","objectiveAuthorityChanged","movementChanged","cameraSystemChanged","chemistryChanged","verbGameplayChanged","routeCrossingChanged"]) {
  must(audit[k]===false,`lock violated ${k}`);
}
console.log("[HC018E] whole-route rhythm sequence PASS");
console.log("[HC018E] consequence hold / quiet beat PASS");
console.log("[HC018E] ambient presentation coupling PASS");
console.log("[HC018E] gameplay/progression/route locks PASS");
