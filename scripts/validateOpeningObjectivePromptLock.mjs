import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const lockPath = join(root, "public/data/ui/openingObjectivePromptLock_HC003K.json");
const guidePath = join(root, "public/data/guide/guidePromptRecipes.json");
const lock = JSON.parse(readFileSync(lockPath, "utf8"));
const prompts = JSON.parse(readFileSync(guidePath, "utf8"));

function fail(message) {
  console.error(`[OpeningObjectivePromptLockValidation] ${message}`);
  process.exitCode = 1;
}

if (lock.id !== "HC003K_OPENING_OBJECTIVE_PROMPT_LOCK") fail("Missing HC003K_OPENING_OBJECTIVE_PROMPT_LOCK id.");
if (lock.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") fail("Primary reference must remain Host Core Rebuild blueprint.");
if (lock.playerFacingLayer?.primary !== "GuidePromptSystem") fail("GuidePromptSystem must remain primary.");
if (lock.playerFacingLayer?.secondary !== "MorphReadabilitySystem") fail("MorphReadabilitySystem must remain secondary.");

const byId = new Map(prompts.map((prompt) => [prompt.id, prompt]));
for (const promptId of lock.requiredGuidePrompts ?? []) {
  const prompt = byId.get(promptId);
  if (!prompt) fail(`Missing required guide prompt ${promptId}.`);
  if (prompt && (!prompt.guideLine || !prompt.objectiveLine)) fail(`Prompt ${promptId} needs guideLine and objectiveLine.`);
}

const forbiddenText = JSON.stringify(lock).toLowerCase();
for (const marker of ["dialogue tree", "quest log", "new cells", "new morphs", "gates", "old chamber runtime"]) {
  if (!forbiddenText.includes(marker)) fail(`Missing forbidden marker: ${marker}`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Opening objective prompt lock validation passed.");
