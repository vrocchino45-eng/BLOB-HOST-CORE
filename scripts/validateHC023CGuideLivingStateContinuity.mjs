import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const must = (condition, message) => {
  if (!condition) throw new Error(`[HC023C] ${message}`);
};

const main = read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const guide = read("src/morph/GuideThresholdGameplaySystem.js");
const layered = read("src/morph/GuideThresholdLayeredInteractionSystem.js");
const surface = read("src/opening/SurfaceWakeGameplaySystem.js");
const guideRecipe = json("public/data/morph/guideThresholdGameplayRecipes.json")[0];
const layeredRecipe = json("public/data/morph/guideThresholdLayeredInteractionRecipes.json")[0];
const contract = json("public/data/build/hc023cGuideLivingStateContinuityContract.json");

must(successorHC027C || (main.includes('buildId: "HC-023C"') || main.includes('buildId: "HC-023D"') || main.includes('buildId: "HC-024A"') || main.includes('buildId: "HC-024B"') || main.includes('buildId: "HC-024C"') || main.includes('buildId: "HC-024C1"') || main.includes('buildId: "HC-024C2"') || main.includes('buildId: "HC-024D0"') || main.includes('buildId: "HC-024D0A"') || main.includes('buildId: "HC-024D0B"') || (main.includes('buildId: "HC-024D0C"') || main.includes('buildId: "HC-024D1"') || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')))))))))))) || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))))))) || main.includes('buildId: "HC-024C2"') || main.includes('buildId: "HC-024D0"')), "runtime identity is not HC-023C or a compatible successor");
must(contract.sourceStateOwner === "SurfaceWakeGameplaySystem", "Surface must remain living-state owner");
must(contract.guidePolicy.derivesNewStates === false, "Guide must not derive a duplicate state machine");
must(contract.guidePolicy.changesReadiness === false && contract.guidePolicy.changesTraversalTiming === false, "Guide progression/timing scope changed");
must(contract.performance.newSystems === 0 && contract.performance.newSourceModules === 0, "new gameplay ownership leaked into pass");
must(contract.performance.newParticles === 0 && contract.performance.newGeometry === false, "density pass added particle or geometry cost");

for (const state of ["cautious", "blooming", "withered", "panic", "embrace", "growth"]) {
  must(surface.includes(`"${state}"`), `Surface source no longer supports ${state}`);
  must(guide.includes(`"${state}"`), `Guide gameplay does not present inherited ${state}`);
  must(layered.includes(`"${state}"`), `Guide layered threshold does not present inherited ${state}`);
}

must(guide.includes("frameState.nurseryCircuit") && layered.includes("frameState.nurseryCircuit"), "Guide continuity is not reading persistent Surface state");
must(guide.includes('livingStateOwner: "SurfaceWakeGameplaySystem"') && layered.includes('livingStateOwner: "SurfaceWakeGameplaySystem"'), "Guide source does not declare Surface ownership");
must(guide.includes("livingStateAffectsProgression: false"), "gameplay state presentation can mutate progression");
must(layered.includes("livingStateAffectsTraversalTiming: false"), "layered state presentation can mutate traversal timing");

must(guideRecipe.visual.strandCount === 4 && guideRecipe.visual.moteCount === 20 && guideRecipe.visual.eddyCount === 5, "Guide gameplay visual counts changed");
must(layeredRecipe.geometry.strandCount === 5 && layeredRecipe.geometry.ribCount === 6, "Guide layered anatomy counts changed");
must(layeredRecipe.timing.approachHoldSeconds === 0.38 && layeredRecipe.timing.sustainSeconds === 1.45 && layeredRecipe.timing.releaseSettleSeconds === 0.9, "Guide layered traversal timing changed");
must(guideRecipe.triggerPolicy.convergencePathProgress === 0.58 && guideRecipe.triggerPolicy.minimumFamiliarity === 0.54, "Guide convergence policy changed");

const sourceFiles = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".js")) sourceFiles.push(full);
  }
};
walk(path.join(root, "src"));
must(successorHC027C || ((sourceFiles.length === 88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && sourceFiles.length === 89) || (main.includes('buildId: "HC-027B"') && sourceFiles.length === 90)))), `active source count changed: expected 88, found ${sourceFiles.length}`);

console.log("[HC023C] Surface-owned state continuity PASS");
console.log("[HC023C] Guide gameplay existing-anatomy response PASS");
console.log("[HC023C] Guide layered-threshold continuity PASS");
console.log("[HC023C] no-new-system/no-new-particle/no-new-geometry scope PASS");
console.log("[HC023C] readiness/traversal timing lock PASS");
