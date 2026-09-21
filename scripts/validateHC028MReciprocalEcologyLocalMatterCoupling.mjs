import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { EntityLocalMatterCouplingSystem } from "../src/ecology/EntityLocalMatterCouplingSystem.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028M.json");
const contract = json("public/data/build/hc028mReciprocalEcologyLocalMatterCouplingContract.json");
const locks = json("public/data/build/hc028mLockedOwnerHashes.json");
const couplingSource = read("src/ecology/EntityLocalMatterCouplingSystem.js");
const ambientSource = read("src/world/AmbientMaterialInteractionSystem.js");
const runtime = read("src/core/GameRuntime.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const boundary = read("src/morph/LocalCellBoundaryMorphSystem.js");

assert.match(main, /buildId:\s*"HC-028M"/);
assert.match(main, /Reciprocal Ecology Local Matter Coupling/);
assert.equal(pkg.version, "0.28.22");
assert.equal(identity.parent, "HC-028L1");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.13");
assert.equal(contract.scope.entityTypesAdded, 0);
assert.equal(contract.scope.newControls, false);
assert.equal(contract.scope.newCombat, false);
assert.equal(contract.scope.newProgression, false);
assert.equal(contract.scope.playerMovementChanged, false);
assert.equal(contract.scope.entityMovementChanged, false);
assert.equal(contract.scope.routeLogicChanged, false);
assert.equal(contract.scope.combReentryHotfixPreserved, true);
assert.equal(contract.scope.startupScopeHotfixPreserved, true);
assert.equal(contract.scope.newParticleFieldAdded, false);
assert.equal(contract.scope.newGeometryAdded, false);
assert.equal(contract.scope.newDrawCallsAdded, false);
assert.equal(contract.coupling.usesExistingHostMotes, true);
assert.equal(contract.coupling.maxAuthoredFields, 2);
assert.equal(contract.coupling.hiddenAffinityScore, false);
assert.equal(contract.coupling.playerMovementAuthority, false);
assert.equal(contract.coupling.entityMovementAuthority, false);
assert.equal(contract.coupling.collisionAuthority, false);
assert.equal(contract.coupling.chemistryAuthority, false);
assert.equal(contract.coupling.bondAuthority, false);
assert.equal(contract.coupling.repairAuthority, false);
assert.equal(contract.coupling.progressionAuthority, false);
assert.equal(contract.coupling.routeAuthority, false);

// Coupling bridge has no world/entity mutation authority of its own.
assert.match(couplingSource, /usesExistingHostMotes:\s*true/);
assert.match(couplingSource, /addsParticles:\s*false/);
assert.match(couplingSource, /addsGeometry:\s*false/);
assert.match(couplingSource, /addsDrawCalls:\s*false/);
assert.match(couplingSource, /playerMovementAuthority:\s*false/);
assert.match(couplingSource, /entityMovementAuthority:\s*false/);
assert.match(couplingSource, /collisionAuthority:\s*false/);
assert.match(couplingSource, /chemistryAuthority:\s*false/);
assert.match(couplingSource, /bondAuthority:\s*false/);
assert.match(couplingSource, /repairAuthority:\s*false/);
assert.match(couplingSource, /progressionAuthority:\s*false/);
assert.match(couplingSource, /routeAuthority:\s*false/);
assert.doesNotMatch(couplingSource, /playerRoot/);
assert.doesNotMatch(couplingSource, /\.position\.(?:set|copy|add|sub|lerp)\(/);
assert.doesNotMatch(couplingSource, /tenderBonded\s*=/);
assert.doesNotMatch(couplingSource, /tenderRepairBoostSeconds\s*=/);

// Existing Host mote owner consumes the bridge; no second particle/mesh field exists.
assert.match(ambientSource, /frameState\.entityLocalMatterCoupling/);
assert.match(ambientSource, /entityMatterFields/);
assert.match(ambientSource, /HC028M: retained organism relationships can shape only the nearby existing/);
assert.match(ambientSource, /entityLocalMatterCouplingUsesExistingMotes:\s*true/);
assert.match(ambientSource, /entityLocalMatterCouplingAddsParticles:\s*false/);
assert.match(ambientSource, /entityLocalMatterCouplingAddsGeometry:\s*false/);
assert.match(ambientSource, /entityLocalMatterCouplingAddsDrawCalls:\s*false/);
assert.doesNotMatch(couplingSource, /new THREE\.(?:Points|Mesh|Line|Group)/);

// Runtime keeps the ecology interpretation chain, then publishes local matter coupling.
const entityRegister = runtime.indexOf('register("entitySystem"');
const relationshipRegister = runtime.indexOf('register("entityRelationshipGrammarSystem"');
const memoryRegister = runtime.indexOf('register("entityReciprocalMemorySystem"');
const behaviorRegister = runtime.indexOf('register("entityReciprocalBehaviorSystem"');
const ecologyRegister = runtime.indexOf('register("entityEcologyResonanceSystem"');
const couplingRegister = runtime.indexOf('register("entityLocalMatterCouplingSystem"');
const telemetryRegister = runtime.indexOf('register("sessionTelemetrySystem"');
assert(entityRegister >= 0);
assert(relationshipRegister > entityRegister);
assert(memoryRegister > relationshipRegister);
assert(behaviorRegister > memoryRegister);
assert(ecologyRegister > behaviorRegister);
assert(couplingRegister > ecologyRegister);
assert(telemetryRegister > couplingRegister);
assert.match(runtime, /new EntityLocalMatterCouplingSystem/);

assert.match(telemetry, /blob\.session\.telemetry\.v1\.13/);
assert.match(telemetry, /ecology\.entity_local_matter_coupling\.changed/);
assert.match(telemetry, /entityLocalMatterCouplingChanges/);

// HC028I1 + HC028L1 return/startup fixes remain intact.
assert.match(boundary, /proximityReturnArmed/);
assert.match(boundary, /proximityReturnDepartureMargin/);
const earlyStart = boundary.indexOf("publishEarlyReturnTraversal(frameState, nearest)");
const earlyEnd = boundary.indexOf("\n  ", earlyStart + 10);
const earlySnippet = boundary.slice(earlyStart, earlyEnd > earlyStart ? earlyEnd : earlyStart + 2200);
assert.doesNotMatch(earlySnippet, /\brecipe\b/);

// Direct proof: remembered Tender vs Watcher relationships produce distinct local matter fields.
const root = (x, y, z) => ({ visible: true, position: { x, y, z }, userData: {} });
const entitySystem = {
  entities: [
    { recipe: { id: "nursery_membrane_tender_001" }, root: root(1, 0.4, -2) },
    { recipe: { id: "membrane_watcher_001" }, root: root(-1.2, 0.7, -1.4) }
  ]
};
const frameState = {
  regionalPhysicalEmbodiment: { active: true, region: "Surface Wake", matter: "living_suspension_membrane", law: "soft_exchange", phraseStrength: 0.7 },
  entityReciprocalMemory: {
    byEntityId: {
      nursery_membrane_tender_001: { mode: "care_exchange_retained", strength01: 0.84 },
      membrane_watcher_001: { mode: "sample_retained", strength01: 0.78 }
    }
  },
  entityReciprocalBehavior: {
    byEntityId: {
      nursery_membrane_tender_001: { mode: "approach_care", strength01: 0.84 },
      membrane_watcher_001: { mode: "hold_sample", strength01: 0.78 }
    }
  }
};
const system = new EntityLocalMatterCouplingSystem({ entitySystem, frameState });
system.init();
system.update(1 / 60, frameState);
const tender = frameState.entityLocalMatterCoupling.fields.find((field) => field.entityId === "nursery_membrane_tender_001");
const watcher = frameState.entityLocalMatterCoupling.fields.find((field) => field.entityId === "membrane_watcher_001");
assert(tender);
assert(watcher);
assert.equal(tender.mode, "care_breath");
assert.equal(watcher.mode, "sample_hold");
assert(tender.breathAmplitude > watcher.breathAmplitude);
assert(watcher.dampingBias > tender.dampingBias);
assert.equal(tender.playerMovementAuthority, false);
assert.equal(watcher.entityMovementAuthority, false);
assert.equal(frameState.entityLocalMatterCoupling.fields.length, 2);
assert.equal(frameState.entityLocalMatterCoupling.addsParticles, false);
assert.equal(frameState.entityLocalMatterCoupling.hiddenAffinityScore, false);

// Alternate retained modes stay organism-specific.
frameState.entityReciprocalMemory.byEntityId.nursery_membrane_tender_001 = { mode: "protective_distance_retained", strength01: 0.72 };
frameState.entityReciprocalBehavior.byEntityId.nursery_membrane_tender_001 = { mode: "guarded_space", strength01: 0.72 };
frameState.entityReciprocalMemory.byEntityId.membrane_watcher_001 = { mode: "counter_signature_retained", strength01: 0.74 };
frameState.entityReciprocalBehavior.byEntityId.membrane_watcher_001 = { mode: "counter_scan", strength01: 0.74 };
system.update(1 / 60, frameState);
const tenderGuard = frameState.entityLocalMatterCoupling.fields.find((field) => field.entityId === "nursery_membrane_tender_001");
const watcherScan = frameState.entityLocalMatterCoupling.fields.find((field) => field.entityId === "membrane_watcher_001");
assert.equal(tenderGuard.mode, "protective_retraction");
assert.equal(watcherScan.mode, "counter_sense_ripple");
assert(watcherScan.tangentialBias > tenderGuard.tangentialBias);

// Every unrelated parent runtime owner remains byte-identical to HC028L1.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC028L1 owner drifted: ${rel}`);
}
assert.equal(Object.keys(locks.files).length, 102);
assert(locks.files["src/ecology/EntitySystem.js"]);
assert(locks.files["src/ecology/EntityReciprocalMemorySystem.js"]);
assert(locks.files["src/ecology/EntityReciprocalBehaviorSystem.js"]);
assert(locks.files["src/morph/LocalCellBoundaryMorphSystem.js"]);

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC028M Reciprocal Ecology Local Matter Coupling: PASS");
console.log(JSON.stringify({
  build: identity.id,
  parent: identity.parent,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount,
  tenderField: tenderGuard.mode,
  watcherField: watcherScan.mode,
  newParticles: false,
  gameplayAuthority: false
}, null, 2));
