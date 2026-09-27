import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as THREE from "three";
import { SurfaceWakeGameplaySystem } from "../src/opening/SurfaceWakeGameplaySystem.js";
import { LocalCellMorphSystem } from "../src/morph/LocalCellMorphSystem.js";
import { SessionTelemetrySystem } from "../src/core/SessionTelemetrySystem.js";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));
const hash = (rel) => crypto.createHash("sha256")
  .update(read(rel).replace(/\r\n?/g, "\n"), "utf8")
  .digest("hex");
const fail = (message) => { throw new Error(`[HC031O] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };

const wake = read("src/opening/SurfaceWakeGameplaySystem.js");
const layered = read("src/opening/SurfaceWakeLayeredInteractionSystem.js");
const pacing = read("src/opening/OpeningPacingSystem.js");
const morph = read("src/morph/LocalCellMorphSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const main = read("src/main.js");
const pkg = json("package.json");
const contract = json("public/data/build/hc031oHostContinuationContract.json");
const locked = json("public/data/build/hc031oLockedHashes.json");

need(main, 'buildId: "HC-031O"', "build identity");
need(main, 'buildLabel: "Host Continuation / First Route Legibility"', "build label");
if (pkg.version !== "0.31.33") fail("package version mismatch");
if (contract.parent !== "HC-031N2") fail("parent mismatch");
if (contract.mode !== "convergence_route_legibility") fail("mode mismatch");

[
  "HOST_CONTINUATION_SURFACE_MODES",
  "surface_relationship_to_community_memory_to_host_matter_answer",
  "hostContinuationSurfaceRelationshipProven",
  "hostContinuationCommunityMemoryProven",
  "hostContinuationMatterAnswerProven",
  "hostContinuationInvitationOpen",
  "oldMatterPathPreserved",
  "safeSeedRemainsOptionalNourishment"
].forEach((token) => need(wake, token, "Host-continuation reveal law"));

[
  "hostContinuation.open",
  "emergedFromHostRelationship",
  "host_continuation_not_yet_revealed"
].forEach((token) => need(layered, token, "Listening Fold availability"));

[
  "hostLanguageReady",
  "seedRouteGateRemoved: true",
  "host_continuation_revealed_move_near_scar_or_signal",
  "seedSupportBoost",
  "pulse_contact_started_no_gate_morph"
].forEach((token) => need(morph, token, "existing morph handoff"));

[
  "optional_seed_available_not_route_gate",
  "safe seed is nourishment, not a route gate"
].forEach((token) => need(pacing, token, "opening pacing"));

[
  "blob.session.telemetry.v1.37",
  "opening.host_continuation.revealed",
  "surface_to_guide",
  "continuous_host_morph",
  "hostContinuationReveals",
  'pass: "HC-031O"'
].forEach((token) => need(telemetry, token, "O telemetry"));

for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked neighboring gameplay owner changed: ${rel}`);
}

const stubRecipeData = {
  data: { openingFlowTuning: {} },
  get(type, id) {
    if (type === "morphPlans" && id === "MORPH_MEMBRANE_TO_SCAR_FLOW_001") {
      return {
        id,
        sourceCell: "CELL_MEMBRANE_NURSERY_001",
        destinationCell: "CELL_SCAR_FLOW_FOLD_001",
        chemistryBlend: { from: {}, to: {} }
      };
    }
    if (type === "localCellRecipes" && id === "CELL_MEMBRANE_NURSERY_001") {
      return { id, chemistryField: {}, physicalFeel: {}, visuals: {} };
    }
    if (type === "localCellRecipes" && id === "CELL_SCAR_FLOW_FOLD_001") {
      return { id, chemistryField: {}, physicalFeel: {}, visuals: {} };
    }
    return {};
  }
};

// Relationship route: ecology remains read-only, while SurfaceWakeGameplaySystem
// synthesizes existing embodied evidence into route invitation authority.
{
  const frameState = {
    runtimeSeconds: 10,
    playerAttachment: { active: true },
    verbPhysicalGrammar: { surfaceBound: true, mode: "braced_project" },
    entityRelationshipGrammar: { active: true, primary: { engagement01: 0.42 } },
    entityReciprocalMemory: { commitCount: 1, primary: { entityId: "nursery_membrane_tender_001", strength01: 0.82 } },
    entityLocalMatterCoupling: { active: true, primary: { causalStage: "answering", strength01: 0.20 } }
  };
  const system = new SurfaceWakeGameplaySystem({
    recipeDataSystem: stubRecipeData,
    chemObjectSystem: { objects: [] },
    scene: new THREE.Scene(),
    playerRoot: new THREE.Object3D(),
    frameState
  });
  system.updateHostContinuation(0.5, frameState);
  if (!system.hostContinuationSurfaceRelationshipProven) fail("coherent surface relationship did not prove");
  if (!system.hostContinuationCommunityMemoryProven) fail("community memory proof did not retain");
  if (!system.hostContinuationMatterAnswerProven) fail("Host-matter answer proof did not retain");
  if (!system.hostContinuationInvitationOpen) fail("relationship causal chain did not reveal continuation");
  if (system.materialPassageOpen) fail("relationship path incorrectly fabricated material-passage state");
}

// Old material path still reveals exactly the same invitation.
{
  const frameState = { runtimeSeconds: 2 };
  const system = new SurfaceWakeGameplaySystem({
    recipeDataSystem: stubRecipeData,
    chemObjectSystem: { objects: [] },
    scene: new THREE.Scene(),
    playerRoot: new THREE.Object3D(),
    frameState
  });
  system.materialPassageOpen = true;
  system.materialPassageCause = "tender_fed_filtered_matter";
  system.updateHostContinuation(0.05, frameState);
  if (!system.hostContinuationInvitationOpen) fail("old safe-material path no longer reveals fold");
  if (!system.hostContinuationCause.startsWith("material_passage:")) fail("material route cause not preserved");
}

const makeChemObject = (id, position, absorbed = false) => ({
  recipe: { id },
  absorbed,
  root: { userData: { absorbed }, position: new THREE.Vector3(...position) }
});

const makeMorphSystem = ({ invitationOpen, surfaceComplete, seedAbsorbed = false, pulse = true }) => {
  const frameState = {
    activeCellId: "CELL_MEMBRANE_NURSERY_001",
    playerComposition: { form: seedAbsorbed ? 0.34 : 0, seed: seedAbsorbed ? 0.40 : 0 },
    surfaceWakeLayeredInteraction: { active: true, completed: surfaceComplete, nextAction: "complete fold" },
    surfaceWakeGameplay: { hostContinuationInvitation: { open: invitationOpen } },
    pulse: { affectedObjects: pulse ? ["scar_contamination_plate_001"] : [] },
    input: { pulsePressed: pulse },
    currentChemTarget: "scar_contamination_plate_001"
  };
  const playerRoot = new THREE.Object3D();
  playerRoot.position.set(0, 0, 0);
  const chemObjectSystem = {
    objects: [
      makeChemObject("dormant_seed_nutrient_001", [3, 0, 0], seedAbsorbed),
      makeChemObject("scar_contamination_plate_001", [1, 0, 0]),
      makeChemObject("signal_vapor_thread_001", [2, 0, 0])
    ]
  };
  const system = new LocalCellMorphSystem({
    recipeDataSystem: stubRecipeData,
    visualComposer: { compose: () => new THREE.Object3D(), composedObjects: [], scene: new THREE.Scene() },
    chemObjectSystem,
    playerRoot,
    frameState
  });
  system.sourceCell = { id: "CELL_MEMBRANE_NURSERY_001" };
  return { system, frameState };
};

// The fold still owns the opening until it has been completed.
{
  const { system, frameState } = makeMorphSystem({ invitationOpen: true, surfaceComplete: false, seedAbsorbed: false });
  const trigger = system.evaluateTrigger(frameState);
  if (!trigger.deferredToSurfaceWake || trigger.start) fail("route bypassed unfinished Listening Fold");
}

// After fold completion, the Host-language route can start the existing morph
// without seed absorption. The safe seed no longer owns crossing permission.
{
  const { system, frameState } = makeMorphSystem({ invitationOpen: true, surfaceComplete: true, seedAbsorbed: false });
  const trigger = system.evaluateTrigger(frameState);
  if (!trigger.hostLanguageReady || !trigger.continuationReady) fail("completed Host language did not arm continuation");
  if (trigger.seedAbsorbed) fail("Host-language route unexpectedly requires seed absorption");
  if (!trigger.ready || !trigger.start) fail("scar/signal pulse did not start existing no-gate morph after Host-language proof");
}

// The old chemistry route remains valid if the player chooses to absorb the seed.
{
  const { system, frameState } = makeMorphSystem({ invitationOpen: false, surfaceComplete: true, seedAbsorbed: true });
  const trigger = system.evaluateTrigger(frameState);
  if (!trigger.chemistryContinuationReady || !trigger.ready || !trigger.start) fail("old seed/composition continuation path regressed");
}

// Telemetry must show route revelation, availability, entry, and resolution.
{
  let clockMs = 0;
  const frameState = {
    buildId: "HC-031O",
    buildLabel: "Host Continuation / First Route Legibility",
    runtimeSeconds: 0,
    activeCellId: "CELL_MEMBRANE_NURSERY_001",
    input: { pulseEventId: 0 },
    targeting: {},
    surfaceWakeGameplay: { hostContinuationInvitation: { open: false } },
    localCellMorph: { completed: false, sourceCell: "CELL_MEMBRANE_NURSERY_001", destinationCell: "CELL_SCAR_FLOW_FOLD_001" },
    playerAttachment: { active: false, state: "free" },
    corePerformance: { endurance: { reserve01: 1 } }
  };
  const observer = new SessionTelemetrySystem({ frameState, monotonicNowMs: () => clockMs });
  frameState.surfaceWakeGameplay.hostContinuationInvitation = {
    open: true,
    relationshipProof: true,
    cause: "surface_relationship_to_community_memory_to_host_matter_answer",
    surfaceRelationshipProven: true,
    communityMemoryProven: true,
    hostMatterAnswerProven: true,
    chemistryPassageOpen: false,
    revealOwner: "SurfaceWakeGameplaySystem",
    crossingOwner: "LocalCellMorphSystem"
  };
  clockMs += 50;
  observer.observeHostContinuation(frameState);
  observer.observeRouteResolution(frameState);
  frameState.activeCellId = "CELL_SCAR_FLOW_FOLD_001";
  clockMs += 50;
  observer.observeCell(frameState);
  frameState.localCellMorph = {
    completed: true,
    phase: "completed_in_scar_flow_fold",
    sourceCell: "CELL_MEMBRANE_NURSERY_001",
    destinationCell: "CELL_SCAR_FLOW_FOLD_001",
    hostLanguageReady: true,
    seedSupportActive: false
  };
  observer.observeRouteResolution(frameState);
  const types = observer.events.map((event) => event.type);
  if (!types.includes("opening.host_continuation.revealed")) fail("host continuation reveal telemetry missing");
  if (!types.includes("transition.available")) fail("opening transition availability telemetry missing");
  if (!types.includes("transition.entered")) fail("opening transition entry telemetry missing");
  if (!types.includes("route.resolved")) fail("opening route resolution telemetry missing");
  const summary = observer.buildSummary();
  if (summary.hostContinuationReveals !== 1) fail("summary did not count Host continuation reveal");
  if (summary.transitionAvailabilityEvents < 1 || summary.transitionEntries < 1 || summary.routeResolutions < 1) fail("opening route summary counts missing");
  if (observer.exportSession().session.implementationPass !== "HC-031O") fail("implementationPass identity mismatch");
}

console.log(`[HC031O] PASS — existing Surface Wake → Guide Threshold route can be revealed by coherent Host/community causality or the preserved material path, fold completion still owns the handoff, safe seed is optional support rather than a gate, no-gate morph ownership remains LocalCellMorphSystem, telemetry v1.37, and ${Object.keys(locked.files).length} neighboring owners verified unchanged.`);
