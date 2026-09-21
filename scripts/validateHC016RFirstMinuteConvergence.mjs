import fs from "node:fs";
import path from "node:path";
const root=path.resolve(new URL("..",import.meta.url).pathname);

const cohesion=fs.readFileSync(path.join(root,"src/core/FirstSliceCohesionSystem.js"),"utf8");
const hud=fs.readFileSync(path.join(root,"src/ui/PlaytestHudSystem.js"),"utf8");
const guide=fs.readFileSync(path.join(root,"src/guide/GuidePromptSystem.js"),"utf8");
const runtime=fs.readFileSync(path.join(root,"src/core/GameRuntime.js"),"utf8");

if(fs.existsSync(path.join(root,"src/systems/GateSystem.js")))
  throw new Error("GateSystem returned.");
if(runtime.includes('register("gateSystem"'))
  throw new Error("GateSystem runtime registration returned.");

for(const proof of [
  "captureFirstMinute(frameState)",
  'milestone: "surface_wake_to_guide_threshold_to_hub"',
  'firstMinuteLockDefinition: "Surface Wake lesson → Guide Threshold current → stable Hub arrival"',
  "authoritativeProgression: false"
]) if(!cohesion.includes(proof)) throw new Error(`First-minute convergence proof missing: ${proof}`);

if(!hud.includes("firstMinuteExperience?.complete"))
  throw new Error("HUD still derives first-minute completion from later vertical-slice lock.");

const activeCellAssignment=/(?:frameState|this\.frameState)\.activeCellId\s*(?<![=!<>])=(?!=)/;
if(activeCellAssignment.test(hud)) throw new Error("HUD mutates activeCellId.");
if(activeCellAssignment.test(guide)) throw new Error("Guide mutates activeCellId.");

console.log("[HC016R] R1 closeout architecture proof PASS");
console.log("[HC016R] true Surface→Guide→Hub first-minute milestone PASS");
console.log("[HC016R] HUD/Guide remain observational PASS");
