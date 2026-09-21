import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const pkg = json("package.json");
const main = read("src/main.js");
const runtime = read("src/core/GameRuntime.js");
const compression = read("src/presentation/VisualHierarchyCompressionSystem.js");
const targeting = read("src/targeting/TargetingSystem.js");
const physicalization = read("src/player/CoreVerbPhysicalizationSystem.js");
const reactive = read("src/interaction/ReactiveStateGrammarSystem.js");
const personality = read("src/interaction/ResponsePersonalitySystem.js");
const identity = json("public/data/build/currentBuildIdentity_HC030B1.json");
const contract = json("public/data/build/hc030b1VisualHierarchyCompressionContract.json");
const locks = json("public/data/build/hc030b1LockedOwnerHashes.json");

assert.match(main, /buildId:\s*"HC-030B1"/);
assert.match(main, /Visual Hierarchy Compression/);
assert.equal(pkg.version, "0.30.2");
assert.equal(identity.parent, "HC-030B");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.20");
assert.equal(contract.owner, "VisualHierarchyCompressionSystem");
for (const value of Object.values(contract.forbidden)) assert.equal(value, false);

// Presentation-only owner is instantiated after targeting exists and executes after
// CoreVerbPhysicalization has authored its normal frame, immediately before camera/render.
assert.match(runtime, /VisualHierarchyCompressionSystem/);
assert.match(runtime, /targetingSystem:\s*this\.targetingSystem/);
assert.match(runtime, /coreVerbPhysicalizationSystem:\s*this\.coreVerbPhysicalizationSystem/);
const physicalUpdate = runtime.indexOf("this.coreVerbPhysicalizationSystem?.update(dt, this.frameState)");
const compressionUpdate = runtime.indexOf("this.visualHierarchyCompressionSystem?.update(dt, this.frameState)");
const cameraUpdate = runtime.indexOf("this.updateCamera(dt)");
assert(physicalUpdate >= 0 && compressionUpdate > physicalUpdate && cameraUpdate > compressionUpdate);

// Hard axis becomes a faded segmented trace; acquisition and instability can briefly
// restore readability, but target response is explicitly left untouched.
assert.match(compression, /segmentOpacities = \[0\.26, 0\.62, 1\.0, 0\.62, 0\.26\]/);
assert.match(compression, /source\.visible = false/);
assert.match(compression, /baseOpacity = 0\.026/);
assert.match(compression, /targetResponseRemainsUntouched:\s*true/);
assert.match(compression, /primary:\s*"target_material_state_and_response"/);
assert.match(compression, /tertiary:\s*"rings_lines_wireframes"/);

// Support geometry is compressed selectively rather than globally dimming the world.
assert.match(compression, /pulseChargeShell\.material\.opacity/);
assert.match(compression, /pulseContours/);
assert.match(compression, /absorbLine\.material\.opacity/);
assert.match(compression, /absorbFunnel/);
assert.match(compression, /absorbFilaments/);
assert.match(compression, /stabilizeLine\.material\.opacity/);
assert.match(compression, /stabilizeField/);
assert.doesNotMatch(compression, /chemObjectSystem\..*=|bondSystem\..*=|relationshipTarget\s*=/);

// Locked gameplay/state owners retain their known contract markers.
assert.match(targeting, /candidateSwitchMargin = 0\.52/);
assert.match(targeting, /relationshipReleaseGraceSeconds = 0\.28/);
assert.match(physicalization, /verbVisualGrammar: "pulse_contour_propagation_absorb_helical_transfer_stabilize_gyroscopic_lock"/);
assert.match(reactive, /coherentMax:\s*0\.30/);
assert.match(reactive, /unstableMax:\s*0\.72/);
assert.match(personality, /conditionOwnerRemainsHC030A:\s*true/);

// Every parent runtime owner outside main/runtime integration is byte locked. This
// includes TargetingSystem, CoreVerbPhysicalization, HC030A and HC030B owners.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC030B owner drifted: ${rel}`);
}
assert.equal(Object.keys(locks.files).length, 111);
assert.deepEqual(locks.newRuntimeFiles, ["src/presentation/VisualHierarchyCompressionSystem.js"]);

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC030B1 Visual Hierarchy Compression: PASS");
console.log(JSON.stringify({
  build: identity.id,
  parent: identity.parent,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount,
  hierarchy: contract.visualHierarchy
}, null, 2));
