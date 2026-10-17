/**
 * LS1B — single Silt-only material authority. No Three.js, route credit,
 * chemistry grants, active-cell movement or frame-state mutation here.
 *
 * Eight persistent material identities occupy exactly one phase each.
 * Their mass is neither respawned nor discarded as they cycle through
 * reservoir -> seep veins -> sediment garden -> reformed buds -> reservoir.
 * The first canonical safePacket absorption wakes the cycle ONCE; the
 * original earned safeMatterAbsorbed progression flag is never reset.
 */
const PHASES = ["reservoir", "veins", "garden_transit", "settled", "growing", "mature", "returning"];
const PHASE_TIME = Object.freeze({ veins: 6, garden_transit: 8, growing: 9, mature: 7, returning: 10 });

export class SiltLivingMaterialCycle {
  constructor(recipe) {
    if (recipe?.pass !== "LS1B" || !Number.isInteger(recipe.unitCount)
        || recipe.unitCount < 2 || recipe.unitCount > 12) {
      throw new Error("[SiltLivingMaterialCycle] invalid bounded LS1B recipe");
    }
    this.recipe = recipe;
    this.unitCount = recipe.unitCount;
    this.units = Array.from({ length: recipe.unitCount }, (_, index) => ({
      id: `silt-grain-${String(index + 1).padStart(2, "0")}`,
      mass: 1,
      phase: "reservoir",
      age: 0,
      generation: 0
    }));
    this.active = false;
    this.elapsed = 0;
    this.releaseClock = 0;
    this.flowBoost = 0;
    this.lastPulseEventId = -1;
    this.lastEvent = "dormant";
    this.events = [];
    this.eventSequence = 0;
    this.firstAbsorbTriggerCount = 0;
    this.releaseCount = 0;
    this.regenerationCount = 0;
    this.pressureInterventions = 0;
    this.gardenInterventions = 0;
  }

  awakenFromCanonicalAbsorb() {
    if (this.active) return false;
    this.active = true;
    this.firstAbsorbTriggerCount += 1;
    this.record("first_porous_absorb_woke_closed_reservoir");
    this.releaseClock = this.recipe.releaseIntervalSeconds; // initial visible transfer
    return true;
  }

  record(kind, id = null) {
    this.eventSequence += 1;
    this.lastEvent = kind;
    this.events.push({ sequence: this.eventSequence, kind, unitId: id });
    if (this.events.length > 24) this.events.shift();
  }

  transition(unit, phase) {
    unit.phase = phase;
    unit.age = 0;
    this.record(phase, unit.id);
  }

  update(dt, input = {}) {
    if (!this.active || !Number.isFinite(dt) || dt <= 0) return;
    // Fixed maximum simulation step avoids frame-time dependent skipping; the
    // global runtime already caps catch-up. Do not compensate for inactive time.
    let left = Math.min(dt, 0.25);
    const eventId = input.pulseEventId ?? -1;
    if (input.pulsePressed && eventId !== this.lastPulseEventId) {
      this.lastPulseEventId = eventId;
      if (input.habitatId === "reservoir" || input.habitatId === "veins") {
        this.flowBoost = this.recipe.flowBoostSeconds;
        this.pressureInterventions++;
        this.record("pulse_redirected_seep_pressure");
      }
    }
    while (left > 1e-8) {
      const step = Math.min(left, 0.05);
      left -= step;
      this.advance(step, input);
    }
  }

  advance(dt, input) {
    // D2N1: freeze an individually seated receiving-site unit as well as an
    // independently Core-held unit. Never create or remove a material unit.
    const withheld = new Set(Array.isArray(input.withheldUnitIds)
      ? input.withheldUnitIds : [input.heldUnitId]);
    const isWithheld = unit => withheld.has(unit.id);
    this.elapsed += dt;
    this.flowBoost = Math.max(0, this.flowBoost - dt);
    const boosted = this.flowBoost > 0;
    const rate = boosted ? this.recipe.flowBoostMultiplier : 1;
    const cap = this.recipe.maximumActiveTransport;
    const traveling = this.units.filter(u => ["veins", "garden_transit", "returning"].includes(u.phase)).length;
    this.releaseClock += dt * rate;
    if (traveling < cap && this.releaseClock >= this.recipe.releaseIntervalSeconds) {
      const stored = this.units.find(u => u.phase === "reservoir" && !isWithheld(u));
      if (stored) {
        this.releaseClock = 0;
        this.transition(stored, "veins");
        this.releaseCount++;
      }
    }

    for (const unit of this.units) {
      if (isWithheld(unit)) continue;
      if (unit.phase === "reservoir" || unit.phase === "settled") continue;
      const gardenHoned = input.habitatId === "garden" && Boolean(input.stabilizeHeld);
      const growRate = gardenHoned && unit.phase === "growing" ? this.recipe.gardenStabilizeMultiplier : 1;
      if (gardenHoned && unit.phase === "growing") this.gardenInterventions += dt;
      unit.age += dt * (["veins", "garden_transit", "returning"].includes(unit.phase) ? rate : growRate);
      if (unit.age < PHASE_TIME[unit.phase]) continue;
      switch (unit.phase) {
        case "veins": this.transition(unit, "garden_transit"); break;
        case "garden_transit": this.transition(unit, "settled"); break;
        case "growing": this.transition(unit, "mature"); break;
        case "mature": this.transition(unit, "returning"); break;
        case "returning":
          unit.generation += 1;
          this.transition(unit, "reservoir");
          this.regenerationCount++;
          break;
      }
    }
    // Buds need sediment *accumulation*: two deposited units of at least the
    // authored minimum settled age. Mass and identities survive the pairing.
    for (const unit of this.units) {
      if (unit.phase === "settled" && !isWithheld(unit)) unit.age += dt;
    }
    const settled = this.units.filter(u => u.phase === "settled" && !isWithheld(u) && u.age >= this.recipe.minimumSettleSeconds);
    if (settled.length >= 2) {
      this.transition(settled[0], "growing");
      this.transition(settled[1], "growing");
      this.record("paired_sediment_budded");
    }
  }

  snapshot() {
    const counts = Object.fromEntries(PHASES.map(p => [p, 0]));
    for (const u of this.units) counts[u.phase]++;
    return {
      pass: "LS1B",
      active: this.active,
      conservedMass: this.units.reduce((mass, unit) => mass + unit.mass, 0),
      initialMass: this.unitCount,
      currentUnitCount: this.units.length,
      counts,
      elapsedActiveSeconds: this.elapsed,
      firstAbsorbTriggerCount: this.firstAbsorbTriggerCount,
      releaseCount: this.releaseCount,
      regenerationCount: this.regenerationCount,
      pressureInterventions: this.pressureInterventions,
      gardenInterventionSeconds: Number(this.gardenInterventions.toFixed(2)),
      flowBoostRemaining: this.flowBoost,
      lastEvent: this.lastEvent,
      lastEventSequence: this.eventSequence
    };
  }
}
