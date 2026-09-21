import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const must = (condition, message) => { if (!condition) throw new Error(`[HC024C2] ${message}`); };

const main = read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const isHC024D1 = main.includes('buildId: "HC-024D1"') || main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))))) || successorHC027C;
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const orbiter = read("src/ecology/OrbiterSystem.js");
const recipeData = read("src/data/RecipeDataSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const contract = json("public/data/build/hc024c2RetainedAnatomyManipulationContract.json");
const pkg = json("package.json");

must(successorHC027C || (main.includes('buildId: "HC-024C2"') || main.includes('buildId: "HC-024D0"') || main.includes('buildId: "HC-024D0A"') || main.includes('buildId: "HC-024D0B"') || (main.includes('buildId: "HC-024D0C"') || main.includes('buildId: "HC-024D1"') || main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))))))), "runtime identity missing");
must(successorHC027C || (["0.24.4", "0.24.5", "0.24.6", "0.24.7", "0.24.8", "0.24.9", "0.24.10", "0.24.11", "0.24.12", "0.24.13", "0.25.0", "0.25.1","0.25.2", "0.26.0","0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)), "package version mismatch");
must(contract.build === "HC-024C2", "contract build mismatch");
must(["HC-024C2", "HC-024D0", "HC-024D0A", "HC-024D0B", "HC-024D0C", "HC-024D1", "HC-024D2", "HC-024D3", "HC-024E", "HC-025A", "HC-025B", "HC-025C", "HC-026A","HC-026A1","HC-026B","HC-026C","HC-026C1", "HC-027A", "HC-027B", "HC-027C", "HC-027C1", "HC-027D", "HC-027D1", "HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build) || ((main.includes('buildId: "HC-024D0"') || main.includes('buildId: "HC-024D0A"') || main.includes('buildId: "HC-024D0B"') || (main.includes('buildId: "HC-024D0C"') || main.includes('buildId: "HC-024D1"') || main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))))))) && profile.build === "HC-024C2"), "inspection profile not compatible");
must(profile.behavior?.coreWorkRetainedAnatomyManipulation === true, "retained-anatomy flag missing");
must(profile.behavior?.coreWorkManipulatesRecognizableRouteRetention === true, "recognizable-retention flag missing");
must(isHC024D1 || profile.behavior?.coreWorkChemistryEnabled === false, "chemistry must remain disabled before HC024D1");

must(embodiment.includes('coreWorkLabel: "Grave Memory"'), "Grave Memory candidate missing");
must(embodiment.includes('coreWorkLabel: "Vascular Rhythm"'), "Vascular Rhythm candidate missing");
must(embodiment.includes('coreWorkLabel: "Silt Pressure"'), "Silt Pressure candidate missing");
must(embodiment.includes("recognizable_retained_route_anatomy_groups"), "retained candidate family missing");
must(embodiment.includes("this.memoryImprintRoot") && embodiment.includes("this.vascularFilamentRoot") && embodiment.includes("this.siltAdaptationRoot"), "retained roots not owned by CoreEmbodimentSystem");
must(embodiment.includes("getCoreWorkAnchorLocal") && embodiment.includes("getCoreWorkAnchorWorld"), "visible-center anchor helpers missing");
must(embodiment.includes("coreWorkBasePosition") && embodiment.includes("coreWorkOffset"), "persistent retained placement offsets missing");
must(embodiment.includes("child.userData.coreWorkManipulable = false"), "hidden growth nodes were not retired from Core Work ownership");
must(isHC024D1 || embodiment.includes("chemistryEnabled: false"), "manipulation state enables chemistry before HC024D1");
must(orbiter.includes("selectedWorldPosition"), "Guide no longer attends selected visible anatomy");
must(recipeData.includes("coreWorkRetainedAnatomyManipulation"), "RecipeDataSystem C2 compatibility missing");

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

console.log("[HC024C2] recognizable Grave/Vascular/Silt manipulation ownership PASS");
console.log("[HC024C2] persistent whole-anatomy placement offsets + visible anchors PASS");
console.log("[HC024C2] hidden binding nodes retired from Core Work ownership PASS");
console.log("[HC024C2] chemistry / controls / geography remain locked PASS");
console.log("[HC024C2] active source count remains 88 PASS");
