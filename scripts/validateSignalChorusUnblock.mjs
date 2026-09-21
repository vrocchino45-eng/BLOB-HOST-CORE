import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateSignalChorusUnblock] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const source = readText("src/morph/SignalChorusInteractionSystem.js");
const arrivalSource = readText("src/morph/SignalChorusArrivalSystem.js");
const thirdMorphSource = readText("src/morph/ThirdLocalCellMorphSystem.js");
const mainSource = readText("src/main.js");

assert(["HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id), "build manifest must identify HC-004QA or its HC-004QB successor.");
assert(["0.0.64", "0.0.65", "0.0.66", "0.0.67", "0.0.68", "0.0.69", "0.0.70", "0.0.71", "0.0.72", "0.0.73", "0.0.74", "0.0.75", "0.0.76", "0.0.77", "0.0.78"].includes(packageJson.version), "package version must preserve HC-004QA or HC-004QB lineage.");
assert(packageLock.packages?.[""]?.version === packageJson.version, "package-lock root version must match package version.");
assert(manifest.mode.includes("without_legacy_exit_architecture"), "manifest mode must preserve no-legacy exit architecture scope.");
assert(mainSource.includes(`buildId: "${manifest.id}"`), "runtime build identity must match manifest identity.");
assert(source.includes("arrival.active"), "interaction activation must use arrival.active instead of hidden arrival readiness metrics.");
assert(!source.includes("frameState.signalChorusArrival?.readyForSignalLoop"), "old hidden arrival gate must be removed.");
assert(source.includes('this.handoffPass = "HC-004QA"') || source.includes('this.handoffPass = "HC-004QC"'), "interaction handoff pass must preserve HC-004QA lineage or report HC-004QC input fix.");
assert(arrivalSource.includes("arrival_handed_to_signal_chorus_interaction"), "arrival must explicitly hand control to interaction.");
assert(arrivalSource.includes('focusOwner: this.interactionOwnsFocus ? "signal_chorus_interaction"'), "arrival state must identify the single focus owner.");
assert(thirdMorphSource.includes("this.readinessLatched"), "third morph must latch readiness.");
assert(thirdMorphSource.includes("freshPulseRequired"), "third morph must expose the fresh-pulse requirement.");

for (const marker of [
  "old gates",
  "doors",
  "teleports",
  "branch select menu",
  "old chamber runtime",
  "old exit registries",
  "stage-node loaders",
  "new morph destination",
  "new route branch",
  "combat",
  "dialogue tree",
  "quest log",
  "new entity spawns"
]) {
  assert(JSON.stringify(manifest).toLowerCase().includes(marker), `manifest forbidden scope must preserve ${marker}.`);
}

console.log("[validateSignalChorusUnblock] Signal Chorus ownership remains valid under the current successor build.");
