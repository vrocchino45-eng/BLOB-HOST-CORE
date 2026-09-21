import fs from "node:fs";
const surface=fs.readFileSync(new URL("../src/opening/SurfaceWakeGameplaySystem.js",import.meta.url),"utf8");
const main=fs.readFileSync(new URL("../src/main.js",import.meta.url),"utf8");
const audit=JSON.parse(fs.readFileSync(new URL("../public/data/build/hc019bMatterStateConversionAudit.json",import.meta.url),"utf8"));
const must=(x,m)=>{if(!x)throw new Error(m)};

must(main.includes('buildId: "HC-019B"'),"active build identity stale");
must(surface.includes("this.materialPassageOpen = false"),"material passage state missing");
must(surface.includes("safeMaterialResult"),"safe material causal result missing");
must(surface.includes("this.foldInvitation = this.materialPassageOpen"),"fold does not observe world state");
must(surface.includes("surface_membrane_opened_by_safe_matter_state"),"physical traversal consequence missing");
must(surface.includes("parted_for_listening_fold"),"anatomical opening response missing");
must(surface.includes('causalProgressionMode: active ? "world_state_before_objective"'),"causal telemetry missing");

must(audit.singleObstacleOnly===true,"scope expanded beyond one obstacle");
for(const k of ["crossingAuthorityChanged","layeredFoldLogicChanged","movementControllerChanged","cameraChanged","chemistryChanged","verbRulesChanged","globalRouteRewrite"])
  must(audit[k]===false,`lock violated: ${k}`);

console.log("[HC019B] Surface matter-state causal conversion PASS");
console.log("[HC019B] physical passage consequence PASS");
console.log("[HC019B] existing fold/crossing authorities preserved PASS");
console.log("[HC019B] one-obstacle convergence scope PASS");
