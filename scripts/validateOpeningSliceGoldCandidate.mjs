import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));

const manifest = readJson("public/data/build/buildManifest.json");
const lockState = readJson("public/data/lock/hc003FirstPlayableMinuteLockState.json");
const gold = readJson("public/data/lock/hc003OpeningSliceGoldCandidate.json");
const promptLock = readJson("public/data/ui/openingObjectivePromptLock_HC003K.json");
const playtestHud = readJson("public/data/ui/debugHiddenPlaytestMode_HC003L.json");
const visualPolish = readJson("public/data/visual/firstMinuteVisualReadabilityPolish_HC003M.json");
const blueprintTranslation = readJson("public/data/planning/blueprintTranslationLayer_HC003F.json");

const requiredChain = [
  "CELL_MEMBRANE_NURSERY_001",
  "CELL_SCAR_FLOW_FOLD_001",
  "CELL_SIGNAL_CHORUS_NERVE_001"
];

function assert(condition, message) {
  if (!condition) throw new Error(`[validateOpeningSliceGoldCandidate] ${message}`);
}

function sameChain(value, label) {
  assert(Array.isArray(value), `${label} must be an array.`);
  assert(value.length === requiredChain.length, `${label} must contain the required opening chain.`);
  for (const id of requiredChain) assert(value.includes(id), `${label} missing ${id}.`);
}

assert(["HC-003N", "HC-004A", "HC-004B", "HC-004C", "HC-004D", "HC-004E", "HC-004F", "HC-004G", "HC-004H", "HC-004H", "HC-004H", "HC-004H", "HC-004H", "HC-004H", "HC-004H", "HC-004I", "HC-004J", "HC-004K", "HC-004L", "HC-004M", "HC-004N", "HC-004O", "HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D", "HC-006A", "HC-006B", "HC-006C", "HC-006D", "HC-006E", "HC-006EA", "HC-006EB", "HC-006F", "HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G"] .includes(manifest.id), "build manifest must be HC-003N or a later data/planning/visual-support/runtime-morph/readability/read-loop build preserving the gold candidate.");
assert(manifest.primaryBuildReference === "HOST_CORE_Blueprint_v1_reference_docs.zip", "manifest must use Host Core Rebuild blueprint.");
sameChain(manifest.firstPlayableMinuteRequiredChain, "manifest.firstPlayableMinuteRequiredChain");
assert(manifest.beyondMinuteOptionalFork === "CELL_BLOOM_RESIDUE_FORK_001", "manifest optional fork must remain Bloom Residue.");

assert(lockState.id === "HC003N_OPENING_SLICE_GOLD_CANDIDATE", "lock state must be HC003N gold candidate.");
assert(lockState.status.includes("gold_candidate"), "lock state must identify gold candidate status.");
sameChain(lockState.requiredOpeningChain, "lockState.requiredOpeningChain");
assert(lockState.beyondMinuteOptionalFork === "CELL_BLOOM_RESIDUE_FORK_001", "lockState optional fork must remain Bloom Residue.");

assert(gold.id === "HC003N_OPENING_SLICE_GOLD_PACKAGE", "gold package data missing or wrong id.");
sameChain(gold.requiredChain, "gold.requiredChain");
assert(gold.optionalExtension === "CELL_BLOOM_RESIDUE_FORK_001", "gold optional extension must remain Bloom Residue.");

sameChain(promptLock.firstPlayableMinuteRequiredChain, "promptLock.firstPlayableMinuteRequiredChain");
sameChain(playtestHud.firstPlayableMinuteRequiredChain, "playtestHud.firstPlayableMinuteRequiredChain");
sameChain(visualPolish.requiredChain, "visualPolish.requiredChain");

assert(playtestHud.defaultDebugMode === "hidden", "debug hidden playtest mode must default to hidden.");
assert(promptLock.playerFacingLayer?.primary === "GuidePromptSystem", "Guide prompt must remain primary.");
assert(blueprintTranslation.noLegacyRuntimeWarning?.strictMarker === "authored gates valid; arbitrary transitions forbidden", "blueprint translation must preserve the true-source transition authority marker.");
assert(blueprintTranslation.translationRule?.includes("Authored GateSystem thresholds are valid"), "blueprint translation must explicitly preserve authored GateSystem ownership.");

const combinedForbidden = JSON.stringify({ manifest, lockState, gold, blueprintTranslation }).toLowerCase();
for (const marker of ["arbitrary doors", "teleports", "branch menu", "renderer-owned", "legacy stage"]) {
  assert(combinedForbidden.includes(marker), `gold package must explicitly forbid ${marker}.`);
}

console.log("Opening slice gold-candidate validation passed.");
