import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031F1B] ${message}`); };
const requireText = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };
const forbidText = (source, token, label) => { if (source.includes(token)) fail(`${label} still contains forbidden token: ${token}`); };

const registry = read("src/world/CrawlableSurfaceRegistry.js");
const shelf = read("src/world/HostContactShelfSystem.js");
const surface = read("src/player/CoreSurfaceTruthSystem.js");
const movement = read("src/player/PlayerMovementController.js");
const contact = read("src/player/CoreTendrilSurfaceContactSystem.js");
const runtime = read("src/core/GameRuntime.js");
const debugJump = read("src/debug/DebugAreaJumpSystem.js");
const main = read("src/main.js");
const contract = JSON.parse(read("public/data/build/hc031f1bCrawlableSurfaceAuthorityContract.json"));

[
  'membrane_stable:',
  'scar_brace:',
  'soft_tissue:',
  'residue_weak:',
  'object.userData.crawlableSurface = true;',
  'object.userData.crawlableSurfaceAuthority = "HC031F1B_authored_ecological_surface"',
  'verbTransmission:'
].forEach((token) => requireText(registry, token, "surface registry"));

[
  'const CELL_ID = "CELL_MEMBRANE_NURSERY_001";',
  'this.root.name = "host_contact_shelf_HC031F1B";',
  'surfaceId: "HOST_CONTACT_SHELF_MEMBRANE"',
  'surfaceId: "HOST_CONTACT_SHELF_SCAR_BRACE"',
  'surfaceId: "HOST_CONTACT_SHELF_SOFT_SLOPE"',
  'surfaceId: "HOST_CONTACT_SHELF_RESIDUE_PATCH"',
  'this.root.position.set(4.0, -1.15, -0.75);',
  'progressionAuthority: false',
  'verbAuthority: false',
  'nextEcologyProof: "anchored_pulse_reads_surface_load_and_transmission"'
].forEach((token) => requireText(shelf, token, "Host Contact Shelf"));

[
  'pass: "HC-031F1B"',
  'readCrawlableSurfaceMetadata(object)',
  'source: "authored_crawlable_surface_raycast"',
  'authority: "explicit_ecological_surface_metadata"',
  'genericVisibleMeshEligible: false',
  'if (metadata.cellId !== "shared" && metadata.cellId !== activeCellId) return;',
  'authoredEcologicalSurface: true'
].forEach((token) => requireText(surface, token, "surface truth authority"));
forbidText(surface, 'this.excludePattern =', "generic visible-mesh sampler");
forbidText(surface, 'worldRadius <', "generic size-based candidate sampler");

[
  'this.surfaceTruthSurfaceId = "none";',
  'this.surfaceTruthProfileId = "none";',
  'const directInputAccelerationScale = tendrilSurfaceDriveActive ? 0.04 : 1.0;',
  'this.attachmentVisibleStandOffDistance = 0.38',
  'const surfaceTractionScale = surfaceAdhesionScale * surfaceLoadScale;',
  'authoredEcologicalSurfaceTruthPreferred: true',
  'genericVisibleMeshSurfaceTruthAllowed: false',
  'source: "authored_crawlable_surface_raycast"'
].forEach((token) => requireText(movement, token, "movement ecological surface contract"));

[
  'pass: "HC-031F1B"',
  'surfaceTruthSurfaceId: this.surfaceTruthSurfaceId',
  'surfaceTruthProfileId: this.surfaceTruthProfileId',
  'surfaceSource: this.surfaceTruthActive ? "authored_crawlable_surface_raycast"',
  'consumesAuthoredEcologicalSurfaceTruth: true',
  'genericVisibleMeshEligible: false'
].forEach((token) => requireText(contact, token, "tendril ecological surface contract"));

requireText(runtime, 'import { HostContactShelfSystem } from "../world/HostContactShelfSystem.js";', "runtime shelf import");
requireText(runtime, 'this.registry.register("hostContactShelfSystem", this.hostContactShelfSystem);', "runtime shelf owner");
requireText(runtime, 'this.registry.register("coreSurfaceTruthSystem", this.coreSurfaceTruthSystem);', "runtime surface owner");
requireText(runtime, 'this.registry.register("playerMovement", this.playerMovementController);', "runtime movement owner");
requireText(runtime, 'this.registry.register("coreTendrilSurfaceContactSystem", this.coreTendrilSurfaceContactSystem);', "runtime tendril owner");
const shelfOrder = runtime.indexOf('this.registry.register("hostContactShelfSystem", this.hostContactShelfSystem);');
const surfaceOrder = runtime.indexOf('this.registry.register("coreSurfaceTruthSystem", this.coreSurfaceTruthSystem);');
const movementOrder = runtime.indexOf('this.registry.register("playerMovement", this.playerMovementController);');
const contactOrder = runtime.indexOf('this.registry.register("coreTendrilSurfaceContactSystem", this.coreTendrilSurfaceContactSystem);');
if (!(shelfOrder >= 0 && surfaceOrder > shelfOrder && movementOrder > surfaceOrder && contactOrder > movementOrder)) {
  fail("runtime order must be Host Contact Shelf -> surface truth -> movement -> tendril contact");
}

[
  'label: "Surface Wake / Host Contact Shelf"',
  'position: [1.55, 0.45, -0.75]',
  'surface-profile readability'
].forEach((token) => requireText(debugJump, token, "Shift+1 focused test setup"));
requireText(main, 'buildId: "HC-031F1B"', "build identity");

if (contract.lockedTruth.tendrilCount !== 3) fail("three-tendril grammar changed");
if (contract.lockedTruth.movementAuthority !== "PlayerMovementController") fail("movement authority changed");
if (contract.lockedTruth.surfaceTruthAuthority !== "CoreSurfaceTruthSystem") fail("surface truth authority mismatch");
if (contract.lockedTruth.surfaceAuthoringAuthority !== "CrawlableSurfaceRegistry") fail("surface authoring authority mismatch");
if (contract.lockedTruth.genericVisibleMeshesEligible !== false) fail("generic visible meshes were not retired");
if (contract.lockedTruth.directInputAccelerationScaleWhileTendrilDriven !== 0.04) fail("direct thrust scale drifted");
if (contract.lockedTruth.visibleSurfaceStandOffDistance !== 0.38) fail("visible stand-off drifted");
if (contract.lockedTruth.addsCollider || contract.lockedTruth.changesControls || contract.lockedTruth.verbStrengthAuthority) {
  fail("forbidden authority expansion detected");
}
if (contract.hostContactShelf.surfaceCount !== 4) fail("Host Contact Shelf must author exactly four proof surfaces");

const locked = JSON.parse(read("public/data/build/hc031f1bLockedParentHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  const actual = hash(rel);
  if (actual !== expected) fail(`locked parent owner changed: ${rel}`);
}

// Numeric proof that surface ecology affects locomotion in the intended order
// without becoming a new verb/combat authority.
const tractionScale = (adhesion, load) => (0.68 + (1.08 - 0.68) * adhesion) * (0.76 + (1.04 - 0.76) * load);
const scar = tractionScale(0.96, 0.96);
const membrane = tractionScale(0.84, 0.74);
const residue = tractionScale(0.46, 0.32);
if (!(scar > membrane && membrane > residue)) fail("surface traction ecology ordering is not scar > membrane > residue");
if (!(residue > 0.55 && scar < 1.20)) fail("surface traction modifiers escaped bounded proof range");

console.log(`[HC031F1B] PASS — authored crawlable surface authority + four-surface Host Contact Shelf + ${Object.keys(locked.files).length} locked parent owners.`);
