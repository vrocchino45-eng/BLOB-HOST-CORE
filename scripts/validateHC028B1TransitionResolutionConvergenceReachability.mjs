import fs from "node:fs";
import assert from "node:assert/strict";

const read = (rel) => fs.readFileSync(rel, "utf8");
const main = read("src/main.js");
const recipes = read("src/morph/LocalCellBoundaryRecipeRegistry.js");
const morph = read("src/morph/LocalCellBoundaryMorphSystem.js");
const vascular = read("src/routes/VascularRhythmRouteSystem.js");
const silt = read("src/routes/SiltPressureRouteSystem.js");
const movement = read("src/player/PlayerMovementController.js");
const hub = read("src/hub/HubInvestigationGameplaySystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const identity = JSON.parse(read("public/data/build/currentBuildIdentity_HC028B1.json"));
const contract = JSON.parse(read("public/data/build/hc028b1TransitionResolutionConvergenceContract.json"));
const packageJson = JSON.parse(read("package.json"));

assert.match(main, /buildId:\s*"HC-028B1"/);
assert.match(main, /Transition Resolution \+ Convergence Reachability/);
assert.equal(packageJson.version, "0.28.2");
assert.equal(identity.parent, "HC-028A1");
assert.equal(identity.sourceJsCount, 93);
assert.equal(contract.returnActivation.vascular, "proximity_after_route_resolved");
assert.equal(contract.returnActivation.silt, "proximity_after_route_resolved");
assert.equal(contract.returnActivation.grave, "unchanged_interact_locked");
assert.equal(contract.reachability.forcedRelocation, false);
assert.equal(contract.reachability.stabilizeRequired, false);

const recipeBlock = (id) => {
  const start = recipes.indexOf(`id: "${id}"`);
  const end = recipes.indexOf("}),", start);
  assert.ok(start >= 0 && end > start, `recipe block missing: ${id}`);
  return recipes.slice(start, end + 3);
};
assert.match(recipeBlock("vascular_to_hub"), /trigger: "proximity"/);
assert.match(recipeBlock("silt_to_hub"), /trigger: "proximity"/);
assert.match(recipeBlock("grave_to_hub"), /trigger: "interact"/);
assert.match(morph, /trigger === "proximity"/);
assert.match(morph, /completed Vascular\/Silt return folds own their transition/);
assert.match(vascular, /Follow the gold return current into the open entry fold/);
assert.match(silt, /Follow the amber silt breath into the open entry fold/);

assert.match(hub, /centerPosition:/);
assert.match(hub, /entryRadius:/);
assert.match(hub, /finalPulseRadius:/);
assert.match(movement, /resolveConvergenceReachability/);
assert.match(movement, /!convergenceReachability\.active/);
assert.match(movement, /environmentScale = 1 - envelope01 \* 0\.82/);
assert.match(movement, /flowCouplingMultiplier \* convergenceReachability\.environmentScale/);
assert.match(movement, /this\.pressure \* 1\.28\) \* convergenceReachability\.environmentScale/);
assert.doesNotMatch(movement, /playerRoot\.position\.(?:set|copy).*convergence/);

assert.match(telemetry, /blob\.session\.telemetry\.v1\.2/);
for (const event of ["route.resolved", "route.release.started", "transition.available", "transition.entered", "movement.progress_blocked"]) {
  assert.ok(telemetry.includes(event), `missing telemetry event ${event}`);
}
for (const field of ["desiredMoveVector", "environmentalForceVector", "convergenceEnvelope01", "distanceToRequiredTransition"]) {
  assert.ok(telemetry.includes(field), `missing movement diagnostic ${field}`);
}
assert.match(telemetry, /pass: "HC-028B1"/);

const jsFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith(".js")) jsFiles.push(full);
  }
};
walk("src");
assert.equal(jsFiles.length, 93, "HC028B1 must not widen runtime source ownership");

console.log("HC028B1 Transition Resolution + Convergence Reachability: PASS");
console.log(JSON.stringify({
  build: identity.id,
  runtimeSourceCount: jsFiles.length,
  vascularReturn: contract.returnActivation.vascular,
  siltReturn: contract.returnActivation.silt,
  graveReturn: contract.returnActivation.grave,
  forcedRelocation: contract.reachability.forcedRelocation,
  stabilizeRequired: contract.reachability.stabilizeRequired,
  telemetrySchema: contract.telemetrySchema
}, null, 2));
