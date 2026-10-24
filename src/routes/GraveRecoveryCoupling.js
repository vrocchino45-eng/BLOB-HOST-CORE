/**
 * C0D2 — bounded, Grave-owned physiological feedback. The input must be
 * memory already accepted from the authenticated Host/Vascular channel.
 * No remote updates, fluid transfer, or recipe/progression authority.
 */
export const GRAVE_MAX_RECOVERY_ASSIST = 0.15;

export function graveRecoveryCoupling(memory) {
  const validMemory = Boolean(memory && Number.isSafeInteger(memory.receivedTotal)
    && memory.receivedTotal > 0 && Number.isFinite(memory.memoryPressure));
  const pressure = validMemory ? Math.max(0, Math.min(1, memory.memoryPressure)) : 0;
  const multiplier = 1 + GRAVE_MAX_RECOVERY_ASSIST * pressure;
  return {multiplier, assisted: pressure > 0};
}
