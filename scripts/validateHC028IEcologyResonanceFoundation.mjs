import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028I.json");
const contract = json("public/data/build/hc028iEcologyResonanceFoundationContract.json");
const locks = json("public/data/build/hc028iLockedOwnerHashes.json");
const bridge = read("src/ecology/EntityEcologyResonanceSystem.js");
const runtime = read("src/core/GameRuntime.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const entityOwner = read("src/ecology/EntitySystem.js");
const entityRecipes = json("public/data/ecology/entityRecipes.json");

assert.match(main, /buildId:\s*"HC-028I"/);
assert.match(main, /Ecology Resonance Foundation/);
assert.equal(pkg.version, "0.28.16");
assert.equal(identity.parent, "HC-028H2");
assert.equal(contract.newEntityTypeAdded, false);
assert.equal(contract.genericEnemyAdded, false);
assert.equal(contract.combatChanged, false);
assert.equal(contract.entityBehaviorChanged, false);
assert.equal(contract.entityMovementChanged, false);
assert.equal(contract.bondRulesChanged, false);
assert.equal(contract.repairRulesChanged, false);
assert.equal(contract.progressionChanged, false);
assert.equal(contract.routeChanged, false);
assert.equal(contract.inputChanged, false);
assert.equal(contract.verbPowerChanged, false);
assert.equal(contract.worldCompositionChanged, false);
assert.equal(contract.coreResonanceChanged, false);
assert.equal(contract.audioMixChanged, false);
assert.equal(contract.sharedHostClock, true);
assert.equal(contract.crossRegionProof, "bonded_tender_only");
assert.equal(contract.watcherRemainsNurseryBound, true);
assert.equal(contract.telemetrySchema, "blob.session.telemetry.v1.9");
assert.deepEqual(entityRecipes.map((x) => x.id).sort(), ["membrane_watcher_001", "nursery_membrane_tender_001"]);

// New bridge consumes existing authored truths and remains presentation-only.
assert.match(bridge, /hostRhythm\?\.composition/);
assert.match(bridge, /regionalPhysicalEmbodiment/);
assert.match(bridge, /coreWorldResonance/);
assert.match(bridge, /currentFunction/);
assert.match(bridge, /nursery_membrane_tender_001/);
assert.match(bridge, /membrane_watcher_001/);
assert.match(bridge, /crescent_manta_soft_body/);
assert.match(bridge, /filter_frond/);
assert.match(bridge, /dominant_watcher_pupil/);
assert.match(bridge, /small_warning_pulse_ring/);
assert.match(bridge, /entityBehaviorAuthority:\s*false/);
assert.match(bridge, /entityMovementAuthority:\s*false/);
assert.match(bridge, /combatAuthority:\s*false/);
assert.match(bridge, /bondAuthority:\s*false/);
assert.match(bridge, /repairAuthority:\s*false/);
assert.match(bridge, /progressionAuthority:\s*false/);
assert.match(bridge, /newEntityTypeAdded:\s*false/);
assert.match(bridge, /functionId === "pulse"/);
assert.match(bridge, /functionId === "absorb"/);
assert.match(bridge, /functionId === "stabilize"/);
assert.doesNotMatch(bridge, /tenderBonded\s*=|tenderRepairBoostSeconds\s*=|playerRoot\.position|playerRoot\.velocity|damage\s*=|health\s*=/);

// Authored gameplay owner still contains the real behavior/bond/care pathways.
assert.match(entityOwner, /evaluateTenderBond/);
assert.match(entityOwner, /updateTenderCare/);
assert.match(entityOwner, /applyPulse/);
assert.match(entityOwner, /entity\.root\.visible = inNursery \|\| \(isTender && this\.tenderBonded\)/);

// EntitySystem resolves authored state first; HC028I resolves later after same-frame
// Core/world and H2 topology presentation, before read-only telemetry.
const entityRegister = runtime.indexOf('register("entitySystem"');
const coreWorldRegister = runtime.indexOf('register("coreWorldResonanceSystem"');
const h2Register = runtime.indexOf('register("coreTopologyVerbCharacterSystem"');
const ecologyRegister = runtime.indexOf('register("entityEcologyResonanceSystem"');
const telemetryRegister = runtime.indexOf('register("sessionTelemetrySystem"');
assert(entityRegister >= 0);
assert(coreWorldRegister > entityRegister);
assert(h2Register > coreWorldRegister);
assert(ecologyRegister > h2Register);
assert(telemetryRegister > ecologyRegister);
assert.match(runtime, /new EntityEcologyResonanceSystem/);
assert.match(runtime, /entitySystem:\s*this\.entitySystem/);

assert.match(telemetry, /blob\.session\.telemetry\.v1\.9/);
assert.match(telemetry, /ecology\.entity_resonance\.mode_changed/);
assert.match(telemetry, /entityEcologyResonanceModeChanges/);
assert.match(telemetry, /behaviorAuthority:\s*false/);
assert.match(telemetry, /combatAuthority:\s*false/);

// All owners promised locked to HC028H2 must remain byte-identical.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC028H2 owner drifted: ${rel}`);
}

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC028I Ecology Resonance Foundation: PASS");
console.log(JSON.stringify({
  build: identity.id,
  authoredEntityCount: entityRecipes.length,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount
}, null, 2));
