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
const fail = (message) => { throw new Error(`[HC031P1-HF1] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };

const main = read("src/main.js");
const investigation = read("src/hub/HubInvestigationGameplaySystem.js");
const boundary = read("src/morph/LocalCellBoundaryMorphSystem.js");
const telemetrySource = read("src/core/SessionTelemetrySystem.js");
const pkg = json("package.json");
const contract = json("public/data/build/hc031p1hf1DestinationCommitLatchContract.json");
const locked = json("public/data/build/hc031p1hf1LockedHashes.json");

need(main, 'buildId: "HC-031P1-HF1"', "build identity");
need(main, 'buildLabel: "Destination Commit Latch"', "build label");
if (pkg.version !== "0.31.37") fail("package version mismatch");
if (contract.parent !== "HC-031P1") fail("parent mismatch");
if (contract.mode !== "hotfix_destination_commit_latch") fail("mode mismatch");
if (contract.commitLaw?.oneChoiceOneRequest !== true) fail("one-choice/one-request law missing");

[
  "this.commitLatch = null;",
  "updateCommitLatch(frameState)",
  "if (this.commitLatch) {",
  'status: pending ? "commit_in_flight"',
  'pass: "HC-031P1-HF1"',
  "pendingEventId: this.commitLatch?.eventId",
  "frameState.commitmentOpportunity = null"
].forEach((token) => need(investigation, token, "Hub commitment latch"));

[
  "commitPending",
  '"commit_in_flight"',
  'readinessSource: commitPending',
  '"latched_destination_commit"',
  '(commit.available || commitPending) ? "none"',
  'pass: frameState.buildId ?? "HC-031P1-HF1"'
].forEach((token) => need(telemetrySource, token, "HF1 telemetry"));

// P1 permission law stays intact: the first Grave boundary still does not require
// whole-Hub screen completion, and LocalCellBoundaryMorphSystem still owns crossing.
[
  "const firstGraveEntry = Boolean(",
  "firstDestinationInvitation.active === true",
  "screenTruthOwnsFirstDestinationPermission: false"
].forEach((token) => need(boundary, token, "P1 permission lock"));

for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked gameplay owner changed: ${rel}`);
}

// Runtime proof 1: first valid A/E press latches one request and immediately removes
// the opportunity. A second deliberate event while pending cannot replace the request.
{
  const frameState = {
    frame: 100,
    activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    act1RouteHistory: { graveEntered: false },
    hubChamberFoundation: {
      completed: false,
      firstDestinationInvitation: { active: true },
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
    },
    deliberateCommitmentEvent: {
      eventId: "commit_1",
      kind: "hub_route_destination",
      sourceId: "hub_chamber",
      targetId: "grave_memory_route"
    },
    commitmentOpportunity: {
      available: true,
      kind: "hub_route_destination",
      sourceId: "hub_chamber",
      targetId: "grave_memory_route"
    }
  };
  const system = new HubInvestigationGameplaySystem({
    recipeDataSystem: {}, scene: {}, playerRoot: {}, frameState
  });
  system.updateCommitCandidate(frameState);
  if (system.commitCandidate?.id !== "grave_memory_route") fail("first Grave candidate not available before latch");
  system.handleCommitEvent(frameState);
  if (system.commitLatch?.eventId !== "commit_1") fail("first commitment did not latch");
  if (frameState.hubRouteCommitRequest?.eventId !== "commit_1") fail("first commitment request missing");
  system.publishCommitmentOpportunity(frameState);
  if (frameState.commitmentOpportunity) fail("commitment opportunity remained published while commit pending");
  if (!frameState.hubRouteCommit?.pending || frameState.hubRouteCommit?.available) fail("pending commit state was not published correctly");

  frameState.frame = 101;
  frameState.deliberateCommitmentEvent = {
    eventId: "commit_2",
    kind: "hub_route_destination",
    sourceId: "hub_chamber",
    targetId: "grave_memory_route"
  };
  system.handleCommitEvent(frameState);
  if (frameState.hubRouteCommitRequest?.eventId !== "commit_1") fail("second press replaced the latched commitment request");
  if (system.commitLatch?.eventId !== "commit_1") fail("second press replaced the commitment latch");
}

// Runtime proof 2: boundary ownership claims the latch, and only an explicit canceled
// boundary state while still in Hub releases it. Normal in-flight state remains latched.
{
  const frameState = {
    activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    hubRouteCommitFlight: {
      owner: "LocalCellBoundaryMorphSystem",
      routeId: "grave_memory_route",
      gateId: "hub_to_grave_memory_route",
      active: true,
      progress: 0.25
    },
    localCellBoundaryMorph: { active: true },
    hubRouteCommitRequest: { eventId: "commit_1" }
  };
  const system = new HubInvestigationGameplaySystem({ recipeDataSystem: {}, scene: {}, playerRoot: {}, frameState });
  system.commitLatch = {
    routeId: "grave_memory_route", gateId: "hub_to_grave_memory_route", eventId: "commit_1", ownerStarted: false
  };
  system.updateCommitLatch(frameState);
  if (!system.commitLatch?.ownerStarted) fail("boundary owner did not claim pending latch");

  frameState.hubRouteCommitFlight.active = false;
  frameState.hubRouteCommitFlight.progress = 0.6;
  frameState.localCellBoundaryMorph.active = true;
  system.updateCommitLatch(frameState);
  if (!system.commitLatch) fail("latch released while boundary morph was still active");

  frameState.localCellBoundaryMorph.active = false;
  system.updateCommitLatch(frameState);
  if (system.commitLatch) fail("explicit canceled boundary did not release latch");
  if (frameState.hubRouteCommitRequest !== null) fail("canceled boundary left stale commit request");
}

// Runtime proof 3: P1 first-destination permission remains decoupled from whole-Hub
// screen truth. HF1 changes commitment multiplicity only, not route availability.
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
      routes: [{ gateId: "hub_to_grave_memory_route", distanceToPlayer: 1.4, position: [2.2, 0, 0] }],
      thresholds: []
    },
    firstSliceObjectives: {}
  };
  const readiness = boundaryProbe.hubEntryReadiness(recipe, frameState, {
    requireGraveReturn: false, preparationFlag: "hubToGraveReady"
  });
  if (!readiness.ready) fail("HF1 regressed P1 first-destination permission law");
}

// Runtime observer proof: pending commit is semantically clean, the stale first-entry
// blocker cannot coexist with ready/pending truth, and implementationPass matches build.
{
  let now = 1000;
  const frameState = {
    buildId: "HC-031P1-HF1",
    buildLabel: "Destination Commit Latch",
    activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    runtimeSeconds: 1,
    transitionContinuity: { hubToGraveReady: true },
    hubChamberFoundation: {
      completed: true,
      firstDestinationInvitation: {
        active: false,
        blocker: "grave_already_entered",
        routeId: "grave_memory_route",
        gateId: "hub_to_grave_memory_route",
        displayName: "Grave Memory",
        distanceToPlayer: 1.5,
        wholeHubScreenTruthVerified: true,
        commitControl: "A / E"
      }
    },
    hubRouteCommit: {
      active: true,
      available: false,
      pending: true,
      routeId: "grave_memory_route",
      gateId: "hub_to_grave_memory_route",
      pendingEventId: "commit_7",
      selectionRadius: 2.1,
      control: "A / E"
    },
    hubRouteCommitRequest: {
      eventId: "commit_7",
      routeId: "grave_memory_route",
      gateId: "hub_to_grave_memory_route",
      sourceCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
      consequenceAuthority: "LocalCellBoundaryMorphSystem"
    },
    targeting: {}, playerAttachment: {}, corePerformance: {}, input: {}
  };
  const telemetry = new SessionTelemetrySystem({ frameState, monotonicNowMs: () => now });
  telemetry.observeHubDestinationCommitment(frameState);
  const readiness = telemetry.events.find((event) => event.type === "hub.destination.readiness_changed");
  if (!readiness) fail("pending readiness event missing");
  if (readiness.percept?.status !== "commit_in_flight") fail("pending readiness did not report commit_in_flight");
  if (readiness.developer?.invitationBlocker !== "none") fail("stale first-entry blocker leaked into pending commitment truth");
  if (readiness.developer?.readinessSource !== "latched_destination_commit") fail("pending readiness source missing");

  const exported = telemetry.exportSession();
  if (exported.session?.implementationPass !== "HC-031P1-HF1") fail("implementationPass did not match active build");
}

console.log(`[HC031P1-HF1] PASS — one Hub A/E choice creates one latched commitment request, repeated presses cannot replace it during the boundary morph, cancel can re-arm safely, P1 first-destination permission remains intact, telemetry reports commit_in_flight cleanly, and ${Object.keys(locked.files).length} neighboring gameplay owners verified unchanged.`);
