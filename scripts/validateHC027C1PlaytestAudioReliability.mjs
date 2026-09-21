import fs from "node:fs";
import path from "node:path";

const must = (condition, message) => { if (!condition) throw new Error(`[HC027C1] ${message}`); };
const text = (file) => fs.readFileSync(file, "utf8");
const json = (file) => JSON.parse(text(file));

const main = text("src/main.js");
const audio = text("src/audio/EventAnchoredHostAudioSystem.js");
const hud = text("src/ui/PlaytestHudSystem.js");
const movement = text("src/player/PlayerMovementController.js");
const performance = text("src/player/CoreRadialPerformanceSystem.js");
const engine = text("src/player/CoreEngineSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity = json("public/data/build/currentBuildIdentity_HC027C1.json");
const contract = json("public/data/build/hc027c1PlaytestAudioReliabilityContract.json");
const pkg = json("package.json");
const successorHC027D = main.includes('buildId: "HC-027D"');
const successorHC027D1 = main.includes('buildId: "HC-027D1"');
const successorHC027E = (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));

must(main.includes('buildId: "HC-027C1"') || successorHC027D || successorHC027D1 || successorHC027E, "runtime identity missing");
must(pkg.version === "0.27.3" || (successorHC027D && pkg.version === "0.27.4") || (successorHC027D1 && pkg.version === "0.27.5") || (successorHC027E && ["0.27.6", "0.27.7", "0.27.8", "0.27.9", "0.27.10", "0.27.11", "0.27.12", "0.27.13"].includes(pkg.version)), "package version mismatch");
must(identity.id === "HC-027C1" && identity.sourceJsCount === 91 && identity.newSourceModules === 0, "identity/source count mismatch");
must(profile.build === "HC-027C1" || (successorHC027D && profile.build === "HC-027D") || (successorHC027D1 && profile.build === "HC-027D1") || (successorHC027E && ["HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)), "inspection profile build mismatch");
for (const token of [
  "playUnlockConfirmation",
  "audio_unlock_confirmation",
  "blob:audio-unlock-request",
  "gamepadAloneCannotGuaranteeBrowserUnlock: true"
]) must(audio.includes(token), `audio reliability behavior missing ${token}`);
if (!successorHC027D && !successorHC027D1 && !successorHC027E) {
  for (const token of ["HC027C1_AUDIO_MIX", "masterGain: 0.52", "pannerRefDistance: 2.4", "pannerRolloff: 0.72", 'mixRevision: "hc027c1_playtest_audibility"']) must(audio.includes(token), `HC027C1 mix behavior missing ${token}`);
} else if (successorHC027D1 || successorHC027E) {
  for (const token of ["HC027D1_AUDIO_MIX", "masterGain: 0.82", "pannerRefDistance: 4.2", "pannerRolloff: 0.42", 'mixRevision: "hc027d1_reference_dynamic_range"']) must(audio.includes(token), `HC027D1 successor mix behavior missing ${token}`);
} else {
  for (const token of ["HC027D_AUDIO_MIX", "masterGain: 0.68", "pannerRefDistance: 2.8", "pannerRolloff: 0.62", 'mixRevision: "hc027d_core_sensory_physiology"']) must(audio.includes(token), `HC027D successor mix behavior missing ${token}`);
}
for (const token of [
  "playtest-audio-unlock-gate",
  "AUDIO LOCKED — CLICK HERE OR PRESS A KEY ONCE",
  "applyAudioGate",
  "hostAudioUnlocked",
  "hostAudioContextState"
]) must(hud.includes(token), `prominent unlock/status HUD missing ${token}`);
const b = profile.behavior ?? {};
must(b.playtestAudioReliabilityHotfixEnabled === true && b.playtestAudioReliabilityOwner === "EventAnchoredHostAudioSystem", "profile reliability owner mismatch");
must(b.playtestAudioUnlockGateEnabled === true && b.playtestAudioUnlockConfirmationEnabled === true, "unlock gate/confirmation flags missing");
must(b.playtestAudioGamepadOnlyUnlockGuaranteed === false, "must not falsely guarantee gamepad-only browser unlock");
must((!successorHC027D && !successorHC027D1 && !successorHC027E && b.playtestAudioMasterGain === 0.52 && b.playtestAudioPannerRefDistance === 2.4 && b.playtestAudioPannerRolloff === 0.72) || (successorHC027D && b.playtestAudioMasterGain === 0.68 && b.playtestAudioPannerRefDistance === 2.8 && b.playtestAudioPannerRolloff === 0.62) || ((successorHC027D1 || successorHC027E) && b.playtestAudioMasterGain === 0.82 && b.playtestAudioPannerRefDistance === 4.2 && b.playtestAudioPannerRolloff === 0.42), "audibility tuning/successor mismatch");
must(b.playtestAudioGameplayChanged === false, "hotfix may not change gameplay");
must(contract.unlock?.lockedStateMustBeProminent === true && contract.unlock?.confirmationToneRequired === true, "contract unlock observability weakened");
must(contract.unlock?.gamepadOnlyUnlockGuaranteed === false, "contract falsely guarantees controller-only unlock");
must(contract.locked?.gameplayAuthority === false && contract.locked?.progressionAuthority === false, "audio authority lock weakened");
must(contract.locked?.movementTuningChanged === false && contract.locked?.radialPerformanceLawChanged === false && contract.locked?.triadicEngineGrammarChanged === false, "HC027C1 crossed gameplay scope");
// Mechanical ownership regression: the hotfix does not touch the movement/performance/engine laws.
must(movement.includes("radialPerformance.boostAccelerationMultiplier") && movement.includes("radialPerformance.boostSpeedMultiplier"), "HC027C boost ownership missing");
must(performance.includes("diesel / reserve drive") && performance.includes("race / output drive"), "HC027C physiology law drifted");
must(engine.includes('const ARCHITECTURE_ORDER = [3, 6, 12]') && engine.includes("nonTriadicArchitectureEnabled: false"), "HC027B triadic grammar drifted");
const sourceFiles=[]; const walk=(dir)=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(entry.isFile()&&file.endsWith(".js"))sourceFiles.push(file);}}; walk("src");
must(sourceFiles.length === 91 || ((successorHC027D || successorHC027D1 || successorHC027E) && sourceFiles.length === 92), `expected HC027C1 91 modules or HC027D/D1 successor 92, found ${sourceFiles.length}`);
console.log("[HC027C1] prominent Web Audio unlock gate + explicit confirmation triad PASS");
console.log("[HC027C1] practical procedural mix lift + gentler near-field attenuation PASS");
console.log("[HC027C1] controller-only unlock correctly remains non-guaranteed by browser policy PASS");
console.log("[HC027C1] gameplay / HC027C radial law / HC027B triadic grammar unchanged PASS");
