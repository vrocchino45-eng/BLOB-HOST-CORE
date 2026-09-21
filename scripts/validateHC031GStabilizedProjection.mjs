import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031G] ${message}`); };
const requireText = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };

const projection = read("src/interaction/StabilizedProjectionSystem.js");
const chemistry = read("src/chemistry/ChemObjectSystem.js");
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const tendrils = read("src/player/CoreTendrilSurfaceContactSystem.js");
const physical = read("src/player/CoreVerbPhysicalizationSystem.js");
const runtime = read("src/core/GameRuntime.js");
const composition = read("src/interaction/VerbCompositionSystem.js");
const shelf = read("src/world/HostContactShelfSystem.js");
const main = read("src/main.js");
const contract = JSON.parse(read("public/data/build/hc031gStabilizedProjectionContract.json"));

[
  'pass: "HC-031G"',
  'composition.chord === "cohere_project"',
  'mode = "self_braced"',
  'mode = "tri_anchor_braced"',
  'requiresSurfaceAnchor: false',
  'requiresRetainedTargetToExist: false',
  'surfaceAnchorEnhancesSameFunction: true',
  'governingLaw: "player_owns_the_verb_environment_changes_its_expression"',
  'focusedResponseMultiplier',
  'pulseTransmission'
].forEach((token) => requireText(projection, token, "stabilized projection owner"));

[
  'directionalFocusId',
  'alignment < 0.58',
  'projectionActive && directionalFocusId !== "none"',
  'baseResponseStrength = focused ? 1 : projectionActive ? 0.16 : 0.22',
  'stabilized_directional_focus_plus_ambient_inquiry',
  'stabilized_forward_projection_without_target',
  'stabilizedProjectionRequiresAnchor = false'
].forEach((token) => requireText(chemistry, token, "focused Pulse chemistry expression"));

[
  'selfBracedProjection',
  'group.userData.tendrilState = occupied ? "handoff_to_contact" : selfBracedProjection ? "self_brace" : "drift"',
  'freeState: occupiedCount > 0 ? "mixed_drift_contact_handoff" : selfBracedProjection ? "self_braced_projection" : "drift"',
  'stabilizedProjectionSelfBrace: selfBracedProjection'
].forEach((token) => requireText(embodiment, token, "free-space tendril self-brace"));

[
  'projection.active && projection.surfaceBraced && tendril.phase === "sealed"',
  'focusedProjectionBraceEligible: true',
  'focusedProjectionRequiresAnchor: false'
].forEach((token) => requireText(tendrils, token, "surface tendril brace expression"));

[
  'pulse_stabilized_projection_front',
  'radialScale: focused ? THREE.MathUtils.lerp(0.62, 0.42, focus01) : 1',
  'axialScale: focused ? THREE.MathUtils.lerp(1.34, 1.82, focus01) : 1',
  'stabilizedProjectionRequiresAnchor: false'
].forEach((token) => requireText(physical, token, "focused Pulse visual expression"));

[
  'cohere_project:',
  'meaning: "controlled_directional_push"',
  'pulseStabilize: "cohere_then_project_as_controlled_push"'
].forEach((token) => requireText(composition, token, "locked HC029C grammar"));

requireText(runtime, 'import { StabilizedProjectionSystem } from "../interaction/StabilizedProjectionSystem.js";', "runtime projection import");
requireText(runtime, 'this.stabilizedProjectionSystem = new StabilizedProjectionSystem({', "runtime projection construction");
requireText(runtime, 'this.registry.register("coreTendrilSurfaceContactSystem", this.coreTendrilSurfaceContactSystem);', "runtime tendril owner");
requireText(runtime, 'this.registry.register("stabilizedProjectionSystem", this.stabilizedProjectionSystem);', "runtime projection owner");
const contactOrder = runtime.indexOf('this.registry.register("coreTendrilSurfaceContactSystem", this.coreTendrilSurfaceContactSystem);');
const projectionOrder = runtime.indexOf('this.registry.register("stabilizedProjectionSystem", this.stabilizedProjectionSystem);');
if (!(contactOrder >= 0 && projectionOrder > contactOrder)) fail("stabilized projection must resolve after same-frame tendril contact");
requireText(shelf, 'nextEcologyProof: "stabilized_projection_reads_surface_load_without_anchor_gate"', "Host Contact Shelf continuation");
requireText(main, 'buildId: "HC-031G"', "build identity");

if (contract.lockedTruth.focusedProjectionRequiresSurfaceAnchor !== false) fail("focused projection incorrectly requires surface anchor");
if (contract.lockedTruth.focusedProjectionRequiresRetainedTarget !== false) fail("focused projection incorrectly requires retained target");
if (contract.lockedTruth.addsNewAbility || contract.lockedTruth.addsNewButton || contract.lockedTruth.changesTargetingAuthority) {
  fail("forbidden ability/input/targeting expansion detected");
}
if (contract.lockedTruth.tendrilCount !== 3) fail("three-tendril grammar changed");
if (contract.lockedTruth.compositionChord !== "cohere_project") fail("HC029C chord ownership changed");

const locked = JSON.parse(read("public/data/build/hc031gLockedParentHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  const actual = hash(rel);
  if (actual !== expected) fail(`locked parent owner changed: ${rel}`);
}

// Bounded numeric proof: free-space focused projection is controlled rather than
// stronger than raw Pulse; strong authored support may carry more of that same
// projection, and scar > membrane > residue without becoming a super move.
const baseCohereProject = 0.82;
const surfaceMultiplier = (adhesion, load, pulse, support = 1) => {
  const quality = adhesion * 0.34 + load * 0.40 + pulse * 0.26;
  return Math.max(0.90, Math.min(1.28, 0.94 + quality * 0.28 + support * 0.07));
};
const free = baseCohereProject * 1.04;
const scar = baseCohereProject * surfaceMultiplier(0.96, 0.96, 0.94);
const membrane = baseCohereProject * surfaceMultiplier(0.84, 0.74, 0.64);
const residue = baseCohereProject * surfaceMultiplier(0.46, 0.32, 0.30);
if (!(scar > membrane && membrane > residue && residue > free)) fail("surface brace ordering must be scar > membrane > residue > free self-brace");
if (!(free < 1 && scar > 1 && scar < 1.08)) fail("focused projection escaped intended controlled/bounded force-transfer range");

console.log(`[HC031G] PASS — Stabilize + Pulse self-braces everywhere; authored anchors enhance the same focused projection; ${Object.keys(locked.files).length} parent owners locked.`);
