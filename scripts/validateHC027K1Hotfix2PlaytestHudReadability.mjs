import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));
const must = (condition, message) => { if (!condition) throw new Error(`[HC027K1 HOTFIX2] ${message}`); };

const display = read("src/debug/DebugDisplaySystem.js");
const overlay = read("src/debug/RecipeDebugOverlay.js");
const status = read("src/ui/StatusPageSystem.js");
const jumps = read("src/debug/DebugAreaJumpSystem.js");
const input = read("src/input/InputSystem.js");
const bond = read("src/chemistry/BondSystem.js");
const sensory = read("src/player/CoreSensoryResponseSystem.js");
const radial = read("src/player/CoreRadialPerformanceSystem.js");
const signal = read("src/fields/SignalPlainEcologySystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const engine = read("src/player/CoreEngineSystem.js");
const contract = json("public/data/build/hc027k1Hotfix2PlaytestHudReadabilityContract.json");
const identity = json("public/data/build/currentBuildIdentity_HC027K1_HOTFIX2.json");
const pkg = json("package.json");

must(["0.27.17", "0.27.18", "0.27.19", "0.28.0", "0.28.1"].includes(pkg.version), "package version mismatch");
must(identity.parent === "HC-027K1 HOTFIX1" && identity.sourceJsCount === 92, "identity/source lock mismatch");
must(contract.law === "playtest_trace_prioritizes_readable_physical_and_interpreted_input_while_deep_system_telemetry_moves_to_separate_debug_mode", "contract law mismatch");

for (const token of [
  'this.modeOrder = ["hidden", "trace", "full"]',
  'this.setMode("trace", "F1")',
  'this.setMode("full", "F2")',
  'this.setMode("hidden", "F3")',
  'F1 playtest trace / F2 system debug / F3 clean'
]) must(display.includes(token), `debug mode hierarchy missing: ${token}`);

must(overlay.includes('PLAYTEST TRACE // HC027L') || overlay.includes('PLAYTEST TRACE // HC028A'), "playtest trace successor header missing");
for (const token of [
  'mode === "trace"',
  'this.traceText()',
  'this.renderInputTelemetry()',
  '"INPUT LIVE // PLAYTEST TRACE"',
  'this.traceActionHoldSeconds = 3.0',
  'this.lastTraceActionText',
  'PHYSICAL  ',
  'ACTION    ',
  'RECENT INPUT'
]) must(overlay.includes(token), `playtest trace presentation missing: ${token}`);

must(overlay.includes('const showInputTrace = mode === "trace"'), "large input panel is not isolated to F1 trace");
must(!overlay.includes('const showInputTrace = mode === "full"'), "F2 full debug still forces large input panel");
for (const token of ['label: "Playtest Trace"', 'label: "System Debug"', 'label: "Clean Play"']) must(jumps.includes(token), `hot-button catalog mismatch: ${token}`);
must(status.includes("F1 is the recording-friendly Playtest Trace"), "Status > Controls does not explain new F1/F2/F3 hierarchy");

for (const token of ['telemetryChangesGameplay: false', 'telemetryChangesControls: false']) must(input.includes(token), `InputSystem authority drift: ${token}`);
const applyStart = bond.indexOf("applyAbsorbHold(dt, nearest, bondRecipe, context)");
const applyEnd = bond.indexOf("recoverFirstSliceScar(dt, frameState)", applyStart);
const applyBody = bond.slice(applyStart, applyEnd);
must(applyBody.includes("const absorbPhysiology = frameState.corePerformance?.verbModifiers?.absorb ?? {};"), "HOTFIX1 absorb physiology scope repair regressed");
const fullStart = overlay.indexOf("fullText() {");
const fullEnd = overlay.indexOf("renderInputTelemetry()", fullStart);
must(overlay.slice(fullStart, fullEnd).includes("const frameState = this.frameState;"), "HOTFIX1 frameState alias regressed");

must(sensory.includes("const localActionableRange = 4.25"), "quick/local Pulse range changed");
must(radial.includes('pass: "HC-027J2"') && radial.includes("physiologyProfilesAreContinuousBlends: true"), "J2 physiology drifted");
must(signal.includes('id: "afterflow_exposes_phase_slip"') && signal.includes('id: "cadence_entrains_slow_breath"') && signal.includes('id: "coherence_reveals_resonant_gap"'), "K consequence links drifted");
must(engine.includes("const ARCHITECTURE_ORDER = [3, 6, 12]"), "3→6→12 engine grammar changed");
for (const token of ["masterGain: 0.82", "core: 1.85", "verbs: 2.15", "world: 1.95", "ambience: 1.35", "event: 1.40"]) must(audio.includes(token), `HC027D1 audio reference drifted: ${token}`);

const sourceFiles = [];
const walk = (dir) => { for (const e of fs.readdirSync(dir, {withFileTypes:true})) { const f=path.join(dir,e.name); if(e.isDirectory()) walk(f); else if(e.isFile() && f.endsWith(".js")) sourceFiles.push(f); } };
walk(path.join(root,"src"));
must(sourceFiles.length === (["0.28.0", "0.28.1"].includes(pkg.version) ? 93 : 92), `unexpected source JS module count ${sourceFiles.length}`);

console.log("PASS HC027K1 HOTFIX2 Playtest HUD Readability");
console.log("  F1 = recording-friendly Playtest Trace; F2 = deep System Debug; F3 = Clean Play");
console.log("  physical + interpreted actions are large/readable and last action persists 3 seconds");
console.log("  HOTFIX1 runtime repairs and HC027K/J2/J1/D1 gameplay foundations remain locked");
