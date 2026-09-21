import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as THREE from "three";
import { GraveLoopStabilitySystem } from "../src/morph/GraveLoopStabilitySystem.js";
import { GraveReadBeforeAbsorbSystem } from "../src/morph/GraveReadBeforeAbsorbSystem.js";
import { GuidePromptSystem } from "../src/guide/GuidePromptSystem.js";
import { MorphReadabilitySystem } from "../src/morph/MorphReadabilitySystem.js";
import { buildRuntimeDiagnosticSummary } from "../src/debug/RuntimeDiagnosticSummary.js";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateGraveInitialLoopOwnershipHC004QI] ${message}`);
};

const GRAVE = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const SILT = "residue_silt_cloud_001";
const LOOP_ID = "GRAVE_READ_BEFORE_ABSORB_LOOP_001";
const HOLD_ACTION = "Hold A/F near the settled silt trace. Do not consume the husk, scar, or seed.";

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const mainSource = readText("src/main.js");
const stabilitySource = readText("src/morph/GraveLoopStabilitySystem.js");
const guideSource = readText("src/guide/GuidePromptSystem.js");
const readabilitySource = readText("src/morph/MorphReadabilitySystem.js");
const readLoopSource = readText("src/morph/GraveReadBeforeAbsorbSystem.js");

assert(["HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D"].includes(manifest.id), `manifest must identify HC-004QI or HC-004QJ, got ${manifest.id}.`);
assert(["0.0.72", "0.0.73", "0.0.74", "0.0.75", "0.0.76", "0.0.77", "0.0.78"].includes(manifest.version), `manifest version must be 0.0.72 or 0.0.73, got ${manifest.version}.`);
assert(["0.0.72", "0.0.73", "0.0.74", "0.0.75", "0.0.76", "0.0.77", "0.0.78"].includes(pkg.version), `package version must be 0.0.72 or 0.0.73, got ${pkg.version}.`);
assert(mainSource.includes('buildId: "HC-004QI"') || mainSource.includes('buildId: "HC-004QJ"') || mainSource.includes('buildId: "HC-004R"') || mainSource.includes('buildId: "HC-005A"') || mainSource.includes('buildId: "HC-005B"') || mainSource.includes('buildId: "HC-005C"') || mainSource.includes('buildId: "HC-005D"'), "runtime identity must report HC-004QI.");
assert(
  manifest.runtimeActivated?.graveInitialLoopOwnershipFix === "HC004QI_GRAVE_INITIAL_LOOP_OWNERSHIP_AND_INSTRUCTION_HANDOFF_FIX",
  "manifest must identify the focused repair."
);
assert(
  stabilitySource.includes("readLoop.safeMemoryTransferComplete"),
  "stability ownership must require safeMemoryTransferComplete."
);
assert(
  guideSource.includes("if (graveLoop.active) return graveLoop.nextAction"),
  "Guide handoff must expose the active Grave read loop."
);
assert(
  readabilitySource.includes("graveLoop.nextAction ?? \"Read the remains before receiving the settled silt trace.\""),
  "lower tissue panel must use the live read-loop instruction before transfer."
);
assert(
  readLoopSource.includes('consumedBy: "GraveReadBeforeAbsorbSystem"'),
  "valid Grave pulses must publish their consumer."
);
assert(
  readLoopSource.includes('compatibility: "safe_grave_silt_transfer"'),
  "safe settled-silt focus must override the generic unsafe bond readout."
);

const protectedIds = [
  "old_core_husk_memory_001",
  "scar_lock_plate_001",
  "inheritance_seed_remnant_001"
];
const objects = protectedIds.map((id) => {
  const rootObject = new THREE.Group();
  rootObject.visible = true;
  rootObject.userData = { absorbed: false, recipeId: id, objectId: id };
  return { recipe: { id }, root: rootObject, cellId: GRAVE, absorbed: false };
});
const siltRoot = new THREE.Group();
siltRoot.visible = true;
siltRoot.userData = { absorbed: false, recipeId: SILT, objectId: SILT };
objects.push({ recipe: { id: SILT }, root: siltRoot, cellId: GRAVE, absorbed: false });

const plan = readJson("public/data/planning/graveLoopStabilityAndExitReadiness_HC004G.json");
const recipeDataSystem = {
  data: {
    graveLoopStabilityExitReadiness: plan,
    guidePromptRecipes: new Map()
  },
  get() {
    throw new Error("focused ownership validator does not require recipe lookup");
  }
};
const chemObjectSystem = {
  objects,
  markAbsorbed() {},
  setObjectOpacity(rootObject, opacity) {
    rootObject.userData.opacity = opacity;
  }
};
const scene = new THREE.Scene();
const playerRoot = new THREE.Group();

const baseFrameState = () => ({
  buildId: "HC-004QJ",
  frame: 4242,
  runtimeSeconds: 92,
  activeCellId: GRAVE,
  graveRouteMorph: {
    completed: true,
    phase: "completed_in_grave_memory_residue_bed",
    progress: 1,
    nextAction: "Read before you consume. Leave what is not ready."
  },
  graveArrivalReadability: { active: true, readConfidence: 0.9 },
  graveScarMemorySeamRuntimeArrival: { active: false, progress: 0, completed: false },
  graveSeamContinuityMicroExit: { active: false, completed: false, handoffComplete: false },
  graveBedPostSeamResponse: { active: false, completed: false },
  graveReadBeforeAbsorb: {
    pass: "HC-004F",
    active: true,
    loopId: LOOP_ID,
    stage: "safe_silt_transfer",
    stageIndex: 4,
    progress: 0.8,
    safeAbsorbReady: true,
    safeMemoryTransferComplete: false,
    preparedForNextPass: false,
    currentFocus: SILT,
    focusDistance: 1.2,
    lastInteraction: "settled_silt_trace_answered",
    nextAction: HOLD_ACTION
  },
  graveLoopStability: {
    pass: "HC-004G",
    active: false,
    status: "inactive_no_exit_activation",
    safeMemoryTransferComplete: false,
    nextAction: "complete Grave read-before-absorb first"
  },
  input: {
    pulsePressed: false,
    pulseEventId: 89,
    pulseSource: "gamepad_button_2",
    absorbHeld: false
  },
  inputSource: { lastPulseSource: "gamepad_button_2", pulseSequence: 89 },
  inputActionAudit: { eventId: 89, consumedBy: "none", consumedTargetId: "none", result: "none" },
  controllerOnboarding: { actions: { pulseAge: 0.1 } },
  targeting: { targetId: SILT },
  targetFocus: { preferredTargetId: SILT, provider: "TARGET_FOCUS_GRAVE_MEMORY_001", ruleId: "TARGET_FOCUS_GRAVE_MEMORY_001" },
  selectedObject: { recipeId: SILT },
  chemObjectState: { absorbedObjects: 0, pulseResponse: "none" },
  playerComposition: {},
  chemistry: {},
  bondState: { active: true, objectId: SILT, compatibility: "none", blockReason: "target_not_safe_to_absorb" },
  physicalFeel: {},
  promptStack: {},
  lockState: {},
  guidePrompt: { active: false },
  debugDisplay: { mode: "full" },
  nonFatalSystemErrors: []
});

// 1. The later stability layer must not own the frame before the safe transfer.
const preTransfer = baseFrameState();
const stability = new GraveLoopStabilitySystem({ recipeDataSystem, chemObjectSystem, frameState: preTransfer });
stability.init();
stability.update(1 / 60, preTransfer);
assert(preTransfer.graveLoopStability.active === false, "stability must remain inactive before safe transfer completion.");
assert(
  preTransfer.graveLoopStability.status === "inactive_no_exit_activation",
  `pre-transfer stability status must be inactive, got ${preTransfer.graveLoopStability.status}.`
);

const preSummary = buildRuntimeDiagnosticSummary(preTransfer);
assert(preSummary.owner === "GraveReadBeforeAbsorbSystem", `pre-transfer diagnostic owner must be read loop, got ${preSummary.owner}.`);
assert(preSummary.stage === "safe_silt_transfer", `pre-transfer stage must remain safe_silt_transfer, got ${preSummary.stage}.`);
assert(preSummary.ready === true, "safeAbsorbReady must publish READY FOR INPUT.");
assert(preSummary.expectedTarget === SILT && preSummary.actualTarget === SILT, "safe-silt target must remain aligned.");

// 2. Guide and lower tissue panel must show the same actionable instruction.
const guide = new GuidePromptSystem({ recipeDataSystem, frameState: preTransfer });
assert(guide.activeNextAction(preTransfer) === HOLD_ACTION, "Guide must tell the player to hold A/F before transfer.");

const readability = new MorphReadabilitySystem({ scene, playerRoot, frameState: preTransfer });
readability.panel = { style: {} };
readability.titleLine = { textContent: "", style: {} };
readability.progressBar = { style: {} };
readability.statusLine = { textContent: "", style: {} };
readability.stepLine = { textContent: "", style: {} };
readability.updatePanel(preTransfer.graveRouteMorph, preTransfer);
assert(readability.statusLine.textContent === "Grave bed: read before absorb.", `pre-transfer tissue status is wrong: ${readability.statusLine.textContent}`);
assert(readability.stepLine.textContent === HOLD_ACTION, `pre-transfer tissue action must match Guide, got ${readability.stepLine.textContent}.`);

// 3. The authored safe transfer must suppress the generic unsafe bond blocker before input begins.
const readLoop = new GraveReadBeforeAbsorbSystem({ recipeDataSystem, chemObjectSystem, playerRoot, scene, frameState: preTransfer });
readLoop.safeAbsorbReady = true;
readLoop.safeMemoryTransferComplete = false;
readLoop.currentFocus = SILT;
readLoop.safeAbsorbProgress = 0;
readLoop.applyFrameReadout(preTransfer);
assert(preTransfer.bondState.compatibility === "safe_grave_silt_transfer", `bond compatibility must report safe transfer, got ${preTransfer.bondState.compatibility}.`);
assert(preTransfer.bondState.blockReason === "none", `safe transfer must have no bond blocker, got ${preTransfer.bondState.blockReason}.`);
const safeSummary = buildRuntimeDiagnosticSummary(preTransfer);
assert(!safeSummary.blocker.includes("target_not_safe_to_absorb"), `generic unsafe blocker leaked into authored transfer: ${safeSummary.blocker}.`);

// 4. A valid Grave pulse must be attributed to the system and target that consumed it.
preTransfer.input.pulsePressed = true;
preTransfer.input.pulseEventId = 90;
readLoop.lastInteraction = "residue_silt_settled_by_pulse";
readLoop.markPulseConsumed(preTransfer, { recipe: { id: SILT } });
assert(preTransfer.inputActionAudit.eventId === 90, "pulse audit must keep the live event id.");
assert(preTransfer.inputActionAudit.consumedBy === "GraveReadBeforeAbsorbSystem", "pulse consumer must be GraveReadBeforeAbsorbSystem.");
assert(preTransfer.inputActionAudit.consumedTargetId === SILT, "pulse audit must name the settled-silt target.");
const pulseSummary = buildRuntimeDiagnosticSummary(preTransfer);
assert(pulseSummary.pulseConsumed === true, "full-debug summary must report the fresh Grave pulse as consumed.");
assert(pulseSummary.blocker !== "fresh_pulse_not_consumed", "fresh valid Grave pulse must not be reported unconsumed.");

// 5. Once transfer completes, stability may claim the settling phase and the panels must hand off with it.
const postTransfer = baseFrameState();
postTransfer.graveReadBeforeAbsorb.safeMemoryTransferComplete = true;
postTransfer.graveReadBeforeAbsorb.safeAbsorbReady = false;
postTransfer.graveReadBeforeAbsorb.preparedForNextPass = true;
postTransfer.graveReadBeforeAbsorb.stage = "memory_trace_received";
postTransfer.graveReadBeforeAbsorb.nextAction = "The silt trace entered. The husk, scar, and seed remain intact; stabilize before widening the route.";
const postStability = new GraveLoopStabilitySystem({ recipeDataSystem, chemObjectSystem, frameState: postTransfer });
postStability.init();
postStability.update(1 / 60, postTransfer);
assert(postTransfer.graveLoopStability.active === true, "stability must activate after safe transfer completion.");
assert(
  postTransfer.graveLoopStability.status === "stabilizing_after_safe_transfer_no_exit_activation",
  `post-transfer stability stage is wrong: ${postTransfer.graveLoopStability.status}.`
);
const postSummary = buildRuntimeDiagnosticSummary(postTransfer);
assert(postSummary.owner === "GraveLoopStabilitySystem", `post-transfer owner must be stability, got ${postSummary.owner}.`);

readability.updatePanel(postTransfer.graveRouteMorph, postTransfer);
assert(
  readability.statusLine.textContent === "Grave bed: settling after the safe memory transfer.",
  `post-transfer tissue status is wrong: ${readability.statusLine.textContent}`
);
assert(
  readability.stepLine.textContent.includes("Let the Grave settle"),
  `post-transfer tissue action must hand off to stability, got ${readability.stepLine.textContent}.`
);
assert(
  guide.activeNextAction(postTransfer).includes("Let the Grave settle"),
  "post-transfer Guide must hand off to the stability instruction."
);

console.log("validateGraveInitialLoopOwnershipHC004QI validation passed.");
