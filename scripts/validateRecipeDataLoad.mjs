import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDataSystem } from "../src/data/RecipeDataSystem.js";

const root = new URL("../", import.meta.url).pathname;
const recipeData = new RecipeDataSystem();

recipeData.loadJson = async function loadLocalJson(path) {
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return JSON.parse(readFileSync(join(root, "public", rel), "utf8"));
};

await recipeData.loadAll();
console.log(`RecipeDataSystem loadAll validation passed. Build: ${recipeData.data.buildManifest.id}`);
