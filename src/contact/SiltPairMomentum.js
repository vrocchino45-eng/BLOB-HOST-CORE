import admission from './siltPairAdmission.json' with { type: 'json' };

const TOLERANCE = 1e-12;
const finiteVector = value => Array.isArray(value) && value.length === 3
  && [0, 1, 2].every(index => Number.isFinite(value[index]));
const positive = value => Number.isFinite(value) && value > 0;
const subtract = (a, b) => a.map((value, i) => value - b[i]);
const add = (a, b) => a.map((value, i) => value + b[i]);
const scale = (a, factor) => a.map(value => value * factor);
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const within = (a, b) => Math.abs(a - b) <= TOLERANCE * (1 + Math.max(Math.abs(a), Math.abs(b)));

export const siltPairIds = Object.freeze([...admission.scope.ids]);

export function siltPairFixture(mode) {
  if (!Object.hasOwn(admission.massFixturesMr, mode)) return null;
  return Object.freeze({
    id: mode, revision: admission.revision, hostId: admission.scope.host, cellId: admission.scope.cell,
    masses: Object.freeze({ ...admission.massFixturesMr[mode] }), radii: Object.freeze({ ...admission.radiiLw }),
    phases: Object.freeze([...admission.scope.eligiblePhases]), separationMargin: admission.separationMarginLw,
    fixedSurfaceWindow: admission.fixedSurfaceExclusionSeconds
  });
}

// Geometry and impulse math for the admitted pair. SiltTrajectoryMemory owns
// eligibility, integration, arbitration, and the atomic application of results.
export function resolveSiltPairImpact(a, b, seconds) {
  if (!positive(seconds) || ![a, b].every(body => positive(body?.mass) && positive(body.radius)
    && finiteVector(body.position) && finiteVector(body.velocity))) return null;
  const separation = subtract(b.position, a.position);
  const relative = subtract(b.velocity, a.velocity);
  const travel = scale(relative, seconds);
  const radii = a.radius + b.radius;
  const magnitude = Math.max(radii, ...separation.map(Math.abs), ...travel.map(Math.abs));
  if (!positive(magnitude)) return null;
  const p = scale(separation, 1 / magnitude);
  const d = scale(travel, 1 / magnitude);
  const radiusSquared = (radii / magnitude) ** 2;
  if (radiusSquared === 0) return null;
  const pSquared = dot(p, p);
  const c = pSquared - radiusSquared;
  const bTerm = dot(p, d);
  const aTerm = dot(d, d);
  const discriminant = bTerm ** 2 - aTerm * c;
  if (c < 0 || bTerm >= 0 || !positive(aTerm)
    || !(discriminant > TOLERANCE * Math.max(bTerm ** 2, Math.abs(aTerm * c)))) return null;

  const ingressSeconds = seconds * (c / (-bTerm + Math.sqrt(discriminant)));
  if (!Number.isFinite(ingressSeconds) || ingressSeconds < 0
    || (ingressSeconds > seconds && !within(ingressSeconds, seconds))) return null;
  const time = Math.min(ingressSeconds, seconds);
  const impactOffset = add(separation, scale(relative, time));
  const distance = Math.hypot(...impactOffset);
  if (!positive(distance)) return null;
  const normal = scale(impactOffset, 1 / distance);
  const vn = dot(relative, normal);
  if (!(vn < -TOLERANCE)) return null;

  const largestMass = Math.max(a.mass, b.mass);
  const ratioA = a.mass / largestMass;
  const ratioB = b.mass / largestMass;
  if (!positive(ratioA) || !positive(ratioB)) return null;
  const deltaA = vn * (ratioB / (ratioA + ratioB));
  const deltaB = -vn * (ratioA / (ratioA + ratioB));
  const impulse = -a.mass * deltaA;
  const velocities = [add(a.velocity, scale(normal, deltaA)), add(b.velocity, scale(normal, deltaB))];
  const positions = [add(a.position, scale(a.velocity, time)), add(b.position, scale(b.velocity, time))];
  const momentum = ([va, vb]) => add(scale(va, a.mass), scale(vb, b.mass));
  const energy = ([va, vb]) => a.mass / 2 * dot(va, va) + b.mass / 2 * dot(vb, vb);
  const before = [a.velocity, b.velocity];
  const momentumBefore = momentum(before);
  const momentumAfter = momentum(velocities);
  const energyBefore = energy(before);
  const energyAfter = energy(velocities);
  if (![...positions, ...velocities, momentumBefore, momentumAfter].every(finiteVector)
    || ![impulse, energyBefore, energyAfter].every(Number.isFinite)
    || !momentumAfter.every((value, i) => within(value, momentumBefore[i]))
    || (energyAfter > energyBefore && !within(energyAfter, energyBefore))) return null;
  return { time, normal, impulse, positions, velocities, momentumBefore, momentumAfter, energyBefore, energyAfter };
}
