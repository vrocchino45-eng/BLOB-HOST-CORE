// HC-031W2A4 — bounded simulation catch-up planner.
// Splits one renderer callback's elapsed wall time into safe simulation steps
// without allowing a long renderer/event-loop stall to create an unbounded backlog.

export const HC031W2A4_MAX_STEP_SECONDS = 0.05;
export const HC031W2A4_MAX_CATCH_UP_SECONDS = 0.15;
export const HC031W2A4_MAX_SUBSTEPS = 3;

const finiteNonNegative = (value) => Number.isFinite(value) ? Math.max(0, value) : 0;

export function buildBoundedSimulationSteps(rawDt, {
  maxStepSeconds = HC031W2A4_MAX_STEP_SECONDS,
  maxCatchUpSeconds = HC031W2A4_MAX_CATCH_UP_SECONDS,
  maxSubsteps = HC031W2A4_MAX_SUBSTEPS
} = {}) {
  const elapsedSeconds = finiteNonNegative(rawDt);
  const safeMaxStep = Math.max(0.001, finiteNonNegative(maxStepSeconds) || HC031W2A4_MAX_STEP_SECONDS);
  const safeMaxSubsteps = Math.max(1, Math.floor(finiteNonNegative(maxSubsteps) || HC031W2A4_MAX_SUBSTEPS));
  const safeCatchUpCeiling = Math.min(
    Math.max(safeMaxStep, finiteNonNegative(maxCatchUpSeconds) || HC031W2A4_MAX_CATCH_UP_SECONDS),
    safeMaxStep * safeMaxSubsteps
  );

  const simulatedSeconds = Math.min(elapsedSeconds, safeCatchUpCeiling);
  const substepCount = simulatedSeconds > 0
    ? Math.min(safeMaxSubsteps, Math.max(1, Math.ceil(simulatedSeconds / safeMaxStep)))
    : 1;
  // Equal slices avoid a tiny remainder step while keeping every step <= maxStep.
  const substepSeconds = substepCount > 0 ? simulatedSeconds / substepCount : 0;
  const steps = Array.from({ length: substepCount }, () => substepSeconds);
  const legacySingleStepSeconds = Math.min(elapsedSeconds, safeMaxStep);

  return {
    elapsedSeconds,
    steps,
    substepCount,
    simulatedSeconds,
    droppedSeconds: Math.max(0, elapsedSeconds - simulatedSeconds),
    recoveredBeyondLegacyCapSeconds: Math.max(0, simulatedSeconds - legacySingleStepSeconds),
    legacySingleStepSeconds,
    maxStepSeconds: safeMaxStep,
    maxCatchUpSeconds: safeCatchUpCeiling,
    catastrophicGap: elapsedSeconds > safeCatchUpCeiling
  };
}
