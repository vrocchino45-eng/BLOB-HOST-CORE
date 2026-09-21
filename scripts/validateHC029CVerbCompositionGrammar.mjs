import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const pkg = json("package.json");
const main = read("src/main.js");
const runtime = read("src/core/GameRuntime.js");
const grammar = read("src/interaction/VerbCompositionSystem.js");
const chem = read("src/chemistry/ChemObjectSystem.js");
const bond = read("src/chemistry/BondSystem.js");
const physical = read("src/player/CoreVerbPhysicalizationSystem.js");
const radial = read("src/player/CoreRadialPerformanceSystem.js");
const coupling = read("src/player/CoreVerbEngineCouplingSystem.js");
const targeting = read("src/targeting/TargetingSystem.js");
const identity = json("public/data/build/currentBuildIdentity_HC029C.json");
const contract = json("public/data/build/hc029cVerbCompositionGrammarContract.json");
const locks = json("public/data/build/hc029cLockedOwnerHashes.json");
const parentLocks = json("public/data/build/hc029bLockedOwnerHashes.json");

assert.match(main, /buildId:\s*"HC-029C"/);
assert.match(main, /Verb Composition Grammar/);
assert.equal(pkg.version, "0.29.3");
assert.equal(identity.parent, "HC-029B");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.18");
assert.equal(contract.compositionOwner, "VerbCompositionSystem");
assert.equal(contract.lockedFoundation.newBaseVerbs, 0);
assert.equal(contract.lockedFoundation.newButtons, 0);
for (const value of Object.values(contract.forbidden)) assert.equal(value, false);

// One composition owner names all primitive and composed chords.
assert.match(grammar, /if \(pulse && absorb && stabilize\) return "full_system"/);
assert.match(grammar, /if \(pulse && stabilize\) return "cohere_project"/);
assert.match(grammar, /if \(absorb && stabilize\) return "cohere_draw"/);
assert.match(grammar, /if \(pulse && absorb\) return "exchange"/);
assert.match(grammar, /meaning: "controlled_directional_push"/);
assert.match(grammar, /meaning: "coherent_controlled_draw"/);
assert.match(grammar, /meaning: "opposed_push_pull_tension"/);
assert.match(grammar, /meaning: "high_strain_equilibrium"/);
assert.match(grammar, /enduranceDemandMultiplier: 1\.32/);
assert.match(grammar, /pulseReleaseEnvelope/);
assert.match(grammar, /retargetsIndependently: false/);


// Behavioral smoke test: composition follows one retained target and Pulse release envelope.
const { VerbCompositionSystem } = await import("../src/interaction/VerbCompositionSystem.js");
const smokeState = {
  input: { pulseHeld: true, pulsePressed: false, pulseEventId: 0, absorbHeld: false, stabilizeHeld: true },
  targeting: { relationshipActive: true, relationshipTargetId: "smoke_target", targetId: "smoke_target" }
};
const smoke = new VerbCompositionSystem({ frameState: smokeState });
smoke.init();
smoke.update(0.016, smokeState);
assert.equal(smokeState.verbComposition.chord, "cohere_project");
assert.equal(smokeState.verbComposition.targetId, "smoke_target");
assert.equal(smokeState.verbComposition.relationshipBound, true);
smokeState.input = { pulseHeld: false, pulsePressed: true, pulseEventId: 1, pulseReleaseKind: "quick", absorbHeld: true, stabilizeHeld: false };
smoke.update(0.016, smokeState);
assert.equal(smokeState.verbComposition.chord, "exchange");
smokeState.input = { pulseHeld: false, pulsePressed: false, pulseEventId: 1, absorbHeld: true, stabilizeHeld: false };
smoke.update(0.12, smokeState);
assert.equal(smokeState.verbComposition.chord, "exchange", "quick Pulse tension envelope should persist briefly after release");
for (let index = 0; index < 5; index += 1) smoke.update(0.06, smokeState);
assert.equal(smokeState.verbComposition.chord, "draw", "composition should resolve back to held Absorb after Pulse envelope decays");

// Runtime order: targeting resolves the relationship, composition interprets it, Bond consumes it.
const targetingRegistration = runtime.indexOf('this.registry.register("targetingSystem"');
const compositionRegistration = runtime.indexOf('this.registry.register("verbCompositionSystem"');
const bondRegistration = runtime.indexOf('this.registry.register("bondSystem"');
assert(targetingRegistration >= 0 && compositionRegistration > targetingRegistration, "composition must run after targeting");
assert(bondRegistration > compositionRegistration, "Bond must consume same-frame composition");

// Pulse keeps HC029B inquiry ownership while its focused/ambient response is composition-shaped.
assert.match(chem, /focusedCompositionMultiplier/);
assert.match(chem, /ambientCompositionMultiplier/);
assert.match(chem, /baseResponseStrength \* compositionMultiplier/);
assert.match(chem, /compositionChord/);
assert.match(chem, /compositionDamping01/);

// Absorb remains Bond-owned and receives bounded composition shaping on the same target.
assert.match(bond, /compositionOwnsTarget/);
assert.match(bond, /absorbProgressMultiplier/);
assert.match(bond, /absorbPullMultiplier/);
assert.match(bond, /absorbSpinMultiplier/);
assert.match(bond, /compositionTension01/);

// Stabilize and visual transfer read the same canonical composition state.
assert.match(physical, /stabilizeRateMultiplier/);
assert.match(physical, /stabilizeWobbleMultiplier/);
assert.match(physical, /compositionTension01/);
assert.match(physical, /compositionEquilibrium01/);
assert.match(coupling, /frameState\.verbComposition\?\.chord/);

// Full-system equilibrium has a real physiological cost through existing endurance ownership.
assert.match(radial, /compositionDemandMultiplier/);
assert.match(radial, /verbDemandTotal/);
assert.match(radial, /compositionChord/);
assert.equal(contract.chords.full_system.enduranceDemandMultiplier, 1.32);
assert.equal(contract.chords.full_system.superMove, false);

// HC029A relationship thresholds remain untouched.
assert.match(targeting, /candidateSwitchMargin = 0\.52/);
assert.match(targeting, /relationshipReleaseGraceSeconds = 0\.28/);
assert.match(targeting, /relationshipHandoffCooldownSeconds = 0\.24/);
assert.match(targeting, /currentAim < 0\.18 && candidateAim > 0\.68/);
assert.equal(sha("src/targeting/TargetingSystem.js"), locks.files["src/targeting/TargetingSystem.js"]);

// All runtime owners outside the deliberate HC029C scope are byte-locked to HC029B.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC029B owner drifted: ${rel}`);
}
assert.equal(Object.keys(locks.files).length, 103);
for (const rel of locks.excludedIntentionalRuntimeDiffs) assert(!locks.files[rel]);
assert.equal(Object.keys(parentLocks.files).length, 106);

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC029C Verb Composition Grammar: PASS");
console.log(JSON.stringify({
  build: identity.id,
  parent: identity.parent,
  lockedOwners: Object.keys(locks.files).length,
  chords: Object.fromEntries(Object.entries(contract.chords).map(([key, value]) => [key, value.meaning])),
  fullSystemEnduranceDemandMultiplier: contract.chords.full_system.enduranceDemandMultiplier,
  runtimeOrder: contract.runtimeOrder
}, null, 2));
