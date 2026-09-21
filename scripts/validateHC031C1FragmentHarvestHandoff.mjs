import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { TargetFocusRegistry } from "../src/targeting/TargetFocusRegistry.js";
import { fragmentCaptureWindow } from "../src/combat/RuptureHarvestGrammar.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const json = (p) => JSON.parse(read(p));

const identity = json("public/data/build/currentBuildIdentity_HC031C1.json");
const contract = json("public/data/build/hc031c1FragmentHarvestHandoffContract.json");
const locks = json("public/data/build/hc031c1LockedParentOwnerHashes.json");
const pkg = json("package.json");
const main = read("src/main.js");
const targeting = read("src/targeting/TargetingSystem.js");
const bond = read("src/chemistry/BondSystem.js");
const focusSource = read("src/targeting/TargetFocusRegistry.js");
const combatSource = read("src/combat/GraveRuptureHarvestSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");

for (const [relative, expected] of Object.entries(locks.hashes)) {
  const actual = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex");
  assert.equal(actual, expected, `locked HC031C owner drifted: ${relative}`);
}
assert.equal(locks.lockedOwnerCount, 114);
assert.equal(identity.id, "HC-031C1");
assert.equal(identity.sourceJsCount, 119);
assert.equal(identity.publicJsonCount, 460);
assert.equal(pkg.version, "0.31.4");
assert.match(main, /buildId:\s*"HC-031C1"/);
assert.match(telemetry, /blob\.session\.telemetry\.v1\.25/);
assert.match(combatSource, /liveFragmentIds/);
assert.match(combatSource, /absorbFocusAssistActive/);
assert.match(focusSource, /addRuptureHarvestOverride/);
assert.match(focusSource, /GraveRuptureHarvestSystem/);
assert.match(focusSource, /focus\.objectBoosts\s*=\s*\{\}/);
assert.equal(contract.fixLaw.targetingSystemRewrite, false);
assert.equal(contract.fixLaw.bondSystemRewrite, false);
assert.equal(contract.fixLaw.automaticCollection, false);
assert.equal(contract.fixLaw.absorbHeldFragmentFocusOverride, true);
assert.match(targeting, /camera_intent_plus_score_margin/);
assert.match(bond, /finishAbsorb\(nearest, frameState\)/);

// Provider-level behavior: while Absorb is held, legacy Grave boosts are replaced
// by equal fragment boosts so the existing TargetingSystem can choose by aim/distance.
const registry = Object.create(TargetFocusRegistry.prototype);
const focus = {
  objectBoosts: { scar_lock_plate_001: 64 },
  targetKinds: { scar_lock_plate_001: "grave_scar_lock" },
  preferredTargetId: "scar_lock_plate_001",
  preferredTargetLabel: "legacy",
  provider: "GraveBedPostSeamResponseSystem",
  reasons: []
};
registry.addRuptureHarvestOverride(focus, {
  activeCellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
  input: { absorbHeld: true },
  graveRuptureHarvest: {
    active: true,
    liveFragmentIds: ["grave_memory_shard_001", "grave_memory_shard_002"]
  }
});
assert.deepEqual(Object.keys(focus.objectBoosts).sort(), ["grave_memory_shard_001", "grave_memory_shard_002"]);
assert.equal(focus.objectBoosts.grave_memory_shard_001, 18);
assert.equal(focus.targetKinds.grave_memory_shard_001, "absorbable");
assert.equal(focus.preferredTargetId, "none");
assert.equal(focus.provider, "GraveRuptureHarvestSystem");

const noAbsorbFocus = { objectBoosts: { scar_lock_plate_001: 64 }, targetKinds: {}, reasons: [] };
registry.addRuptureHarvestOverride(noAbsorbFocus, {
  activeCellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
  input: { absorbHeld: false },
  graveRuptureHarvest: { active: true, liveFragmentIds: ["grave_memory_shard_001"] }
});
assert.equal(noAbsorbFocus.objectBoosts.scar_lock_plate_001, 64, "normal Grave focus must return when Absorb is released");

assert.ok(fragmentCaptureWindow("echo", 0) >= 7.5);
assert.ok(fragmentCaptureWindow("brittle", 0) > fragmentCaptureWindow("echo", 0));
assert.ok(fragmentCaptureWindow("silt", 0) > fragmentCaptureWindow("brittle", 0));

console.log("HC031C1 Fragment Harvest Handoff: PASS");
