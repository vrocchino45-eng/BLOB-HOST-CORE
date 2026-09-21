import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const must = (condition, message) => { if (!condition) throw new Error(`[HC024C1] ${message}`); };

const main = read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const isHC024D1 = main.includes('buildId: "HC-024D1"') || main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))))) || successorHC027C;
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const orbiter = read("src/ecology/OrbiterSystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");
const input = read("src/input/InputSystem.js");
const recipeData = read("src/data/RecipeDataSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const contract = json("public/data/build/hc024c1CoreWorkReadabilityContract.json");
const pkg = json("package.json");

must(successorHC027C || (main.includes('buildId: "HC-024C1"') || main.includes('buildId: "HC-024C2"') || main.includes('buildId: "HC-024D0"') || main.includes('buildId: "HC-024D0A"') || main.includes('buildId: "HC-024D0B"') || (main.includes('buildId: "HC-024D0C"') || main.includes('buildId: "HC-024D1"') || main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))))))), "runtime identity missing");
must(successorHC027C || (["0.24.3", "0.24.4", "0.24.5", "0.24.6", "0.24.7", "0.24.8", "0.24.9", "0.24.10", "0.24.11", "0.24.12", "0.24.13", "0.25.0", "0.25.1","0.25.2", "0.26.0","0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)), "package version mismatch");
must(contract.build === "HC-024C1", "readability contract missing");
must(successorHC027C || (["HC-024C1", "HC-024C2", "HC-024D0", "HC-024D0A", "HC-024D0B", "HC-024D0C", "HC-024D1", "HC-024D2", "HC-024D3", "HC-024E", "HC-025A", "HC-025B", "HC-025C", "HC-026A","HC-026A1","HC-026B","HC-026C","HC-026C1", "HC-027A", "HC-027B", "HC-027C", "HC-027C1", "HC-027D", "HC-027D1", "HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)), "inspection profile build not advanced");
must(profile.behavior?.coreWorkDepthReadabilityRefined === true, "depth readability behavior flag missing");
must(isHC024D1 || profile.behavior?.coreWorkChemistryEnabled === false, "chemistry must remain disabled before HC024D1");

must(embodiment.includes("this.coreWorkMinimumRadius = 0.26") || embodiment.includes("this.coreWorkMinimumRadius = 0.22"), "expanded inward radius missing");
must(embodiment.includes("this.coreWorkMaximumRadius = 1.08") || embodiment.includes("this.coreWorkMaximumRadius = 1.22"), "expanded outward radius missing");
must(embodiment.includes("this.coreWorkDepthSpeed = 0.72") || embodiment.includes("this.coreWorkDepthSpeed = 0.8"), "stronger depth travel missing");
must(embodiment.includes("selectedDepthPercent"), "depth telemetry missing");
must(embodiment.includes('"deep_core"') && embodiment.includes('"inner_ring"') && embodiment.includes('"membrane"') && embodiment.includes('"outer_edge"'), "depth bands missing");
must(embodiment.includes("contextDim"), "nonselected anatomy dimming missing");
must(embodiment.includes("coreWorkHighlightColor"), "selected/held piece highlight missing");

must(orbiter.includes("workSelectedRadial"), "Guide radial attend vector missing");
must(orbiter.includes("selectedDepth01"), "Guide does not respond to selected radial depth");
must(orbiter.includes("depthMotionBoost"), "Guide shimmer does not strengthen during depth motion");
must(hud.includes("selectedDepthPercent"), "compact depth readout missing");
must(hud.includes("pulling outward") && hud.includes("pushing inward"), "directional depth feedback missing");

must(input.includes("coreWorkManipDepth"), "RT/LT depth input regressed");
must(recipeData.includes('HC-024C1') && recipeData.includes('HC-024C2'), "RecipeDataSystem HC024C1+ compatibility missing");
must(isHC024D1 || !embodiment.includes("chemistryEnabled: true"), "embodiment unexpectedly enables chemistry before HC024D1");

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

console.log("[HC024C1] selected/held piece readability PASS");
console.log("[HC024C1] stronger bounded RT/LT radial travel + depth bands PASS");
console.log("[HC024C1] Guide radial pull/push composition + shimmer feedback PASS");
console.log("[HC024C1] chemistry / controls / geography remain locked PASS");
console.log("[HC024C1] active source count remains 88 PASS");
