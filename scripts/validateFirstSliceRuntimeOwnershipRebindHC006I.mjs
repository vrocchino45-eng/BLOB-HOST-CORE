import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RegionRegistry } from "../src/world/RegionRegistry.js";
import { GateRegistry } from "../src/world/GateRegistry.js";
import { ObjectiveRegistry } from "../src/world/ObjectiveRegistry.js";
import { CameraProfileRegistry } from "../src/world/CameraProfileRegistry.js";
import { VisualLanguageRegistry } from "../src/world/VisualLanguageRegistry.js";
import { ModeController } from "../src/modes/ModeController.js";
import { ObjectiveSystem } from "../src/systems/ObjectiveSystem.js";
import { GateSystem } from "../src/systems/GateSystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateFirstSliceRuntimeOwnershipRebindHC006I] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const regions = readJson("public/data/world/firstSliceRegions_HC006I.json");
const gates = readJson("public/data/gates/firstSliceGates_HC006I.json");
const objectives = readJson("public/data/objectives/firstSliceObjectives_HC006I.json");
const cameras = readJson("public/data/camera/firstSliceCameraProfiles_HC006I.json");
const visuals = readJson("public/data/visual/firstSliceVisualLanguages_HC006I.json");
const runtimeProfile = readJson(
  manifest.id === "HC-014I"
    ? "public/data/runtime/act1RuntimeProfile_HC014I.json"
    : manifest.id === "HC-014G"
    ? "public/data/runtime/act1RuntimeProfile_HC014G.json"
    : manifest.id === "HC-014F"
    ? "public/data/runtime/act1RuntimeProfile_HC014F.json"
    : manifest.id === "HC-014E"
    ? "public/data/runtime/act1RuntimeProfile_HC014E.json"
    : manifest.id === "HC-014D"

    ? "public/data/runtime/act1RuntimeProfile_HC014D.json"

    : manifest.id === "HC-014C"

    ? "public/data/runtime/act1RuntimeProfile_HC014C.json"
    : manifest.id === "HC-014B"
    ? "public/data/runtime/act1RuntimeProfile_HC014B.json"
    : manifest.id === "HC-014A"
    ? "public/data/runtime/act1RuntimeProfile_HC014A.json"
    : manifest.id === "HC-013D"
    ? "public/data/runtime/act1RuntimeProfile_HC013D.json"
    : manifest.id === "HC-013C"
      ? "public/data/runtime/act1RuntimeProfile_HC013C.json"
      : manifest.id === "HC-013B"
    ? "public/data/runtime/act1RuntimeProfile_HC013B.json"
    : manifest.id === "HC-013A"
    ? "public/data/runtime/act1RuntimeProfile_HC013A.json"
    : manifest.id === "HC-012C"
    ? "public/data/runtime/act1RuntimeProfile_HC012C.json"
    : manifest.id === "HC-012B"
    ? "public/data/runtime/act1RuntimeProfile_HC012B.json"
    : manifest.id === "HC-012A"
    ? "public/data/runtime/act1RuntimeProfile_HC012A.json"
    : manifest.id === "HC-011B"
    ? "public/data/runtime/act1RuntimeProfile_HC011B.json"
    : manifest.id === "HC-011A1"
    ? "public/data/runtime/act1RuntimeProfile_HC011A1.json"
    : manifest.id === "HC-011A"
    ? "public/data/runtime/act1RuntimeProfile_HC011A.json"
    : manifest.id === "HC-010G"
    ? "public/data/runtime/act1RuntimeProfile_HC010G.json"
    : manifest.id === "HC-010F"
    ? "public/data/runtime/act1RuntimeProfile_HC010F.json"
    : manifest.id === "HC-010E"
    ? "public/data/runtime/act1RuntimeProfile_HC010E.json"
    : manifest.id === "HC-010D"
    ? "public/data/runtime/act1RuntimeProfile_HC010D.json"
    : manifest.id === "HC-010C"
    ? "public/data/runtime/act1RuntimeProfile_HC010C.json"
    : manifest.id === "HC-010B"
    ? "public/data/runtime/act1RuntimeProfile_HC010B.json"
    : manifest.id === "HC-010A"
    ? "public/data/runtime/act1RuntimeProfile_HC010A.json"
    : manifest.id === "HC-009G"
    ? "public/data/runtime/firstSliceRuntimeProfile_HC009G.json"
    : manifest.id === "HC-009F"
    ? "public/data/runtime/firstSliceRuntimeProfile_HC009F.json"
    : manifest.id === "HC-009E"
    ? "public/data/runtime/firstSliceRuntimeProfile_HC009E.json"
    : manifest.id === "HC-009D"
    ? "public/data/runtime/firstSliceRuntimeProfile_HC009D.json"
    : ["HC-009B", "HC-009C"].includes(manifest.id)
      ? "public/data/runtime/firstSliceRuntimeProfile_HC009B.json"
      : "public/data/runtime/firstSliceRuntimeProfile_HC009A.json"
);
const runtimeSource = readText("src/core/GameRuntime.js");

assert([["HC-006I", "0.0.90"], ["HC-006IA", "0.0.91"], ["HC-006J", "0.0.92"], ["HC-006JA", "0.0.93"], ["HC-006K", "0.0.94"], ["HC-006KA", "0.0.95"], ["HC-006KB", "0.0.96"], ["HC-006KC", "0.0.97"], ["HC-006KD", "0.0.98"], ["HC-007A", "0.0.99"], ["HC-007B", "0.0.100"], ["HC-007C", "0.0.101"], ["HC-007D", "0.0.102", "0.0.103", "0.0.104", "0.0.105"], ["HC-007E", "0.0.103", "0.0.104", "0.0.105"], ["HC-008B", "0.0.104"], ["HC-008C", "0.0.105"], ["HC-008D", "0.0.106"], ["HC-008E", "0.0.107", "0.0.108"], ["HC-008F", "0.0.108"], ["HC-008G", "0.0.109"], ["HC-009A", "0.0.110"], ["HC-009B", "0.0.111"], ["HC-009C", "0.0.112"], ["HC-009D", "0.0.113"], ["HC-009E", "0.0.114"], ["HC-009F", "0.0.115"], ["HC-009G", "0.0.116"], ["HC-010A", "0.0.117"], ["HC-010B", "0.0.118"], ["HC-010C", "0.0.119"], ["HC-010D", "0.0.120"], ["HC-010E", "0.0.121"], ["HC-010F", "0.0.122"], ["HC-010G", "0.0.123"], ["HC-011A", "0.0.124"], ["HC-011A1", "0.0.125"], ["HC-011B", "0.0.126"], ["HC-012A", "0.0.127"], ["HC-012B", "0.0.128"], ["HC-012C", "0.0.129"], ["HC-013A", "0.0.130"], ["HC-013B", "0.0.131"], ["HC-013C", "0.0.132"], ["HC-013D", "0.0.133"], ["HC-014A", "0.0.134"], ["HC-014B", "0.0.135"], ["HC-014C", "0.0.136"], ["HC-014D", "0.0.137"], ["HC-014E", "0.0.138"], ["HC-014F", "0.0.139"], ["HC-014G", "0.0.140"], ["HC-014I", "0.0.142"]].some(([id, version]) => manifest.id === id && manifest.version === version), "manifest must preserve HC-006I ownership through HC-014A.");
assert(pkg.version === manifest.version, "package must preserve the active lineage identity.");
assert(regions.slice(0, 3).map((entry) => entry.id).join("|") === "surface_wake|guide_threshold|hub_chamber", "region path must preserve the true first slice.");
if (["HC-010A", "HC-010B", "HC-010C", "HC-010D", "HC-010E", "HC-010F", "HC-010G", "HC-011A", "HC-011A1", "HC-011B", "HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)) {
  assert(regions[3]?.id === "grave_memory_route", `${manifest.id} must append exactly the bounded Grave Memory route.`);
}
assert(gates.slice(0, 2).map((entry) => entry.id).join("|") === "surface_to_guide_threshold|guide_to_hub_chamber", "required first-slice gates are incomplete.");
assert(gates.some((entry) => entry.id === "hub_to_grave_memory_route"), "HC-006J must preserve one active Hub route gate.");
if (["HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)) {
  const contracts = gates.filter((entry) => entry.authoredStatus === "contract_bound_route");
  assert(contracts.length === 2, "HC-012A must retain both mounted Hub route contracts.");
  assert(contracts.every((entry) => entry.playableReady === true), "HC-012A Vascular and Silt contracts must both be playable.");
} else if (["HC-011A", "HC-011A1", "HC-011B"].includes(manifest.id)) {
  const contracts = gates.filter((entry) => entry.authoredStatus === "contract_bound_route");
  assert(contracts.length === 2, "HC-011A must retain both mounted Hub route contracts.");
  assert(contracts.find((entry) => entry.id === "hub_to_vascular_route")?.playableReady === true, "HC-011A Vascular contract must be playable.");
  assert(contracts.find((entry) => entry.id === "hub_to_silt_burrow_route")?.playableReady === false, "HC-011A Silt contract must remain pending.");
} else if (manifest.id === "HC-010G") {
  const contracts = gates.filter((entry) => entry.authoredStatus === "contract_bound_route");
  assert(contracts.length === 2 && contracts.every((entry) => entry.playableReady === false), "HC-010G must bind two non-playable Hub route contracts.");
} else {
  assert(gates.filter((entry) => entry.authoredStatus === "dormant_route").length === 2, "HC-006J must publish two dormant Hub route gates.");
}
assert(objectives.slice(0, 3).map((entry) => entry.id).join("|") === "surface_absorb_first_nutrient|guide_stabilize_and_cross|hub_read_route_gates", "required first-slice objectives are incomplete.");
assert(cameras.length >= 3 && visuals.length >= 3, "each first-slice region requires camera and visual authored data.");
if (["HC-010A", "HC-010B", "HC-010C", "HC-010D", "HC-010E", "HC-010F", "HC-010G", "HC-011A", "HC-011A1", "HC-011B", "HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)) {
  assert(objectives[3]?.id === "grave_memory_read_and_stabilize", `${manifest.id} Grave objective is missing.`);
  assert(cameras[3]?.id === "camera_grave_memory_route", `${manifest.id} Grave camera is missing.`);
  assert(visuals[3]?.id === "grave_memory_residue_bed", `${manifest.id} Grave visual language is missing.`);
}
if (["HC-010G", "HC-011A", "HC-011A1", "HC-011B", "HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)) {
  assert(regions.slice(4, 6).map((entry) => entry.id).join("|") === "vascular_route|silt_burrow_route", "HC-010G route destinations are missing.");
  assert(objectives.slice(4, 6).map((entry) => entry.id).join("|") === "vascular_route_playable_circuit|silt_route_playable_circuit", "HC-010G route objectives are missing.");
  assert(cameras.slice(4, 6).map((entry) => entry.id).join("|") === "camera_vascular_rhythm_contract|camera_silt_pressure_contract", "HC-010G route cameras are missing.");
  assert(visuals.slice(4, 6).map((entry) => entry.id).join("|") === "vascular_rhythm_contract|silt_pressure_contract", "HC-010G route visual languages are missing.");
}
assert(
  (regions[2].runtimeProxy === "signal_chorus_route_awareness_core_inside_hub_foundation" && regions[2].fullRegionPending === true)
  || (regions[2].runtimeProxy === "none" && regions[2].fullRegionPending === false && regions[2].runtimeMountProfile === runtimeProfile.id),
  "Hub must retain either the historical proxy or the HC-009A/HC-009B authored mount."
);
assert(runtimeSource.includes('this.registry.register("modeController"') && runtimeSource.includes('this.registry.register("objectiveSystem"') && runtimeSource.includes('this.registry.register("gateSystem"'), "GameRuntime must register mode, objective, and gate ownership.");
assert(runtimeSource.includes('this.registry.register("hubChamberFoundationSystem"'), "HC-006J must register the Hub foundation presentation owner.");

const regionRegistry = new RegionRegistry(regions);
const gateRegistry = new GateRegistry(gates);
const objectiveRegistry = new ObjectiveRegistry(objectives);
const cameraRegistry = new CameraProfileRegistry(cameras);
const visualRegistry = new VisualLanguageRegistry(visuals);
const frame = {
  activeCellId: "CELL_MEMBRANE_NURSERY_001",
  surfaceWakeLayeredInteraction: { active: true, completed: false, safeSeedReadable: false, blocksSafeSeedAbsorb: true, progress: 0.3 },
  localCellMorph: { completed: false },
  guideThresholdLayeredInteraction: {},
  secondLocalCellMorph: {},
  signalChorusArrival: {},
  signalChorusLayeredInteraction: {},
  hubChamberFoundation: {}
};
const mode = new ModeController({
  regionRegistry,
  cameraProfileRegistry: cameraRegistry,
  visualLanguageRegistry: visualRegistry,
  frameState: frame,
  runtimeProfile
});
const objective = new ObjectiveSystem({ objectiveRegistry, regionRegistry, frameState: frame });
const gate = new GateSystem({ gateRegistry, frameState: frame });
const step = () => { mode.update(1 / 60, frame); objective.update(1 / 60, frame); gate.update(1 / 60, frame); };

step();
assert(frame.currentMode.id === "landing_mode" && frame.currentMode.regionId === "surface_wake", "Surface Wake must be owned by LandingMode.");
assert(frame.objectiveState.id === "surface_absorb_first_nutrient" && !frame.objectiveState.complete, "Surface objective must be active and incomplete initially.");
assert(frame.gateState.id === "surface_to_guide_threshold" && frame.gateState.status === "locked", "Surface gate must begin locked.");

frame.surfaceWakeLayeredInteraction = { completed: true, safeSeedReadable: true, blocksSafeSeedAbsorb: false };
frame.localCellMorph = { completed: true };
frame.activeCellId = "CELL_SCAR_FLOW_FOLD_001";
frame.guideThresholdLayeredInteraction = { active: true, progress: 0.65, alignmentProgress: 1, resonanceHold: 0.7 };
step();
assert(frame.currentMode.id === "threshold_mode" && frame.currentMode.regionId === "guide_threshold", "Guide Threshold must be owned by ThresholdMode.");
assert(frame.firstSliceGates.surface_to_guide_threshold.crossed, "Surface gate must be recorded crossed after the handoff.");
assert(frame.objectiveState.id === "guide_stabilize_and_cross" && frame.objectiveState.status === "active", "Guide objective must own the threshold scene.");

frame.guideThresholdLayeredInteraction = { completed: true, stage: "guide_threshold_complete_retained", progress: 1, settleLatched: true };
frame.secondLocalCellMorph = { completed: true };
frame.activeCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
frame.signalChorusArrival = { completed: true };
frame.signalChorusLayeredInteraction = { active: true, completed: true, progress: 1 };
frame.hubChamberFoundation = {
  active: true,
  completed: true,
  centralAnchorReadable: true,
  threeRouteLayoutReadable: true,
  activeRouteIdentityDistinguished: true,
  firstMemoryFragmentReadable: true,
  activeRouteId: "grave_memory_route",
  routeCount: 3,
  dormantRouteCount: 2
};
step();
assert(frame.currentMode.id === "hub_mode" && frame.currentMode.regionId === "hub_chamber", "Signal Chorus memory core inside the Hub foundation must be owned by HubMode.");
if (["HC-009A", "HC-009B", "HC-009C", "HC-009D", "HC-009E", "HC-009F", "HC-009G", "HC-010A", "HC-010B", "HC-010C", "HC-010D", "HC-010E", "HC-010F", "HC-010G", "HC-011A", "HC-011A1", "HC-011B", "HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(manifest.id)) {
  assert(!frame.currentMode.fullRegionPending && frame.currentMode.runtimeProxy === "none", "HC-009A+ Hub must be a direct authored runtime mount.");
  assert(frame.firstSliceRuntimeMount.presentationOwner === "HubChamberFoundationSystem", "HC-009A+ Hub presentation authority changed.");
} else {
  assert(frame.currentMode.fullRegionPending && frame.currentMode.runtimeProxy === "signal_chorus_route_awareness_core_inside_hub_foundation", "Hub foundation status must remain explicit at runtime.");
}
assert(frame.firstSliceGates.guide_to_hub_chamber.crossed, "Guide-to-Hub gate must be recorded crossed.");
if (["HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G", "HC-009A", "HC-009B", "HC-009C", "HC-009D", "HC-009E", "HC-009F", "HC-009G", "HC-010A", "HC-010B", "HC-010C", "HC-010D", "HC-010E", "HC-010F", "HC-010G", "HC-011A", "HC-011A1", "HC-011B", "HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"] .includes(manifest.id)) {
  assert(!frame.objectiveState.complete && frame.objectiveState.progress === 0.8, "HC-006K Hub objective must remain at 80% until first Status Page use.");
  assert(frame.objectiveState.status === "hub_foundation_complete_status_page_pending", "HC-006K Hub objective must publish status-page-pending state.");
  frame.statusPage = { firstHubUseComplete: true };
  step();
  assert(frame.objectiveState.complete && frame.objectiveState.status === "hub_first_slice_complete", "HC-006K Hub objective must complete after first Status Page use.");
} else {
  assert(frame.objectiveState.complete && frame.objectiveState.status === "hub_foundation_complete_first_route_preview_ready", "HC-006J Hub objective must complete only after the authored foundation is readable.");
}
if (["HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G", "HC-009A", "HC-009B", "HC-009C", "HC-009D", "HC-009E", "HC-009F", "HC-009G", "HC-010A", "HC-010B", "HC-010C", "HC-010D", "HC-010E", "HC-010F", "HC-010G", "HC-011A", "HC-011A1", "HC-011B", "HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"] .includes(manifest.id)) {
  assert(frame.firstSliceGates.hub_to_grave_memory_route.status === "crossable", "HC-006KA Grave Memory gate must become crossable after first Hub Status Page use.");
} else {
  assert(frame.firstSliceGates.hub_to_grave_memory_route.status === "available", "the active existing-route compatibility gate must become available.");
}
assert(frame.firstSliceGates.hub_to_vascular_route.status === "locked" && frame.firstSliceGates.hub_to_silt_burrow_route.status === "locked", "dormant Hub gates must remain locked.");
assert(frame.firstSliceRuntimeOwnership.hudOwnership === "read_only", "UI ownership must remain read-only.");

console.log("validateFirstSliceRuntimeOwnershipRebindHC006I validation passed.");
