import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import vm from "node:vm";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const pkg = json("package.json");
const main = read("src/main.js");
const runtime = read("src/core/GameRuntime.js");
const targeting = read("src/targeting/TargetingSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const identity = json("public/data/build/currentBuildIdentity_HC029A.json");
const contract = json("public/data/build/hc029aRelationshipTargetingContract.json");
const locks = json("public/data/build/hc029aLockedOwnerHashes.json");

assert.match(main, /buildId:\s*"HC-029A"/);
assert.match(main, /Relationship Targeting & Intentional Focus/);
assert.equal(pkg.version, "0.29.1");
assert.equal(identity.parent, "HC-028R");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.18");
assert.equal(contract.relationshipModel.manualCycleButton, false);
assert.equal(contract.symbolGrammarSeed.genericLockRingRetired, true);
assert.equal(contract.locked.targetFocusRegistry, true);
for (const value of Object.values(contract.forbidden)) assert.equal(value, false);

// Ownership boundary: existing focus rules stay world/context authority; targeting gains camera intent only.
assert.match(runtime, /new TargetingSystem\(\{[\s\S]*?camera:\s*this\.camera/);
assert.match(targeting, /this\.candidate = null/);
assert.match(targeting, /this\.relationshipTarget = null/);
assert.match(targeting, /candidateSwitchMargin = 0\.52/);
assert.match(targeting, /relationshipReleaseGraceSeconds = 0\.28/);
assert.match(targeting, /relationshipHandoffCooldownSeconds = 0\.24/);
assert.match(targeting, /camera_intent_plus_score_margin/);
assert.match(targeting, /currentAim < 0\.18 && candidateAim > 0\.68/);
assert.match(targeting, /this\.camera\.getWorldDirection/);
assert.match(targeting, /relationship_target_invalid/);
assert.match(targeting, /verb_engaged/);
assert.match(targeting, /intentional_camera_handoff/);
assert.doesNotMatch(targeting, /guideFocusPressed[\s\S]{0,120}relationship/, "Y/Focus must not become a fourth world manipulation verb");

// First production symbol grammar: opposed directional triangles + coherence boundary.
assert.match(targeting, /relationship_glyph_pulse_outward_triangle/);
assert.match(targeting, /relationship_glyph_absorb_inward_triangle/);
assert.match(targeting, /relationship_glyph_stabilize_coherence_boundary/);
assert.match(targeting, /instabilityRisk/);
assert.match(targeting, /legacy_target_lock_reticle_hc029a_disabled/);
assert.match(targeting, /candidate_body_only/);
assert.match(targeting, /diegetic_relationship_glyph/);

// Extract pure relationship helpers without importing THREE.
const extractMethodBody = (source, signature) => {
  const start = source.indexOf(signature); assert(start >= 0, `missing ${signature}`);
  const closeParen = source.indexOf(")", start); const open = source.indexOf("{", closeParen); let depth = 0, quote = null, escaped = false, line = false, block = false;
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
  throw new Error(`unterminated ${signature}`);
};

const intentBody = extractMethodBody(targeting, "\n  resolveRelationshipIntent(input = {})");
const intentFn = vm.runInNewContext(`(function(input = {}) {${intentBody}\n})`);
assert.equal(Array.from(intentFn({ pulseHeld: true }).verbs).join(","), "pulse");
assert.equal(Array.from(intentFn({ absorbHeld: true, stabilizeHeld: true }).verbs).join(","), "absorb,stabilize");
assert.equal(intentFn({ guideFocusPressed: true }).active, false, "Y/Focus must remain outside P/A/S relationship intent");

const handoffBody = extractMethodBody(targeting, "\n  shouldHandoff(current, candidate)");
const handoffFn = vm.runInNewContext(`(function(current, candidate) {${handoffBody}\n})`);
const current = { recipe: { id: "path" }, aimDot: 0.74, score: 8.0, distance: 3.2 };
const passer = { recipe: { id: "fleck" }, aimDot: 0.81, score: 8.8, distance: 3.0 };
assert.equal(handoffFn(current, passer), false, "slightly better nearby candidate must not steal established relationship");
const redirectedCurrent = { recipe: { id: "path" }, aimDot: 0.05, score: 6.3, distance: 3.4 };
const deliberateNew = { recipe: { id: "fleck" }, aimDot: 0.86, score: 7.2, distance: 3.1 };
assert.equal(handoffFn(redirectedCurrent, deliberateNew), true, "clear camera redirect should permit relationship handoff");

// Telemetry now distinguishes soft candidate churn from actual retained relationship changes.
assert.match(telemetry, /blob\.session\.telemetry\.v1\.18/);
assert.match(telemetry, /attention\.candidate\.changed/);
assert.match(telemetry, /const targetId = targeting\.relationshipTargetId \?\? "none"/);
assert.match(telemetry, /this\.lastRelationshipTargetId !== "none" && targetId !== "none"/);

// Descendant proof of the HC028L1 startup-scope repair remains mandatory.
const boundary = read("src/morph/LocalCellBoundaryMorphSystem.js");
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
  assert.equal(sha(rel), expected, `locked HC028R owner drifted: ${rel}`);
}
assert.equal(Object.keys(locks.files).length, 106);
for (const mustLock of [
  "src/targeting/TargetFocusRegistry.js",
  "src/player/PlayerMovementController.js",
  "src/camera/CameraReadabilitySystem.js",
  "src/world/AmbientMaterialInteractionSystem.js",
  "src/ecology/EntitySystem.js",
  "src/morph/LocalCellBoundaryMorphSystem.js",
  "src/routes/VascularRhythmRouteSystem.js",
  "src/routes/SiltPressureRouteSystem.js",
  "src/thresholds/CombThresholdPlayableSystem.js"
]) assert(locks.files[mustLock], `expected locked owner: ${mustLock}`);

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC029A Relationship Targeting & Intentional Focus: PASS");
console.log(JSON.stringify({
  build: identity.id,
  parent: identity.parent,
  telemetrySchema: identity.telemetrySchema,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount,
  relationshipModel: contract.relationshipModel,
  symbolGrammarSeed: contract.symbolGrammarSeed
}, null, 2));
