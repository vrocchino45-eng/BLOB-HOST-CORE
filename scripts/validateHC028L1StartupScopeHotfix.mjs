import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import vm from "node:vm";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028L1.json");
const contract = json("public/data/build/hc028l1StartupScopeHotfixContract.json");
const locks = json("public/data/build/hc028l1LockedOwnerHashes.json");
const boundarySource = read("src/morph/LocalCellBoundaryMorphSystem.js");

assert.match(main, /buildId:\s*"HC-028L1"/);
assert.match(main, /Startup Scope Hotfix/);
assert.equal(pkg.version, "0.28.21");
assert.equal(identity.parent, "HC-028L");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.12");
assert.equal(contract.fix.samePlayerPositionRetained, true);
assert.equal(contract.fix.deliberateGuidedApproach, false);
assert.equal(contract.fix.hubGuidedCommitBehaviorChanged, false);
assert.equal(contract.fix.firstSliceReturnGameplayChanged, false);
assert.equal(contract.fix.combReentryHotfixChanged, false);
assert.equal(contract.fix.ecologyBehaviorChanged, false);
assert.equal(contract.regression.publishEarlyReturnTraversalMustExecuteWithoutRecipeScope, true);
assert.equal(contract.regression.methodMayReferenceRecipeIdentifier, false);

function extractMethodBody(source, signature) {
  const start = source.indexOf(signature);
  assert(start >= 0, `missing method signature: ${signature}`);
  const open = source.indexOf("{", start);
  assert(open >= 0, `missing opening brace: ${signature}`);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = open; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];
    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (ch === "*" && next === "/") { blockComment = false; i += 1; }
      continue;
    }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "/" && next === "/") { lineComment = true; i += 1; continue; }
    if (ch === "/" && next === "*") { blockComment = true; i += 1; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(open + 1, i);
    }
  }
  throw new Error(`unterminated method: ${signature}`);
}

const methodBody = extractMethodBody(boundarySource, "\n  publishEarlyReturnTraversal(frameState, nearest)");
assert.doesNotMatch(methodBody, /\brecipe\b/);
assert.match(methodBody, /samePlayerPositionRetained:\s*true/);
assert.match(methodBody, /deliberateGuidedApproach:\s*false/);

// Runtime-scope smoke of the exact method body, without importing Three.js.
// This catches free identifiers like the reported `recipe` ReferenceError.
const context = vm.createContext({
  EARLY_SURFACE_CELL: "SURFACE",
  EARLY_GUIDE_CELL: "GUIDE",
  EARLY_HUB_CELL: "HUB",
  EARLY_RETURN_SEAMS_HC026B: [
    { id: "surface_guide", label: "Surface Guide", cells: ["SURFACE", "GUIDE"], anchor: [0, 0, 0] },
    { id: "guide_hub", label: "Guide Hub", cells: ["GUIDE", "HUB"], anchor: [1, 0, 0] }
  ],
  Boolean,
  Math
});
const publishEarlyReturnTraversal = vm.runInContext(`(function(frameState, nearest) {${methodBody}\n})`, context);
const fakeOwner = {
  earlyReturnActiveTransition: null,
  earlyReturnHasReachedHub: true,
  earlyReturnCounts: { hubToGuide: 0, guideToHub: 0, guideToSurface: 0, surfaceToGuide: 0 },
  earlyReturnSignatureForCell(cellId) { return cellId ? { cellId } : null; }
};
const frameState = { activeCellId: "HUB" };
assert.doesNotThrow(() => publishEarlyReturnTraversal.call(fakeOwner, frameState, null));
assert.equal(frameState.firstSliceReturnTraversal.samePlayerPositionRetained, true);
assert.equal(frameState.firstSliceReturnTraversal.deliberateGuidedApproach, false);
assert.equal(frameState.firstSliceReturnTraversal.explicitInteractRequired, false);
assert.equal(frameState.firstSliceReturnTraversal.teleport, false);

// Hub guided approach still exists in its real recipe-scoped owner.
assert.match(boundarySource, /updateGuidedHubCommitFlight\(recipe, state, frameState\)/);
assert.match(boundarySource, /recipe\.guidedApproach/);
assert.match(boundarySource, /proximityReturnArmed/);
assert.match(boundarySource, /proximityReturnDepartureMargin/);

// Every unrelated runtime owner remains byte-identical to HC028L.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC028L owner drifted: ${rel}`);
}
assert.equal(Object.keys(locks.files).length, 104);

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC028L1 Startup Scope Hotfix: PASS");
console.log(JSON.stringify({
  build: identity.id,
  parent: identity.parent,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount,
  startupScopeSmoke: "publishEarlyReturnTraversal executed without recipe scope",
  firstSliceSamePosition: frameState.firstSliceReturnTraversal.samePlayerPositionRetained,
  deliberateGuidedApproach: frameState.firstSliceReturnTraversal.deliberateGuidedApproach
}, null, 2));
