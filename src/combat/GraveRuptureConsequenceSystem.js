import { RUPTURE_CONSEQUENCE_RULES, clamp01, residueInfluenceForAge, summarizeRuptureConsequence } from "./RuptureConsequenceGrammar.js";

const ROUTE_CELL_ID = "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
const round = (value) => Number((Number.isFinite(value) ? value : 0).toFixed(3));

/**
 * HC031D — Rupture Consequence.
 *
 * Reads the accepted HC031C2 rupture/harvest result and lets missed matter remain as
 * a bounded regional memory. It owns residue settling and a read-only consequence
 * summary consumed by Grave II resonance on the following frame. It cannot target,
 * capture fragments, award route credits, block exits, or create new combat input.
 */
export class GraveRuptureConsequenceSystem {
  constructor({ frameState, graveRuptureHarvestSystem }) {
    if (!frameState || !graveRuptureHarvestSystem) {
      throw new Error("[GraveRuptureConsequenceSystem] frameState and graveRuptureHarvestSystem are required.");
    }
    this.frameState = frameState;
    this.graveRuptureHarvestSystem = graveRuptureHarvestSystem;
    this.active = false;
    this.eventSequence = 0;
    this.lastSummaryKey = "none";
    this.lastEvent = null;
  }

  init() {
    this.publish(this.frameState, summarizeRuptureConsequence());
  }

  update(dt, frameState = this.frameState) {
    const safeDt = Math.max(0, Math.min(dt ?? 0, 0.08));
    const rupture = this.graveRuptureHarvestSystem;
    this.active = Boolean(frameState.activeCellId === ROUTE_CELL_ID && frameState.graveReturnRegion?.active);

    this.settleResidue(safeDt, frameState, rupture.residues ?? []);
    const now = frameState.runtimeSeconds ?? 0;
    const residueRecords = (rupture.residues ?? []).map((residue) => ({
      style: residue.style,
      ageSeconds: Math.max(0, now - (residue.createdAtRuntime ?? now))
    }));
    const summary = summarizeRuptureConsequence({
      residues: residueRecords,
      fragments: [...(rupture.fragments?.values?.() ?? [])]
    });

    const key = [
      rupture.ruptureCount ?? 0,
      summary.collected,
      summary.cooled,
      Math.floor(summary.residueLoad01 * 8),
      Math.floor(summary.harvestRatio01 * 6)
    ].join(":");
    if (key !== this.lastSummaryKey) {
      this.lastSummaryKey = key;
      this.lastEvent = this.makeEvent("aftermath_state_changed", {
        ruptureCount: rupture.ruptureCount ?? 0,
        collected: summary.collected,
        cooled: summary.cooled,
        residueLoad01: round(summary.residueLoad01),
        harvestRatio01: round(summary.harvestRatio01)
      });
    }

    this.publish(frameState, summary);
  }

  settleResidue(dt, frameState, residues) {
    const now = frameState.runtimeSeconds ?? 0;
    for (const residue of residues) {
      if (!residue?.mesh) continue;
      if (!Number.isFinite(residue.createdAtRuntime)) residue.createdAtRuntime = now;
      const age = Math.max(0, now - residue.createdAtRuntime);
      const influence = residueInfluenceForAge(age);
      const settle = 1 - Math.exp(-dt * RUPTURE_CONSEQUENCE_RULES.visualSettleRate);

      if (residue.style === "brittle") {
        residue.velocity.y += (-0.018 - residue.velocity.y) * settle;
        residue.velocity.x *= Math.exp(-dt * 1.1);
        residue.velocity.z *= Math.exp(-dt * 1.1);
      } else if (residue.style === "silt") {
        residue.velocity.x *= Math.exp(-dt * 0.55);
        residue.velocity.z *= Math.exp(-dt * 0.55);
        residue.velocity.y += (-0.006 - residue.velocity.y) * settle * 0.7;
        const flatten = 1 - Math.exp(-dt * 0.35);
        residue.mesh.scale.x += (1.22 - residue.mesh.scale.x) * flatten;
        residue.mesh.scale.y += (0.56 - residue.mesh.scale.y) * flatten;
        residue.mesh.scale.z += (1.22 - residue.mesh.scale.z) * flatten;
      } else {
        residue.velocity.multiplyScalar(Math.exp(-dt * 0.14));
      }

      if (residue.mesh.material) {
        const baseOpacity = residue.style === "silt" ? 0.11 : 0.15;
        residue.mesh.material.opacity = baseOpacity * (0.60 + influence * 0.40);
      }
      residue.mesh.userData.ruptureConsequence = {
        pass: "HC-031D",
        ageSeconds: round(age),
        influence01: round(influence),
        state: age < RUPTURE_CONSEQUENCE_RULES.freshSeconds ? "fresh" : age < RUPTURE_CONSEQUENCE_RULES.settlingSeconds ? "settling" : "persistent_trace"
      };
    }
  }

  makeEvent(type, detail = {}) {
    this.eventSequence += 1;
    return { eventId: this.eventSequence, type, frame: this.frameState.frame ?? 0, ...detail };
  }

  publish(frameState, summary) {
    frameState.graveRuptureConsequence = {
      pass: "HC-031D",
      owner: "GraveRuptureConsequenceSystem",
      active: this.active,
      ruptureCount: this.graveRuptureHarvestSystem.ruptureCount ?? 0,
      residueLoad01: round(summary.residueLoad01),
      activeConsequence01: round(summary.activeConsequence01),
      harvestRatio01: round(summary.harvestRatio01),
      collectedFragmentCount: summary.collected,
      cooledFragmentCount: summary.cooled,
      liveFragmentCount: summary.live,
      residueStyleWeight: Object.fromEntries(Object.entries(summary.residueStyleWeight).map(([key, value]) => [key, round(value)])),
      nodeBias: Object.fromEntries(Object.entries(summary.nodeBias).map(([key, value]) => [key, round(value)])),
      lastEvent: this.lastEvent,
      rules: {
        residueAffectsRegionalResonance: true,
        influenceDecaysToPersistentTrace: true,
        cleanupRequired: false,
        progressionAuthority: false,
        exitAuthority: false,
        targetingAuthority: false,
        captureAuthority: false
      }
    };
  }
}
