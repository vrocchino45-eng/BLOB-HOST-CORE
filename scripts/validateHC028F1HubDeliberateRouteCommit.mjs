import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028F1.json");
const contract = json("public/data/build/hc028f1HubDeliberateRouteCommitContract.json");
const locks = json("public/data/build/hc028f1LockedOwnerHashes.json");
const recipes = read("src/morph/LocalCellBoundaryRecipeRegistry.js");
const morph = read("src/morph/LocalCellBoundaryMorphSystem.js");
const hub = read("src/hub/HubInvestigationGameplaySystem.js");
const foundation = read("src/hub/HubChamberFoundationSystem.js");
const movement = read("src/player/PlayerMovementController.js");
const objective = read("src/systems/ObjectiveSystem.js");
const commit = read("src/input/DeliberateCommitmentSystem.js");

assert.match(main, /buildId:\s*"HC-028F1"/);
assert.match(main, /Hub Deliberate Route Commit/);
assert.equal(pkg.version, "0.28.11");
assert.equal(identity.parent, "HC-028F");
assert.equal(contract.rule, "hub_is_orientation_and_deliberate_destination_choice_not_a_hidden_activation_puzzle");
assert.equal(contract.hubEntryTrigger, "commit");
assert.equal(contract.guidedApproach, true);
assert.equal(contract.oldMandatoryHubInvestigationForGraveEntry, false);
assert.equal(contract.oldMandatoryThreeRouteSpiralForComb, false);
assert.equal(contract.returnRoutesRemainProximityResolved, true);
assert.equal(contract.hubEntriesRepeatableAfterReturn, true);

// All four Hub outbound boundaries now use deliberate commit, never Pulse.
for (const id of contract.hubEntryRecipeIds) {
  const start = recipes.indexOf(`id: "${id}"`);
  assert.ok(start >= 0, `missing recipe ${id}`);
  const end = recipes.indexOf("}),", start);
  const block = recipes.slice(start, end);
  assert.match(block, /trigger:\s*"commit"/, `${id} must use commit`);
  assert.match(block, /guidedApproach:\s*true/, `${id} must use guided approach`);
  assert.doesNotMatch(block, /trigger:\s*"pulse"/, `${id} restored Pulse gate`);
}

// A/E remains the same reserved commitment grammar owner from D2.
assert.match(commit, /role:\s*"deliberate_commitment_not_generic_interact"/);
assert.match(hub, /kind:\s*"hub_route_destination"/);
assert.match(hub, /sourceId:\s*"hub_chamber"/);
assert.match(hub, /hubRouteCommitRequest/);
assert.match(hub, /control:\s*"A \/ E"/);
assert.match(hub, /genericInteract:\s*false/);

// Initial Grave departure no longer depends on the old Hub investigation objective.
assert.match(morph, /const prerequisites = requireGraveReturn\s*\? graveReturned && graveObjectiveComplete\s*:\s*true;/s);
assert.match(morph, /trigger === "commit"/);
assert.match(morph, /request\.routeId === recipe\?\.routeId/);
assert.match(morph, /updateGuidedHubCommitFlight/);
assert.match(morph, /teleport:\s*false/);
assert.match(morph, /deliberate:\s*true/);
assert.match(morph, /samePlayerPositionRetained:\s*!recipe\.guidedApproach/);
assert.match(morph, /repeatableHubCommitEntry/);

// Guided Hub travel temporarily yields manual movement, then region gameplay resumes.
assert.match(movement, /hubGuidedFlightActive/);
assert.match(movement, /hub_guided_commit/);
assert.match(movement, /hub_deliberate_guided_route_commit/);

// Three genuine route returns wake Comb without the old circle-center-Pulse puzzle.
assert.match(hub, /three_returned_routes_resolved_into_comb_selector/);
assert.doesNotMatch(hub, /continuous_spiral_weave/);
assert.doesNotMatch(hub, /spiral_weave_coherent/);
assert.match(foundation, /Press A to enter/);
assert.match(foundation, /deliberateGuidedRouteCommit:\s*true/);
assert.match(objective, /hub_route_selection_readable/);

// Returns stay spatial/proximity resolved.
for (const id of ["grave_to_hub", "vascular_to_hub", "silt_to_hub", "comb_to_hub"]) {
  const start = recipes.indexOf(`id: "${id}"`);
  assert.ok(start >= 0, `missing return recipe ${id}`);
  const end = recipes.indexOf("}),", start);
  const block = recipes.slice(start, end);
  assert.match(block, /trigger:\s*"proximity"/, `${id} return must stay proximity-resolved`);
}

// Region/gameplay/composition owners outside the Hub traversal simplification are byte locked.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC028F owner drifted: ${rel}`);
}

console.log("HC028F1 Hub Deliberate Route Commit: PASS");
console.log(JSON.stringify({
  build: identity.id,
  trigger: contract.hubEntryTrigger,
  hubEntries: contract.hubEntryRecipeIds,
  lockedOwners: Object.keys(locks.files).length
}, null, 2));
