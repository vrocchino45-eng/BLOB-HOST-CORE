import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { GraveResonanceGameplaySystem } from "../src/routes/GraveResonanceGameplaySystem.js";
import { ReturnRegionEngineSystem } from "../src/routes/ReturnRegionEngineSystem.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const json = (p) => JSON.parse(read(p));

const main = read("src/main.js");
const runtime = read("src/core/GameRuntime.js");
const grave = read("src/routes/GraveReturnRegionSystem.js");
const gameplay = read("src/routes/GraveResonanceGameplaySystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const contract = json("public/data/build/hc031bGraveIIResonanceGameplayContract.json");
const identity = json("public/data/build/currentBuildIdentity_HC031B.json");
const pkg = json("package.json");
const locks = json("public/data/build/hc031bLockedParentOwnerHashes.json");

for (const [relative, expected] of Object.entries(locks.hashes)) {
  const actual = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex");
  assert.equal(actual, expected, `locked HC031A1 owner drifted: ${relative}`);
}
assert.equal(locks.lockedOwnerCount, 112);
assert.equal(identity.sourceJsCount, 117);
assert.equal(identity.publicJsonCount, 454);
assert.equal(pkg.version, "0.31.2");
assert.match(main, /buildId:\s*"HC-031B"/);
assert.match(runtime, /GraveResonanceGameplaySystem/);
assert.match(runtime, /graveResonanceGameplaySystem/);
assert.match(grave, /regionalGameplayOwner:\s*"GraveResonanceGameplaySystem"/);
assert.match(grave, /sustained_regional_resonance_condition_not_exact_combo/);
assert.doesNotMatch(grave, /targetGrammar:\s*\{/);
assert.match(gameplay, /touch_one_part_of_the_octave_and_other_parts_answer/);
assert.match(gameplay, /quiet_retention/);
assert.match(gameplay, /shared_memory/);
assert.match(gameplay, /held_contradiction/);
assert.match(gameplay, /exactComboGate:\s*false/);
assert.match(gameplay, /exitBlocked:\s*false/);
assert.match(telemetry, /blob\.session\.telemetry\.v1\.23/);
assert.equal(contract.regionalLaw.exactComboGate, false);
assert.equal(contract.regionalLaw.addsNewLinesOrRings, false);
assert.equal(contract.progression.completionDoesNotControlExit, true);
assert.equal(contract.regionalLaw.multipleValidResolutions.length, 3);

const ids = [
  "residue_silt_cloud_001",
  "scar_lock_plate_001",
  "inheritance_seed_remnant_001"
];
const frameState = {
  activeCellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
  graveReturnRegion: { active: true, octave: { resonance01: 0.6 } },
  targeting: { relationshipActive: true, relationshipTargetId: "scar_lock_plate_001" },
  input: { pulsePressed: true, pulseEventId: 1, pulseReleaseCharge01: 0.5 },
  verbComposition: { relationshipBound: true, targetId: "scar_lock_plate_001", chord: "project" },
  reactiveStateGrammar: { objects: {} },
  frame: 1,
  runtimeSeconds: 0
};
const chemObjectSystem = { objects: ids.map((id) => ({ recipe: { id }, responsePivot: null })) };
const graveReturnRegionSystem = { knots: new Map(), strata: [] };
const system = new GraveResonanceGameplaySystem({ frameState, chemObjectSystem, graveReturnRegionSystem });
system.init();
const before = structuredClone(frameState.graveResonanceGameplay.nodes);
system.update(0.016, frameState);
const after = frameState.graveResonanceGameplay.nodes;
assert.notEqual(after.coherentPush.level01, before.coherentPush.level01, "Pulse should affect retained target");
assert.notEqual(after.heldEquilibrium.level01, before.heldEquilibrium.level01, "Pulse should propagate to another Grave node");
assert.ok(frameState.graveResonanceGameplay.lastPropagationEvent?.deltas?.heldEquilibrium !== 0);
assert.equal(frameState.graveResonanceGameplay.rules.exactComboGate, false);

// No exact chord sequence: simply stabilizing the coupled field across its familiar
// landmarks must be capable of reaching a valid regional resolution.
frameState.input = { stabilizeHeld: true, pulsePressed: false, pulseEventId: 1 };
for (let i = 0; i < 900 && !frameState.graveResonanceGameplay.completed; i += 1) {
  const id = ids[i % ids.length];
  frameState.frame += 1;
  frameState.runtimeSeconds += 0.05;
  frameState.targeting.relationshipTargetId = id;
  frameState.verbComposition = { relationshipBound: true, targetId: id, chord: "cohere" };
  system.update(0.05, frameState);
}
assert.equal(frameState.graveResonanceGameplay.completed, true);
assert.equal(frameState.graveResonanceGameplay.resolutionId, "shared_memory");
assert.equal(frameState.returnRegionCompletionEvent?.key, "grave:phase_2");
assert.equal(frameState.returnRegionCompletionEvent?.source, "GraveResonanceGameplaySystem");

// Completion still grants progression credit through the existing return engine,
// but it does not acquire crossing authority.
const progressionState = {
  act1RouteHistory: {
    graveReturned: true,
    graveMemoryImprintCommitted: true,
    vascularReturned: true,
    vascularCompleted: true,
    siltReturned: true,
    siltCompleted: true,
    routeStates: { grave_memory_route: { entryCount: 2, returned: true } }
  },
  corePerformance: { weights: { deep: 1/3, inner: 1/3, membrane: 1/3 } },
  entityReciprocalMemory: { primary: { strength01: 0.3 } },
  reactiveStateGrammar: { focus: { condition01: 0.3 } },
  verbComposition: { chord: "idle" },
  returnRegionCompletionEvent: frameState.returnRegionCompletionEvent
};
const engine = new ReturnRegionEngineSystem({ frameState: progressionState });
engine.init();
engine.update(0, progressionState);
assert.equal(progressionState.returnRegionEngine.creditCount, 4);
assert.equal(progressionState.returnRegionEngine.phase2.grave, true);
assert.equal(progressionState.returnRegionEngine.routeCrossingAuthority, false);

console.log("HC031B Grave II Resonance Gameplay: PASS");
