import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const must = (condition, message) => { if (!condition) throw new Error(`[HC027K1] ${message}`); };
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));

const pkg = json("package.json");
const main = read("src/main.js");
const input = read("src/input/InputSystem.js");
const debugOverlay = read("src/debug/RecipeDebugOverlay.js");
const statusPage = read("src/ui/StatusPageSystem.js");
const debugJump = read("src/debug/DebugAreaJumpSystem.js");
const sensory = read("src/player/CoreSensoryResponseSystem.js");
const radial = read("src/player/CoreRadialPerformanceSystem.js");
const engine = read("src/player/CoreEngineSystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const signal = read("src/fields/SignalPlainEcologySystem.js");
const identity = json("public/data/build/currentBuildIdentity_HC027K1.json");
const contract = json("public/data/build/hc027k1PlaytestInputInstrumentationContract.json");
const kContract = json("public/data/build/hc027kConsequenceCreatesNextQuestionContract.json");

must(main.includes('buildId: "HC-027K1"'), "runtime identity missing");
must(main.includes('buildLabel: "Playtest Input Instrumentation + Hot Button Reference"'), "runtime label missing");
must(["0.27.16", "0.27.17"].includes(pkg.version), "package version mismatch");
must(identity.id === "HC-027K1" && identity.parent === "HC-027K", "identity/parent mismatch");
must(identity.sourceJsCount === 92 && identity.newSourceModules === 0, "source-module lock mismatch");
must(contract.law === "playtest_instrumentation_observes_physical_input_and_interpreted_actions_without_mutating_gameplay", "instrumentation law mismatch");

for (const token of [
  "inputTelemetryHistory",
  "buildInputTelemetry({",
  'pass: "HC-027K1"',
  "activePhysical:",
  "activeActions,",
  "recentEvents,",
  "PULSE RELEASE",
  "ABSORB HELD",
  "STABILIZE HELD",
  "keyboardEventLabel(event)",
  "PAD RT",
  "PAD LT"
]) must(input.includes(token), `InputSystem telemetry missing: ${token}`);

for (const token of [
  'this.inputEl.id = "playtest-input-telemetry-overlay"',
  '"INPUT LIVE // PLAYTEST TRACE"',
  '"Hot-button reference: Status Page → Controls"',
  "telemetry.activePhysical",
  "telemetry.activeActions"
]) must(debugOverlay.includes(token), `F1 live input HUD missing: ${token}`);

for (const token of [
  '"HOT BUTTONS // DEBUG HUD"',
  '"HOT BUTTONS // 8-MINUTE TEST"',
  '"HOT BUTTONS // DIRECT AREA JUMPS"',
  '"HOT BUTTONS // TOOLS"',
  "frameState.debugAreaJump?.hotButtons"
]) must(statusPage.includes(token), `Status > Controls hot-button reference missing: ${token}`);

for (const token of [
  "hotButtonCatalog()",
  '{ key: "F1", label: "Playtest Trace"',
  'key: `Shift+${slot}`',
  'key: `Ctrl+${slot}`',
  '{ key: "Ctrl+Shift+8"',
  '{ key: "P"',
  '{ key: "O"',
  "gameplayControlsChanged: false"
]) must(debugJump.includes(token), `debug hot-button catalog missing: ${token}`);

must(contract.statusPage.controlsTabOwnsHotButtonReference === true, "Controls tab contract missing");
must(contract.fullDebugHud.dedicatedInputPanel === true, "dedicated input panel contract missing");
must(contract.fullDebugHud.showsRecentPressReleaseEvents === true, "recent-event trace contract missing");
must(contract.authority.changesControlMap === false && contract.authority.changesGameplay === false, "instrumentation gained gameplay authority");
must(contract.authority.changesProgression === false && contract.authority.changesObjectives === false && contract.authority.changesRoutes === false, "instrumentation gained progression authority");

// HC027K and the J2/J1 foundations remain the gameplay beneath this debug-only pass.
must(kContract.law === "persistent_local_consequence_physically_couples_into_another_existing_condition_and_creates_information_without_route_authority", "HC027K contract drifted");
for (const token of [
  'id: "afterflow_exposes_phase_slip"',
  'id: "cadence_entrains_slow_breath"',
  'id: "coherence_reveals_resonant_gap"',
  'createsWaypoint: false',
  'createsObjective: false'
]) must(signal.includes(token), `HC027K relationship lock missing: ${token}`);
must(sensory.includes("const localActionableRange = 4.25"), "quick/local Pulse radius changed");
for (const token of ['pass: "HC-027J2"', "physiologyProfilesAreContinuousBlends: true", "arbitraryZoneBuffTableAdded: false"]) {
  must(radial.includes(token), `J2 physiology lock missing: ${token}`);
}
must(engine.includes("const ARCHITECTURE_ORDER = [3, 6, 12]"), "3→6→12 engine grammar changed");
for (const token of ["masterGain: 0.82", "core: 1.85", "verbs: 2.15", "world: 1.95", "ambience: 1.35", "event: 1.40"]) {
  must(audio.includes(token), `HC027D1 reference mix drifted: ${token}`);
}

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

console.log("PASS HC027K1 Playtest Input Instrumentation + Hot Button Reference");
console.log("  Status > Controls lists debug hot buttons and Shift+1..8 test platforms");
console.log("  F1 Playtest Trace shows live physical input, interpreted action, Pulse charge, triggers, and recent press/release events");
console.log("  instrumentation is read-only; HC027K/J2/J1 gameplay foundations remain locked");
