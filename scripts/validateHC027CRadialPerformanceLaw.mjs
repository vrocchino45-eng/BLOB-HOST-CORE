import fs from "node:fs";
import path from "node:path";
import { CoreRadialPerformanceSystem } from "../src/player/CoreRadialPerformanceSystem.js";

const must = (condition, message) => {
  if (!condition) throw new Error(`[HC027C] ${message}`);
};
const text = (file) => fs.readFileSync(file, "utf8");
const json = (file) => JSON.parse(text(file));

const main = text("src/main.js");
const runtime = text("src/core/GameRuntime.js");
const performance = text("src/player/CoreRadialPerformanceSystem.js");
const movement = text("src/player/PlayerMovementController.js");
const engine = text("src/player/CoreEngineSystem.js");
const hud = text("src/ui/PlaytestHudSystem.js");
const recipe = text("src/data/RecipeDataSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity = json("public/data/build/currentBuildIdentity_HC027C.json");
const contract = json("public/data/build/hc027cRadialPerformanceContract.json");
const pkg = json("package.json");

const successorHC027C1 = main.includes('buildId: "HC-027C1"');
const successorHC027D = main.includes('buildId: "HC-027D"');
const successorHC027D1 = main.includes('buildId: "HC-027D1"');
const successorHC027E = (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
must(main.includes('buildId: "HC-027C"') || successorHC027C1 || successorHC027D || successorHC027D1 || successorHC027E, "runtime identity missing");
must(pkg.version === "0.27.2" || (successorHC027C1 && pkg.version === "0.27.3") || (successorHC027D && pkg.version === "0.27.4") || (successorHC027D1 && pkg.version === "0.27.5") || (successorHC027E && ["0.27.6", "0.27.7", "0.27.8", "0.27.9", "0.27.10", "0.27.11", "0.27.12", "0.27.13"].includes(pkg.version)), "package version mismatch");
must(identity.id === "HC-027C" && identity.sourceJsCount === 91 && identity.newSourceModules === 1, "identity/source count mismatch");
must(profile.build === "HC-027C" || (successorHC027C1 && profile.build === "HC-027C1") || (successorHC027D && profile.build === "HC-027D") || (successorHC027D1 && profile.build === "HC-027D1") || (successorHC027E && ["HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)), "inspection profile build mismatch");
must(runtime.includes("CoreRadialPerformanceSystem") && runtime.includes('this.registry.register("coreRadialPerformanceSystem", this.coreRadialPerformanceSystem)'), "radial performance owner is not mounted");
must(runtime.indexOf('this.registry.register("coreGrowthSystem", this.coreGrowthSystem)') < runtime.indexOf('this.registry.register("coreRadialPerformanceSystem", this.coreRadialPerformanceSystem)'), "radial performance must read topology after CoreGrowth/CoreEmbodiment publishes it");

for (const token of [
  "deep_core",
  "inner_body",
  "membrane",
  "diesel / reserve drive",
  "transmission / control drive",
  "race / output drive",
  "enduranceCapacity",
  "recoveryPerSecond",
  "boostAccelerationMultiplier",
  "boostSpeedMultiplier",
  "normalMovementMultiplier: 1",
  "randomFailureEnabled: false",
  "engineArchitectureAuthority: false",
  "progressionAuthority: false"
]) must(performance.includes(token), `radial law missing ${token}`);

must(!performance.includes("phaseCount") && !performance.includes("architectureLabel") && !performance.includes("coreEngine."), "radial performance must remain independent of 3/6/12 engine architecture");
must(movement.includes("radialPerformance.boostAccelerationMultiplier") && movement.includes("radialPerformance.boostSpeedMultiplier"), "PlayerMovementController does not consume radial boost modifiers");
must(movement.includes("input.boostHeld") && movement.includes("performanceBoostAccelerationScale") && movement.includes("performanceBoostSpeedScale"), "radial movement consequence must remain boost-scoped");
must(engine.includes('const ARCHITECTURE_ORDER = [3, 6, 12]') && engine.includes("nonTriadicArchitectureEnabled: false"), "HC027B engine grammar changed during HC027C");
must(hud.includes("corePerformance.personality") && hud.includes("corePerformanceReservePercent"), "radial performance is not readable in playtest HUD");
must(recipe.includes("HC-027C requires continuous Deep/Inner/Membrane radial performance blending"), "RecipeDataSystem radial contract missing");

const behavior = profile.behavior ?? {};
must(behavior.radialCorePerformanceEnabled === true, "profile radial performance flag missing");
must(behavior.radialCorePerformanceOwner === "CoreRadialPerformanceSystem", "profile radial owner mismatch");
must(behavior.radialCorePerformanceContinuousBlend === true, "profile must lock continuous blending");
must(behavior.radialCorePerformanceEnduranceReserveEnabled === true && behavior.radialCorePerformanceBoostConsequencesEnabled === true, "performance consequences not enabled");
must(behavior.radialCorePerformanceNormalMovementChanged === false, "normal movement must remain locked");
must(behavior.radialCorePerformanceRandomFailureEnabled === false, "random failure belongs to a later pass");
must(behavior.radialCorePerformanceArchitectureMutation === false, "radial topology may not mutate 3/6/12 architecture");

must(contract.owner === "CoreRadialPerformanceSystem", "contract owner mismatch");
must(contract.source?.topologyStateCount === 10 && contract.source?.pieceCount === 3, "contract must consume the existing 3-piece / 10-topology law");
must(contract.movement?.normalMovementMultiplier === 1 && contract.movement?.performanceSystemMovesPlayerDirectly === false, "movement ownership weakened");
must(contract.locked?.engineArchitectures?.join(",") === "3,6,12" && contract.locked?.engineArchitectureChangesPerformance === false, "engine architecture independence weakened");

const makeState = (counts, topologyId, distribution) => ({
  frame: 1,
  input: { boostHeld: false, absorbHeld: false, stabilizeHeld: false, pulseEventId: 0 },
  spatialCoreChemistry: {
    retainedPieceCount: 3,
    counts,
    topology: { id: topologyId, label: topologyId, distribution, complete: true }
  }
});
const playerRoot = () => ({ userData: {} });
const deepState = makeState({ deep_core: 3, inner_body: 0, membrane: 0 }, "deep_concentration", "3:0:0");
const innerState = makeState({ deep_core: 0, inner_body: 3, membrane: 0 }, "inner_saturation", "0:3:0");
const membraneState = makeState({ deep_core: 0, inner_body: 0, membrane: 3 }, "membrane_saturation", "0:0:3");
const balancedState = makeState({ deep_core: 1, inner_body: 1, membrane: 1 }, "three_way_balance", "1:1:1");

const deep = new CoreRadialPerformanceSystem({ frameState: deepState, playerRoot: playerRoot() });
const inner = new CoreRadialPerformanceSystem({ frameState: innerState, playerRoot: playerRoot() });
const membrane = new CoreRadialPerformanceSystem({ frameState: membraneState, playerRoot: playerRoot() });
const balanced = new CoreRadialPerformanceSystem({ frameState: balancedState, playerRoot: playerRoot() });
for (const [system, state] of [[deep, deepState], [inner, innerState], [membrane, membraneState], [balanced, balancedState]]) system.update(0.016, state);

must(deepState.corePerformance.traits.enduranceCapacity > innerState.corePerformance.traits.enduranceCapacity, "Deep must carry more endurance capacity than Inner");
must(innerState.corePerformance.traits.enduranceCapacity > membraneState.corePerformance.traits.enduranceCapacity, "Inner must carry more endurance capacity than Membrane");
must(deepState.corePerformance.traits.recovery > innerState.corePerformance.traits.recovery && innerState.corePerformance.traits.recovery > membraneState.corePerformance.traits.recovery, "Deep -> Inner -> Membrane recovery ordering failed");
must(membraneState.corePerformance.traits.output > innerState.corePerformance.traits.output && innerState.corePerformance.traits.output > deepState.corePerformance.traits.output, "Membrane -> Inner -> Deep output ordering failed");
must(membraneState.corePerformance.movementModifiers.boostSpeedMultiplier > deepState.corePerformance.movementModifiers.boostSpeedMultiplier, "Membrane boost speed must exceed Deep boost speed at full reserve");
must(Math.abs(balancedState.corePerformance.traits.output - 1.02) < 0.03, "1:1:1 balance should sit near neutral output rather than becoming a fourth hard-coded class");

// Six seconds of identical full boost demand: the Deep layout should keep much
// more reserve than the Membrane layout because capacity + efficiency differ.
deepState.input.boostHeld = true;
membraneState.input.boostHeld = true;
for (let index = 0; index < 120; index += 1) {
  deepState.frame += 1;
  membraneState.frame += 1;
  deep.update(0.05, deepState);
  membrane.update(0.05, membraneState);
}
must(deepState.corePerformance.endurance.reserve01 > membraneState.corePerformance.endurance.reserve01 + 0.45, "Deep diesel reserve separation is too weak");
must(membraneState.corePerformance.endurance.reserve01 < 0.1, "Membrane race layout should nearly exhaust under six seconds of continuous boost");

// Equal recovery window after demand stops: Deep must recover faster.
deepState.input.boostHeld = false;
membraneState.input.boostHeld = false;
const deepBeforeRecovery = deepState.corePerformance.endurance.reserve01;
const membraneBeforeRecovery = membraneState.corePerformance.endurance.reserve01;
for (let index = 0; index < 40; index += 1) {
  deep.update(0.05, deepState);
  membrane.update(0.05, membraneState);
}
const deepRecovered = deepState.corePerformance.endurance.reserve01 - deepBeforeRecovery;
const membraneRecovered = membraneState.corePerformance.endurance.reserve01 - membraneBeforeRecovery;
must(deepRecovered > membraneRecovered * 1.8, "Deep recovery advantage is not strong enough to read as diesel physiology");

const sourceFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.isFile() && file.endsWith(".js")) sourceFiles.push(file);
  }
};
walk("src");
must(sourceFiles.length === 91 || ((successorHC027D || successorHC027D1 || successorHC027E) && sourceFiles.length === 92), `expected HC027C/C1 91 modules or HC027D/D1 successor 92, found ${sourceFiles.length}`);

console.log("[HC027C] Deep / Inner / Membrane continuous radial performance blend PASS");
console.log("[HC027C] Deep diesel endurance/recovery vs Membrane race output/consumption PASS");
console.log("[HC027C] boost-only movement consequence / normal traversal ownership preserved PASS");
console.log("[HC027C] 3 -> 6 -> 12 engine architecture remains independent and unchanged PASS");
