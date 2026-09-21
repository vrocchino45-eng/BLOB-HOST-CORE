import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));
const must = (condition, message) => { if (!condition) throw new Error(`[HC027L] ${message}`); };

const pkg = json("package.json");
const main = read("src/main.js");
const composition = read("src/presentation/InteractionCompositionSystem.js");
const runtime = read("src/core/GameRuntime.js");
const signal = read("src/fields/SignalPlainEcologySystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");
const debug = read("src/debug/RecipeDebugOverlay.js");
const sensory = read("src/player/CoreSensoryResponseSystem.js");
const radial = read("src/player/CoreRadialPerformanceSystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const engine = read("src/player/CoreEngineSystem.js");
const input = read("src/input/InputSystem.js");
const identity = json("public/data/build/currentBuildIdentity_HC027L.json");
const contract = json("public/data/build/hc027lFirstEightMinuteRhythmLockContract.json");

must(["0.27.18", "0.27.19", "0.28.0", "0.28.1"].includes(pkg.version), "package version mismatch");
must((main.includes('buildId: "HC-027L"') && main.includes('buildLabel: "First 8-Minute Rhythm Lock"')) || (main.includes('buildId: "HC-027L1"') && main.includes('buildLabel: "Rhythm Compression & Grammar Reinforcement"')) || (main.includes('buildId: "HC-028A"') && main.includes('buildLabel: "Structured Session Telemetry Foundation"')) || (main.includes('buildId: "HC-028A1"') && main.includes('buildLabel: "Telemetry Calibration + Confusion Detection"')), "runtime identity mismatch");
must(identity.parent === "HC-027K1 HOTFIX2" && identity.sourceJsCount === 92 && identity.newSourceModules === 0, "identity/source lock mismatch");
must(contract.law === "existing_systems_take_turns_and_quiet_travel_surfaces_spatial_information_without_creating_objectives_or_content", "rhythm law mismatch");

for (const token of [
  'rhythmLockPass: "HC-027L"',
  'recordMeaningful(kind)',
  'this.reorientationAge = 0',
  'const reorientationStrength = Math.max(0, Math.min(1, 1 - this.reorientationAge / this.reorientationDurationSeconds))',
  'const quietBaseLift = Math.max(0, Math.min(0.20, (this.quietTravelAge - 0.90) / 2.50 * 0.20))',
  'const quietBreath = this.quietTravelAge > 3.2',
  'softSpatialSupportBeginsAfterSeconds: 7.5',
  'deadTimeReviewBeginsAfterSeconds: 18',
  'desiredMaximumUnchangedWindowSeconds: 60',
  'hardReviewWindowSeconds: 90',
  'addsMechanics: false',
  'createsWaypoint: false'
]) must(composition.includes(token), `rhythm convergence missing: ${token}`);

must(runtime.includes('this.frameState.interactionComposition?.cameraBreathingRoom ?? 0') && runtime.includes('      0.80\n    );'), "runtime still clips authored breathing room below HC027L ceiling");
must(signal.includes('? "compare_local_rhythms"'), "Signal Plain still publishes nearest-node next-action prescription");
for (const token of ['"consequence", "reorient", "discover", "follow_answer", "quiet"', 'this.objectiveEl.style.opacity = state.worldLedBeat ? "0.50" : "1"', 'this.controlsEl.style.opacity = state.worldLedBeat ? "0.42" : "0.78"']) must(hud.includes(token), `HUD world-led yield missing: ${token}`);
must(debug.includes('PLAYTEST TRACE // HC027L') || debug.includes('PLAYTEST TRACE // HC028A'), 'F1 rhythm trace header missing');
for (const token of ['`Rhythm: ${composition.rhythm?.beat ?? "observe"} · gap ${this.formatValue(rhythmLock.meaningfulChangeAge)}s']) must(debug.includes(token), `F1 rhythm telemetry missing: ${token}`);

must(sensory.includes('const localActionableRange = 4.25'), "quick/local Pulse range changed");
must(radial.includes('pass: "HC-027J2"') && radial.includes('physiologyProfilesAreContinuousBlends: true'), "J2 physiology drifted");
for (const token of ['masterGain: 0.82', 'core: 1.85', 'verbs: 2.15', 'world: 1.95', 'ambience: 1.35', 'event: 1.40']) must(audio.includes(token), `HC027D1 mix drifted: ${token}`);
must(engine.includes('const ARCHITECTURE_ORDER = [3, 6, 12]') && engine.includes('nonTriadicArchitectureEnabled: false'), "3→6→12 engine drifted");
for (const token of ['telemetryChangesGameplay: false', 'telemetryChangesControls: false']) must(input.includes(token), `K1 input authority drifted: ${token}`);
must(contract.authority.createsObjective === false && contract.authority.createsWaypoint === false && contract.authority.changesProgression === false, "HC027L gained forbidden authority");

const { InteractionCompositionSystem } = await import(pathToFileURL(path.join(root, "src/presentation/InteractionCompositionSystem.js")));
const makeFrame = () => ({
  interactionAssist:{active:false,objectId:"none"}, bondState:{objectId:"none"}, input:{},
  playerKinematics:{speed:0}, coreSensoryResponse:{returnCount:0,newReturns:[],pulseEventId:0},
  chemObjectState:{absorbedObjects:0}, verbPhysicalization:{stabilizeProgress:0},
  inspectionCamera:{active:false,coreWorkActive:false}, coreWorkManipulation:{held:false,lastEvent:"none"},
  graveMemoryRoute:{active:false}, vascularRhythmRoute:{active:false}, siltPressureRoute:{active:false},
  signalPlainEcology:{consequenceNextQuestion:{active:false}}
});

const travel = makeFrame(); travel.playerKinematics.speed = 0.65;
const travelSystem = new InteractionCompositionSystem({frameState:travel});
for (let i=0;i<220;i+=1) travelSystem.update(0.05, travel);
must(travel.interactionComposition.worldNoticeLift > 0.18, "quiet traversal did not surface existing Host structure");
must(travel.interactionComposition.rhythmLock.softSpatialSupportActive === true, "extended quiet spatial support did not engage");
must(travel.interactionComposition.rhythmLock.createsObjective === false, "rhythm lock created objective authority");

const consequence = makeFrame();
const consequenceSystem = new InteractionCompositionSystem({frameState:consequence});
consequenceSystem.update(0.016, consequence);
consequence.coreSensoryResponse = {returnCount:1,newReturns:[{responseClass:"dense_structure"}],pulseEventId:7};
consequenceSystem.update(0.016, consequence);
must(consequence.interactionComposition.rhythm.beat === "consequence", "Pulse return did not enter consequence beat");
consequence.coreSensoryResponse = {returnCount:1,newReturns:[],pulseEventId:7};
for (let i=0;i<26;i+=1) consequenceSystem.update(0.05, consequence);
must(consequence.interactionComposition.rhythm.beat === "reorient" || consequence.interactionComposition.rhythm.beat === "quiet", "consequence did not yield into reorientation/quiet world beat");
must(consequence.interactionComposition.rhythmLock.reorientationActive === true, "reorientation window not active after consequence settles");

const sourceFiles=[];
const walk=(dir)=>{ for(const e of fs.readdirSync(dir,{withFileTypes:true})){ const f=path.join(dir,e.name); if(e.isDirectory()) walk(f); else if(e.isFile() && f.endsWith('.js')) sourceFiles.push(f); } };
walk(path.join(root,'src'));
must(sourceFiles.length === ((main.includes('buildId: "HC-028A"') || main.includes('buildId: "HC-028A1"')) ? 93 : 92), `unexpected source module count ${sourceFiles.length}`);

console.log("PASS HC027L First 8-Minute Rhythm Lock");
console.log("  no new mechanics/content; existing systems take turns and world re-emerges after consequence");
console.log("  quiet travel spatial support engages without objective/waypoint authority");
console.log("  committed-verb camera breathing room can reach authored J1 values");
console.log("  quick Pulse 4.25, J2 physiology, D1 audio, K relationships, K1 input, 3→6→12 locked");
