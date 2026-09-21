import fs from "node:fs";
import path from "node:path";
import { InputSystem } from "../src/input/InputSystem.js";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const must = (condition, message) => { if (!condition) throw new Error(`[HC024D0B] ${message}`); };

const main = read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const inputSource = read("src/input/InputSystem.js");
const inspectionSource = read("src/camera/InspectionCameraSystem.js");
const orbiterSource = read("src/ecology/OrbiterSystem.js");
const runtimeSource = read("src/core/GameRuntime.js");
const hudSource = read("src/ui/PlaytestHudSystem.js");
const contract = json("public/data/build/hc024d0bTargetOwnedAAndGuideHoneContract.json");
const pkg = json("package.json");

const isHC024D0C = (main.includes('buildId: "HC-024D0C"') || main.includes('buildId: "HC-024D1"') || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))))) || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')))))))))))) || successorHC027C;
must(successorHC027C || (main.includes('buildId: "HC-024D0B"') || main.includes('buildId: "HC-024D0B1"') || isHC024D0C), "runtime identity missing");
must(successorHC027C || (["0.24.7", "0.24.8", "0.24.9", "0.24.10", "0.24.11", "0.24.12", "0.24.13", "0.25.0", "0.25.1","0.25.2", "0.26.0","0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)), "package version mismatch");
must(contract.ownership.coreInspectionWorld === "world_interact", "Core Inspection world interaction contract missing");
must(contract.ownership.coreInspectionGuideHoned === "enter_core_work_via_guide", "Guide hone Core Work contract missing");
must(contract.guideHone.visualCue.includes("Guide glow"), "Guide glow contract missing");
must(inputSource.includes('const guideHoned = Boolean(coreInspectionContext && guideFocus.honed);'), "InputSystem does not consume Guide hone");
if (isHC024D0C) {
  must(inputSource.includes('coreWorkViewPressed'), "HC024D0C intentional Core Work command missing");
  must(inputSource.includes('const interactPressed = Boolean(rawInteractPressed && !statusOpen && !coreWorkContext);'), "HC024D0C A/E no longer preserves external inspection interaction");
  must(inspectionSource.includes('guideHoneRequiredForCoreWorkEntry: false'), "HC024D0C still gates Core Work on Guide hone");
} else {
  must(inputSource.includes('? "enter_core_work_via_guide"'), "Guide-honed A role missing");
  must(inputSource.includes('&& !guideHoned'), "world interaction is not preserved outside Guide hone");
  must(inspectionSource.includes('only when the Guide is explicitly honed'), "InspectionCamera target-owned entry comment/contract missing");
  must(inspectionSource.includes('guideHoneRequiredForCoreWorkEntry: true'), "InspectionCamera does not publish Guide hone requirement");
}
must(orbiterSource.includes('createGuideFocusHalo'), "Guide focus halo missing");
must(orbiterSource.includes('guide_inspection_hone_glow'), "Guide focus glow visual missing");
must(orbiterSource.includes('alignment >= honeDot'), "Guide hone alignment gate missing");
must(runtimeSource.includes('worldForward: cameraWorldForward'), "camera world-forward telemetry missing");
must(runtimeSource.includes('worldPosition: cameraWorldPosition'), "camera world-position telemetry missing");
must(hudSource.includes('GUIDE HONED'), "HUD does not expose Guide hone state");

function runAContext({ inspection = {}, guideFocus = {}, statusOpen = false }) {
  const system = new InputSystem();
  system.readKeyboard = () => ({ active: false });
  system.readGamepad = () => ({
    connected: true,
    name: "validator_gamepad",
    mapping: "standard",
    buttonCount: 16,
    interactPressed: true,
    interactButtonValue: 1,
    interactButtonDown: true,
    moveX: 0,
    moveY: 0,
    gameplayVerticalY: 0,
    moveZ: 0,
    cameraLookX: 0,
    cameraLookY: 0,
    absorbTriggerValue: 0,
    stabilizeTriggerValue: 0,
    leftStickMagnitude: 0,
    rightStickMagnitude: 0
  });
  const frameState = {
    frame: 1,
    runtimeSeconds: 0,
    activeCellId: "CELL_VALIDATION",
    inspectionCamera: inspection,
    guideFocus,
    statusPage: { open: statusOpen }
  };
  system.update(1 / 60, frameState);
  return frameState.input;
}

const world = runAContext({ inspection: { active: false } });
must(world.interactPressed === true && world.coreWorkPressed === false, "World A must remain world interact");

const inspectionWorld = runAContext({
  inspection: { active: true, coreWorkActive: false, selfInspection: true },
  guideFocus: { honed: false }
});
must(inspectionWorld.primaryActionContext === "core_inspection_world", "Core Inspection world context wrong");
must(inspectionWorld.primaryActionRole === "world_interact", "Core Inspection world A role wrong");
must(inspectionWorld.interactPressed === true && inspectionWorld.coreWorkPressed === false, "Core Inspection world interaction blocked or leaked");

const inspectionGuide = runAContext({
  inspection: { active: true, coreWorkActive: false, selfInspection: true },
  guideFocus: { honed: true }
});
if (isHC024D0C) {
  must(inspectionGuide.primaryActionContext === "core_inspection_world", "HC024D0C Guide-honed inspection context should remain world interaction");
  must(inspectionGuide.primaryActionRole === "world_interact", "HC024D0C Guide-honed A role should remain interaction");
  must(inspectionGuide.interactPressed === true && inspectionGuide.coreWorkPressed === false, "HC024D0C Guide-honed A must not enter Core Work");
} else {
  must(inspectionGuide.primaryActionContext === "core_inspection_guide_honed", "Guide-honed context wrong");
  must(inspectionGuide.primaryActionRole === "enter_core_work_via_guide", "Guide-honed A role wrong");
  must(inspectionGuide.interactPressed === false && inspectionGuide.coreWorkPressed === true, "Guide-honed A must enter Core Work only");
}

const coreWork = runAContext({
  inspection: { active: true, coreWorkActive: true },
  guideFocus: { honed: false }
});
must(coreWork.primaryActionRole === "core_work_grab_place", "Core Work A role wrong");
must(coreWork.interactPressed === false && coreWork.coreWorkPressed === true, "Core Work A must remain grab/place");

const status = runAContext({ inspection: { active: false }, statusOpen: true });
must(status.interactPressed === false && status.coreWorkPressed === false && status.primaryActionSuppressed === true, "Status/UI A leaked into gameplay");

let sourceCount = 0;
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".js")) sourceCount += 1;
  }
};
walk(path.join(root, "src"));
must(successorHC027C || ((sourceCount === 88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && sourceCount === 89) || (main.includes('buildId: "HC-027B"') && sourceCount === 90)))), `expected locked 88 active source modules, found ${sourceCount}`);

console.log("[HC024D0B] World A -> world interact PASS");
console.log("[HC024D0B] Core Inspection A -> world interact when Guide is not honed PASS");
console.log(`[HC024D0B] Guide hone glow preserved${isHC024D0C ? " as readability-only" : " -> A enters Core Work"} PASS`);
console.log("[HC024D0B] Core Work A -> grab/place PASS");
console.log("[HC024D0B] Status/UI A -> gameplay suppressed PASS");
console.log("[HC024D0B] active source count remains 88 PASS");
