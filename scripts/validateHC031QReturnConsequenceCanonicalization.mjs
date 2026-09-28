import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { SessionTelemetrySystem } from "../src/core/SessionTelemetrySystem.js";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));
const hash = (rel) => crypto.createHash("sha256")
  .update(read(rel).replace(/\r\n?/g, "\n"), "utf8")
  .digest("hex");
const fail = (message) => { throw new Error(`[HC031Q] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };

const main = read("src/main.js");
const hub = read("src/hub/HubChamberFoundationSystem.js");
const telemetrySource = read("src/core/SessionTelemetrySystem.js");
const pkg = json("package.json");
const contract = json("public/data/build/hc031qReturnConsequenceCanonicalizationContract.json");
const locked = json("public/data/build/hc031qLockedHashes.json");

need(main, 'buildId: "HC-031Q"', "build identity");
need(main, 'buildLabel: "Return Consequence Canonicalization"', "build label");
if (pkg.version !== "0.31.38") fail("package version mismatch");
if (contract.parent !== "HC-031P1-HF1") fail("parent mismatch");
if (contract.mode !== "convergence_return_consequence_canonicalization") fail("mode mismatch");
if (contract.telemetrySchema !== "blob.session.telemetry.v1.40") fail("contract telemetry schema mismatch");

[
  'returnedReadings: {',
  'hostFunction: "memory_residue"',
  'hostFunction: "rhythm_current"',
  'hostFunction: "pressure_density"',
  'returnSignature: "retained_memory_imprint"',
  'returnSignature: "synchronized_return_current"',
  'returnSignature: "released_return_breath"',
  'historyOwner: "LocalCellBoundaryMorphSystem"',
  'returnRecompositionState:',
  'returnRecompositionGameplayAuthority: false',
  '? "CELL_SILT_PRESSURE_ROUTE_001"'
].forEach((token) => need(hub, token, "Hub return recomposition"));

[
  'this.schemaVersion = "blob.session.telemetry.v1.40"',
  'this.lastHubReturnRecompositionKey = "none"',
  'observeHubReturnRecomposition(frameState)',
  '"hub.return_recomposition.changed"',
  'const activeRouteId = (commitPending || commit.available)',
  'hubToVascularPlayableReady',
  'hubToSiltPlayableReady',
  'preparationFlag,',
  'hubReturnRecompositionChanges: count("hub.return_recomposition.changed")'
].forEach((token) => need(telemetrySource, token, "Q telemetry"));

for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked gameplay owner changed: ${rel}`);
}

// Runtime observer proof 1: when Vascular is pending, readiness must describe Vascular,
// not fall back to the first Grave invitation that still exists as presentation history.
{
  let now = 1000;
  const frameState = {
    buildId: "HC-031Q",
    buildLabel: "Return Consequence Canonicalization",
    activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    runtimeSeconds: 1,
    transitionContinuity: { hubToVascularPlayableReady: true },
    hubChamberFoundation: {
      completed: true,
      firstDestinationInvitation: {
        active: false,
        blocker: "grave_already_entered",
        routeId: "grave_memory_route",
        gateId: "hub_to_grave_memory_route",
        displayName: "Grave Memory",
        distanceToPlayer: 1.2,
        wholeHubScreenTruthVerified: true,
        commitControl: "A / E"
      },
      routes: [{
        id: "vascular_route",
        gateId: "hub_to_vascular_route",
        displayName: "Vascular Rhythm",
        distanceToPlayer: 1.8,
        destinationMounted: true,
        transitionOwner: "LocalCellBoundaryMorphSystem"
      }],
      thresholds: []
    },
    hubRouteCommit: {
      active: true,
      available: false,
      pending: true,
      routeId: "vascular_route",
      gateId: "hub_to_vascular_route",
      pendingEventId: "commit_vascular_1",
      selectionRadius: 2.1,
      control: "A / E"
    },
    hubRouteCommitRequest: null,
    targeting: {}, playerAttachment: {}, corePerformance: {}, input: {}
  };
  const telemetry = new SessionTelemetrySystem({ frameState, monotonicNowMs: () => now });
  telemetry.observeHubDestinationCommitment(frameState);
  const event = telemetry.events.find((item) => item.type === "hub.destination.readiness_changed");
  if (!event) fail("generic Vascular readiness event missing");
  if (event.developer?.routeId !== "vascular_route") fail("Vascular pending readiness fell back to Grave routeId");
  if (event.developer?.gateId !== "hub_to_vascular_route") fail("Vascular pending readiness fell back to Grave gateId");
  if (event.developer?.preparationFlag !== "hubToVascularPlayableReady") fail("Vascular readiness preparation flag mismatch");
  if (event.developer?.destinationPrepared !== true) fail("Vascular prepared destination was not recognized");
  if (event.percept?.status !== "commit_in_flight") fail("Vascular pending readiness did not report commit_in_flight");
}

// Runtime observer proof 2: Host recomposition reports only changes to the retained
// reading set and keeps progression authority outside telemetry/presentation.
{
  let now = 2000;
  const frameState = {
    buildId: "HC-031Q",
    buildLabel: "Return Consequence Canonicalization",
    activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    runtimeSeconds: 2,
    hubChamberFoundation: { returnedReadings: {}, returnRecompositionState: "none" },
    targeting: {}, playerAttachment: {}, corePerformance: {}, input: {}
  };
  const telemetry = new SessionTelemetrySystem({ frameState, monotonicNowMs: () => now });
  telemetry.observeHubReturnRecomposition(frameState);
  if (telemetry.events.some((item) => item.type === "hub.return_recomposition.changed")) fail("empty retained set emitted a false recomposition change");

  frameState.hubChamberFoundation = {
    returnedReadings: {
      graveMemory: { routeId: "grave_memory_route", retained: true, hostFunction: "memory_residue" },
      vascularRhythm: { routeId: "vascular_route", retained: false, hostFunction: "rhythm_current" },
      siltPressure: { routeId: "silt_burrow_route", retained: false, hostFunction: "pressure_density" }
    },
    returnRecompositionState: "partial_host_recomposition"
  };
  telemetry.observeHubReturnRecomposition(frameState);
  telemetry.observeHubReturnRecomposition(frameState);
  let events = telemetry.events.filter((item) => item.type === "hub.return_recomposition.changed");
  if (events.length !== 1) fail("unchanged Grave retained set emitted duplicate recomposition events");
  if (events[0].developer?.gameplayAuthority !== false || events[0].developer?.routeAuthority !== false) fail("recomposition observer claimed gameplay authority");

  frameState.hubChamberFoundation.returnedReadings.vascularRhythm.retained = true;
  telemetry.observeHubReturnRecomposition(frameState);
  events = telemetry.events.filter((item) => item.type === "hub.return_recomposition.changed");
  if (events.length !== 2) fail("Vascular retained addition did not emit one recomposition change");
  if (events[1].percept?.retainedReadingCount !== 2) fail("retained reading count did not advance to two");
}

console.log(`[HC031Q] PASS — Grave/Vascular/Silt return consequences publish one canonical read-only Host recomposition surface, Hub destination readiness reports the actual pending route, Silt compatibility metadata is correct, telemetry v1.40 tracks retained-reading changes, and ${Object.keys(locked.files).length} neighboring gameplay owners verified unchanged.`);
