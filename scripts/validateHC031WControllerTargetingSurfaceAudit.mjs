import fs from "node:fs";
import crypto from "node:crypto";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const bytes = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url));
const json = (path) => JSON.parse(read(path));
const assert = (condition, message) => { if (!condition) throw new Error(`[HC031W validate] ${message}`); };
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
  throw new Error(`[HC031W validate] unterminated method: ${name}`);
}

const pkg = json("package.json");
const contract = json("public/data/build/hc031wControllerTargetingSurfaceAuditContract.json");
const main = read("src/main.js");
const targeting = read("src/targeting/TargetingSystem.js");
const surfaceTruth = read("src/player/CoreSurfaceTruthSystem.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const hud = read("src/ui/PlaytestHudSystem.js");
const gathering = read("src/fields/GatheringGroundAliveSystem.js");

assert(pkg.version === "0.31.53", `expected package 0.31.53, got ${pkg.version}`);
assert(main.includes('buildId: "HC-031W"'), "HC031W build ID missing");
assert(main.includes('buildLabel: "Controller / Targeting / Surface Interaction Audit"'), "HC031W build label missing");
assert(telemetry.includes('blob.session.telemetry.v1.51'), "telemetry v1.51 missing");
assert(contract.parentBuildId === "HC-031V", "W parent must be accepted V");
assert(contract.mode === "audit_only" && contract.behaviorChangesAllowed === false, "W must remain audit-only");

const sources = { TargetingSystem: targeting, CoreSurfaceTruthSystem: surfaceTruth };
for (const [key, expected] of Object.entries(contract.lockedBehaviorMethodHashes ?? {})) {
  const [className, methodName] = key.split(".");
  const actual = hash(extractMethod(sources[className], methodName));
  assert(actual === expected, `behavior method drifted: ${key}`);
}
for (const [path, expected] of Object.entries(contract.lockedFileHashes ?? {})) {
  assert(hash(bytes(path)) === expected, `locked file drifted: ${path}`);
}

for (const token of [
  "controllerTargetingAudit",
  "stabilizeBlocksRedirectEvidence",
  "stabilize_protects_old_attention_during_rs_redirect",
  "relationshipBeyondAssistRange",
  "rightStickMagnitude",
  "stabilizeTriggerValue"
]) assert(targeting.includes(token), `targeting audit token missing: ${token}`);
for (const token of [
  "surfaceCapabilityAudit",
  "authoredSurfaceCount",
  "profileCounts",
  "no_authored_crawlable_surfaces_in_active_cell"
]) assert(surfaceTruth.includes(token), `surface audit token missing: ${token}`);
for (const token of contract.telemetryEvents ?? []) assert(telemetry.includes(token), `telemetry audit event missing: ${token}`);
assert(hud.includes("W CTL LT") && hud.includes("SURF ${surfaceCapabilityAudit.authoredSurfaceCount"), "W HUD audit readout missing");

assert(!gathering.includes("applyCrawlableSurfaceMetadata"), "W must not silently add Gathering Ground crawlable surfaces");
assert(!gathering.includes("crawlableSurfaceProfileId"), "W Gathering Ground surface authoring drifted");

console.log("HC031W controller / targeting / surface interaction audit validator PASS");
console.log("- accepted targeting selection + relationship methods hash-locked");
console.log("- InputSystem, movement, Gathering Ground ecology, and surface profiles hash-locked");
console.log("- LT/RS target-chain audit + active-cell surface coverage observability present");
console.log("- W authors zero new Gathering Ground contact surfaces");
