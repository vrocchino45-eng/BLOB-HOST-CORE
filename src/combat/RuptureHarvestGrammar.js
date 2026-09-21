export const RUPTURE_STAGE = Object.freeze({
  intact: "intact",
  agitated: "agitated",
  critical: "critical",
  fragmented: "fragmented",
  spent: "spent"
});

export const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function ruptureStageFor(pressure01, ruptured = false, spent = false) {
  if (spent) return RUPTURE_STAGE.spent;
  if (ruptured) return RUPTURE_STAGE.fragmented;
  const pressure = clamp01(pressure01);
  if (pressure >= 0.72) return RUPTURE_STAGE.critical;
  if (pressure >= 0.24) return RUPTURE_STAGE.agitated;
  return RUPTURE_STAGE.intact;
}

export function applyRupturePulse({ pressure01 = 0, charge01 = 0, susceptibility = 1, regionalSpread01 = 0 }) {
  const charge = clamp01(charge01);
  const regionalSpread = clamp01(regionalSpread01);
  const gain = (0.205 + charge * 0.12) * Math.max(0.72, Math.min(1.28, susceptibility)) * (0.92 + regionalSpread * 0.18);
  return clamp01(pressure01 + gain);
}

export function applyRuptureStabilize({ pressure01 = 0, dt = 0, settleScale = 1 }) {
  const safeDt = Math.max(0, Math.min(Number.isFinite(dt) ? dt : 0, 0.08));
  const loss = safeDt * 0.235 * Math.max(0.65, Math.min(1.4, settleScale));
  return clamp01(pressure01 - loss);
}

export function shouldRupture({ pressure01 = 0, threshold01 = 0.8, reactiveCondition01 = 0 }) {
  const reactive = clamp01(reactiveCondition01);
  const effective = clamp01(pressure01 + reactive * 0.14);
  return effective >= clamp01(threshold01);
}

export function fragmentCaptureWindow(style, index = 0) {
  const i = Math.max(0, Number.isFinite(index) ? index : 0);
  // HC031C1: the original windows expired before the existing relationship +
  // soft-bond grammar could reliably hand off from the ruptured parent. Keep the
  // field partial, but give the player time to deliberately collect 1–3 pieces.
  if (style === "echo") return 7.6 + i * 0.34;
  if (style === "brittle") return 9.0 + i * 0.42;
  return 11.2 + i * 0.52;
}
