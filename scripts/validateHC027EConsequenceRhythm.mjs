import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const must = (condition, message) => { if (!condition) throw new Error(`[HC027E] ${message}`); };
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));

const pkg = json("package.json");
const main = read("src/main.js");
const compositionSource = read("src/presentation/InteractionCompositionSystem.js");
const ambient = read("src/world/AmbientMaterialInteractionSystem.js");
const verb = read("src/player/CoreVerbPhysicalizationSystem.js");
const entity = read("src/ecology/EntitySystem.js");
const orbiter = read("src/ecology/OrbiterSystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");
const audio = read("src/audio/EventAnchoredHostAudioSystem.js");
const sensory = read("src/player/CoreSensoryResponseSystem.js");
const engine = read("src/player/CoreEngineSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity = json("public/data/build/currentBuildIdentity_HC027E.json");
const contract = json("public/data/build/hc027eConsequenceRhythmContract.json");

must((main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"'))))), "runtime identity missing");
must(["0.27.6", "0.27.7", "0.27.8", "0.27.9", "0.27.10", "0.27.11", "0.27.12", "0.27.13"].includes(pkg.version), "package version mismatch");
must(["HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build), "inspection profile build mismatch");
must(identity.id === "HC-027E" && identity.parent === "HC-027D1", "identity/parent mismatch");
must(identity.sourceJsCount === 92 && identity.newSourceModules === 0, "source-module lock mismatch");
must(contract.locked.newGameplaySystems === false, "presentation pass may not add gameplay systems");

for (const token of [
  ((main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"'))))) ? 'pass: "HC-027F"' : 'pass: "HC-027E"'),
  '"pulse_return"',
  '"absorb_capture"',
  '"stabilize_lock"',
  '"core_work_commit"',
  'worldNoticeLift',
  'core_work_selected_anatomy_dominant',
  'ambientSuppression',
  'selected_anatomy_first_surrounding_systems_yield'
]) must(compositionSource.includes(token), `composition behavior missing ${token}`);

for (const token of [
  'presentationOpacityScale',
  'presentationSizeScale',
  'sonar_answer_afterglow',
  'metabolic_afterflow',
  'coherence_lock_afterglow',
  'core_work_yield',
  '0.045',
  'worldNoticeLift'
]) must(ambient.includes(token), `ambient consequence/hierarchy behavior missing ${token}`);

// The HC018 composition suppression used to be assigned near the top of update,
// then overwritten by the later response opacity calculation. HC027E must apply
// presentationOpacityScale in the final opacity expression.
const finalOpacityIndex = ambient.indexOf('* presentationOpacityScale');
const responseIndex = ambient.indexOf('const responseOpacityLift');
must(finalOpacityIndex > responseIndex && responseIndex > 0, "ambient suppression is not applied at final opacity ownership point");
must(!ambient.includes('this.points.material.opacity = 0.48 * (1 - ambientSuppression) * rhythmScale;'), "old overwritten ambient suppression assignment still present");

must(verb.includes('Math.min(0.42, Math.max(0, composition.effectSuppression ?? 0))'), "verb effects cannot fully yield during Core Work");
must(entity.includes('Math.min(\n      0.88,\n      Math.max(0, frameState.interactionComposition?.companionYield ?? 0)'), "Tender yield ceiling not advanced");
must(orbiter.includes('Math.min(\n      0.88,\n      Math.max(0, frameState.interactionComposition?.companionYield ?? 0)'), "Guide yield ceiling not advanced");

for (const token of [
  "interactionRhythmPass",
  "interactionRhythmBeat",
  "interactionHierarchy",
  "interactionConsequenceKind",
  "interactionWorldNoticeLift",
  "interactionAmbientSuppression"
]) must(hud.includes(token), `HUD rhythm telemetry missing ${token}`);

// HC027D1 audio calibration is locked: HC027E changes no gain, panner or compressor values.
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

must(sensory.includes("const maxRange = 4.25"), "Pulse range drifted");
must(sensory.includes('law: "pulse_is_embodied_sonar_emit_contact_return"'), "Pulse sonar grammar drifted");
must(engine.includes("const ARCHITECTURE_ORDER = [3, 6, 12]") && engine.includes("nonTriadicArchitectureEnabled: false"), "triadic engine grammar drifted");

const framing = profile.framing ?? {};
const behavior = profile.behavior ?? {};
must(framing.consequenceRhythmPass === "HC-027E", "profile consequence pass missing");
must(framing.coreWorkAmbientSuppressionTarget === 0.84, "profile Core Work hierarchy mismatch");
must(framing.quietTraversalWorldNoticeLiftMax === 0.24, "profile quiet traversal lift mismatch");
must(framing.audioReferenceRemainsLocked === true, "audio reference lock missing");
must(behavior.consequenceRhythmSystemTurnTakingEnabled === true, "turn-taking behavior flag missing");
must(behavior.ambientSuppressionLateOverwriteFixed === true, "ambient suppression repair flag missing");
must(behavior.quietTraversalCreatesObjectives === false && behavior.consequenceRhythmChangesGameplay === false, "presentation pass falsely owns gameplay");

// Dynamic behavior proof for the pure presentation coordinator.
const { InteractionCompositionSystem } = await import(pathToFileURL(path.join(root, "src/presentation/InteractionCompositionSystem.js")));
const makeFrame = () => ({
  interactionAssist: { active: false, objectId: "none" },
  bondState: { objectId: "none" },
  input: {},
  playerKinematics: { speed: 0 },
  coreSensoryResponse: { returnCount: 0, newReturns: [], pulseEventId: 0 },
  chemObjectState: { absorbedObjects: 0 },
  verbPhysicalization: { stabilizeProgress: 0 },
  inspectionCamera: { active: false, coreWorkActive: false },
  coreWorkManipulation: { held: false, lastEvent: "none" },
  graveMemoryRoute: { active: false },
  vascularRhythmRoute: { active: false },
  siltPressureRoute: { active: false }
});

const pulseFrame = makeFrame();
const pulseSystem = new InteractionCompositionSystem({ frameState: pulseFrame });
pulseSystem.update(0.016, pulseFrame);
pulseFrame.coreSensoryResponse = { returnCount: 1, newReturns: [{ responseClass: "dense_structure" }], pulseEventId: 4 };
pulseSystem.update(0.016, pulseFrame);
must(pulseFrame.interactionComposition.consequence.kind === "pulse_return", "Pulse return did not create consequence beat");
must(pulseFrame.interactionComposition.consequence.active === true, "Pulse return consequence not held");

const absorbFrame = makeFrame();
const absorbSystem = new InteractionCompositionSystem({ frameState: absorbFrame });
absorbSystem.update(0.016, absorbFrame);
absorbFrame.chemObjectState.absorbedObjects = 1;
absorbSystem.update(0.016, absorbFrame);
must(absorbFrame.interactionComposition.consequence.kind === "absorb_capture", "Absorb capture did not create consequence beat");

const stabilizeFrame = makeFrame();
const stabilizeSystem = new InteractionCompositionSystem({ frameState: stabilizeFrame });
stabilizeSystem.update(0.016, stabilizeFrame);
stabilizeFrame.input.stabilizeHeld = true;
stabilizeFrame.verbPhysicalization.stabilizeProgress = 0.83;
stabilizeSystem.update(0.016, stabilizeFrame);
const stabilizeEventCount = stabilizeFrame.interactionComposition.consequence.eventCount;
must(stabilizeFrame.interactionComposition.consequence.kind === "stabilize_lock", "Stabilize lock did not create consequence beat");
stabilizeSystem.update(0.10, stabilizeFrame);
must(stabilizeFrame.interactionComposition.consequence.eventCount === stabilizeEventCount, "held Stabilize repeatedly retriggered lock consequence");

const coreWorkFrame = makeFrame();
const coreWorkSystem = new InteractionCompositionSystem({ frameState: coreWorkFrame });
coreWorkSystem.update(0.016, coreWorkFrame);
coreWorkFrame.inspectionCamera = { active: true, coreWorkActive: true };
coreWorkFrame.coreWorkManipulation = { held: true, selectedPieceId: "memory", selectedPieceLabel: "Grave Memory", lastEvent: "guide_grabbed_memory" };
coreWorkSystem.update(0.016, coreWorkFrame);
must(coreWorkFrame.interactionComposition.hierarchy === "core_work_selected_anatomy_dominant", "Core Work hierarchy not dominant");
must(coreWorkFrame.interactionComposition.ambientSuppression === 0.84, "held Core Work ambient suppression mismatch");
must(coreWorkFrame.interactionComposition.companionYield === 0.86, "Core Work companion yield mismatch");

const travelFrame = makeFrame();
travelFrame.playerKinematics.speed = 0.6;
const travelSystem = new InteractionCompositionSystem({ frameState: travelFrame });
for (let i = 0; i < 90; i += 1) travelSystem.update(0.05, travelFrame);
must(travelFrame.interactionComposition.worldNoticeLift > 0.18, "quiet traversal did not surface existing world material");
must(travelFrame.interactionComposition.rhythm.beat === "discover" || travelFrame.interactionComposition.rhythm.beat === "move", "quiet traversal rhythm invalid");

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

console.log("PASS HC027E Consequence Rhythm / System Turn-Taking");
console.log(`  modules: ${sourceFiles.length}`);
console.log(`  pulse consequence: ${contract.consequenceResolution.pulseReturnHoldSeconds}s`);
console.log(`  absorb consequence: ${contract.consequenceResolution.absorbCaptureHoldSeconds}s`);
console.log(`  stabilize consequence: ${contract.consequenceResolution.stabilizeLockHoldSeconds}s`);
console.log(`  Core Work ambient suppression: ${contract.coreWorkHierarchy.selectedAmbientSuppression}/${contract.coreWorkHierarchy.heldAmbientSuppression}`);
console.log(`  quiet traversal world notice lift max: ${contract.quietTraversal.worldNoticeLiftMax}`);
console.log("  HC027D1 audio reference: locked");
