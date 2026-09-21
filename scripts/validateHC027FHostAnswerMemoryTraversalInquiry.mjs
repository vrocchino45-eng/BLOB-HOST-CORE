import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const must = (condition, message) => { if (!condition) throw new Error(`[HC027F] ${message}`); };
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));

const pkg = json("package.json");
const main = read("src/main.js");
const sensory = read("src/player/CoreSensoryResponseSystem.js");
const ambient = read("src/world/AmbientMaterialInteractionSystem.js");
const composition = read("src/presentation/InteractionCompositionSystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const engine = read("src/player/CoreEngineSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity = json("public/data/build/currentBuildIdentity_HC027F.json");
const contract = json("public/data/build/hc027fHostAnswerMemoryTraversalInquiryContract.json");

must(main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))), "runtime identity missing");
must(["0.27.7", "0.27.8", "0.27.9", "0.27.10", "0.27.11", "0.27.12", "0.27.13"].includes(pkg.version), "package version mismatch");
must(["HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build), "inspection profile build mismatch");
must(identity.id === "HC-027F" && identity.parent === "HC-027E", "identity/parent mismatch");
must(identity.sourceJsCount === 92 && identity.newSourceModules === 0, "source-module lock mismatch");
must(contract.locked.newGameplaySystems === false, "pass may not add another gameplay owner");

for (const token of [
  "this.answerMemory = []",
  "this.answerMemoryTtlSeconds = 7.2",
  "this.answerMemoryMax = 4",
  "rememberAnswer(publicReturn)",
  "nearestAnswerMemory",
  'answerMemoryLaw: "returned_world_answer_persists_briefly_where_it_was_heard"',
  "readReady: currentDistance <= 1.65",
  "approachIntensity = clamp(1 - currentDistance / 3.6, 0, 1)",
  "answerMemoryCreatesWaypoint: false",
  "answerMemoryCreatesTarget: false",
  "answerMemoryRouteAuthority: false"
]) must(sensory.includes(token), `sensory answer-memory behavior missing ${token}`);

for (const token of [
  "answerMemoryPosition",
  "answerReadTriggered",
  'worldResponseMode = "echo_memory_read"',
  "answerMemoryUsesExistingMotes: true",
  "answerMemoryAddsGeometry: false",
  "answerMemoryAddsDrawCalls: false",
  "answerMemoryMaxWorldRecords: 4"
]) must(ambient.includes(token), `ambient inquiry behavior missing ${token}`);
must(
  ambient.includes('rule: "probe_answer_approach_read_without_waypoint_authority"')
  || ambient.includes('rule: "probe_answer_observe_material_behavior_then_optionally_confirm_without_waypoint_authority"'),
  "ambient inquiry rule missing or successor-incompatible"
);

for (const token of [
  'pass: "HC-027F"',
  'rhythmBeat = "follow_answer"',
  'rule: "probe_answer_approach_read_without_route_authority"',
  '"follow_answer"',
  "createsWaypoint: false",
  "createsTarget: false"
]) must(composition.includes(token), `composition inquiry behavior missing ${token}`);

for (const token of [
  "coreSensoryAnswerMemoryCount",
  "coreSensoryNearestAnswerClass",
  "coreSensoryNearestAnswerDistance",
  "coreSensoryNearestAnswerReadReady",
  "sonarInquiryReadCount",
  "interactionInquiry"
]) must(hud.includes(token), `HUD inquiry telemetry missing ${token}`);

// HC027D1 audio reference remains locked.
for (const token of [
  "masterGain: 0.82",
  "core: 1.85",
  "verbs: 2.15",
  "world: 1.95",
  "ambience: 1.35",
  "event: 1.40",
  "pannerRefDistance: 4.2",
  "pannerRolloff: 0.42",
  'mixRevision: "hc027d1_reference_dynamic_range"'
]) must(audio.includes(token), `locked HC027D1 audio reference drifted: ${token}`);

must(sensory.includes("const maxRange = 4.25"), "Pulse gameplay range drifted");
must(sensory.includes('law: "pulse_is_embodied_sonar_emit_contact_return"'), "Pulse sonar grammar drifted");
must(engine.includes("const ARCHITECTURE_ORDER = [3, 6, 12]") && engine.includes("nonTriadicArchitectureEnabled: false"), "triadic engine grammar drifted");

must(profile.framing?.traversalInquiryPass === "HC-027F", "profile traversal inquiry pass missing");
must(profile.framing?.sonarAnswerMemoryTtlSeconds === 7.2, "profile answer-memory TTL mismatch");
must(profile.framing?.sonarAnswerMemoryMax === 4, "profile memory max mismatch");
must(profile.framing?.sonarAnswerReadRange === 1.65, "profile read range mismatch");
must(profile.behavior?.hostAnswerMemoryTraversalInquiryEnabled === true, "profile inquiry flag missing");
must(profile.behavior?.sonarAnswerMemoryCreatesWaypoints === false, "profile falsely creates waypoints");
must(profile.behavior?.sonarAnswerMemoryChangesProgression === false, "profile falsely owns progression");

// Dynamic proof: a real returned Pulse answer becomes temporary sensory memory,
// becomes readable only by approach, then expires without mutating route/progression state.
const { CoreSensoryResponseSystem } = await import(pathToFileURL(path.join(root, "src/player/CoreSensoryResponseSystem.js")));
class Vec {
  constructor(x=0,y=0,z=0){ this.x=x; this.y=y; this.z=z; }
  distanceTo(other){ const dx=this.x-other.x,dy=this.y-other.y,dz=this.z-other.z; return Math.sqrt(dx*dx+dy*dy+dz*dz); }
}
const playerRoot = { position: new Vec(0,0,0) };
const chemObjectSystem = { objects: [{
  absorbed: false,
  recipe: { id: "probe_seed", chemistry: { domains: ["life","seed"], matterState: "living" }, behavior: { onPulse: "seed_resonance" } },
  root: { visible: true, position: new Vec(2,0,0), userData: {} }
}] };
const frame = {
  input: { pulsePressed: true, pulseEventId: 1 },
  pulse: { affectedObjects: ["probe_seed"] },
  corePerformance: { weights: { deep: 0, inner: 1, membrane: 0 }, personality: "control" },
  playerKinematics: { movementBoundary: { normalizedDistance: 0.1, radii: { x: 10, y: 10, z: 10 }, surfaceNormal: { x: 1, y: 0, z: 0 } } }
};
const sensorySystem = new CoreSensoryResponseSystem({ frameState: frame, playerRoot, chemObjectSystem });
sensorySystem.init();
for (let i=0;i<12;i+=1) {
  sensorySystem.update(0.08, frame);
  frame.input = { pulsePressed: false, pulseEventId: 1 };
}
must(frame.coreSensoryResponse.returnCount >= 1, "dynamic Pulse produced no return");
must(frame.coreSensoryResponse.answerMemoryCount >= 1, "returned Pulse answer was not remembered");
must(frame.coreSensoryResponse.answerMemoryCount <= 4, "answer memory exceeded bounded max");
const remembered = frame.coreSensoryResponse.answerMemory.find((entry) => entry.sourceId === "probe_seed");
must(remembered && remembered.responseClass === "living_seed", "answer memory did not preserve returned material class");
must(remembered.createsTarget === false && remembered.routeAuthority === false && remembered.progressionAuthority === false, "answer memory gained forbidden authority");
playerRoot.position = new Vec(1.6,0,0);
sensorySystem.update(0.05, frame);
must(frame.coreSensoryResponse.nearestAnswerMemory?.readReady === true, "approached answer did not become locally readable");
for (let i=0;i<100;i+=1) sensorySystem.update(0.08, frame);
must(frame.coreSensoryResponse.answerMemoryCount === 0, "answer memory did not expire naturally");

const { InteractionCompositionSystem } = await import(pathToFileURL(path.join(root, "src/presentation/InteractionCompositionSystem.js")));
const inquiryFrame = {
  interactionAssist: { active: false, objectId: "none" },
  bondState: { objectId: "none" },
  input: {},
  playerKinematics: { speed: 0.65 },
  coreSensoryResponse: { answerMemoryCount: 1, nearestAnswerMemory: { id: "answer_memory:1", responseClass: "dense_structure", currentDistance: 2.2, approachIntensity: 0.39, readReady: false }, returnCount: 0, newReturns: [] },
  ambientMaterial: { sonarInquiry: { active: true, readReady: false, readTriggered: false, approachIntensity: 0.39 } },
  chemObjectState: { absorbedObjects: 0 },
  verbPhysicalization: { stabilizeProgress: 0 },
  inspectionCamera: { active: false, coreWorkActive: false },
  coreWorkManipulation: { held: false, lastEvent: "none" },
  graveMemoryRoute: { active: false }, vascularRhythmRoute: { active: false }, siltPressureRoute: { active: false }
};
const compositionSystem = new InteractionCompositionSystem({ frameState: inquiryFrame });
compositionSystem.update(0.1, inquiryFrame);
must(inquiryFrame.interactionComposition.rhythm.beat === "follow_answer", "movement toward a remembered answer did not enter follow-answer rhythm");
must(inquiryFrame.interactionComposition.inquiry.routeAuthority === false && inquiryFrame.interactionComposition.inquiry.createsWaypoint === false, "inquiry composition gained forbidden navigation authority");

const sourceFiles=[];
const walk=(dir)=>{ for(const entry of fs.readdirSync(dir,{withFileTypes:true})){ const full=path.join(dir,entry.name); if(entry.isDirectory()) walk(full); else if(entry.isFile()&&full.endsWith('.js')) sourceFiles.push(full); } };
walk(path.join(root,"src"));
must(sourceFiles.length===92,`expected 92 source modules, found ${sourceFiles.length}`);

console.log("PASS HC027F Host Answer Memory / Traversal Inquiry");
console.log(`  modules: ${sourceFiles.length}`);
console.log(`  answer memory: max ${contract.answerMemory.maxRecords}, ${contract.answerMemory.defaultTtlSeconds}s default TTL`);
console.log(`  approach/read: ${contract.answerMemory.approachRange} / ${contract.answerMemory.readRange}`);
console.log("  waypoint/target/progression authority: none");
console.log("  HC027D1 audio reference: locked");
