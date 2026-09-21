import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const must = (condition, message) => { if (!condition) throw new Error(`[HC027J] ${message}`); };
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));

const pkg = json("package.json");
const main = read("src/main.js");
const signal = read("src/fields/SignalPlainEcologySystem.js");
const ambient = read("src/world/AmbientMaterialInteractionSystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const guide = read("src/guide/GuidePromptSystem.js");
const sensory = read("src/player/CoreSensoryResponseSystem.js");
const engine = read("src/player/CoreEngineSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity = json("public/data/build/currentBuildIdentity_HC027J.json");
const contract = json("public/data/build/hc027jPersistentLocalConsequenceContract.json");
const successorHC027J1 = main.includes('buildId: "HC-027J1"');

must((main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')), "runtime identity missing");
must(pkg.version === "0.27.12" || (successorHC027J1 && pkg.version === "0.27.13"), "package version mismatch");
must(identity.id === "HC-027J" && identity.parent === "HC-027I", "identity/parent mismatch");
must(identity.sourceJsCount === 92 && identity.newSourceModules === 0, "source-module lock mismatch");
must(contract.law === "successful_local_experiment_leaves_bounded_physical_aftermath_without_progression_authority", "consequence law mismatch");
must(contract.consequences.length === 3, "expected three local consequences");

for (const token of [
  'id: "redistributed_flow", condition: "draw_release", sourceVerb: "absorb", durationSeconds: 30',
  'id: "coherent_answer_cadence", condition: "call_wait", sourceVerb: "pulse", durationSeconds: 36',
  'id: "held_phase_coherence", condition: "phase_slip", sourceVerb: "stabilize", durationSeconds: 34',
  'activateLocalConsequence(index, frameState)',
  'this.localConsequenceRearmRequired = [false, false, false]',
  'state.remainingSeconds = Math.max(0, state.remainingSeconds - dt)',
  'this.affordanceResponse[0] >= 0.78',
  'this.activateLocalConsequence(1, frameState)',
  'this.affordanceResponse[2] >= 0.78',
  'persistentLocalConsequence: {',
  'minimumDurationSeconds: 30',
  'maximumDurationSeconds: 36',
  'matchingExperimentMarksObserved: false',
  'matchingExperimentCompletesEncounter: false',
  'changesProgression: false',
  'nextQuestionAuthority: false'
]) must(signal.includes(token), `Signal Plain persistent consequence contract missing ${token}`);

for (const token of [
  'signalPlainConsequencePosition',
  'directional_afterflow',
  'sustained_resonant_cadence',
  'locally_synchronized_stillness',
  'usesExistingHostMotes: true',
  'addsGeometry: false',
  'addsDrawCalls: false',
  'changesMovement: false',
  'changesCollision: false'
]) must(ambient.includes(token), `existing Host-mote consequence integration missing ${token}`);

for (const token of [
  'handleSignalPlainLocalConsequence(frameState)',
  'playSignalPlainConsequenceSignature(state, sustained = false)',
  'signal_plain_local_consequence:',
  'signalPlainPersistentLocalConsequenceAudioEnabled: true',
  'signalPlainPersistentLocalConsequenceUsesLockedReferenceMix: true'
]) must(audio.includes(token), `persistent consequence audio missing ${token}`);

// HC027D1 mix values stay exactly at the approved reference.
for (const token of [
  'masterGain: 0.82', 'core: 1.85', 'verbs: 2.15', 'world: 1.95',
  'ambience: 1.35', 'event: 1.40', 'pannerRefDistance: 4.2', 'pannerRolloff: 0.42',
  'mixRevision: "hc027d1_reference_dynamic_range"'
]) must(audio.includes(token), `locked audio reference drifted: ${token}`);

// Guide may acknowledge that a change is holding, but it still may not expose the debug verb mapping.
for (const token of [
  'That local draw is no longer snapping back; the flow is still carrying the change.',
  'That call is still answering in a coherent cadence.',
  'Those layers are still holding together instead of slipping apart.'
]) must(guide.includes(token), `non-prescriptive consequence language missing ${token}`);
for (const forbidden of [
  'Use Absorb to persist', 'Use Pulse to persist', 'Use Stabilize to persist',
  'Objective complete', 'Receptor stabilized +', 'Reward:'
]) must(!guide.includes(forbidden), `directive/reward consequence wording leaked: ${forbidden}`);

// HC027I/H and lower-level locks remain present.
for (const token of [
  'matchingVerbMarksObserved: false', 'matchingVerbCompletesEncounter: false',
  'wrongVerbPenalty: false', 'createsObjective: false', 'createsWaypoint: false', 'createsReward: false',
  'multiple_embodied_questions_no_authored_correct_order', 'authoredCorrectOrder: false', 'nearestCandidateIsAnswer: false'
]) must(signal.includes(token), `affordance/intention lock drifted: ${token}`);
for (const token of [
  'this.answerMemoryTtlSeconds = 7.2', 'this.answerMemoryMax = 4', 'const maxRange = 4.25'
]) must(sensory.includes(token), `locked sensory law drifted: ${token}`);
must(engine.includes('const ARCHITECTURE_ORDER = [3, 6, 12]'), "triadic engine grammar drifted");
must(engine.includes('nonTriadicArchitectureEnabled: false'), "non-triadic geometry accidentally enabled");

must(profile.build === "HC-027J" || (successorHC027J1 && profile.build === "HC-027J1"), "inspection profile build mismatch");
must(profile.status === "runtime_active_core_inspection_plus_persistent_local_consequence" || (successorHC027J1 && profile.status === "runtime_active_core_inspection_plus_verb_hierarchy_pulse_reachability"), "inspection profile status mismatch");
must(profile.framing?.persistentLocalConsequencePass === "HC-027J", "profile consequence pass missing");
must(profile.framing?.signalPlainLocalConsequenceDurationSeconds?.min === 30, "profile min consequence duration mismatch");
must(profile.framing?.signalPlainLocalConsequenceDurationSeconds?.max === 36, "profile max consequence duration mismatch");
must(profile.behavior?.signalPlainPersistentLocalConsequenceMarksObserved === false, "profile incorrectly marks observed");
must(profile.behavior?.signalPlainPersistentLocalConsequenceCompletesEncounter === false, "profile incorrectly completes encounter");
must(profile.behavior?.signalPlainPersistentLocalConsequenceChangesProgression === false, "profile incorrectly changes progression");
must(profile.behavior?.signalPlainPersistentLocalConsequenceCreatesNextQuestion === false, "HC027J incorrectly owns HC027K next-question chaining");

const sourceFiles=[];
const walk=(dir)=>{ for(const entry of fs.readdirSync(dir,{withFileTypes:true})){ const full=path.join(dir,entry.name); if(entry.isDirectory()) walk(full); else if(entry.isFile()&&full.endsWith('.js')) sourceFiles.push(full); } };
walk(path.join(root,"src"));
must(sourceFiles.length===92,`expected 92 source modules, found ${sourceFiles.length}`);

console.log("PASS HC027J Persistent Local Consequence");
console.log("  absorb -> redistributed flow / 30 s");
console.log("  pulse -> coherent answer cadence / 36 s");
console.log("  stabilize -> held phase coherence / 34 s");
console.log("  existing Host motes + locked HC027D1 mix / no new geometry");
console.log("  no read/completion/reward/route/progression/next-question authority");
