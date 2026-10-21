/**
 * BLOB: HOST CORE — C0C2 / HostCircuitBehavior C01.
 *
 * Owner-neutral bounded-scalar math ONLY. Does not store state, authenticate
 * receipts, update cells, create materials, tick off-route, own progression,
 * alter input mappings, or decide when an owner may apply an interaction.
 *
 * The owner chooses bounds, increment, recovery law/rate, eligible dt and
 * reset semantics. In C0C2 no gameplay system imports this module.
 */
const finite = (n, field) => {
  if (!Number.isFinite(n)) throw new TypeError(`[C01] ${field} must be finite`);
};

const bounds = (lower, upper) => {
  finite(lower, 'lower');
  finite(upper, 'upper');
  if (lower >= upper) throw new RangeError('[C01] lower must be below upper');
};

/** Saturated positive or negative increment; caller authorizes the input. */
export function boundedAdd(value, increment, { lower = 0, upper = 1 } = {}) {
  finite(value, 'value');
  finite(increment, 'increment');
  bounds(lower, upper);
  // Silt's min(1, p + 0.42) and Vascular's clamp(load + inc,0,.85)
  // are identical for their valid, nonnegative owned state domains.
  return Math.max(lower, Math.min(upper, value + increment));
}

/**
 * Owner-authorized recovery. Invalid/nonpositive dt is an *inactive tick*,
 * mirroring both audited source implementations; it is not an event.
 *
 * law='linear':      max(lower, value - min(dt,cap)*rate)
 * law='exponential': clamp(value * exp(-min(dt,cap)*rate),bounds)
 *
 * cutoff is optional and only applies after a positive recovery tick;
 * Vascular uses cutoff=0.0001, Silt uses no cutoff.
 */
export function boundedRecovery(value, {
  dt, rate, law, maxStepSeconds,
  lower = 0, upper = 1, cutoff = null
} = {}) {
  finite(value, 'value');
  finite(rate, 'rate');
  finite(maxStepSeconds, 'maxStepSeconds');
  bounds(lower, upper);
  if (rate < 0 || maxStepSeconds < 0) {
    throw new RangeError('[C01] recovery rate and maxStepSeconds must be nonnegative');
  }
  if (law !== 'linear' && law !== 'exponential') {
    throw new RangeError('[C01] law must be linear or exponential');
  }
  if (cutoff !== null) {
    finite(cutoff, 'cutoff');
    if (cutoff < lower || cutoff > upper) throw new RangeError('[C01] cutoff outside bounds');
  }
  if (!Number.isFinite(dt) || dt <= 0) return value;
  const step = Math.min(dt, maxStepSeconds);
  const result = law === 'linear'
    ? Math.max(lower, value - step * rate)
    : Math.max(lower, Math.min(upper, value * Math.exp(-step * rate)));
  return cutoff !== null && result < cutoff ? lower : result;
}
