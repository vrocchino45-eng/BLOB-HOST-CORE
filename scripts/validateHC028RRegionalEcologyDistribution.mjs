import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import vm from "node:vm";
import { EntityRelationshipGrammarSystem } from "../src/ecology/EntityRelationshipGrammarSystem.js";
import { EntityReciprocalMemorySystem } from "../src/ecology/EntityReciprocalMemorySystem.js";
import { EntityReciprocalBehaviorSystem } from "../src/ecology/EntityReciprocalBehaviorSystem.js";
import { EntityResidueRecognitionSystem } from "../src/ecology/EntityResidueRecognitionSystem.js";
import { EntityEcologicalCrossInfluenceSystem } from "../src/ecology/EntityEcologicalCrossInfluenceSystem.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const pkg = json("package.json");
const main = read("src/main.js");
const identity = json("public/data/build/currentBuildIdentity_HC028R.json");
const contract = json("public/data/build/hc028rRegionalEcologyDistributionContract.json");
const locks = json("public/data/build/hc028rLockedOwnerHashes.json");
const cells = json("public/data/world/localCellRecipes.json");
const regions = json("public/data/world/firstSliceRegions_HC006I.json");
const recipes = json("public/data/ecology/entityRecipes.json");

const cell = (id) => cells.find((item) => item.id === id);
const placements = (id) => cell(id)?.contents?.entityPlacements ?? [];
const ids = (id) => placements(id).map((p) => p.instanceId);

assert.match(main, /buildId:\s*"HC-028R"/);
assert.match(main, /Regional Ecology Distribution/);
assert.equal(pkg.version, "0.28.28");
assert.equal(identity.parent, "HC-028Q");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.17");
assert.equal(recipes.length, 3, "R distributes the three existing species; it must not invent organism #4");
assert.equal(contract.populationModel.instanceAware, true);
assert.equal(contract.populationModel.recipeReuse, true);
assert.equal(contract.populationModel.newOrganismRecipes, 0);
assert.equal(contract.populationModel.apertureEcologyMounted, false);
for (const value of Object.values(contract.forbidden)) assert.equal(value, false);

assert.deepEqual(ids("CELL_VASCULAR_RHYTHM_ROUTE_001"), [
  "vascular_relay_001", "vascular_relay_mid_001", "vascular_relay_downstream_001"
]);
assert.deepEqual(ids("CELL_GRAVE_MEMORY_RESIDUE_BED_001"), ["grave_memory_watcher_001"]);
assert.deepEqual(ids("CELL_SILT_PRESSURE_ROUTE_001"), ["silt_pressure_relay_001"]);
assert.deepEqual(ids("CELL_COMB_THRESHOLD_FILTER_001"), ["comb_filter_watcher_001", "comb_filter_relay_001"]);
assert.equal(placements("CELL_APERTURE_FIELDS_ARRIVAL_001").length, 0);
const apertureRegion = regions.find((r) => r.id === "aperture_fields");
assert.equal(apertureRegion?.ecologyGameplayReady, false, "Aperture source still forbids full mounted ecology");

const recipeIds = new Set(recipes.map((r) => r.id));
for (const c of cells) {
  for (const p of c.contents?.entityPlacements ?? []) {
    assert(recipeIds.has(p.recipeId), `placement ${p.instanceId} references unknown recipe ${p.recipeId}`);
    assert(p.instanceId && p.instanceId !== p.recipeId || p.instanceId === "vascular_relay_001");
  }
}

const entitySource = read("src/ecology/EntitySystem.js");
assert.match(entitySource, /contents\?\.entityPlacements/);
assert.match(entitySource, /entityInstanceId/);
assert.match(entitySource, /isNurseryWatcher/);
assert.match(entitySource, /updateRegionalWatcher/);
assert.match(entitySource, /activeCellPopulation/);
assert.match(entitySource, /const entityId = entity\.instanceId \?\? entity\.recipe\.id/);
assert.doesNotMatch(entitySource, /playerRoot\.position\.(?:add|sub|copy|set)\(/, "ecology distribution must not move the player");

for (const rel of [
  "src/ecology/EntityRelationshipGrammarSystem.js",
  "src/ecology/EntityReciprocalMemorySystem.js",
  "src/ecology/EntityReciprocalBehaviorSystem.js",
  "src/ecology/EntityLocalMatterCouplingSystem.js",
  "src/ecology/EntityEcologicalResidueSystem.js",
  "src/ecology/EntityResidueRecognitionSystem.js",
  "src/ecology/EntityEcologicalCrossInfluenceSystem.js",
  "src/ecology/EntityEcologyResonanceSystem.js"
]) {
  const source = read(rel);
  assert.match(source, /instanceId/, `${rel} must understand population instance identity`);
}

// Multi-instance proof: two Relay individuals share one species recipe but retain separate ecology keys.
const relayRecipe = recipes.find((r) => r.id === "vascular_relay_001");
const makeRoot = (x) => ({ visible: true, position: { x, y: 0, z: 0 }, userData: {} });
const relayA = { instanceId: "relay_test_a", recipe: relayRecipe, root: makeRoot(0.9) };
const relayB = { instanceId: "relay_test_b", recipe: relayRecipe, root: makeRoot(1.4) };
const relaySystem = {
  entities: [relayA, relayB],
  tenderBonded: false,
  playerRoot: { position: { distanceTo(pos) { return Math.hypot(pos.x, pos.y, pos.z); } } }
};
const frameState = {
  coreVerbEngineCoupling: {
    active: true,
    chord: "project",
    functionDrive: { pulse: 1, absorb: 0, stabilize: 0 },
    presentation: { fullSystemLoad01: 0.2 },
    dominantFunction: "pulse"
  }
};
const relationship = new EntityRelationshipGrammarSystem({ entitySystem: relaySystem, frameState });
relationship.init();
relationship.update(0.016, frameState);
assert(frameState.entityRelationshipGrammar.byEntityId.relay_test_a);
assert(frameState.entityRelationshipGrammar.byEntityId.relay_test_b);
assert.equal(Object.keys(frameState.entityRelationshipGrammar.byEntityId).length, 2);

const memory = new EntityReciprocalMemorySystem({ entitySystem: relaySystem, frameState });
memory.init();
for (let i = 0; i < 36; i += 1) memory.update(0.02, frameState);
assert(frameState.entityReciprocalMemory.byEntityId.relay_test_a);
assert(frameState.entityReciprocalMemory.byEntityId.relay_test_b);
assert.notEqual(frameState.entityReciprocalMemory.byEntityId.relay_test_a, frameState.entityReciprocalMemory.byEntityId.relay_test_b);

const behavior = new EntityReciprocalBehaviorSystem({ entitySystem: relaySystem, frameState });
behavior.init();
behavior.update(0.016, frameState);
assert.equal(frameState.entityReciprocalBehavior.byEntityId.relay_test_a.mode, "forward_relay");
assert.equal(frameState.entityReciprocalBehavior.byEntityId.relay_test_b.mode, "forward_relay");

// Self/other recognition must compare individual identity, not species identity.
const watcherRecipe = recipes.find((r) => r.id === "membrane_watcher_001");
const watcherA = { instanceId: "watcher_test_a", recipe: watcherRecipe, root: makeRoot(0) };
const watcherB = { instanceId: "watcher_test_b", recipe: watcherRecipe, root: makeRoot(0.75) };
const watcherSystem = { entities: [watcherA, watcherB], tenderBonded: false, playerRoot: relaySystem.playerRoot };
const recognitionFrame = {
  entityEcologicalResidue: {
    active: true,
    fields: [{
      entityId: "watcher_test_a", recipeId: "membrane_watcher_001", mode: "sample_imprint",
      residueStage: "retained_trace", strength01: 0.7, radius: 1.2,
      position: { x: 0, y: 0, z: 0 }
    }]
  }
};
const recognition = new EntityResidueRecognitionSystem({ entitySystem: watcherSystem, frameState: recognitionFrame });
recognition.init();
recognition.update(0.016, recognitionFrame);
assert.equal(recognitionFrame.entityResidueRecognition.byEntityId.watcher_test_a.relation, "self_trace");
assert.equal(recognitionFrame.entityResidueRecognition.byEntityId.watcher_test_b.relation, "other_trace");
assert.equal(recognitionFrame.entityResidueRecognition.byEntityId.watcher_test_b.interpretation, "foreign_sample_compare");

const cross = new EntityEcologicalCrossInfluenceSystem({ entitySystem: watcherSystem, frameState: recognitionFrame });
cross.init();
cross.update(0.5, recognitionFrame);
assert.equal(recognitionFrame.entityEcologicalCrossInfluence.fields.length, 1);
assert.equal(recognitionFrame.entityEcologicalCrossInfluence.fields[0].entityId, "watcher_test_b");
assert.equal(recognitionFrame.entityEcologicalCrossInfluence.fields[0].sourceEntityId, "watcher_test_a");
assert.equal(recognitionFrame.entityEcologicalCrossInfluence.fields[0].createsResidue, false);

// Descendant proof of the HC028L1 startup-scope fix.
const boundary = read("src/morph/LocalCellBoundaryMorphSystem.js");
const extractMethodBody = (source, signature) => {
  const start = source.indexOf(signature); assert(start >= 0);
  const open = source.indexOf("{", start); let depth = 0, quote = null, escaped = false, line = false, block = false;
  for (let i = open; i < source.length; i += 1) {
    const ch = source[i], next = source[i + 1];
    if (line) { if (ch === "\n") line = false; continue; }
    if (block) { if (ch === "*" && next === "/") { block = false; i += 1; } continue; }
    if (quote) { if (escaped) { escaped = false; continue; } if (ch === "\\") { escaped = true; continue; } if (ch === quote) quote = null; continue; }
    if (ch === "/" && next === "/") { line = true; i += 1; continue; }
    if (ch === "/" && next === "*") { block = true; i += 1; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth += 1;
    if (ch === "}") { depth -= 1; if (depth === 0) return source.slice(open + 1, i); }
  }
  throw new Error("unterminated method");
};
const earlyBody = extractMethodBody(boundary, "\n  publishEarlyReturnTraversal(frameState, nearest)");
assert.doesNotMatch(earlyBody, /\brecipe\b/);
const context = vm.createContext({
  EARLY_SURFACE_CELL: "SURFACE", EARLY_GUIDE_CELL: "GUIDE", EARLY_HUB_CELL: "HUB",
  EARLY_RETURN_SEAMS_HC026B: [
    { id: "surface_guide", label: "Surface Guide", cells: ["SURFACE", "GUIDE"], anchor: [0,0,0] },
    { id: "guide_hub", label: "Guide Hub", cells: ["GUIDE", "HUB"], anchor: [1,0,0] }
  ], Boolean, Math
});
const earlyFn = vm.runInContext(`(function(frameState, nearest) {${earlyBody}\n})`, context);
const boundaryOwner = {
  earlyReturnActiveTransition: null, earlyReturnHasReachedHub: true,
  earlyReturnCounts: { hubToGuide:0, guideToHub:0, guideToSurface:0, surfaceToGuide:0 },
  earlyReturnSignatureForCell(cellId) { return cellId ? { cellId } : null; }
};
const boundaryState = { activeCellId: "HUB" };
assert.doesNotThrow(() => earlyFn.call(boundaryOwner, boundaryState, null));
assert.equal(boundaryState.firstSliceReturnTraversal.deliberateGuidedApproach, false);

for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC028Q owner drifted: ${rel}`);
}
assert.equal(Object.keys(locks.files).length, 100);
for (const mustLock of [
  "src/routes/VascularRhythmRouteSystem.js",
  "src/routes/SiltPressureRouteSystem.js",
  "src/thresholds/CombThresholdPlayableSystem.js",
  "src/player/PlayerMovementController.js",
  "src/camera/CameraReadabilitySystem.js",
  "src/world/AmbientMaterialInteractionSystem.js",
  "src/morph/LocalCellBoundaryMorphSystem.js"
]) assert(locks.files[mustLock], `expected locked owner: ${mustLock}`);

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC028R Regional Ecology Distribution: PASS");
console.log(JSON.stringify({
  build: identity.id,
  parent: identity.parent,
  speciesRecipes: recipes.length,
  distributedInstances: Object.values(contract.distribution).flat().length,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount,
  apertureEcologyMounted: contract.populationModel.apertureEcologyMounted,
  telemetrySchema: identity.telemetrySchema
}, null, 2));
