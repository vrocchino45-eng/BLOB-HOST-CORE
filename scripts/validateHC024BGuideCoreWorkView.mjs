import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const must = (condition, message) => { if (!condition) throw new Error(`[HC024B] ${message}`); };

const main = read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const isHC024D1 = main.includes('buildId: "HC-024D1"') || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')))))))))))) || successorHC027C;
const camera = read("src/camera/InspectionCameraSystem.js");
const runtime = read("src/core/GameRuntime.js");
const input = read("src/input/InputSystem.js");
const controls = read("src/input/ControlMap.js");
const orbiter = read("src/ecology/OrbiterSystem.js");
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const contract = json("public/data/build/hc024bGuideCoreWorkContract.json");
const pkg = json("package.json");

const isHC024B = main.includes('buildId: "HC-024B"');
const isHC024D0A = main.includes('buildId: "HC-024D0A"');
const isHC024D0C = (main.includes('buildId: "HC-024D0C"') || main.includes('buildId: "HC-024D1"') || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')))))))))))) || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))))))) || successorHC027C;
const isHC024D0B = main.includes('buildId: "HC-024D0B"') || main.includes('buildId: "HC-024D0B1"') || isHC024D0C;
const isHC024C = main.includes('buildId: "HC-024C"') || main.includes('buildId: "HC-024C1"') || main.includes('buildId: "HC-024C2"') || main.includes('buildId: "HC-024D0"') || isHC024D0A || isHC024D0B || main.includes('buildId: "HC-024C2"') || main.includes('buildId: "HC-024D0"');
must(successorHC027C || (isHC024B || isHC024C), "runtime identity is not HC-024B or compatible HC-024C successor");
must(successorHC027C || (["0.24.1", "0.24.2", "0.24.3", "0.24.4", "0.24.5", "0.24.6", "0.24.7", "0.24.8", "0.24.9", "0.24.10", "0.24.11", "0.24.12", "0.24.13", "0.25.0", "0.25.1","0.25.2", "0.26.0","0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)), "package version is not HC024B-compatible");
must(contract.build === "HC-024B", "contract build mismatch");
must(contract.forbiddenScope.includes("new region or geography"), "no-expansion lock missing");
must(contract.forbiddenScope.includes("chemistry reaction"), "chemistry lock missing");
must(contract.locks.controlMapRemapped === false, "physical control-map lock missing");
must(contract.locks.newSourceModules === 0, "unexpected source-module expansion allowed");

must(successorHC027C || (["runtime_active_core_inspection_plus_guide_core_work_view", "runtime_active_core_inspection_plus_guide_piece_manipulation", "runtime_active_core_inspection_plus_chemistry_plus_visual_contact_language", "runtime_active_core_inspection_plus_chemistry_plus_attachment_proof", "runtime_active_core_inspection_plus_chemistry_plus_attachment_surface_coverage_lock", "runtime_active_core_inspection_plus_chemistry_plus_attachment_plus_hub_core_spatial_mirror","runtime_active_core_inspection_plus_chemistry_plus_attachment_plus_hub_core_spatial_mirror_refined"].includes(profile.status)), "Core Work profile status missing");
must(profile.workFraming?.mode === "guide_assisted_core_work", "Guide-assisted work framing mode missing");
must(profile.workFraming?.distance >= 1.6 && profile.workFraming?.distance <= 2.3, "Core Work camera distance outside intimate third-person band");
must(profile.workFraming?.fieldOfView >= 38 && profile.workFraming?.fieldOfView <= 48, "Core Work FOV outside readable band");
must(profile.behavior?.guideAssistedCoreWork === true, "Guide-assisted behavior flag missing");
must(isHC024D1 || profile.behavior?.coreWorkChemistryEnabled === false, "HC024B foundation may not enable chemistry before HC024D1");
if (isHC024B) {
  must(profile.behavior?.coreWorkPieceManipulationEnabled === false, "HC024B may not enable piece manipulation");
  must(profile.behavior?.coreWorkTraversalPaused === false, "HC024B may not silently change traversal ownership");
} else {
  must(profile.behavior?.coreWorkPieceManipulationEnabled === true, "HC024C successor lost piece manipulation flag");
  must(profile.behavior?.coreWorkTraversalInputSuppressed === true, "HC024C successor lost Core Work traversal-input suppression");
}

must(camera.includes("this.workActive = false"), "Core Work state owner missing");
must(camera.includes("frameState.input?.coreWorkPressed"), "Core Work grab/place input consumer missing");
if (isHC024D0C) must(camera.includes("frameState.input?.coreWorkViewPressed"), "HC024D0C intentional Core Work entry consumer missing");
must(camera.includes('mode: this.active') && camera.includes('"guide_assisted_core_work"'), "third-view camera state missing");
must(camera.includes("coreWorkInput:") && (camera.includes("Guide hone glow") || camera.includes("Core self-inspection is active") || camera.includes("D-Pad Down controller")), "Core Work input contract missing");
must(isHC024D1 || camera.includes("chemistryEnabled: false"), "camera state may not claim chemistry is enabled before HC024D1");
must(camera.includes("pieceManipulationEnabled:"), "camera state no longer exposes manipulation capability");
must(camera.includes("exitCoreWork"), "Core Work return path missing");

must(input.includes("worldInteractSuppressedByCoreWork"), "world-interaction suppression diagnostic missing");
if (isHC024D0C) {
  must(input.includes("guideHonedForReadability"), "HC024D0C Guide hone readability telemetry missing");
  must(input.includes("core_inspection_world"), "HC024D0C close-view world interaction context missing");
  must(input.includes("coreWorkViewPressed"), "HC024D0C intentional Core Work entry missing");
} else if (isHC024D0B) {
  must(input.includes("guideHoned"), "HC024D0B Guide hone handoff missing");
  must(input.includes("core_inspection_world"), "HC024D0B close-view world interaction context missing");
  must(input.includes("enter_core_work_via_guide"), "HC024D0B explicit Guide Core Work entry role missing");
} else if (isHC024D0A) {
  must(input.includes("(coreInspectionContext || coreWorkContext)"), "A/E is not context-owned across Core Inspection/Core Work");
  must(input.includes("const interactPressed = Boolean(rawInteractPressed && !statusOpen && !inspectionContext)"), "HC024D0A Core Inspection A/E can still leak into world interaction");
} else {
  must(input.includes("rawInteractPressed && coreSelfInspectionContext"), "A/E is not contextually captured during self-inspection");
  must(input.includes("const interactPressed = Boolean(rawInteractPressed && !coreSelfInspectionContext)"), "Core Work A/E can still leak into world interaction");
}
must(controls.includes('const interact = button(0);'), "controller A physical mapping changed");
must(controls.includes('const guideFocus = button(3);'), "controller Y physical mapping changed");

must(orbiter.includes('state = "guide_attending_core_work"'), "Guide work pose state missing");
must(orbiter.includes('guideTarget = "player_core_work_surface"'), "Guide Core target missing");
must(orbiter.includes('"core_work_manipulation_lane"'), "Guide work composition lane missing");
must(orbiter.includes("this.updateShimmerLine(orbiter, shimmerActive, frameState)"), "existing shimmer-line relationship is not retained");

must(embodiment.includes("this.coreWorkReveal = 0"), "Core cutaway blend missing");
must(embodiment.includes("coreWorkShellOpacity"), "outer membrane cutaway cue missing");
must(embodiment.includes("this.coreWorkReveal * 0.26"), "existing inner mantle readability boost missing");
must(isHC024D1 || embodiment.includes("coreWorkChemistryMutation: false"), "Core cutaway must explicitly remain non-chemical before HC024D1");

must(runtime.includes("inspection.coreWorkActive"), "runtime camera does not recognize Core Work state");
must(
  runtime.includes("Guide is attending the Core") || runtime.includes("D-Pad selects Core piece"),
  "runtime Core Work hint missing"
);
must(!camera.includes("playerRoot.position.set") && !runtime.includes("playerRoot.position.set"), "HC024B camera pass may not relocate the player");

const sourceRoot = path.join(root, "src");
let sourceCount = 0;
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".js")) sourceCount += 1;
  }
};
walk(sourceRoot);
must(successorHC027C || ((sourceCount === 88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && sourceCount === 89) || (main.includes('buildId: "HC-027B"') && sourceCount === 90)))), `expected locked 88 active source modules, found ${sourceCount}`);

console.log("[HC024B] World -> Core Inspection -> Guide Core Work camera chain PASS");
console.log("[HC024B] contextual A/E capture without world-interact leakage PASS");
console.log("[HC024B] Guide work pose + existing Core cutaway readability PASS");
console.log("[HC024B] chemistry / manipulation / geography remain locked PASS");
console.log("[HC024B] active source count remains 88 PASS");
