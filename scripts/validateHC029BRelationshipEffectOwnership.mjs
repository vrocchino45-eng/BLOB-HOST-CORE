import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const pkg = json("package.json");
const main = read("src/main.js");
const chem = read("src/chemistry/ChemObjectSystem.js");
const physical = read("src/player/CoreVerbPhysicalizationSystem.js");
const ambient = read("src/world/AmbientMaterialInteractionSystem.js");
const targeting = read("src/targeting/TargetingSystem.js");
const identity = json("public/data/build/currentBuildIdentity_HC029B.json");
const contract = json("public/data/build/hc029bRelationshipEffectOwnershipContract.json");
const locks = json("public/data/build/hc029bLockedOwnerHashes.json");
const parentLocks = json("public/data/build/hc029aLockedOwnerHashes.json");

assert.match(main, /buildId:\s*"HC-029B"/);
assert.match(main, /Relationship Effect Ownership/);
assert.equal(pkg.version, "0.29.2");
assert.equal(identity.parent, "HC-029A");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.18");
assert.equal(contract.runtimeOrder.reordered, false);
assert.equal(contract.effectOwnership.pulse.ambientResponseStrength, 0.22);
assert.equal(contract.effectOwnership.stabilize.ambientScaleWhileFocused, 0.38);
for (const value of Object.values(contract.forbidden)) assert.equal(value, false);

// Pulse remains a broad inquiry, but only the relationship/candidate owner gets full recoil.
assert.match(chem, /registerPulseResponse\(item, strength = 1\)/);
assert.match(chem, /relationshipOwned \? 1 : 0\.22/);
assert.match(chem, /focusedObject/);
assert.match(chem, /ambientObjects/);
assert.match(chem, /relationship_focus_plus_ambient_inquiry/);
assert.match(chem, /affectedObjects intentionally remains the broad inquiry set/);

// Stabilize prioritizes the retained relationship and only then falls back to older route/Host behavior.
const relationshipIndex = physical.indexOf("const relationshipTargetId = frameState.targeting?.relationshipActive");
const assistIndex = physical.indexOf("const assist = frameState.interactionAssist");
assert(relationshipIndex >= 0 && assistIndex > relationshipIndex, "relationship Stabilize owner must precede interactionAssist fallback");
assert.match(physical, /ownership: "focused_relationship"/);
assert.match(physical, /stabilizeEffectOwnership/);
assert.match(physical, /pulseEffectOwnership/);

// Ambient Host answer remains, but becomes visually subordinate while focused Stabilize is active.
assert.match(ambient, /relationshipStabilizeActive/);
assert.match(ambient, /ambientStabilizeScale = relationshipStabilizeActive \? 0\.38 : 1/);
assert.match(ambient, /retained_target_gets_focused_coherence_host_receives_weaker_ambient_order/);

// HC029A targeting architecture itself is locked: no threshold/hand-off retune in this pass.
assert.match(targeting, /candidateSwitchMargin = 0\.52/);
assert.match(targeting, /relationshipReleaseGraceSeconds = 0\.28/);
assert.match(targeting, /relationshipHandoffCooldownSeconds = 0\.24/);
assert.match(targeting, /currentAim < 0\.18 && candidateAim > 0\.68/);
assert.equal(sha("src/targeting/TargetingSystem.js"), locks.files["src/targeting/TargetingSystem.js"]);

// All non-scope runtime owners are byte locked to the HC029A package state.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC029A owner drifted: ${rel}`);
}
assert.equal(Object.keys(locks.files).length, 106);
for (const rel of locks.excludedIntentionalRuntimeDiffs) assert(!locks.files[rel]);

// Parent HC028R lock proof still exists; HC029B does not disturb its historical contract.
assert.equal(Object.keys(parentLocks.files).length, 106);

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC029B Relationship Effect Ownership: PASS");
console.log(JSON.stringify({
  build: identity.id,
  parent: identity.parent,
  lockedOwners: Object.keys(locks.files).length,
  pulse: contract.effectOwnership.pulse,
  stabilize: contract.effectOwnership.stabilize,
  runtimeOrder: contract.runtimeOrder
}, null, 2));
