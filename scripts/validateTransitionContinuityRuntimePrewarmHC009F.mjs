import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { SystemRegistry } from "../src/core/SystemRegistry.js";
import { FirstSliceTransitionCoordinator } from "../src/core/FirstSliceTransitionCoordinator.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (relativePath) => JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const readText = (relativePath) => readFileSync(join(root, relativePath), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateTransitionContinuityRuntimePrewarmHC009F] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const profile = manifest.id === "HC-014I" ? readJson("public/data/runtime/act1RuntimeProfile_HC014I.json") : manifest.id === "HC-014G" ? readJson("public/data/runtime/act1RuntimeProfile_HC014G.json") : readJson(
  manifest.id === "HC-014D"

    ? "public/data/runtime/act1RuntimeProfile_HC014D.json"

    : manifest.id === "HC-014C"

    ? "public/data/runtime/act1RuntimeProfile_HC014C.json"
    : manifest.id === "HC-014B"
    ? "public/data/runtime/act1RuntimeProfile_HC014B.json"
    : manifest.id === "HC-014A"
    ? "public/data/runtime/act1RuntimeProfile_HC014A.json"
    : manifest.id === "HC-013D"
    ? "public/data/runtime/act1RuntimeProfile_HC013D.json"
    : manifest.id === "HC-013C"
      ? "public/data/runtime/act1RuntimeProfile_HC013C.json"
      : manifest.id === "HC-013B"
    ? "public/data/runtime/act1RuntimeProfile_HC013B.json"
    : manifest.id === "HC-013A"
    ? "public/data/runtime/act1RuntimeProfile_HC013A.json"
    : manifest.id === "HC-012C"
    ? "public/data/runtime/act1RuntimeProfile_HC012C.json"
    : manifest.id === "HC-012B"
    ? "public/data/runtime/act1RuntimeProfile_HC012B.json"
    : manifest.id === "HC-012A"
    ? "public/data/runtime/act1RuntimeProfile_HC012A.json"
    : manifest.id === "HC-011B"
    ? "public/data/runtime/act1RuntimeProfile_HC011B.json"
    : manifest.id === "HC-011A1"
    ? "public/data/runtime/act1RuntimeProfile_HC011A1.json"
    : manifest.id === "HC-011A"
    ? "public/data/runtime/act1RuntimeProfile_HC011A.json"
    : manifest.id === "HC-010G"
    ? "public/data/runtime/act1RuntimeProfile_HC010G.json"
    : manifest.id === "HC-010F"
    ? "public/data/runtime/act1RuntimeProfile_HC010F.json"
    : manifest.id === "HC-010E"
    ? "public/data/runtime/act1RuntimeProfile_HC010E.json"
    : manifest.id === "HC-010D"
    ? "public/data/runtime/act1RuntimeProfile_HC010D.json"
    : manifest.id === "HC-010C"
    ? "public/data/runtime/act1RuntimeProfile_HC010C.json"
    : manifest.id === "HC-010B"
    ? "public/data/runtime/act1RuntimeProfile_HC010B.json"
    : manifest.id === "HC-010A"
    ? "public/data/runtime/act1RuntimeProfile_HC010A.json"
    : manifest.id === "HC-009G"
    ? "public/data/runtime/firstSliceRuntimeProfile_HC009G.json"
    : "public/data/runtime/firstSliceRuntimeProfile_HC009F.json"
);

assert(
  (manifest.id === "HC-009F" && manifest.version === "0.0.115")
  || (manifest.id === "HC-009G" && manifest.version === "0.0.116")
  || (manifest.id === "HC-010A" && manifest.version === "0.0.117")
  || (manifest.id === "HC-010B" && manifest.version === "0.0.118")
  || (manifest.id === "HC-010C" && manifest.version === "0.0.119")
  || (manifest.id === "HC-010D" && manifest.version === "0.0.120")
  || (manifest.id === "HC-010E" && manifest.version === "0.0.121")
  || (manifest.id === "HC-010F" && manifest.version === "0.0.122")
  || (manifest.id === "HC-010G" && manifest.version === "0.0.123")
  || (manifest.id === "HC-011A" && manifest.version === "0.0.124")
  || (manifest.id === "HC-011A1" && manifest.version === "0.0.125")
  || (manifest.id === "HC-011B" && manifest.version === "0.0.126")
  || (manifest.id === "HC-012A" && manifest.version === "0.0.127")
  || (manifest.id === "HC-012B" && manifest.version === "0.0.128")
  || (manifest.id === "HC-012C" && manifest.version === "0.0.129")
  || (manifest.id === "HC-013A" && manifest.version === "0.0.130")
  || (manifest.id === "HC-013B" && manifest.version === "0.0.131")
  || ((manifest.id === "HC-013C" && manifest.version === "0.0.132") || (manifest.id === "HC-013D" && manifest.version === "0.0.133") || (manifest.id === "HC-014A" && manifest.version === "0.0.134") || (manifest.id === "HC-014B" && manifest.version === "0.0.135") || (manifest.id === "HC-014C" && manifest.version === "0.0.136") || (manifest.id === "HC-014D" && manifest.version === "0.0.137") || (manifest.id === "HC-014E" && manifest.version === "0.0.138") || (manifest.id === "HC-014F" && manifest.version === "0.0.139") || (manifest.id === "HC-014G" && manifest.version === "0.0.140") || (manifest.id === "HC-014I" && manifest.version === "0.0.142")),
  "manifest identity mismatch"
);
assert(pkg.version === manifest.version, "package identity mismatch");
assert(
  [
    "FIRST_SLICE_RUNTIME_PROFILE_HC009F",
    "FIRST_SLICE_RUNTIME_PROFILE_HC009G",
    "ACT1_RUNTIME_PROFILE_HC010A",
    "ACT1_RUNTIME_PROFILE_HC010B",
    "ACT1_RUNTIME_PROFILE_HC010C",
    "ACT1_RUNTIME_PROFILE_HC010D",
    "ACT1_RUNTIME_PROFILE_HC010E",
    "ACT1_RUNTIME_PROFILE_HC010F",
    "ACT1_RUNTIME_PROFILE_HC010G",
    "ACT1_RUNTIME_PROFILE_HC011A",
    "ACT1_RUNTIME_PROFILE_HC011A1",
    "ACT1_RUNTIME_PROFILE_HC011B",
    "ACT1_RUNTIME_PROFILE_HC012A",
    "ACT1_RUNTIME_PROFILE_HC012B",
    "ACT1_RUNTIME_PROFILE_HC012C",
    "ACT1_RUNTIME_PROFILE_HC013A",
    "ACT1_RUNTIME_PROFILE_HC013B",
    "ACT1_RUNTIME_PROFILE_HC013C",
    "ACT1_RUNTIME_PROFILE_HC013D",
    "ACT1_RUNTIME_PROFILE_HC014A",
    "ACT1_RUNTIME_PROFILE_HC014B",
    "ACT1_RUNTIME_PROFILE_HC014C",
    "ACT1_RUNTIME_PROFILE_HC014D",
    "ACT1_RUNTIME_PROFILE_HC014E",
    "ACT1_RUNTIME_PROFILE_HC014F",
    "ACT1_RUNTIME_PROFILE_HC014G"
  ].includes(profile.id),
  "runtime profile identity mismatch"
);
assert(profile.transitionPreparation?.owner === "FirstSliceTransitionCoordinator", "transition preparation owner missing");
assert(profile.transitionPreparation?.registeredUpdater === false, "transition coordinator became a registered updater");
assert(profile.transitionPreparation?.mutatesProgression === false, "transition preparation claims progression ownership");
assert(profile.transitionPreparation?.synchronousFallback === true, "fast-player fallback missing");
assert(profile.transitionPreparation?.baseBlendRate === 0.2, "streamlined blend rate changed");
assert(profile.globalSystemIds.length === 15, "global runtime budget changed");
assert(
  profile.firstSlicePath
    .map((regionId) => profile.regions[regionId]?.activeUpdateBudget)
    .join("|") === "15|13|8",
  "first-slice mount budgets changed"
);
assert(profile.dormantCompatibilitySystemIds.length === 20, "compatibility archive size changed");

const frameState = {
  frame: 2,
  runtimeSeconds: 0.1,
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  firstSliceRuntimeMount: {
    mountSequence: 1,
    transitionOwner: "LocalCellMorphSystem",
    activeSystemIds: []
  },
  objectiveState: { id: "objective_sentinel", complete: false },
  gateState: { id: "gate_sentinel", crossable: false },
  localCellMorph: { phase: "waiting_for_seed_absorb", progress: 0, completed: false },
  secondLocalCellMorph: { phase: "waiting_for_scar_flow_stability", progress: 0, completed: false }
};

const counters = new Map();
const makeProbe = (id) => {
  const counter = { init: 0, update: 0, mount: 0 };
  counters.set(id, counter);
  return {
    init() {
      counter.init += 1;
    },
    update() {
      counter.update += 1;
    },
    onRuntimeMount() {
      counter.mount += 1;
    }
  };
};

const scene = new THREE.Scene();
const makePreparedMorph = (id) => {
  const probe = makeProbe(id);
  let preparedRoot = null;
  return {
    ...probe,
    get preparedRoot() {
      return preparedRoot;
    },
    prepareTransitionResources() {
      if (!preparedRoot) {
        preparedRoot = new THREE.Group();
        preparedRoot.name = `${id}_prepared_destination`;
        preparedRoot.visible = true;
        scene.add(preparedRoot);
      }
      return [preparedRoot];
    }
  };
};

const localMorph = makePreparedMorph("localCellMorphSystem");
const secondMorph = makePreparedMorph("secondLocalCellMorphSystem");
const registry = new SystemRegistry();
const preparedIds = profile.transitionPreparation.prepareRegionSystemIds;

for (const id of preparedIds) {
  registry.register(
    id,
    id === "secondLocalCellMorphSystem" ? secondMorph : makeProbe(id),
    {
      runtimeScope: "active_region",
      lazyInit: true,
      settleOnDeactivate: true
    }
  );
}

const coordinator = new FirstSliceTransitionCoordinator({
  registry,
  scene,
  camera: null,
  renderer: null,
  localCellMorphSystem: localMorph,
  secondLocalCellMorphSystem: secondMorph,
  frameState,
  autoSchedule: false
});

const objectiveBefore = JSON.stringify(frameState.objectiveState);
const gateBefore = JSON.stringify(frameState.gateState);
await coordinator.runAllNow();
coordinator.update(1 / 60, frameState, 0.094);

assert(frameState.activeCellId === "CELL_MEMBRANE_NURSERY_001", "prewarm changed the active cell");
assert(JSON.stringify(frameState.objectiveState) === objectiveBefore, "prewarm changed objective truth");
assert(JSON.stringify(frameState.gateState) === gateBefore, "prewarm changed gate truth");
assert(localMorph.preparedRoot && !localMorph.preparedRoot.visible, "Surface-to-Guide destination was visible before its trigger");
assert(secondMorph.preparedRoot && !secondMorph.preparedRoot.visible, "Guide-to-Hub destination was visible before its trigger");
assert(frameState.transitionContinuity.preparedJobCount === frameState.transitionContinuity.totalJobCount, "prewarm queue did not finish");
assert(frameState.transitionContinuity.surfaceToGuideReady, "Surface-to-Guide resources did not become ready");
assert(frameState.transitionContinuity.guideToHubReady, "Guide-to-Hub resources did not become ready");
if (["HC-010A", "HC-010B", "HC-010C", "HC-010D", "HC-010E", "HC-010F", "HC-010G", "HC-011A", "HC-011A1", "HC-011B", "HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)) {
  assert(frameState.transitionContinuity.hubToGraveReady, "Hub-to-Grave resources did not become ready");
}
assert(frameState.transitionContinuity.progressionMutation === false, "diagnostics claim progression mutation");
assert(frameState.transitionContinuity.frameGapCount === 1, "frame-gap diagnostic did not record a 94ms frame");
assert(!registry.list().includes("firstSliceTransitionCoordinator"), "transition coordinator entered the update registry");

for (const id of preparedIds) {
  assert(counters.get(id).init === 1, `${id} did not initialize exactly once during preparation`);
  assert(counters.get(id).update === 0, `${id} executed gameplay during dormant preparation`);
  assert(counters.get(id).mount === 0, `${id} mounted before its region became active`);
}

frameState.firstSliceRuntimeMount.activeSystemIds = ["guideThresholdGameplaySystem"];
registry.update(1 / 60, frameState);
assert(counters.get("guideThresholdGameplaySystem").init === 1, "prepared Guide system initialized twice on mount");
assert(counters.get("guideThresholdGameplaySystem").mount === 1, "prepared Guide system did not mount normally");
assert(counters.get("guideThresholdGameplaySystem").update === 1, "prepared Guide system did not execute after its authored mount");
assert(
  !frameState.runtimeExecution.executedSystemIds.includes("hubChamberFoundationSystem"),
  "prepared Hub presentation updated before the Hub mount"
);

const localMorphSource = readText("src/morph/LocalCellMorphSystem.js");
const secondMorphSource = readText("src/morph/SecondLocalCellMorphSystem.js");
const chemistrySource = readText("src/chemistry/ChemObjectSystem.js");
const bondSource = readText("src/chemistry/BondSystem.js");
const orbiterSource = readText("src/ecology/OrbiterSystem.js");
const visualSource = readText("src/visual/VisualComposer.js");
const motionSource = readText("src/visual/MotionSignatureSystem.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const coordinatorSource = readText("src/core/FirstSliceTransitionCoordinator.js");

assert(localMorphSource.includes("prepareTransitionResources()"), "first transition lacks resource preparation");
assert(localMorphSource.includes("const progressRate = 0.20"), "first earned crossing retained the old long blend");
assert(secondMorphSource.includes("prepareTransitionResources()"), "second transition lacks resource preparation");
assert(secondMorphSource.includes("this.progressRate = 0.20"), "second earned crossing retained the old long blend");
assert(chemistrySource.includes("item.root.userData.absorbed || !item.root.visible"), "hidden prepared chemistry still updates");
assert(bondSource.includes("&& candidate.root.visible"), "hidden prepared chemistry can still retain a bond target");
assert(orbiterSource.includes("&& item.root.visible"), "hidden prepared chemistry can still attract the Guide");
assert(visualSource.includes("if (!root.visible) continue;"), "hidden prepared visuals still animate");
assert(motionSource.includes("if (!root?.visible) continue;"), "motion signatures still animate hidden prepared visuals");
assert(runtimeSource.includes("this.firstSliceTransitionCoordinator?.update"), "runtime does not publish transition timing");
assert(
  coordinatorSource.includes("maySpanFrames: true") && coordinatorSource.includes("!job.maySpanFrames"),
  "asynchronous shader preparation may overwrite a legitimate cell handoff"
);

// A fast player may activate the synchronous fallback before its idle job runs.
// The later callback must never hide that already-active destination.
const fallbackScene = new THREE.Scene();
const activeFallbackRoot = new THREE.Group();
activeFallbackRoot.visible = true;
activeFallbackRoot.userData.transitionPrepared = false;
fallbackScene.add(activeFallbackRoot);
const fallbackMorph = {
  destinationPrepared: true,
  prepareTransitionResources() {
    return [activeFallbackRoot];
  }
};
const fallbackCoordinator = new FirstSliceTransitionCoordinator({
  registry: new SystemRegistry(),
  scene: fallbackScene,
  camera: null,
  renderer: null,
  localCellMorphSystem: fallbackMorph,
  secondLocalCellMorphSystem: fallbackMorph,
  frameState: {
    frame: 3,
    runtimeSeconds: 0.2,
    activeCellId: "CELL_MEMBRANE_NURSERY_001",
    firstSliceRuntimeMount: { mountSequence: 1, transitionOwner: "LocalCellMorphSystem" }
  },
  autoSchedule: false
});
await fallbackCoordinator.runNext({ didTimeout: true, timeRemaining: () => 100 });
assert(activeFallbackRoot.visible, "late idle callback hid a destination already activated by the synchronous fallback");

console.log("HC-009F Transition Continuity + Runtime Prewarm validation passed.");
