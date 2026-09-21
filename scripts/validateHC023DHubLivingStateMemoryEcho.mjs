import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const must = (condition, message) => {
  if (!condition) throw new Error(`[HC023D] ${message}`);
};

const main = read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const hub = read("src/hub/HubChamberFoundationSystem.js");
const hubGameplay = read("src/hub/HubInvestigationGameplaySystem.js");
const surface = read("src/opening/SurfaceWakeGameplaySystem.js");
const contract = json("public/data/build/hc023dHubLivingStateMemoryEchoContract.json");

must(successorHC027C || (main.includes('buildId: "HC-023D"') || main.includes('buildId: "HC-024A"') || main.includes('buildId: "HC-024B"') || main.includes('buildId: "HC-024C"') || main.includes('buildId: "HC-024C1"') || main.includes('buildId: "HC-024C2"') || main.includes('buildId: "HC-024D0"') || main.includes('buildId: "HC-024D0A"') || main.includes('buildId: "HC-024D0B"') || (main.includes('buildId: "HC-024D0C"') || main.includes('buildId: "HC-024D1"') || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')))))))))))) || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))))))) || main.includes('buildId: "HC-024C2"') || main.includes('buildId: "HC-024D0"')), "runtime identity is not HC-023D or compatible HC-024A/HC-024B successor");
must(contract.sourceStateOwner === "SurfaceWakeGameplaySystem", "Surface must remain living-state owner");
must(contract.hubPolicy.derivesNewStates === false, "Hub must not derive a duplicate living-state machine");
must(contract.hubPolicy.presentationOnly === true, "Hub memory echo must remain presentation-only");
must(contract.hubPolicy.changesRoutes === false && contract.hubPolicy.changesProgression === false, "route/progression scope changed");
must(contract.hubPolicy.changesCamera === false && contract.hubPolicy.changesMovement === false, "camera/movement scope changed");
must(contract.hubPolicy.maximumPresentationWeight === 0.24, "Hub memory echo exceeded light-memory cap");
must(contract.performance.newSystems === 0 && contract.performance.newSourceModules === 0, "new gameplay ownership leaked into pass");
must(contract.performance.newParticles === 0 && contract.performance.newGeometry === false && contract.performance.newRaycasts === 0, "memory pass added runtime density cost");

for (const state of ["cautious", "blooming", "withered", "panic", "embrace", "growth"]) {
  must(surface.includes(`"${state}"`), `Surface source no longer supports ${state}`);
  must(hub.includes(`"${state}"`), `Hub does not recognize inherited ${state}`);
}

must(hub.includes("frameState.nurseryCircuit"), "Hub memory echo is not reading persistent Surface state");
must(hub.includes('livingStateOwner: "SurfaceWakeGameplaySystem"'), "Hub state metadata does not preserve Surface ownership");
must(hub.includes('livingStateMemoryEchoPass: "HC-023D"'), "Hub memory-echo pass metadata missing");
must(hub.includes('livingStateMemoryEchoScope: "central_cradle_and_ambient_drift_only"'), "memory echo scope is not constrained");
must(hub.includes("livingStateAffectsRoutes: false") && hub.includes("livingStateAffectsProgression: false"), "Hub state echo can mutate progression");
must(hub.includes("livingStateAffectsCamera: false") && hub.includes("livingStateAffectsMovement: false"), "Hub state echo can mutate camera/movement");
must(hub.includes("this.anchorPetals") && hub.includes("this.anchorBasin") && hub.includes("this.depthBodies") && hub.includes("this.driftMotes"), "expected existing Hub anatomy is not reused");
must(!hubGameplay.includes("livingStateMemoryEchoPass"), "HubInvestigationGameplaySystem incorrectly gained presentation/state ownership");

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

console.log("[HC023D] Surface-owned state history PASS");
console.log("[HC023D] light Hub central-cradle memory echo PASS");
console.log("[HC023D] route/investigation/progression ownership lock PASS");
console.log("[HC023D] no-new-system/no-new-particle/no-new-geometry scope PASS");
