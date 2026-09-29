export class TargetFocusRegistry {
  constructor({ recipeDataSystem, frameState }) {
    if (!recipeDataSystem) throw new Error("[TargetFocusRegistry] recipeDataSystem is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.frameState = frameState;
    this.rules = [];
  }

  init() {
    this.rules = [...this.recipeDataSystem.data.targetFocusRules.values()];
    this.frameState.targetFocus = this.createEmptyFocus("initialized");
  }

  update(_dt, frameState) {
    const surfaceWake = frameState.surfaceWakeLayeredInteraction ?? {};
    if (
      frameState.activeCellId === "CELL_MEMBRANE_NURSERY_001" &&
      surfaceWake.active &&
      !surfaceWake.completed
    ) {
      const focus = this.createEmptyFocus("SurfaceWakeGameplaySystem");
      focus.activeCellId = "CELL_MEMBRANE_NURSERY_001";
      focus.allowedCells = ["CELL_MEMBRANE_NURSERY_001"];
      focus.ruleId = "HC007A_SURFACE_WAKE_SYSTEMIC_PLAY";
      focus.provider = "SurfaceWakeGameplaySystem";
      focus.suppressTargeting = false;
      focus.excludedObjectIds = ["dormant_seed_nutrient_001"];
      focus.objectBoosts = {
        surface_wake_membrane_mote_001: 8.0,
        surface_wake_membrane_mote_002: 7.2,
        surface_wake_membrane_mote_003: 6.8,
        signal_vapor_thread_001: 2.4,
        flux_current_ribbon_001: 1.8,
        scar_contamination_plate_001: -0.8
      };
      focus.targetKinds = {
        surface_wake_membrane_mote_001: "absorbable",
        surface_wake_membrane_mote_002: "absorbable",
        surface_wake_membrane_mote_003: "absorbable_risk_reward",
        signal_vapor_thread_001: "signal_listen",
        flux_current_ribbon_001: "pressure_current",
        scar_contamination_plate_001: "scar_resists"
      };
      focus.reasons.push("surface_wake_systemic_play_enabled_safe_seed_only_remains_locked");
      frameState.targetFocus = focus;
      return;
    }


    const guideThreshold = frameState.guideThresholdLayeredInteraction ?? {};
    if (
      frameState.activeCellId === "CELL_SCAR_FLOW_FOLD_001" &&
      guideThreshold.active &&
      !guideThreshold.completed
    ) {
      const focus = this.createEmptyFocus("GuideThresholdLayeredInteractionSystem");
      focus.activeCellId = "CELL_SCAR_FLOW_FOLD_001";
      focus.allowedCells = ["CELL_SCAR_FLOW_FOLD_001"];
      focus.ruleId = "HC006F_GUIDE_THRESHOLD_NO_GENERIC_TARGET";
      focus.provider = "GuideThresholdLayeredInteractionSystem";
      focus.suppressTargeting = true;
      focus.reasons.push("guide_threshold_layered_traversal_owns_read_move_hold_release");
      frameState.targetFocus = focus;
      return;
    }

    const hubPresentationOwns = frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001";
    if (hubPresentationOwns) {
      const focus = this.createEmptyFocus("HubInvestigationGameplaySystem");
      focus.activeCellId = "CELL_SIGNAL_CHORUS_NERVE_001";
      focus.allowedCells = ["CELL_SIGNAL_CHORUS_NERVE_001"];
      focus.ruleId = "HC009G_HUB_PRESENTATION_NO_GENERIC_TARGET";
      focus.provider = frameState.hubInvestigationGameplay?.investigationReady
        ? "HubChamberFoundationSystem"
        : "HubInvestigationGameplaySystem";
      focus.suppressTargeting = true;
      focus.reasons.push("hub_route_bodies_and_memory_own_reading_before_and_after_status");
      focus.reasons.push("technical_chemistry_targets_remain_f1_only_in_hub");
      frameState.targetFocus = focus;
      return;
    }

    const activeCellId = frameState.activeCellId ?? "none";
    const activeRule = this.rules.find((rule) => rule.cellId === activeCellId) ?? null;
    const allowedCells = this.getAllowedCells(frameState, activeCellId);

    const focus = this.createEmptyFocus(activeRule?.id ?? "no_rule_for_active_cell");
    focus.activeCellId = activeCellId;
    focus.allowedCells = allowedCells;
    focus.ruleId = activeRule?.id ?? "none";
    focus.provider = activeRule?.id ?? "none";

    if (activeRule) {
      focus.cellBoosts[activeRule.cellId] = activeRule.baseCellBoost ?? 2.0;
      focus.targetKinds = { ...(activeRule.targetKinds ?? {}) };
      this.addPreferredObjects(focus, activeRule);
      this.addProviderObjects(focus, activeRule, frameState);
      this.addSignalChorusBridgeOverride(focus, frameState);
    }

    this.addMorphDestinationBoosts(focus, frameState);
    this.addOpeningFlowFocus(focus, frameState);
    this.addGenericNurserySeedFocus(focus, frameState);
    this.addGravePostSeamOverride(focus, frameState);
    this.addRuptureHarvestOverride(focus, frameState);
    this.addAdjacentHostTerritoryFocus(focus, frameState);

    frameState.targetFocus = focus;
  }

  createEmptyFocus(provider) {
    return {
      active: true,
      provider,
      ruleId: "none",
      activeCellId: "none",
      allowedCells: [],
      preferredTargetId: "none",
      preferredTargetLabel: "none",
      objectBoosts: {},
      cellBoosts: {},
      targetKinds: {},
      suppressTargeting: false,
      excludedObjectIds: [],
      reasons: []
    };
  }

  getAllowedCells(frameState, activeCellId) {
    const cells = new Set();
    if (activeCellId && activeCellId !== "none") cells.add(activeCellId);

    const morphs = [
      frameState.localCellMorph,
      frameState.secondLocalCellMorph,
      frameState.thirdLocalCellMorph,
      frameState.graveRouteMorph
    ];

    for (const morph of morphs) {
      if (!morph) continue;
      if ((morph.progress ?? 0) > 0 && !morph.completed) {
        if (morph.sourceCell && morph.sourceCell !== "none") cells.add(morph.sourceCell);
        if (morph.destinationCell && morph.destinationCell !== "none") cells.add(morph.destinationCell);
      }
    }

    return [...cells];
  }

  addPreferredObjects(focus, rule) {
    for (const [objectId, boost] of Object.entries(rule.preferredObjects ?? {})) {
      this.addObjectBoost(focus, objectId, boost, `${rule.id}:preferred`);
    }
  }

  addProviderObjects(focus, rule, frameState) {
    for (const provider of rule.providers ?? []) {
      const value = this.getPath(frameState, provider.statePath);
      const boost = provider.boost ?? 0;
      const label = provider.label ?? provider.statePath ?? "provider";

      if (provider.threshold !== undefined) {
        const numeric = Number(value ?? 0);
        if (numeric > provider.threshold && provider.targetId) {
          this.addObjectBoost(focus, provider.targetId, boost, label);
          this.markPreferred(focus, provider.targetId, label);
        }
        continue;
      }

      if (provider.targetId) {
        if (value === true || value === "ready" || value === "prepared" || Number(value) > 0) {
          this.addObjectBoost(focus, provider.targetId, boost, label);
          this.markPreferred(focus, provider.targetId, label);
        }
        continue;
      }

      if (typeof value === "string" && value && value !== "none" && value !== "inactive") {
        this.addObjectBoost(focus, value, boost, label);
        this.markPreferred(focus, value, label);
      }
    }
  }

  addSignalChorusBridgeOverride(focus, frameState) {
    const signalLoop = frameState.signalChorusInteraction ?? {};
    const thirdMorph = frameState.thirdLocalCellMorph ?? {};
    const bridgeStage = signalLoop.stage === "bridge_warmed" || signalLoop.stage === "signal_chorus_tuned" || signalLoop.stageIndex >= 3;

    if (frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001" && (bridgeStage || thirdMorph.triggerReady)) {
      this.addObjectBoost(focus, "seed_signal_bridge_001", bridgeStage ? 32.0 : 18.0, "signal_chorus_bridge_override");
      this.markPreferred(focus, "seed_signal_bridge_001", "signal_chorus_bridge_override");
    }
  }

  addGravePostSeamOverride(focus, frameState) {
    const postSeam = frameState.graveBedPostSeamResponse ?? {};
    const activeInGraveBed = frameState.activeCellId === "CELL_GRAVE_MEMORY_RESIDUE_BED_001";
    const targetId = postSeam.currentFocus;

    if (!activeInGraveBed || !postSeam.active || postSeam.completed) return;
    if (!targetId || targetId === "none") return;

    // HC-004QG: the post-seam response is the sole owner of Grave-bed focus.
    // Replace stale arrival/read-loop boosts instead of merely stacking another
    // score that distance could still defeat.
    focus.objectBoosts = { [targetId]: 64 };
    focus.preferredTargetId = targetId;
    focus.preferredTargetLabel = "grave_bed_post_seam_response_focus";
    focus.provider = "GraveBedPostSeamResponseSystem";
    focus.reasons.push(`grave_post_seam_override:${targetId}+64`);
  }

  addRuptureHarvestOverride(focus, frameState) {
    const combat = frameState.graveRuptureHarvest ?? {};
    const liveFragmentIds = Array.isArray(combat.liveFragmentIds) ? combat.liveFragmentIds : [];
    const absorbHeld = Boolean(frameState.input?.absorbHeld);
    const activeInGraveBed = frameState.activeCellId === "CELL_GRAVE_MEMORY_RESIDUE_BED_001";

    if (!activeInGraveBed || !combat.active || !absorbHeld || liveFragmentIds.length === 0) return;

    // HC031C1: loose rupture fragments temporarily own Grave focus while Absorb is
    // held. This is a provider override only; TargetingSystem still chooses among
    // the live pieces using its existing camera/distance score and relationship rules.
    focus.objectBoosts = {};
    focus.preferredTargetId = "none";
    focus.preferredTargetLabel = "rupture_fragment_field";
    focus.provider = "GraveRuptureHarvestSystem";

    for (const fragmentId of liveFragmentIds) {
      focus.objectBoosts[fragmentId] = 18.0;
      focus.targetKinds[fragmentId] = "absorbable";
    }

    focus.reasons.push(`rupture_harvest_absorb_focus:${liveFragmentIds.length}_live_fragments`);
  }

  addMorphDestinationBoosts(focus, frameState) {
    const morphs = [
      frameState.localCellMorph,
      frameState.secondLocalCellMorph,
      frameState.thirdLocalCellMorph,
      frameState.graveRouteMorph
    ];

    for (const morph of morphs) {
      if (!morph) continue;
      const progress = morph.progress ?? 0;
      if (progress > 0 && !morph.completed && morph.destinationCell && morph.destinationCell !== "none") {
        focus.cellBoosts[morph.destinationCell] = Math.max(
          focus.cellBoosts[morph.destinationCell] ?? 0,
          4.0 + progress * 6.0
        );
        focus.reasons.push(`morph_destination:${morph.destinationCell}`);
      }
    }
  }

  addOpeningFlowFocus(focus, frameState) {
    const opening = frameState.openingFlow ?? {};
    const targetId = opening.preferredTargetId;
    if (!targetId || targetId === "none") return;

    const boost = opening.preferredTargetBoost ?? 0;
    if (boost <= 0) return;

    this.addObjectBoost(focus, targetId, boost, `opening_flow:${opening.stage ?? "unknown"}`);
    this.markPreferred(focus, targetId, `opening_flow:${opening.stage ?? "unknown"}`);
  }

  addGenericNurserySeedFocus(focus, frameState) {
    const seedAbsorbed = (frameState.chemObjectState?.absorbedObjects ?? 0) > 0;

    const surfaceWakeComplete = Boolean(frameState.surfaceWakeLayeredInteraction?.completed);

    if (!seedAbsorbed && surfaceWakeComplete && frameState.activeCellId === "CELL_MEMBRANE_NURSERY_001") {
      this.addObjectBoost(focus, "dormant_seed_nutrient_001", 6.0, "unabsorbed_seed_tutorial_focus");
      if (focus.preferredTargetId === "none") {
        this.markPreferred(focus, "dormant_seed_nutrient_001", "unabsorbed_seed_tutorial_focus");
      }
    }
  }


  addAdjacentHostTerritoryFocus(focus, frameState) {
    const adjacent = frameState.adjacentHostTerritory ?? {};
    const ridge = frameState.membraneRidgeGameplay ?? {};
    const activeInAperture = frameState.activeCellId === "CELL_APERTURE_FIELDS_ARRIVAL_001";
    const territoryId = adjacent.territoryId ?? "gathering_ground_cluster";

    if (!activeInAperture || !adjacent.active || !(ridge.active || ridge.completed)) return;

    focus.targetKinds[territoryId] = "host_territory";
    this.addObjectBoost(
      focus,
      territoryId,
      ridge.completed ? 9.0 : 5.0,
      ridge.completed ? "aperture_ridge_released_adjacent_territory" : "aperture_remote_adjacent_territory"
    );

    if (ridge.completed && focus.preferredTargetId === "none") {
      this.markPreferred(focus, territoryId, "aperture_ridge_release_attention_handoff");
    }
  }

  addObjectBoost(focus, objectId, boost, reason) {
    if (!objectId || objectId === "none") return;
    focus.objectBoosts[objectId] = (focus.objectBoosts[objectId] ?? 0) + boost;
    focus.reasons.push(`${reason}:${objectId}+${boost}`);
  }

  markPreferred(focus, objectId, label) {
    focus.preferredTargetId = objectId;
    focus.preferredTargetLabel = label;
  }

  getPath(source, path) {
    if (!path) return undefined;
    let current = source;
    for (const part of path.split(".")) {
      if (current == null) return undefined;
      current = current[part];
    }
    return current;
  }
}
