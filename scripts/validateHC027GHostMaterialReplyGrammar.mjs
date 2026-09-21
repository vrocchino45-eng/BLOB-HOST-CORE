import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const must = (condition, message) => { if (!condition) throw new Error(`[HC027G] ${message}`); };
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));

const pkg = json("package.json");
const main = read("src/main.js");
const ambient = read("src/world/AmbientMaterialInteractionSystem.js");
const sensory = read("src/player/CoreSensoryResponseSystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const engine = read("src/player/CoreEngineSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity = json("public/data/build/currentBuildIdentity_HC027G.json");
const contract = json("public/data/build/hc027gHostMaterialReplyGrammarContract.json");

must(main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))), "runtime identity missing");
must(["0.27.8", "0.27.9", "0.27.10", "0.27.11", "0.27.12", "0.27.13"].includes(pkg.version), "package version mismatch");
must(["HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build), "inspection profile build mismatch");
must(identity.id === "HC-027G" && identity.parent === "HC-027F", "identity/parent mismatch");
must(identity.sourceJsCount === 92 && identity.newSourceModules === 0, "source-module lock mismatch");
must(contract.locked.newGameplaySystems === false, "pass may not add a gameplay owner");

const signatures = contract.materialReply.classes;
for (const [responseClass, signature] of Object.entries(signatures)) {
  must(ambient.includes(`${responseClass}: "${signature}"`), `missing material reply signature ${responseClass}`);
}
for (const token of [
  'answerResponseClass === "host_membrane"',
  'answerResponseClass === "living_seed"',
  'answerResponseClass === "scar_memory"',
  'answerResponseClass === "signal_resonant"',
  'answerResponseClass === "fluid_current"',
  'answerResponseClass === "dense_structure"',
  'materialReplyGrammarEnabled: true',
  'materialReplyGrammarUsesExistingMotes: true',
  'materialReplyGrammarAddsGeometry: false',
  'materialReplyGrammarAddsDrawCalls: false',
  'materialReplyGrammarGameplayAuthority: false',
  'rule: "probe_answer_observe_material_behavior_then_optionally_confirm_without_waypoint_authority"'
]) must(ambient.includes(token), `material reply grammar missing ${token}`);

for (const token of [
  "sonarInquiryMaterialReplySignature",
  "sonarInquiryMaterialReplyGrammarEnabled"
]) must(hud.includes(token), `HUD material-reply telemetry missing ${token}`);

// HC027F memory law is locked.
for (const token of [
  "this.answerMemoryTtlSeconds = 7.2",
  "this.answerMemoryMax = 4",
  "readReady: currentDistance <= 1.65",
  "approachIntensity = clamp(1 - currentDistance / 3.6, 0, 1)",
  "answerMemoryCreatesWaypoint: false",
  "answerMemoryCreatesTarget: false",
  "answerMemoryRouteAuthority: false",
  "const maxRange = 4.25"
]) must(sensory.includes(token), `locked HC027F/HC027D sonar law drifted: ${token}`);

// HC027D1 audio baseline is still the approved reference.
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

must(engine.includes("const ARCHITECTURE_ORDER = [3, 6, 12]") && engine.includes("nonTriadicArchitectureEnabled: false"), "triadic engine grammar drifted");
must(profile.framing?.materialReplyGrammarPass === "HC-027G", "profile material-reply pass missing");
must(profile.framing?.materialReplyClassCount === 7, "profile class count mismatch");
must(profile.framing?.materialReplyLocalRadius === 2.35, "profile local radius mismatch");
must(profile.behavior?.hostMaterialReplyGrammarEnabled === true, "profile reply grammar flag missing");
must(profile.behavior?.hostMaterialReplyGrammarUsesExistingMotes === true, "profile must reuse existing Host motes");
must(profile.behavior?.hostMaterialReplyGrammarCreatesWaypoints === false, "profile falsely creates waypoints");
must(profile.behavior?.hostMaterialReplyGrammarChangesProgression === false, "profile falsely changes progression");

const sourceFiles=[];
const walk=(dir)=>{ for(const entry of fs.readdirSync(dir,{withFileTypes:true})){ const full=path.join(dir,entry.name); if(entry.isDirectory()) walk(full); else if(entry.isFile()&&full.endsWith('.js')) sourceFiles.push(full); } };
walk(path.join(root,"src"));
must(sourceFiles.length===92,`expected 92 source modules, found ${sourceFiles.length}`);

console.log("PASS HC027G Host Material Reply Grammar");
console.log(`  modules: ${sourceFiles.length}`);
console.log(`  reply classes: ${Object.keys(signatures).length}`);
console.log("  geometry/draw calls/waypoints/progression: unchanged");
console.log("  HC027D1 audio reference: locked");
