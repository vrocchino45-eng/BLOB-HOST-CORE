import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const layerPath = join(root, "public/data/planning/blueprintTranslationLayer_HC003F.json");
const manifestPath = join(root, "public/data/build/buildManifest.json");
const layer = JSON.parse(readFileSync(layerPath, "utf8"));
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

function fail(message) {
  console.error(`[BlueprintTranslationValidation] ${message}`);
  process.exitCode = 1;
}

if (layer.id !== "HC003F_BLUEPRINT_TRANSLATION_LAYER") {
  fail("Missing HC003F_BLUEPRINT_TRANSLATION_LAYER id.");
}

if (layer.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
  fail("Primary reference must remain HOST_CORE_Blueprint_v1_reference_docs.zip.");
}

const warning = layer.noLegacyRuntimeWarning ?? {};
const searchable = [
  layer.translationRule,
  layer.debugReadout?.warning,
  warning.strictMarker,
  warning.plainLanguage,
  warning.permissionWarning,
  warning.allowedTranslation,
  ...(warning.forbiddenRuntimeArchitecture ?? []),
  manifest.translationPrinciple
].filter(Boolean).join(" ").toLowerCase();

for (const marker of ["permission to revive old gates", "legacy runtime architecture does not"]) {
  if (!searchable.includes(marker)) {
    fail(`Missing no-legacy warning marker: ${marker}`);
  }
}

for (const term of ["gate", "door", "teleport", "old chamber"]) {
  if (!(warning.forbiddenRuntimeArchitecture ?? []).some((entry) => String(entry).toLowerCase().includes(term))) {
    fail(`Missing forbidden runtime term: ${term}`);
  }
}

const requiredCells = [
  "CELL_MEMBRANE_NURSERY_001",
  "CELL_SCAR_FLOW_FOLD_001",
  "CELL_SIGNAL_CHORUS_NERVE_001",
  "CELL_BLOOM_RESIDUE_FORK_001"
];
for (const cellId of requiredCells) {
  if (!(layer.localCellToBlueprintRole ?? []).some((entry) => entry.cellId === cellId)) {
    fail(`Missing local-cell mapping: ${cellId}`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Blueprint translation validation passed.");
