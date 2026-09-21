import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const must = (condition, message) => { if (!condition) throw new Error(`[HC024D2] ${message}`); };

const main = read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const recipeData = read("src/data/RecipeDataSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const contract = json("public/data/build/hc024d2TopologyVisualReadabilityContract.json");
const identity = json("public/data/build/currentBuildIdentity_HC024D2.json");
const pkg = json("package.json");

must(successorHC027C || ((main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))))))), "runtime identity missing");
must(successorHC027C || (["0.24.11", "0.24.12", "0.24.13", "0.25.0", "0.25.1","0.25.2", "0.26.0","0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)), "package version/successor mismatch");
must(identity.id === "HC-024D2" && identity.sourceJsCount === 88, "current build identity mismatch");
must(successorHC027C || (["HC-024D2", "HC-024D3", "HC-024E", "HC-025A", "HC-025B", "HC-025C", "HC-026A","HC-026A1","HC-026B","HC-026C","HC-026C1", "HC-027A", "HC-027B", "HC-027C", "HC-027C1", "HC-027D", "HC-027D1", "HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)), "inspection profile build/successor mismatch");
must(profile.behavior?.coreWorkChemistryEnabled === true, "spatial chemistry must remain enabled");
must(profile.behavior?.coreWorkTopologyVisualReadabilityRefined === true, "topology readability refinement flag missing");
must(contract.wholeCoreTopologies?.length === 10, "ten topology states must remain authored");
must(contract.fundamentalInteractions?.length === 9, "nine component-zone interactions must remain authored");
must(contract.gameplayConsequencesEnabled === false, "world consequences must remain deferred");

for (const marker of [
  'coreChemistryVisualDeepWeight',
  'coreChemistryVisualInnerWeight',
  'coreChemistryVisualMembraneWeight',
  'coreChemistryVisualBalanceWeight',
  'const shellRadial = 1 - deepWeight * 0.105',
  'const mantlePulse = 1 + innerWeight',
  'const nucleusScale = 1 + deepWeight',
  'const surfaceSpread = 1 - deepWeight',
  'gameplayEnvelopeChanged: false'
]) must(embodiment.includes(marker), `visual readability marker missing: ${marker}`);
must(embodiment.includes('pass: "HC-024D2"') || embodiment.includes('pass: "HC-024D3"'), "D2 visual-read pass marker/successor missing");

must(embodiment.includes('this.outerShell.material.color.lerp(this.coreChemistryMembraneTint'), "membrane-heavy boundary tint/read missing");
must(embodiment.includes('this.innerMantle.material.color.lerp(this.coreChemistryInnerTint'), "inner-heavy mantle tint/read missing");
must(embodiment.includes('this.nucleus.material.color.lerp(this.coreChemistryDeepTint'), "deep-heavy nucleus tint/read missing");
must(embodiment.includes('topology.id === "three_way_balance"'), "three-way balance coordination missing");
must(recipeData.includes('coreWorkTopologyVisualReadabilityRefined') && recipeData.includes('HC-024D2'), "RecipeDataSystem D2 readability contract missing");

let sourceCount = 0;
const walk = (dir) => { for (const entry of fs.readdirSync(dir,{withFileTypes:true})) { const full=path.join(dir,entry.name); if(entry.isDirectory()) walk(full); else if(entry.name.endsWith('.js')) sourceCount += 1; } };
walk(path.join(root,'src'));
must(successorHC027C || ((sourceCount === 88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && sourceCount === 89) || (main.includes('buildId: "HC-027B"') && sourceCount === 90)))), `expected locked 88 active source modules, found ${sourceCount}`);

console.log("[HC024D2] 10 topology states preserved PASS");
console.log("[HC024D2] Deep / Inner / Membrane macro body reads strengthened PASS");
console.log("[HC024D2] 2:1 secondary-layer and 1:1:1 balance visual grammar present PASS");
console.log("[HC024D2] gameplay envelope/world consequences remain locked PASS");
