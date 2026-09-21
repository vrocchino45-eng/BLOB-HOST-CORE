import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const modePath = join(root, "public/data/ui/debugHiddenPlaytestMode_HC003L.json");
const mode = JSON.parse(readFileSync(modePath, "utf8"));

function fail(message) {
  console.error(`[DebugHiddenPlaytestModeValidation] ${message}`);
  process.exitCode = 1;
}

if (mode.id !== "HC003L_DEBUG_HIDDEN_PLAYTEST_MODE") fail("Missing HC003L_DEBUG_HIDDEN_PLAYTEST_MODE id.");
if (mode.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") fail("Primary reference must remain Host Core Rebuild blueprint.");
if (mode.defaultDebugMode !== "hidden") fail("Default debug mode must be hidden for HC-003L.");
if (mode.visibleWhenDebugHidden?.primary !== "GuidePromptSystem") fail("GuidePromptSystem must remain the primary debug-hidden instruction layer.");
if (mode.visibleWhenDebugHidden?.secondary !== "PlaytestHudSystem") fail("PlaytestHudSystem must remain the secondary debug-hidden HUD layer.");

for (const cellId of ["CELL_MEMBRANE_NURSERY_001", "CELL_SCAR_FLOW_FOLD_001", "CELL_SIGNAL_CHORUS_NERVE_001"]) {
  if (!(mode.firstPlayableMinuteRequiredChain ?? []).includes(cellId)) fail(`Required first-minute chain missing ${cellId}.`);
}

const text = JSON.stringify(mode).toLowerCase();
for (const marker of ["debug", "absorb", "pulse", "new cells", "new morphs", "gates", "old chamber runtime"]) {
  if (!text.includes(marker)) fail(`Missing marker: ${marker}`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Debug-hidden playtest mode validation passed.");
