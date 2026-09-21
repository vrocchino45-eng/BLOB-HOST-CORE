import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031E2] ${message}`); };
const requireText = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };

const composer = read("src/visual/composers/ChemObjectVisualComposer.js");
const embodiment = read("src/player/CoreEmbodimentSystem.js");
const contact = read("src/player/CoreTendrilSurfaceContactSystem.js");
const grammar = read("src/visual/CoreTendrilVisualLanguage.js");
const runtime = read("src/core/GameRuntime.js");
const main = read("src/main.js");
const contract = JSON.parse(read("public/data/build/hc031e2UnifiedTendrilLanguageContract.json"));

[
  'family: "core_suction_tendril_v1"',
  "segmentTopRadius: 0.034",
  "segmentBottomRadius: 0.058",
  "rootRadius: 0.072",
  "closedSuckerBaseRadius: 0.072"
].forEach((token) => requireText(grammar, token, "shared visual grammar"));

[
  "player_seed_travel_tendril_",
  "createTendrilSegmentGeometry()",
  "createTendrilRootGeometry()",
  "createClosedSuckerGeometry()",
  'tendril.userData.tendrilState = "drift"',
  "legacyTrailingVeilRetired = true"
].forEach((token) => requireText(composer, token, "free-space tendril anatomy"));

if (composer.includes("new THREE.ConeGeometry(0.18 + index * 0.018")) {
  fail("legacy player trailing-veil cone geometry still exists");
}
if (composer.includes("player_seed_trailing_veil_")) {
  fail("legacy player trailing-veil object names still authored by composer");
}

[
  "animateTravelTendrils(t, speedWeight, slipStrength)",
  "const occupiedIndices = Array.isArray(contact.occupiedIndices)",
  "const limbReveal = freeReveal * (occupied ? 0.035 : 1)",
  'group.userData.tendrilState = occupied ? "handoff_to_contact" : "drift"',
  'sameAnatomyAcrossFreeAndContact: true',
  'legacyTrailingVeilGeometryRetired: true',
  'locomotionDrivenByTendrils: false'
].forEach((token) => requireText(embodiment, token, "state handoff"));

[
  'import { CORE_TENDRIL_VISUAL } from "../visual/CoreTendrilVisualLanguage.js"',
  "color: CORE_TENDRIL_VISUAL.shaftColor",
  "color: CORE_TENDRIL_VISUAL.suckerColor",
  "visualFamily: CORE_TENDRIL_VISUAL.family",
  "sameAnatomyAsFreeTravelTendrils: true",
  "occupiedIndices: this.tendrils",
  "locomotionDrivenByTendrils: false",
  "addsMovementForce: false",
  "addsCollider: false",
  "addsRaycast: false",
  "changesControls: false"
].forEach((token) => requireText(contact, token, "surface tendril visual-family contract"));

requireText(runtime, 'this.registry.register("coreTendrilSurfaceContactSystem", this.coreTendrilSurfaceContactSystem);', "runtime order/owner");
requireText(main, 'buildId: "HC-031E2"', "build identity");
if (contract.lockedTruth.tendrilCount !== 3) fail("three-tendril grammar changed");
if (contract.lockedTruth.locomotionDrivenByTendrils !== false) fail("locomotion authority leaked into visual pass");
if (contract.lockedTruth.visualFamily !== "core_suction_tendril_v1") fail("visual-family contract mismatch");

const locked = JSON.parse(read("public/data/build/hc031e2LockedParentHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  const actual = hash(rel);
  if (actual !== expected) fail(`locked parent owner changed: ${rel}`);
}

console.log(`[HC031E2] PASS — one three-tendril anatomy family across drift/contact + ${Object.keys(locked.files).length} locked parent owners.`);
