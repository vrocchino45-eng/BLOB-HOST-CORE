import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));
const must = (condition, message) => { if (!condition) throw new Error(`[HC027L1] ${message}`); };
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");

const pkg = json("package.json");
const main = read("src/main.js");
const sensory = read("src/player/CoreSensoryResponseSystem.js");
const physical = read("src/player/CoreVerbPhysicalizationSystem.js");
const ambient = read("src/world/AmbientMaterialInteractionSystem.js");
const composition = read("src/presentation/InteractionCompositionSystem.js");
const vascular = read("src/routes/VascularRhythmRouteSystem.js");
const debug = read("src/debug/RecipeDebugOverlay.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const radial = read("src/player/CoreRadialPerformanceSystem.js");
const input = read("src/input/InputSystem.js");
const engine = read("src/player/CoreEngineSystem.js");
const identity = json("public/data/build/currentBuildIdentity_HC027L1.json");
const contract = json("public/data/build/hc027l1RhythmCompressionGrammarReinforcementContract.json");
const hashes = json("public/data/build/hc027l1LockedOwnerHashes.json");

must(["0.27.19", "0.28.0", "0.28.1"].includes(pkg.version), "package version mismatch");
must((main.includes('buildId: "HC-027L1"') && main.includes('buildLabel: "Rhythm Compression & Grammar Reinforcement"')) || ((main.includes('buildId: "HC-028A"') || main.includes('buildId: "HC-028A1"')) && main.includes('buildLabel: "Structured Session Telemetry Foundation"')) || (main.includes('buildId: "HC-028A1"') && main.includes('buildLabel: "Telemetry Calibration + Confusion Detection"')), "runtime identity mismatch");
must(identity.parent === "HC-027L" && identity.sourceJsCount === 92 && identity.newSourceModules === 0, "identity/source lock mismatch");
must(contract.law === "repeat_observation_increases_resolution_while_presentation_bursts_compress_and_existing_traversal_anatomy_reinforces_grammar_without_new_authority", "L1 law mismatch");

for (const token of [
  "this.sourceObservationCounts = new Map()",
  '"distant_presence"',
  '"layering_and_intervening_volume"',
  '"structural_relationship_not_immediate_target"',
  'repeatedObservationLaw: "first_presence_second_layering_third_structural_relationship"',
  'law: "repeated_observation_increases_resolution_instead_of_replaying_identical_answer"',
  'changesPulseRange: false'
]) must(sensory.includes(token), `repeat-resolution sensory law missing: ${token}`);

for (const token of [
  "resolutionStage >= 2",
  "repeat_reads_expand_structural_volume_not_target_brightness",
  "resolutionStage: Math.max(1, Math.min(3, contact.resolutionStage ?? 1))"
]) must(physical.includes(token), `repeat-resolution physicalization missing: ${token}`);

for (const token of [
  "answerResolutionStage",
  "Stage 2 introduces a tangential layer read",
  "Stage 3 settles into a slower coherent band",
  'repeatedObservationLaw: "presence_then_layering_then_structural_relationship"'
]) must(ambient.includes(token), `deep structural volume language missing: ${token}`);

for (const token of [
  "this.lastPulseConsequenceEventId = -1",
  "this.reorientationDurationSeconds = 2.8",
  "pulseEventId !== this.lastPulseConsequenceEventId",
  "4.0 + Math.max(0, resolutionStage - 1) * 0.35",
  "this.reorientationAge / this.reorientationDurationSeconds",
  "pulseReturnBurstCompressed: true",
  "semanticChangeAge",
  "semanticStagnationRisk",
  "semanticStagnationMeansMovementWithoutNewInterpretation: true"
]) must(composition.includes(token), `rhythm compression missing: ${token}`);

for (const token of [
  "updateGrammarReinforcement(frameState, sample)",
  'mode: "uncertain_current_probe"',
  'mode: "loose_draw_release"',
  'mode: "phase_strain_contraction"',
  'pass: "HC-027L1"',
  'usesExistingVesselAndMotesOnly: true',
  'changesCompletion: false',
  'changesMovement: false'
]) must(vascular.includes(token), `vascular grammar reinforcement missing: ${token}`);

must(debug.includes("PLAYTEST TRACE // HC027L1") || debug.includes("PLAYTEST TRACE // HC028A"), "F1 L1/successor trace header missing");
for (const token of [
  "nearestResolutionStage",
  "semanticStagnationRisk",
  "grammarReinforcement"
]) must(debug.includes(token), `F1 L1 telemetry missing: ${token}`);

// Locked foundations.
must(sensory.includes("const localActionableRange = 4.25"), "quick/local Pulse range changed");
for (const token of ['masterGain: 0.82', 'core: 1.85', 'verbs: 2.15', 'world: 1.95', 'ambience: 1.35', 'event: 1.40']) must(audio.includes(token), `HC027D1 mix drifted: ${token}`);
must(radial.includes('pass: "HC-027J2"') && radial.includes("physiologyProfilesAreContinuousBlends: true"), "J2 physiology drifted");
for (const token of ["telemetryChangesGameplay: false", "telemetryChangesControls: false"]) must(input.includes(token), `input authority drifted: ${token}`);
must(engine.includes("const ARCHITECTURE_ORDER = [3, 6, 12]") && engine.includes("nonTriadicArchitectureEnabled: false"), "3→6→12 engine drifted");

for (const [rel, expected] of Object.entries(hashes.lockedOwners ?? {})) {
  if (rel === "src/core/GameRuntime.js" && (main.includes('buildId: "HC-028A"') || main.includes('buildId: "HC-028A1"'))) {
    must(read(rel).includes("SessionTelemetrySystem") && read(rel).includes('registry.register("sessionTelemetrySystem"'), "HC028A GameRuntime change is not telemetry-only mount wiring");
    continue;
  }
  must(sha(rel) === expected, `locked owner changed: ${rel}`);
}
must(contract.authority.createsObjective === false && contract.authority.createsWaypoint === false && contract.authority.changesProgression === false, "L1 gained forbidden authority");

// Dynamic repeat-resolution proof: the same source becomes presence -> layering -> structural relation.
const { CoreSensoryResponseSystem } = await import(pathToFileURL(path.join(root, "src/player/CoreSensoryResponseSystem.js")));
const dummyPosition = { x:0, y:0, z:0, distanceTo(){ return 0; } };
const sensorySystem = new CoreSensoryResponseSystem({ frameState:{}, playerRoot:{position:dummyPosition}, chemObjectSystem:{objects:[]} });
const makeDeep = () => sensorySystem.makeEcho({ id:"deep:test", kind:"chem_object", position:{x:4,y:0,z:0}, distance:7, responseClass:"dense_structure", responseLabel:"dense", waveSpeed:6, pulseEventId:1, pulseMode:"charged", reachClass:"deep_structural" });
let echo = makeDeep(); must(echo.resolutionStage === 1, "first deep read is not presence stage"); sensorySystem.rememberAnswer(sensorySystem.publicEcho(echo));
echo = makeDeep(); must(echo.resolutionStage === 2 && echo.structuralInterpretation === "layering_and_intervening_volume", "second deep read did not resolve layering"); sensorySystem.rememberAnswer(sensorySystem.publicEcho(echo));
echo = makeDeep(); must(echo.resolutionStage === 3 && echo.structuralInterpretation === "structural_relationship_not_immediate_target", "third deep read did not resolve structural relationship");

// Dynamic burst compression + adaptive reorientation proof.
const { InteractionCompositionSystem } = await import(pathToFileURL(path.join(root, "src/presentation/InteractionCompositionSystem.js")));
const frame = {
  interactionAssist:{active:false,objectId:"none"}, bondState:{objectId:"none"}, input:{}, playerKinematics:{speed:0.5},
  coreSensoryResponse:{returnCount:0,newReturns:[],pulseEventId:0}, chemObjectState:{absorbedObjects:0}, verbPhysicalization:{stabilizeProgress:0},
  inspectionCamera:{active:false,coreWorkActive:false}, coreWorkManipulation:{held:false,lastEvent:"none"}, graveMemoryRoute:{active:false},
  vascularRhythmRoute:{active:false}, siltPressureRoute:{active:false}, signalPlainEcology:{consequenceNextQuestion:{active:false}}
};
const compositionSystem = new InteractionCompositionSystem({frameState:frame});
compositionSystem.update(0.016, frame);
frame.coreSensoryResponse = {returnCount:2,pulseEventId:12,newReturns:[
  {id:"deep:a", responseClass:"dense_structure", reachClass:"deep_structural", pulseMode:"charged", resolutionStage:2, structuralInterpretation:"layering_and_intervening_volume"},
  {id:"local:b", responseClass:"living_material", reachClass:"local_actionable", pulseMode:"charged", resolutionStage:1, structuralInterpretation:"local_presence"}
]};
compositionSystem.update(0.016, frame);
const firstEventCount = frame.interactionComposition.consequence.eventCount;
must(firstEventCount === 1, "one Pulse burst did not create exactly one consequence turn");
must(frame.interactionComposition.rhythmLock.reorientationDurationSeconds >= 4.3, "deep repeat did not receive adaptive reorientation");
frame.coreSensoryResponse = {returnCount:3,pulseEventId:12,newReturns:[{id:"deep:c",responseClass:"dense_structure",reachClass:"deep_structural",pulseMode:"charged",resolutionStage:2,structuralInterpretation:"layering_and_intervening_volume"}]};
compositionSystem.update(0.016, frame);
must(frame.interactionComposition.consequence.eventCount === firstEventCount, "same Pulse burst restarted consequence presentation");

const sourceFiles=[];
const walk=(dir)=>{ for(const e of fs.readdirSync(dir,{withFileTypes:true})){ const f=path.join(dir,e.name); if(e.isDirectory()) walk(f); else if(e.isFile() && f.endsWith('.js')) sourceFiles.push(f); } };
walk(path.join(root,'src'));
must(sourceFiles.length === ((main.includes('buildId: "HC-028A"') || main.includes('buildId: "HC-028A1"')) ? 93 : 92), `unexpected source module count ${sourceFiles.length}`);

console.log("PASS HC027L1 Rhythm Compression & Grammar Reinforcement");
console.log("  repeated sonar resolves presence -> layering -> structural relationship instead of replaying identical information");
console.log("  multi-echo Pulse bursts receive one consequence turn with adaptive committed-action reorientation");
console.log("  existing vascular vessel/motes/folds repeat Pulse/Absorb/Stabilize grammar without new objectives or route rules");
console.log("  quick Pulse 4.25, J2 physiology, D1 audio, K relationships, K1 input, movement and 3→6→12 remain locked");
