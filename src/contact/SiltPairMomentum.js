import admission from './siltPairAdmission.json' with { type: 'json' };
import restitutionAdmission from './siltPairRestitutionAdmission.json' with { type: 'json' };
import frictionAdmission from './siltPairFrictionAdmission.json' with { type: 'json' };

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

function readRestitutionFixture(mode) {
  const scope = restitutionAdmission.scope;
  const match = /^pi05:(e0|e05|e1)-(equal|one-to-three)$/.exec(mode);
  if (!match || restitutionAdmission.schema !== 'blob.silt-pair-restitution-admission.v1'
    || restitutionAdmission.revision !== 1 || restitutionAdmission.status !== 'admitted-development-only'
    || restitutionAdmission.existingAdmission.revision !== admission.revision
    || scope.host !== admission.scope.host || scope.cell !== admission.scope.cell
    || scope.tangentImpulse !== 0 || scope.separationMarginLw !== admission.separationMarginLw
    || scope.fixedSurfaceExclusionSeconds !== admission.fixedSurfaceExclusionSeconds
    || scope.ids.length !== siltPairIds.length || scope.radiiLw.length !== siltPairIds.length
    || !siltPairIds.every((id, index) => scope.ids[index] === id && scope.radiiLw[index] === admission.radiiLw[id])) return null;

  const [, name, massFixture] = match;
  const coefficient = { e0: 0, e05: 0.5, e1: 1 }[name];
  const fixture = restitutionAdmission.fixtures[mode];
  return fixture?.massFixture === massFixture && fixture.restitution === coefficient ? fixture : null;
}

function readFrictionFixture(mode) {
  const match = /^pi06:(mu0|mu01|mu03|mu1)-(e(?:0|05|1)-(?:equal|one-to-three))$/.exec(mode);
  const scope = frictionAdmission.scope;
  if (!match || frictionAdmission.schema !== 'blob.silt-pair-friction-admission.v1'
    || frictionAdmission.revision !== 1 || frictionAdmission.status !== 'admitted-development-only'
    || frictionAdmission.existingRestitutionRevision !== restitutionAdmission.revision
    || scope.host !== admission.scope.host || scope.cell !== admission.scope.cell
    || scope.separationMarginLw !== admission.separationMarginLw
    || scope.fixedSurfaceExclusionSeconds !== admission.fixedSurfaceExclusionSeconds
    || scope.ids.length !== siltPairIds.length || scope.radiiLw.length !== siltPairIds.length
    || !siltPairIds.every((id, index) => scope.ids[index] === id && scope.radiiLw[index] === admission.radiiLw[id])) return null;
  const [, qualifier, family] = match;
  const expected = { mu0: 0, mu01: 0.1, mu03: 0.3, mu1: 1 }[qualifier];
  const fixture = frictionAdmission.fixtures[mode];
  return fixture?.normalFixture === 'pi05:' + family && fixture.coefficient === expected ? fixture : null;
}

export function siltPairFixture(mode) {
  if (typeof mode !== "string") return null;
  const legacy = Object.hasOwn(admission.massFixturesMr, mode);
  const friction = legacy ? null : readFrictionFixture(mode);
  const restitution = legacy ? null : readRestitutionFixture(friction?.normalFixture ?? mode);
  if (!legacy && !restitution) return null;
  const massFixture = restitution?.massFixture ?? mode;
  return Object.freeze({
    id: mode, revision: admission.revision, hostId: admission.scope.host, cellId: admission.scope.cell,
    masses: Object.freeze({ ...admission.massFixturesMr[massFixture] }), radii: Object.freeze({ ...admission.radiiLw }),
    phases: Object.freeze([...admission.scope.eligiblePhases]), separationMargin: admission.separationMarginLw,
    fixedSurfaceWindow: admission.fixedSurfaceExclusionSeconds,
    ...(restitution ? { restitution: restitution.restitution, restitutionAdmissionRevision: restitutionAdmission.revision } : {}),
    ...(friction ? { friction: friction.coefficient, frictionAdmissionRevision: frictionAdmission.revision } : {})
  });
}

// Geometry and impulse math for the admitted pair. SiltTrajectoryMemory owns
// eligibility, integration, arbitration, and the atomic application of results.
export function resolveSiltPairImpact(a, b, seconds, restitution, friction) {
  if (friction !== undefined && (restitution === undefined || ![0, 0.1, 0.3, 1].includes(friction))) return null;
  if (restitution !== undefined && ![0, 0.5, 1].includes(restitution)) return null;
  const coefficient = restitution ?? 0;
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
  const response = vn * (1 + coefficient);
  const deltaA = response * (ratioB / (ratioA + ratioB));
  const deltaB = -response * (ratioA / (ratioA + ratioB));
  const impulse = -a.mass * deltaA;
  const velocities = [add(a.velocity, scale(normal, deltaA)), add(b.velocity, scale(normal, deltaB))];
  let frictionResult;
  if (friction !== undefined) {
    const reducedMass = impulse / -response;
    const tangent = subtract(relative, scale(normal, vn));
    const slipBefore = Math.hypot(...tangent);
    const stopImpulse = reducedMass * slipBefore;
    const limit = friction * impulse;
    if (!positive(reducedMass) || ![slipBefore, stopImpulse, limit].every(Number.isFinite)) return null;
    const magnitude = Math.min(stopImpulse, limit);
    const onB = slipBefore > 0 ? tangent.map(value => -magnitude * (value / slipBefore)) : [0, 0, 0];
    if (magnitude > 0) {
      velocities[0] = subtract(velocities[0], scale(onB, 1 / a.mass));
      velocities[1] = add(velocities[1], scale(onB, 1 / b.mass));
    }
    const outgoing = subtract(velocities[1], velocities[0]);
    const tangentAfter = subtract(outgoing, scale(normal, dot(outgoing, normal)));
    const slipAfter = Math.hypot(...tangentAfter);
    const remaining = slipBefore > 0 ? 1 - magnitude / stopImpulse : 0;
    const normalEnergyLost = 0.5 * reducedMass * vn ** 2 * (1 - coefficient ** 2);
    const tangentialEnergyLost = magnitude * (slipBefore - magnitude / (2 * reducedMass));
    if (![...onB, slipAfter, normalEnergyLost, tangentialEnergyLost].every(Number.isFinite)
      || tangentialEnergyLost < 0
      || !tangentAfter.every((value, index) => within(value, remaining * tangent[index]))) return null;
    frictionResult = { coefficient: friction, impulseOnB: onB, magnitude, stopImpulse, limit,
      slipBefore, slipAfter, normalEnergyLost, tangentialEnergyLost };
  }
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
  if (restitution !== undefined) {
    const separatingSpeed = dot(subtract(velocities[1], velocities[0]), normal);
    const loss = 0.5 * (impulse / -response) * vn ** 2 * (1 - coefficient ** 2);
    const totalLoss = loss + (frictionResult?.tangentialEnergyLost ?? 0);
    if (!within(separatingSpeed, -coefficient * vn) || !within(energyBefore - energyAfter, totalLoss)) return null;
  }
  return { time, normal, impulse, positions, velocities, momentumBefore, momentumAfter, energyBefore, energyAfter,
    ...(frictionResult ? { friction: frictionResult } : {}) };
}
