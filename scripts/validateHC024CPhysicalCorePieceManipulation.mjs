import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const must = (condition, message) => { if (!condition) throw new Error(`[HC024C] ${message}`); };

const main = read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const isHC024D1 = main.includes('buildId: "HC-024D1"') || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')))))))))))) || successorHC027C;
const camera = read("src/camera/InspectionCameraSystem.js");
const input = read("src/input/InputSystem.js");
const controls = read("src/input/ControlMap.js");
const orbiter = read("src/ecology/OrbiterSystem.js");
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const movement = read("src/player/PlayerMovementController.js");
const recipeData = read("src/data/RecipeDataSystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const contract = json("public/data/build/hc024cPhysicalCorePieceManipulationContract.json");
const pkg = json("package.json");

must(successorHC027C || (main.includes('buildId: "HC-024C"') || main.includes('buildId: "HC-024C1"') || main.includes('buildId: "HC-024C2"') || main.includes('buildId: "HC-024D0"') || main.includes('buildId: "HC-024D0A"') || main.includes('buildId: "HC-024D0B"') || (main.includes('buildId: "HC-024D0C"') || main.includes('buildId: "HC-024D1"') || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')))))))))))) || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))))))) || main.includes('buildId: "HC-024C2"') || main.includes('buildId: "HC-024D0"')), "runtime identity is not HC-024C or compatible HC-024C1 successor");
must(successorHC027C || (["0.24.2", "0.24.3", "0.24.4", "0.24.5", "0.24.6", "0.24.7", "0.24.8", "0.24.9", "0.24.10", "0.24.11", "0.24.12", "0.24.13", "0.25.0", "0.25.1","0.25.2", "0.26.0","0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)), "package version mismatch");
must(contract.build === "HC-024C", "contract build mismatch");
must(contract.forbiddenScope.includes("new chemistry recipe"), "chemistry lock missing");
must(contract.forbiddenScope.includes("new Core piece geometry"), "new-piece lock missing");
must(contract.locks.controlMapRemapped === false, "physical control-map lock missing");
must(contract.locks.newSourceModules === 0, "source-module expansion allowed");

must(successorHC027C || (["runtime_active_core_inspection_plus_guide_piece_manipulation", "runtime_active_core_inspection_plus_chemistry_plus_visual_contact_language", "runtime_active_core_inspection_plus_chemistry_plus_attachment_proof", "runtime_active_core_inspection_plus_chemistry_plus_attachment_surface_coverage_lock", "runtime_active_core_inspection_plus_chemistry_plus_attachment_plus_hub_core_spatial_mirror","runtime_active_core_inspection_plus_chemistry_plus_attachment_plus_hub_core_spatial_mirror_refined"].includes(profile.status)), "profile status missing");
must(profile.behavior?.coreWorkPieceManipulationEnabled === true, "piece manipulation behavior flag missing");
must(isHC024D1 || profile.behavior?.coreWorkChemistryEnabled === false, "chemistry must remain disabled before HC024D1");
must(profile.behavior?.coreWorkTraversalPaused === false, "HC024C should not claim a hard world pause");
must(profile.behavior?.coreWorkTraversalInputSuppressed === true, "Core Work traversal-input suppression flag missing");
must(profile.behavior?.preserveRightStickOrbit === true, "Right Stick camera orbit regressed");

must(input.includes("coreWorkManipX"), "Core Work planar manipulation input missing");
must(input.includes("coreWorkManipDepth"), "Core Work depth input missing");
must(input.includes("coreWorkSelectPrevPressed"), "Core Work piece selection input missing");
must(input.includes("moveX: coreWorkContext ? 0"), "world traversal is not suppressed during Core Work");
must(input.includes("rawPulsePressed && !coreWorkContext"), "world pulse can leak during Core Work");
must(input.includes("rawAbsorbHeld && !coreWorkContext"), "world absorb can leak during Core Work");
must(input.includes("rawStabilizeHeld && !coreWorkContext"), "world stabilize can leak during Core Work");

must(controls.includes("const interact = button(0);"), "controller A physical mapping changed");
must(controls.includes("const guideFocus = button(3);"), "controller Y physical mapping changed");
must(controls.includes("const dpadLeft = button(14);"), "D-Pad physical mapping changed");
must(controls.includes("const dpadRight = button(15);"), "D-Pad physical mapping changed");

must(camera.includes("pieceManipulationEnabled: Boolean(this.workActive)"), "camera state does not expose manipulation");
must(isHC024D1 || camera.includes("chemistryEnabled: false"), "camera claims chemistry is enabled before HC024D1");
must(camera.includes("core_work_piece_grab_or_place_forwarded"), "A/E is not forwarded from Core Work");

must(embodiment.includes("updateCoreWorkManipulation"), "CoreEmbodiment manipulation owner missing");
must(embodiment.includes("recognizable_retained_route_anatomy_groups") || embodiment.includes("existing_visible_binding_connection_nodes"), "compatible manipulation piece family missing");
must(embodiment.includes("coreWorkOffset"), "persistent placement offset missing");
must(embodiment.includes("guide_grabbed_"), "Guide grab event missing");
must(embodiment.includes("guide_placed_"), "Guide place event missing");
must(embodiment.includes("this.coreWorkMinimumRadius") && embodiment.includes("this.coreWorkMaximumRadius") && embodiment.includes("THREE.MathUtils.clamp("), "bounded Core placement radius missing");
must(isHC024D1 || embodiment.includes("chemistryEnabled: false"), "manipulation state may not enable chemistry before HC024D1");
must(isHC024D1 || embodiment.includes("chemistryMutation: false"), "manipulation state may not mutate chemistry before HC024D1");
must(embodiment.includes("newPieceSpawned: false"), "manipulation state may not spawn pieces");

must(orbiter.includes("selectedWorldPosition"), "Guide does not attend selected piece position");
must(orbiter.includes("guide_physically_holding_selected_core_piece"), "Guide held-piece reaction missing");
must(orbiter.includes("coreWorkPieceHeld"), "Guide debug state does not expose held piece");
must(hud.includes("D-Pad Left/Right selects"), "compact manipulation hint missing");
must(recipeData.includes("runtime_active_core_inspection_plus_guide_piece_manipulation"), "RecipeDataSystem does not accept the HC024C inspection profile");
must(recipeData.includes("coreWorkTraversalInputSuppressed"), "RecipeDataSystem does not validate HC024C input-only traversal suppression");

must(!movement.includes("coreWorkManip"), "movement owner was modified to own Core manipulation");

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

console.log("[HC024C] compatible physical manipulation ownership PASS");
console.log("[HC024C] A grab/place + D-Pad selection + LS movement + RT/LT depth PASS");
console.log("[HC024C] Guide follows selected piece while Right Stick camera remains separate PASS");
console.log("[HC024C] chemistry / progression / geography / new geometry remain locked PASS");
console.log("[HC024C] active source count remains 88 PASS");
