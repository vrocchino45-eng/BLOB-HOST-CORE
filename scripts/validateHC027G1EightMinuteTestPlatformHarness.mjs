import fs from "node:fs";
import path from "node:path";
import { DebugAreaJumpSystem } from "../src/debug/DebugAreaJumpSystem.js";

const root = process.cwd();
const must = (condition, message) => { if (!condition) throw new Error(`[HC027G1] ${message}`); };
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));

const pkg = json("package.json");
const main = read("src/main.js");
const input = read("src/input/InputSystem.js");
const jumpSource = read("src/debug/DebugAreaJumpSystem.js");
const sensory = read("src/player/CoreSensoryResponseSystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");
const signalPlain = read("src/fields/SignalPlainEcologySystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const engine = read("src/player/CoreEngineSystem.js");
const identity = json("public/data/build/currentBuildIdentity_HC027G1.json");
const contract = json("public/data/build/hc027g1EightMinuteTestPlatformHarnessContract.json");

must(main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))), "runtime identity missing");
must(["0.27.9", "0.27.10", "0.27.11", "0.27.12", "0.27.13"].includes(pkg.version), "package version mismatch");
must(identity.id === "HC-027G1" && identity.parent === "HC-027G", "identity/parent mismatch");
must(identity.sourceJsCount === 92 && identity.newSourceModules === 0, "source-module lock mismatch");
must(contract.platforms.length === 8, "expected eight test platforms");
must(contract.suggestedTotalSeconds === 480 && contract.automaticAdvance === false, "eight-minute/manual-advance contract mismatch");

for (const token of [
  "debugTestPlatformSlot",
  "event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey",
  "/^Digit[1-8]$/",
  "this.queued.debugTestPlatformSlot = Number(event.code.slice(-1))"
]) must(input.includes(token), `InputSystem shortcut missing ${token}`);

for (const platform of contract.platforms) {
  must(jumpSource.includes(`slot: ${platform.slot}`), `platform slot ${platform.slot} missing`);
  must(jumpSource.includes(platform.label), `platform label missing ${platform.label}`);
  must(jumpSource.includes(platform.cellId), `platform cell missing ${platform.cellId}`);
}

must(jumpSource.includes('key: `Shift+${slot}`'), "platform shortcut template missing");

for (const token of [
  "suggestedSeconds: 60",
  "progressionMutated: false",
  "objectiveMutated: false",
  "routeHistoryMutated: false",
  "gatesMutated: false",
  "automaticAdvance: false",
  "browserTabShortcutCollisionAvoided: true",
  "this.inspectionCameraSystem?.release?",
  "this.coreSensoryResponseSystem?.clearDebugTestState?",
  "this.playerMovementController?.velocity?.set?",
  "this.playerMovementController?.fluidSlip?.set?"
]) must(jumpSource.includes(token), `test-platform hygiene missing ${token}`);

must(sensory.includes("clearDebugTestState()"), "transient sonar reset method missing");
must(sensory.includes("this.answerMemory = []"), "sonar memory clear missing");
must(hud.includes("TEST ${testPlatform.slot"), "five-second test-platform HUD toast missing");
must(signalPlain.includes('source: directJump.source ?? "Ctrl+Shift+8"'), "Signal Plain debug source handoff missing");

// Runtime-shaped proof: Shift+5 platform should set the intended existing cell,
// canonical position, clean momentum/camera/sonar state and seed debug anatomy.
const playerRoot = { position: { x: 9, y: 8, z: 7, set(x, y, z) { this.x = x; this.y = y; this.z = z; } } };
const velocity = { cleared: false, set() { this.cleared = true; } };
const fluidSlip = { cleared: false, set() { this.cleared = true; } };
const flowVelocity = { cleared: false, set() { this.cleared = true; } };
const camera = { releaseCount: 0, release() { this.releaseCount += 1; } };
const sensoryStub = { clearCount: 0, clearDebugTestState() { this.clearCount += 1; } };
const growth = { seedCount: 0, seedCoreWorkRetainedAnatomyForDebug() { this.seedCount += 1; return { seeded: true, seedCount: 3 }; } };
const system = new DebugAreaJumpSystem({
  playerMovementController: { playerRoot, velocity, fluidSlip, flowVelocity },
  inspectionCameraSystem: camera,
  coreGrowthSystem: growth,
  coreSensoryResponseSystem: sensoryStub,
  playerRoot
});
const frameState = {
  frame: 44,
  runtimeSeconds: 125.5,
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  input: { debugTestPlatformSlot: 5 }
};
system.update(0.016, frameState);
must(frameState.activeCellId === "CELL_VASCULAR_RHYTHM_ROUTE_001", "platform 5 destination mismatch");
must(playerRoot.position.x === 0 && playerRoot.position.y === 0 && playerRoot.position.z === 0, "canonical platform position not applied");
must(velocity.cleared && fluidSlip.cleared && flowVelocity.cleared, "momentum was not fully cleared");
must(camera.releaseCount === 1 && sensoryStub.clearCount === 1, "camera/sonar test hygiene missing");
must(growth.seedCount === 1 && frameState.debugTestPlatform.anatomySeeded === true, "platform 5 anatomy seed missing");
must(frameState.debugTestPlatform.progressionMutated === false, "platform mutated progression telemetry");
must(frameState.debugTestPlatform.suggestedSeconds === 60 && frameState.debugTestPlatform.nextShortcut === "Shift+6", "platform timing/next shortcut mismatch");

// Slot 8 must reset only the local Signal Plain test encounter.
frameState.frame = 45;
frameState.runtimeSeconds = 186;
frameState.input = { debugTestPlatformSlot: 8 };
system.update(0.016, frameState);
must(frameState.activeCellId === "CELL_APERTURE_FIELDS_ARRIVAL_001", "platform 8 destination mismatch");
must(frameState.debugSignalPlainJumpRequest?.pending === true, "platform 8 did not stage Signal Plain direct jump");
must(frameState.debugSignalPlainJumpRequest?.resetEncounter === true, "platform 8 did not request local reset");
must(frameState.debugSignalPlainJumpRequest?.source === "Shift+8", "platform 8 source mismatch");

// Locked HC027D1 audio reference and HC027B engine grammar remain unchanged.
for (const token of [
  "masterGain: 0.82", "core: 1.85", "verbs: 2.15", "world: 1.95",
  "ambience: 1.35", "event: 1.40", "pannerRefDistance: 4.2", "pannerRolloff: 0.42",
  'mixRevision: "hc027d1_reference_dynamic_range"'
]) must(audio.includes(token), `locked audio reference drifted: ${token}`);
must(engine.includes("const ARCHITECTURE_ORDER = [3, 6, 12]"), "triadic engine grammar drifted");
must(engine.includes("nonTriadicArchitectureEnabled: false"), "non-triadic geometry accidentally enabled");

const sourceFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith(".js")) sourceFiles.push(full);
  }
};
walk(path.join(root, "src"));
must(sourceFiles.length === 92, `expected 92 source modules, found ${sourceFiles.length}`);

console.log("PASS HC027G1 Eight-Minute Test Platform Harness");
console.log("  Shift+1..8: deterministic manual platform shortcuts");
console.log("  8 x ~60 sec suggested windows / 480 sec total");
console.log("  progression/objectives/routes/gates: unchanged");
console.log("  HC027G material grammar + HC027D1 audio reference: locked");
