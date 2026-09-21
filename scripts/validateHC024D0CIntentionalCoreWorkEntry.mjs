import fs from "node:fs";
import path from "node:path";
import { InputSystem } from "../src/input/InputSystem.js";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const must = (condition, message) => { if (!condition) throw new Error(`[HC024D0C] ${message}`); };

const main = read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const inputSource = read("src/input/InputSystem.js");
const controlSource = read("src/input/ControlMap.js");
const inspectionSource = read("src/camera/InspectionCameraSystem.js");
const orbiterSource = read("src/ecology/OrbiterSystem.js");
const hudSource = read("src/ui/PlaytestHudSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const contract = json("public/data/build/hc024d0cIntentionalCoreWorkEntryContract.json");
const pkg = json("package.json");

must(successorHC027C || (main.includes('buildId: "HC-024D0C"') || main.includes('buildId: "HC-024D1"') || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))))))), "runtime identity missing");
must(successorHC027C || (["0.24.9", "0.24.10", "0.24.11", "0.24.12", "0.24.13", "0.25.0", "0.25.1","0.25.2", "0.26.0","0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)), "package version mismatch");
must(contract.coreWorkEntry.controllerButtonIndex === 13, "D-Pad Down button contract mismatch");
must(profile.behavior.coreWorkUsesIntentionalDpadDownEntry === true, "intentional D-Pad entry profile flag missing");
must(profile.behavior.coreWorkUsesExistingInteractButtonContextually === false, "A/E must not remain the Core Work entry action");
must(controlSource.includes('coreWorkView: "D-Pad Down while in Core Inspection"'), "ControlMap D-Pad Down entry missing");
must(inputSource.includes('gamepad.coreWorkViewPressed || keyboard.coreWorkViewPressed'), "InputSystem intentional work command missing");
must(inputSource.includes('const coreWorkPressed = Boolean(rawInteractPressed && !statusOpen && coreWorkContext);'), "A/E grab-place ownership not isolated to active Core Work");
must(inspectionSource.includes('frameState.input?.coreWorkViewPressed'), "InspectionCamera does not consume intentional work command");
must(inspectionSource.includes('guideHoneRequiredForCoreWorkEntry: false'), "Guide hone is still incorrectly gating work entry");
must(orbiterSource.includes('const beginGlowDot = 0.955') && orbiterSource.includes('behindCoreBy <= 0.12'), "precise Guide hone regression");
must(hudSource.includes('A interact · ↓ Core Work'), "controller HUD intentional entry copy missing");

function run({ inspection, a = false, down = false, statusOpen = false }) {
  const system = new InputSystem();
  system.readKeyboard = () => ({
    active: false, moveX: 0, moveY: 0, moveZ: 0, cameraLookX: 0, cameraLookY: 0,
    pulsePressed: false, pulseSource: "none", absorbHeld: false, stabilizeHeld: false,
    interactPressed: false, coreWorkViewPressed: false, guideFocusPressed: false,
    recenterCameraPressed: false, cancelPressed: false, statusPageTogglePressed: false,
    statusPageSource: "none", statusTabPrevPressed: false, statusTabNextPressed: false,
    menuUpPressed: false, menuDownPressed: false, menuLeftPressed: false, menuRightPressed: false,
    boostHeld: false
  });
  system.readGamepad = () => ({
    connected: true, name: "validator", mapping: "standard", buttonCount: 16,
    moveX: 0, moveY: down ? -1 : 0, gameplayVerticalY: 0, moveZ: 0,
    cameraLookX: 0, cameraLookY: 0, boostHeld: false,
    pulsePressed: false, pulseSource: "none", absorbHeld: false, stabilizeHeld: false,
    interactPressed: a, coreWorkViewPressed: down, guideFocusPressed: false,
    recenterCameraPressed: false, cancelPressed: false, statusPageTogglePressed: false,
    statusPageSource: "none", statusTabPrevPressed: false, statusTabNextPressed: false,
    menuUpPressed: false, menuDownPressed: down, menuLeftPressed: false, menuRightPressed: false,
    absorbTriggerValue: 0, stabilizeTriggerValue: 0, interactButtonValue: a ? 1 : 0,
    interactButtonDown: a, pulseButtonValue: 0, pulseButtonDown: false,
    guideFocusButtonValue: 0, guideFocusButtonDown: false, leftStickMagnitude: 0, rightStickMagnitude: 0
  });
  const frameState = { frame: 1, runtimeSeconds: 0, activeCellId: "CELL_VALIDATION", inspectionCamera: inspection, guideFocus: { honed: true }, statusPage: { open: statusOpen } };
  system.update(1/60, frameState);
  return frameState.input;
}

const worldA = run({ inspection: { active: false }, a: true });
must(worldA.interactPressed && !worldA.coreWorkPressed && !worldA.coreWorkViewPressed, "World A must remain interaction only");
const inspectA = run({ inspection: { active: true, coreWorkActive: false, selfInspection: true }, a: true });
must(inspectA.interactPressed && !inspectA.coreWorkPressed && !inspectA.coreWorkViewPressed, "Inspection A must remain interaction even when Guide is honed");
const inspectDown = run({ inspection: { active: true, coreWorkActive: false, selfInspection: true }, down: true });
must(inspectDown.coreWorkViewPressed && !inspectDown.interactPressed && inspectDown.moveY === 0, "D-Pad Down must enter Core Work intentionally without one-frame descent");
const workA = run({ inspection: { active: true, coreWorkActive: true }, a: true });
must(workA.coreWorkPressed && !workA.interactPressed, "Core Work A must remain grab/place");
const statusDown = run({ inspection: { active: true, coreWorkActive: false }, down: true, statusOpen: true });
must(!statusDown.coreWorkViewPressed, "Status UI must suppress Core Work entry");

let sourceCount = 0;
const walk = (dir) => { for (const e of fs.readdirSync(dir,{withFileTypes:true})) { const f=path.join(dir,e.name); if(e.isDirectory()) walk(f); else if(e.name.endsWith('.js')) sourceCount++; } };
walk(path.join(root,'src'));
must(successorHC027C || (sourceCount === 88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && sourceCount === 89) || (main.includes('buildId: "HC-027B"') && sourceCount === 90))), `expected predecessor source lock or HC027C successor, found ${sourceCount}`);

console.log("[HC024D0C] A remains world interaction in external inspection PASS");
console.log("[HC024D0C] D-Pad Down intentional Core Work entry PASS");
console.log("[HC024D0C] entry-frame D-Pad vertical motion suppressed PASS");
console.log("[HC024D0C] Core Work A grab/place PASS");
console.log("[HC024D0C] precise Guide hone retained as readability-only PASS");
console.log("[HC024D0C] predecessor source-count lock / HC027C successor compatibility PASS");
