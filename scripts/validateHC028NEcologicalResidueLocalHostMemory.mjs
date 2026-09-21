import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import vm from "node:vm";
import { EntityEcologicalResidueSystem } from "../src/ecology/EntityEcologicalResidueSystem.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028N.json");
const contract = json("public/data/build/hc028nEcologicalResidueLocalHostMemoryContract.json");
const locks = json("public/data/build/hc028nLockedOwnerHashes.json");
const residueSource = read("src/ecology/EntityEcologicalResidueSystem.js");
const ambientSource = read("src/world/AmbientMaterialInteractionSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const runtime = read("src/core/GameRuntime.js");
const boundary = read("src/morph/LocalCellBoundaryMorphSystem.js");

assert.match(main, /buildId:\s*"HC-028N"/);
assert.match(main, /Ecological Residue \/ Local Host Memory/);
assert.equal(pkg.version, "0.28.24");
assert.equal(identity.parent, "HC-028M1");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.15");
assert.deepEqual(contract.residue.durationRangeSeconds, [20, 45]);
assert.equal(contract.residue.maxStoredResidues, 2);
assert.equal(contract.residue.worldSpaceFrozen, true);
assert.equal(contract.residue.cellScoped, true);
assert.equal(contract.residue.decaysWhileAway, true);
assert.equal(contract.residue.beginsAfterImmediateEcologyEnds, true);
assert.equal(contract.residue.usesExistingHostMotes, true);
assert.equal(contract.residue.leavesNoPermanentWorldState, true);
assert.equal(contract.scope.persistentSaveStateEcology, false);
assert.equal(contract.scope.newParticleFieldAdded, false);
assert.equal(contract.scope.newGeometryAdded, false);
assert.equal(contract.scope.newDrawCallsAdded, false);
for (const value of Object.values(contract.authority)) assert.equal(value, false);

assert.match(residueSource, /worldSpaceFrozen:\s*true/);
assert.match(residueSource, /cellScoped:\s*true/);
assert.match(residueSource, /decaysWhileAway:\s*true/);
assert.match(residueSource, /usesExistingHostMotes:\s*true/);
assert.match(residueSource, /saveStateAuthority:\s*false/);
assert.match(residueSource, /hiddenAffinityScore:\s*false/);
assert.match(residueSource, /durationRangeSeconds:\s*\[20, 45\]/);
assert.doesNotMatch(residueSource, /new THREE\.(?:Points|Mesh|Line|Group)/);
assert.doesNotMatch(residueSource, /localStorage|sessionStorage|indexedDB/i);
assert.doesNotMatch(residueSource, /tenderBonded\s*=|tenderRepairBoostSeconds\s*=/);

assert.match(runtime, /EntityEcologicalResidueSystem/);
assert.match(runtime, /entityEcologicalResidueSystem/);
assert.match(ambientSource, /HC028N: once the organism's immediate memory has finished/);
assert.match(ambientSource, /same existing 66 Host motes/);
assert.match(ambientSource, /entityEcologicalResidueUsesExistingMotes:\s*true/);
assert.match(ambientSource, /entityEcologicalResidueAddsParticles:\s*false/);
assert.match(ambientSource, /entityEcologicalResidueAddsGeometry:\s*false/);
assert.match(telemetry, /blob\.session\.telemetry\.v1\.15/);
assert.match(telemetry, /ecology\.entity_ecological_residue\.changed/);

// Direct proof: a committed relationship does not leave residue until immediate ecology ends.
const root = (x, y, z) => ({ visible: true, position: { x, y, z }, userData: {} });
const tenderRoot = root(1.25, 0.5, -2.4);
const watcherRoot = root(-1.1, 0.7, -1.5);
const entitySystem = { entities: [
  { recipe: { id: "nursery_membrane_tender_001" }, root: tenderRoot },
  { recipe: { id: "membrane_watcher_001" }, root: watcherRoot }
] };
const frameState = {
  activeCellId: "CELL_SURFACE_WAKE_001",
  regionalPhysicalEmbodiment: { region: "Surface Wake", matter: "living_suspension_membrane" },
  entityReciprocalMemory: { byEntityId: {
    nursery_membrane_tender_001: { commitCount: 1, mode: "care_exchange_retained", interpretation: "safe_receive", strength01: 0.84, remainingSeconds: 8.4 },
    membrane_watcher_001: { commitCount: 1, mode: "sample_retained", interpretation: "contained_sampling", strength01: 0.78, remainingSeconds: 7.1 }
  } },
  entityLocalMatterCoupling: { active: true, fields: [
    { entityId: "nursery_membrane_tender_001", mode: "care_breath", strength01: 0.84, position: { x: 1.25, y: 0.5, z: -2.4 }, radius: 1.82, radialBias: -0.02, tangentialBias: 0.008, verticalBias: 0.004, breathAmplitude: 0.046, oscillationRate: 1.25, dampingBias: 0.16, anchorRadius: 0.72, anchorTightness: 0.68 },
    { entityId: "membrane_watcher_001", mode: "sample_hold", strength01: 0.78, position: { x: -1.1, y: 0.7, z: -1.5 }, radius: 1.5, radialBias: -0.028, tangentialBias: 0.014, verticalBias: 0.001, breathAmplitude: 0.012, oscillationRate: 1.05, dampingBias: 0.42, anchorRadius: 0.48, anchorTightness: 0.92 }
  ] }
};
const system = new EntityEcologicalResidueSystem({ entitySystem, frameState });
system.init();
system.update(0.1, frameState);
assert.equal(frameState.entityEcologicalResidue.active, false);
assert.equal(frameState.entityEcologicalResidue.stored, false);

// Immediate organism/matter memory ends; residue starts at the captured site.
frameState.entityReciprocalMemory.byEntityId.nursery_membrane_tender_001 = { commitCount: 1, mode: "ambient_memory", interpretation: "ambient_listening", strength01: 0, remainingSeconds: 0 };
frameState.entityReciprocalMemory.byEntityId.membrane_watcher_001 = { commitCount: 1, mode: "ambient_memory", interpretation: "ambient_listening", strength01: 0, remainingSeconds: 0 };
frameState.entityLocalMatterCoupling = { active: false, fields: [] };
system.update(0.2, frameState);
assert.equal(frameState.entityEcologicalResidue.stored, true);
assert.equal(frameState.entityEcologicalResidue.fields.length, 2);
let tender = frameState.entityEcologicalResidue.fields.find((field) => field.entityId === "nursery_membrane_tender_001");
let watcher = frameState.entityEcologicalResidue.fields.find((field) => field.entityId === "membrane_watcher_001");
assert(tender && watcher);
assert.equal(tender.mode, "care_afterimage");
assert.equal(watcher.mode, "sample_imprint");
assert(tender.durationSeconds >= 20 && tender.durationSeconds <= 45);
assert(watcher.durationSeconds >= 20 && watcher.durationSeconds <= 45);
assert(tender.strength01 <= 0.22);
assert(watcher.strength01 <= 0.18);
assert.equal(tender.playerMovementAuthority, false);
assert.equal(watcher.entityMovementAuthority, false);

// World-space trace does not chase the organism after the event.
const capturedX = tender.position.x;
tenderRoot.position.x = 9.5;
system.update(1.5, frameState);
tender = frameState.entityEcologicalResidue.fields.find((field) => field.entityId === "nursery_membrane_tender_001");
assert.equal(tender.position.x, capturedX);
assert.equal(tender.residueStage, "retained_trace");

// Leaving the cell hides the trace but time continues to decay.
const beforeAway = tender.remainingSeconds;
frameState.activeCellId = "CELL_HUB_CHAMBER_001";
system.update(3, frameState);
assert.equal(frameState.entityEcologicalResidue.active, false);
assert.equal(frameState.entityEcologicalResidue.stored, true);
const storedTender = frameState.entityEcologicalResidue.residues.find((item) => item.entityId === "nursery_membrane_tender_001");
assert(storedTender.remainingSeconds < beforeAway);
frameState.activeCellId = "CELL_SURFACE_WAKE_001";
system.update(0.1, frameState);
assert.equal(frameState.entityEcologicalResidue.active, true);

// Long tail eventually fades completely without persistence/save authority.
system.update(31, frameState);
tender = frameState.entityEcologicalResidue.fields.find((field) => field.entityId === "nursery_membrane_tender_001");
if (tender) assert.equal(tender.residueStage, "fading_trace");
system.update(20, frameState);
assert.equal(frameState.entityEcologicalResidue.stored, false);

// HC028L1 startup scope regression remains fixed.
assert.match(boundary, /proximityReturnArmed/);
const extractMethodBody = (source, signature) => {
  const start = source.indexOf(signature); assert(start >= 0);
  const open = source.indexOf("{", start); let depth = 0, quote = null, escaped = false, line = false, block = false;
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
  throw new Error("unterminated method");
};
const earlyBody = extractMethodBody(boundary, "\n  publishEarlyReturnTraversal(frameState, nearest)");
assert.doesNotMatch(earlyBody, /\brecipe\b/);
const context = vm.createContext({ EARLY_SURFACE_CELL:"SURFACE", EARLY_GUIDE_CELL:"GUIDE", EARLY_HUB_CELL:"HUB", EARLY_RETURN_SEAMS_HC026B:[{id:"surface_guide",label:"Surface Guide",cells:["SURFACE","GUIDE"],anchor:[0,0,0]},{id:"guide_hub",label:"Guide Hub",cells:["GUIDE","HUB"],anchor:[1,0,0]}], Boolean, Math });
const fn = vm.runInContext(`(function(frameState, nearest) {${earlyBody}\n})`, context);
const owner = { earlyReturnActiveTransition:null, earlyReturnHasReachedHub:true, earlyReturnCounts:{hubToGuide:0,guideToHub:0,guideToSurface:0,surfaceToGuide:0}, earlyReturnSignatureForCell(cellId){ return cellId ? {cellId} : null; } };
const state = { activeCellId:"HUB" };
assert.doesNotThrow(() => fn.call(owner, state, null));
assert.equal(state.firstSliceReturnTraversal.deliberateGuidedApproach, false);

for (const [rel, expected] of Object.entries(locks.files)) assert.equal(sha(rel), expected, `locked HC028M1 owner drifted: ${rel}`);
assert.equal(Object.keys(locks.files).length, 103);
assert(locks.files["src/ecology/EntitySystem.js"]);
assert(locks.files["src/ecology/EntityReciprocalMemorySystem.js"]);
assert(locks.files["src/ecology/EntityLocalMatterCouplingSystem.js"]);
assert(locks.files["src/camera/CameraReadabilitySystem.js"]);
assert(locks.files["src/morph/LocalCellBoundaryMorphSystem.js"]);
assert(locks.files["src/player/PlayerMovementController.js"]);

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC028N Ecological Residue / Local Host Memory: PASS");
console.log(JSON.stringify({ build: identity.id, parent: identity.parent, lockedOwners: Object.keys(locks.files).length, sourceJsCount, publicJsonCount, telemetrySchema: identity.telemetrySchema, residueDurationRangeSeconds: contract.residue.durationRangeSeconds }, null, 2));
