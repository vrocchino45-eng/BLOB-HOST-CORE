import fs from "node:fs";
import crypto from "node:crypto";
import { ModeController } from "../src/modes/ModeController.js";
import { SystemRegistry } from "../src/core/SystemRegistry.js";

const read = (p) => fs.readFileSync(p, "utf8");
const json = (p) => JSON.parse(read(p));
const assert = (condition, message) => { if (!condition) throw new Error(`[HC031U] ${message}`); };
const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const pkg = json("package.json");
const runtime = json("public/data/runtime/act1RuntimeProfile_HC016M.json");
const cells = json("public/data/world/localCellRecipes.json");
const main = read("src/main.js");
const gameRuntime = read("src/core/GameRuntime.js");
const entitySystem = read("src/ecology/EntitySystem.js");
const alive = read("src/fields/GatheringGroundAliveSystem.js");
const adjacent = read("src/fields/ApertureAdjacentTerritorySystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");
const guide = read("src/guide/GuidePromptSystem.js");

assert(/^0\.31\.(49|50)$/.test(pkg.version), `HC031U family version expected 0.31.49/50, got ${pkg.version}`);
assert(main.includes('buildId: "HC-031U'), "main buildId left HC031U family");

const aperture = runtime.regions?.aperture_fields;
assert(aperture, "Aperture runtime profile missing");
assert(aperture.systemIds?.includes("gatheringGroundAliveSystem"), "GatheringGroundAliveSystem not mounted in Aperture profile");
assert(aperture.systemIds?.includes("apertureAdjacentTerritorySystem"), "HC031T6 adjacent territory owner was lost");
assert(aperture.activeUpdateBudget === 11, `Aperture update budget should be 11, got ${aperture.activeUpdateBudget}`);
assert(aperture.fullEcologyMounted === true && aperture.ecologyGameplayReady === true, "Aperture ecology readiness not currentized");

// Exercise the real active-region publication/gate that blocked T5 before T6.
const frameState = { activeCellId: "CELL_APERTURE_FIELDS_ARRIVAL_001", frame: 1 };
const region = {
  id: "aperture_fields", displayName: "Aperture Fields", regionType: "host_field",
  hostFunction: "aperture_exchange", movementMode: "aperture_fields_arrival",
  cameraProfile: "camera_aperture_fields_arrival", visualLanguage: "aperture_fields_visual",
  objective: "aperture_fields_arrival", gateOut: "none", implementationStatus: "runtime_active"
};
const modeController = new ModeController({
  regionRegistry: { getByRuntimeCellId: (id) => id === frameState.activeCellId ? region : null },
  cameraProfileRegistry: { get: (id) => ({ id, mode: "field" }) },
  visualLanguageRegistry: { get: (id) => ({ id }) },
  frameState, runtimeProfile: runtime
});
modeController.update(1 / 60, frameState);
const mount = frameState.firstSliceRuntimeMount;
assert(mount.activeRegionId === "aperture_fields", "ModeController must mount Aperture");
for (const id of ["apertureAdjacentTerritorySystem", "gatheringGroundAliveSystem"]) {
  assert(mount.regionSystemIds.includes(id), `published regionSystemIds missing ${id}`);
  assert(mount.activeSystemIds.includes(id), `published activeSystemIds missing ${id}`);
}
assert(mount.activeSystemCount === 11, `expected 11 active systems, got ${mount.activeSystemCount}`);
assert(mount.activeUpdateBudget === 11, `expected update budget 11, got ${mount.activeUpdateBudget}`);
let mounted = 0; let updated = 0;
const registry = new SystemRegistry();
registry.register("gatheringGroundAliveSystem", { onRuntimeMount(){ mounted += 1; }, update(){ updated += 1; } }, { runtimeScope: "active_region" });
registry.update(1 / 60, frameState);
assert(mounted === 1 && updated === 1, "SystemRegistry must mount and execute GatheringGroundAliveSystem through active_region gate");

const apertureCell = cells.find((cell) => cell.id === "CELL_APERTURE_FIELDS_ARRIVAL_001");
assert(apertureCell, "Aperture local cell recipe missing");
const placements = apertureCell.contents?.entityPlacements ?? [];
const byId = new Map(placements.map((entry) => [entry.instanceId, entry]));
for (const id of ["gathering_ground_watcher_001", "gathering_ground_relay_a_001", "gathering_ground_relay_b_001"]) {
  assert(byId.has(id), `missing Gathering Ground population ${id}`);
  assert(byId.get(id).coordinateSpace === "aperture_anchor_relative", `${id} is not canonical-anchor relative`);
  assert(String(byId.get(id).distributionRole).startsWith("gathering_ground_"), `${id} missing Gathering Ground distribution role`);
}

assert(gameRuntime.includes('import { GatheringGroundAliveSystem }'), "GameRuntime import missing");
assert(gameRuntime.includes("this.gatheringGroundAliveSystem = new GatheringGroundAliveSystem"), "GameRuntime construction missing");
assert(gameRuntime.includes('registry.register("gatheringGroundAliveSystem"'), "GatheringGroundAliveSystem registry mount missing");
assert(entitySystem.includes('coordinateSpace === "aperture_anchor_relative"'), "EntitySystem canonical Aperture anchor support missing");
assert(entitySystem.includes("gatheringGroundLocal"), "EntitySystem local-entry visibility gate missing");

for (const id of [
  "ambient_watcher_sweep",
  "ambient_relay_exchange",
  "reactive_watcher_stable_interrogation",
  "reactive_relay_held_intake",
  "cross_ridge_echo_return",
  "cross_matter_spill_return"
]) assert(alive.includes(id), `encounter definition missing: ${id}`);
assert((alive.match(/family: "ambient"/g) ?? []).length === 2, "expected 2 ambient encounters");
assert((alive.match(/family: "reactive"/g) ?? []).length === 2, "expected 2 reactive encounters");
assert((alive.match(/family: "cross_territory"/g) ?? []).length === 2, "expected 2 cross-territory encounters");
assert(alive.includes('interpretation === "stable_interrogation"'), "Watcher Stabilize+Pulse chord proof missing");
assert(alive.includes('interpretation === "held_intake"'), "Relay Stabilize+Absorb chord proof missing");
for (const authority of ["progressionAuthority", "targetingAuthority", "movementAuthority", "collisionAuthority", "chemistryAuthority", "cellAuthority", "routeAuthority", "saveStateAuthority"]) {
  assert(alive.includes(`${authority}: false`), `${authority} must remain false`);
}

// T6 continuity law stays intact: Ridge opens movement, same cell, no teleport, 13.5 local entry.
assert(adjacent.includes("const ridgeComplete = Boolean(frameState.membraneRidgeGameplay?.completed)"), "Ridge completion opening law changed");
assert(adjacent.includes("const entryRadius = 13.5"), "Gathering Ground entry radius changed");
assert(adjacent.includes("activeCellChangesRequired: false"), "same-cell continuity law changed");
assert(adjacent.includes("teleportRequired: false"), "no-teleport law changed");
assert(adjacent.includes("previousObservationCount"), "OBS3 telemetry dedupe missing");

assert(telemetry.includes('blob.session.telemetry.v1.4'), "HC031U-family telemetry schema missing");
assert(telemetry.includes("observeGatheringGroundAlive(frameState)"), "Gathering Ground encounter telemetry observer missing");
assert(telemetry.includes("gatheringGroundUniqueEncounterCompletions"), "encounter completion summary missing");
assert(telemetry.includes("gatheringGroundAliveState"), "movement sample encounter snapshot missing");
assert(hud.includes("LIFE ${gatheringGroundAlive.completedCount"), "HUD LIFE readout missing");
assert(guide.includes("Try Stabilize + Pulse near the Watcher"), "Guide reactive grammar prompt missing");

const locked = json("public/data/build/hc031uLockedParentHashes.json");
for (const [path, expected] of Object.entries(locked.files ?? {})) {
  assert(fs.existsSync(path), `locked file missing: ${path}`);
  assert(sha(path) === expected, `locked parent drift: ${path}`);
}

console.log("HC031U Gathering Ground Alive Pass 1 validation PASS");
console.log("- T6 continuity law retained");
console.log("- 3 encounter families x 2 encounters authored");
console.log("- canonical-anchor Watcher/relay population authored");
console.log("- encounter telemetry + debug readability wired");
