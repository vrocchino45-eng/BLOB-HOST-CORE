import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const must = (condition, message) => { if (!condition) throw new Error(`[HC027I] ${message}`); };
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));

const pkg = json("package.json");
const main = read("src/main.js");
const signal = read("src/fields/SignalPlainEcologySystem.js");
const guide = read("src/guide/GuidePromptSystem.js");
const sensory = read("src/player/CoreSensoryResponseSystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const engine = read("src/player/CoreEngineSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity = json("public/data/build/currentBuildIdentity_HC027I.json");
const contract = json("public/data/build/hc027iEmbodiedVerbAffordanceContract.json");
const successorHC027J = (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"'));
const successorHC027J1 = main.includes('buildId: "HC-027J1"');

must(main.includes('buildId: "HC-027I"') || successorHC027J, "runtime identity missing");
must(pkg.version === "0.27.11" || (successorHC027J && ["0.27.12", "0.27.13"].includes(pkg.version)), "package version mismatch");
must(identity.id === "HC-027I" && identity.parent === "HC-027H", "identity/parent mismatch");
must(identity.sourceJsCount === 92 && identity.newSourceModules === 0, "source-module lock mismatch");
must(contract.conditions.length === 3, "expected three affordance conditions");
must(contract.law === "condition_suggests_experiment_without_button_prompt_or_lock", "affordance law mismatch");

for (const token of [
  'condition: "draw_release", impliedVerb: "absorb"',
  'condition: "call_wait", impliedVerb: "pulse"',
  'condition: "phase_slip", impliedVerb: "stabilize"',
  'const affordanceRange = 3.15',
  'this.affordanceResponse = [0, 0, 0]',
  'matchingVerbMarksObserved: false',
  'matchingVerbCompletesEncounter: false',
  'wrongVerbPenalty: false',
  'createsObjective: false',
  'createsWaypoint: false',
  'createsReward: false',
  'persistentWorldChange: false',
  'impliedVerbDebugOnly',
  'filament.scale.y',
  'affordance * 0.88'
]) must(signal.includes(token), `Signal Plain affordance contract missing ${token}`);

// The player-facing condition language may describe behavior but never names a required verb/button.
for (const token of [
  'draws inward and releases before anything can settle',
  'calls twice, then leaves a quiet gap as if waiting for an answer',
  'layers keep sliding out of phase and cannot hold alignment'
]) must(guide.includes(token), `embodied condition language missing ${token}`);
for (const forbidden of [
  'Use Absorb on this rhythm', 'Use Pulse on this rhythm', 'Use Stabilize on this rhythm',
  'Press RT on this rhythm', 'Press X on this rhythm', 'Hold LT on this rhythm'
]) must(!guide.includes(forbidden), `directive affordance wording leaked: ${forbidden}`);

// HC027H choice architecture remains present.
for (const token of [
  'slow_breath', 'paired_chirp', 'shear_drift',
  'multiple_embodied_questions_no_authored_correct_order',
  'authoredCorrectOrder: false', 'nearestCandidateIsAnswer: false', 'routeMarkersVisible: false',
  'marker.material.opacity = 0'
]) must(signal.includes(token), `HC027H traversal-intention lock drifted: ${token}`);

// Locked sonar/memory law remains unchanged.
for (const token of [
  'this.answerMemoryTtlSeconds = 7.2', 'this.answerMemoryMax = 4',
  'readReady: currentDistance <= 1.65', 'const maxRange = 4.25',
  'answerMemoryCreatesWaypoint: false', 'answerMemoryCreatesTarget: false'
]) must(sensory.includes(token), `locked sensory law drifted: ${token}`);

// Approved audio reference remains unchanged.
for (const token of [
  'masterGain: 0.82', 'core: 1.85', 'verbs: 2.15', 'world: 1.95',
  'ambience: 1.35', 'event: 1.40', 'pannerRefDistance: 4.2', 'pannerRolloff: 0.42',
  'mixRevision: "hc027d1_reference_dynamic_range"'
]) must(audio.includes(token), `locked audio reference drifted: ${token}`);

must(engine.includes('const ARCHITECTURE_ORDER = [3, 6, 12]'), "triadic engine grammar drifted");
must(engine.includes('nonTriadicArchitectureEnabled: false'), "non-triadic geometry accidentally enabled");
must(profile.build === "HC-027I" || (successorHC027J && ["HC-027J", "HC-027J1"].includes(profile.build)), "inspection profile build mismatch");
must(profile.status === "runtime_active_core_inspection_plus_embodied_verb_affordance" || (successorHC027J && ["runtime_active_core_inspection_plus_persistent_local_consequence", "runtime_active_core_inspection_plus_verb_hierarchy_pulse_reachability"].includes(profile.status)), "inspection profile status mismatch");
must(profile.framing?.embodiedVerbAffordancePass === "HC-027I", "profile affordance pass missing");
must(profile.framing?.signalPlainAffordanceConditionCount === 3, "profile affordance count mismatch");
must(profile.behavior?.signalPlainAffordanceNamesRequiredVerb === false, "profile falsely names required verb");
must(profile.behavior?.signalPlainAffordanceMatchingVerbCompletesEncounter === false, "profile falsely completes encounter from affordance");
must(profile.behavior?.signalPlainAffordanceCreatesPersistentWorldChange === false, "HC027I incorrectly owns persistence");

const sourceFiles=[];
const walk=(dir)=>{ for(const entry of fs.readdirSync(dir,{withFileTypes:true})){ const full=path.join(dir,entry.name); if(entry.isDirectory()) walk(full); else if(entry.isFile()&&full.endsWith('.js')) sourceFiles.push(full); } };
walk(path.join(root,"src"));
must(sourceFiles.length===92,`expected 92 source modules, found ${sourceFiles.length}`);

console.log("PASS HC027I Embodied Verb Affordance");
console.log("  draw/release -> absorb invitation (not requirement)");
console.log("  call/wait -> pulse invitation (not requirement)");
console.log("  phase-slip -> stabilize invitation (not requirement)");
console.log("  matching responses: transient / no progression / no persistence");
console.log("  HC027H choice architecture + HC027D1 audio: locked");
