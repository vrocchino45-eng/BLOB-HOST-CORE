import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  applyRupturePulse,
  applyRuptureStabilize,
  fragmentCaptureWindow,
  ruptureStageFor,
  shouldRupture
} from "../src/combat/RuptureHarvestGrammar.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const json = (p) => JSON.parse(read(p));

const main = read("src/main.js");
const runtime = read("src/core/GameRuntime.js");
const system = read("src/combat/GraveRuptureHarvestSystem.js");
const grammar = read("src/combat/RuptureHarvestGrammar.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const recipes = json("public/data/chemistry/chemObjectRecipes.json");
const contract = json("public/data/build/hc031cRuptureHarvestV1Contract.json");
const identity = json("public/data/build/currentBuildIdentity_HC031C.json");
const locks = json("public/data/build/hc031cLockedParentOwnerHashes.json");
const pkg = json("package.json");

for (const [relative, expected] of Object.entries(locks.hashes)) {
  const actual = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex");
  assert.equal(actual, expected, `locked HC031B owner drifted: ${relative}`);
}
assert.equal(locks.lockedOwnerCount, 114);
assert.equal(identity.sourceJsCount, 119);
assert.equal(identity.publicJsonCount, 457);
assert.equal(pkg.version, "0.31.3");
assert.match(main, /buildId:\s*"HC-031C"/);
assert.match(runtime, /GraveRuptureHarvestSystem/);
assert.match(runtime, /graveRuptureHarvestSystem/);
assert.match(system, /rupture_fragment_absorb_residue/);
assert.match(system, /missedFragmentsBecomeNonTargetableResidue:\s*true/);
assert.match(system, /exitBlockedByCombat:\s*false/);
assert.match(system, /routeProgressionOwnedByCombat:\s*false/);
assert.match(system, /hackAndSlashAttack:\s*false/);
assert.match(grammar, /fragmentCaptureWindow/);
assert.match(telemetry, /blob\.session\.telemetry\.v1\.24/);
assert.match(telemetry, /combat\.rupture_harvest/);
assert.equal(contract.combatLaw.healthBars, false);
assert.equal(contract.combatLaw.newAbilityButtons, 0);
assert.equal(contract.combatLaw.exitBlockedByCombat, false);
assert.equal(contract.combatLaw.missedFragmentsPersistAsResidue, true);

const recipeById = new Map(recipes.map((entry) => [entry.id, entry]));
const parentIds = [
  "grave_rupture_brittle_node_001",
  "grave_rupture_silt_sac_001",
  "grave_rupture_echo_carrier_001"
];
for (const id of parentIds) {
  assert.ok(recipeById.has(id), `missing rupture parent ${id}`);
  assert.equal(Boolean(recipeById.get(id)?.behavior?.onAbsorb), false, `${id} must resist whole-object absorb before rupture`);
  assert.ok(recipeById.get(id)?.behavior?.onRupture, `${id} must author a rupture answer`);
}
const fragmentIds = recipes.filter((entry) => entry.status === "runtime_spawned_hc031c_fragment_only").map((entry) => entry.id);
assert.equal(fragmentIds.length, 12);
for (const id of fragmentIds) {
  const recipe = recipeById.get(id);
  assert.equal(recipe.chemistry?.bondTypes?.[0], "soft_bond");
  assert.ok(recipe.behavior?.onAbsorb, `${id} must be harvestable with existing Absorb`);
  assert.ok((recipe.chemistry?.absorbDifficulty ?? 1) < 0.7, `${id} must be absorb-compatible`);
}

// Behavioral grammar: ordinary Pulse can drive a breakable through readable stages,
// while Stabilize can pull the same pressure back down before rupture.
let pressure = 0;
pressure = applyRupturePulse({ pressure01: pressure, charge01: 0.4, susceptibility: 1.08, regionalSpread01: 0.2 });
assert.equal(ruptureStageFor(pressure), "agitated");
const afterFirst = pressure;
pressure = applyRupturePulse({ pressure01: pressure, charge01: 0.65, susceptibility: 1.08, regionalSpread01: 0.2 });
assert.ok(pressure > afterFirst);
assert.ok(["agitated", "critical"].includes(ruptureStageFor(pressure)));
const stabilized = applyRuptureStabilize({ pressure01: pressure, dt: 0.08, settleScale: 1.2 });
assert.ok(stabilized < pressure, "Stabilize must reduce rupture pressure");

let rupturePressure = 0;
for (let i = 0; i < 4 && !shouldRupture({ pressure01: rupturePressure, threshold01: 0.78, reactiveCondition01: 0.45 }); i += 1) {
  rupturePressure = applyRupturePulse({ pressure01: rupturePressure, charge01: 0.7, susceptibility: 1.08, regionalSpread01: 0.25 });
}
assert.equal(shouldRupture({ pressure01: rupturePressure, threshold01: 0.78, reactiveCondition01: 0.45 }), true);
assert.ok(fragmentCaptureWindow("echo", 0) < fragmentCaptureWindow("silt", 0), "echo harvest window should be more fleeting than silt");
assert.ok(fragmentCaptureWindow("brittle", 0) < fragmentCaptureWindow("silt", 0), "brittle shards should cool sooner than silt motes");

console.log("HC031C Rupture Harvest V1: PASS");
