import { readFileSync } from "node:fs";
import { join } from "node:path";
import { InputSystem } from "../src/input/InputSystem.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateGraveContextButtonTransferHandoffHC004QJ] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const mainSource = readText("src/main.js");
const inputSource = readText("src/input/InputSystem.js");

assert(["HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id), `manifest must identify HC-004QJ or HC-004R, got ${manifest.id}.`);
assert(["0.0.73", "0.0.74", "0.0.75", "0.0.76", "0.0.77", "0.0.78"].includes(manifest.version), `manifest version must be 0.0.73 or 0.0.74, got ${manifest.version}.`);
assert(["0.0.73", "0.0.74", "0.0.75", "0.0.76", "0.0.77", "0.0.78"].includes(pkg.version), `package version must be 0.0.73 or 0.0.74, got ${pkg.version}.`);
assert(mainSource.includes('buildId: "HC-004QJ"') || mainSource.includes('buildId: "HC-004R"') || mainSource.includes('buildId: "HC-005A"') || mainSource.includes('buildId: "HC-005B"') || mainSource.includes('buildId: "HC-005C"') || mainSource.includes('buildId: "HC-005D"'), "runtime identity must report HC-004QJ.");
assert(
  manifest.runtimeActivated?.graveContextButtonTransferHandoffFix === "HC004QJ_GRAVE_CONTEXT_BUTTON_TRANSFER_HANDOFF_FIX",
  "manifest must identify the focused controller handoff repair."
);
assert(!inputSource.includes("safeMemoryTransferReady"), "undefined safeMemoryTransferReady key must be removed.");
assert(inputSource.includes('return readLoop.safeAbsorbReady ? "absorb" : "pulse_listen";'), "Grave A-button context must hand off on safeAbsorbReady.");

const input = new InputSystem();
const graveCell = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";

const reading = {
  activeCellId: graveCell,
  graveReadBeforeAbsorb: {
    active: true,
    safeAbsorbReady: false,
    safeMemoryTransferComplete: false
  },
  graveBedPostSeamResponse: { active: false }
};
assert(input.getPulseContext(reading) === "pulse_listen", "A must pulse/listen while the Grave read sequence is incomplete.");

const ready = {
  activeCellId: graveCell,
  graveReadBeforeAbsorb: {
    active: true,
    safeAbsorbReady: true,
    safeMemoryTransferComplete: false
  },
  graveBedPostSeamResponse: { active: false }
};
assert(input.getPulseContext(ready) === "absorb", "A must become absorb when safeAbsorbReady is true.");

const transferred = {
  activeCellId: graveCell,
  graveReadBeforeAbsorb: {
    active: true,
    safeAbsorbReady: true,
    safeMemoryTransferComplete: true
  },
  graveBedPostSeamResponse: { active: false }
};
assert(input.getPulseContext(transferred) === "absorb", "A must not revert to contextual pulse after the transfer completes.");

const postSeam = {
  activeCellId: graveCell,
  graveReadBeforeAbsorb: {
    active: false,
    safeAbsorbReady: false,
    safeMemoryTransferComplete: true
  },
  graveBedPostSeamResponse: { active: true }
};
assert(input.getPulseContext(postSeam) === "pulse_listen", "post-seam Grave response must preserve pulse/listen context.");

assert(input.getPulseContext({ activeCellId: "CELL_SIGNAL_CHORUS_NERVE_001" }) === "pulse_listen", "existing pulse/listen cells must remain unchanged.");
assert(input.getPulseContext({ activeCellId: "CELL_MEMBRANE_NURSERY_001" }) === "absorb", "default A context must remain absorb.");

console.log("validateGraveContextButtonTransferHandoffHC004QJ validation passed.");
