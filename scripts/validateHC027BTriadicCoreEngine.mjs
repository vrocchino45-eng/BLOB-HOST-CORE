import fs from "node:fs";
import path from "node:path";

const must = (condition, message) => {
  if (!condition) throw new Error(`[HC027B] ${message}`);
};
const text = (file) => fs.readFileSync(file, "utf8");
const json = (file) => JSON.parse(text(file));

const main = text("src/main.js");
const runtime = text("src/core/GameRuntime.js");
const engine = text("src/player/CoreEngineSystem.js");
const embodiment = text("src/player/CoreEmbodimentSystem.js");
const input = text("src/input/InputSystem.js");
const audio = text("src/audio/EventAnchoredHostAudioSystem.js");
const hud = text("src/ui/PlaytestHudSystem.js");
const recipe = text("src/data/RecipeDataSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity = json("public/data/build/currentBuildIdentity_HC027B.json");
const contract = json("public/data/build/hc027bTriadicCoreEngineContract.json");
const pkg = json("package.json");

const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"');
const successorHC027C1 = main.includes('buildId: "HC-027C1"');
const successorHC027D = main.includes('buildId: "HC-027D"');
const successorHC027D1 = main.includes('buildId: "HC-027D1"');
const successorHC027E = (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
must(main.includes('buildId: "HC-027B"') || successorHC027C || successorHC027C1 || successorHC027D || successorHC027D1 || successorHC027E, "runtime identity missing");
must(pkg.version === "0.27.1" || (successorHC027C && pkg.version === "0.27.2") || (successorHC027C1 && pkg.version === "0.27.3") || (successorHC027D && pkg.version === "0.27.4") || (successorHC027D1 && pkg.version === "0.27.5") || (successorHC027E && ["0.27.6", "0.27.7", "0.27.8", "0.27.9", "0.27.10", "0.27.11", "0.27.12", "0.27.13"].includes(pkg.version)), "package version mismatch");
must(identity.id === "HC-027B" && identity.sourceJsCount === 90 && identity.newSourceModules === 1, "identity/source count mismatch");
must(profile.build === "HC-027B" || (successorHC027C && profile.build === "HC-027C") || (successorHC027C1 && profile.build === "HC-027C1") || (successorHC027D && profile.build === "HC-027D") || (successorHC027D1 && profile.build === "HC-027D1") || (successorHC027E && ["HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)), "inspection profile build mismatch");
must(runtime.includes('CoreEngineSystem') && runtime.includes('this.registry.register("coreEngineSystem", this.coreEngineSystem)'), "single Core engine owner not mounted before embodiment/growth");

for (const token of [
  'const FUNCTIONS = ["pulse", "absorb", "stabilize"]',
  'const ARCHITECTURE_ORDER = [3, 6, 12]',
  'one_phase_per_function',
  'paired_counterpart_phases_per_function',
  'four_phase_resolution_per_function',
  'rpmMin: 3000',
  'rpmMax: 10000',
  'literalMechanicalRpm: false',
  'nonTriadicArchitectureEnabled: false',
  'geometryViolationEnabled: false',
  'gameplayAuthority: false',
  'progressionAuthority: false'
]) must(engine.includes(token), `engine law missing ${token}`);

must(engine.includes('phaseFunction(index)') && engine.includes('index % FUNCTIONS.length'), "phase ownership must always resolve to one of three functions");
must(engine.includes('architectureDebugCycleCommand: "O"') && input.includes('event.code === "KeyO"'), "debug 3/6/12 architecture cycling missing");
must(embodiment.includes('createCoreEngineVisual') && embodiment.includes('core_engine_triadic_phase_root') && embodiment.includes('phaseIndex < 12'), "12-node triadic visual capacity missing");
must(audio.includes('handleCoreEngine') && audio.includes('core_engine_phase') && audio.includes('core_engine_cycle'), "engine cadence audio reader missing");
must(hud.includes('engine ${coreEngine.architectureLabel') && hud.includes('coreEngineRpm'), "Core engine inspection telemetry missing from HUD");
must(recipe.includes('HC-027B requires the read-only triadic 3→6→12 Core engine foundation'), "RecipeDataSystem engine contract missing");

const b = profile.behavior ?? {};
must(b.triadicCoreEngineEnabled === true && b.triadicCoreEngineOwner === "CoreEngineSystem", "profile engine owner mismatch");
must(JSON.stringify(b.triadicCoreEngineArchitectures) === JSON.stringify([3,6,12]), "profile architectures must be exactly 3/6/12");
must(JSON.stringify(b.triadicCoreEngineFunctions) === JSON.stringify(["pulse","absorb","stabilize"]), "profile functions mismatch");
must(b.triadicCoreEngineDefaultPhaseCount === 3, "3-phase must remain the default proof architecture");
must(b.triadicCoreEngineRpmMin === 3000 && b.triadicCoreEngineRpmMax === 10000, "RPM marker range mismatch");
must(b.triadicCoreEngineRpmDrivesGameplay === false && b.triadicCoreEngineArchitectureDrivesGameplay === false, "HC027B engine may not drive gameplay yet");
must(b.triadicCoreEnginePowerEnduranceConsequencesEnabled === false, "power/endurance consequence belongs to HC027C, not HC027B");
must(b.triadicCoreEngineNonTriadicGeometryEnabled === false && b.triadicCoreEngineGeometryViolationEnabled === false, "non-triadic/violation geometry must remain deferred");

must(contract.owner === "CoreEngineSystem", "contract owner mismatch");
must(contract.architectures.map((entry) => entry.phaseCount).join(",") === "3,6,12", "contract architecture lineage mismatch");
must(contract.locked?.powerEnduranceGameplayConsequences === false && contract.locked?.functionalRooting === false && contract.locked?.plasticity === false, "future milestone boundaries weakened");
must(contract.locked?.primeNumberGeometry === false && contract.locked?.geometryViolation === false, "geometry violation must remain deferred until canonical grammar is learned");

const sourceFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.isFile() && file.endsWith(".js")) sourceFiles.push(file);
  }
};
walk("src");
must(sourceFiles.length === 90 || ((successorHC027C || successorHC027C1) && sourceFiles.length === 91) || ((successorHC027D || successorHC027D1 || successorHC027E) && sourceFiles.length === 92), `expected HC027B 90, HC027C/C1 91, or HC027D 92 modules, found ${sourceFiles.length}`);

console.log("[HC027B] canonical Pulse/Absorb/Stabilize triadic physiology PASS");
console.log("[HC027B] 3 -> 6 -> 12 firing resolution / 3000-10000 Core RPM marker PASS");
console.log("[HC027B] visible + audio cadence readers / no gameplay consequences yet PASS");
console.log("[HC027B] non-triadic and geometry-violation structures remain deferred PASS");
