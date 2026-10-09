import assert from "node:assert/strict";
import fs from "node:fs";
import * as THREE from "three";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const gameplay = read("../src/morph/GuideThresholdGameplaySystem.js");
const layered = read("../src/morph/GuideThresholdLayeredInteractionSystem.js");
const hub = read("../src/hub/HubChamberFoundationSystem.js");
const surface = read("../src/opening/SurfaceWakeEcologicalCausalitySystem.js");

// Guide / Scar recovers some living-current continuity without returning to the pre-B1 cyan wash.
assert.match(gameplay, /W2B11_SUPPORT_STRAND_OPACITY_MULTIPLIER = 0\.68/);
assert.match(gameplay, /W2B11_SUPPORT_MOTE_OPACITY_MULTIPLIER = 0\.8/);
assert.match(gameplay, /visualHierarchyPass: "HC-031W2B1\.1"/);
assert.match(gameplay, /restored_low_energy_path_support/);
assert.match(gameplay, /visualHierarchyRole = "local_actionable_pressure_body"/);
assert.match(gameplay, /visualHierarchyRole = "local_actionable_focus"/);

assert.match(layered, /W2B11_LAYERED_STRAND_OPACITY_MULTIPLIER = 0\.66/);
assert.match(layered, /W2B11_LAYERED_MOTE_OPACITY_MULTIPLIER = 0\.8/);
assert.match(layered, /W2B11_LAYERED_LIGHT_INTENSITY_MULTIPLIER = 0\.7/);
assert.match(layered, /visualHierarchyPass: "HC-031W2B1\.1"/);
assert.match(layered, /restored_low_energy_path_support/);
assert.match(layered, /visualHierarchyRole = "local_actionable_settling_body"/);
assert.match(layered, /visualHierarchyRole = "local_actionable_focus"/);

// Hub hierarchy is now camera-relative for all depth tissue, not authored-label-only.
assert.match(hub, /W2B11_CAMERA_TISSUE_APPARENT_SIZE_FADE_START = 0\.16/);
assert.match(hub, /W2B11_CAMERA_TISSUE_APPARENT_SIZE_FADE_FULL = 0\.48/);
assert.match(hub, /W2B11_CAMERA_TISSUE_MINIMUM_OPACITY_MULTIPLIER = 0\.24/);
assert.match(hub, /cameraRelativeTissueOpacityMultiplier\(body\)/);
assert.match(hub, /const apparentSize = worldRadius \/ distance/);
assert.match(hub, /body\.userData\.cameraRelativeOpacityMultiplier = cameraRelativeMultiplier/);
assert.match(hub, /camera_relative_large_tissue_attenuates_below_middle_route_space_core_guide_and_background_context/);
assert.match(hub, /cameraRelativeTissueAttenuationActive: Boolean\(this\.camera\)/);
assert.match(hub, /visualHierarchyPass: "HC-031W2B1\.1"/);

// The chosen curve must be monotonic: far/small tissue stays authored; near/large tissue attenuates strongly.
const attenuation = (apparentSize) => {
  const fade = THREE.MathUtils.smoothstep(apparentSize, 0.16, 0.48);
  return THREE.MathUtils.lerp(1, 0.24, fade);
};
assert.equal(attenuation(0.1), 1);
assert.ok(attenuation(0.28) < 1 && attenuation(0.28) > 0.24);
assert.equal(attenuation(0.6), 0.24);
assert.ok(attenuation(0.2) > attenuation(0.32));
assert.ok(attenuation(0.32) > attenuation(0.5));

// Surface Wake remains the visual reference and must not be tuned by B1.1.
assert.match(surface, /opacity: spec\.layer === "foreground" \? 0\.2 : 0\.28/);
assert.match(surface, /depthLayer = spec\.layer/);

// No global art or camera policy is introduced here.
for (const source of [gameplay, layered, hub]) {
  assert.doesNotMatch(source, /toneMappingExposure\s*=/);
  assert.doesNotMatch(source, /scene\.fog\s*=/);
}

console.log("HC031W2B1.1 camera-relative hierarchy balance source locks PASS");
