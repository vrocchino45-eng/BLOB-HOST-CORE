import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const polishPath = join(root, "public/data/visual/firstMinuteVisualReadabilityPolish_HC003M.json");
const visualRecipesPath = join(root, "public/data/visual/visualCompositionRecipes.json");

const polish = JSON.parse(readFileSync(polishPath, "utf8"));
const visualRecipes = JSON.parse(readFileSync(visualRecipesPath, "utf8"));
const visualIds = new Set(visualRecipes.map((recipe) => recipe.id));

function fail(message) {
  console.error(`[FirstMinuteVisualReadabilityPolishValidation] ${message}`);
  process.exitCode = 1;
}

if (polish.id !== "HC003M_FIRST_MINUTE_VISUAL_READABILITY_POLISH") fail("Missing HC003M polish id.");
if (polish.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") fail("Primary reference must remain the Host Core Rebuild blueprint.");

for (const cellId of ["CELL_MEMBRANE_NURSERY_001", "CELL_SCAR_FLOW_FOLD_001", "CELL_SIGNAL_CHORUS_NERVE_001"]) {
  if (!(polish.requiredChain ?? []).includes(cellId)) fail(`Required first-minute chain missing ${cellId}.`);
}

for (const target of [
  "player_seed_core_stage_01",
  "dormant_seed_nutrient_v01",
  "scar_contamination_plate_v01",
  "seed_signal_bridge_v01",
  "guide_orbiter_folded_lantern_v01"
]) {
  if (!(polish.visualTargets ?? []).some((entry) => entry.id === target)) fail(`Visual polish target missing ${target}.`);
  if (!visualIds.has(target)) fail(`Visual recipe missing ${target}.`);
}

const text = JSON.stringify(polish).toLowerCase();
for (const marker of ["safe seed", "scar", "bridge", "guide", "new cells", "new morphs", "old gates", "old chamber loading"]) {
  if (!text.includes(marker)) fail(`Missing marker: ${marker}`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log("First-minute visual readability polish validation passed.");
