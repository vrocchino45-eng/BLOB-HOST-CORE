import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";

const read = (rel) => fs.readFileSync(rel, "utf8");
const json = (rel) => JSON.parse(read(rel));
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(rel)).digest("hex");

const main = read("src/main.js");
const engine = read("src/player/CoreEngineSystem.js");
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const input = read("src/input/InputSystem.js");
const pkg = json("package.json");
const identity = json("public/data/build/currentBuildIdentity_HC028C1.json");
const contract = json("public/data/build/hc028c1PhaseArchitectureReadabilityContract.json");
const lockedHashes = json("public/data/build/hc028c1LockedOwnerHashes.json");

assert.match(main, /buildId:\s*"HC-028C1"/);
assert.match(main, /Phase Architecture Visual Readability/);
assert.equal(pkg.version, "0.28.4");
assert.equal(identity.parent, "HC-028C");
assert.equal(identity.sourceJsCount, 94);
assert.equal(contract.sequenceOwner, "CoreEngineSystem");
assert.equal(contract.visualOwner, "CoreEmbodimentSystem");
assert.deepEqual(contract.architectures.map((entry) => entry.phaseCount), [3, 6, 12]);
assert.deepEqual(contract.architectures.map((entry) => entry.silhouette), ["triangle", "hexagon", "dodecagon"]);
assert.equal(contract.locked.engineSequencingChanged, false);
assert.equal(contract.locked.rpmLawChanged, false);
assert.equal(contract.locked.debugCycleKey, "O");
assert.equal(contract.locked.gameplayAuthority, false);

// The authoritative engine law remains exactly the HC027B 3 -> 6 -> 12 system.
for (const token of [
  'const FUNCTIONS = ["pulse", "absorb", "stabilize"]',
  'const ARCHITECTURE_ORDER = [3, 6, 12]',
  'one_phase_per_function',
  'paired_counterpart_phases_per_function',
  'four_phase_resolution_per_function',
  'architectureDebugCycleCommand: "O"',
  'gameplayAuthority: false',
  'progressionAuthority: false'
]) assert.ok(engine.includes(token), `locked engine law missing: ${token}`);
assert.match(input, /event\.code === "KeyO"/);

// HC028C1 is a silhouette/readability pass, not a new physiology system.
for (const token of [
  'visualGrammar = "triangle_to_hexagon_to_dodecagon"',
  'new THREE.SphereGeometry(0.058, 10, 8)',
  'new THREE.LineLoop',
  'grammar = "3_triangle_6_hexagon_12_dodecagon"',
  'phaseCount === 3 ? 0.255 : phaseCount === 6 ? 0.315 : 0.385',
  'phaseCount === 3 ? 1.34 : phaseCount === 6 ? 1.13 : 0.96',
  'this.coreEngineArchitectureChangeAge / 0.72',
  'worldScaleReadable: true',
  '"triangle"',
  '"hexagon"',
  '"dodecagon"'
]) assert.ok(embodiment.includes(token), `visual readability law missing: ${token}`);

// Locked systems from HC028C must remain byte-identical.
for (const [file, expected] of Object.entries(lockedHashes.files)) {
  assert.equal(hash(file), expected, `locked HC028C owner changed: ${file}`);
}

const jsFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith(".js")) jsFiles.push(full);
  }
};
walk("src");
assert.equal(jsFiles.length, 94, "HC028C1 must not add another runtime source module");

console.log("HC028C1 Phase Architecture Visual Readability: PASS");
console.log(JSON.stringify({
  build: identity.id,
  runtimeSourceCount: jsFiles.length,
  silhouettes: contract.architectures.map((entry) => `${entry.phaseCount}:${entry.silhouette}`),
  architectureChangeBloomSeconds: contract.readability.architectureChangeBloomSeconds,
  engineSequencingChanged: contract.locked.engineSequencingChanged,
  debugCycleKey: contract.locked.debugCycleKey
}, null, 2));
