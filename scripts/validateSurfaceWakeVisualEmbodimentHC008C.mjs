import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const readText = (rel) => readFileSync(join(root, rel), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`[validateSurfaceWakeVisualEmbodimentHC008C] ${message}`);
};

const manifest = readJson("public/data/build/buildManifest.json");
const pkg = readJson("package.json");
const lock = readJson("package-lock.json");
const chem = readJson("public/data/chemistry/chemObjectRecipes.json");
const entities = readJson("public/data/ecology/entityRecipes.json");
const foldRecipe = readJson("public/data/opening/surfaceWakeLayeredInteractionRecipes.json")[0];

assert(
  (([["HC-008C", "0.0.105"], ["HC-008D", "0.0.106"], ["HC-008E", "0.0.107", "0.0.108"], ["HC-008F", "0.0.108"], ["HC-008G", "0.0.109"]].some(([id, version]) => manifest.id === id && manifest.version === version)) || (manifest.id === "HC-014G" && manifest.version === "0.0.140") || (manifest.id === "HC-014I" && manifest.version === "0.0.142")),
  "manifest identity mismatch"
);
assert(["0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(pkg.version) && ["0.0.105", "0.0.106", "0.0.107", "0.0.108", "0.0.109"].includes(lock.packages?.[""]?.version), "package identity mismatch");
assert(readText("index.html").includes(manifest.id), "browser title is stale");

const byId = (items, id) => items.find((item) => item.id === id);
const position = (item) => item?.spawn?.position ?? [0, 0, 0];
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const seed = byId(chem, "dormant_seed_nutrient_001");
const scar = byId(chem, "scar_contamination_plate_001");
const current = byId(chem, "flux_current_ribbon_001");
const signal = byId(chem, "signal_vapor_thread_001");
const tender = byId(entities, "nursery_membrane_tender_001");
const watcher = byId(entities, "membrane_watcher_001");
const fold = foldRecipe.geometry.anchor;

assert(distance(position(seed), position(tender)) < 1.2, "Tender must visibly occupy the protected seed pocket");
assert(distance(position(watcher), fold) < 1.9, "Watcher must anchor above the listening/wound side");
assert(distance(position(seed), position(scar)) > 4.5, "protected and wounded roles are still centrally overlapped");
assert(Math.abs(position(current)[2] - position(seed)[2]) > 2.4, "current lane and seed pocket lack spatial separation");
assert(distance(position(signal), fold) < 1.7, "signal thread must connect into the listening anatomy");

const entityComposer = readText("src/visual/composers/EntityVisualComposer.js");
const chemComposer = readText("src/visual/composers/ChemObjectVisualComposer.js");
const environmentComposer = readText("src/visual/composers/EnvironmentVisualComposer.js");
const motion = readText("src/visual/MotionSignatureSystem.js");
const ecology = readText("src/opening/SurfaceWakeEcologicalCausalitySystem.js");
const layered = readText("src/opening/SurfaceWakeLayeredInteractionSystem.js");
const orbiter = readText("src/ecology/OrbiterSystem.js");

for (const token of ["left_guarding_canopy", "right_guarding_canopy", "left_seed_guard_frond", "right_seed_guard_frond"]) {
  assert(entityComposer.includes(token), `Tender silhouette part missing: ${token}`);
}
assert(entityComposer.includes("dominant_watcher_pupil"), "Watcher lacks a dominant sensory lens");
assert(chemComposer.includes("TubeGeometry(curve") && chemComposer.includes("current_lane_filament"), "current is not a cross-chamber directional ribbon");
assert(environmentComposer.includes("nursery_protected_side_wall") && environmentComposer.includes("nursery_wounded_side_wall"), "nursery anatomy zones are missing");
assert(layered.includes("new THREE.SphereGeometry(radius, 24, 16, 0, Math.PI * 1.68)"), "Listening Fold is still a complete floating orbital body");
assert(orbiter.includes("interpreting_traveling_answer") && orbiter.includes("targetPosition = this.temp.set(-3.08"), "Guide does not relocate to interpret the Fold response");

for (const identity of ["soft_membrane_droplet", "current_carried_bead", "sharp_scar_edge_fragment"]) {
  assert(ecology.includes(identity), `mote visual identity missing: ${identity}`);
}
for (const identity of [
  "broad_cupped_seed_guardian",
  "single_lens_sensory_anchor",
  "small_folded_lantern_interpreter",
  "wall_embedded_receptive_membrane",
  "wall_embedded_hardened_rupture",
  "directional_cross_chamber_current_lane"
]) {
  assert(ecology.includes(identity), `role identity missing: ${identity}`);
}
assert(ecology.includes('pass: "HC-008C"') || ecology.includes('pass: "HC-008D"') || ecology.includes('pass: "HC-008E"') || ecology.includes('pass: "HC-008F"'), "F1 state does not preserve visual embodiment lineage");
assert(ecology.includes("permanentResonanceEffects: false"), "effect-discipline diagnostic is missing");
assert(motion.includes("warningHalo.material.opacity = warning ?") && motion.includes("safeRing.material.opacity = presented ?"), "warning and seed rings are not event-driven");
assert(motion.includes("ring.material.opacity = warning ? 0.08 : answering ? 0.52 : 0"), "Guide answering ring remains permanently active");

const timing = foldRecipe.timing;
assert(timing.approachHoldSeconds === 0.42, "Listening Fold approach timing changed");
assert(timing.sustainSeconds === 1.35, "Listening Fold sustain timing changed");
assert(timing.responseSeconds === 0.62, "Listening Fold response timing changed");
assert(timing.releaseSettleSeconds === 0.95, "Listening Fold settle timing changed");
assert(manifest.surfaceWakeTriggerOwners.join("|") === "SurfaceWakeLayeredInteractionSystem|BondSystem|LocalCellMorphSystem", "progression owners changed");

console.log("HC-008C Surface Wake visual embodiment validation passed.");
