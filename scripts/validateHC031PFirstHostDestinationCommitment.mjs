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
const fail = (message) => { throw new Error(`[HC031P] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };

const main = read("src/main.js");
const hub = read("src/hub/HubChamberFoundationSystem.js");
const investigation = read("src/hub/HubInvestigationGameplaySystem.js");
const boundary = read("src/morph/LocalCellBoundaryMorphSystem.js");
const registry = read("src/morph/LocalCellBoundaryRecipeRegistry.js");
const telemetrySource = read("src/core/SessionTelemetrySystem.js");
const pkg = json("package.json");
const contract = json("public/data/build/hc031pFirstHostDestinationCommitmentContract.json");
const locked = json("public/data/build/hc031pLockedHashes.json");

need(main, 'buildId: "HC-031P"', "build identity");
need(main, 'buildLabel: "First Host Destination Commitment"', "build label");
if (pkg.version !== "0.31.35") fail("package version mismatch");
if (contract.parent !== "HC-031O1") fail("parent mismatch");
if (contract.mode !== "convergence_first_destination_commitment") fail("mode mismatch");

[
  'item.route.id === "grave_memory_route"',
  'invitationDirection = firstDestinationInvitation ? "hub_center_to_grave" : "none"',
  'existing_corridor_wave_from_hub_center_to_grave',
  'deliberateCommitRequired: true',
  'automaticCrossing: false',
  'progressionAuthority: false',
  'transitionOwner: "LocalCellBoundaryMorphSystem"'
].forEach((token) => need(hub, token, "first destination body cue"));

[
  'control: "A / E"',
  'role: "deliberate_destination_commit"',
  'genericInteract: false',
  'persistentIntent: true'
].forEach((token) => need(investigation, token, "deliberate Hub commitment lock"));

[
  'id: "hub_to_grave"',
  'trigger: "commit"',
  'interactionRange: 2.15',
  'readiness: "hub_grave_entry"'
].forEach((token) => need(registry, token, "Hub→Grave recipe lock"));
need(boundary, 'request.routeId === recipe?.routeId', "boundary commitment route ownership");
need(boundary, 'request.gateId === recipe?.gateId', "boundary commitment gate ownership");
need(boundary, 'transitionOwner: "LocalCellBoundaryMorphSystem"', "boundary transition ownership");

[
  'blob.session.telemetry.v1.38',
  'hub.destination.available',
  'hub.destination.committed',
  'activation: "deliberate_destination_commit"',
  'releaseState: "arrived_in_grave_memory"'
].forEach((token) => need(telemetrySource, token, "HC031P telemetry"));

for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked gameplay owner changed: ${rel}`);
}

// Runtime observer proof: availability -> deliberate commit -> authored cell arrival.
{
  let now = 1000;
  const frameState = {
    buildId: "HC-031P",
    buildLabel: "First Host Destination Commitment",
    activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    runtimeSeconds: 1,
    hubChamberFoundation: {
      firstDestinationInvitation: {
        active: true,
        routeId: "grave_memory_route",
        gateId: "hub_to_grave_memory_route",
        displayName: "Grave Memory",
        bodyCue: "existing_corridor_wave_from_hub_center_to_grave",
        commitControl: "A / E",
        transitionOwner: "LocalCellBoundaryMorphSystem",
        distanceToPlayer: 1.4
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
  const telemetry = new SessionTelemetrySystem({
    frameState,
    monotonicNowMs: () => now
  });
  telemetry.lastHubDestinationAvailableRouteId = "none";
  telemetry.observeHubDestinationCommitment(frameState);
  const available = telemetry.events.find((event) => event.type === "hub.destination.available");
  if (!available) fail("runtime proof did not record Grave destination availability");
  if (available.developer?.automaticCrossing !== false) fail("availability event lost deliberate-commit law");

  now += 50;
  frameState.hubRouteCommitRequest = {
    eventId: 7,
    routeId: "grave_memory_route",
    gateId: "hub_to_grave_memory_route",
    sourceCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    consequenceAuthority: "LocalCellBoundaryMorphSystem"
  };
  telemetry.observeHubDestinationCommitment(frameState);
  const committed = telemetry.events.find((event) => event.type === "hub.destination.committed");
  if (!committed) fail("runtime proof did not record deliberate Grave commitment");

  now += 50;
  frameState.activeCellId = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
  telemetry.observeCell(frameState);
  const entered = telemetry.events.find((event) => event.type === "transition.entered" && event.developer?.gateId === "hub_to_grave_memory_route");
  const resolved = telemetry.events.find((event) => event.type === "route.resolved" && event.developer?.routeId === "grave_memory_route");
  if (!entered || !resolved) fail("runtime proof did not observe Hub→Grave authored transition and arrival");
  if (entered.developer?.owner !== "LocalCellBoundaryMorphSystem") fail("telemetry reports wrong Hub→Grave transition owner");
}

console.log(`[HC031P] PASS — first Hub destination remains Grave, existing Hub anatomy now carries a body-led center→Grave invitation, A/E remains the deliberate destination commit, LocalCellBoundaryMorphSystem retains crossing authority, telemetry v1.38 proves availability→commit→arrival, and ${Object.keys(locked.files).length} neighboring gameplay owners verified unchanged.`);
