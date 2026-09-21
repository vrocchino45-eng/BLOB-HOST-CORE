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
const recipe = json("public/data/routes/returnRegionGrammar_HC031A1.json");
const contract = json("public/data/build/hc031a1GraveIIOctaveResonanceContract.json");
const pkg = json("package.json");
const locks = json("public/data/build/hc031a1LockedParentOwnerHashes.json");
for (const [relative, expected] of Object.entries(locks.hashes)) {
  const actual = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex");
  assert.equal(actual, expected, `locked parent owner drifted: ${relative}`);
}
assert.equal(locks.lockedOwnerCount, 110);

assert.match(main, /buildId:\s*"HC-031A1"/);
assert.equal(pkg.version, "0.31.1");
assert.equal(recipe.randomGeneration, false);
assert.equal(recipe.octaveLaw.phase2.includes("6-phase"), true);
assert.equal(contract.exitSafety.graveIIBlocksExit, false);
assert.match(grave, /routeStates\?\.grave_memory_route/);
assert.match(grave, /authoritativeEntryCount >= 2/);
assert.match(grave, /grave_ii_octave_2_resonance_activated/);
assert.match(grave, /applyOctaveGrowth/);
assert.match(grave, /returnBlockedUntilResolved:\s*false/);
assert.match(boundary, /returnRegionBlocksExit:\s*false/);

const frameState = {
  act1RouteHistory: {
    graveReturned: true,
    graveMemoryImprintCommitted: true,
    vascularReturned: true,
    vascularCompleted: true,
    siltReturned: true,
    siltCompleted: true,
    graveTraceIntegrity: 0.82,
    graveRiskEventCount: 1,
    routeStates: { grave_memory_route: { entryCount: 2, returned: true, completed: true } }
  },
  corePerformance: { weights: { deep: 0.5, inner: 0.3, membrane: 0.2 } },
  entityReciprocalMemory: { primary: { strength01: 0.6 } },
  reactiveStateGrammar: { focus: { condition01: 0.4 } },
  verbComposition: { chord: "cohere_draw" }
};
const returnEngine = new ReturnRegionEngineSystem({ frameState });
returnEngine.init();
const layout = frameState.returnRegionEngine.graveLayout;
assert.equal(layout.equationId, "return_octave_resonance_v2");
assert.equal(layout.inputs.visitPhase, 2);
assert.equal(layout.octave.octaveRatio, 2);
assert.equal(layout.octave.octavePhaseCount, 6);
assert.ok(layout.outputs.depthScale >= 1.30, "Grave II needs visible octave growth floor");
assert.ok(layout.octave.resonance01 > 0 && layout.octave.resonance01 <= 1);
assert.equal(frameState.returnRegionEngine.creditCount, 3);

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

console.log("HC031A1 Grave II Octave Resonance + Exit Safety: PASS");
