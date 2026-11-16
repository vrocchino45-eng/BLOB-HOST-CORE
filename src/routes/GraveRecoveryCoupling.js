import { deriveCoreEarnedEvolution } from "../player/CoreEarnedEvolution.js";
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

// CONNECTION48: a separate earned-Core input, never fabricated Host receipts.
// Sources share the established ceiling; the stronger source wins without stacking.
export function coreGraveRecoveryCoupling(memory, growth, {suspended = false} = {}) {
  const world = graveRecoveryCoupling(memory);
  const earned = deriveCoreEarnedEvolution(growth).earnedFamilies.grave;
  const coreMultiplier = earned && !suspended ? 1 + GRAVE_MAX_RECOVERY_ASSIST : 1;
  return {multiplier:Math.max(world.multiplier,coreMultiplier),worldMultiplier:world.multiplier,
    coreMultiplier,earned,coreContributing:coreMultiplier>world.multiplier,
    source:coreMultiplier>world.multiplier?'earned_grave_core':world.assisted?'authenticated_vascular_memory':'none'};
}
