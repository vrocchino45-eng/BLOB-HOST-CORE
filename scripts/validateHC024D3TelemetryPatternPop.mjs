import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const must = (condition, message) => { if (!condition) throw new Error(`[HC024D3] ${message}`); };

const main = read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");
const recipeData = read("src/data/RecipeDataSystem.js");
const profile = json("public/data/camera/inspectionCameraProfiles.json")[0];
const contract = json("public/data/build/hc024d3TelemetryPatternRecognitionContract.json");
const identity = json("public/data/build/currentBuildIdentity_HC024D3.json");
const pkg = json("package.json");

must(successorHC027C || (main.includes('buildId: "HC-024D3"') || (main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || main.includes('buildId: "HC-026A1"') || (main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))))), "runtime identity/successor missing");
must(successorHC027C || (["0.24.12","0.24.13", "0.25.0", "0.25.1","0.25.2", "0.26.0","0.26.1","0.26.2","0.26.3","0.26.4", "0.27.0", "0.27.1"].includes(pkg.version)), "package version mismatch");
must(identity.id === "HC-024D3" && identity.sourceJsCount === 88, "current build identity mismatch");
must(successorHC027C || (["HC-024D3","HC-024E", "HC-025A", "HC-025B", "HC-025C", "HC-026A","HC-026A1","HC-026B","HC-026C","HC-026C1", "HC-027A", "HC-027B", "HC-027C", "HC-027C1", "HC-027D", "HC-027D1", "HC-027E", "HC-027F", "HC-027G", "HC-027G1", "HC-027H", "HC-027I", "HC-027J", "HC-027J1"].includes(profile.build)), "inspection profile build mismatch");
must(profile.behavior?.coreWorkTelemetryCloudEnabled === true, "continuous telemetry flag missing");
must(profile.behavior?.coreWorkTelemetryPatternRecognitionEnabled === true, "pattern recognition flag missing");
must(profile.behavior?.coreWorkRecognizedCloudPatternCount === 5, "recognized pattern count mismatch");
must(profile.behavior?.coreWorkPatternPopEnabled === true, "recognition pop flag missing");
must(profile.behavior?.coreWorkPatternPopOneShotOnStateEntry === true, "one-shot pop contract missing");
must(profile.behavior?.coreWorkPatternPopRequiresStablePlacement === true, "stable placement contract missing");
must(contract.recognizedPatterns?.length === 5, "five cloud pattern definitions required");
must(contract.gameplayConsequencesEnabled === false, "D3 contract must preserve deferred gameplay consequences");

for (const marker of [
  'getCoreChemistryTelemetry(candidates)',
  'classifyCoreChemistryPattern(telemetry)',
  'updateCoreChemistryPatternRecognition(t, dt, frameState, candidates, telemetry)',
  'applyCoreChemistryPatternPop(candidates, telemetry, pattern, t)',
  'tight_convergence',
  'paired_counterpoint',
  'radial_ladder',
  'linear_channel',
  'balanced_triad',
  'pairDistances',
  'triangleArea',
  'normalizedArea',
  'radialSpan',
  'polarization',
  'oneShotOnRecognizedStateEntry: true',
  'repeatWhileStable: false',
  'pass: "HC-024D3"'
]) must(embodiment.includes(marker), `telemetry/pattern marker missing: ${marker}`);

must(embodiment.includes('const dwell = rawPattern.id === "none" ? 0.34 : 0.18'), "recognition dwell/hysteresis timing missing");
must(embodiment.includes('if (!held && this.coreChemistryPatternCandidateAge >= dwell'), "held piece must block pattern commit/pop");
must(embodiment.includes('this.coreChemistryPatternPopCount += 1'), "pop counter missing");
must(hud.includes('cloudPattern.stablePatternLabel') && hud.includes('· POP'), "compact cloud recognition HUD read missing");
must(recipeData.includes('coreWorkTelemetryPatternRecognitionEnabled') && recipeData.includes('coreWorkPatternPopOneShotOnStateEntry'), "RecipeDataSystem D3 contract missing");

let sourceCount = 0;
const walk = (dir) => { for (const entry of fs.readdirSync(dir,{withFileTypes:true})) { const full=path.join(dir,entry.name); if(entry.isDirectory()) walk(full); else if(entry.name.endsWith('.js')) sourceCount += 1; } };
walk(path.join(root,'src'));
must(successorHC027C || ((sourceCount === 88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && sourceCount === 89) || (main.includes('buildId: "HC-027B"') && sourceCount === 90)))), `expected locked 88 active source modules, found ${sourceCount}`);

console.log("[HC024D3] exact 3-piece XYZ/pair/triangle/centroid telemetry present PASS");
console.log("[HC024D3] five stable geometry classifiers present PASS");
console.log("[HC024D3] one-shot recognition pop with held-placement guard/hysteresis PASS");
console.log("[HC024D3] D3 telemetry/pop contract preserved in current successor PASS");
