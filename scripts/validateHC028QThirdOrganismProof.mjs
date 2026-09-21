import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import vm from "node:vm";
import { EntityRelationshipGrammarSystem } from "../src/ecology/EntityRelationshipGrammarSystem.js";
import { EntityReciprocalMemorySystem } from "../src/ecology/EntityReciprocalMemorySystem.js";
import { EntityReciprocalBehaviorSystem } from "../src/ecology/EntityReciprocalBehaviorSystem.js";
import { EntityLocalMatterCouplingSystem } from "../src/ecology/EntityLocalMatterCouplingSystem.js";
import { EntityEcologicalResidueSystem } from "../src/ecology/EntityEcologicalResidueSystem.js";
import { EntityResidueRecognitionSystem } from "../src/ecology/EntityResidueRecognitionSystem.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const pkg = json("package.json");
const main = read("src/main.js");
const identity = json("public/data/build/currentBuildIdentity_HC028Q.json");
const contract = json("public/data/build/hc028qThirdOrganismProofContract.json");
const locks = json("public/data/build/hc028qLockedOwnerHashes.json");
const entities = json("public/data/ecology/entityRecipes.json");
const functions = json("public/data/ecology/functionRecipes.json");
const cells = json("public/data/world/localCellRecipes.json");
const visuals = json("public/data/visual/visualCompositionRecipes.json");

const relay = entities.find((item) => item.id === "vascular_relay_001");
const tender = entities.find((item) => item.id === "nursery_membrane_tender_001");
const watcher = entities.find((item) => item.id === "membrane_watcher_001");
const vascular = cells.find((item) => item.id === "CELL_VASCULAR_RHYTHM_ROUTE_001");
const functionRecipe = functions.find((item) => item.id === "carry_align_release");
const visual = visuals.find((item) => item.id === "vascular_relay_v01");

assert.match(main, /buildId:\s*"HC-028Q"/);
assert.match(main, /Third Organism Proof — Vascular Relay/);
assert.equal(pkg.version, "0.28.27");
assert.equal(identity.parent, "HC-028P");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.17");
assert(relay && tender && watcher);
assert.equal(entities.length, 3, "HC028Q should add exactly one organism to the two authored parent organisms");
assert(functionRecipe);
assert(visual);
assert(vascular?.contents?.entities?.includes("vascular_relay_001"));
assert.equal(relay.origin.localCell, "CELL_VASCULAR_RHYTHM_ROUTE_001");
assert.equal(relay.origin.hostFunction, "carry_align_release");
assert.equal(relay.chemistry.matterState, "fluid");
assert.deepEqual(relay.chemistry.domains, ["form", "flux", "signal"]);
assert.equal(relay.spawn.coordinateSpace, "cell_entry_relative");
assert.equal(relay.ecologyGrammar.role, "flow_relay");
assert.equal(relay.interaction.canBeAbsorbed, false);
assert.equal(relay.interaction.canBond, false);
assert.equal(relay.interaction.canGuide, false);
assert.equal(relay.interaction.canRepairLocalCell, false);
assert.equal(relay.interaction.canAlertHost, false);
assert.equal(contract.organism.totalVanes, 6);
assert.equal(contract.organism.pairedVaneStations, 3);
assert.equal(contract.grammarProof.existingHostMotesOnly, true);
assert.equal(contract.grammarProof.newParticleField, false);
assert.equal(contract.movement.owner, "EntitySystem");
assert.equal(contract.movement.playerMovementAuthority, false);
assert.equal(contract.movement.routeAuthority, false);
for (const value of Object.values(contract.forbidden)) assert.equal(value, false);

// P/A/S and chord semantics are authored in data, not hard-coded into the generic bridges.
const interp = relay.ecologyGrammar.relationshipInterpretations;
assert.equal(interp.project, "forward_signal");
assert.equal(interp.draw, "current_intake");
assert.equal(interp.cohere, "flow_alignment");
assert.equal(interp.cohere_project, "stable_transmission");
assert.equal(interp.cohere_draw, "held_intake");
assert.equal(interp.exchange, "recirculating_exchange");
assert.equal(interp.full_system, "full_conduit_alignment");

const dummyRoot = { visible: true, position: { x: 0.6, y: 0, z: 0 } };
const relayEntity = { recipe: relay, root: dummyRoot };
const dummyEntitySystem = {
  entities: [relayEntity],
  tenderBonded: false,
  playerRoot: { position: { distanceTo(pos) { return Math.hypot(pos.x, pos.y, pos.z); } } }
};
const frameState = {};
const relationshipSystem = new EntityRelationshipGrammarSystem({ entitySystem: dummyEntitySystem, frameState });
assert.equal(relationshipSystem.interpret(relayEntity, "project", false, 0.8), "forward_signal");
assert.equal(relationshipSystem.interpret(relayEntity, "draw", false, 0.8), "current_intake");
assert.equal(relationshipSystem.interpret(relayEntity, "cohere", false, 0.8), "flow_alignment");
assert.equal(relationshipSystem.interpret(relayEntity, "full_system", false, 0.8), "full_conduit_alignment");

const memorySystem = new EntityReciprocalMemorySystem({ entitySystem: dummyEntitySystem, frameState });
assert.equal(memorySystem.resolveMemoryMode(relayEntity, "forward_signal", false), "outbound_signal_retained");
assert.equal(memorySystem.resolveMemoryMode(relayEntity, "recirculating_exchange", false), "balanced_exchange_retained");
assert.equal(memorySystem.resolveDuration(relayEntity, "full_conduit_alignment", false), 9.4);

const behaviorSystem = new EntityReciprocalBehaviorSystem({ entitySystem: dummyEntitySystem, frameState });
assert.equal(behaviorSystem.resolveDirective(relayEntity, "outbound_signal_retained", "forward_signal", 0.8).mode, "forward_relay");
assert.equal(behaviorSystem.resolveDirective(relayEntity, "intake_current_retained", "current_intake", 0.8).mode, "cup_current");
assert.equal(behaviorSystem.resolveDirective(relayEntity, "flow_alignment_retained", "flow_alignment", 0.8).mode, "brace_current");
assert.equal(behaviorSystem.resolveDirective(relayEntity, "full_conduit_retained", "full_conduit_alignment", 0.8).mode, "full_relay");

const localMatterSystem = new EntityLocalMatterCouplingSystem({ entitySystem: dummyEntitySystem, frameState });
assert.equal(localMatterSystem.resolveSignature(relayEntity, "forward_relay", "outbound_signal_retained").mode, "downstream_wake");
assert.equal(localMatterSystem.resolveSignature(relayEntity, "cup_current", "intake_current_retained").mode, "caught_current");
assert.equal(localMatterSystem.resolveSignature(relayEntity, "brace_current", "flow_alignment_retained").mode, "flow_brace");
assert.equal(localMatterSystem.resolveSignature(relayEntity, "full_relay", "full_conduit_retained").mode, "full_conduit_handoff");

const residueSystem = new EntityEcologicalResidueSystem({ entitySystem: dummyEntitySystem, frameState });
assert.equal(residueSystem.resolveResidueMode(relayEntity, "outbound_signal_retained", "downstream_wake"), "relay_wake");
assert.equal(residueSystem.resolveResidueMode(relayEntity, "balanced_exchange_retained", "recirculating_handoff"), "recirculation_trace");
assert.equal(residueSystem.resolveDuration(relayEntity, "full_conduit_retained", "full_conduit_handoff"), 36);

const recognitionSystem = new EntityResidueRecognitionSystem({ entitySystem: dummyEntitySystem, frameState });
assert.equal(recognitionSystem.resolveInterpretation(relayEntity, { mode: "care_afterimage", entityId: "nursery_membrane_tender_001" }), "care_flow_detected");
assert.equal(recognitionSystem.resolveInterpretation(relayEntity, { mode: "sample_imprint", entityId: "membrane_watcher_001" }), "sample_flow_detected");
assert.equal(recognitionSystem.resolveInterpretation(relayEntity, { mode: "relay_wake", entityId: "vascular_relay_001" }), "known_relay_wake");

const entitySource = read("src/ecology/EntitySystem.js");
const visualSource = read("src/visual/composers/EntityVisualComposer.js");
const relationshipSource = read("src/ecology/EntityRelationshipGrammarSystem.js");
const memorySource = read("src/ecology/EntityReciprocalMemorySystem.js");
const behaviorSource = read("src/ecology/EntityReciprocalBehaviorSystem.js");
const localMatterSource = read("src/ecology/EntityLocalMatterCouplingSystem.js");
const residueSource = read("src/ecology/EntityEcologicalResidueSystem.js");
const recognitionSource = read("src/ecology/EntityResidueRecognitionSystem.js");
const crossSource = read("src/ecology/EntityEcologicalCrossInfluenceSystem.js");
const resonanceSource = read("src/ecology/EntityEcologyResonanceSystem.js");
const boundary = read("src/morph/LocalCellBoundaryMorphSystem.js");

assert.match(entitySource, /recipeDataSystem\.data\.localCellRecipes/);
assert.match(entitySource, /coordinateSpace !== "cell_entry_relative"/);
assert.match(entitySource, /updateVascularRelay/);
assert.match(entitySource, /flow_relay/);
assert.match(entitySource, /isWatcher\s*\?\s*inNursery/);
assert.match(entitySource, /isTender\s*\?\s*\(inNursery \|\| this\.tenderBonded\)/);
assert.match(entitySource, /navigationAuthority = false/);
assert.match(entitySource, /routeAuthority = false/);
assert.doesNotMatch(entitySource, /playerRoot\.position\.(?:add|sub|copy|set)\(/, "EntitySystem must not move the player");

assert.match(visualSource, /"paired_flow_vanes": "composeVascularRelay"/);
assert.match(visualSource, /for \(let station = 0; station < 3; station \+= 1\)/);
assert.match(visualSource, /for \(const side of \[-1, 1\]\)/);
assert.match(visualSource, /relay_flow_vane_/);
assert.match(visualSource, /vascular_relay_lumen_body/);

// Generic ecology bridges must not grow a third set of organism-ID branches.
for (const [name, source] of [
  ["relationship", relationshipSource], ["memory", memorySource], ["behavior", behaviorSource],
  ["local matter", localMatterSource], ["residue", residueSource], ["recognition", recognitionSource]
]) {
  assert.doesNotMatch(source, /vascular_relay_001/, `${name} bridge must remain profile-driven`);
  assert.match(source, /ecologyGrammar/, `${name} bridge should consume authored ecologyGrammar`);
}
assert.doesNotMatch(crossSource, /vascular_relay_001/);
assert.doesNotMatch(resonanceSource, /vascular_relay_001/);

// Existing P cross-influence stays non-recursive; Q does not create a new signal network.
assert.match(crossSource, /recursivePropagation:\s*false/);
assert.match(crossSource, /createsResidue:\s*false/);

// Descendant proof of HC028L1 startup-scope fix without invoking identity-bound historical validator.
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
  assert.equal(sha(rel), expected, `locked HC028P owner drifted: ${rel}`);
}
assert.equal(Object.keys(locks.files).length, 101);
for (const mustLock of [
  "src/ecology/EntityEcologicalCrossInfluenceSystem.js",
  "src/ecology/EntityEcologyResonanceSystem.js",
  "src/routes/VascularRhythmRouteSystem.js",
  "src/player/PlayerMovementController.js",
  "src/camera/CameraReadabilitySystem.js",
  "src/morph/LocalCellBoundaryMorphSystem.js"
]) assert(locks.files[mustLock], `expected locked owner: ${mustLock}`);

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC028Q Third Organism Proof — Vascular Relay: PASS");
console.log(JSON.stringify({
  build: identity.id,
  parent: identity.parent,
  organism: relay.id,
  role: relay.ecologyGrammar.role,
  homeCell: relay.origin.localCell,
  pairedStations: 3,
  totalVanes: 6,
  lockedOwners: Object.keys(locks.files).length,
  sourceJsCount,
  publicJsonCount,
  telemetrySchema: identity.telemetrySchema
}, null, 2));
