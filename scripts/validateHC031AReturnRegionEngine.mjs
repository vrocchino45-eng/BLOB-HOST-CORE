import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { ReturnRegionEngineSystem } from "../src/routes/ReturnRegionEngineSystem.js";
import { CoreEngineSystem } from "../src/player/CoreEngineSystem.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const json = (p) => JSON.parse(read(p));

const main = read("src/main.js");
const grave = read("src/routes/GraveReturnRegionSystem.js");
const boundary = read("src/morph/LocalCellBoundaryMorphSystem.js");
const recipe = json("public/data/routes/returnRegionGrammar_HC031A.json");
const contract = json("public/data/build/hc031aReturnRegionEngineContract.json");
const pkg = json("package.json");
const locks = json("public/data/build/hc031aLockedOwnerHashes.json");
for (const [relative, expected] of Object.entries(locks.hashes)) {
  const actual = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex");
  assert.equal(actual, expected, `locked owner drifted: ${relative}`);
}
assert.equal(locks.lockedOwnerCount, 108);

assert.match(main, /buildId:\s*"HC-031A"/);
assert.equal(pkg.version, "0.31.0");
assert.equal(recipe.randomGeneration, false);
assert.equal(contract.progression.newButtons, 0);
assert.match(grave, /residue_silt_cloud_001/);
assert.match(grave, /cohere_draw/);
assert.match(grave, /scar_lock_plate_001/);
assert.match(grave, /cohere_project/);
assert.match(grave, /inheritance_seed_remnant_001/);
assert.match(grave, /full_system/);
assert.match(boundary, /returnRegionResolved/);

const frameState = {
  act1RouteHistory: {
    graveReturned: true,
    graveMemoryImprintCommitted: true,
    vascularReturned: true,
    vascularCompleted: true,
    siltReturned: true,
    siltCompleted: true,
    graveTraceIntegrity: 0.82,
    graveRiskEventCount: 1
  },
  corePerformance: { weights: { deep: 0.5, inner: 0.3, membrane: 0.2 } },
  entityReciprocalMemory: { primary: { strength01: 0.6 } },
  reactiveStateGrammar: { focus: { condition01: 0.4 } },
  verbComposition: { chord: "cohere_draw" }
};
const returnEngine = new ReturnRegionEngineSystem({ frameState });
returnEngine.init();
assert.equal(frameState.returnRegionEngine.creditCount, 3);
assert.equal(frameState.returnRegionEngine.unlockedPhaseCount, 3);
assert.equal(frameState.returnRegionEngine.graveLayout.equationId, "return_layout_v1_core_history_memory_state");

for (const routeKey of ["grave", "vascular", "silt"]) {
  frameState.returnRegionCompletionEvent = { key: `${routeKey}:phase_2`, routeKey, phase: 2 };
  returnEngine.update(0, frameState);
}
assert.equal(frameState.returnRegionEngine.creditCount, 6);
assert.equal(frameState.returnRegionEngine.unlockedPhaseCount, 6);

const playerRoot = { userData: {} };
const core = new CoreEngineSystem({ frameState, playerRoot });
core.init();
core.update(0.016, frameState);
assert.equal(frameState.coreEngine.phaseCount, 6);
assert.equal(frameState.coreEngine.architectureId, "paired_6");
assert.equal(frameState.coreEngine.progressionUnlockSource, "ReturnRegionEngineSystem");

console.log("HC031A Grave II Return Region Engine Proof: PASS");
