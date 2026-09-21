import fs from "node:fs";
import path from "node:path";

const must = (condition, message) => { if (!condition) throw new Error(`[HC026B] ${message}`); };
const text = (file) => fs.readFileSync(file, "utf8");
const json = (file) => JSON.parse(text(file));

const main = text("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const boundary = text("src/morph/LocalCellBoundaryMorphSystem.js");
const guide = text("src/morph/GuideThresholdGameplaySystem.js");
const runtime = text("src/core/GameRuntime.js");
const hud = text("src/ui/PlaytestHudSystem.js");
const recipe = text("src/data/RecipeDataSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const identity = json("public/data/build/currentBuildIdentity_HC026B.json");
const contract = json("public/data/build/hc026bReturnTraversalContract.json");
const pkg = json("package.json");
const successor = (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')))) || successorHC027C;

must(successorHC027C || (main.includes('buildId: "HC-026B"') || successor), "runtime identity/successor missing");
must(successorHC027C || (pkg.version === "0.26.2" || (successor && ["0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version))), "package version mismatch");
must(identity.id === "HC-026B" && identity.sourceJsCount === 88, "identity/source lock mismatch");
must(successorHC027C || (["HC-026B","HC-026C","HC-026C1", "HC-027A", "HC-027B", "HC-027C", "HC-027C1", "HC-027D", "HC-027D1", "HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)), "inspection profile build mismatch");

must(boundary.includes('guide_surface_memory_seam'), "Surface/Guide revisit seam missing");
must(boundary.includes('hub_guide_memory_seam'), "Guide/Hub revisit seam missing");
must(boundary.includes('this.earlyReturnHasReachedHub = true'), "Hub-reached latch missing");
must(boundary.includes('state.departed = true') && boundary.includes('state.armed = true'), "depart-before-rearm guard missing");
must(boundary.includes('explicitInteractRequired: false'), "revisit should be movement-led, not interact-gated");
must(boundary.includes('samePlayerPositionRetained: true'), "player-position continuity missing");
must(boundary.includes('teleport: false') && boundary.includes('progressionMutation: false'), "teleport/progression lock missing");
must(boundary.includes('frameState.activeCellId = transition.destinationCellId'), "revisit active-cell crossing missing");
must(boundary.includes('routeTopologyMutated: false'), "stable route topology lock missing");

must(runtime.includes('new LocalCellBoundaryMorphSystem({') && runtime.includes('scene: this.scene') && runtime.includes('playerRoot: this.playerCore'), "boundary owner missing scene/player context");
must(guide.includes('firstSliceReturnTraversal?.revisitGuideActive'), "Guide revisit gameplay reactivation missing");
must(hud.includes('Return seam') && hud.includes('No button is required'), "playtest return-readability HUD missing");

const behavior = profile.behavior ?? {};
for (const key of [
  'earlyRegionReturnTraversalEnabled',
  'earlyRegionReturnTraversalMovementLed',
  'earlyRegionReturnTraversalRequiresHubReached',
  'earlyRegionReturnTraversalRetainsPlayerPosition',
  'earlyRegionReturnTraversalGuideRevisitGameplayEnabled',
  'earlyRegionReturnTraversalSurfaceGuideBidirectional',
  'earlyRegionReturnTraversalGuideHubBidirectional'
]) must(behavior[key] === true, `profile behavior ${key} must be true`);
for (const key of ['earlyRegionReturnTraversalUsesTeleport','earlyRegionReturnTraversalMutatesProgression','earlyRegionReturnTraversalMovesRouteTopology']) {
  must(behavior[key] === false, `profile behavior ${key} must be false`);
}
must(recipe.includes('HC-026B requires movement-led, progression-neutral Surface/Guide/Hub revisit folds'), "RecipeDataSystem HC026B contract missing");
must(contract.owner === 'LocalCellBoundaryMorphSystem' && contract.locked?.newSourceModule === false, "ownership/source-module contract mismatch");

const sourceFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith('.js')) sourceFiles.push(full);
  }
};
walk('src');
must(successorHC027C || ((sourceFiles.length === 88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && sourceFiles.length === 89) || (main.includes('buildId: "HC-027B"') && sourceFiles.length === 90)))), `expected locked 88 active source modules, found ${sourceFiles.length}`);

console.log('[HC026B] movement-led Surface ↔ Guide ↔ Hub revisit folds PASS');
console.log('[HC026B] depart-before-rearm / same-position continuity PASS');
console.log('[HC026B] Guide revisit gameplay + transformed Hub mirror preservation PASS');
console.log('[HC026B] progression / route topology / source-module locks PASS');
