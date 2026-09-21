import * as THREE from "three";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";
import { GraveReturnContinuitySystem } from "../src/morph/GraveReturnContinuitySystem.js";
import { buildRuntimeDiagnosticSummary } from "../src/debug/RuntimeDiagnosticSummary.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateGraveReturnContinuityHC005A] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const recipe = readJson("public/data/morph/graveReturnContinuityRecipes.json")[0];
const mainSource = readText("src/main.js");
const runtimeSource = readText("src/core/GameRuntime.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");
const hudSource = readText("src/ui/PlaytestHudSystem.js");
const tissueSource = readText("src/morph/MorphReadabilitySystem.js");
const diagnosticSource = readText("src/debug/RuntimeDiagnosticSummary.js");

assert(["HC-005A", "HC-005B", "HC-005C", "HC-005D", "HC-006A", "HC-006B", "HC-006C", "HC-006D", "HC-006E", "HC-006EA", "HC-006EB", "HC-006F", "HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id), `manifest must identify HC-005A or HC-005B successor, got ${manifest.id}.`);
assert(["0.0.75", "0.0.76", "0.0.77", "0.0.78", "0.0.79", "0.0.80", "0.0.81", "0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(manifest.version), `manifest version must preserve HC-005A or HC-005B, got ${manifest.version}.`);
assert(["0.0.75", "0.0.76", "0.0.77", "0.0.78", "0.0.79", "0.0.80", "0.0.81", "0.0.82", "0.0.83", "0.0.84", "0.0.85", "0.0.86", "0.0.87", "0.0.88", "0.0.89", "0.0.90", "0.0.91", "0.0.92", "0.0.93", "0.0.94", "0.0.95", "0.0.96", "0.0.97", "0.0.98", "0.0.99", "0.0.100", "0.0.101", "0.0.102", "0.0.103", "0.0.104", "0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version), `package version must preserve HC-005A or HC-005B, got ${pkg.version}.`);
assert(mainSource.includes(`buildId: "${manifest.id}"`), "runtime entry must match the current validated manifest id.");
assert(recipe.id === "GRAVE_RETURN_CONTINUITY_HC005A", "return recipe id mismatch.");
assert(recipe.sourceLock === "GRAVE_ROUTE_LOCK_HC004R", "return must require the locked Grave route.");
assert(recipe.sourceCell === "CELL_GRAVE_MEMORY_RESIDUE_BED_001", "return source cell mismatch.");
assert(recipe.destinationCell === "CELL_SIGNAL_CHORUS_NERVE_001", "return destination must be Signal Chorus.");
assert(recipe.activationRules?.movementStartsReturn === true, "movement must start the return.");
assert(recipe.activationRules?.pulseStartsReturn === false, "pulse must not start the return.");
assert(recipe.activationRules?.absorbStartsReturn === false, "absorb must not start the return.");
assert(recipe.completion?.playerRelocation === false, "return must not relocate/teleport the player.");
assert(recipe.completion?.graveRouteRemainsLocked === true, "Grave lock must remain preserved.");
assert(recipe.completion?.protectedRemainsConsumed === false, "protected Grave remains must stay intact.");
assert(recipe.completion?.inheritanceSeedRemnantOpened === false, "inheritance seed must stay closed.");

assert(runtimeSource.includes("new GraveReturnContinuitySystem"), "GameRuntime must construct the return system.");
assert(runtimeSource.includes('register("graveReturnContinuitySystem"'), "GameRuntime must register the return system.");
assert(diagnosticSource.includes('{ key: "graveReturnContinuity", owner: "GraveReturnContinuitySystem" }'), "diagnostics must prioritize the return owner.");
assert(guideSource.includes("GUIDE_PROMPT_GRAVE_RETURN_CONTINUITY_HC005A"), "Guide must publish the return instruction.");
assert(hudSource.includes("graveReturnContinuityActive"), "HUD must expose return continuity state.");
assert(tissueSource.includes("Signal Chorus: Grave reading returned."), "tissue panel must expose return completion.");

const recipeDataSystem = new RecipeDataSystem();
recipeDataSystem.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};
await recipeDataSystem.loadAll();

const sourceRoot = new THREE.Group();
const sourceMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial());
sourceRoot.add(sourceMesh);
sourceRoot.userData.absorbed = false;
const destinationRoot = new THREE.Group();
const destinationMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial());
destinationRoot.add(destinationMesh);
destinationRoot.userData.absorbed = false;

const graveEnvironment = new THREE.Group();
graveEnvironment.name = "grave_memory_residue_bed_surface_001";
graveEnvironment.add(new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial()));
const graveHaze = graveEnvironment.clone();
graveHaze.name = "grave_memory_silt_haze_001";
const signalEnvironment = graveEnvironment.clone();
signalEnvironment.name = "signal_chorus_nerve_surface_001";
const signalHaze = graveEnvironment.clone();
signalHaze.name = "signal_chorus_soft_haze_001";

const visualComposer = {
  composedObjects: [graveEnvironment, graveHaze, signalEnvironment, signalHaze].map((root) => ({ root }))
};
const chemObjectSystem = {
  objects: [
    { cellId: recipe.sourceCell, root: sourceRoot, recipe: { id: "old_core_husk_memory_001" } },
    { cellId: recipe.destinationCell, root: destinationRoot, recipe: { id: "choir_resonance_node_001" } }
  ],
  setObjectOpacity(root, opacity) {
    root.traverse((child) => {
      if (child.material) child.material.opacity = opacity;
    });
  },
  setCellObjectVisibility(cellId, visible, opacity) {
    for (const item of this.objects) {
      if (item.cellId !== cellId) continue;
      item.root.visible = visible;
      this.setObjectOpacity(item.root, opacity);
    }
  }
};
const playerRoot = new THREE.Group();
playerRoot.position.set(-1.1, -0.45, -1.9);
const scene = new THREE.Scene();
const frameState = {
  frame: 1,
  runtimeSeconds: 0,
  activeCellId: recipe.sourceCell,
  graveRouteLock: { active: true, completed: true, routeLocked: true },
  graveBedPostSeamResponse: { completed: true, responseComplete: true, stage: "grave_bed_post_seam_response_complete" },
  promptStack: {},
  physicalFeel: {},
  chemistry: {},
  chemObjectState: { pulseResponse: "none" },
  lockState: {},
  input: { pulsePressed: false, absorbHeld: false, pulseEventId: 0 },
  inputActionAudit: { eventId: 0, consumedBy: "none" },
  targeting: { targetId: "inheritance_seed_remnant_001" },
  targetFocus: { preferredTargetId: "inheritance_seed_remnant_001", provider: "GraveRouteLockSystem" },
  nonFatalSystemErrors: []
};

const system = new GraveReturnContinuitySystem({
  recipeDataSystem,
  visualComposer,
  chemObjectSystem,
  playerRoot,
  scene,
  frameState
});
system.init();
system.update(1 / 60, frameState);
assert(frameState.graveReturnContinuity.active, "return current must become active after the Grave lock.");
assert(frameState.graveReturnContinuity.ready, "return current must be ready for movement.");
assert(!frameState.graveReturnContinuity.started, "return must not start while the player is away from the mouth.");
assert(frameState.activeCellId === recipe.sourceCell, "ready state must not change active cell.");

playerRoot.position.copy(system.curve.getPointAt(0));
frameState.frame += 1;
frameState.runtimeSeconds += 1 / 60;
system.update(1 / 60, frameState);
assert(frameState.graveReturnContinuity.started, "entering the mouth by movement must start the return.");
assert(frameState.chemObjectState.pulseResponse === "grave_return_current_entered_by_movement", "start result must identify movement, not pulse/absorb.");

for (let index = 1; index <= 20; index += 1) {
  const t = index / 20;
  playerRoot.position.copy(system.curve.getPointAt(t));
  frameState.frame += 1;
  frameState.runtimeSeconds += 0.1;
  system.update(0.1, frameState);
}

assert(frameState.graveReturnContinuity.completed, "following the full current must complete the return.");
assert(frameState.graveReturnContinuity.routeAwarenessRestored, "completion must restore route awareness.");
assert(frameState.activeCellId === recipe.destinationCell, "completion must make Signal Chorus active.");
assert(frameState.graveReturnContinuity.playerRelocation === false, "runtime state must report no relocation/teleport.");
assert(frameState.graveReturnContinuity.protectedRemainsConsumed === false, "runtime state must preserve protected remains.");
assert(frameState.graveReturnContinuity.inheritanceSeedRemnantOpened === false, "runtime state must preserve the closed inheritance seed.");
assert(frameState.lockState.nextIfPasses.includes("HC-005B"), "completion must point to HC-005B convergence.");
assert(!sourceRoot.visible, "Grave objects may fade out after return but must not be consumed.");
assert(destinationRoot.visible, "Signal Chorus objects must be visible after return.");
assert(!sourceRoot.userData.absorbed, "Grave object state must remain unconsumed.");

const diagnosis = buildRuntimeDiagnosticSummary(frameState);
assert(diagnosis.owner === "GraveReturnContinuitySystem", `diagnostic owner must be GraveReturnContinuitySystem, got ${diagnosis.owner}.`);
assert(diagnosis.complete, "diagnostic must report return complete.");
assert(diagnosis.progress === 1, "diagnostic must report 100% return progress.");
assert(diagnosis.expectedTarget === "none", "movement return must require no chem-object target.");
assert(diagnosis.blocker === "none_detected", `completed return must have no blocker, got ${diagnosis.blocker}.`);

console.log("validateGraveReturnContinuityHC005A validation passed.");
