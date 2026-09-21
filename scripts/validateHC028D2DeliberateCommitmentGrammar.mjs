import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { DeliberateCommitmentSystem } from "../src/input/DeliberateCommitmentSystem.js";
import { LOCAL_CELL_BOUNDARY_RECIPES_HC016G } from "../src/morph/LocalCellBoundaryRecipeRegistry.js";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const sha = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const controls = read("src/input/ControlMap.js");
const input = read("src/input/InputSystem.js");
const commitmentSource = read("src/input/DeliberateCommitmentSystem.js");
const signal = read("src/fields/SignalPlainEcologySystem.js");
const ambient = read("src/world/AmbientMaterialInteractionSystem.js");
const morph = read("src/morph/LocalCellBoundaryMorphSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const identity = json("public/data/build/currentBuildIdentity_HC028D2.json");
const contract = json("public/data/build/hc028d2DeliberateCommitmentGrammarContract.json");
const locks = json("public/data/build/hc028d2LockedOwnerHashes.json");
const pkg = json("package.json");

assert.match(main, /buildId:\s*"HC-028D2"/);
assert.match(main, /Deliberate Commitment Grammar/);
assert.equal(pkg.version, "0.28.8");
assert.equal(identity.parent, "HC-028D1");
assert.equal(identity.sourceJsCount, 97);

// Physical controller mapping is unchanged: A remains button 0, but its world role is deliberate Commit.
assert.match(controls, /const interact = button\(0\)/);
assert.match(controls, /A — Commit when a deliberate world commitment is offered; Core Work grab-place/);
assert.match(input, /primaryActionRole:\s*"commit_reserved"/);
assert.match(input, /coreWorkPressed = Boolean\(rawInteractPressed && !statusOpen && coreWorkContext\)/);
assert.match(input, /COMMIT →/);
assert.match(input, /A\/E -> deliberate Commit only when authored opportunity exists/);

// Commitment system must reserve intent without owning gameplay consequences.
for (const token of [
  "deliberate_commitment_not_generic_interact",
  "meaningful_or_persistent_choice_only",
  "reserved_press_no_authored_commitment",
  "consequenceAuthority: false",
  "routeCompletion: false",
  "verbPower: false"
]) assert.ok(commitmentSource.includes(token), `commitment contract token missing: ${token}`);

// Signal Plain is now read through the actual verb response, never A.
assert.ok(!signal.includes("interactPressed"), "Signal Plain may not consume A/interact in HC028D2");
assert.match(signal, /markNodeReadThroughVerb\(index, verb\)/);
assert.match(signal, /this\.markNodeReadThroughVerb\(index, spec\.sourceVerb\)/);
assert.match(signal, /readAuthority:\s*"verb_response_not_A"/);
assert.match(signal, /aButtonRequiredForObservation:\s*false/);

// Ambient read/inquiry belongs to Pulse; generic A scan is retired.
assert.ok(!ambient.includes("interactPressed"), "Ambient material system may not consume A/interact in HC028D2");
assert.match(ambient, /const inquiryTriggered = pulseTriggered/);
assert.match(ambient, /readAuthority:\s*"pulse_inquiry"/);
assert.match(ambient, /aButtonRequired:\s*false/);
assert.ok(!ambient.includes("scan_interact"), "legacy generic A scan token remains live");

// Completed route returns resolve through space/world state, not A confirmation.
const byId = Object.fromEntries(LOCAL_CELL_BOUNDARY_RECIPES_HC016G.map((r) => [r.id, r]));
for (const id of ["grave_to_hub", "vascular_to_hub", "silt_to_hub", "comb_to_hub", "aperture_to_comb"]) {
  assert.equal(byId[id]?.trigger, "proximity", `${id} must be proximity-resolved`);
}
assert.equal(LOCAL_CELL_BOUNDARY_RECIPES_HC016G.filter((r) => r.trigger === "interact").length, 0, "no live boundary recipe may require generic A interact");
// Generic legacy support may remain in the morph owner, but it must have no live recipe authority.
assert.match(morph, /if \(trigger === "interact"\)/);

// Telemetry distinguishes reserved commit presses from actual authored commitment events.
assert.match(telemetry, /blob\.session\.telemetry\.v1\.5/);
assert.match(telemetry, /action\.commit_pressed/);
assert.match(telemetry, /action\.deliberate_commitment/);

// Dynamic proof: A with no authored offer is inert; an explicit offer emits intent only.
const frameState = {
  frame: 10,
  input: {
    interactPressed: true,
    interactEventId: 1,
    primaryActionContext: "world",
    primaryActionRole: "commit_reserved"
  }
};
const system = new DeliberateCommitmentSystem({ frameState });
const inputBefore = JSON.stringify(frameState.input);
system.init();
system.update(1 / 60, frameState);
assert.equal(JSON.stringify(frameState.input), inputBefore, "commitment grammar must not mutate input");
assert.equal(frameState.deliberateCommitment.committed, false);
assert.equal(frameState.deliberateCommitment.status, "reserved_press_no_authored_commitment");
assert.equal(frameState.deliberateCommitmentEvent, null);

frameState.input.interactPressed = false;
system.update(1 / 60, frameState);
frameState.commitmentOpportunity = {
  available: true,
  kind: "retain_bond",
  targetId: "test_relationship",
  sourceId: "validator"
};
frameState.input.interactPressed = true;
frameState.input.interactEventId = 2;
system.update(1 / 60, frameState);
assert.equal(frameState.deliberateCommitment.committed, true);
assert.equal(frameState.deliberateCommitment.kind, "retain_bond");
assert.match(frameState.deliberateCommitment.eventId, /^hc028d2_commit_/);
assert.equal(frameState.deliberateCommitmentEvent.consequenceAuthority, false);
assert.equal(frameState.deliberateCommitment.authority.routeCompletion, false);
assert.equal(frameState.deliberateCommitment.authority.verbPower, false);

assert.equal(contract.rule, "if_movement_or_the_three_verbs_can_express_the_outcome_A_is_not_required");
assert.equal(contract.migrations.signalPlainObservation, "embodied_verb_response_not_A");
assert.equal(contract.migrations.ambientMaterialRead, "pulse_inquiry_not_A");
assert.equal(contract.grammar.coreWorkA, "intentional_internal_arrangement");

// Parent-lock evidence: systems outside D2's intended semantic migration remain byte-stable.
for (const [rel, expected] of Object.entries(locks.files)) {
  assert.equal(sha(rel), expected, `locked owner drifted: ${rel}`);
}

const jsFiles = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(full);
    else if (e.isFile() && full.endsWith(".js")) jsFiles.push(full);
  }
};
walk("src");
assert.equal(jsFiles.length, 97);

console.log("HC028D2 Deliberate Commitment Grammar: PASS");
console.log(JSON.stringify({
  build: identity.id,
  runtimeSourceCount: jsFiles.length,
  liveInteractBoundaryRecipes: LOCAL_CELL_BOUNDARY_RECIPES_HC016G.filter((r) => r.trigger === "interact").length,
  noOfferStatus: "reserved_press_no_authored_commitment",
  authoredCommitExample: frameState.deliberateCommitment.kind,
  lockedOwners: Object.keys(locks.files).length
}, null, 2));
