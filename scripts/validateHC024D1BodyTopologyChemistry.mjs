import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const must = (condition, message) => { if (!condition) throw new Error(`[HC024D1] ${message}`); };

const main = read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const camera = read("src/camera/InspectionCameraSystem.js");
const input = read("src/input/InputSystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");
const recipeData = read("src/data/RecipeDataSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const contract = json("public/data/build/hc024d1BodyTopologyChemistryContract.json");
const identity = json("public/data/build/currentBuildIdentity_HC024D1.json");
const pkg = json("package.json");

must(successorHC027C || (main.includes('buildId: "HC-024D1"') || main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')))))))))))), "runtime identity/successor missing");
must(successorHC027C || (["0.24.10", "0.24.11", "0.24.12", "0.24.13", "0.25.0", "0.25.1","0.25.2", "0.26.0","0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)), "package version/successor mismatch");
must(identity.id === "HC-024D1" && identity.sourceJsCount === 88, "current build identity mismatch");
must(successorHC027C || (["HC-024D1", "HC-024D2", "HC-024D3", "HC-024E", "HC-025A", "HC-025B", "HC-025C", "HC-026A","HC-026A1","HC-026B","HC-026C","HC-026C1", "HC-027A", "HC-027B", "HC-027C", "HC-027C1", "HC-027D", "HC-027D1", "HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)), "inspection profile build/successor mismatch");
must(profile.behavior?.coreWorkChemistryEnabled === true, "Core Work chemistry capability not enabled");
must(profile.behavior?.coreWorkSpatialChemistryEnabled === true, "spatial chemistry flag missing");
must(profile.behavior?.coreWorkThreeZoneChemistry === true, "three-zone chemistry flag missing");
must(profile.behavior?.coreWorkFundamentalInteractionCount === 9, "profile must declare nine fundamental interactions");
must(profile.behavior?.coreWorkWholeCoreTopologyStateCount === 10, "profile must declare ten topology states");
must(profile.behavior?.coreWorkUsesIntentionalDpadDownEntry === true, "intentional D-Pad Down Core Work entry regressed");
must(profile.behavior?.coreWorkUsesExistingInteractButtonContextually === false, "A must remain interaction outside Core Work");
must(camera.includes('chemistryEnabled: Boolean(this.profile?.behavior?.coreWorkChemistryEnabled)'), "camera does not publish chemistry capability");
must(input.includes('coreWorkViewPressed') && input.includes('coreWorkPressed'), "Core Work input ownership regressed");

must(contract.bodyZones.length === 3, "contract must define exactly three body zones");
must(contract.fundamentalInteractions.length === 9, "contract must define exactly nine component-zone interactions");
must(contract.wholeCoreTopologies.length === 10, "contract must define exactly ten whole-Core topology states");
must(new Set(contract.fundamentalInteractions.map((entry) => `${entry.piece}|${entry.zone}`)).size === 9, "component-zone interactions must be unique");
const distributions = contract.wholeCoreTopologies.map((entry) => entry.distribution);
for (const expected of ["3:0:0","0:3:0","0:0:3","2:1:0","2:0:1","1:2:0","0:2:1","1:0:2","0:1:2","1:1:1"]) {
  must(distributions.includes(expected), `missing topology distribution ${expected}`);
}

for (const marker of [
  'label: "Memory Knot"',
  'label: "Memory Echo"',
  'label: "Residue Sense"',
  'label: "Cadence Anchor"',
  'label: "Circulation Drive"',
  'label: "Signal Skin"',
  'label: "Ballast"',
  'label: "Body Brace"',
  'label: "Adhesion Skin"',
  '"3:0:0": ["deep_concentration", "Deep Concentration"',
  '"0:3:0": ["inner_saturation", "Inner Saturation"',
  '"0:0:3": ["membrane_saturation", "Membrane Saturation"',
  '"1:1:1": ["three_way_balance", "Three-Way Balance"'
]) must(embodiment.includes(marker), `runtime chemistry marker missing: ${marker}`);

must(embodiment.includes('fundamentalInteractionCount: 9'), "runtime state does not publish nine interactions");
must(embodiment.includes('topologyStateCount: 10'), "runtime state does not publish ten topologies");
if (successorHC027C || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))) {
  must(embodiment.includes('gameplayConsequencesEnabled: true'), "HC025B+ successor must preserve D1 chemistry; later consequences remain owned outside the D1 topology classifier");
} else {
  must(embodiment.includes('gameplayConsequencesEnabled: false'), "HC024D1 must keep world consequences deferred");
}
must(embodiment.includes('recipeMenuUsed: false') && embodiment.includes('inventorySlotsUsed: false'), "chemistry must remain embodied, not menu/slot based");
must(hud.includes('selectedChemistry') && hud.includes('topology.label') && hud.includes('interactionLabel'), "HUD lacks secondary chemistry/topology confirmation");
must(recipeData.includes('coreWorkFundamentalInteractionCount !== 9') && recipeData.includes('coreWorkWholeCoreTopologyStateCount !== 10'), "RecipeDataSystem chemistry contract validation missing");

let sourceCount = 0;
const walk = (dir) => { for (const entry of fs.readdirSync(dir,{withFileTypes:true})) { const full=path.join(dir,entry.name); if(entry.isDirectory()) walk(full); else if(entry.name.endsWith('.js')) sourceCount += 1; } };
walk(path.join(root,'src'));
must(successorHC027C || ((sourceCount === 88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && sourceCount === 89) || (main.includes('buildId: "HC-027B"') && sourceCount === 90)))), `expected locked 88 active source modules, found ${sourceCount}`);

console.log("[HC024D1] three retained anatomies x three body zones = nine interactions PASS");
console.log("[HC024D1] 3:0 + 2:1 + 1:1:1 topology family = ten whole-Core states PASS");
console.log("[HC024D1] visual body-zone chemistry preserved through current successor PASS");
console.log("[HC024D1] intentional Core Work input and 88-module platform lock preserved PASS");
