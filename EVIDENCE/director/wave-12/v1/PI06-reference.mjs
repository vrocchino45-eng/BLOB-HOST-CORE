// Translational, staged contact reference only. Length, mass and time use Lw, Mr and Ts.
const add = (a, b) => a.map((value, index) => value + b[index]);
const scale = (a, factor) => a.map(value => value * factor);
const sub = (a, b) => add(a, scale(b, -1));
const dot = (a, b) => a.reduce((sum, value, index) => sum + value * b[index], 0);
const vector = value => Array.isArray(value) && value.length === 3 && value.every(Number.isFinite);
const tolerance = (...values) => 1e-10 * Math.max(1, ...values.map(Math.abs));

export function impact({ mA, mB, vA, vB, normal, restitution, friction, ingress = true, persistent = false }) {
  if (!ingress || persistent) return null;
  if (![mA, mB, restitution, friction].every(Number.isFinite) || mA <= 0 || mB <= 0 ||
      restitution < 0 || restitution > 1 || friction < 0 ||
      !vector(vA) || !vector(vB) || !vector(normal) || Math.abs(dot(normal, normal) - 1) > 1e-12) return null;

  const inverseMass = 1 / mA + 1 / mB;
  const relative = sub(vB, vA);
  const normalSpeed = dot(relative, normal);
  if (!(inverseMass > 0) || !Number.isFinite(inverseMass) || !Number.isFinite(normalSpeed) || normalSpeed >= 0) return null;

  const tangent = sub(relative, scale(normal, normalSpeed));
  const slidingSpeed = Math.hypot(...tangent);
  const jn = -(1 + restitution) * normalSpeed / inverseMass;
  const removeSliding = slidingSpeed / inverseMass;
  const frictionLimit = friction * jn;
  if (![slidingSpeed, jn, removeSliding, frictionLimit].every(Number.isFinite)) return null;
  const jt = Math.min(removeSliding, frictionLimit);
  const tangentImpulse = slidingSpeed > 0 ? scale(tangent.map(value => value / slidingSpeed), -jt) : [0, 0, 0];
  const onB = add(scale(normal, jn), tangentImpulse);
  const outA = sub(vA, scale(onB, 1 / mA));
  const outB = add(vB, scale(onB, 1 / mB));
  const afterRelative = sub(outB, outA);
  const normalAfter = dot(afterRelative, normal);
  const tangentAfter = sub(afterRelative, scale(normal, normalAfter));
  const momentum = (a, b) => add(scale(a, mA), scale(b, mB));
  const energy = (a, b) => (mA * dot(a, a) + mB * dot(b, b)) / 2;
  const before = energy(vA, vB);
  const after = energy(outA, outB);
  const dissipatedNormal = (1 - restitution ** 2) * normalSpeed ** 2 / (2 * inverseMass);
  const dissipatedTangent = jt * (slidingSpeed - 0.5 * jt * inverseMass);
  const dissipated = dissipatedNormal + dissipatedTangent;
  if (!vector(outA) || !vector(outB) || ![before, after, dissipated].every(Number.isFinite) ||
      after > before + tolerance(before) || dot(tangentAfter, tangent) < -tolerance(slidingSpeed ** 2) ||
      Math.abs(before - after - dissipated) > tolerance(before, after)) return null;

  return {
    outA, outB, normalSpeed, normalAfter, tangent, tangentAfter, onB, onA: scale(onB, -1),
    jn, jt, removeSliding, frictionLimit, momentumBefore: momentum(vA, vB), momentumAfter: momentum(outA, outB),
    before, after, dissipatedNormal, dissipatedTangent, dissipated
  };
}
