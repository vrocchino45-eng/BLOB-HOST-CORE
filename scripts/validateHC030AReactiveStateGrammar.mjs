import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const pkg = json("package.json");
const main = read("src/main.js");
const runtime = read("src/core/GameRuntime.js");
const reactive = read("src/interaction/ReactiveStateGrammarSystem.js");
const chem = read("src/chemistry/ChemObjectSystem.js");
const bond = read("src/chemistry/BondSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const targeting = read("src/targeting/TargetingSystem.js");
const composition = read("src/interaction/VerbCompositionSystem.js");
const identity = json("public/data/build/currentBuildIdentity_HC030A.json");
const contract = json("public/data/build/hc030aReactiveStateGrammarContract.json");
const locks = json("public/data/build/hc030aLockedOwnerHashes.json");
const parentLocks = json("public/data/build/hc029cLockedOwnerHashes.json");
const recipes = json("public/data/chemistry/chemObjectRecipes.json");

assert.match(main, /buildId:\s*"HC-030A"/);
assert.match(main, /Reactive State Grammar/);
assert.equal(pkg.version, "0.30.0");
assert.equal(identity.parent, "HC-029C");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.19");
assert.equal(contract.stateOwner, "ReactiveStateGrammarSystem");
assert.equal(contract.authoredDispositionSource, "chemObjectRecipes[*].chemistry.instabilityRisk");
assert.equal(contract.lockedFoundation.newBaseVerbs, 0);
assert.equal(contract.lockedFoundation.newButtons, 0);
for (const value of Object.values(contract.forbidden)) assert.equal(value, false);

// Authored data already carries instability risk; HC030A must use it rather than
// inventing a second per-object state table.
assert(recipes.length >= 20);
assert(recipes.every((recipe) => Number.isFinite(recipe.chemistry?.instabilityRisk)));
assert.match(reactive, /item\.recipe\.chemistry\?\.instabilityRisk/);
assert.match(reactive, /coherentMax:\s*0\.30/);
assert.match(reactive, /strainedMax:\s*0\.52/);
assert.match(reactive, /unstableMax:\s*0\.72/);
assert.match(reactive, /sameInputCanProduceDifferentAnswerByCondition:\s*true/);
assert.match(reactive, /stateLivesOnTargetNotHud:\s*true/);
assert.match(reactive, /fullSystemContainsMoreThanItRepairs:\s*true/);
assert.match(reactive, /retargetsIndependently:\s*false/);

// Runtime order: HC029A target -> HC029C composition -> HC030A target condition -> Bond.
const targetingRegistration = runtime.indexOf('this.registry.register("targetingSystem"');
const compositionRegistration = runtime.indexOf('this.registry.register("verbCompositionSystem"');
const reactiveRegistration = runtime.indexOf('this.registry.register("reactiveStateGrammarSystem"');
const bondRegistration = runtime.indexOf('this.registry.register("bondSystem"');
assert(targetingRegistration >= 0 && compositionRegistration > targetingRegistration);
assert(reactiveRegistration > compositionRegistration, "reactive state must read same-frame composition");
assert(bondRegistration > reactiveRegistration, "Bond must consume same-frame reactive state");

// The target itself carries the visual state. No new HUD/reticle owner is added.
assert.match(chem, /reactiveCondition01/);
assert.match(chem, /reactiveDeformation01/);
assert.match(chem, /reactiveJitter/);
assert.match(chem, /cleanResponse = 1 - condition01 \* 0\.32/);
assert.match(chem, /pivot\.scale\.set\(/);
assert.match(chem, /item\.root\.userData\.reactiveState/);

// Absorb reads condition without gaining new targeting or completion ownership.
assert.match(bond, /reactiveProgressMultiplier/);
assert.match(bond, /reactivePullMultiplier/);
assert.match(bond, /reactiveSpinMultiplier/);
assert.match(bond, /reactiveStage/);
assert.match(bond, /reactiveCondition01/);

// Telemetry retains a full 15–20 minute focused session and records only state
// boundary changes, remaining read-only to gameplay.
assert.match(telemetry, /blob\.session\.telemetry\.v1\.19/);
assert.match(telemetry, /this\.maxEvents = 16000/);
assert.match(telemetry, /chem\.reactive_state\.changed/);
assert.match(telemetry, /reactiveStateChanges/);
assert.match(telemetry, /targetingAuthority:\s*false/);
assert.match(telemetry, /progressionAuthority:\s*false/);

// Behavioral smoke: the same target can be stabilized out of an authored high-risk
// state, then Pulse/Absorb can add strain again without retargeting.
const { ReactiveStateGrammarSystem } = await import("../src/interaction/ReactiveStateGrammarSystem.js");
const item = {
  recipe: {
    id: "smoke_reactive_target",
    chemistry: { instabilityRisk: 0.74, absorbDifficulty: 0.86 },
    behavior: { onAbsorbAttempt: "resist" }
  },
  root: { userData: { absorbed: false } },
  absorbed: false
};
const smokeState = {
  input: { pulsePressed: false, pulseEventId: 0, absorbHeld: false, stabilizeHeld: true, resonanceHeld: true },
  targeting: { relationshipActive: true, relationshipTargetId: "smoke_reactive_target", targetId: "smoke_reactive_target" },
  verbComposition: { relationshipBound: true, targetId: "smoke_reactive_target", chord: "cohere" },
  chemObjectState: {}
};
const smoke = new ReactiveStateGrammarSystem({ frameState: smokeState, chemObjectSystem: { objects: [item] } });
smoke.init();
assert.equal(smokeState.reactiveStateGrammar.objects.smoke_reactive_target.stage, "failing");
for (let i = 0; i < 32; i += 1) smoke.update(0.08, smokeState);
const stabilized = smokeState.reactiveStateGrammar.objects.smoke_reactive_target;
assert(stabilized.condition01 < 0.30, `stabilize should settle condition, got ${stabilized.condition01}`);
assert.equal(stabilized.stage, "coherent");

smokeState.input = {
  pulsePressed: true,
  pulseEventId: 1,
  pulseReleaseKind: "charged",
  pulseReleaseCharge01: 1,
  absorbHeld: false,
  stabilizeHeld: false,
  resonanceHeld: false
};
smokeState.verbComposition = { relationshipBound: true, targetId: "smoke_reactive_target", chord: "project" };
const beforePulse = stabilized.condition01;
smoke.update(0.016, smokeState);
const afterPulse = smokeState.reactiveStateGrammar.objects.smoke_reactive_target.condition01;
assert(afterPulse > beforePulse, "Pulse should add strain to the retained target condition");

smokeState.input = { pulsePressed: false, pulseEventId: 1, absorbHeld: true, stabilizeHeld: false, resonanceHeld: false };
smokeState.verbComposition = { relationshipBound: true, targetId: "smoke_reactive_target", chord: "draw" };
const beforeAbsorb = afterPulse;
for (let i = 0; i < 10; i += 1) smoke.update(0.08, smokeState);
const afterAbsorb = smokeState.reactiveStateGrammar.objects.smoke_reactive_target.condition01;
assert(afterAbsorb > beforeAbsorb, "resisted Absorb should add strain");
assert.equal(smokeState.reactiveStateGrammar.targetId, "smoke_reactive_target");

// HC029A and HC029C meanings remain byte/contract locked outside this pass.
assert.match(targeting, /candidateSwitchMargin = 0\.52/);
assert.match(targeting, /relationshipReleaseGraceSeconds = 0\.28/);
assert.match(targeting, /relationshipHandoffCooldownSeconds = 0\.24/);
assert.match(composition, /meaning: "controlled_directional_push"/);
assert.match(composition, /meaning: "coherent_controlled_draw"/);
assert.match(composition, /meaning: "opposed_push_pull_tension"/);
assert.match(composition, /meaning: "high_strain_equilibrium"/);

// Every source owner outside the HC030A diff is byte locked to the parent package.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC029C owner drifted: ${rel}`);
}
assert.equal(Object.keys(locks.files).length, 106);
for (const rel of locks.excludedIntentionalRuntimeDiffs) assert(!locks.files[rel]);
assert.equal(Object.keys(parentLocks.files).length, 103);

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC030A Reactive State Grammar: PASS");
console.log(JSON.stringify({
  build: identity.id,
  parent: identity.parent,
  stateOwner: contract.stateOwner,
  lockedOwners: Object.keys(locks.files).length,
  telemetryEventCapacity: contract.telemetry.eventCapacity,
  smoke: {
    initial: "failing",
    stabilized: stabilized.stage,
    afterPulse: Number(afterPulse.toFixed(3)),
    afterAbsorb: Number(afterAbsorb.toFixed(3))
  }
}, null, 2));
