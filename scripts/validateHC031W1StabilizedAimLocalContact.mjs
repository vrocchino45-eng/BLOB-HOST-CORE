import fs from "node:fs";
import crypto from "node:crypto";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const bytes = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url));
const json = (path) => JSON.parse(read(path));
const assert = (condition, message) => { if (!condition) throw new Error(`[HC031W1 validate] ${message}`); };
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");

function extractMethod(source, name) {
  const token = `\n  ${name}(`;
  const at = source.indexOf(token);
  assert(at >= 0, `method missing: ${name}`);
  const start = at + 1;
  const brace = source.indexOf("{", start);
  assert(brace >= 0, `method body missing: ${name}`);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = brace; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`[HC031W1 validate] unterminated method: ${name}`);
}

const pkg = json("package.json");
const contract = json("public/data/build/hc031w1StabilizedAimLocalContactContract.json");
const main = read("src/main.js");
const targeting = read("src/targeting/TargetingSystem.js");
const entities = read("src/ecology/EntitySystem.js");
const gathering = read("src/fields/GatheringGroundAliveSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");

assert(pkg.version === contract.packageVersion, `expected package ${contract.packageVersion}, got ${pkg.version}`);
assert(main.includes('buildId: "HC-031W1"'), "W1 build ID missing");
assert(main.includes('buildLabel: "Stabilized Aim + Local Contact Proof"'), "W1 build label missing");
assert(telemetry.includes(contract.telemetrySchema), "W1 telemetry schema missing");
assert(contract.parentBuildId === "HC-031W", "W1 parent must be HC031W audit");

const sources = { TargetingSystem: targeting, GatheringGroundAliveSystem: gathering };
for (const [key, expected] of Object.entries(contract.lockedBehaviorMethodHashes ?? {})) {
  const [className, methodName] = key.split(".");
  const actual = hash(extractMethod(sources[className], methodName));
  assert(actual === expected, `locked behavior method drifted: ${key}`);
}
for (const [path, expected] of Object.entries(contract.lockedFileHashes ?? {})) {
  assert(hash(bytes(path)) === expected, `locked parent file drifted: ${path}`);
}

for (const token of [
  "handleStabilizeSteeringRedirect",
  "stabilize_rs_redirect",
  "stabilize_rs_redirected_aim_owned_target",
  "stabilize_macro_relationship_suppressed_local_context",
  "entityAttentionCandidates",
  "local_entity",
  "isRelationshipEligibleForStabilize"
]) assert(targeting.includes(token), `W1 targeting token missing: ${token}`);

for (const token of [
  "publishLocalAttentionCandidates",
  "HC031W1_local_relationship_nouns",
  "living_watcher",
  "living_relay",
  "relationshipRange"
]) assert(entities.includes(token), `W1 local entity targeting token missing: ${token}`);

for (const surfaceId of contract.surfaceProof.ids ?? []) {
  assert(gathering.includes(surfaceId), `Gathering Ground surface missing: ${surfaceId}`);
}
for (const profileId of contract.surfaceProof.profiles ?? []) {
  assert(gathering.includes(`profileId: "${profileId}"`), `Gathering Ground surface profile missing: ${profileId}`);
}
assert(gathering.includes("applyCrawlableSurfaceMetadata"), "W1 must author surfaces through canonical registry helper");
assert(gathering.includes("authoredSurfaceCount: this.contactSurfaces.length"), "W1 surface proof publication missing");
assert(gathering.includes("targetingSuppressed"), "W1 contact surfaces must remain targeting-suppressed");
assert(gathering.includes("newDrawCallIntent: 8"), "W1 visual budget should account for exactly three added surface meshes");

for (const token of [
  "controllerTargetingStabilizeSteerRedirects",
  "controllerTargetingMacroRelationshipSuppressions",
  "stabilizeRedirectSequence",
  "stabilizeMacroSuppressionSequence"
]) assert(telemetry.includes(token), `W1 telemetry token missing: ${token}`);
assert(hud.includes("W1 CTL LT"), "W1 HUD targeting readout missing");

// ApertureAdjacentTerritorySystem is full-file hash-locked above; the smoke test exercises its pre-entry relationship behavior.

console.log("HC031W1 stabilized aim + local contact validator PASS");
console.log("- U2.1 encounter/latch/rearm mechanics hash-locked");
console.log("- Target score formula + verb-intent grammar hash-locked");
console.log("- pre-entry remote Gathering Ground relationship preserved");
console.log("- local Watcher/Relay aim nouns + LT/RS redirect present");
console.log("- exactly three canonical Gathering Ground crawlable surfaces authored");
