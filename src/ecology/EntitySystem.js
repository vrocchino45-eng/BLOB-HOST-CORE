import * as THREE from "three";

export class EntitySystem {
  constructor({ recipeDataSystem, visualComposer, playerRoot, localCellRecipe, frameState }) {
    if (!recipeDataSystem) throw new Error("[EntitySystem] recipeDataSystem is required.");
    if (!visualComposer) throw new Error("[EntitySystem] visualComposer is required.");
    if (!playerRoot) throw new Error("[EntitySystem] playerRoot is required.");
    if (!localCellRecipe) throw new Error("[EntitySystem] localCellRecipe is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.visualComposer = visualComposer;
    this.playerRoot = playerRoot;
    this.localCellRecipe = localCellRecipe;
    this.frameState = frameState;

    this.entities = [];
    this.tempVector = new THREE.Vector3();
    this.followTarget = new THREE.Vector3();
    this.tenderBonded = false;
    this.tenderBondFrame = -1;
    this.tenderRepairBoostSeconds = 0;
    this.tenderRepairTotal = 0;
    this.tenderLastCareReason = "none";
    this.surfaceCellId = "CELL_MEMBRANE_NURSERY_001";
    this.lastActiveCellId = frameState?.activeCellId ?? this.surfaceCellId;
  }

  init() {
    const placements = new Map();
    for (const cell of this.recipeDataSystem.data.localCellRecipes?.values?.() ?? []) {
      for (const recipeId of cell.contents?.entities ?? []) {
        const instanceId = recipeId;
        if (!placements.has(instanceId)) placements.set(instanceId, { instanceId, recipeId, homeCellIds: [], spawn: null, distributionRole: "legacy_authored" });
        placements.get(instanceId).homeCellIds.push(cell.id);
      }
      for (const authored of cell.contents?.entityPlacements ?? []) {
        const recipeId = authored?.recipeId;
        const instanceId = authored?.instanceId ?? recipeId;
        if (!recipeId || !instanceId) continue;
        if (!placements.has(instanceId)) {
          placements.set(instanceId, { instanceId, recipeId, homeCellIds: [], spawn: authored, distributionRole: authored.distributionRole ?? "regional_population" });
        }
        placements.get(instanceId).homeCellIds.push(cell.id);
      }
    }

    for (const { instanceId, recipeId, homeCellIds, spawn: placementSpawn, distributionRole } of placements.values()) {
      const recipe = this.recipeDataSystem.get("entityRecipes", recipeId);
      const recipeSpawn = recipe.spawn ?? {};
      const spawn = { ...recipeSpawn, ...(placementSpawn ?? {}) };

      const root = this.visualComposer.compose({
        objectId: instanceId,
        visualRecipeId: recipe.visual.visualRecipe,
        placeholderRecipeId: recipe.visual.placeholderRecipe,
        position: spawn.position ?? [0, 0, 0],
        scale: spawn.scale ?? 1
      });

      root.userData.entityRecipe = recipe.id;
      root.userData.entityInstanceId = instanceId;
      root.userData.distributionRole = distributionRole;
      root.userData.hostFunction = recipe.origin?.hostFunction ?? "unknown";
      root.userData.domains = recipe.chemistry?.domains ?? [];
      root.userData.entityDisposition = recipe.behavior?.defaultDisposition ?? "neutral";
      root.userData.entityState = "idle";
      root.visible = homeCellIds.includes(this.frameState?.activeCellId ?? this.surfaceCellId);

      this.entities.push({
        instanceId,
        recipeId: recipe.id,
        root,
        recipe,
        homeCellIds: [...homeCellIds],
        distributionRole,
        coordinateSpace: spawn.coordinateSpace ?? "world",
        spawnOffset: new THREE.Vector3().fromArray(spawn.position ?? [0, 0, 0]),
        anchoredCellId: null,
        basePosition: root.position.clone(),
        baseScale: spawn.scale ?? 1,
        pulseAge: 999,
        state: "idle",
        lastReaction: "none"
      });
    }

    this.frameState.entityState = {
      total: this.entities.length,
      visiblePopulation: this.entities.filter((entity) => entity.root?.visible).length,
      activeCellPopulation: this.entities.filter((entity) => entity.root?.visible).map((entity) => entity.instanceId ?? entity.recipe.id),
      nearestEntity: "none",
      nearestDistance: 0,
      lastReaction: "none",
      tenderState: "not_spawned",
      watcherState: "not_spawned",
      vascularRelayState: "not_spawned",
      tenderBonded: false,
      tenderCompanionRole: "nursery_care_only",
      tenderRepairBoostSeconds: 0,
      tenderRepairTotal: 0
    };
  }

  update(dt, frameState) {
    const activeCellId = frameState.activeCellId ?? this.surfaceCellId;
    const inNursery = activeCellId === this.surfaceCellId;
    if (activeCellId !== this.lastActiveCellId) {
      this.anchorCellRelativeEntities(activeCellId);
      this.lastActiveCellId = activeCellId;
    }
    this.evaluateTenderBond(frameState, inNursery);

    if (frameState.input?.pulsePressed) {
      this.applyPulse(frameState);
    }

    let nearest = null;

    for (const entity of this.entities) {
      entity.pulseAge += dt;

      const isTender = entity.recipe.id === "nursery_membrane_tender_001";
      const isWatcher = entity.recipe.id === "membrane_watcher_001";
      const isNurseryWatcher = isWatcher && entity.instanceId === "membrane_watcher_001";
      const isVascularRelay = entity.recipe.id === "vascular_relay_001";
      const homeHere = entity.homeCellIds?.includes(activeCellId);

      // Preserve the locked Nursery ownership rules for Tender/Watcher. Regional
      // organisms use their authored home-cell placement instead of piggybacking
      // on the nursery visibility special cases.
      entity.root.visible = isTender
        ? (inNursery || this.tenderBonded)
        : isNurseryWatcher
          ? inNursery
          : Boolean(homeHere);
      if (!entity.root.visible) continue;

      const distance = this.playerRoot.position.distanceTo(entity.root.position);
      if (!nearest || distance < nearest.distance) {
        nearest = { ...entity, distance };
      }

      if (isTender) {
        if (inNursery) this.updateTender(entity, dt, frameState, distance);
        else this.updateTenderCompanion(entity, dt, frameState, distance);
      } else if (isWatcher) {
        if (isNurseryWatcher && inNursery) this.updateWatcher(entity, dt, frameState, distance);
        else this.updateRegionalWatcher(entity, dt, frameState, distance);
      } else if (isVascularRelay) {
        this.updateVascularRelay(entity, dt, frameState, distance);
      } else {
        this.updateGeneric(entity, dt, frameState, distance);
      }
    }

    this.updateTenderCare(frameState, dt, inNursery);
    this.updateDebugState(nearest, frameState);
  }


  onRuntimeMount() {
    for (const entity of this.entities) {
      entity.root.visible = true;
    }
  }

  onRuntimeUnmount(frameState) {
    // HC-016Q: EntitySystem is global. This hook remains compatibility-only.
    for (const entity of this.entities) {
      const isTender = entity.recipe.id === "nursery_membrane_tender_001";
      entity.root.visible = isTender && this.tenderBonded;
    }
    frameState.entityState = {
      ...(frameState.entityState ?? {}),
      active: this.tenderBonded,
      nearestEntity: "none",
      nearestDistance: 0,
      runtimeMountReleased: false,
      tenderBonded: this.tenderBonded
    };
  }

  applyPulse(frameState) {
    for (const entity of this.entities) {
      if (!entity.root.visible) continue;
      const distance = this.playerRoot.position.distanceTo(entity.root.position);

      if (distance > 4.2) continue;

      entity.pulseAge = 0;

      if (entity.recipe.id === "nursery_membrane_tender_001") {
        if (this.tenderBonded && frameState.activeCellId !== this.surfaceCellId) {
          entity.state = "care_response";
          entity.lastReaction = "bonded_tender_answered_repair_pulse";
          this.tenderRepairBoostSeconds = Math.max(this.tenderRepairBoostSeconds, 4.0);
          this.tenderLastCareReason = "player_requested_care_pulse";
        } else {
          entity.state = "open_fronds";
          entity.lastReaction = "tender_opened_to_gentle_pulse";
        }
      } else if (entity.recipe.id === "membrane_watcher_001") {
        entity.state = "answering_warning_wave";
        entity.lastReaction = "watcher_answered_with_small_pulse";
      } else {
        entity.state = "pulse_noted";
        entity.lastReaction = "entity_noted_pulse";
      }

      entity.root.userData.entityState = entity.state;
      entity.root.userData.lastPulseResponse = entity.lastReaction;
    }
  }

  updateTender(entity, dt, frameState, distance) {
    const t = frameState.runtimeSeconds;
    const pulseT = Math.max(0, 1 - entity.pulseAge / 1.1);
    const ecology = frameState.surfaceWakeEcology ?? {};
    const circuit = frameState.nurseryCircuit ?? {};

    const presentationOffset = ecology.phase === "receive" ? 0.62 : ecology.phase === "outgrow" ? 0.82 : 0;
    entity.root.position.x = entity.basePosition.x + Math.sin(t * 0.7) * 0.08 + presentationOffset;
    const filterLift = circuit.packetActive && (circuit.packetProgress ?? 0) > 0.68 ? 0.12 : 0;
    entity.root.position.y = entity.basePosition.y + Math.sin(t * 1.1) * 0.12 + pulseT * 0.05 + filterLift;
    entity.root.position.z = entity.basePosition.z + Math.cos(t * 0.6) * 0.08;

    entity.root.rotation.y += dt * (0.12 + pulseT * 0.38 + (circuit.packetActive ? 0.08 : 0));
    entity.root.rotation.z = Math.sin(t * 0.8) * 0.06;

    const integrity = Number.isFinite(circuit.tenderIntegrity) ? circuit.tenderIntegrity : 0.72;
    const trust = Number.isFinite(circuit.tenderTrust) ? circuit.tenderTrust : 0.32;
    const targetScale = entity.baseScale * (0.9 + integrity * 0.14 + pulseT * 0.12);
    entity.root.scale.set(
      targetScale * (0.94 + trust * 0.1),
      targetScale * (0.88 + integrity * 0.16),
      targetScale
    );

    const playerTooCloseToScar = frameState.currentChemTarget === "scar_contamination_plate_001";
    if (ecology.phase === "depart") {
      entity.state = "repairing_departure_seam";
      entity.lastReaction = "tender_closed_nursery_behind_core";
    } else if (ecology.phase === "outgrow") {
      entity.state = "making_room_for_grown_core";
      entity.lastReaction = "tender_shifted_from_distorted_circuit";
    } else if (ecology.phase === "receive") {
      entity.state = "presenting_protected_seed";
      entity.lastReaction = "tender_uncovered_offered_nourishment";
    } else if (circuit.packetActive && (circuit.packetProgress ?? 0) >= 0.68) {
      entity.state = circuit.packetPurity >= 0.68 ? "receiving_filtered_matter" : "bracing_against_contamination";
      entity.lastReaction = circuit.packetPurity >= 0.68
        ? "tender_opened_filter_to_incoming_food"
        : "tender_closed_outer_fronds_around_risk";
    } else if (String(circuit.lastOutcome).startsWith("tender_fed")) {
      entity.state = "digesting_and_repairing";
      entity.lastReaction = "tender_body_opened_after_receiving_food";
    } else if (circuit.lastOutcome === "tender_passively_received_clean_matter") {
      entity.state = "ambient_filter_maintenance";
      entity.lastReaction = "tender_received_flow_but_did_not_learn_the_core";
    } else if (circuit.lastOutcome === "tender_strained_scar_spread") {
      entity.state = "filter_strained_guarding_seed";
      entity.lastReaction = "tender_body_tightened_after_contamination";
    } else if (circuit.lastOutcome === "tender_strained_by_unread_contamination") {
      entity.state = "filter_strained_waiting_for_read";
      entity.lastReaction = "tender_strained_while_watcher_waited_for_core_pulse";
    } else if (playerTooCloseToScar && frameState.input?.absorbHeld) {
      entity.state = "curl_defensive";
      entity.lastReaction = "tender_curled_from_scar_absorb";
    } else if (ecology.careState === "trust_softening") {
      entity.state = "relaxed_open_fronds";
      entity.lastReaction = "tender_relaxed_after_safe_nourishment";
    } else if (pulseT > 0.05) {
      entity.state = "open_fronds";
    } else if (distance < 1.8) {
      entity.state = "cautious_observe";
    } else {
      entity.state = "repair_hover";
    }

    entity.root.userData.entityState = entity.state;
    entity.root.userData.lastPulseResponse = entity.lastReaction;
    entity.root.userData.foodState = circuit.foodState ?? "food_in_circulation";
    entity.root.userData.fearState = circuit.fearState ?? "cautious";
    entity.root.userData.functionState = circuit.functionState ?? "filtering_and_protecting";
    entity.root.userData.failureState = circuit.failureState ?? "none";
  }

  evaluateTenderBond(frameState, inNursery) {
    if (this.tenderBonded) return;

    const circuit = frameState.nurseryCircuit ?? {};
    const ecology = frameState.surfaceWakeEcology ?? {};
    const trust = Number(circuit.tenderTrust ?? 0);
    const integrity = Number(circuit.tenderIntegrity ?? 0);
    const safeCareProof = Boolean(
      circuit.tenderFedCount >= 1 ||
      circuit.lastOutcome === "tender_fed_clean_matter" ||
      circuit.lastOutcome === "tender_passively_received_clean_matter"
    );
    const leavingNursery = !inNursery || ecology.phase === "depart" || ecology.phase === "outgrow";

    if (
      leavingNursery &&
      safeCareProof &&
      trust >= 0.56 &&
      integrity >= 0.62
    ) {
      this.tenderBonded = true;
      this.tenderBondFrame = frameState.frame ?? 0;
      this.tenderLastCareReason = "nursery_trust_bond_earned";
      frameState.tenderCompanion = {
        pass: "HC-016Q",
        bonded: true,
        role: "care_repair_companion",
        navigationAuthority: false,
        routeGuidanceAuthority: "GuideOrbiter",
        bondFrame: this.tenderBondFrame,
        bondProof: {
          trust,
          integrity,
          safeCareProof
        }
      };
    }
  }

  updateTenderCompanion(entity, dt, frameState, distance) {
    const t = frameState.runtimeSeconds ?? 0;
    const scar = frameState.playerComposition?.scar ?? 0;
    const repairNeeded = scar > 0.045 || frameState.input?.absorbHeld;
    const reciprocalBehavior = frameState.entityReciprocalBehavior?.byEntityId?.nursery_membrane_tender_001 ?? null;
    const reciprocalStrength = Math.max(0, Math.min(1, Number(reciprocalBehavior?.strength01 ?? 0))) * (repairNeeded ? 0.35 : 1);
    const reciprocalMode = reciprocalBehavior?.active ? reciprocalBehavior.mode ?? "baseline" : "baseline";

    // Deliberately trail below/left of the Core so it cannot be confused with
    // the Guide Orbiter, which owns route reading above/ahead of the Core.
    this.followTarget.copy(this.playerRoot.position);
    this.followTarget.x -= 0.98;
    this.followTarget.y -= 0.42 + Math.sin(t * 1.1) * 0.09;
    this.followTarget.z += 0.82;

    const compositionYield = Math.min(
      0.88,
      Math.max(0, frameState.interactionComposition?.companionYield ?? 0)
    );
    if (compositionYield > 0) {
      this.followTarget.x -= compositionYield * 0.68;
      this.followTarget.y -= compositionYield * 0.28;
      this.followTarget.z += compositionYield * 0.46;
    }

    // HC028L: short-lived ecological memory may bias the already-bonded Tender's
    // companion spacing. The offset is deliberately small and repair need remains
    // authoritative, so this cannot become route guidance or a care-rate upgrade.
    if (reciprocalMode === "approach_care") {
      this.followTarget.x += 0.18 * reciprocalStrength;
      this.followTarget.y += 0.06 * reciprocalStrength;
      this.followTarget.z -= 0.14 * reciprocalStrength;
    } else if (reciprocalMode === "guarded_space") {
      this.followTarget.x -= 0.32 * reciprocalStrength;
      this.followTarget.y -= 0.08 * reciprocalStrength;
      this.followTarget.z += 0.24 * reciprocalStrength;
    } else if (reciprocalMode === "settle_nearby") {
      this.followTarget.x += 0.08 * reciprocalStrength;
      this.followTarget.y -= 0.02 * reciprocalStrength;
      this.followTarget.z -= 0.04 * reciprocalStrength;
    } else if (reciprocalMode === "attentive_follow") {
      this.followTarget.x += 0.12 * reciprocalStrength;
      this.followTarget.y += 0.03 * reciprocalStrength;
      this.followTarget.z -= 0.08 * reciprocalStrength;
    }

    if (repairNeeded) {
      this.followTarget.x += 0.30;
      this.followTarget.y += 0.12;
      this.followTarget.z -= 0.20;
    }

    const reciprocalFollowScale = reciprocalMode === "approach_care"
      ? 1.12
      : reciprocalMode === "guarded_space"
        ? 0.82
        : reciprocalMode === "settle_nearby"
          ? 0.74
          : reciprocalMode === "attentive_follow"
            ? 1.04
            : 1;
    const followAlpha = 1 - Math.exp(-dt * (repairNeeded ? 3.6 : 2.4) * reciprocalFollowScale);
    entity.root.position.lerp(this.followTarget, followAlpha);

    this.tempVector.copy(this.playerRoot.position).sub(entity.root.position);
    entity.root.rotation.y = Math.atan2(this.tempVector.x, this.tempVector.z);
    entity.root.rotation.z = Math.sin(t * 0.7) * 0.08;

    const pulseT = Math.max(0, 1 - entity.pulseAge / 1.1);
    const careT = Math.min(1, this.tenderRepairBoostSeconds / 1.5);
    const targetScale = entity.baseScale * (0.82 + pulseT * 0.06 + careT * 0.08);
    entity.root.scale.setScalar(targetScale);

    if (this.tenderRepairBoostSeconds > 0) {
      entity.state = "repairing_core_companion";
      entity.lastReaction = this.tenderLastCareReason;
    } else if (repairNeeded) {
      entity.state = "attending_core_strain";
      entity.lastReaction = "bonded_tender_moved_closer_to_strain";
    } else if (reciprocalMode === "approach_care") {
      entity.state = "remembered_care_approach";
      entity.lastReaction = "bonded_tender_kept_closer_after_safe_exchange";
    } else if (reciprocalMode === "guarded_space") {
      entity.state = "remembered_protective_distance";
      entity.lastReaction = "bonded_tender_kept_space_after_guarded_contact";
    } else if (reciprocalMode === "settle_nearby") {
      entity.state = "remembered_settle_nearby";
      entity.lastReaction = "bonded_tender_settled_after_coherent_presence";
    } else if (reciprocalMode === "attentive_follow") {
      entity.state = "remembered_attentive_follow";
      entity.lastReaction = "bonded_tender_followed_remembered_signal";
    } else {
      entity.state = "bonded_care_follow";
      entity.lastReaction = "bonded_tender_trailing_without_guiding";
    }

    entity.root.userData.entityState = entity.state;
    entity.root.userData.lastPulseResponse = entity.lastReaction;
    entity.root.userData.companionRole = "care_repair";
    entity.root.userData.navigationAuthority = false;
    entity.root.userData.guideAuthority = "guide_orbiter_folded_lantern_001";
    entity.root.userData.bondedToCore = true;
    entity.root.userData.repairNeeded = repairNeeded;
    entity.root.userData.distanceToCore = distance;
    entity.root.userData.reciprocalBehaviorMode = reciprocalMode;
    entity.root.userData.reciprocalBehaviorStrength01 = reciprocalStrength;
  }

  updateTenderCare(frameState, dt, inNursery) {
    if (!this.tenderBonded || inNursery) {
      if (this.tenderRepairBoostSeconds > 0) {
        this.tenderRepairBoostSeconds = Math.max(0, this.tenderRepairBoostSeconds - dt);
      }
      return;
    }

    const composition = frameState.playerComposition ?? {};
    const scar = Number(composition.scar ?? 0);
    const baseCareRate = 0.0012;
    const pulseCareRate = this.tenderRepairBoostSeconds > 0 ? 0.0042 : 0;
    const careRate = scar > 0.02 ? baseCareRate + pulseCareRate : 0;
    const recovered = Math.min(scar, Math.max(0, dt) * careRate);

    if (recovered > 0) {
      composition.scar = Math.max(0.02, scar - recovered);
      this.tenderRepairTotal += recovered;
      this.tenderLastCareReason = this.tenderRepairBoostSeconds > 0
        ? "bonded_tender_active_repair_response"
        : "bonded_tender_passive_care";
    }

    this.tenderRepairBoostSeconds = Math.max(0, this.tenderRepairBoostSeconds - dt);

    frameState.tenderCompanion = {
      pass: "HC-016Q",
      bonded: true,
      role: "care_repair_companion",
      navigationAuthority: false,
      routeGuidanceAuthority: "GuideOrbiter",
      repairBoostActive: this.tenderRepairBoostSeconds > 0,
      repairBoostSeconds: this.tenderRepairBoostSeconds,
      repairRatePerSecond: careRate,
      totalScarRecovered: this.tenderRepairTotal,
      currentScar: composition.scar ?? 0,
      lastCareReason: this.tenderLastCareReason,
      nextAction: scar > 0.045
        ? "The Tender senses strain. Pulse gently near it for a stronger repair response."
        : "The bonded Tender trails the Core and quietly maintains damaged tissue."
    };
  }

  updateWatcher(entity, dt, frameState, distance) {
    const t = frameState.runtimeSeconds;
    const pulseT = Math.max(0, 1 - entity.pulseAge / 0.95);
    const ecology = frameState.surfaceWakeEcology ?? {};
    const circuit = frameState.nurseryCircuit ?? {};
    const reciprocalBehavior = frameState.entityReciprocalBehavior?.byEntityId?.membrane_watcher_001 ?? null;
    const reciprocalStrength = Math.max(0, Math.min(1, Number(reciprocalBehavior?.strength01 ?? 0)));
    const reciprocalMode = reciprocalBehavior?.active ? reciprocalBehavior.mode ?? "baseline" : "baseline";

    entity.root.position.copy(entity.basePosition);
    entity.root.position.y += Math.sin(t * 0.55) * 0.04;

    // HC031O1: when the Host has revealed its existing continuation, the Watcher
    // must physically tell the same truth as its semantic state. Route direction
    // temporarily outranks player-facing attention, but does not gain route authority.
    const routeCueRequested = Boolean(circuit.foldInvitation && !circuit.packetActive);
    let routeCueTargetId = "player_core";
    this.tempVector.copy(this.playerRoot.position).sub(entity.root.position);
    let angle = Math.atan2(this.tempVector.x, this.tempVector.z);

    if (routeCueRequested) {
      const fold = this.visualComposer.scene?.getObjectByName?.("surface_wake_listening_fold_001") ?? null;
      if (fold?.visible) {
        fold.getWorldPosition(this.followTarget);
        this.tempVector.copy(this.followTarget).sub(entity.root.position);
        if (this.tempVector.lengthSq() > 0.0001) {
          angle = Math.atan2(this.tempVector.x, this.tempVector.z);
          routeCueTargetId = fold.name;
        }
      }
    }

    const routeCueActive = routeCueTargetId === "surface_wake_listening_fold_001";
    if (routeCueActive) {
      const livingScan = Math.sin(t * 1.1) * 0.045 * (0.35 + reciprocalStrength * 0.65);
      const targetYaw = angle + livingScan;
      entity.root.rotation.y = this.approachAngle(
        entity.root.rotation.y,
        targetYaw,
        1 - Math.exp(-Math.max(0, dt) * 3.4)
      );
    } else if (reciprocalMode === "baseline") {
      entity.root.rotation.y = angle;
    } else {
      const scanOffset = reciprocalMode === "counter_scan"
        ? Math.sin(t * 1.75) * 0.32 * reciprocalStrength
        : reciprocalMode === "guarded_anchor"
          ? Math.sin(t * 0.62) * 0.08 * reciprocalStrength
          : 0;
      const targetYaw = angle + scanOffset;
      const trackRate = reciprocalMode === "hold_sample"
        ? 2.6
        : reciprocalMode === "counter_scan"
          ? 4.2
          : reciprocalMode === "guarded_anchor"
            ? 1.55
            : 2.0;
      entity.root.rotation.y = this.approachAngle(entity.root.rotation.y, targetYaw, 1 - Math.exp(-Math.max(0, dt) * trackRate));
    }

    entity.root.userData.routeCueActive = routeCueActive;
    entity.root.userData.routeCueTargetId = routeCueActive ? routeCueTargetId : "none";
    entity.root.userData.routeCueMode = routeCueActive ? "body_orients_to_listening_fold" : "none";
    entity.root.userData.routeAuthority = false;
    entity.root.rotation.x = Math.sin(t * 0.6) * 0.035 + pulseT * 0.04
      + (reciprocalMode === "hold_sample" ? Math.sin(t * 0.9) * 0.018 * reciprocalStrength : 0);

    const targetScale = entity.baseScale * (1 + pulseT * 0.08);
    entity.root.scale.setScalar(targetScale);

    if (ecology.phase === "depart") {
      entity.state = "recording_departure_expression";
      entity.lastReaction = `watcher_retained_${ecology.departureExpression ?? "shared_seam"}`;
    } else if (ecology.phase === "outgrow") {
      entity.state = "attending_shared_exit_seam";
      entity.lastReaction = "watcher_turned_from_core_to_seam";
    } else if (ecology.phase === "receive") {
      entity.state = "attending_presented_seed";
      entity.lastReaction = "watcher_confirmed_nursery_offer";
    } else if (circuit.foldInvitation && !circuit.packetActive) {
      entity.state = "turning_toward_listening_fold";
      entity.lastReaction = "watcher_revealed_where_the_nursery_listens";
    } else if (circuit.packetActive && !circuit.packetIdentified) {
      entity.state = "tracking_unread_matter";
      entity.lastReaction = "watcher_waiting_for_core_pulse_read";
    } else if (circuit.packetActive && circuit.packetPurity < 0.4) {
      entity.state = "warning_contamination";
      entity.lastReaction = "watcher_identified_scar_touched_matter";
    } else if (circuit.packetActive && circuit.packetIdentified) {
      entity.state = "confirming_compatible_matter";
      entity.lastReaction = "watcher_marked_matter_for_tender";
    } else if (frameState.signalChorusArrival?.active) {
      entity.state = "listening_to_chorus_nerve";
      entity.lastReaction = "watcher_reoriented_to_signal_chorus";
    } else if (ecology.sensoryState === "warning_scar_contact" || frameState.playerComposition?.scar > 0.08) {
      entity.state = "warning_attention";
      entity.lastReaction = "watcher_noted_scar_increase";
    } else if (pulseT > 0.05) {
      entity.state = "answering_warning_wave";
    } else if (reciprocalMode === "hold_sample") {
      entity.state = "holding_remembered_sample";
      entity.lastReaction = "watcher_held_attention_on_retained_sample";
    } else if (reciprocalMode === "counter_scan") {
      entity.state = "counter_scanning_memory";
      entity.lastReaction = "watcher_swept_around_retained_counter_signature";
    } else if (reciprocalMode === "guarded_anchor") {
      entity.state = "guarded_memory_anchor";
      entity.lastReaction = "watcher_reduced_tracking_after_defensive_signature";
    } else if (reciprocalMode === "settled_watch") {
      entity.state = "settled_memory_watch";
      entity.lastReaction = "watcher_held_quiet_observation_after_settled_contact";
    } else if (ecology.noticed || distance < 2.6) {
      entity.state = "tracking_player";
      entity.lastReaction = "watcher_noticed_new_core";
    } else {
      entity.state = "anchored_sense";
    }

    entity.root.userData.entityState = entity.state;
    entity.root.userData.lastPulseResponse = entity.lastReaction;
    entity.root.userData.nurseryCircuitRead = circuit.watcherRead ?? "unread";
    entity.root.userData.foldInvitation = Boolean(circuit.foldInvitation);
    entity.root.userData.reciprocalBehaviorMode = reciprocalMode;
    entity.root.userData.reciprocalBehaviorStrength01 = reciprocalStrength;
  }

  approachAngle(current, target, alpha) {
    const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
    return current + delta * Math.max(0, Math.min(1, alpha));
  }

  anchorCellRelativeEntities(activeCellId) {
    for (const entity of this.entities) {
      if (entity.coordinateSpace !== "cell_entry_relative") continue;
      if (!entity.homeCellIds?.includes(activeCellId)) continue;
      const anchor = this.playerRoot.position.clone();
      entity.basePosition.copy(anchor).add(entity.spawnOffset);
      entity.root.position.copy(entity.basePosition);
      entity.anchoredCellId = activeCellId;
    }
  }

  updateRegionalWatcher(entity, dt, frameState, distance) {
    const entityId = entity.instanceId ?? entity.recipe.id;
    const t = frameState.runtimeSeconds ?? 0;
    const recognition = frameState.entityResidueRecognition?.byEntityId?.[entityId] ?? null;
    const host = frameState.hostRhythm?.composition ?? {};
    const beatPulse = Math.max(0, Math.min(1, Number(host.beatPulse ?? 0)));

    entity.root.position.copy(entity.basePosition);
    entity.root.position.y += Math.sin(t * 0.72 + (entity.basePosition.x ?? 0)) * 0.035;
    const scanRate = recognition?.active ? 0.26 : 0.11;
    entity.root.rotation.y += dt * scanRate;
    entity.root.rotation.x = Math.sin(t * 0.54) * 0.025;
    entity.root.scale.setScalar(entity.baseScale * (1 + beatPulse * 0.018));

    if (recognition?.active) {
      entity.state = "regional_residue_attention";
      entity.lastReaction = `watcher_read_${recognition.interpretation ?? "local_trace"}`;
    } else if (frameState.activeCellId === "CELL_GRAVE_MEMORY_RESIDUE_BED_001") {
      entity.state = "witnessing_retained_memory";
      entity.lastReaction = "watcher_sampled_grave_residue_without_claiming_it";
    } else if (frameState.activeCellId === "CELL_COMB_THRESHOLD_FILTER_001") {
      entity.state = "sampling_filter_stream";
      entity.lastReaction = "watcher_listened_across_comb_filter";
    } else if (distance < 2.4) {
      entity.state = "regional_core_notice";
      entity.lastReaction = "watcher_noted_core_without_route_authority";
    } else {
      entity.state = "regional_anchored_sense";
      entity.lastReaction = "watcher_sampled_local_host_field";
    }

    entity.root.userData.entityState = entity.state;
    entity.root.userData.lastPulseResponse = entity.lastReaction;
    entity.root.userData.ecologicalRole = "anchored_sensor";
    entity.root.userData.navigationAuthority = false;
    entity.root.userData.routeAuthority = false;
  }

  updateVascularRelay(entity, dt, frameState, distance) {
    if (entity.coordinateSpace === "cell_entry_relative" && entity.anchoredCellId !== frameState.activeCellId) {
      entity.basePosition.copy(this.playerRoot.position).add(entity.spawnOffset);
      entity.root.position.copy(entity.basePosition);
      entity.anchoredCellId = frameState.activeCellId;
    }

    const t = frameState.runtimeSeconds ?? 0;
    const entityId = entity.instanceId ?? entity.recipe.id;
    const behavior = frameState.entityReciprocalBehavior?.byEntityId?.[entityId] ?? null;
    const mode = behavior?.active ? behavior.mode ?? "baseline" : "baseline";
    const strength = Math.max(0, Math.min(1, Number(behavior?.strength01 ?? 0)));
    const host = frameState.hostRhythm?.composition ?? {};
    const beatPulse = Math.max(0, Math.min(1, Number(host.beatPulse ?? 0)));
    const flow = frameState.physicalFeel?.flowVector ?? { x: 0.42, y: 0.08, z: -0.3 };
    this.tempVector.set(Number(flow.x ?? 0.42), Number(flow.y ?? 0.08), Number(flow.z ?? -0.3));
    if (this.tempVector.lengthSq() < 0.001) this.tempVector.set(0.42, 0.08, -0.3);
    this.tempVector.normalize();

    const driftAmp = mode === "brace_current" ? 0.035 : mode === "cup_current" ? 0.09 : 0.14;
    const phase = Math.sin(t * (1.05 + beatPulse * 0.18));
    entity.root.position.copy(entity.basePosition);
    entity.root.position.addScaledVector(this.tempVector, phase * driftAmp);
    entity.root.position.y += Math.sin(t * 1.7 + 0.6) * 0.035;

    // The relay faces the current rather than the player. Retained gestures change
    // how strongly it leans into or cups against that same authored flow.
    const yaw = Math.atan2(this.tempVector.x, this.tempVector.z);
    entity.root.rotation.y = yaw;
    entity.root.rotation.z = mode === "cup_current"
      ? 0.10 * strength
      : mode === "forward_relay" || mode === "aligned_relay"
        ? -0.07 * strength
        : Math.sin(t * 0.72) * 0.025;
    entity.root.rotation.x = -this.tempVector.y * 0.32;

    const pulseT = Math.max(0, 1 - entity.pulseAge / 1.1);
    const scale = entity.baseScale * (1 + beatPulse * 0.035 + pulseT * 0.04 + (mode === "full_relay" ? 0.06 * strength : 0));
    entity.root.scale.setScalar(scale);

    if (mode === "forward_relay") {
      entity.state = "remembered_downstream_handoff";
      entity.lastReaction = "vascular_relay_carried_signal_forward";
    } else if (mode === "cup_current") {
      entity.state = "remembered_current_intake";
      entity.lastReaction = "vascular_relay_cupped_current";
    } else if (mode === "brace_current") {
      entity.state = "remembered_flow_alignment";
      entity.lastReaction = "vascular_relay_braced_across_contraction";
    } else if (mode === "aligned_relay") {
      entity.state = "remembered_stable_transmission";
      entity.lastReaction = "vascular_relay_held_stable_handoff";
    } else if (mode === "exchange_relay") {
      entity.state = "remembered_recirculating_exchange";
      entity.lastReaction = "vascular_relay_recirculated_exchange";
    } else if (mode === "full_relay") {
      entity.state = "remembered_full_conduit";
      entity.lastReaction = "vascular_relay_opened_full_conduit";
    } else if (distance < 2.1) {
      entity.state = "yielding_current_lane";
      entity.lastReaction = "vascular_relay_noted_core_without_targeting";
    } else {
      entity.state = "riding_current";
      entity.lastReaction = "vascular_relay_passing_host_flow";
    }

    entity.root.userData.entityState = entity.state;
    entity.root.userData.lastPulseResponse = entity.lastReaction;
    entity.root.userData.ecologicalRole = "flow_relay";
    entity.root.userData.navigationAuthority = false;
    entity.root.userData.routeAuthority = false;
    entity.root.userData.currentAligned = true;
    entity.root.userData.reciprocalBehaviorMode = mode;
    entity.root.userData.reciprocalBehaviorStrength01 = strength;
  }

  updateGeneric(entity, dt, frameState, _distance) {
    const t = frameState.runtimeSeconds;
    entity.root.position.y = entity.basePosition.y + Math.sin(t) * 0.06;
    entity.root.rotation.y += dt * 0.1;
    entity.root.userData.entityState = "generic_idle";
  }

  updateDebugState(nearest, frameState) {
    if (!frameState.entityState) {
      frameState.entityState = {
        total: this.entities.length,
        nearestEntity: "none",
        nearestDistance: 0,
        lastReaction: "none",
        tenderState: "none",
        watcherState: "none"
      };
    }

    const tender = this.entities.find((entity) => entity.recipe.id === "nursery_membrane_tender_001");
    const watcher = this.entities.find((entity) => entity.recipe.id === "membrane_watcher_001");
    const vascularRelay = this.entities.find((entity) => entity.recipe.id === "vascular_relay_001");

    frameState.entityState.total = this.entities.length;
    frameState.entityState.visiblePopulation = this.entities.filter((entity) => entity.root?.visible).length;
    frameState.entityState.activeCellPopulation = this.entities.filter((entity) => entity.root?.visible && entity.homeCellIds?.includes(frameState.activeCellId)).map((entity) => entity.instanceId ?? entity.recipe.id);
    frameState.entityState.nearestEntity = nearest?.instanceId ?? nearest?.recipe.id ?? "none";
    frameState.entityState.nearestDistance = nearest?.distance ?? 0;
    frameState.entityState.lastReaction = nearest?.lastReaction ?? "none";
    frameState.entityState.tenderState = tender?.state ?? "not_spawned";
    frameState.entityState.watcherState = watcher?.state ?? "not_spawned";
    frameState.entityState.vascularRelayState = vascularRelay?.state ?? "not_spawned";
    frameState.entityState.tenderBonded = this.tenderBonded;
    frameState.entityState.tenderCompanionRole = this.tenderBonded ? "care_repair_companion" : "nursery_care_only";
    frameState.entityState.tenderRepairBoostSeconds = this.tenderRepairBoostSeconds;
    frameState.entityState.tenderRepairTotal = this.tenderRepairTotal;

    if (nearest && nearest.distance < 1.75) {
      frameState.selectedObject = nearest.root.userData;
    }
  }
}
