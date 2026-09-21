import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeDebugOverlay } from "../src/debug/RecipeDebugOverlay.js";
import { ChemistryDebugPanel } from "../src/debug/ChemistryDebugPanel.js";
import { buildRuntimeDiagnosticSummary } from "../src/debug/RuntimeDiagnosticSummary.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateFullDebugScreenshotDiagnostics] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const mainSource = readText("src/main.js");
const recipeOverlaySource = readText("src/debug/RecipeDebugOverlay.js");
const chemistryPanelSource = readText("src/debug/ChemistryDebugPanel.js");
const morphReadabilitySource = readText("src/morph/MorphReadabilitySystem.js");

assert(["HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id), "manifest must identify HC-004QE or HC-004QF successor.");
assert(["0.0.68", "0.0.69", "0.0.70", "0.0.71", "0.0.72", "0.0.73", "0.0.74", "0.0.75", "0.0.76", "0.0.77", "0.0.78"].includes(pkg.version), "package must identify 0.0.68 or 0.0.69 successor.");
assert(mainSource.includes('buildId: "HC-004QE"') || mainSource.includes('buildId: "HC-004QF"') || mainSource.includes('buildId: "HC-004QG"') || mainSource.includes('buildId: "HC-004QH"') || mainSource.includes('buildId: "HC-004QI"') || mainSource.includes('buildId: "HC-004QJ"') || mainSource.includes('buildId: "HC-004R"') || mainSource.includes('buildId: "HC-005A"') || mainSource.includes('buildId: "HC-005B"') || mainSource.includes('buildId: "HC-005C"') || mainSource.includes('buildId: "HC-005D"') || mainSource.includes('buildId: "HC-004QF"') || mainSource.includes('buildId: "HC-004QG"') || mainSource.includes('buildId: "HC-004QH"') || mainSource.includes('buildId: "HC-004QI"') || mainSource.includes('buildId: "HC-004QJ"') || mainSource.includes('buildId: "HC-004R"') || mainSource.includes('buildId: "HC-005A"') || mainSource.includes('buildId: "HC-005B"') || mainSource.includes('buildId: "HC-005C"') || mainSource.includes('buildId: "HC-005D"'), "runtime build ID must identify HC-004QE or HC-004QF successor.");
assert(mainSource.includes('buildLabel: "Full Debug Screenshot Diagnostics Pass"') || mainSource.includes('buildLabel: "Bloom-to-Grave Composition Handoff Fix"') || mainSource.includes('buildLabel: "Grave Post-Seam Runtime Ownership Handoff Fix"') || mainSource.includes('buildLabel: "Grave Route Phase Ownership Repair"') || mainSource.includes('buildLabel: "Grave Initial Loop Ownership and Instruction Handoff Fix"') || mainSource.includes('buildLabel: "Bloom-to-Grave Composition Handoff Fix"') || mainSource.includes('buildLabel: "Grave Post-Seam Runtime Ownership Handoff Fix"') || mainSource.includes('buildLabel: "Grave Route Phase Ownership Repair"') || mainSource.includes('buildLabel: "Grave Initial Loop Ownership and Instruction Handoff Fix"') || mainSource.includes('buildLabel: "Grave Context Button Transfer Handoff Fix"') || mainSource.includes('buildLabel: "Grave Route Lock and Completion Handoff"') || mainSource.includes('buildLabel: "First Route Return Continuity Prototype"') || mainSource.includes('buildLabel: "Signal Chorus Return-State Convergence"') || mainSource.includes('buildLabel: "Signal Chorus Return Readability + Camera-Relative Movement Lock"') || mainSource.includes('buildLabel: "Signal Chorus Combward Pressure Seed"'), "runtime label must preserve HC-004QE diagnostics or HC-004QF successor.");
assert(recipeOverlaySource.includes('maxHeight: "calc(100dvh - 20px)"'), "left full-debug panel must use dynamic viewport height.");
assert(chemistryPanelSource.includes('maxHeight: "calc(100dvh - 20px)"'), "right full-debug panel must use dynamic viewport height.");
assert(recipeOverlaySource.includes('whiteSpace: "pre"'), "left full-debug panel must keep deterministic line count.");
assert(chemistryPanelSource.includes('whiteSpace: "pre"'), "right full-debug panel must keep deterministic line count.");
assert(morphReadabilitySource.includes("frameState.morphReadabilityDebug"), "visible tissue status must be published for screenshot diagnosis.");

const frameState = {
  buildId: "HC-004QE",
  buildLabel: "Full Debug Screenshot Diagnostics Pass",
  buildManifest: { id: "HC-004QE", version: "0.0.68" },
  frame: 4763,
  runtimeSeconds: 148.69,
  activeHostId: "HOST_ALPHA_MOUNDED_NURSERY",
  activeCellId: "CELL_BLOOM_RESIDUE_FORK_001",
  selectedObject: { objectId: "seed_choice_braid_001" },
  input: { pulsePressed: false, pulseEventId: 51, pulseSource: "gamepad_x_button_2", absorbHeld: false },
  inputSource: {
    activeDevice: "gamepad+keyboard",
    gamepadActive: true,
    gamepadMapping: "standard",
    pulseButtonValue: 0,
    pulseButtonDown: false,
    contextButtonValue: 0,
    contextButtonDown: false,
    contextButtonActsAsPulse: true,
    pulseSequence: 51
  },
  inputActionAudit: {
    eventId: 51,
    source: "gamepad_x_button_2",
    producedAtFrame: 4700,
    activeCellId: "CELL_BLOOM_RESIDUE_FORK_001",
    targetIdAtProduction: "seed_choice_braid_001",
    consumedBy: "BloomResidueInteractionSystem",
    consumedAtFrame: 4700,
    consumedTargetId: "seed_choice_braid_001",
    result: "seed_choice_braid_warmed_handoff_ready"
  },
  controllerOnboarding: { actions: { pulseAge: 57.5 } },
  targeting: { targetId: "seed_choice_braid_001", targetKind: "chem_object", distance: 1.2, lockStrength: 0.9 },
  targetFocus: { provider: "BloomResidueInteractionSystem", ruleId: "TARGET_FOCUS_BLOOM_RESIDUE_001", preferredTargetId: "seed_choice_braid_001" },
  guidePrompt: { guideLine: "This is past the first lesson. The tissue can fork.", objectiveLine: "Residue and seed settling." },
  playtestHud: { objective: "Optional fork: stay with memory, bloom, braid, and warning.", actionHint: "Release pulse, then pulse the stable residue once more." },
  morphReadabilityDebug: { status: "Bloom Residue Fork: stable — deeper tissue can answer.", step: "Release pulse, then pulse the stable residue once more." },
  cameraControl: { yaw: 0, pitch: 0.34, distance: 9.98, occlusionIntensity: 0, occludedObjectId: "none", playPocketWindow: "active" },
  playerKinematics: { position: { x: 0, y: 0, z: 0 }, speed: 0, movementFeel: "soft" },
  bloomResidueInteraction: {
    active: true,
    stage: "fork_stable",
    stageIndex: 4,
    progress: 1,
    residueMemory: 0.8,
    bloomCare: 0.7,
    braidWarmth: 0.9,
    warningRespect: 0.8,
    overgrowthRisk: 0.1,
    forkStability: 1,
    currentFocus: "seed_choice_braid_001",
    lastInteraction: "seed_choice_braid_warmed_handoff_ready",
    nextAction: "Release pulse, then pulse stable residue once more.",
    preparedForNextBranch: true
  },
  thirdLocalCellMorph: { completed: true, phase: "completed_in_bloom_residue_fork", progress: 1 },
  graveRouteMorph: {
    planId: "MORPH_BLOOM_RESIDUE_TO_GRAVE_MEMORY_001",
    phase: "waiting_for_bloom_residue_stability",
    progress: 0,
    triggerReady: false,
    triggerReason: "fresh_pulse_required",
    destinationCell: "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
    nextAction: "Release pulse then pulse again"
  },
  chemistry: { form: 0.34, flux: 0.36, scar: 0.30, seed: 0.52, signal: 0.44 },
  playerComposition: { form: 0.35, flux: 0.31, scar: 0.11, seed: 0.41, signal: 0.20 },
  physicalFeel: { viscosity: 0.52, pressure: 0.46 },
  bondState: { strength: 0, absorbProgress: 0, compatibility: "none", blockReason: "none" },
  currentBond: "none",
  schemaValidationReport: { status: "ok", warnings: [] },
  placeholderStatus: { active: 35, expired: 23 },
  lockState: { status: "opening_slice_gold_candidate_pending_user_playtest" },
  nonFatalSystemErrors: []
};

const summary = buildRuntimeDiagnosticSummary(frameState);
const leftText = new RecipeDebugOverlay({ frameState }).fullText();
const rightText = new ChemistryDebugPanel({ frameState }).fullText();
const leftLines = leftText.split("\n");
const rightLines = rightText.split("\n");

assert(summary.owner === "BloomResidueInteractionSystem", "diagnostic owner must identify the active runtime system.");
assert(summary.targetAligned === true, "diagnostic summary must compare expected and actual target.");
assert(summary.blocker === "morph:fresh_pulse_required", "diagnostic blocker must expose the existing Grave handoff requirement.");
assert(leftLines.length <= 50, `left screenshot panel exceeds 50-line budget (${leftLines.length}).`);
assert(rightLines.length <= 50, `right screenshot panel exceeds 50-line budget (${rightLines.length}).`);
assert(Math.max(...leftLines.map((line) => line.length)) <= 68, "left screenshot panel contains an overlong line.");
assert(Math.max(...rightLines.map((line) => line.length)) <= 58, "right screenshot panel contains an overlong line.");

for (const required of [
  "FLOW / OWNERSHIP",
  "BLOCKER:",
  "INPUT / LAST PULSE",
  "Produced #51",
  "Consumed: BloomResidueInteractionSystem",
  "VISIBLE INSTRUCTION STATE",
  "Tissue:",
  "Nonfatal errors:",
  "SNAPSHOT"
]) {
  assert(leftText.includes(required), `left full-debug screenshot must include ${required}`);
}

for (const required of [
  "SCREENSHOT DIAGNOSIS",
  "Alignment: OK",
  "LAST INPUT DELIVERY",
  "ACTIVE FLOW METRICS",
  "MORPH / HANDOFF",
  "CHEMISTRY / BOND",
  "RUNTIME HEALTH",
  "SNAPSHOT"
]) {
  assert(rightText.includes(required), `right full-debug screenshot must include ${required}`);
}

console.log(`[validateFullDebugScreenshotDiagnostics] left=${leftLines.length} lines right=${rightLines.length} lines; screenshot diagnostics fit budget.`);
