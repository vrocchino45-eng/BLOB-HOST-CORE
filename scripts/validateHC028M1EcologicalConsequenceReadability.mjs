import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import vm from "node:vm";
import { EntityLocalMatterCouplingSystem } from "../src/ecology/EntityLocalMatterCouplingSystem.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028M1.json");
const contract = json("public/data/build/hc028m1EcologicalConsequenceReadabilityContract.json");
const locks = json("public/data/build/hc028m1LockedOwnerHashes.json");
const couplingSource = read("src/ecology/EntityLocalMatterCouplingSystem.js");
const ambientSource = read("src/world/AmbientMaterialInteractionSystem.js");
const cameraSource = read("src/camera/CameraReadabilitySystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const boundary = read("src/morph/LocalCellBoundaryMorphSystem.js");
const entitySource = read("src/ecology/EntitySystem.js");

assert.match(main, /buildId:\s*"HC-028M1"/);
assert.match(main, /Ecological Consequence Readability/);
assert.equal(pkg.version, "0.28.23");
assert.equal(identity.parent, "HC-028M");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.14");
assert.equal(contract.scope.newEntityTypes, 0);
assert.equal(contract.scope.newControls, false);
assert.equal(contract.scope.newCombat, false);
assert.equal(contract.scope.newProgression, false);
assert.equal(contract.scope.newAffinity, false);
assert.equal(contract.scope.playerMovementChanged, false);
assert.equal(contract.scope.entityMovementChanged, false);
assert.equal(contract.scope.routeLogicChanged, false);
assert.equal(contract.scope.chemistryChanged, false);
assert.equal(contract.scope.combReentryHotfixPreserved, true);
assert.equal(contract.scope.startupScopeHotfixPreserved, true);
assert.equal(contract.scope.newParticleFieldAdded, false);
assert.equal(contract.scope.newGeometryAdded, false);
assert.equal(contract.scope.newDrawCallsAdded, false);
assert.equal(contract.scope.cameraModeAdded, false);
assert.equal(contract.scope.cameraLockOnAdded, false);
assert.equal(contract.readability.relationshipOwnsImmediateRead, true);
assert.equal(contract.readability.localMatterAnswersAfterOrganism, true);
assert.equal(contract.readability.matterPersistsAfterVerbRelease, true);
assert.deepEqual(contract.readability.causalStages, ["forming", "answering", "expressing", "releasing"]);
assert.equal(contract.readability.usesExistingHostMotes, true);
assert.equal(contract.readability.usesLocalMoteCohort, true);
assert.equal(contract.readability.usesSoftAnchorShell, true);
assert.equal(contract.readability.maxAuthoredFields, 2);
for (const value of Object.values(contract.authority)) assert.equal(value, false);

// The ecology bridge remains presentation-only and owns no mesh/particle/player/entity mutation.
assert.match(couplingSource, /causalSequence/);
assert.match(couplingSource, /relationshipOwnsImmediateRead:\s*true/);
assert.match(couplingSource, /localMatterAnswersAfterOrganism:\s*true/);
assert.match(couplingSource, /matterPersistsAfterVerbRelease:\s*true/);
assert.match(couplingSource, /causalStage/);
assert.match(couplingSource, /anchorRadius/);
assert.match(couplingSource, /anchorTightness/);
assert.match(couplingSource, /localCohortBias/);
assert.match(couplingSource, /usesExistingHostMotes:\s*true/);
assert.match(couplingSource, /addsParticles:\s*false/);
assert.match(couplingSource, /addsGeometry:\s*false/);
assert.match(couplingSource, /addsDrawCalls:\s*false/);
assert.match(couplingSource, /playerMovementAuthority:\s*false/);
assert.match(couplingSource, /entityMovementAuthority:\s*false/);
assert.match(couplingSource, /routeAuthority:\s*false/);
assert.doesNotMatch(couplingSource, /new THREE\.(?:Points|Mesh|Line|Group)/);
assert.doesNotMatch(couplingSource, /tenderBonded\s*=/);
assert.doesNotMatch(couplingSource, /tenderRepairBoostSeconds\s*=/);

// Existing Host-mote owner provides the tighter local pocket; no second environmental field.
assert.match(ambientSource, /HC028M1: the ecological consequence is now staged and spatially gathered/);
assert.match(ambientSource, /deterministic local cohort/);
assert.match(ambientSource, /soft shell around the organism/);
assert.match(ambientSource, /field\.causalStage/);
assert.match(ambientSource, /field\.anchorRadius/);
assert.match(ambientSource, /field\.anchorTightness/);
assert.match(ambientSource, /entityLocalMatterCouplingUsesExistingMotes:\s*true/);
assert.match(ambientSource, /entityLocalMatterCouplingAddsParticles:\s*false/);
assert.match(ambientSource, /entityLocalMatterCouplingAddsGeometry:\s*false/);
assert.match(ambientSource, /entityLocalMatterCouplingAddsDrawCalls:\s*false/);

// Camera accommodation reuses readability output only; it does not create lock-on or mutate camera directly.
assert.match(cameraSource, /ecologyPocketProtected/);
assert.match(cameraSource, /ecologyFocusEntityId/);
assert.match(cameraSource, /Core-organism consequence corridor/);
assert.match(cameraSource, /safeEcologyOcclusionIntensity/);
assert.doesNotMatch(cameraSource, /lockOn/i);
assert.doesNotMatch(cameraSource, /camera\.position\.(?:set|copy|add|lerp)/);
assert.doesNotMatch(cameraSource, /playerRoot\.position\.(?:set|copy|add|lerp)/);

assert.match(telemetry, /blob\.session\.telemetry\.v1\.14/);
assert.match(telemetry, /ecology\.entity_local_matter_coupling\.changed/);
assert.match(telemetry, /causalStage/);
assert.match(telemetry, /causalEnvelope01/);
assert.match(telemetry, /localMatterAnswersAfterOrganism/);

// HC028I1 + HC028L1 return/startup fixes stay intact.
assert.match(boundary, /proximityReturnArmed/);
assert.match(boundary, /proximityReturnDepartureMargin/);
const earlyStart = boundary.indexOf("publishEarlyReturnTraversal(frameState, nearest)");
const earlyEnd = boundary.indexOf("\n  }", earlyStart + 10);
const earlySnippet = boundary.slice(earlyStart, earlyEnd > earlyStart ? earlyEnd : earlyStart + 2400);
assert.doesNotMatch(earlySnippet, /\brecipe\b/);

// Execute the exact first-slice return method body without any recipe identifier in scope.
const extractMethodBody = (source, signature) => {
  const start = source.indexOf(signature);
  assert(start >= 0, `missing method signature: ${signature}`);
  const open = source.indexOf("{", start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = open; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];
    if (lineComment) { if (ch === "\n") lineComment = false; continue; }
    if (blockComment) { if (ch === "*" && next === "/") { blockComment = false; i += 1; } continue; }
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
    if (ch === "}") { depth -= 1; if (depth === 0) return source.slice(open + 1, i); }
  }
  throw new Error(`unterminated method: ${signature}`);
};
const earlyBody = extractMethodBody(boundary, "\n  publishEarlyReturnTraversal(frameState, nearest)");
assert.doesNotMatch(earlyBody, /\brecipe\b/);
const context = vm.createContext({
  EARLY_SURFACE_CELL: "SURFACE", EARLY_GUIDE_CELL: "GUIDE", EARLY_HUB_CELL: "HUB",
  EARLY_RETURN_SEAMS_HC026B: [
    { id: "surface_guide", label: "Surface Guide", cells: ["SURFACE", "GUIDE"], anchor: [0, 0, 0] },
    { id: "guide_hub", label: "Guide Hub", cells: ["GUIDE", "HUB"], anchor: [1, 0, 0] }
  ],
  Boolean, Math
});
const publishEarlyReturnTraversal = vm.runInContext(`(function(frameState, nearest) {${earlyBody}\n})`, context);
const fakeOwner = {
  earlyReturnActiveTransition: null, earlyReturnHasReachedHub: true,
  earlyReturnCounts: { hubToGuide: 0, guideToHub: 0, guideToSurface: 0, surfaceToGuide: 0 },
  earlyReturnSignatureForCell(cellId) { return cellId ? { cellId } : null; }
};
const firstSliceState = { activeCellId: "HUB" };
assert.doesNotThrow(() => publishEarlyReturnTraversal.call(fakeOwner, firstSliceState, null));
assert.equal(firstSliceState.firstSliceReturnTraversal.samePlayerPositionRetained, true);
assert.equal(firstSliceState.firstSliceReturnTraversal.deliberateGuidedApproach, false);

// Direct causal-envelope proof: live chord is subordinate; release produces answer -> expression -> decay.
const root = (x, y, z) => ({ visible: true, position: { x, y, z }, userData: {} });
const entitySystem = {
  entities: [
    { recipe: { id: "nursery_membrane_tender_001" }, root: root(1, 0.4, -2) },
    { recipe: { id: "membrane_watcher_001" }, root: root(-1.2, 0.7, -1.4) }
  ]
};
const frameState = {
  regionalPhysicalEmbodiment: { active: true, region: "Surface Wake", matter: "living_suspension_membrane", law: "soft_exchange", phraseStrength: 0.7 },
  entityRelationshipGrammar: {
    byEntityId: {
      nursery_membrane_tender_001: { chord: "absorb+stabilize", interpretation: "safe_receive", engagement01: 0.82 },
      membrane_watcher_001: { chord: "absorb+stabilize", interpretation: "contained_sampling", engagement01: 0.78 }
    }
  },
  entityReciprocalMemory: {
    byEntityId: {
      nursery_membrane_tender_001: { mode: "care_exchange_retained", interpretation: "safe_receive", strength01: 0.84, responsePulse01: 0.9, remainingSeconds: 8.8 },
      membrane_watcher_001: { mode: "sample_retained", interpretation: "contained_sampling", strength01: 0.78, responsePulse01: 0.9, remainingSeconds: 7.1 }
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
system.update(0.12, frameState);
let tender = frameState.entityLocalMatterCoupling.fields.find((field) => field.entityId === "nursery_membrane_tender_001");
let watcher = frameState.entityLocalMatterCoupling.fields.find((field) => field.entityId === "membrane_watcher_001");
assert(tender && watcher);
assert.equal(tender.causalStage, "forming");
assert(tender.causalEnvelope01 <= 0.30);
assert.equal(frameState.entityLocalMatterCoupling.relationshipOwnsImmediateRead, true);

frameState.entityRelationshipGrammar.byEntityId.nursery_membrane_tender_001 = { chord: "idle", interpretation: "ambient_listening", engagement01: 0 };
frameState.entityRelationshipGrammar.byEntityId.membrane_watcher_001 = { chord: "idle", interpretation: "ambient_listening", engagement01: 0 };
system.update(0.20, frameState);
tender = frameState.entityLocalMatterCoupling.fields.find((field) => field.entityId === "nursery_membrane_tender_001");
assert.equal(tender.causalStage, "answering");
assert(tender.causalEnvelope01 > 0.26 && tender.causalEnvelope01 < 1);
system.update(0.55, frameState);
tender = frameState.entityLocalMatterCoupling.fields.find((field) => field.entityId === "nursery_membrane_tender_001");
watcher = frameState.entityLocalMatterCoupling.fields.find((field) => field.entityId === "membrane_watcher_001");
assert.equal(tender.causalStage, "expressing");
assert.equal(tender.causalEnvelope01, 1);
assert.equal(tender.mode, "care_breath");
assert.equal(watcher.mode, "sample_hold");
assert(tender.anchorRadius > watcher.anchorRadius);
assert(watcher.anchorTightness > tender.anchorTightness);
assert.equal(tender.playerMovementAuthority, false);
assert.equal(watcher.entityMovementAuthority, false);

frameState.entityReciprocalMemory.byEntityId.nursery_membrane_tender_001.strength01 = 0.16;
frameState.entityReciprocalBehavior.byEntityId.nursery_membrane_tender_001.strength01 = 0.16;
system.update(0.10, frameState);
tender = frameState.entityLocalMatterCoupling.fields.find((field) => field.entityId === "nursery_membrane_tender_001");
assert.equal(tender.causalStage, "releasing");
assert(tender.causalEnvelope01 < 0.6);
assert.equal(frameState.entityLocalMatterCoupling.matterPersistsAfterVerbRelease, true);

// Existing organism gameplay owner remains unchanged through hash lock and still owns real behavior.
assert.match(entitySource, /class EntitySystem/);
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC028M owner drifted: ${rel}`);
}
assert.equal(Object.keys(locks.files).length, 102);
assert(locks.files["src/ecology/EntitySystem.js"]);
assert(locks.files["src/ecology/EntityReciprocalMemorySystem.js"]);
assert(locks.files["src/ecology/EntityReciprocalBehaviorSystem.js"]);
assert(locks.files["src/morph/LocalCellBoundaryMorphSystem.js"]);
assert(locks.files["src/player/PlayerMovementController.js"]);
assert(locks.files["src/core/GameRuntime.js"]);

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC028M1 Ecological Consequence Readability: PASS");
console.log(JSON.stringify({
  build: identity.id,
  parent: identity.parent,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount,
  causalStages: contract.readability.causalStages,
  cameraModeAdded: false,
  gameplayAuthority: false
}, null, 2));
