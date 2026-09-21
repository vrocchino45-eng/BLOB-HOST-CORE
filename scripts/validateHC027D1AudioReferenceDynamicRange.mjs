import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const must = (condition, message) => { if (!condition) throw new Error(`[HC027D1] ${message}`); };
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));

const pkg = json("package.json");
const main = read("src/main.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");
const sensory = read("src/player/CoreSensoryResponseSystem.js");
const engine = read("src/player/CoreEngineSystem.js");
const performance = read("src/player/CoreRadialPerformanceSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity = json("public/data/build/currentBuildIdentity_HC027D1.json");
const contract = json("public/data/build/hc027d1AudioReferenceDynamicRangeContract.json");
const successorHC027E = (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));

must(main.includes('buildId: "HC-027D1"') || successorHC027E, "runtime identity missing");
must(pkg.version === "0.27.5" || (successorHC027E && ["0.27.6", "0.27.7", "0.27.8", "0.27.9", "0.27.10", "0.27.11", "0.27.12", "0.27.13"].includes(pkg.version)), "package version mismatch");
must(profile.build === "HC-027D1" || (successorHC027E && ["HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)), "inspection profile build mismatch");
must(identity.id === "HC-027D1" && identity.parent === "HC-027D", "identity/parent mismatch");
must(identity.sourceJsCount === 92 && identity.newSourceModules === 0, "source-module lock mismatch");
must(contract.reference.targetSystemOutputPercent === "60-70", "reference listening target mismatch");
must(contract.reference.targetHeadroomDb === 8, "headroom target mismatch");

for (const token of [
  "HC027D1_AUDIO_MIX",
  "masterGain: 0.82",
  "core: 1.85",
  "verbs: 2.15",
  "world: 1.95",
  "ambience: 1.35",
  "event: 1.40",
  "pannerRefDistance: 4.2",
  "pannerMaxDistance: 42",
  "pannerRolloff: 0.42",
  "compressorThresholdDb: -4",
  "compressorRatio: 8",
  'mixRevision: "hc027d1_reference_dynamic_range"',
  "resolveBusNode",
  "createDynamicsCompressor"
]) must(audio.includes(token), `audio calibration behavior missing ${token}`);

for (const bus of ["core", "verbs", "world", "ambience", "event"]) {
  must(audio.includes(`bus: "${bus}"`) || bus === "event", `no routed content found for ${bus} bus`);
}
must(audio.includes('resolveBusNode("event")'), "event bus is not used by unlock confirmation");
must(audio.includes('bus: "verbs"'), "Core verb bus routing missing");
must(audio.includes('bus: "world"'), "world/sonar return bus routing missing");
must(audio.includes('bus: "core"'), "Core engine/work bus routing missing");
must(audio.includes('bus: "ambience"'), "Host ambience bus routing missing");

const mix = contract.mix;
must(mix.masterGain === 0.82, "contract master gain mismatch");
must(mix.buses.core === 1.85 && mix.buses.verbs === 2.15 && mix.buses.world === 1.95, "primary bus gains mismatch");
must(mix.pannerRefDistance === 4.2 && mix.pannerRolloff === 0.42, "distance calibration mismatch");
must(mix.zoomProximityStillMatters === true, "zoom/proximity relationship must remain active");
must(contract.outputSafety.type === "DynamicsCompressorNode" && contract.outputSafety.ratio === 8, "output safety graph mismatch");

const locked = contract.locked;
must(locked.pulseGameplayRangeChanged === false && locked.pulseReturnTimingChanged === false, "HC027D sonar behavior crossed calibration scope");
must(locked.radialPhysiologyChanged === false && locked.engineGrammarChanged === false, "physiology/engine grammar crossed calibration scope");
must(locked.movementAuthorityChanged === false && locked.chemistryAuthorityChanged === false && locked.progressionAuthorityChanged === false, "runtime authority crossed calibration scope");
must(locked.newGameplaySystems === false, "calibration pass may not add gameplay systems");

// Preserve the actual sensory and engine laws from HC027D/HC027B rather than only trusting metadata.
must(sensory.includes("const maxRange = 4.25"), "Pulse gameplay range drifted");
must(sensory.includes('law: "pulse_is_embodied_sonar_emit_contact_return"'), "Pulse sonar grammar drifted");
must(engine.includes("const ARCHITECTURE_ORDER = [3, 6, 12]") && engine.includes("nonTriadicArchitectureEnabled: false"), "triadic engine grammar drifted");
must(performance.includes("diesel / reserve drive") && performance.includes("race / output drive"), "radial performance law drifted");

// Playtest diagnostics must expose the calibration state so screenshots/video can be interpreted.
for (const token of [
  "hostAudioMixRevision",
  "hostAudioReferenceSystemOutputPercent",
  "hostAudioTargetHeadroomDb",
  "hostAudioBusGains",
  "hostAudioSafetyCompression"
]) must(hud.includes(token), `HUD calibration telemetry missing ${token}`);

const framing = profile.framing ?? {};
const behavior = profile.behavior ?? {};
must(framing.playtestAudioMixRevision === "hc027d1_reference_dynamic_range", "framing mix revision mismatch");
must(framing.playtestAudioMasterGain === 0.82 && framing.playtestAudioPannerRefDistance === 4.2 && framing.playtestAudioPannerRolloff === 0.42, "framing calibration mismatch");
must(framing.playtestAudioReferenceSystemOutputPercent === "60-70" && framing.playtestAudioTargetHeadroomDb === 8, "framing listening reference mismatch");
must(behavior.playtestAudioBusArchitectureEnabled === true && behavior.playtestAudioSafetyCompressionEnabled === true, "profile audio architecture flags missing");
must(behavior.playtestAudioGameplayChanged === false, "profile falsely reports gameplay audio change");

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

console.log("PASS HC027D1 Audio Reference Level / Dynamic Range Calibration");
console.log(`  modules: ${sourceFiles.length}`);
console.log(`  master: ${mix.masterGain}`);
console.log(`  buses: core ${mix.buses.core} / verbs ${mix.buses.verbs} / world ${mix.buses.world} / ambience ${mix.buses.ambience} / event ${mix.buses.event}`);
console.log(`  spatial: ref ${mix.pannerRefDistance} / rolloff ${mix.pannerRolloff}`);
console.log(`  reference system output: ${contract.reference.targetSystemOutputPercent}%`);
console.log(`  reserved event headroom target: ${contract.reference.targetHeadroomDb} dB`);
