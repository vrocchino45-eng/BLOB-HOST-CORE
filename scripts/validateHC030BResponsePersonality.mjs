import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const pkg = json("package.json");
const main = read("src/main.js");
const runtime = read("src/core/GameRuntime.js");
const personalitySource = read("src/interaction/ResponsePersonalitySystem.js");
const chem = read("src/chemistry/ChemObjectSystem.js");
const bond = read("src/chemistry/BondSystem.js");
const entityPresentation = read("src/ecology/EntityEcologyResonanceSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const reactive = read("src/interaction/ReactiveStateGrammarSystem.js");
const targeting = read("src/targeting/TargetingSystem.js");
const composition = read("src/interaction/VerbCompositionSystem.js");
const identity = json("public/data/build/currentBuildIdentity_HC030B.json");
const contract = json("public/data/build/hc030bResponsePersonalityContract.json");
const locks = json("public/data/build/hc030bLockedOwnerHashes.json");
const chemRecipes = json("public/data/chemistry/chemObjectRecipes.json");
const entityRecipes = json("public/data/ecology/entityRecipes.json");

assert.match(main, /buildId:\s*"HC-030B"/);
assert.match(main, /Material \/ Entity Response Personality/);
assert.equal(pkg.version, "0.30.1");
assert.equal(identity.parent, "HC-030A");
assert.equal(identity.telemetrySchema, "blob.session.telemetry.v1.20");
assert.equal(contract.personalityOwner, "ResponsePersonalitySystem");
assert.equal(contract.lockedFoundation.newBaseVerbs, 0);
assert.equal(contract.lockedFoundation.newButtons, 0);
assert.equal(contract.lockedFoundation.newConditionStates, 0);
for (const value of Object.values(contract.forbidden)) assert.equal(value, false);

// HC030B must derive personality from fields already present in authored content.
assert(chemRecipes.length >= 20);
assert(chemRecipes.some((recipe) => recipe.chemistry?.matterState === "membrane"));
assert(chemRecipes.some((recipe) => recipe.chemistry?.matterState === "fluid"));
assert(chemRecipes.some((recipe) => recipe.chemistry?.matterState === "scarred"));
assert(chemRecipes.some((recipe) => recipe.chemistry?.matterState === "signal_vapor"));
assert(chemRecipes.some((recipe) => recipe.chemistry?.matterState === "dormant_seed"));
assert(entityRecipes.some((recipe) => /repair|filter|protect/.test(recipe.origin?.hostFunction ?? "")));
assert(entityRecipes.some((recipe) => /sense|warn|record/.test(recipe.origin?.hostFunction ?? "")));
assert(entityRecipes.some((recipe) => /carry|align|release/.test(recipe.origin?.hostFunction ?? "")));
assert.match(personalitySource, /recipe\.chemistry\?\.matterState/);
assert.match(personalitySource, /recipe\.origin\?\.hostFunction/);
assert.match(personalitySource, /conditionOwnerRemainsHC030A:\s*true/);
assert.match(personalitySource, /sameConditionDifferentMatterDifferentAnswer:\s*true/);
assert.match(personalitySource, /addsNewEntityAI:\s*false/);

// Runtime order: target -> composition -> HC030A condition -> HC030B identity -> Bond.
const targetingRegistration = runtime.indexOf('this.registry.register("targetingSystem"');
const compositionRegistration = runtime.indexOf('this.registry.register("verbCompositionSystem"');
const reactiveRegistration = runtime.indexOf('this.registry.register("reactiveStateGrammarSystem"');
const personalityRegistration = runtime.indexOf('this.registry.register("responsePersonalitySystem"');
const bondRegistration = runtime.indexOf('this.registry.register("bondSystem"');
assert(targetingRegistration >= 0 && compositionRegistration > targetingRegistration);
assert(reactiveRegistration > compositionRegistration);
assert(personalityRegistration > reactiveRegistration);
assert(bondRegistration > personalityRegistration);

// Existing effect owners consume personality but keep ownership of their primitive effects.
assert.match(chem, /pulsePushMultiplier/);
assert.match(chem, /pulseLateralMultiplier/);
assert.match(chem, /flexMultiplier/);
assert.match(chem, /shearMultiplier/);
assert.match(chem, /responsePersonality:/);
assert.match(bond, /personalityProgressMultiplier/);
assert.match(bond, /personalityPullMultiplier/);
assert.match(bond, /personalitySpinMultiplier/);
assert.match(entityPresentation, /applyVascularRelay/);
assert.match(entityPresentation, /open_downstream|responsePersonality/);
assert.match(entityPresentation, /relay_flow_vane_/);

// Telemetry gains personality context without becoming an authority surface.
assert.match(telemetry, /blob\.session\.telemetry\.v1\.20/);
assert.match(telemetry, /responsePersonality/);
assert.match(telemetry, /responseExpression/);
assert.match(telemetry, /this\.maxEvents = 16000/);

// Behavioral smoke: same unstable HC030A state, different authored identity =>
// different response expression and bounded physical signature.
const { ResponsePersonalitySystem } = await import("../src/interaction/ResponsePersonalitySystem.js");
const makeItem = (id, matterState, domains = []) => ({
  recipe: { id, chemistry: { matterState, domains } },
  root: { userData: {} }
});
const makeEntity = (id, hostFunction, matterState, instanceId = id) => ({
  instanceId,
  recipe: { id, origin: { hostFunction }, chemistry: { matterState }, ecologyGrammar: {} },
  root: { name: id, userData: {} }
});
const chemObjects = [
  makeItem("membrane_smoke", "membrane", ["form"]),
  makeItem("fluid_smoke", "fluid", ["flux"]),
  makeItem("scar_smoke", "scarred", ["scar"]),
  makeItem("signal_smoke", "signal_vapor", ["signal"]),
  makeItem("seed_smoke", "dormant_seed", ["seed"]),
  makeItem("bloom_smoke", "blooming", ["seed", "form"]),
  makeItem("residue_smoke", "residue_silt", ["residue"])
];
const entities = [
  makeEntity("nursery_membrane_tender_001", "repair_filter_protect", "membrane"),
  makeEntity("membrane_watcher_001", "sense_warn_record", "membrane"),
  makeEntity("vascular_relay_001", "carry_align_release", "fluid")
];
const smokeState = {
  targeting: { relationshipActive: true, relationshipTargetId: "membrane_smoke", targetId: "membrane_smoke" },
  reactiveStateGrammar: {
    objects: Object.fromEntries(chemObjects.map((item) => [item.recipe.id, { stage: "unstable", condition01: 0.63 }]))
  },
  entityRelationshipGrammar: { primary: { entityId: "nursery_membrane_tender_001" }, byEntityId: {} }
};
const smoke = new ResponsePersonalitySystem({ frameState: smokeState, chemObjectSystem: { objects: chemObjects }, entitySystem: { entities } });
smoke.init();
const objects = smokeState.responsePersonality.objects;
assert.equal(objects.membrane_smoke.family, "elastic_membrane");
assert.equal(objects.fluid_smoke.family, "flowing_current");
assert.equal(objects.scar_smoke.family, "dense_scar");
assert.equal(objects.signal_smoke.family, "resonant_signal");
assert.equal(objects.seed_smoke.family, "contained_seed");
assert.equal(objects.bloom_smoke.family, "volatile_growth");
assert.equal(objects.residue_smoke.family, "granular_residue");
assert.equal(objects.membrane_smoke.stage, "unstable");
assert.equal(objects.scar_smoke.stage, "unstable");
assert.notEqual(objects.membrane_smoke.stageExpression, objects.scar_smoke.stageExpression);
assert(objects.scar_smoke.shearMultiplier > objects.membrane_smoke.shearMultiplier);
assert(objects.fluid_smoke.rippleMultiplier > objects.scar_smoke.rippleMultiplier);
assert(objects.seed_smoke.compressionMultiplier > objects.fluid_smoke.compressionMultiplier);
assert.equal(smokeState.responsePersonality.entities.nursery_membrane_tender_001.family, "protective_tender");
assert.equal(smokeState.responsePersonality.entities.membrane_watcher_001.family, "anchored_sensor");
assert.equal(smokeState.responsePersonality.entities.vascular_relay_001.family, "flow_relay");
assert.equal(smokeState.responsePersonality.rules.conditionOwnerRemainsHC030A, true);
assert.equal(smokeState.responsePersonality.rules.addsNewTargeting, false);

// HC030A state thresholds and HC029 targeting/composition semantics remain byte locked.
assert.match(reactive, /coherentMax:\s*0\.30/);
assert.match(reactive, /strainedMax:\s*0\.52/);
assert.match(reactive, /unstableMax:\s*0\.72/);
assert.match(targeting, /candidateSwitchMargin = 0\.52/);
assert.match(targeting, /relationshipReleaseGraceSeconds = 0\.28/);
assert.match(composition, /meaning: "controlled_directional_push"/);
assert.match(composition, /meaning: "opposed_push_pull_tension"/);
assert.match(composition, /meaning: "high_strain_equilibrium"/);

// Every HC030A runtime owner outside the HC030B scope is byte locked.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked HC030A owner drifted: ${rel}`);
}
assert.equal(Object.keys(locks.files).length, 106);
for (const rel of locks.excludedIntentionalRuntimeDiffs) assert(!locks.files[rel]);

const sourceJsCount = fs.readdirSync("src", { recursive: true }).filter((name) => String(name).endsWith(".js")).length;
const publicJsonCount = fs.readdirSync("public", { recursive: true }).filter((name) => String(name).endsWith(".json")).length;
assert.equal(sourceJsCount, identity.sourceJsCount);
assert.equal(publicJsonCount, identity.publicJsonCount);

console.log("HC030B Material / Entity Response Personality: PASS");
console.log(JSON.stringify({
  build: identity.id,
  parent: identity.parent,
  personalityOwner: contract.personalityOwner,
  lockedOwners: Object.keys(locks.files).length,
  materialSmoke: Object.fromEntries(Object.entries(objects).map(([id, value]) => [id, `${value.family}:${value.stageExpression}`])),
  entitySmoke: Object.fromEntries(Object.entries(smokeState.responsePersonality.entities).map(([id, value]) => [id, value.family]))
}, null, 2));
