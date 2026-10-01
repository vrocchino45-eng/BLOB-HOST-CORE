import fs from "node:fs";
import crypto from "node:crypto";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const json = (path) => JSON.parse(read(path));
const assert = (condition, message) => { if (!condition) throw new Error(`[HC031V validate] ${message}`); };
const hash = (text) => crypto.createHash("sha256").update(text).digest("hex");

const pkg = json("package.json");
const contract = json("public/data/build/hc031vLivingResponseTelemetryTruthContract.json");
const main = read("src/main.js");
const alive = read("src/fields/GatheringGroundAliveSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");
const guide = read("src/guide/GuidePromptSystem.js");

const extractMethod = (source, name) => {
  const start = source.indexOf(`\n  ${name}(`) + 1;
  assert(start > 0, `method missing: ${name}`);
  const tail = source.slice(start + 1);
  const match = tail.match(/\n  [A-Za-z_$][A-Za-z0-9_$]*\(/);
  const end = match ? start + 1 + match.index : source.length;
  return `${source.slice(start, end).trimEnd()}\n`;
};
const extractTiming = (source) => {
  const start = source.indexOf("const U21_TIMING = Object.freeze(");
  assert(start >= 0, "U21 timing block missing");
  const end = source.indexOf("});", start);
  assert(end > start, "U21 timing block end missing");
  return `${source.slice(start, end + 3)}\n`;
};

assert(pkg.version === "0.31.52", `expected package 0.31.52, got ${pkg.version}`);
assert(main.includes('buildId: "HC-031V"'), "HC031V build ID missing");
assert(main.includes('buildLabel: "Living Response Readability / Telemetry Truth"'), "HC031V build label missing");
assert(telemetry.includes('blob.session.telemetry.v1.50'), "telemetry v1.50 missing");
assert(contract.parentBuildId === "HC-031U2.1", "contract parent must remain accepted U2.1");
assert(contract.scope === "presentation_and_read_only_telemetry_only", "V scope drifted from readability/telemetry-only");

const locked = contract.lockedMechanicsHashes ?? {};
const actual = {
  U21_TIMING: hash(extractTiming(alive)),
  updateReactiveEncounters: hash(extractMethod(alive, "updateReactiveEncounters")),
  updateReactiveEncounter: hash(extractMethod(alive, "updateReactiveEncounter")),
  updateCrossTerritoryEncounters: hash(extractMethod(alive, "updateCrossTerritoryEncounters")),
  startCrossTerritoryCycle: hash(extractMethod(alive, "startCrossTerritoryCycle")),
  interruptEncounter: hash(extractMethod(alive, "interruptEncounter")),
  rearmEncounter: hash(extractMethod(alive, "rearmEncounter"))
};
for (const [name, expected] of Object.entries(locked)) {
  assert(actual[name] === expected, `accepted U2.1 mechanics drifted: ${name}`);
}

for (const id of [
  "ambient_watcher_sweep",
  "ambient_relay_exchange",
  "reactive_watcher_stable_interrogation",
  "reactive_relay_held_intake",
  "cross_ridge_echo_return",
  "cross_matter_spill_return"
]) assert(alive.includes(id), `encounter identity missing: ${id}`);

for (const signature of Object.values(contract.responseSignatures ?? {}).flat()) {
  assert(alive.includes(signature), `cycle-legible response signature missing: ${signature}`);
}
assert(alive.includes("responseRead:"), "response readability frame-state publication missing");
assert(alive.includes("first_read_and_known_recurring_answers_reuse_existing_bodies_but_present_distinct_response_signatures"), "presentation-only response rule missing");
assert(alive.includes("newDrawCallIntent: 5"), "visual budget changed; V should reuse existing draw calls");
assert(hud.includes("RESP ${responseRead}"), "HUD latest-answer readout missing");
assert(guide.includes("changed visible signature"), "Guide recurrence-readability wording missing");

for (const token of [
  "semantic.meaningful_response",
  '"meaningful_response"',
  "meaningfulResponseDelta",
  "meaningfulResponseEvents",
  "meaningfulResponseAttempts",
  "semanticAnswerAge",
  "knownWorldAnswer"
]) assert(telemetry.includes(token), `telemetry truth token missing: ${token}`);
assert(telemetry.includes('addsInformationGain: false'), "known responses must not masquerade as new information");
assert(telemetry.includes('event.detail?.firstRead === false'), "recurring completion observer classification missing");
assert(telemetry.includes('event.detail?.firstRead !== false'), "first-read information-gain gate regressed");

for (const authority of ["progressionAuthority", "targetingAuthority", "movementAuthority", "collisionAuthority", "chemistryAuthority", "cellAuthority", "routeAuthority", "saveStateAuthority"]) {
  assert(alive.includes(`${authority}: false`), `${authority} must remain false`);
}

console.log("HC031V living response readability + telemetry truth validator PASS");
console.log("- U2.1 timing/latch/rearm/cross-cycle mechanics hash-locked");
console.log("- cycle-dependent Watcher/Relay/cross-territory response signatures present");
console.log("- known meaningful response separated from new information gain");
console.log("- attempt outcomes support information_gain / meaningful_response / no_gain");
