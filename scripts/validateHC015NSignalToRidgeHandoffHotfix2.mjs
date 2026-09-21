import fs from "node:fs";
const objective=fs.readFileSync(new URL("../src/systems/ObjectiveSystem.js",import.meta.url),"utf8");
const guide=fs.readFileSync(new URL("../src/guide/GuidePromptSystem.js",import.meta.url),"utf8");
const hud=fs.readFileSync(new URL("../src/ui/PlaytestHudSystem.js",import.meta.url),"utf8");

for(const proof of [
  "signal_plain_local_response_complete",
  "continuationOwner: signalPlainComplete ? \"MembraneRidgeGameplaySystem\"",
  "foundationOnly: false",
  "fullEcologyMounted: Boolean"
]) if(!objective.includes(proof)) throw new Error(`Missing objective handoff proof: ${proof}`);

for(const proof of [
  "membraneRidgeGameplayPrompt",
  "GUIDE_PROMPT_MEMBRANE_RIDGE_HC015N_HOTFIX2",
  "membraneRidgeGameplay ?? signalPlainEcology"
]) if(!guide.includes(proof)) throw new Error(`Missing Guide handoff proof: ${proof}`);

if(!hud.includes('if (signal.completed && ridge.active)'))
  throw new Error("HUD objective handoff proof missing.");

console.log("[HC015N HOTFIX2] Signal Plain -> Membrane Ridge objective handoff proof PASS");
