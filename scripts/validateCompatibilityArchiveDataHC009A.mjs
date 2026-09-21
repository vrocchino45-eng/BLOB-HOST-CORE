import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";

const root = new URL("../", import.meta.url).pathname;
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateCompatibilityArchiveDataHC009A] ${message}`);
};

const recipeData = new RecipeDataSystem({
  validationProfile: "legacy_archive"
});
recipeData.loadJson = async function loadLocalJson(path) {
  const relative = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", relative), "utf8"));
};

await recipeData.loadAll();

const profile = recipeData.data.firstSliceRuntimeProfile;
assert(["HC-009A", "HC-009B", "HC-009C", "HC-009D", "HC-009E", "HC-009F", "HC-009G", "HC-010A", "HC-010B", "HC-010C", "HC-010D", "HC-010E", "HC-010F", "HC-010G", "HC-011A", "HC-011A1", "HC-011B", "HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014I"].includes(recipeData.data.buildManifest.id), "archive validation ran against wrong build");
assert(profile.archivePolicy.sourceAndAuthoredDataRetained, "compatibility source/data retention policy changed");
assert(profile.archivePolicy.registeredDuringFirstSliceBoot === false, "archive policy registered dormant systems");
assert(recipeData.data.bloomResidueInteractionRecipes.size > 0, "Bloom compatibility recipes were deleted");
assert(recipeData.data.graveRouteMorphPlans.size > 0, "Grave compatibility morph data was deleted");
assert(recipeData.data.graveReturnContinuityRecipes.size > 0, "Grave return compatibility data was deleted");
assert(recipeData.data.schemaValidationReport.validationProfile === "legacy_archive", "legacy validation profile was not reported");

console.log("HC-009A compatibility archive data lineage validation passed.");
