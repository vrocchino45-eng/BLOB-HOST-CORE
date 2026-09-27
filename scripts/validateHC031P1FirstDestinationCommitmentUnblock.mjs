import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { HubInvestigationGameplaySystem } from "../src/hub/HubInvestigationGameplaySystem.js";
import { LocalCellBoundaryMorphSystem } from "../src/morph/LocalCellBoundaryMorphSystem.js";
import { SessionTelemetrySystem } from "../src/core/SessionTelemetrySystem.js";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));
const hash = (rel) => crypto.createHash("sha256")
  .update(read(rel).replace(/\r\n?/g, "\n"), "utf8")
  .digest("hex");
const fail = (message) => { throw new Error(`[HC031P1] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };

const main = read("src/main.js");
const foundation = read("src/hub/HubChamberFoundationSystem.js");
const investigation = read("src/hub/HubInvestigationGameplaySystem.js");
const boundary = read("src/morph/LocalCellBoundaryMorphSystem.js");
const registry = read("src/morph/LocalCellBoundaryRecipeRegistry.js");
const telemetrySource = read("src/core/SessionTelemetrySystem.js");
const pkg = json("package.json");
const contract = json("public/data/build/hc031p1FirstDestinationCommitmentUnblockContract.json");
const locked = json("public/data/build/hc031p1LockedHashes.json");

need(main, 'buildId: "HC-031P1"', "build identity");
need(main, 'buildLabel: "First Destination Commitment Unblock"', "build label");
if (pkg.version !== "0.31.36") fail("package version mismatch");
if (contract.parent !== "HC-031P") fail("parent mismatch");
if (contract.mode !== "hotfix_first_destination_commitment_ownership") fail("mode mismatch");
if (contract.firstDestinationLaw?.wholeHubScreenTruthRequiredForCommit !== false) {
  fail("whole-Hub screen truth must not own first destination commitment permission");
}

[
  'pass: "HC-031P1"',
  'screenTruthRequiredForCommit: false',
  'blocker: firstDestinationBlocker',
  'bodyRevealProgress: Math.min(this.reveal, this.routeIdentityReveal)',
  'automaticCrossing: false',
  'transitionOwner: "LocalCellBoundaryMorphSystem"'
].forEach((token) => need(foundation, token, "first destination invitation"));

[
  'const firstDestinationWindow = Boolean(',
  '!foundation.completed && !firstDestinationWindow',
  'role: "deliberate_destination_commit"',
  'control: "A / E"',
  'genericInteract: false'
].forEach((token) => need(investigation, token, "Hub deliberate commitment"));

[
  'const firstGraveEntry = Boolean(',
  'firstDestinationInvitation.active === true',
  'screenTruthOwnsFirstDestinationPermission: false',
  'frameState.activeCellId === recipe.sourceCellId',
  '&& readiness.destinationPrepared'
].forEach((token) => need(boundary, token, "first Grave boundary unblock"));

[
  'id: "hub_to_grave"',
  'trigger: "commit"',
  'interactionRange: 2.15',
  'readiness: "hub_grave_entry"'
].forEach((token) => need(registry, token, "Hub→Grave authored route lock"));

[
  'blob.session.telemetry.v1.39',
  'hub.destination.readiness_changed',
  'screenTruthRequiredForCommit: false',
  'hub.destination.available',
  'hub.destination.committed',
  'releaseState: "arrived_in_grave_memory"'
].forEach((token) => need(telemetrySource, token, "HC031P1 telemetry"));

for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked gameplay owner changed: ${rel}`);
}

// Runtime proof 1: first Grave route wakes when the Hub is active and the destination
// is prepared even while the older whole-Hub presentation completion is false.
{
  const boundaryProbe = Object.create(LocalCellBoundaryMorphSystem.prototype);
  const recipe = {
    id: "hub_to_grave",
    gateId: "hub_to_grave_memory_route",
    routeId: "grave_memory_route",
    sourceCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    destinationCellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
    interactionRange: 2.15
  };
  const frameState = {
    activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    act1RouteHistory: { graveEntered: false },
    transitionContinuity: { hubToGraveReady: true },
    hubChamberFoundation: {
      completed: false,
      firstDestinationInvitation: { active: true },
      routes: [{
        id: "grave_memory_route",
        gateId: "hub_to_grave_memory_route",
        distanceToPlayer: 1.4,
        position: [2.2, 0, 0]
      }],
      thresholds: []
    },
    firstSliceObjectives: {}
  };

  const preReadiness = { destinationPrepared: true };
  if (!boundaryProbe.compatibilityAwake(recipe, frameState, preReadiness)) {
    fail("first Grave route remained asleep while Hub active and destination prepared");
  }

  const readiness = boundaryProbe.hubEntryReadiness(recipe, frameState, {
    requireGraveReturn: false,
    preparationFlag: "hubToGraveReady"
  });
  if (!readiness.ready) fail("first Grave boundary still required foundation.completed / screen truth");
  if (readiness.screenTruthOwnsFirstDestinationPermission !== false) {
    fail("first Grave readiness did not explicitly remove screen-truth permission ownership");
  }

  frameState.hubChamberFoundation.firstDestinationInvitation.active = false;
  const blocked = boundaryProbe.hubEntryReadiness(recipe, frameState, {
    requireGraveReturn: false,
    preparationFlag: "hubToGraveReady"
  });
  if (blocked.ready) fail("first Grave boundary crossed before the authored body invitation was active");
}

// Runtime proof 2: HubInvestigation can offer A/E for the first Grave body before
// foundation.completed, but only when the explicit first-destination invitation is active.
{
  const frameState = {
    activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    act1RouteHistory: { graveEntered: false },
    hubChamberFoundation: {
      completed: false,
      firstDestinationInvitation: {
        active: true,
        routeId: "grave_memory_route",
        gateId: "hub_to_grave_memory_route",
        displayName: "Grave Memory"
      },
      routes: [{
        id: "grave_memory_route",
        displayName: "Grave Memory",
        gateId: "hub_to_grave_memory_route",
        activeRoute: true,
        destinationMounted: true,
        playableReady: true,
        gameplayPending: false,
        distanceToPlayer: 1.4
      }],
      thresholds: []
    }
  };
  const system = new HubInvestigationGameplaySystem({
    recipeDataSystem: {},
    scene: {},
    playerRoot: {},
    frameState
  });
  system.updateCommitCandidate(frameState);
  if (system.commitCandidate?.id !== "grave_memory_route") {
    fail("HubInvestigation did not select first Grave body while whole-Hub completion was false");
  }
  system.publishCommitmentOpportunity(frameState);
  if (frameState.commitmentOpportunity?.kind !== "hub_route_destination") {
    fail("HubInvestigation did not publish deliberate first-destination A/E opportunity");
  }

  frameState.hubChamberFoundation.firstDestinationInvitation.active = false;
  system.updateCommitCandidate(frameState);
  if (system.commitCandidate) fail("HubInvestigation kept first destination candidate after invitation closed");
}

// Runtime proof 3: later Hub routes keep the old foundation completion dependency.
{
  const boundaryProbe = Object.create(LocalCellBoundaryMorphSystem.prototype);
  const recipe = {
    id: "hub_to_vascular",
    gateId: "hub_to_vascular_route",
    routeId: "vascular_route",
    sourceCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    destinationCellId: "CELL_VASCULAR_RHYTHM_ROUTE_001",
    interactionRange: 2.15
  };
  const frameState = {
    activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    act1RouteHistory: { graveEntered: true, graveReturned: true },
    transitionContinuity: { hubToVascularReady: true },
    hubChamberFoundation: {
      completed: false,
      firstDestinationInvitation: { active: false },
      routes: [{ id: "vascular_route", gateId: "hub_to_vascular_route", distanceToPlayer: 1.2, position: [0, 2, 0] }],
      thresholds: []
    },
    firstSliceObjectives: { grave_memory_read_and_stabilize: { complete: true } }
  };
  const readiness = boundaryProbe.hubEntryReadiness(recipe, frameState, {
    requireGraveReturn: true,
    preparationFlag: "hubToVascularReady"
  });
  if (readiness.ready) fail("P1 accidentally bypassed later-route foundation completion law");
}

// Runtime observer proof: v1.39 reports first-destination readiness independently of
// whole-Hub screen truth, then availability, deliberate commit, and authored arrival.
{
  let now = 1000;
  const frameState = {
    buildId: "HC-031P1",
    buildLabel: "First Destination Commitment Unblock",
    activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    runtimeSeconds: 1,
    transitionContinuity: { hubToGraveReady: true },
    hubChamberFoundation: {
      completed: false,
      firstDestinationInvitation: {
        active: true,
        blocker: "none",
        routeId: "grave_memory_route",
        gateId: "hub_to_grave_memory_route",
        displayName: "Grave Memory",
        distanceToPlayer: 1.4,
        wholeHubScreenTruthVerified: false,
        screenTruthRequiredForCommit: false,
        bodyCue: "existing_corridor_wave_from_hub_center_to_grave",
        commitControl: "A / E",
        transitionOwner: "LocalCellBoundaryMorphSystem"
      }
    },
    hubRouteCommit: {
      available: true,
      routeId: "grave_memory_route",
      gateId: "hub_to_grave_memory_route",
      displayName: "Grave Memory",
      distance: 1.4,
      selectionRadius: 2.1,
      control: "A / E"
    },
    targeting: {},
    playerAttachment: {},
    corePerformance: {},
    input: {}
  };
  const telemetry = new SessionTelemetrySystem({ frameState, monotonicNowMs: () => now });
  telemetry.lastHubDestinationAvailableRouteId = "none";
  telemetry.observeHubDestinationCommitment(frameState);
  const readiness = telemetry.events.find((event) => event.type === "hub.destination.readiness_changed");
  const available = telemetry.events.find((event) => event.type === "hub.destination.available");
  if (!readiness || !available) fail("runtime observer did not report first-destination readiness + availability");
  if (readiness.developer?.foundationCompleted !== false || readiness.developer?.screenTruthRequiredForCommit !== false) {
    fail("runtime observer lost P1 screen-truth decoupling evidence");
  }

  now += 50;
  frameState.hubRouteCommitRequest = {
    eventId: 7,
    routeId: "grave_memory_route",
    gateId: "hub_to_grave_memory_route",
    sourceCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    consequenceAuthority: "LocalCellBoundaryMorphSystem"
  };
  telemetry.observeHubDestinationCommitment(frameState);
  if (!telemetry.events.find((event) => event.type === "hub.destination.committed")) {
    fail("runtime observer did not report deliberate Grave commit");
  }

  now += 50;
  frameState.activeCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
  telemetry.observeCell(frameState);
  const entered = telemetry.events.find((event) => event.type === "transition.entered" && event.developer?.gateId === "hub_to_grave_memory_route");
  const resolved = telemetry.events.find((event) => event.type === "route.resolved" && event.developer?.routeId === "grave_memory_route");
  if (!entered || !resolved) fail("runtime observer did not report Hub→Grave arrival");
}

console.log(`[HC031P1] PASS — first Grave destination permission is decoupled from whole-Hub screen truth, authored body reveal + prepared destination can publish A/E commitment, LocalCellBoundaryMorphSystem still owns crossing, later route gates remain unchanged, telemetry v1.39 exposes readiness→availability→commit→arrival, and ${Object.keys(locked.files).length} neighboring gameplay owners verified unchanged.`);
