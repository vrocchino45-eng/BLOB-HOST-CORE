/**
 * BOT1-D11D — Authored-surface contact bootstrap, WITHOUT adhesion authority.
 *
 * The Core's legacy boundary-based presentation can remain "suspended" even
 * while CoreSurfaceTruth has found a valid, near, authored crawlable surface.
 * The tendril owner requires an initial brushing signal before it can seal an
 * anchor, and movement (correctly) waits for an anchor before attaching.
 *
 * This pure eligibility gate authorizes ONLY initial "brushing" language.
 * Tendril seals, support planes, and movement attachments remain solely owned
 * by their existing systems. Never infer attachment from this return value.
 */
export const AUTHORED_SURFACE_BRUSH_DISTANCE = 0.46;
export const AUTHORED_SURFACE_OUTWARD_INTENT_LIMIT = 0.30;
export const AUTHORED_SURFACE_OUTWARD_SPEED_LIMIT = 0.65;

export function canBeginAuthoredSurfaceBrush({
  surfaceTruth = {},
  kinematics = {},
  physicalAttachment = {},
  coreWorkActive = false
} = {}) {
  if (coreWorkActive || physicalAttachment.active === true) return false;
  if (physicalAttachment.state === "releasing" || physicalAttachment.reacquireBlocked === true) return false;
  if (Number(physicalAttachment.releaseCooldown ?? 0) > 0) return false;
  if (surfaceTruth.valid !== true || surfaceTruth.mechanicalEligible !== true) return false;
  if (!surfaceTruth.surfaceId || surfaceTruth.surfaceId === "none") return false;

  const distance = surfaceTruth.distance;
  if (!Number.isFinite(distance) || distance < 0 || distance > AUTHORED_SURFACE_BRUSH_DISTANCE) return false;

  const n = surfaceTruth.normal ?? {};
  if (![n.x, n.y, n.z].every(Number.isFinite)) return false;
  const norm = Math.hypot(n.x, n.y, n.z);
  if (norm < 0.1) return false;

  const move = kinematics.desiredMoveVector ?? {};
  const mx = Number.isFinite(move.x) ? move.x : 0;
  const my = Number.isFinite(move.y) ? move.y : 0;
  const mz = Number.isFinite(move.z) ? move.z : 0;
  const moveMag = Math.hypot(mx, my, mz);
  const outwardIntent = moveMag > 0.05
    ? (mx * n.x + my * n.y + mz * n.z) / (moveMag * norm)
    : 0;
  if (outwardIntent > AUTHORED_SURFACE_OUTWARD_INTENT_LIMIT) return false;

  const v = kinematics.velocity ?? {};
  const vx = Number.isFinite(v.x) ? v.x : 0;
  const vy = Number.isFinite(v.y) ? v.y : 0;
  const vz = Number.isFinite(v.z) ? v.z : 0;
  const outwardSpeed = (vx * n.x + vy * n.y + vz * n.z) / norm;
  if (outwardSpeed > AUTHORED_SURFACE_OUTWARD_SPEED_LIMIT) return false;

  return true;
}
