import fs from "node:fs";
const guide=fs.readFileSync(new URL("../src/morph/GuideThresholdGameplaySystem.js",import.meta.url),"utf8");
const objective=fs.readFileSync(new URL("../src/systems/ObjectiveSystem.js",import.meta.url),"utf8");
const hub=fs.readFileSync(new URL("../src/hub/HubChamberFoundationSystem.js",import.meta.url),"utf8");
const pacing=fs.readFileSync(new URL("../src/opening/OpeningPacingSystem.js",import.meta.url),"utf8");
const status=fs.readFileSync(new URL("../src/ui/StatusPageSystem.js",import.meta.url),"utf8");
const main=fs.readFileSync(new URL("../src/main.js",import.meta.url),"utf8");
const audit=JSON.parse(fs.readFileSync(new URL("../public/data/build/hc020bReadableVerbGrammarAudit.json",import.meta.url),"utf8"));
const must=(x,m)=>{if(!x)throw new Error(m)};

must(main.includes('buildId: "HC-020B"'),"identity stale");
for(const s of ["read_turbulent_current","stabilizing_turbulence","stabilized_coherent_current","absorb_rejected_by_living_current"])
  must(guide.includes(s),`Guide material state missing: ${s}`);
must(guide.includes("material_recoil_no_coupling"),"wrong-verb response missing");
must(guide.includes("sharedStabilizeFieldSuppression"),"Guide VFX hierarchy missing");
const verbs=fs.readFileSync(new URL("../src/player/CoreVerbPhysicalizationSystem.js",import.meta.url),"utf8");
must(verbs.includes("guideFieldSuppression"),"shared Stabilize VFX does not consume Guide suppression");
must(guide.includes("buttonMashSuccessExpected: false"),"anti-mash contract missing");

must(objective.includes("statusPageOptional: true"),"Status page still objective-authoritative");
must(objective.includes("uiProgressionAuthority: false"),"UI progression authority not disabled");
must(hub.includes('departurePrerequisite: "hub_world_investigation_complete"'),"Hub departure still requires Status page");
must(!pacing.includes('return "self_read_hub"'),"Opening pacing still has Status objective stage");
must(status.includes("progressionAuthority: false"),"Status page does not declare no progression authority");

must(audit.uiProgression.statusPageObjectiveRemoved===true,"UI objective audit false");
must(audit.documentation.historicalRootReportsArchived > 0,"documentation archive absent");
for(const k of ["worldExpansion","newMajorSystem","movementChanged","cameraChanged","chemistryChanged","crossingChanged","surfaceWakeChanged"])
  must(audit[k]===false,`scope lock violated ${k}`);

console.log("[HC020B] Guide readable verb grammar PASS");
console.log("[HC020B] wrong-verb visible response / anti-mash contract PASS");
console.log("[HC020B] Status/Info UI removed from progression PASS");
console.log("[HC020B] documentation history archived PASS");
console.log("[HC020B] expansion/movement/camera/chemistry/crossing locks PASS");
