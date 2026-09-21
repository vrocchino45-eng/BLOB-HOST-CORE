import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { EntityReciprocalMemorySystem } from "../src/ecology/EntityReciprocalMemorySystem.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028K.json");
const contract = json("public/data/build/hc028kReciprocalEcologicalMemoryContract.json");
const locks = json("public/data/build/hc028kLockedOwnerHashes.json");
const memorySource = read("src/ecology/EntityReciprocalMemorySystem.js");
const relationshipSource = read("src/ecology/EntityRelationshipGrammarSystem.js");
const ecologySource = read("src/ecology/EntityEcologyResonanceSystem.js");
const entityOwner = read("src/ecology/EntitySystem.js");
const runtime = read("src/core/GameRuntime.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");

assert.match(main, /buildId:\s*"HC-028K"/);
assert.match(main, /Reciprocal Ecological Memory/);
assert.equal(pkg.version, "0.28.19");
assert.equal(identity.parent, "HC-028J");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.11");
assert.equal(contract.scope.entityTypesAdded, 0);
assert.equal(contract.scope.newControls, false);
assert.equal(contract.scope.newCombat, false);
assert.equal(contract.scope.newTargeting, false);
assert.equal(contract.scope.newBondRules, false);
assert.equal(contract.scope.newRepairRules, false);
assert.equal(contract.scope.newProgression, false);
assert.equal(contract.scope.playerMovementChanged, false);
assert.equal(contract.scope.entityMovementChanged, false);
assert.equal(contract.scope.verbPowerChanged, false);
assert.equal(contract.scope.routeLogicChanged, false);
assert.equal(contract.scope.combReentryHotfixPreserved, true);
assert.equal(contract.memory.hiddenAffinityScore, false);
assert.equal(contract.memory.preciseBeatTimingRequired, false);
assert.equal(contract.memory.memoryPersistsAfterRelease, true);
assert.equal(contract.memory.bondMayBeChangedByThisPass, false);
assert.equal(contract.memory.repairMayBeChangedByThisPass, false);
assert.equal(contract.memory.progressionMayBeChangedByThisPass, false);

// New memory owner must remain non-authoritative and must not smuggle in an affinity score.
assert.match(memorySource, /EntityRelationshipGrammarSystem/);
assert.match(memorySource, /hiddenAffinityScore:\s*false/);
assert.match(memorySource, /inputTimingGate:\s*false/);
assert.match(memorySource, /entityBehaviorAuthority:\s*false/);
assert.match(memorySource, /entityMovementAuthority:\s*false/);
assert.match(memorySource, /bondAuthority:\s*false/);
assert.match(memorySource, /repairAuthority:\s*false/);
assert.match(memorySource, /combatAuthority:\s*false/);
assert.match(memorySource, /targetingAuthority:\s*false/);
assert.match(memorySource, /verbPowerAuthority:\s*false/);
assert.match(memorySource, /progressionAuthority:\s*false/);
assert.match(memorySource, /routeAuthority:\s*false/);
assert.match(memorySource, /remainingSeconds/);
assert.match(memorySource, /responsePulse01/);
assert.match(memorySource, /reciprocity_retained/);
assert.match(memorySource, /sample_retained/);
assert.doesNotMatch(memorySource, /tenderBonded\s*=/);
assert.doesNotMatch(memorySource, /tenderRepairBoostSeconds\s*=/);
assert.doesNotMatch(memorySource, /playerRoot\.position\.(?:set|copy|add|sub|lerp)/);
assert.doesNotMatch(memorySource, /health\s*=|damage\s*=/);

// HC028J interpretation remains the source; HC028K memory must not replace it.
assert.match(relationshipSource, /safe_receive/);
assert.match(relationshipSource, /contained_sampling/);
assert.match(relationshipSource, /bondAuthority:\s*false/);

// Presentation owner consumes memory but keeps gameplay authority false.
assert.match(ecologySource, /entityReciprocalMemory/);
assert.match(ecologySource, /reciprocalMemoryMode/);
assert.match(ecologySource, /reciprocalMemoryStrength01/);
assert.match(ecologySource, /reciprocalResponsePulse01/);
assert.match(ecologySource, /memoryReply/);
assert.match(ecologySource, /behaviorAuthority:\s*false/);
assert.match(ecologySource, /combatAuthority:\s*false/);
assert.match(ecologySource, /bondAuthority:\s*false/);
assert.match(ecologySource, /repairAuthority:\s*false/);

// Existing gameplay owner remains present and locked by parent hash.
assert.match(entityOwner, /evaluateTenderBond/);
assert.match(entityOwner, /updateTenderCare/);
assert.match(entityOwner, /applyPulse/);

// Runtime order: entity authored state -> chord interpretation -> reciprocal memory -> body presentation -> telemetry.
const entityRegister = runtime.indexOf('register("entitySystem"');
const chordRegister = runtime.indexOf('register("coreVerbEngineCouplingSystem"');
const relationshipRegister = runtime.indexOf('register("entityRelationshipGrammarSystem"');
const memoryRegister = runtime.indexOf('register("entityReciprocalMemorySystem"');
const ecologyRegister = runtime.indexOf('register("entityEcologyResonanceSystem"');
const telemetryRegister = runtime.indexOf('register("sessionTelemetrySystem"');
assert(entityRegister >= 0);
assert(chordRegister > entityRegister);
assert(relationshipRegister > chordRegister);
assert(memoryRegister > relationshipRegister);
assert(ecologyRegister > memoryRegister);
assert(telemetryRegister > ecologyRegister);
assert.match(runtime, /new EntityReciprocalMemorySystem/);

assert.match(telemetry, /blob\.session\.telemetry\.v1\.11/);
assert.match(telemetry, /ecology\.entity_reciprocal_memory\.committed/);
assert.match(telemetry, /entityReciprocalMemoryCommits/);
assert.match(telemetry, /hiddenAffinityScore:\s*false/);
assert.match(telemetry, /progressionAuthority:\s*false/);

// Direct persistence proof: same cohere+draw chord leaves different retained memory by organism.
const makeRoot = () => ({ visible: true, userData: {} });
const entitySystem = {
  entities: [
    { recipe: { id: "nursery_membrane_tender_001" }, root: makeRoot() },
    { recipe: { id: "membrane_watcher_001" }, root: makeRoot() }
  ]
};
const frameState = {
  entityRelationshipGrammar: {
    active: true,
    chord: "cohere_draw",
    byEntityId: {
      nursery_membrane_tender_001: {
        chord: "cohere_draw",
        interpretation: "safe_receive",
        bonded: true,
        engagement01: 0.84,
        gesture: { outward01: 0, inward01: 0.72, settle01: 0.72, reciprocity01: 0 }
      },
      membrane_watcher_001: {
        chord: "cohere_draw",
        interpretation: "contained_sampling",
        bonded: false,
        engagement01: 0.78,
        gesture: { outward01: 0, inward01: 0.66, settle01: 0.66, reciprocity01: 0 }
      }
    }
  }
};
const system = new EntityReciprocalMemorySystem({ entitySystem, frameState });
system.init();
for (let i = 0; i < 42; i += 1) system.update(1 / 60, frameState);
const tenderCommitted = frameState.entityReciprocalMemory.byEntityId.nursery_membrane_tender_001;
const watcherCommitted = frameState.entityReciprocalMemory.byEntityId.membrane_watcher_001;
assert.equal(tenderCommitted.mode, "care_exchange_retained");
assert.equal(watcherCommitted.mode, "sample_retained");
assert(tenderCommitted.strength01 > 0.5);
assert(watcherCommitted.strength01 > 0.5);
assert(frameState.entityReciprocalMemory.commitCount >= 2);
assert.equal(frameState.entityReciprocalMemory.hiddenAffinityScore, false);
assert.equal(frameState.entityReciprocalMemory.bondAuthority, false);
assert.equal(frameState.entityReciprocalMemory.repairAuthority, false);

frameState.entityRelationshipGrammar = { active: false, chord: "idle", byEntityId: {} };
for (let i = 0; i < 60; i += 1) system.update(1 / 60, frameState);
const tenderAfterRelease = frameState.entityReciprocalMemory.byEntityId.nursery_membrane_tender_001;
const watcherAfterRelease = frameState.entityReciprocalMemory.byEntityId.membrane_watcher_001;
assert.equal(tenderAfterRelease.mode, "care_exchange_retained");
assert.equal(watcherAfterRelease.mode, "sample_retained");
assert(tenderAfterRelease.remainingSeconds > 0);
assert(watcherAfterRelease.remainingSeconds > 0);
assert(tenderAfterRelease.strength01 > 0.2);
assert(watcherAfterRelease.strength01 > 0.2);

// All owners promised locked to HC028J remain byte-identical.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC028J owner drifted: ${rel}`);
}
assert(locks.files["src/ecology/EntitySystem.js"]);
assert(locks.files["src/ecology/EntityRelationshipGrammarSystem.js"]);
assert(locks.files["src/morph/LocalCellBoundaryMorphSystem.js"]);

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC028K Reciprocal Ecological Memory: PASS");
console.log(JSON.stringify({
  build: identity.id,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount,
  commits: frameState.entityReciprocalMemory.commitCount,
  tenderMemory: tenderAfterRelease.mode,
  tenderRemainingSeconds: tenderAfterRelease.remainingSeconds,
  watcherMemory: watcherAfterRelease.mode,
  watcherRemainingSeconds: watcherAfterRelease.remainingSeconds
}, null, 2));
