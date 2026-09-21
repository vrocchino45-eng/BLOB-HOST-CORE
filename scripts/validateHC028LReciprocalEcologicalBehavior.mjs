import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { EntityReciprocalBehaviorSystem } from "../src/ecology/EntityReciprocalBehaviorSystem.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028L.json");
const contract = json("public/data/build/hc028lReciprocalEcologicalBehaviorContract.json");
const locks = json("public/data/build/hc028lLockedOwnerHashes.json");
const behaviorSource = read("src/ecology/EntityReciprocalBehaviorSystem.js");
const entitySource = read("src/ecology/EntitySystem.js");
const memorySource = read("src/ecology/EntityReciprocalMemorySystem.js");
const runtime = read("src/core/GameRuntime.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const boundary = read("src/morph/LocalCellBoundaryMorphSystem.js");

assert.match(main, /buildId:\s*"HC-028L"/);
assert.match(main, /Reciprocal Ecological Behavior/);
assert.equal(pkg.version, "0.28.20");
assert.equal(identity.parent, "HC-028K");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.12");
assert.equal(contract.scope.entityTypesAdded, 0);
assert.equal(contract.scope.newControls, false);
assert.equal(contract.scope.newCombat, false);
assert.equal(contract.scope.newTargeting, false);
assert.equal(contract.scope.newBondRules, false);
assert.equal(contract.scope.newRepairRules, false);
assert.equal(contract.scope.newProgression, false);
assert.equal(contract.scope.playerMovementChanged, false);
assert.equal(contract.scope.entityMovementChanged, true);
assert.equal(contract.scope.routeLogicChanged, false);
assert.equal(contract.scope.combReentryHotfixPreserved, true);
assert.equal(contract.scope.entitySystemRemainsMovementOwner, true);
assert.equal(contract.scope.newEntityAiOwnerAdded, false);
assert.equal(contract.behavior.hiddenAffinityScore, false);
assert.equal(contract.behavior.tenderRepairRateMayBeChangedByThisPass, false);
assert.equal(contract.behavior.tenderBondMayBeChangedByThisPass, false);
assert.equal(contract.behavior.watcherPositionMayBeChangedByThisPass, false);
assert.equal(contract.behavior.routeGuidanceAuthorityAdded, false);

// HC028L directive bridge must remain unable to move anything itself.
assert.match(behaviorSource, /EntityReciprocalMemorySystem/);
assert.match(behaviorSource, /entityBehaviorDirectiveAuthority:\s*true/);
assert.match(behaviorSource, /entityMovementAuthority:\s*false/);
assert.match(behaviorSource, /playerMovementAuthority:\s*false/);
assert.match(behaviorSource, /hiddenAffinityScore:\s*false/);
assert.match(behaviorSource, /bondAuthority:\s*false/);
assert.match(behaviorSource, /repairAuthority:\s*false/);
assert.match(behaviorSource, /combatAuthority:\s*false/);
assert.match(behaviorSource, /targetingAuthority:\s*false/);
assert.match(behaviorSource, /progressionAuthority:\s*false/);
assert.match(behaviorSource, /routeAuthority:\s*false/);
assert.doesNotMatch(behaviorSource, /playerRoot\.position\.(?:set|copy|add|sub|lerp)/);
assert.doesNotMatch(behaviorSource, /tenderBonded\s*=/);
assert.doesNotMatch(behaviorSource, /tenderRepairBoostSeconds\s*=/);
assert.doesNotMatch(behaviorSource, /health\s*=|damage\s*=/);

// Existing memory remains temporary/no-affinity source.
assert.match(memorySource, /hiddenAffinityScore:\s*false/);
assert.match(memorySource, /remainingSeconds/);
assert.match(memorySource, /care_exchange_retained/);
assert.match(memorySource, /counter_signature_retained/);

// EntitySystem remains movement owner and only applies bounded remembered behavior.
assert.match(entitySource, /frameState\.entityReciprocalBehavior/);
assert.match(entitySource, /remembered_care_approach/);
assert.match(entitySource, /remembered_protective_distance/);
assert.match(entitySource, /holding_remembered_sample/);
assert.match(entitySource, /counter_scanning_memory/);
assert.match(entitySource, /0\.32 \* reciprocalStrength/);
assert.match(entitySource, /baseCareRate = 0\.0012/);
assert.match(entitySource, /pulseCareRate = this\.tenderRepairBoostSeconds > 0 \? 0\.0042 : 0/);
assert.match(entitySource, /routeGuidanceAuthority: "GuideOrbiter"/);
assert.doesNotMatch(entitySource, /reciprocalStrength[^\n]*careRate/);
assert.doesNotMatch(entitySource, /reciprocalMode[^\n]*tenderBonded\s*=/);

// Runtime keeps authored entity owner first; relationship -> memory -> behavior are interpretation layers.
const entityRegister = runtime.indexOf('register("entitySystem"');
const relationshipRegister = runtime.indexOf('register("entityRelationshipGrammarSystem"');
const memoryRegister = runtime.indexOf('register("entityReciprocalMemorySystem"');
const behaviorRegister = runtime.indexOf('register("entityReciprocalBehaviorSystem"');
const ecologyRegister = runtime.indexOf('register("entityEcologyResonanceSystem"');
const telemetryRegister = runtime.indexOf('register("sessionTelemetrySystem"');
assert(entityRegister >= 0);
assert(relationshipRegister > entityRegister);
assert(memoryRegister > relationshipRegister);
assert(behaviorRegister > memoryRegister);
assert(ecologyRegister > behaviorRegister);
assert(telemetryRegister > ecologyRegister);
assert.match(runtime, /new EntityReciprocalBehaviorSystem/);

assert.match(telemetry, /blob\.session\.telemetry\.v1\.12/);
assert.match(telemetry, /ecology\.entity_reciprocal_behavior\.changed/);
assert.match(telemetry, /entityReciprocalBehaviorChanges/);
assert.match(telemetry, /entityMovementAuthority:\s*false/);
assert.match(telemetry, /hiddenAffinityScore:\s*false/);
assert.match(telemetry, /progressionAuthority:\s*false/);

// Comb hotfix semantics are still present in the locked boundary owner.
assert.match(boundary, /proximityReturnArmed/);
assert.match(boundary, /proximityReturnDepartureMargin/);

// Direct behavior proof: the same retained relationship memory becomes organism-specific next behavior.
const makeRoot = () => ({ visible: true, userData: {} });
const entitySystem = {
  entities: [
    { recipe: { id: "nursery_membrane_tender_001" }, root: makeRoot() },
    { recipe: { id: "membrane_watcher_001" }, root: makeRoot() }
  ]
};
const frameState = {
  entityReciprocalMemory: {
    active: true,
    byEntityId: {
      nursery_membrane_tender_001: {
        mode: "care_exchange_retained",
        interpretation: "safe_receive",
        strength01: 0.84
      },
      membrane_watcher_001: {
        mode: "sample_retained",
        interpretation: "contained_sampling",
        strength01: 0.78
      }
    }
  }
};
const system = new EntityReciprocalBehaviorSystem({ entitySystem, frameState });
system.init();
system.update(1 / 60, frameState);
let tender = frameState.entityReciprocalBehavior.byEntityId.nursery_membrane_tender_001;
let watcher = frameState.entityReciprocalBehavior.byEntityId.membrane_watcher_001;
assert.equal(tender.mode, "approach_care");
assert(tender.approach01 > 0.8);
assert.equal(tender.entityMovementAuthority, false);
assert.equal(watcher.mode, "hold_sample");
assert(watcher.track01 > 0.7);
assert.equal(watcher.entityMovementAuthority, false);
assert.equal(frameState.entityReciprocalBehavior.hiddenAffinityScore, false);
assert.equal(frameState.entityReciprocalBehavior.bondAuthority, false);
assert.equal(frameState.entityReciprocalBehavior.repairAuthority, false);

frameState.entityReciprocalMemory.byEntityId.nursery_membrane_tender_001 = {
  mode: "protective_distance_retained",
  interpretation: "guarded_draw",
  strength01: 0.72
};
frameState.entityReciprocalMemory.byEntityId.membrane_watcher_001 = {
  mode: "counter_signature_retained",
  interpretation: "counter_sensing",
  strength01: 0.74
};
system.update(1 / 60, frameState);
tender = frameState.entityReciprocalBehavior.byEntityId.nursery_membrane_tender_001;
watcher = frameState.entityReciprocalBehavior.byEntityId.membrane_watcher_001;
assert.equal(tender.mode, "guarded_space");
assert(tender.distance01 > 0.65);
assert.equal(watcher.mode, "counter_scan");
assert(watcher.scan01 > 0.7);

// All parent runtime owners outside the intentional behavior integration remain byte-identical.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC028K owner drifted: ${rel}`);
}
assert(locks.files["src/ecology/EntityReciprocalMemorySystem.js"]);
assert(locks.files["src/ecology/EntityRelationshipGrammarSystem.js"]);
assert(locks.files["src/morph/LocalCellBoundaryMorphSystem.js"]);
assert(!locks.files["src/ecology/EntitySystem.js"]);

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC028L Reciprocal Ecological Behavior: PASS");
console.log(JSON.stringify({
  build: identity.id,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount,
  tenderCareBehavior: "approach_care",
  tenderGuardBehavior: tender.mode,
  watcherSampleBehavior: "hold_sample",
  watcherCounterBehavior: watcher.mode
}, null, 2));
