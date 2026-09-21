import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { EntityRelationshipGrammarSystem } from "../src/ecology/EntityRelationshipGrammarSystem.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028J.json");
const contract = json("public/data/build/hc028jEntityRelationshipGrammarContract.json");
const locks = json("public/data/build/hc028jLockedOwnerHashes.json");
const relationship = read("src/ecology/EntityRelationshipGrammarSystem.js");
const ecology = read("src/ecology/EntityEcologyResonanceSystem.js");
const runtime = read("src/core/GameRuntime.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const entityOwner = read("src/ecology/EntitySystem.js");
const entityRecipes = json("public/data/ecology/entityRecipes.json");

assert.match(main, /buildId:\s*"HC-028J"/);
assert.match(main, /Entity Relationship Grammar Foundation/);
assert.equal(pkg.version, "0.28.18");
assert.equal(identity.parent, "HC-028I1");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.10");
assert.equal(contract.scope.entityTypesAdded, 0);
assert.equal(contract.scope.newControls, false);
assert.equal(contract.scope.newCombat, false);
assert.equal(contract.scope.newTargeting, false);
assert.equal(contract.scope.newBondRules, false);
assert.equal(contract.scope.newRepairRules, false);
assert.equal(contract.scope.newProgression, false);
assert.equal(contract.scope.entityMovementChanged, false);
assert.equal(contract.scope.entityBehaviorOwnerChanged, false);
assert.equal(contract.scope.verbPowerChanged, false);
assert.equal(contract.scope.routeLogicChanged, false);
assert.equal(contract.scope.combReentryHotfixPreserved, true);
assert.equal(contract.grammar.inputTimingGate, false);
assert.equal(contract.grammar.bondMayBeChangedByThisPass, false);
assert.deepEqual(entityRecipes.map((x) => x.id).sort(), ["membrane_watcher_001", "nursery_membrane_tender_001"]);

// Relationship bridge must read the canonical chord and remain non-authoritative.
assert.match(relationship, /coreVerbEngineCoupling/);
assert.match(relationship, /cohere_project/);
assert.match(relationship, /cohere_draw/);
assert.match(relationship, /exchange/);
assert.match(relationship, /full_system/);
assert.match(relationship, /safe_receive/);
assert.match(relationship, /contained_sampling/);
assert.match(relationship, /reciprocal_exchange/);
assert.match(relationship, /counter_sensing/);
assert.match(relationship, /entityBehaviorAuthority:\s*false/);
assert.match(relationship, /entityMovementAuthority:\s*false/);
assert.match(relationship, /bondAuthority:\s*false/);
assert.match(relationship, /repairAuthority:\s*false/);
assert.match(relationship, /combatAuthority:\s*false/);
assert.match(relationship, /targetingAuthority:\s*false/);
assert.match(relationship, /verbPowerAuthority:\s*false/);
assert.match(relationship, /progressionAuthority:\s*false/);
assert.match(relationship, /inputTimingGate:\s*false/);
assert.doesNotMatch(relationship, /tenderBonded\s*=/);
assert.doesNotMatch(relationship, /tenderRepairBoostSeconds\s*=/);
assert.doesNotMatch(relationship, /playerRoot\.position\.(?:set|copy|add|sub|lerp)/);
assert.doesNotMatch(relationship, /health\s*=|damage\s*=/);

// HC028I presentation owner now consumes relationship interpretation without taking behavior authority.
assert.match(ecology, /entityRelationshipGrammar/);
assert.match(ecology, /relationshipInterpretation/);
assert.match(ecology, /relationshipEngagement01/);
assert.match(ecology, /relReciprocity/);
assert.match(ecology, /behaviorAuthority:\s*false/);
assert.match(ecology, /combatAuthority:\s*false/);
assert.match(ecology, /bondAuthority:\s*false/);
assert.match(ecology, /repairAuthority:\s*false/);

// EntitySystem remains the authored gameplay owner.
assert.match(entityOwner, /evaluateTenderBond/);
assert.match(entityOwner, /updateTenderCare/);
assert.match(entityOwner, /applyPulse/);

// Runtime order: authored entity state -> same-frame Core chord -> relationship interpretation -> ecology body presentation -> telemetry.
const entityRegister = runtime.indexOf('register("entitySystem"');
const chordRegister = runtime.indexOf('register("coreVerbEngineCouplingSystem"');
const relationshipRegister = runtime.indexOf('register("entityRelationshipGrammarSystem"');
const ecologyRegister = runtime.indexOf('register("entityEcologyResonanceSystem"');
const telemetryRegister = runtime.indexOf('register("sessionTelemetrySystem"');
assert(entityRegister >= 0);
assert(chordRegister > entityRegister);
assert(relationshipRegister > chordRegister);
assert(ecologyRegister > relationshipRegister);
assert(telemetryRegister > ecologyRegister);
assert.match(runtime, /new EntityRelationshipGrammarSystem/);

assert.match(telemetry, /blob\.session\.telemetry\.v1\.10/);
assert.match(telemetry, /ecology\.entity_relationship\.changed/);
assert.match(telemetry, /entityRelationshipGrammarChanges/);
assert.match(telemetry, /verbPowerAuthority:\s*false/);

// Behavioral interpretation proof using only the read-only bridge.
const playerRoot = { position: { distanceTo: (p) => p.distance } };
const makeEntity = (id, distance) => ({ recipe: { id }, root: { visible: true, position: { distance }, name: id } });
const entitySystem = {
  playerRoot,
  tenderBonded: true,
  entities: [makeEntity("nursery_membrane_tender_001", 2), makeEntity("membrane_watcher_001", 2.5)]
};
const frameState = {
  coreVerbEngineCoupling: {
    active: true,
    chord: "cohere_draw",
    dominantFunction: "stabilize",
    functionDrive: { pulse: 0, absorb: 1, stabilize: 1 },
    presentation: { fullSystemLoad01: 0.67 }
  }
};
const system = new EntityRelationshipGrammarSystem({ entitySystem, frameState });
system.init();
system.update(1 / 60, frameState);
assert.equal(frameState.entityRelationshipGrammar.byEntityId.nursery_membrane_tender_001.interpretation, "safe_receive");
assert.equal(frameState.entityRelationshipGrammar.byEntityId.membrane_watcher_001.interpretation, "contained_sampling");
assert.equal(frameState.entityRelationshipGrammar.bondAuthority, false);
assert.equal(frameState.entityRelationshipGrammar.verbPowerAuthority, false);

// All owners promised locked to HC028I1 must remain byte-identical.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC028I1 owner drifted: ${rel}`);
}

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC028J Entity Relationship Grammar Foundation: PASS");
console.log(JSON.stringify({
  build: identity.id,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount,
  tenderCohereDraw: frameState.entityRelationshipGrammar.byEntityId.nursery_membrane_tender_001.interpretation,
  watcherCohereDraw: frameState.entityRelationshipGrammar.byEntityId.membrane_watcher_001.interpretation
}, null, 2));
