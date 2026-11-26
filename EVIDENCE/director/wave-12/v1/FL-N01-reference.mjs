// Analytical fixtures only. No import from the production runtime.
export const dimensions = Object.freeze({
  materialQ: [0, 0, 0, 0, 1], flowQuantity: [0, 0, 0, 1, 0],
  time: [0, 0, 1, 0, 0], energy: [1, 2, -2, 0, 0],
  current: [0, 0, -1, 1, 0], potential: [1, 2, -2, -1, 0],
  power: [1, 2, -3, 0, 0], resistance: [1, 2, -1, -2, 0],
  conductance: [-1, -2, 1, 2, 0], capacitance: [-1, -2, 2, 2, 0],
  inductance: [1, 2, 0, -2, 0], frequency: [0, 0, -1, 0, 0],
  phase: [0, 0, 0, 0, 0]
});

function finite(...values) {
  if (!values.every(Number.isFinite)) throw new RangeError('Finite analytical values required');
}

function positive(...values) {
  finite(...values);
  if (values.some(value => value <= 0)) throw new RangeError('Positive analytical values required');
}

export function equivalentResistance(paths, topology) {
  if (!paths.length) throw new RangeError('At least one pathway required');
  positive(...paths);
  let total;
  if (topology === 'series') total = paths.reduce((sum, value) => sum + value, 0);
  else if (topology === 'parallel') total = 1 / paths.reduce((sum, value) => sum + 1 / value, 0);
  else throw new RangeError('Only series or parallel reference topology is admitted');
  positive(total);
  return total;
}

export function exchange({ sourcePotential, receiverPotential, resistance, dt, currentLimit }) {
  finite(sourcePotential, receiverPotential, dt);
  positive(currentLimit);
  if (dt < 0) throw new RangeError('Negative interval');
  const potentialDifference = sourcePotential - receiverPotential;
  finite(potentialDifference);
  if (resistance !== null) positive(resistance);
  const current = resistance === null || potentialDifference === 0 ? 0 : potentialDifference / resistance;
  if (!Number.isFinite(current) || Math.abs(current) > currentLimit) throw new RangeError('Outside admitted current bound');
  const signedQuantity = current * dt;
  const sourceWork = sourcePotential * signedQuantity;
  const receiverWork = receiverPotential * signedQuantity;
  const power = potentialDifference * current;
  const dissipation = power * dt;
  finite(signedQuantity, sourceWork, receiverWork, power, dissipation);
  return { current, signedQuantity, throughput: Math.abs(signedQuantity), sourceWork, receiverWork, power, dissipation };
}

export function junctionResidual(currents, storageRate = 0) {
  finite(...currents, storageRate);
  const residual = currents.reduce((sum, value) => sum + value, 0) - storageRate;
  finite(residual);
  return residual;
}

export function linearStorage({ capacitance, previous, delta, maximum }) {
  positive(capacitance, maximum);
  finite(previous, delta);
  const quantity = previous + delta;
  if (Math.abs(previous) > maximum || Math.abs(quantity) > maximum) throw new RangeError('Storage boundary exceeded');
  const before = previous ** 2 / (2 * capacitance);
  const energy = quantity ** 2 / (2 * capacitance);
  finite(before, energy);
  return { quantity, energy, energyChange: energy - before };
}
