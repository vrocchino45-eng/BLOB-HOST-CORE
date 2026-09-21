import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const must = (condition, message) => { if (!condition) throw new Error(`[HC027H] ${message}`); };
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));

const pkg = json("package.json");
const main = read("src/main.js");
const signal = read("src/fields/SignalPlainEcologySystem.js");
const guide = read("src/guide/GuidePromptSystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");
const sensory = read("src/player/CoreSensoryResponseSystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const engine = read("src/player/CoreEngineSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity = json("public/data/build/currentBuildIdentity_HC027H.json");
const successorIdentity = fs.existsSync(path.join(root, "public/data/build/currentBuildIdentity_HC027I.json")) ? json("public/data/build/currentBuildIdentity_HC027I.json") : null;
const hc027jIdentity = fs.existsSync(path.join(root, "public/data/build/currentBuildIdentity_HC027J.json")) ? json("public/data/build/currentBuildIdentity_HC027J.json") : null;
const contract = json("public/data/build/hc027hTraversalIntentionArchitectureContract.json");

const isHC027I = main.includes('buildId: "HC-027I"');
const isHC027J = main.includes('buildId: "HC-027J"');
const isHC027J1 = main.includes('buildId: "HC-027J1"');
must(main.includes('buildId: "HC-027H"') || isHC027I || isHC027J || isHC027J1, "runtime identity missing");
must(pkg.version === (isHC027J1 ? "0.27.13" : isHC027J ? "0.27.12" : isHC027I ? "0.27.11" : "0.27.10"), "package version mismatch");
if (isHC027I) must(successorIdentity?.parent === "HC-027H", "HC027I successor parent mismatch");
if (isHC027J || isHC027J1) must(hc027jIdentity?.parent === "HC-027I", "HC027J successor parent mismatch");
must(identity.id === "HC-027H" && identity.parent === "HC-027G1", "identity/parent mismatch");
must(identity.sourceJsCount === 92 && identity.newSourceModules === 0, "source-module lock mismatch");
must(contract.candidates.length === 3, "expected three simultaneous candidate questions");
must(contract.presentation.allUnreadReadableTogether === true, "simultaneous readability contract missing");
must(contract.presentation.nearestFirstRouteMarkersVisible === false, "nearest-first markers not retired");

for (const token of [
  'slow_breath', 'paired_chirp', 'shear_drift',
  'multiple_embodied_questions_no_authored_correct_order',
  'playerFacingMarker: false', 'objectiveAuthority: false', 'progressionAuthority: false',
  'authoredCorrectOrder: false', 'nearestCandidateIsAnswer: false', 'routeMarkersVisible: false',
  'createsTarget: false', 'createsObjective: false', 'createsReward: false',
  'marker.material.opacity = 0', 'nearestFirstPresentationRetired: true'
]) must(signal.includes(token), `Signal Plain intention law missing ${token}`);

must(!signal.includes('nearest_unread_pulsing'), "old nearest-unread visual-state telemetry remains active");

must(!guide.includes('objectiveLine: ecology.completed\n        ? "Explore the changed field."\n        : ecology.ready\n          ? "Pulse."'), "old directive Signal Plain prompt remains active");
for (const token of [
  'Three local rhythms are holding different patterns.',
  'No order is prescribed.',
  'Listen to the differences.'
]) must(guide.includes(token), `non-prescriptive Guide language missing ${token}`);

for (const token of [
  'No receptor is prescribed; investigate whichever catches your attention.',
  'Compare, ignore, or approach another rhythm in any order.'
]) must(hud.includes(token), `non-prescriptive HUD language missing ${token}`);

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
must(profile.build === (isHC027J1 ? "HC-027J1" : isHC027J ? "HC-027J" : isHC027I ? "HC-027I" : "HC-027H"), "inspection profile build mismatch");
must(profile.status === (isHC027J1 ? "runtime_active_core_inspection_plus_verb_hierarchy_pulse_reachability" : isHC027J ? "runtime_active_core_inspection_plus_persistent_local_consequence" : isHC027I ? "runtime_active_core_inspection_plus_embodied_verb_affordance" : "runtime_active_core_inspection_plus_traversal_intention_architecture"), "inspection profile status mismatch");
must(profile.framing?.traversalIntentionPass === "HC-027H", "profile traversal intention pass missing");
must(profile.framing?.signalPlainSimultaneousQuestionCount === 3, "profile question count mismatch");
must(profile.behavior?.signalPlainTraversalIntentionCreatesWaypoints === false, "profile falsely creates waypoints");
must(profile.behavior?.signalPlainTraversalIntentionCreatesObjectives === false, "profile falsely creates objectives");
must(profile.behavior?.signalPlainTraversalIntentionPrescribesCorrectOrder === false, "profile falsely prescribes order");

const sourceFiles=[];
const walk=(dir)=>{ for(const entry of fs.readdirSync(dir,{withFileTypes:true})){ const full=path.join(dir,entry.name); if(entry.isDirectory()) walk(full); else if(entry.isFile()&&full.endsWith('.js')) sourceFiles.push(full); } };
walk(path.join(root,"src"));
must(sourceFiles.length===92,`expected 92 source modules, found ${sourceFiles.length}`);

console.log("PASS HC027H Traversal Intention Architecture");
console.log("  pilot: Signal Plain / Shift+8");
console.log("  three existing receptors: simultaneous embodied questions");
console.log("  nearest-first route markers: retired from presentation");
console.log("  targets/objectives/rewards/progression: unchanged");
console.log("  HC027D1 audio + HC027D/F/G sensory stack: locked");
