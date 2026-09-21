import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import vm from "node:vm";
import { EntityResidueRecognitionSystem } from "../src/ecology/EntityResidueRecognitionSystem.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028O.json");
const contract = json("public/data/build/hc028oResidueRecognitionContract.json");
const locks = json("public/data/build/hc028oLockedOwnerHashes.json");
const recognitionSource = read("src/ecology/EntityResidueRecognitionSystem.js");
const ecologySource = read("src/ecology/EntityEcologyResonanceSystem.js");
const runtime = read("src/core/GameRuntime.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const residueSource = read("src/ecology/EntityEcologicalResidueSystem.js");
const boundary = read("src/morph/LocalCellBoundaryMorphSystem.js");

assert.match(main, /buildId:\s*"HC-028O"/);
assert.match(main, /Residue Recognition/);
assert.equal(pkg.version, "0.28.25");
assert.equal(identity.parent, "HC-028N");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.16");
assert.equal(contract.recognition.readsPriorFrameResidue, true);
assert.equal(contract.recognition.oneFrameNonCircularHandoff, true);
assert.equal(contract.recognition.consumesResidue, false);
assert.equal(contract.recognition.refreshesResidue, false);
assert.equal(contract.recognition.writesReciprocalMemory, false);
assert.equal(contract.recognition.presentationOwner, "EntityEcologyResonanceSystem");
assert.equal(contract.recognition.gameplayOwnerUnchanged, "EntitySystem");
for (const value of Object.values(contract.authority)) assert.equal(value, false);
for (const [key, value] of Object.entries(contract.scope)) {
  if (key.endsWith("Preserved")) assert.equal(value, true);
}

assert.match(recognitionSource, /consumesResidue:\s*false/);
assert.match(recognitionSource, /refreshesResidue:\s*false/);
assert.match(recognitionSource, /writesReciprocalMemory:\s*false/);
assert.match(recognitionSource, /entityBehaviorAuthority:\s*false/);
assert.match(recognitionSource, /entityMovementAuthority:\s*false/);
assert.match(recognitionSource, /hiddenAffinityScore:\s*false/);
assert.doesNotMatch(recognitionSource, /localStorage|sessionStorage|indexedDB/i);
assert.doesNotMatch(recognitionSource, /tenderBonded\s*=|tenderRepairBoostSeconds\s*=/);
assert.doesNotMatch(recognitionSource, /new THREE\.(?:Points|Mesh|Line|Group)/);

assert.match(runtime, /EntityResidueRecognitionSystem/);
assert.match(runtime, /entityResidueRecognitionSystem/);
const recognitionRegister = runtime.indexOf('register("entityResidueRecognitionSystem"');
const ecologyRegister = runtime.indexOf('register("entityEcologyResonanceSystem"');
const residueRegister = runtime.indexOf('register("entityEcologicalResidueSystem"');
assert(recognitionRegister > 0 && ecologyRegister > recognitionRegister);
assert(residueRegister > ecologyRegister);
assert.match(runtime, /prior-frame HC028N residue/);
assert.match(ecologySource, /residueRecognitionInterpretation/);
assert.match(ecologySource, /familiar_care_trace|ambient_trace_unread/);
assert.match(ecologySource, /residueSample01/);
assert.match(telemetry, /blob\.session\.telemetry\.v1\.16/);
assert.match(telemetry, /ecology\.entity_residue_recognition\.changed/);

// HC028N residue owner remains passive and unchanged in authority semantics.
assert.match(residueSource, /worldSpaceFrozen:\s*true/);
assert.match(residueSource, /saveStateAuthority:\s*false/);
assert.match(residueSource, /durationRangeSeconds:\s*\[20, 45\]/);

const root = (x, y, z, visible = true) => ({ visible, position: { x, y, z }, userData: {} });
const tenderRoot = root(0, 0, 0);
const watcherRoot = root(1.45, 0, 0);
const entitySystem = { entities: [
  { recipe: { id: "nursery_membrane_tender_001" }, root: tenderRoot },
  { recipe: { id: "membrane_watcher_001" }, root: watcherRoot }
] };
const careField = {
  entityId: "nursery_membrane_tender_001",
  mode: "care_afterimage",
  residueStage: "retained_trace",
  strength01: 0.22,
  radius: 1.65,
  position: { x: 0.42, y: 0, z: 0 }
};
const frameState = {
  entityEcologicalResidue: { active: true, fields: [careField] }
};
const originalCare = JSON.stringify(frameState.entityEcologicalResidue.fields);
const system = new EntityResidueRecognitionSystem({ entitySystem, frameState });
system.init();
system.update(0.016, frameState);

const tenderCare = frameState.entityResidueRecognition.byEntityId.nursery_membrane_tender_001;
const watcherCare = frameState.entityResidueRecognition.byEntityId.membrane_watcher_001;
assert.equal(tenderCare.active, true);
assert.equal(tenderCare.interpretation, "familiar_care_trace");
assert.equal(tenderCare.relation, "self_trace");
assert.equal(watcherCare.active, true);
assert.equal(watcherCare.interpretation, "care_signature_sample");
assert.equal(watcherCare.relation, "other_trace");
assert(watcherCare.strength01 > 0);
assert.equal(JSON.stringify(frameState.entityEcologicalResidue.fields), originalCare, "recognition must not mutate residue");
assert.equal(frameState.entityResidueRecognition.consumesResidue, false);
assert.equal(frameState.entityResidueRecognition.writesReciprocalMemory, false);

// Watcher sample leaves a different information signature for both organisms.
frameState.entityEcologicalResidue = { active: true, fields: [{
  entityId: "membrane_watcher_001",
  mode: "sample_imprint",
  residueStage: "retained_trace",
  strength01: 0.18,
  radius: 1.35,
  position: { x: 1.20, y: 0, z: 0 }
}] };
system.update(0.016, frameState);
const tenderSample = frameState.entityResidueRecognition.byEntityId.nursery_membrane_tender_001;
const watcherSample = frameState.entityResidueRecognition.byEntityId.membrane_watcher_001;
assert.equal(tenderSample.interpretation, "sensor_trace_caution");
assert.equal(watcherSample.interpretation, "known_sample_verify");
assert.equal(watcherSample.relation, "self_trace");

// Fading residue is still readable but weaker than the same retained trace.
const retainedStrength = watcherSample.strength01;
frameState.entityEcologicalResidue.fields[0].residueStage = "fading_trace";
system.update(0.016, frameState);
const fadingStrength = frameState.entityResidueRecognition.byEntityId.membrane_watcher_001.strength01;
assert(fadingStrength < retainedStrength);

// Leaving sense range returns to ambient without writing any new state.
tenderRoot.position.x = 20;
watcherRoot.position.x = 22;
system.update(0.016, frameState);
assert.equal(frameState.entityResidueRecognition.active, false);
assert.equal(frameState.entityResidueRecognition.recognitions.length, 0);

// Descendant proof of the HC028L1 startup-scope fix. The historical HC028L1
// validator is intentionally build-identity-bound, so execute the exact fixed
// method body here without any `recipe` variable in scope.
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
  assert.equal(sha(rel), expected, `locked HC028N owner drifted: ${rel}`);
}
assert.equal(Object.keys(locks.files).length, 104);
assert(locks.files["src/ecology/EntitySystem.js"]);
assert(locks.files["src/ecology/EntityEcologicalResidueSystem.js"]);
assert(locks.files["src/ecology/EntityLocalMatterCouplingSystem.js"]);
assert(locks.files["src/world/AmbientMaterialInteractionSystem.js"]);
assert(locks.files["src/camera/CameraReadabilitySystem.js"]);
assert(locks.files["src/morph/LocalCellBoundaryMorphSystem.js"]);
assert(locks.files["src/player/PlayerMovementController.js"]);

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC028O Residue Recognition: PASS");
console.log(JSON.stringify({
  build: identity.id,
  parent: identity.parent,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount,
  telemetrySchema: identity.telemetrySchema,
  recognitionRadius: contract.recognition.recognitionRadius
}, null, 2));
