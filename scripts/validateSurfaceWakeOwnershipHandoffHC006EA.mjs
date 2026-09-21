import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { SurfaceWakeLayeredInteractionSystem } from "../src/opening/SurfaceWakeLayeredInteractionSystem.js";
import { LocalCellMorphSystem } from "../src/morph/LocalCellMorphSystem.js";
import { buildRuntimeDiagnosticSummary } from "../src/debug/RuntimeDiagnosticSummary.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateSurfaceWakeOwnershipHandoffHC006EA] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const morphSource = readText("src/morph/LocalCellMorphSystem.js");
const surfaceSource = readText("src/opening/SurfaceWakeLayeredInteractionSystem.js");
const diagnosticSource = readText("src/debug/RuntimeDiagnosticSummary.js");

if (["HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)) {
  assert(manifest.version === (manifest.id === "HC-014I" ? "0.0.142" : manifest.id === "HC-014G" ? "0.0.140" : manifest.id === "HC-014F" ? "0.0.139" : manifest.id === "HC-014E" ? "0.0.138" : manifest.id === "HC-014D" ? "0.0.137" : manifest.id === "HC-014C" ? "0.0.136" : manifest.id === "HC-014B" ? "0.0.135" : manifest.id === "HC-014A" ? "0.0.134" : manifest.id === "HC-013D" ? "0.0.133" : manifest.id === "HC-013C" ? "0.0.132" : manifest.id === "HC-013B" ? "0.0.131" : manifest.id === "HC-013A" ? "0.0.130" : manifest.id === "HC-012C" ? "0.0.129" : manifest.id === "HC-012B" ? "0.0.128" : "0.0.127") && pkg.version === manifest.version, "HC-012A/HC-012B ownership-handoff identity mismatch.");
} else if (manifest.id === "HC-011B") {
  assert(manifest.version === "0.0.126" && pkg.version === manifest.version, "HC-011B ownership-handoff identity mismatch.");
} else if (manifest.id === "HC-011A1") {
  assert(manifest.version === "0.0.125" && pkg.version === manifest.version, "HC-011A1 ownership-handoff identity mismatch.");
} else if (manifest.id === "HC-011A") {
  assert(manifest.version === "0.0.124" && pkg.version === manifest.version, "HC-011A ownership-handoff identity mismatch.");
} else if (manifest.id === "HC-010G") {
  assert(manifest.version === "0.0.123" && pkg.version === manifest.version, "HC-010G ownership-handoff identity mismatch.");
} else if (manifest.id === "HC-010F") {
  assert(manifest.version === "0.0.122" && pkg.version === manifest.version, "HC-010F ownership-handoff identity mismatch.");
} else if (manifest.id === "HC-010E") {
  assert(manifest.version === "0.0.121" && pkg.version === manifest.version, "HC-010E ownership-handoff identity mismatch.");
} else if (manifest.id === "HC-010D") {
  assert(manifest.version === "0.0.120" && pkg.version === manifest.version, "HC-010D ownership-handoff identity mismatch.");
} else if (manifest.id === "HC-010C") {
  assert(manifest.version === "0.0.119" && pkg.version === manifest.version, "HC-010C ownership-handoff identity mismatch.");
} else if (manifest.id === "HC-010B") {
  assert(manifest.version === "0.0.118" && pkg.version === manifest.version, "HC-010B ownership-handoff identity mismatch.");
} else if (manifest.id === "HC-010A") {
  assert(manifest.version === "0.0.117" && pkg.version === manifest.version, "HC-010A ownership-handoff identity mismatch.");
} else {
assert(["HC-006EB", "HC-006F", "HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G", "HC-009A", "HC-009B", "HC-009C", "HC-009D", "HC-009E", "HC-009F", "HC-009G"] .includes(manifest.id) && ["0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109", "0.0.110", "0.0.111", "0.0.112", "0.0.113", "0.0.114", "0.0.115", "0.0.116"].includes(manifest.version), "manifest identity mismatch.");
assert(["0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109", "0.0.110", "0.0.111", "0.0.112", "0.0.113", "0.0.114", "0.0.115", "0.0.116"].includes(pkg.version), "package identity mismatch.");
}
assert(morphSource.includes("deferred_to_surface_wake_lesson") && morphSource.includes("deferredToSurfaceWake"), "first morph must explicitly defer to Surface Wake.");
assert(surfaceSource.includes("surface_wake_complete_retained") && surfaceSource.includes("surface_wake_language_learned_retained"), "Surface Wake completion must persist after cell change.");
assert(diagnosticSource.includes("!morph.deferredToSurfaceWake"), "diagnostics must not report an intentionally deferred morph as a blocker.");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();

const scene = new THREE.Scene();
const playerRoot = new THREE.Group();
const surfaceRecipe = recipeDataSystem.get("surfaceWakeLayeredInteractionRecipes", "SURFACE_WAKE_LAYERED_INTERACTION_HC006E");
playerRoot.position.set(...surfaceRecipe.geometry.anchor);
scene.add(playerRoot);
const frameState = {
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  playerComposition: { form: 0, seed: 0 },
  input: { pulsePressed: false, pulseEventId: 0, pulseSource: "none", absorbHeld: false, resonanceHeld: false },
  inputSource: { contextButtonDown: false },
  inputActionAudit: {},
  targeting: { targetId: "none" },
  targetFocus: { provider: "SurfaceWakeLayeredInteractionSystem", preferredTargetId: "none" },
  selectedObject: {},
  promptStack: {},
  controllerOnboarding: {},
  playtestHud: {},
  nonFatalSystemErrors: [],
  lockState: {},
  inspectionCamera: { available: false, active: false },
  nurseryCircuit: { agencyProven: true, foldInvitation: true }
};

const surface = new SurfaceWakeLayeredInteractionSystem({ recipeDataSystem, scene, playerRoot, frameState });
surface.init();
const morph = new LocalCellMorphSystem({
  recipeDataSystem,
  visualComposer: {},
  chemObjectSystem: { objects: [] },
  playerRoot,
  frameState
});
morph.sourceCell = { id: "CELL_MEMBRANE_NURSERY_001" };

const stepSurface = (count = 1) => {
  for (let i = 0; i < count; i += 1) {
    frameState.frame += 1;
    frameState.runtimeSeconds += 1 / 60;
    surface.update(1 / 60, frameState);
    frameState.input.pulsePressed = false;
  }
};

stepSurface(30);
assert(frameState.surfaceWakeLayeredInteraction.stage === "observe_first_answer", "opening must reach observation.");
const deferred = morph.evaluateTrigger(frameState);
assert(deferred.deferredToSurfaceWake && !deferred.ready && !deferred.start, "first morph must be dormant during Surface Wake.");
assert(deferred.reason === "none", "deferred morph must not publish a competing blocker.");
assert(deferred.nextAction === frameState.surfaceWakeLayeredInteraction.nextAction, "deferred morph must mirror the authored Surface Wake action.");
morph.update(1 / 60, frameState);
assert(frameState.localCellMorph.phase === "deferred_to_surface_wake_lesson", "deferred phase must be visible.");
const openingDiagnosis = buildRuntimeDiagnosticSummary(frameState);
assert(openingDiagnosis.owner === "SurfaceWakeLayeredInteractionSystem", "Surface Wake must remain the active owner.");
assert(openingDiagnosis.blocker === "none_detected", `deferred morph must not block diagnostics, got ${openingDiagnosis.blocker}.`);

// Complete the authored lesson.
frameState.input.pulseEventId = 1;
frameState.input.pulsePressed = true;
stepSurface(1);
frameState.input.resonanceHeld = true;
stepSurface(95);
stepSurface(45);
frameState.input.resonanceHeld = false;
stepSurface(65);
assert(frameState.surfaceWakeLayeredInteraction.completed, "Surface Wake lesson must complete.");

// Leave the nursery and verify the learned state is retained instead of becoming inactive / 0%.
frameState.activeCellId = "CELL_SCAR_FLOW_FOLD_001";
surface.update(1 / 60, frameState);
const retained = frameState.surfaceWakeLayeredInteraction;
assert(!retained.active, "Surface Wake must not remain active in Scar-Flow.");
assert(retained.completed && retained.progress === 1, "Surface Wake completion must remain 100% after cell change.");
assert(retained.stage === "surface_wake_complete_retained", `retained stage mismatch: ${retained.stage}.`);
assert(retained.safeSeedAbsorbUnlocked && !retained.blocksSafeSeedAbsorb, "completion handoff must remain unlocked.");

console.log("validateSurfaceWakeOwnershipHandoffHC006EA validation passed.");
