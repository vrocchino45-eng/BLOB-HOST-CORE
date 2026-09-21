export const RUPTURE_CONSEQUENCE_RULES = Object.freeze({
  freshSeconds: 8,
  settlingSeconds: 30,
  persistentFloor01: 0.22,
  maxResidueLoad: 12,
  resonanceCouplingRate: 0.115,
  visualSettleRate: 0.9
});

export const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const clampSigned = (value, limit = 1) => Math.max(-limit, Math.min(limit, Number.isFinite(value) ? value : 0));

export function residueInfluenceForAge(ageSeconds = 0) {
  const age = Math.max(0, Number.isFinite(ageSeconds) ? ageSeconds : 0);
  if (age <= RUPTURE_CONSEQUENCE_RULES.freshSeconds) return 1;
  const span = Math.max(0.001, RUPTURE_CONSEQUENCE_RULES.settlingSeconds - RUPTURE_CONSEQUENCE_RULES.freshSeconds);
  const t = clamp01((age - RUPTURE_CONSEQUENCE_RULES.freshSeconds) / span);
  return 1 + (RUPTURE_CONSEQUENCE_RULES.persistentFloor01 - 1) * t;
}

export function summarizeRuptureConsequence({ residues = [], fragments = [] } = {}) {
  const residueStyleWeight = { brittle: 0, silt: 0, echo: 0 };
  let weightedResidue = 0;
  for (const residue of residues) {
    const style = residue?.style ?? 'brittle';
    const influence = residueInfluenceForAge(residue?.ageSeconds ?? 0);
    residueStyleWeight[style] = (residueStyleWeight[style] ?? 0) + influence;
    weightedResidue += influence;
  }

  let collected = 0;
  let cooled = 0;
  let live = 0;
  const collectedByStyle = { brittle: 0, silt: 0, echo: 0 };
  for (const fragment of fragments) {
    if (fragment?.collected) {
      collected += 1;
      collectedByStyle[fragment.style] = (collectedByStyle[fragment.style] ?? 0) + 1;
    } else if (fragment?.cooled) cooled += 1;
    else live += 1;
  }

  const finished = collected + cooled;
  const harvestRatio01 = finished > 0 ? clamp01(collected / finished) : 0;
  const residueLoad01 = clamp01(weightedResidue / RUPTURE_CONSEQUENCE_RULES.maxResidueLoad);
  const activeConsequence01 = clamp01(residueLoad01 * (0.88 + (1 - harvestRatio01) * 0.12));
  const norm = Math.max(1, weightedResidue);
  const nodeBias = {
    retainedDraw: clampSigned((residueStyleWeight.silt * 0.115 + residueStyleWeight.echo * 0.018 - residueStyleWeight.brittle * 0.012) / norm, 0.14),
    coherentPush: clampSigned((residueStyleWeight.brittle * 0.125 + residueStyleWeight.echo * 0.016 - residueStyleWeight.silt * 0.010) / norm, 0.14),
    heldEquilibrium: clampSigned((residueStyleWeight.echo * 0.105 + residueStyleWeight.silt * 0.030 + residueStyleWeight.brittle * 0.018) / norm, 0.14)
  };
  if (weightedResidue <= 0.0001) {
    nodeBias.retainedDraw = 0;
    nodeBias.coherentPush = 0;
    nodeBias.heldEquilibrium = 0;
  }

  return {
    weightedResidue,
    residueLoad01,
    activeConsequence01,
    harvestRatio01,
    collected,
    cooled,
    live,
    residueStyleWeight,
    collectedByStyle,
    nodeBias
  };
}
