import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const must = (condition, message) => { if (!condition) throw new Error(`[HC027K] ${message}`); };
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));

const pkg = json("package.json");
const main = read("src/main.js");
const signal = read("src/fields/SignalPlainEcologySystem.js");
const ambient = read("src/world/AmbientMaterialInteractionSystem.js");
const composition = read("src/presentation/InteractionCompositionSystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");
const sensory = read("src/player/CoreSensoryResponseSystem.js");
const radial = read("src/player/CoreRadialPerformanceSystem.js");
const engine = read("src/player/CoreEngineSystem.js");
const identity = json("public/data/build/currentBuildIdentity_HC027K.json");
const contract = json("public/data/build/hc027kConsequenceCreatesNextQuestionContract.json");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];

must(main.includes('buildId: "HC-027K"') || main.includes('buildId: "HC-027K1"') || main.includes('buildId: "HC-027L"') || main.includes('buildId: "HC-027L1"') || main.includes('buildId: "HC-028A"') || main.includes('buildId: "HC-028A1"'), "runtime identity missing");
must(main.includes('buildLabel: "Consequence Creates Next Question"') || main.includes('buildLabel: "Playtest Input Instrumentation + Hot Button Reference"') || main.includes('buildLabel: "First 8-Minute Rhythm Lock"') || main.includes('buildLabel: "Rhythm Compression & Grammar Reinforcement"') || main.includes('buildLabel: "Structured Session Telemetry Foundation"') || main.includes('buildLabel: "Telemetry Calibration + Confusion Detection"'), "runtime label missing");
must(["0.27.15", "0.27.16", "0.27.17", "0.27.18", "0.27.19", "0.28.0", "0.28.1"].includes(pkg.version), "package version mismatch");
must(identity.id === "HC-027K" && identity.parent === "HC-027J2", "identity/parent mismatch");
must(identity.sourceJsCount === 92 && identity.newSourceModules === 0, "source-module lock mismatch");
must(contract.law === "persistent_local_consequence_physically_couples_into_another_existing_condition_and_creates_information_without_route_authority", "K law mismatch");
must(contract.relationships.length === 3, "expected three consequence relationships");

for (const token of [
  'id: "afterflow_exposes_phase_slip"',
  'id: "cadence_entrains_slow_breath"',
  'id: "coherence_reveals_resonant_gap"',
  'buildConsequenceNextQuestionLinks(player)',
  'multipleLinksMayCoexist: true',
  'targetBehaviorChangesInsteadOfMarker: true',
  'createsObjective: false',
  'createsWaypoint: false',
  'createsRouteLine: false',
  'prescribesCorrectOrder: false',
  'changesProgression: false',
  'changesRoute: false'
]) must(signal.includes(token), `Signal Plain K contract missing: ${token}`);

for (const token of [
  'signalPlainNextQuestion',
  'signalPlainLinkSource',
  'signalPlainLinkTarget',
  'signalPlainLinkAxis',
  'braided_afterflow_breaks_at_slip',
  'resonance_entrains_breathing_volume',
  'coherence_band_exposes_resonant_gap',
  'broadRelationshipVolumeNotRouteLine: true',
  'signalPlainNextQuestionUsesExistingMotes: true',
  'signalPlainNextQuestionAddsGeometry: false',
  'signalPlainNextQuestionAddsDrawCalls: false'
]) must(ambient.includes(token), `existing Host-mote relationship integration missing: ${token}`);

for (const token of [
  'const nextQuestionActive = Boolean(signalPlainNextQuestion.active && nextQuestionPrimary?.active)',
  '? "linked_host_condition"',
  '? "source_consequence_relationship"',
  'consequenceNextQuestionActive: nextQuestionActive',
  'changed_host_condition_yields_attention_to_related_existing_condition',
  'createsWaypoint: false',
  'createsObjective: false'
]) must(composition.includes(token), `visual hierarchy handoff missing: ${token}`);

for (const token of [
  'handleSignalPlainConsequenceNextQuestion(frameState)',
  'playSignalPlainNextQuestionSignature(link)',
  'signal_plain_next_question:',
  'signalPlainConsequenceNextQuestionAudioEnabled: true',
  'signalPlainConsequenceNextQuestionUsesLockedReferenceMix: true',
  'signalPlainConsequenceNextQuestionAddsMusicLayer: false'
]) must(audio.includes(token), `target-side audio reply missing: ${token}`);

for (const token of [
  'signalPlainNextQuestionActive',
  'signalPlainNextQuestionPrimary',
  'signalPlainNextQuestionLinks',
  'The changed Host condition is now affecting another local rhythm.'
]) must(hud.includes(token), `debug telemetry missing: ${token}`);

// Foundation locks: K creates relationships; it does not rebalance the verbs or engine.
must(sensory.includes('const localActionableRange = 4.25'), "quick/local Pulse radius changed");
for (const token of ['pass: "HC-027J2"', 'physiologyProfilesAreContinuousBlends: true', 'arbitraryZoneBuffTableAdded: false']) {
  must(radial.includes(token), `J2 radial physiology lock missing: ${token}`);
}
must(engine.includes('const ARCHITECTURE_ORDER = [3, 6, 12]'), "3→6→12 engine grammar changed");
must(engine.includes('nonTriadicArchitectureEnabled: false'), "non-triadic architecture enabled");
for (const token of ['masterGain: 0.82', 'core: 1.85', 'verbs: 2.15', 'world: 1.95', 'ambience: 1.35', 'event: 1.40']) {
  must(audio.includes(token), `HC027D1 audio reference drifted: ${token}`);
}

must(profile.build === "HC-027K", "inspection profile build mismatch");
must(profile.status === "runtime_active_core_inspection_plus_consequence_next_question", "inspection profile status mismatch");
must(profile.framing?.consequenceNextQuestionPass === "HC-027K", "profile K framing missing");
must(profile.behavior?.signalPlainConsequenceCreatesNextQuestion === true, "profile next-question behavior missing");
must(profile.behavior?.signalPlainNextQuestionPrescribesCorrectOrder === false, "profile prescribes an order");
must(profile.behavior?.signalPlainNextQuestionCreatesWaypoint === false, "profile creates waypoint");
must(profile.behavior?.signalPlainNextQuestionChangesProgression === false, "profile changes progression");
must(contract.authority.createsObjective === false && contract.authority.createsWaypoint === false && contract.authority.createsRouteLine === false, "authority drifted");
must(contract.locks.quickPulseLocalActionableRange === 4.25, "quick Pulse contract drifted");
must(contract.locks.verbPhysiologyChanged === false && contract.locks.engineArchitectureChanged === false, "locked foundations drifted");

const sourceFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith(".js")) sourceFiles.push(full);
  }
};
walk(path.join(root, "src"));
must(sourceFiles.length === ((main.includes('buildId: "HC-028A"') || main.includes('buildId: "HC-028A1"')) ? 93 : 92), `unexpected source module count ${sourceFiles.length}`);

console.log("PASS HC027K Consequence Creates Next Question");
console.log("  three existing consequence→condition relationships; latest successful relationship gets primary hierarchy");
console.log("  existing Host motes express the relationship volume; no waypoint/route line/objective/progression authority");
console.log("  J2 physiology, 4.25 quick Pulse, HC027D1 mix, and 3→6→12 remain locked");
