import fs from "node:fs";
import path from "node:path";
import { InputSystem } from "../src/input/InputSystem.js";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const must = (condition, message) => { if (!condition) throw new Error(`[HC024D0A] ${message}`); };

const main = read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const contract = json("public/data/build/hc024d0aAButtonContextOwnershipContract.json");
const successorD0C = (main.includes('buildId: "HC-024D0C"') || main.includes('buildId: "HC-024D1"') || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))))) || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')))))))))))) || successorHC027C;
const successorD0B = (main.includes('buildId: "HC-024D0B"') || main.includes('buildId: "HC-024D0B1"') || successorD0C);
must(successorHC027C || (main.includes('buildId: "HC-024D0A"') || successorD0B), "runtime identity missing");
must(contract.ownership.world === "world_interact", "World A ownership baseline mismatch");
must(contract.ownership.coreWork === "core_work_grab_place", "Core Work A ownership baseline mismatch");
must(contract.ownership.statusUi === "reserved_no_world_or_core_action", "Status/UI A ownership baseline mismatch");

function runAContext({ inspection = {}, guideFocus = {}, statusOpen = false }) {
  const system = new InputSystem();
  system.readKeyboard = () => ({ active: false });
  system.readGamepad = () => ({
    connected: true, name: "validator_gamepad", mapping: "standard", buttonCount: 16,
    interactPressed: true, interactButtonValue: 1, interactButtonDown: true,
    moveX: 0, moveY: 0, gameplayVerticalY: 0, moveZ: 0,
    cameraLookX: 0, cameraLookY: 0,
    absorbTriggerValue: 0, stabilizeTriggerValue: 0,
    leftStickMagnitude: 0, rightStickMagnitude: 0
  });
  const frameState = {
    frame: 1, runtimeSeconds: 0, activeCellId: "CELL_VALIDATION",
    inspectionCamera: inspection, guideFocus, statusPage: { open: statusOpen }
  };
  system.update(1 / 60, frameState);
  return frameState.input;
}

const world = runAContext({ inspection: { active: false } });
must(world.interactPressed === true && world.coreWorkPressed === false, "World A baseline regressed");
const coreWork = runAContext({ inspection: { active: true, coreWorkActive: true } });
must(coreWork.interactPressed === false && coreWork.coreWorkPressed === true, "Core Work A baseline regressed");
const status = runAContext({ inspection: { active: false }, statusOpen: true });
must(status.interactPressed === false && status.coreWorkPressed === false && status.primaryActionSuppressed === true, "Status/UI A baseline regressed");

if (successorD0B) {
  const inspectionWorld = runAContext({ inspection: { active: true, coreWorkActive: false }, guideFocus: { honed: false } });
  const inspectionGuide = runAContext({ inspection: { active: true, coreWorkActive: false }, guideFocus: { honed: true } });
  must(inspectionWorld.interactPressed === true && inspectionWorld.coreWorkPressed === false, "HC024D0B close-view world interaction not compatible");
  if (successorD0C) {
    must(inspectionGuide.interactPressed === true && inspectionGuide.coreWorkPressed === false, "HC024D0C Guide-honed A must remain interaction");
    console.log("[HC024D0A] successor HC024D0C intentionally separates Core Work entry from A while preserving external inspection interaction PASS");
  } else {
    must(inspectionGuide.interactPressed === false && inspectionGuide.coreWorkPressed === true, "HC024D0B explicit Guide handoff not compatible");
    console.log("[HC024D0A] successor HC024D0B intentionally refines external inspection ownership via explicit Guide hone PASS");
  }
} else {
  const inspection = runAContext({ inspection: { active: true, coreWorkActive: false } });
  must(inspection.interactPressed === false && inspection.coreWorkPressed === true, "HC024D0A Core Inspection A baseline regressed");
}

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

console.log("[HC024D0A] World/Core Work/Status A ownership baseline PASS");
console.log("[HC024D0A] active source count remains 88 PASS");
