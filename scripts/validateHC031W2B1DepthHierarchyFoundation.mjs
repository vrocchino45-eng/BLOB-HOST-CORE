import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const gameplay = read("../src/morph/GuideThresholdGameplaySystem.js");
const layered = read("../src/morph/GuideThresholdLayeredInteractionSystem.js");
const hub = read("../src/hub/HubChamberFoundationSystem.js");
const surface = read("../src/opening/SurfaceWakeEcologicalCausalitySystem.js");

assert.match(gameplay, /W2B1_SUPPORT_STRAND_OPACITY_MULTIPLIER = 0\.58/);
assert.match(gameplay, /W2B1_SUPPORT_MOTE_OPACITY_MULTIPLIER = 0\.72/);
assert.match(gameplay, /visualHierarchyPolicy: "local_actionable_pressure_and_convergence_over_full_path_additive_support"/);
assert.match(gameplay, /visualHierarchyRole = "local_actionable_pressure_body"/);
assert.match(gameplay, /visualHierarchyRole = "local_actionable_focus"/);

assert.match(layered, /W2B1_LAYERED_STRAND_OPACITY_MULTIPLIER = 0\.56/);
assert.match(layered, /W2B1_LAYERED_MOTE_OPACITY_MULTIPLIER = 0\.72/);
assert.match(layered, /W2B1_LAYERED_LIGHT_INTENSITY_MULTIPLIER = 0\.62/);
assert.match(layered, /visualHierarchyPolicy: "focus_settling_bodies_and_core_guide_over_full_path_additive_support"/);
assert.match(layered, /visualHierarchyRole = "local_actionable_settling_body"/);
assert.match(layered, /visualHierarchyRole = "local_actionable_focus"/);

assert.match(hub, /W2B1_FOREGROUND_TISSUE_OPACITY_MULTIPLIER = 0\.48/);
assert.match(hub, /W2B1_FOREGROUND_DRIFT_OPACITY_MULTIPLIER = 0\.55/);
assert.match(hub, /W2B1_MIDDLE_DRIFT_OPACITY_MULTIPLIER = 0\.78/);
assert.match(hub, /visualHierarchyPolicy: "near_camera_foreground_frames_below_middle_route_space_and_background_host_context"/);
assert.match(hub, /visualHierarchyRole: "near_camera_frame"/);
assert.match(hub, /visualHierarchyRole: "supporting_anatomy"/);

// Surface Wake is the visual reference for W2B1, not a tuning target.
assert.match(surface, /opacity: spec\.layer === "foreground" \? 0\.2 : 0\.28/);
assert.match(surface, /depthLayer = spec\.layer/);

// W2B1 must not introduce a new renderer or global exposure/fog strategy.
for (const source of [gameplay, layered, hub]) {
  assert.doesNotMatch(source, /toneMappingExposure\s*=/);
  assert.doesNotMatch(source, /scene\.fog\s*=/);
}

console.log("HC031W2B1 depth hierarchy foundation source locks PASS");
