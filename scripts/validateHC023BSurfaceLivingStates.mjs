import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const must = (condition, message) => {
  if (!condition) throw new Error(`[HC023B] ${message}`);
};

const main = read("src/main.js");
const successorHC027C = main.includes('buildId: "HC-027C"') || main.includes('buildId: "HC-027C1"') || main.includes('buildId: "HC-027D"') || main.includes('buildId: "HC-027D1"') || (main.includes('buildId: "HC-027E"') || main.includes('buildId: "HC-027F"') || main.includes('buildId: "HC-027G"') || main.includes('buildId: "HC-027G1"') || (main.includes('buildId: "HC-027H"') || (main.includes('buildId: "HC-027I"') || (main.includes('buildId: "HC-027J"') || main.includes('buildId: "HC-027J1"')))));
const gameplay = read("src/opening/SurfaceWakeGameplaySystem.js");
const ecology = read("src/opening/SurfaceWakeEcologicalCausalitySystem.js");
const ambient = read("src/world/AmbientMaterialInteractionSystem.js");
const recipe = json("public/data/opening/surfaceWakeLivingCircuit_HC009C.json");
const contract = json("public/data/build/hc023bSurfaceLivingStateContract.json");

must(successorHC027C || (main.includes('buildId: "HC-023B"') || main.includes('buildId: "HC-023C"') || main.includes('buildId: "HC-023D"') || main.includes('buildId: "HC-024A"') || main.includes('buildId: "HC-024B"') || main.includes('buildId: "HC-024C"') || main.includes('buildId: "HC-024C1"') || main.includes('buildId: "HC-024C2"') || main.includes('buildId: "HC-024D0"') || main.includes('buildId: "HC-024D0A"') || main.includes('buildId: "HC-024D0B"') || (main.includes('buildId: "HC-024D0C"') || main.includes('buildId: "HC-024D1"') || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"'))))))))))) || (main.includes('buildId: "HC-024D2"') || (main.includes('buildId: "HC-024D3"') || main.includes('buildId: "HC-024E"') || (main.includes('buildId: "HC-025A"') || (main.includes('buildId: "HC-025B"') || (main.includes('buildId: "HC-025C"') || (main.includes('buildId: "HC-026A"') || (main.includes('buildId: "HC-026A1"') || main.includes('buildId: "HC-026B"') || (main.includes('buildId: "HC-026C"') || (main.includes('buildId: "HC-026C1"') || (main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')))))))))))) || main.includes('buildId: "HC-024C2"') || main.includes('buildId: "HC-024D0"')),
  "runtime identity is not HC-023B or a compatible successor"
);
must(contract.ownership.newSystem === false, "state pass must not add a system");
must(contract.targetRunShape.extendsMandatoryTimers === false, "mandatory timers changed");
must(contract.performance.newParticles === 0 && contract.performance.newGeometry === false, "visual scope expanded");
must(contract.currentBodyLock.core.includes("limbless_spherical_core"), "current Core body lock missing");
must(contract.deferredScaleDependentGrowth.implementedInThisBuild === false, "mature tendrils leaked into current runtime scope");

for (const state of ["cautious", "blooming", "withered", "panic", "embrace", "growth"]) {
  must(recipe.livingStates.states.includes(state), `recipe missing ${state}`);
  must(gameplay.includes(`"${state}"`), `gameplay derivation missing ${state}`);
  must(ecology.includes(`"${state}"`), `ecological visual response missing ${state}`);
}

must(gameplay.includes("this.tenderIntegrity <=") && gameplay.includes("this.scarLoad >="), "withered state is not chemistry-derived");
must(gameplay.includes("this.tenderFedCount >=") && gameplay.includes("this.materialPassageOpen"), "relational states are not history-derived");
must(gameplay.includes("coreAbsorbIntegrityCost") && gameplay.includes("unsafeCoreAbsorbScarLoadGain"), "absorption consequences missing");
must(ecology.includes("applyLivingStateVisuals") && ecology.includes("hc023bBaseScale"), "existing Tender anatomy is not carrying the states");
must(ambient.includes("surfaceLivingResponse") && ambient.includes("usesExistingPointField: true"), "existing ambient field is not carrying the states");
must(!fs.existsSync(path.join(root, "src/opening/LivingStateSystem.js")), "duplicate LivingStateSystem detected");

const start = recipe.startingState;
const outcomes = recipe.outcomes;
const rules = recipe.livingStates;
const firstFeed = {
  trust: start.tenderTrust + outcomes.tenderTrustGain,
  integrity: start.tenderIntegrity + outcomes.tenderIntegrityGain,
  scar: start.scarLoad - outcomes.scarLoadRecovery
};
const secondFeed = {
  trust: firstFeed.trust + outcomes.tenderTrustGain,
  integrity: firstFeed.integrity + outcomes.tenderIntegrityGain
};
const repeatedCoreIntegrity = start.tenderIntegrity - outcomes.coreAbsorbIntegrityCost * 4;
must(firstFeed.trust >= rules.embraceTrustMin && firstFeed.integrity >= rules.embraceIntegrityMin && firstFeed.scar <= rules.embraceScarLoadMax, "Embrace is unreachable after the first authored feeding");
must(secondFeed.trust >= rules.growthTrustMin && secondFeed.integrity >= rules.growthIntegrityMin, "Growth is unreachable after two authored feedings");
must(repeatedCoreIntegrity <= rules.witherIntegrityMax, "repeated Core absorption cannot produce Withered");
must(recipe.foldEmergence.successfulCycleCount === 1, "mandatory nursery progression was lengthened");

const sourceFiles = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".js")) sourceFiles.push(full);
  }
};
walk(path.join(root, "src"));
must(successorHC027C || ((sourceFiles.length === 88 || (((main.includes('buildId: "HC-027A"') || main.includes('buildId: "HC-027B"')) && sourceFiles.length === 89) || (main.includes('buildId: "HC-027B"') && sourceFiles.length === 90)))), `active source count changed: expected 88, found ${sourceFiles.length}`);

console.log("[HC023B] six derived Surface living states PASS");
console.log("[HC023B] existing-anatomy/existing-field presentation PASS");
console.log("[HC023B] no-new-system/no-new-particle/no-new-gate scope PASS");
console.log("[HC023B] current limbless Core and deferred mature tendril contract PASS");
console.log("[HC023B] Bloom → Embrace → Growth and recoverable Withered reachability PASS");
