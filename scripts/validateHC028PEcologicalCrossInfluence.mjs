import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import vm from "node:vm";
import { EntityEcologicalCrossInfluenceSystem } from "../src/ecology/EntityEcologicalCrossInfluenceSystem.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028P.json");
const contract = json("public/data/build/hc028pEcologicalCrossInfluenceContract.json");
const locks = json("public/data/build/hc028pLockedOwnerHashes.json");
const crossSource = read("src/ecology/EntityEcologicalCrossInfluenceSystem.js");
const runtime = read("src/core/GameRuntime.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const ambient = read("src/world/AmbientMaterialInteractionSystem.js");
const residueSource = read("src/ecology/EntityEcologicalResidueSystem.js");
const recognitionSource = read("src/ecology/EntityResidueRecognitionSystem.js");
const entitySource = read("src/ecology/EntitySystem.js");
const boundary = read("src/morph/LocalCellBoundaryMorphSystem.js");

assert.match(main, /buildId:\s*"HC-028P"/);
assert.match(main, /Ecological Cross-Influence/);
assert.equal(pkg.version, "0.28.26");
assert.equal(identity.parent, "HC-028O");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.17");
assert.equal(contract.crossInfluence.otherOrganismResidueOnly, true);
assert.equal(contract.crossInfluence.selfTraceTriggersCrossInfluence, false);
assert.equal(contract.crossInfluence.oneShotPerContinuousRecognition, true);
assert.equal(contract.crossInfluence.requiresRecognitionResetToRetrigger, true);
assert.equal(contract.crossInfluence.createsResidue, false);
assert.equal(contract.crossInfluence.recursivePropagation, false);
assert.equal(contract.crossInfluence.usesExistingHostMotes, true);
assert.equal(contract.crossInfluence.presentationOwner, "AmbientMaterialInteractionSystem");
assert.equal(contract.crossInfluence.gameplayOwnerUnchanged, "EntitySystem");
for (const value of Object.values(contract.authority)) assert.equal(value, false);
for (const [key, value] of Object.entries(contract.scope)) {
  if (key.endsWith("Preserved")) assert.equal(value, true);
}

assert.match(crossSource, /relation === "other_trace"/);
assert.match(crossSource, /selfTraceCrossInfluence:\s*false/);
assert.match(crossSource, /createsResidue:\s*false/);
assert.match(crossSource, /recursivePropagation:\s*false/);
assert.match(crossSource, /writesReciprocalMemory:\s*false/);
assert.match(crossSource, /entityMovementAuthority:\s*false/);
assert.match(crossSource, /hiddenAffinityScore:\s*false/);
assert.doesNotMatch(crossSource, /localStorage|sessionStorage|indexedDB/i);
assert.doesNotMatch(crossSource, /tenderBonded\s*=|tenderRepairBoostSeconds\s*=/);
assert.doesNotMatch(crossSource, /new THREE\.(?:Points|Mesh|Line|Group)/);
assert.doesNotMatch(residueSource, /entityEcologicalCrossInfluence/, "HC028N residue owner must not read cross-influence");
assert.doesNotMatch(recognitionSource, /entityEcologicalCrossInfluence/, "HC028O recognition must not recurse through cross-influence");

assert.match(runtime, /EntityEcologicalCrossInfluenceSystem/);
assert.match(runtime, /entityEcologicalCrossInfluenceSystem/);
const recognitionRegister = runtime.indexOf('register("entityResidueRecognitionSystem"');
const ecologyRegister = runtime.indexOf('register("entityEcologyResonanceSystem"');
const crossRegister = runtime.indexOf('register("entityEcologicalCrossInfluenceSystem"');
const localMatterRegister = runtime.indexOf('register("entityLocalMatterCouplingSystem"');
const residueRegister = runtime.indexOf('register("entityEcologicalResidueSystem"');
assert(recognitionRegister > 0 && ecologyRegister > recognitionRegister);
assert(crossRegister > ecologyRegister);
assert(localMatterRegister > crossRegister);
assert(residueRegister > localMatterRegister);
assert.match(runtime, /cannot create residue or recursive propagation/);
assert.match(ambient, /entityEcologicalCrossInfluenceFields/);
assert.match(ambient, /HC028P: another organism's residue may provoke one brief Host-matter answer/);
assert.match(ambient, /uses only the existing 66 motes/);
assert.match(telemetry, /blob\.session\.telemetry\.v1\.17/);
assert.match(telemetry, /ecology\.entity_cross_influence\.changed/);
assert.match(entitySource, /class EntitySystem/);

const root = (x, y, z, visible = true) => ({ visible, position: { x, y, z }, userData: {} });
const tenderRoot = root(0, 0, 0);
const watcherRoot = root(1.45, 0, 0);
const entitySystem = { entities: [
  { recipe: { id: "nursery_membrane_tender_001" }, root: tenderRoot },
  { recipe: { id: "membrane_watcher_001" }, root: watcherRoot }
] };
const frameState = {
  entityResidueRecognition: {
    byEntityId: {
      nursery_membrane_tender_001: {
        active: true,
        relation: "other_trace",
        strength01: 0.62,
        interpretation: "sensor_trace_caution",
        sourceEntityId: "membrane_watcher_001",
        sourceMode: "sample_imprint",
        residuePosition: { x: 0.4, y: 0, z: 0 }
      },
      membrane_watcher_001: {
        active: true,
        relation: "other_trace",
        strength01: 0.70,
        interpretation: "care_signature_sample",
        sourceEntityId: "nursery_membrane_tender_001",
        sourceMode: "care_afterimage",
        residuePosition: { x: 1.0, y: 0, z: 0 }
      }
    }
  }
};
const system = new EntityEcologicalCrossInfluenceSystem({ entitySystem, frameState });
system.init();
system.update(0.20, frameState);
assert.equal(frameState.entityEcologicalCrossInfluence.active, true);
assert.equal(frameState.entityEcologicalCrossInfluence.fields.length, 2);
const tenderField = frameState.entityEcologicalCrossInfluence.fields.find((field) => field.entityId === "nursery_membrane_tender_001");
const watcherField = frameState.entityEcologicalCrossInfluence.fields.find((field) => field.entityId === "membrane_watcher_001");
assert(tenderField);
assert(watcherField);
assert.equal(tenderField.mode, "protective_listening_hush");
assert.equal(tenderField.sourceEntityId, "membrane_watcher_001");
assert.equal(tenderField.relation, "other_trace");
assert.equal(watcherField.mode, "foreign_signature_hold");
assert.equal(watcherField.sourceEntityId, "nursery_membrane_tender_001");
assert.equal(watcherField.createsResidue, false);
assert.equal(watcherField.writesReciprocalMemory, false);
assert.equal(frameState.entityEcologicalCrossInfluence.recursivePropagation, false);

// Cross-influence follows the recognizing organism during its short response window.
tenderRoot.position.x = 0.55;
system.update(0.10, frameState);
const movedTenderField = frameState.entityEcologicalCrossInfluence.fields.find((field) => field.entityId === "nursery_membrane_tender_001");
assert.equal(movedTenderField.position.x, 0.55);
assert.deepEqual(movedTenderField.sourceResiduePosition, { x: 0.4, y: 0, z: 0 });

// A self-trace may still be recognized by HC028O but cannot create HC028P cross-influence.
frameState.entityResidueRecognition.byEntityId.nursery_membrane_tender_001 = {
  active: true,
  relation: "self_trace",
  strength01: 0.9,
  interpretation: "familiar_care_trace",
  sourceEntityId: "nursery_membrane_tender_001",
  sourceMode: "care_afterimage",
  residuePosition: { x: 0.55, y: 0, z: 0 }
};
// Let the already-started Tender response expire; same self trace must not re-arm it.
for (let i = 0; i < 60; i += 1) system.update(0.10, frameState);
assert.equal(
  frameState.entityEcologicalCrossInfluence.fields.some((field) => field.entityId === "nursery_membrane_tender_001"),
  false
);

// The Watcher's continuous recognition is one-shot: after its response expires it
// does not continuously re-trigger from the same unchanged residue.
for (let i = 0; i < 60; i += 1) system.update(0.10, frameState);
assert.equal(frameState.entityEcologicalCrossInfluence.active, false);
for (let i = 0; i < 20; i += 1) system.update(0.10, frameState);
assert.equal(frameState.entityEcologicalCrossInfluence.active, false);

// Recognition must genuinely reset before the Watcher can answer that trace again.
frameState.entityResidueRecognition.byEntityId.membrane_watcher_001 = { active: false, relation: "none", strength01: 0 };
system.update(0.1, frameState);
frameState.entityResidueRecognition.byEntityId.membrane_watcher_001 = {
  active: true,
  relation: "other_trace",
  strength01: 0.7,
  interpretation: "counter_echo_compare",
  sourceEntityId: "nursery_membrane_tender_001",
  sourceMode: "counter_scan_echo",
  residuePosition: { x: 1.0, y: 0, z: 0 }
};
system.update(0.2, frameState);
const retriggeredWatcher = frameState.entityEcologicalCrossInfluence.fields.find((field) => field.entityId === "membrane_watcher_001");
assert(retriggeredWatcher);
assert.equal(retriggeredWatcher.mode, "cross_signature_compare");

// Descendant proof of the HC028L1 startup-scope fix. The historical validator is
// build-identity-bound, so execute the exact fixed method body without `recipe` scope.
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
  assert.equal(sha(rel), expected, `locked HC028O owner drifted: ${rel}`);
}
assert.equal(Object.keys(locks.files).length, 105);
assert(locks.files["src/ecology/EntitySystem.js"]);
assert(locks.files["src/ecology/EntityResidueRecognitionSystem.js"]);
assert(locks.files["src/ecology/EntityEcologicalResidueSystem.js"]);
assert(locks.files["src/ecology/EntityLocalMatterCouplingSystem.js"]);
assert(locks.files["src/ecology/EntityEcologyResonanceSystem.js"]);
assert(locks.files["src/camera/CameraReadabilitySystem.js"]);
assert(locks.files["src/morph/LocalCellBoundaryMorphSystem.js"]);
assert(locks.files["src/player/PlayerMovementController.js"]);

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC028P Ecological Cross-Influence: PASS");
console.log(JSON.stringify({
  build: identity.id,
  parent: identity.parent,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount,
  telemetrySchema: identity.telemetrySchema,
  responseDurationSeconds: contract.crossInfluence.responseDurationSeconds,
  recursivePropagation: contract.crossInfluence.recursivePropagation
}, null, 2));
