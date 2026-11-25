// Isolated DL-EXP-013 reference. The game never imports this module.
const RELATIVE_TOLERANCE = 1e-12;
const ABSOLUTE_TOLERANCE = 1e-12;
export const tolerance = Object.freeze({ relative: RELATIVE_TOLERANCE, absolute: ABSOLUTE_TOLERANCE });
const diff = (a, b) => a.map((n, i) => n - b[i]);
const add = (a, b) => a.map((n, i) => n + b[i]);
const scale = (a, s) => a.map(n => n * s);
const dot = (a, b) => a.reduce((total, n, i) => total + n * b[i], 0);
const finite = (value, label) => {
  if (!Number.isFinite(value)) throw new RangeError(label + ' must be finite');
  return value;
};
function positive(value, label) {
  if (finite(value, label) <= 0) throw new RangeError(label + ' must be positive');
  return value;
}
function vector(value, label) {
  if (!Array.isArray(value) || value.length !== 3) throw new TypeError(label + ' must have three components');
  for (const n of value) finite(n, label);
  return value;
}
export function within(a, b) {
  return Math.abs(a - b) <= ABSOLUTE_TOLERANCE + RELATIVE_TOLERANCE * Math.max(Math.abs(a), Math.abs(b));
}

export function solveNormalImpulse({ massA, massB, velocityA, velocityB, normal }) {
  positive(massA, 'mass A');
  positive(massB, 'mass B');
  vector(velocityA, 'velocity A');
  vector(velocityB, 'velocity B');
  if (!within(Math.hypot(...vector(normal, 'normal')), 1)) throw new RangeError('normal must be a unit vector');
  const relativeNormal = finite(dot(diff(velocityB, velocityA), normal), 'relative normal speed');
  // Compute mass fractions first to avoid a reciprocal overflow.
  const largestMass = Math.max(massA, massB);
  const ratioA = massA / largestMass;
  const ratioB = massB / largestMass;
  if (!(ratioA > 0 && ratioB > 0)) throw new RangeError('mass ratio is unrepresentable');
  const closedNormal = relativeNormal < -ABSOLUTE_TOLERANCE ? -relativeNormal : 0;
  const outgoingA = vector(add(velocityA, scale(normal, -closedNormal * (ratioB / (ratioA + ratioB)))), 'outgoing A');
  const outgoingB = vector(add(velocityB, scale(normal, closedNormal * (ratioA / (ratioA + ratioB)))), 'outgoing B');
  const momentum = (a, b) => vector(add(scale(a, massA), scale(b, massB)), 'total momentum');
  const energy = (a, b) => finite((massA / 2) * dot(a, a) + (massB / 2) * dot(b, b), 'kinetic energy');
  const momentumBefore = momentum(velocityA, velocityB);
  const momentumAfter = momentum(outgoingA, outgoingB);
  const energyBefore = energy(velocityA, velocityB);
  const energyAfter = energy(outgoingA, outgoingB);
  if (momentumAfter.some((value, i) => !within(value, momentumBefore[i]))
      || (energyAfter > energyBefore && !within(energyAfter, energyBefore))) {
    throw new RangeError('incoming state does not meet the conservation tolerance at this numerical scale');
  }
  return { applied: closedNormal > 0, outgoingA, outgoingB, momentumBefore, momentumAfter, energyBefore, energyAfter,
    normalImpulse: finite(massA * closedNormal * (ratioB / (ratioA + ratioB)), 'normal impulse') };
}

export function firstSphereIngress({ positionA, positionB, velocityA, velocityB, radiusA, radiusB, seconds }) {
  const diameter = positive(positive(radiusA, 'radius A') + positive(radiusB, 'radius B'), 'sum of radii');
  positive(seconds, 'interval seconds');
  const separation = vector(diff(vector(positionB, 'position B'), vector(positionA, 'position A')), 'relative position');
  const travel = vector(scale(diff(vector(velocityB, 'velocity B'), vector(velocityA, 'velocity A')), seconds), 'relative displacement');
  const magnitude = Math.max(diameter, ...separation.map(Math.abs), ...travel.map(Math.abs));
  const p = separation.map(n => n / magnitude);
  const v = travel.map(n => n / magnitude);
  const r = diameter / magnitude;
  const radiusSquared = r * r;
  if (radiusSquared === 0) throw new RangeError('contact scale is unrepresentable');
  const pSquared = dot(p, p);
  const c = pSquared - radiusSquared;
  const clearanceTolerance = RELATIVE_TOLERANCE * Math.max(pSquared, radiusSquared);
  const b = dot(p, v);
  const a = dot(v, v);
  if (c < -clearanceTolerance) return { reason: 'initial_overlap' };
  if (a === 0 || b >= 0) return { reason: 'separating_or_stationary' };
  const discriminant = b * b - a * c;
  const discriminantTolerance = RELATIVE_TOLERANCE * Math.max(b * b, Math.abs(a * c));
  if (discriminant < -discriminantTolerance) return { reason: 'near_miss' };
  if (discriminant <= discriminantTolerance) return { reason: 'tangential' };
  const fraction = c <= clearanceTolerance ? 0 : c / (-b + Math.sqrt(discriminant));
  if (fraction > 1) return { reason: 'outside_interval' };
  const atHit = add(p, scale(v, fraction));
  const length = Math.hypot(...atHit);
  if (!(length > 0)) throw new RangeError('coincident contact center');
  return { reason: 'ingress', seconds: fraction * seconds, normal: atHit.map(n => n / length) };
}
