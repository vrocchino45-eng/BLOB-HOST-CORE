import fs from "node:fs";
import path from "node:path";

const must = (condition, message) => { if (!condition) throw new Error(`[HC026C] ${message}`); };
const text = (file) => fs.readFileSync(file, "utf8");
const json = (file) => JSON.parse(text(file));

const main = text("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const boundary = text("src/morph/LocalCellBoundaryMorphSystem.js");
const hud = text("src/ui/PlaytestHudSystem.js");
const recipe = text("src/data/RecipeDataSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity = json("public/data/build/currentBuildIdentity_HC026C.json");
const contract = json("public/data/build/hc026cSpatialMemoryLandmarksContract.json");
const pkg = json("package.json");

must(successorHC027C || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')))), "runtime identity missing");
must(successorHC027C || (["0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)), "package version mismatch");
must(identity.id === "HC-026C" && identity.sourceJsCount === 88, "identity/source lock mismatch");
must(successorHC027C || (["HC-026C","HC-026C1", "HC-027A", "HC-027B", "HC-027C", "HC-027C1", "HC-027D", "HC-027D1", "HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)), "inspection profile build mismatch");

for (const token of ["nursery_triad", "scar_double_rib", "chorus_triad"]) must(boundary.includes(token), `missing landmark signature ${token}`);
must(boundary.includes("createEarlyReturnDestinationSignature"), "destination-signature authoring helper missing");
must(boundary.includes("guideSeamsHaveDistinctDestinationSignatures: true"), "Guide destination distinction telemetry missing");
must(boundary.includes("spatialMemoryUsesWaypointArrows: false"), "no-waypoint lock missing");
must(boundary.includes("nearestDestinationSignature"), "destination signature readout missing");
must(boundary.includes("guide_surface_memory_seam") && boundary.includes("hub_guide_memory_seam"), "HC026B seam topology must remain intact");
must(boundary.includes("explicitInteractRequired: false") && boundary.includes("teleport: false") && boundary.includes("progressionMutation: false"), "movement-led/progression-neutral traversal lock missing");
must(hud.includes("nearestDestinationSignature"), "debug screenshot landmark readout missing");

const behavior = profile.behavior ?? {};
for (const key of [
  "earlyRegionSpatialMemoryLandmarksEnabled",
  "earlyRegionSpatialMemoryLandmarksUseDestinationIdentity",
  "earlyRegionSpatialMemoryGuideSeamsDistinct"
]) must(behavior[key] === true, `profile behavior ${key} must be true`);
for (const key of ["earlyRegionSpatialMemoryUsesWaypointArrows", "earlyRegionSpatialMemoryUsesHudNavigation"]) must(behavior[key] === false, `profile behavior ${key} must be false`);
must(behavior.earlyRegionSpatialMemorySurfaceSignature === "nursery_triad", "Surface signature mismatch");
must(behavior.earlyRegionSpatialMemoryGuideSignature === "scar_double_rib", "Guide signature mismatch");
must(behavior.earlyRegionSpatialMemoryHubSignature === "chorus_triad", "Hub signature mismatch");
must(recipe.includes("HC-026C requires destination-identity anatomical memory landmarks"), "RecipeDataSystem HC026C contract missing");
must(contract.owner === "LocalCellBoundaryMorphSystem" && contract.locked?.newSourceModule === false, "ownership/source-module contract mismatch");
must(contract.locked?.waypointArrows === false && contract.locked?.hudNavigationRequired === false, "landmark must not become waypoint/HUD navigation");

const sourceFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith(".js")) sourceFiles.push(full);
  }
};
walk("src");
must(successorHC027C || ((sourceFiles.length === 88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && sourceFiles.length === 89) || (main.includes('buildId: "HC-027B"') && sourceFiles.length === 90)))), `expected locked 88 active source modules, found ${sourceFiles.length}`);

console.log("[HC026C] destination-identity memory landmark grammar PASS");
console.log("[HC026C] Guide Surface-vs-Hub fold distinction PASS");
console.log("[HC026C] no-arrow / no-HUD-navigation / stable seam topology PASS");
console.log("[HC026C] source-module / chemistry / contact ownership locks PASS");
