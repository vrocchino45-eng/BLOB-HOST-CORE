import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
const fail = (message) => { throw new Error(`[HC031I] ${message}`); };
const need = (source, token, label) => { if (!source.includes(token)) fail(`${label} missing: ${token}`); };
const forbid = (source, token, label) => { if (source.includes(token)) fail(`${label} forbidden: ${token}`); };

const shelf = read("src/world/HostContactShelfSystem.js");
const ecology = read("src/world/HostContactEcologyContinuationSystem.js");
const runtime = read("src/core/GameRuntime.js");
const telemetry = read("src/core/SessionTelemetrySystem.js");
const movement = read("src/player/PlayerMovementController.js");
const tendril = read("src/player/CoreTendrilSurfaceContactSystem.js");
const support = read("src/player/CoreTendrilSupportPlaneSystem.js");
const projection = read("src/interaction/StabilizedProjectionSystem.js");
const main = read("src/main.js");
const contract = JSON.parse(read("public/data/build/hc031iHostContactEcologyContinuationContract.json"));

[
  'HOST_CONTACT_CONTINUATION_MEMBRANE_01',
  'HOST_CONTACT_CONTINUATION_MEMBRANE_02',
  'HOST_CONTACT_CONTINUATION_SCAR_BRACE_01',
  'HOST_CONTACT_CONTINUATION_SCAR_BRACE_02',
  'HOST_CONTACT_CONTINUATION_RESIDUE_01',
  'HOST_CONTACT_CONTINUATION_RESIDUE_02',
  'ecologyRole: "living_membrane_path"',
  'ecologyRole: "scar_load_buttress"',
  'ecologyRole: "residue_yield_field"',
  'ecologicalLaw: "same_body_grammar_different_host_material_answer"'
].forEach((token) => need(shelf, token, "authored ecology continuation"));

[
  'HostContactEcologyContinuationSystem',
  'responseShellsAffectContactTruth: false',
  'regionalHistoryAuthority: false',
  'progressionAuthority: false',
  'movementAuthority: false',
  'attachmentAuthority: false',
  'verbStrengthAuthority: false',
  'targetingAuthority: false',
  'membrane_carrying_core_load',
  'scar_bearing_focused_recoil',
  'residue_yielding_under_focused_recoil',
  'residue_temporarily_cohering'
].forEach((token) => need(ecology, token, "ecology response system"));

forbid(ecology, 'playerRoot.position.', "ecology movement ownership");
forbid(ecology, 'frameState.input', "new input coupling");
forbid(ecology, 'new THREE.Raycaster', "new contact raycast");

need(runtime, 'import { HostContactEcologyContinuationSystem }', "runtime import");
need(runtime, 'this.hostContactEcologyContinuationSystem = new HostContactEcologyContinuationSystem', "runtime creation");
need(runtime, 'this.registry.register("hostContactEcologyContinuationSystem"', "runtime registration");
if (runtime.indexOf('this.registry.register("stabilizedProjectionSystem"') > runtime.indexOf('this.registry.register("hostContactEcologyContinuationSystem"')) {
  fail("ecology response must run after StabilizedProjectionSystem");
}

[
  'hostContactEcologySurfaceId:',
  'hostContactEcologyRole:',
  'hostContactEcologyResponseMode:',
  'hostContactMembraneCarry01:',
  'hostContactScarBrace01:',
  'hostContactResidueYield01:',
  'hostContactResidueCohesion01:'
].forEach((token) => need(telemetry, token, "telemetry proof"));

[
  'this.authoredSuctionSupportGrace = 0.22',
  'governingContactLaw: "surface_truth_authorizes_seal_anchor_carries_identity_and_support_plane_drives_physical_contact"'
].forEach((token) => need(movement, token, "H3 movement lock"));
need(tendril, 'anchorSurface: this.createSurfaceRelation()', "anchor-carried identity lock");
need(support, 'source: "sealed_anchor_carried_surface_identity"', "support-plane lock");
need(projection, 'contactIntegrationPass: "HC-031H3"', "brace continuity lock");
need(projection, 'requiresSurfaceAnchor: false', "free-space focused projection lock");
need(main, 'buildId: "HC-031I"', "build identity");

if (contract.continuation?.hardGate !== false) fail("continuation introduced a hard gate");
if (contract.continuation?.newAbility !== false) fail("continuation introduced a new ability");
if (contract.responseShells?.affectContactTruth !== false) fail("response shells can affect contact truth");
if (contract.localImprint?.regionalHistoryAuthority !== false) fail("local imprint became regional history authority");
if (contract.lockedTruth?.tendrilLocomotionChanged !== false) fail("tendril locomotion changed by contract");
if (contract.lockedTruth?.braceContinuityChanged !== false) fail("brace continuity changed by contract");

const locked = JSON.parse(read("public/data/build/hc031iLockedParentHashes.json"));
for (const [rel, expected] of Object.entries(locked.files)) {
  if (hash(rel) !== expected) fail(`locked H3 owner changed: ${rel}`);
}

console.log(`[HC031I] PASS — authored membrane/scar/residue ecology continuation responds to locked H3 contact grammar; ${Object.keys(locked.files).length} parent owners locked.`);
