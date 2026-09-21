export const FRAGMENT_FIELD_RULES = Object.freeze({
  influenceRadius: 5.8,
  closeOverrideRadius: 1.35,
  minimumAimDot: 0.02,
  captureRadius: 0.52,
  maxConcurrentPulls: 2,
  basePullSpeed: 2.4,
  nearPullSpeedBonus: 3.6,
  steeringRate: 9.0
});

export const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function stylePullMultiplier(style) {
  if (style === "echo") return 1.12;
  if (style === "silt") return 0.82;
  return 1.0;
}

export function fragmentHarvestScore({ distance = Infinity, aimDot = -1, age01 = 0 } = {}) {
  const proximity01 = clamp01(1 - distance / FRAGMENT_FIELD_RULES.influenceRadius);
  const aim01 = clamp01((aimDot + 0.2) / 1.2);
  return proximity01 * 2.6 + aim01 * 3.4 - clamp01(age01) * 0.22;
}

export function isFragmentFieldEligible({ distance = Infinity, aimDot = -1 } = {}) {
  if (!Number.isFinite(distance) || distance > FRAGMENT_FIELD_RULES.influenceRadius) return false;
  return distance <= FRAGMENT_FIELD_RULES.closeOverrideRadius || aimDot >= FRAGMENT_FIELD_RULES.minimumAimDot;
}

export function selectFragmentFieldCandidates(candidates = [], limit = FRAGMENT_FIELD_RULES.maxConcurrentPulls) {
  return candidates
    .filter((candidate) => isFragmentFieldEligible(candidate))
    .map((candidate) => ({
      ...candidate,
      harvestScore: fragmentHarvestScore(candidate)
    }))
    .sort((a, b) => b.harvestScore - a.harvestScore)
    .slice(0, Math.max(0, limit));
}
