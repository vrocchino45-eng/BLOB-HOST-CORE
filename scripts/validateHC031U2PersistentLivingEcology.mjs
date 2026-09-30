import fs from "node:fs";
import crypto from "node:crypto";

const read = (p) => fs.readFileSync(p, "utf8");
const json = (p) => JSON.parse(read(p));
const assert = (condition, message) => { if (!condition) throw new Error(`[HC031U2] ${message}`); };
const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const pkg = json("package.json");
const contract = json("public/data/build/hc031u2PersistentLivingEcologyContract.json");
const locked = json("public/data/build/hc031u2LockedParentHashes.json");
const main = read("src/main.js");
const alive = read("src/fields/GatheringGroundAliveSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");
const guide = read("src/guide/GuidePromptSystem.js");

assert(pkg.version === "0.31.50", `package version should be 0.31.50, got ${pkg.version}`);
assert(main.includes('buildId: "HC-031U2"'), "main buildId is not HC-031U2");
assert(main.includes('buildLabel: "Gathering Ground Persistent Living Ecology + Encounter Pacing"'), "U2 build label missing");
assert(contract.telemetrySchema === "blob.session.telemetry.v1.48", "contract telemetry schema mismatch");
assert(telemetry.includes('blob.session.telemetry.v1.48'), "telemetry implementation should be v1.48");

for (const id of [
  "ambient_watcher_sweep",
  "ambient_relay_exchange",
  "reactive_watcher_stable_interrogation",
  "reactive_relay_held_intake",
  "cross_ridge_echo_return",
  "cross_matter_spill_return"
]) assert(alive.includes(id), `encounter identity missing: ${id}`);

assert((alive.match(/family: "ambient"/g) ?? []).length === 2, "ambient encounter count drifted from 2");
assert((alive.match(/family: "reactive"/g) ?? []).length === 2, "reactive encounter count drifted from 2");
assert((alive.match(/family: "cross_territory"/g) ?? []).length === 2, "cross-territory encounter count drifted from 2");

for (const token of [
  "watcherResponseSeconds: 2.4",
  "relayResponseSeconds: 2.8",
  "responseBreakGraceSeconds: 0.28",
  "responseRetryBackoffSeconds: 1.2",
  "watcherRecurrenceCooldownSeconds: 8.0",
  "relayRecurrenceCooldownSeconds: 10.0",
  "release_plus_cooldown_rearmed_relationship",
  "understood_relationship_answered_again",
  "ongoingResponseCycles",
  'mode: "quiet_observer"',
  '"coherent"',
  '"guarded"'
]) assert(alive.includes(token), `persistent ecology token missing: ${token}`);

assert(!alive.includes("watcherReactive.progress01 = 1"), "Watcher reactive response still instant-completes");
assert(!alive.includes("relayReactive.progress01 = 1"), "Relay reactive response still instant-completes");
assert(alive.includes("encounter.activeSeconds += dt"), "sustained response accumulation missing");
assert(alive.includes("this.interruptEncounter"), "response interruption path missing");
assert(alive.includes("this.rearmEncounter"), "relationship rearm path missing");
assert(alive.includes("source.completionCount <= encounter.sourceCompletionCount"), "recurrent cross-territory source-cycle gate missing");

for (const authority of [
  "progressionAuthority",
  "targetingAuthority",
  "movementAuthority",
  "collisionAuthority",
  "chemistryAuthority",
  "cellAuthority",
  "routeAuthority",
  "saveStateAuthority"
]) assert(alive.includes(`${authority}: false`), `${authority} must remain false`);

assert(hud.includes("LOOP ${gatheringGroundAlive.ongoingResponseCycles"), "HUD LOOP readout missing");
assert(hud.includes("MEM ${gatheringGroundAlive.memory?.mode"), "HUD memory readout missing");
assert(guide.includes("understood relationships can answer again"), "Guide persistent-ecology explanation missing");
assert(telemetry.includes("gatheringGroundEncounterRecurrences"), "recurrence telemetry summary missing");
assert(telemetry.includes("gatheringGroundMemoryChanges"), "memory telemetry summary missing");
assert(telemetry.includes("ongoingResponseCycles"), "movement snapshot LOOP truth missing");
assert(telemetry.includes("memoryMode"), "movement snapshot memory truth missing");
assert(telemetry.includes("event.detail?.firstRead !== false"), "recurrent completions should not masquerade as first-read information gain");

for (const [path, expected] of Object.entries(locked.files ?? {})) {
  assert(fs.existsSync(path), `locked parent file missing: ${path}`);
  assert(sha(path) === expected, `locked T6/U1 owner drifted: ${path}`);
}

console.log("HC031U2 persistent living ecology structural validation PASS");
console.log("- six original encounter identities retained");
console.log("- sustained reactive response + interruption + retry wired");
console.log("- release/cooldown recurrence + cross-territory replay wired");
console.log("- LOOP/MEM telemetry and HUD truth wired");
console.log("- T6 movement/targeting/Ridge/route owners hash-locked");
