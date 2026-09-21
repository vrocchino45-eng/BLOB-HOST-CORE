import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const json = (path) => JSON.parse(read(path));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const recipes = json("public/data/opening/surfaceWakeGameplayRecipes.json");
const cells = json("public/data/world/localCellRecipes.json");
const chem = json("public/data/chemistry/chemObjectRecipes.json");
const gameplaySource = read("src/opening/SurfaceWakeGameplaySystem.js");
const surfaceSource = read("src/opening/SurfaceWakeLayeredInteractionSystem.js");
const bondSource = read("src/chemistry/BondSystem.js");
const focusSource = read("src/targeting/TargetFocusRegistry.js");
const targetingSource = read("src/targeting/TargetingSystem.js");
const runtimeSource = read("src/core/GameRuntime.js");

const recipe = recipes.find((item) => item.id === "SURFACE_WAKE_GAMEPLAY_FILL_HC007A");
assert(recipe, "HC-007A gameplay recipe missing");
assert(recipe.triggerPolicy?.preserveExistingCompletionTrigger === true, "existing Surface Wake completion trigger must remain preserved");
assert(recipe.triggerPolicy?.safeSeedRemainsLockedUntilListeningFoldComplete === true, "protected safe seed must remain owned by existing trigger");
assert(recipe.nutrientMotes?.length === 3, "expected three systemic Surface Wake nutrient motes");

const nursery = cells.find((item) => item.id === "CELL_MEMBRANE_NURSERY_001");
assert(nursery, "nursery cell missing");
for (const id of recipe.nutrientMotes) {
  assert(nursery.contents?.chemObjects?.includes(id), `nursery missing gameplay mote ${id}`);
  const mote = chem.find((item) => item.id === id);
  assert(mote, `chemistry recipe missing gameplay mote ${id}`);
  assert(mote.chemistry?.bondTypes?.includes("soft_bond"), `${id} must use systemic soft-bond absorption`);
  assert(Boolean(mote.behavior?.onAbsorb), `${id} must be absorbable`);
}

assert(gameplaySource.includes("surfaceWakeGameplay"), "gameplay state must publish to frameState");
assert(gameplaySource.includes("stabilizeHeld"), "LT stabilize must affect pressure gameplay");
assert(gameplaySource.includes("pulseEventId"), "pulse must produce systemic world reads");
assert(gameplaySource.includes("playerComposition.scar"), "scar-edge pressure must carry a small systemic risk");
assert(runtimeSource.includes("surfaceWakeGameplaySystem"), "gameplay system must be registered in runtime");
assert(focusSource.includes("HC007A_SURFACE_WAKE_SYSTEMIC_PLAY"), "target focus must enable systemic nursery play");
assert(targetingSource.includes("excludedObjectIds"), "targeting must support excluding the protected safe seed");
assert(bondSource.includes("safeSeedLocked"), "BondSystem must lock only the protected seed rather than all nursery absorption");
assert(surfaceSource.includes("pulse_read_world_not_listening_fold_yet"), "existing fold pulse must require local range instead of firing anywhere in the nursery");

console.log("HC-007A Surface Wake gameplay fill validation passed.");
