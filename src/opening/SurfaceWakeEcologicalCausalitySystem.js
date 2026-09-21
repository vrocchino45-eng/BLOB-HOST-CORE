import * as THREE from "three";

const CELL_ID = "CELL_MEMBRANE_NURSERY_001";
const RECIPE_ID = "SURFACE_WAKE_ECOLOGICAL_CAUSALITY_HC008B";
const SEED_ID = "dormant_seed_nutrient_001";
const SIGNAL_ID = "signal_vapor_thread_001";
const CURRENT_ID = "flux_current_ribbon_001";
const SCAR_ID = "scar_contamination_plate_001";

/**
 * HC-008B connects the already-authored Surface Wake cast into one living event.
 * This system observes existing progression and chemistry state, publishes
 * ecological meaning, and composes response visuals. It cannot complete the
 * listening fold, absorb the seed, start the morph, change a cell, or mutate a gate.
 */
export class SurfaceWakeEcologicalCausalitySystem {
  constructor({ recipeDataSystem, chemObjectSystem, scene, playerRoot, frameState }) {
    if (!recipeDataSystem) throw new Error("[SurfaceWakeEcologicalCausalitySystem] recipeDataSystem is required.");
    if (!chemObjectSystem) throw new Error("[SurfaceWakeEcologicalCausalitySystem] chemObjectSystem is required.");
    if (!scene) throw new Error("[SurfaceWakeEcologicalCausalitySystem] scene is required.");
    if (!playerRoot) throw new Error("[SurfaceWakeEcologicalCausalitySystem] playerRoot is required.");
    if (!frameState) throw new Error("[SurfaceWakeEcologicalCausalitySystem] frameState is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.chemObjectSystem = chemObjectSystem;
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;

    this.recipe = null;
    this.startPosition = new THREE.Vector3();
    this.awakeningSeconds = 0;
    this.noticed = false;
    this.departureExpression = "unexpressed";
    this.persistentEcho = "none";
    this.lastPulseEventId = 0;
    this.lastCircuitOutcomeSequence = 0;
    this.lastMeaningfulAction = "awakening_stir";
    this.lastWorldResponse = "nursery_holding_quiet";
    this.motesEmbodied = false;
    this.lastPhase = "inactive";
    this.phaseEnteredAt = 0;

    this.root = null;
    this.answerNodes = [];
    this.seedPetals = [];
    this.seamLine = null;
    this.altitudeFilament = null;
    this.altitudeAnchor = null;
    this.altitudeLandmarks = [];
    this.volumeMotes = [];
    this.temp = new THREE.Vector3();
  }

  init() {
    this.recipe = this.recipeDataSystem.data.surfaceWakeEcologicalCausality;
    if (!this.recipe || this.recipe.id !== RECIPE_ID) {
      throw new Error(`[SurfaceWakeEcologicalCausalitySystem] Missing ${RECIPE_ID}.`);
    }
    this.startPosition.copy(this.playerRoot.position);
    this.createVisuals();
    this.frameState.surfaceWakeEcology = this.createState(false);
  }

  update(dt, frameState) {
    const inNursery = frameState.activeCellId === CELL_ID;
    if (!inNursery) {
      this.setVisible(false);
      frameState.surfaceWakeEcology = this.createState(false);
      return;
    }

    this.setVisible(true);
    this.awakeningSeconds += dt;
    const movedDistance = this.playerRoot.position.distanceTo(this.startPosition);
    if (!this.noticed && (movedDistance >= (this.recipe.awakening?.noticeMoveDistance ?? 0.18) || this.awakeningSeconds >= (this.recipe.awakening?.noticeAfterSeconds ?? 1.25))) {
      this.noticed = true;
      this.lastMeaningfulAction = movedDistance >= 0.18 ? "first_movement" : "first_presence";
      this.lastWorldResponse = "watcher_noticed_tender_guarded_current_inhaled";
    }

    const layered = frameState.surfaceWakeLayeredInteraction ?? {};
    const gameplay = frameState.surfaceWakeGameplay ?? {};
    const circuit = frameState.nurseryCircuit ?? {};
    const seed = this.findObject(SEED_ID);
    const seedAbsorbed = Boolean(seed?.absorbed || seed?.root?.userData?.absorbed);
    const morph = frameState.localCellMorph ?? {};

    this.readMeaningfulAction(frameState, layered, gameplay, circuit, seedAbsorbed);
    this.captureDepartureExpression(frameState, seedAbsorbed);

    const phase = this.resolvePhase(layered, seedAbsorbed, morph);
    if (phase !== this.lastPhase) {
      this.lastPhase = phase;
      this.phaseEnteredAt = frameState.runtimeSeconds ?? 0;
    }
    const careState = this.resolveCareState(phase, gameplay, circuit);
    const circulationState = this.resolveCirculationState(gameplay, circuit);
    const sensoryState = this.resolveSensoryState(gameplay, circuit);
    const currentPhase = this.resolveCurrentPhase(frameState.runtimeSeconds ?? 0, gameplay);
    const recoveryAvailable = Boolean(gameplay.unsafeNearScar || frameState.input?.absorbHeld);
    const combination = gameplay.mechanicalCombination ?? {};
    if (combination.stage === "read_contamination_in_flow") {
      this.lastWorldResponse = "watcher_marks_contamination_while_current_keeps_carrying_it";
    } else if (combination.stage === "changing_matter_while_carried") {
      this.lastWorldResponse = "tender_tracks_filtering_as_current_and_matter_change_together";
    } else if (combination.stage === "flow_and_matter_brought_into_safe_relationship") {
      this.lastWorldResponse = "tender_softens_as_carried_matter_becomes_compatible";
    } else if (combination.stage === "commit_unresolved_contamination") {
      this.lastWorldResponse = "watcher_warns_core_committed_before_relationship_was_safe";
    }

    this.applyWorldMeaning({ phase, careState, circulationState, sensoryState, currentPhase, seed });
    this.applyVisualEmbodiment(frameState, phase, sensoryState);
    this.animateResponseChain(frameState.runtimeSeconds ?? 0, layered, phase);
    this.animateSeedPresentation(frameState.runtimeSeconds ?? 0, phase, seed);
    this.animateExitSeam(frameState.runtimeSeconds ?? 0, phase);
    this.animateVerticalReadability(frameState);

    frameState.surfaceWakeEcology = this.createState(true, {
      phase,
      careState,
      circulationState,
      sensoryState,
      currentPhase,
      movedDistance,
      seedAbsorbed,
      recoveryAvailable,
      foldStage: layered.stage ?? "surface_wake_inactive",
      foldResponseTraveling: Boolean(layered.stageIndex >= 3 && layered.stageIndex < 5),
      seedPresented: phase === "receive" || phase === "outgrow" || phase === "depart",
      seamReadable: phase === "outgrow" || phase === "depart",
      nurseryCircuit: circuit
    });
  }

  readMeaningfulAction(frameState, layered, gameplay, circuit, seedAbsorbed) {
    const pulseEventId = frameState.input?.pulseEventId ?? 0;
    if (frameState.input?.pulsePressed && pulseEventId > 0 && pulseEventId !== this.lastPulseEventId) {
      this.lastPulseEventId = pulseEventId;
      const affected = frameState.pulse?.affectedObjects ?? [];
      if (affected.includes(SIGNAL_ID)) {
        this.lastMeaningfulAction = "pulse_signal_thread";
        this.lastWorldResponse = "signal_carried_answer_toward_fold";
      } else if (affected.includes(CURRENT_ID)) {
        this.lastMeaningfulAction = "pulse_current";
        this.lastWorldResponse = "current_agitated_next_swell_strengthened";
      } else if (affected.includes(SCAR_ID)) {
        this.lastMeaningfulAction = "pulse_scar";
        this.lastWorldResponse = "scar_hardened_watcher_concentrated";
      } else if (layered.stageIndex >= 1 && layered.stageIndex <= 2) {
        this.lastMeaningfulAction = "pulse_listening_fold";
        this.lastWorldResponse = "fold_received_question";
      }
    }

    if (frameState.input?.stabilizeHeld && (gameplay.pressureIntensity ?? 0) >= 0.48) {
      this.lastMeaningfulAction = "brace_through_pressure";
      this.lastWorldResponse = "current_bent_around_stable_core";
    }
    if (gameplay.absorbedMoteCount > 0) {
      this.lastMeaningfulAction = `accepted_${gameplay.lastAbsorbedMoteRole ?? "compatible_matter"}`;
      this.lastWorldResponse = gameplay.lastAbsorbedMoteResponse ?? "nursery_noted_nourishment";
    }
    if (
      (circuit.lastOutcomeSequence ?? 0) > 0
      && circuit.lastOutcomeSequence !== this.lastCircuitOutcomeSequence
    ) {
      this.lastCircuitOutcomeSequence = circuit.lastOutcomeSequence;
      this.lastMeaningfulAction = circuit.lastOutcome ?? "altered_nursery_cycle";
      this.lastWorldResponse = circuit.lastOutcome === "tender_strained_scar_spread"
        ? "tender_tightened_watcher_warned_scar_spread"
        : circuit.lastOutcome === "tender_strained_by_unread_contamination"
          ? "unread_contamination_strained_the_tender_without_proving_core_agency"
          : circuit.lastOutcome === "tender_passively_received_clean_matter"
            ? "nursery_maintained_itself_but_the_core_left_no_authored_consequence"
        : circuit.lastOutcome === "core_absorbed_scar_contamination"
          ? "core_took_risk_tender_guarded_watcher_recorded"
          : circuit.lastOutcome?.startsWith("tender_fed")
            ? "tender_fed_filter_recovered_watcher_revealed_fold"
            : "core_nourished_tender_trust_shifted";
    }
    if (seedAbsorbed) {
      this.lastMeaningfulAction = "accepted_protected_seed";
      this.lastWorldResponse = "grown_core_distorted_nursery_circuit";
    }
  }

  captureDepartureExpression(frameState, seedAbsorbed) {
    if (!seedAbsorbed || this.departureExpression !== "unexpressed" || !frameState.input?.pulsePressed) return;
    const affected = frameState.pulse?.affectedObjects ?? [];
    if (affected.includes(SIGNAL_ID)) {
      this.departureExpression = "resonant_offered_seam";
      this.persistentEcho = "listened_for_offered_path";
    } else if (affected.includes(SCAR_ID)) {
      this.departureExpression = "pressure_remembered_seam";
      this.persistentEcho = "used_existing_weakness";
    }
  }

  resolvePhase(layered, seedAbsorbed, morph) {
    if ((morph.progress ?? 0) > 0 || morph.phase === "completed") return "depart";
    if (seedAbsorbed) return "outgrow";
    if (layered.completed) return "receive";
    if ((layered.stageIndex ?? 0) >= 1) return "communicate";
    if (this.noticed) return "observe";
    return "awaken";
  }

  resolveCareState(phase, gameplay, circuit) {
    if (phase === "depart") return "repairing_departure_seam";
    if (phase === "outgrow") return "making_room_for_grown_core";
    if (phase === "receive") return "presenting_protected_nourishment";
    if (circuit.functionState === "filter_strained") return "strained_filter_guarding_seed";
    if (circuit.foodState === "tender_has_received_food") return "fed_filter_repairing";
    if (circuit.packetActive && circuit.packetProgress >= 0.68) return "filtering_incoming_matter";
    if (gameplay.unsafeNearScar) return "defending_wound_boundary";
    if ((gameplay.absorbedMoteRoles ?? []).includes("safe_filtered_nourishment")) return "trust_softening";
    return this.noticed ? "guarding_seed_while_observing" : "quiet_protection";
  }

  resolveCirculationState(gameplay, circuit) {
    if (circuit.packetActive && circuit.packetIdentified) return "identified_matter_in_transit";
    if (circuit.packetActive) return "matter_carrying_current";
    if (gameplay.stabilizing && gameplay.pressureIntensity >= 0.48) return "bending_around_stable_core";
    if (gameplay.currentAgitated) return "agitated_by_pulse";
    if (gameplay.cyclePhase === "calm_window") return "calm_window_open";
    return gameplay.cyclePhase ?? "breathing_cycle";
  }

  resolveSensoryState(gameplay, circuit) {
    if (circuit.foldInvitation) return "watcher_revealing_listening_fold";
    if (circuit.packetActive && circuit.packetPurity < 0.4 && circuit.packetIdentified) return "warning_contamination";
    if (circuit.packetActive && circuit.packetIdentified) return "matter_identity_confirmed";
    if (gameplay.unsafeNearScar) return "warning_scar_contact";
    if ((gameplay.worldReads ?? []).includes(SCAR_ID)) return "scar_memory_noted";
    if ((gameplay.worldReads ?? []).includes(SIGNAL_ID)) return "signal_answer_recorded";
    return this.noticed ? "tracking_new_core" : "dormant_attention";
  }

  resolveCurrentPhase(runtimeSeconds, gameplay) {
    if (gameplay.currentAgitated) return "agitated_surge";
    if (gameplay.cyclePhase) return gameplay.cyclePhase;
    const cycle = Math.max(2, this.recipe.circulation?.cycleSeconds ?? 6.2);
    const unit = (runtimeSeconds % cycle) / cycle;
    if (unit < 0.18) return "membrane_inhale";
    if (unit < 0.48) return "pressure_build";
    if (unit < 0.68) return "matter_carry";
    return "calm_window";
  }

  applyWorldMeaning({ phase, careState, circulationState, sensoryState, currentPhase, seed }) {
    const signal = this.findObject(SIGNAL_ID);
    const current = this.findObject(CURRENT_ID);
    const scar = this.findObject(SCAR_ID);
    if (signal) signal.root.userData.ecologicalRole = "communication_carrier";
    if (current) {
      current.root.userData.ecologicalRole = "living_circulation";
      current.root.userData.currentPhase = currentPhase;
      current.root.userData.circulationState = circulationState;
    }
    if (scar) {
      scar.root.userData.ecologicalRole = "wound_memory_boundary";
      scar.root.userData.sensoryState = sensoryState;
    }
    if (seed) {
      seed.root.userData.ecologicalRole = "offered_protected_nourishment";
      seed.root.userData.presentationState = phase === "receive" ? "offered" : phase;
    }
    if (this.root) {
      this.root.userData.phase = phase;
      this.root.userData.careState = careState;
    }
  }

  applyVisualEmbodiment(frameState, phase, sensoryState) {
    const tender = this.scene.getObjectByName("nursery_membrane_tender_001");
    const watcher = this.scene.getObjectByName("membrane_watcher_001");
    const guide = this.scene.getObjectByName("guide_orbiter_folded_lantern_001");
    const fold = this.scene.getObjectByName("surface_wake_listening_fold_001");
    const scar = this.findObject(SCAR_ID)?.root;
    const current = this.findObject(CURRENT_ID)?.root;
    const signal = this.findObject(SIGNAL_ID)?.root;
    const seed = this.findObject(SEED_ID)?.root;

    if (!this.motesEmbodied) {
      this.applyMoteIdentity("surface_wake_membrane_mote_001", "soft_membrane_droplet", 0x9ff0c9, new THREE.Vector3(0.82, 1.18, 0.82));
      this.applyMoteIdentity("surface_wake_membrane_mote_002", "current_carried_bead", 0x83dcff, new THREE.Vector3(1.38, 0.68, 0.78));
      this.applyMoteIdentity("surface_wake_membrane_mote_003", "sharp_scar_edge_fragment", 0xff9c86, new THREE.Vector3(0.72, 1.28, 0.54));
      this.motesEmbodied = true;
    }

    if (tender) tender.userData.visualIdentity = "broad_cupped_seed_guardian";
    if (watcher) watcher.userData.visualIdentity = "single_lens_sensory_anchor";
    if (guide) guide.userData.visualIdentity = "small_folded_lantern_interpreter";
    if (fold) fold.userData.visualIdentity = "wall_embedded_receptive_membrane";
    if (scar) scar.userData.visualIdentity = "wall_embedded_hardened_rupture";
    if (current) current.userData.visualIdentity = "directional_cross_chamber_current_lane";
    if (signal) signal.userData.visualIdentity = "nerve_thread_between_wound_and_fold";
    if (seed) seed.userData.visualIdentity = "tender_enclosed_warm_nourishment";

    const relationshipActive = phase === "communicate" || phase === "receive" || phase === "outgrow";
    const seedEffects = seed
      ? [
          ...this.childrenByName(seed, "safe_absorb_readability_ring"),
          ...this.childrenByName(seed, "soft_safe_seed_outer_pulse"),
          ...this.childrenByName(seed, "protective_pod_rib"),
          ...this.childrenByName(seed, "split_protective_seed_shell_petal")
        ]
      : [];
    for (const effect of seedEffects) {
      effect.visible = false;
    }
    if (seed) {
      const inner = seed.getObjectByName("warm_inner_seed_glow");
      if (inner?.material) {
        inner.material.emissiveIntensity = phase === "receive" ? 1.05 : 0.48;
      }
    }

    this.playerRoot.scale.setScalar(relationshipActive ? 1.08 : 1.14);

    const quietOpacity = phase === "communicate" ? 0.16 : 0.08;
    const signalFilaments = signal ? [signal.getObjectByName("thin_luminous_signal_thread"), ...this.childrenByName(signal, "secondary_signal_filament")].filter(Boolean) : [];
    for (const filament of signalFilaments) {
      if (filament.material) filament.material.opacity = phase === "communicate" ? 0.5 : quietOpacity;
    }

    const guideOuterRing = guide?.getObjectByName("larger_interpreter_answer_ring");
    if (guideOuterRing?.material) {
      guideOuterRing.material.opacity = frameState.orbiterState?.shimmerActive ? 0.16 : 0;
    }

    const scarPlate = scar?.getObjectByName("dark_hardened_scar_plate");
    if (scarPlate?.material) {
      scarPlate.material.opacity = 1;
      scarPlate.material.emissiveIntensity = sensoryState === "warning_scar_contact" ? 0.55 : 0.12;
    }

    this.applyLivingStateVisuals(frameState, tender, watcher, scar, signal);
  }

  applyLivingStateVisuals(frameState, tender, watcher, scar, signal) {
    const circuit = frameState.nurseryCircuit ?? {};
    const livingState = circuit.livingState ?? "cautious";
    const age = circuit.livingStateAge ?? 0;
    const pulse = 0.5 + 0.5 * Math.sin((frameState.runtimeSeconds ?? 0) * 2.6);
    const stateStyle = livingState === "blooming"
      ? { color: 0x92e6a6, accent: 0xffd27d, emissive: 0x3e8d5e, accentEmissive: 0xb86b27, body: [1.12, 1.08, 1.12], frond: [1.12, 1.28, 1.12], opacity: 1.08, glow: 0.34 + pulse * 0.12 }
      : livingState === "withered"
        ? { color: 0x777a91, accent: 0x8c756e, emissive: 0x29263d, accentEmissive: 0x3b2d2c, body: [0.82, 0.72, 0.78], frond: [0.68, 0.58, 0.70], opacity: 0.55, glow: 0.08 }
        : livingState === "panic"
          ? { color: 0xc86e62, accent: 0xffa262, emissive: 0x762f31, accentEmissive: 0xa43e28, body: [0.76, 1.24, 0.72], frond: [0.58, 1.12, 0.60], opacity: 0.88, glow: 0.46 + pulse * 0.22 }
          : livingState === "embrace"
            ? { color: 0xaddfc5, accent: 0xffdfa1, emissive: 0x4c8f7e, accentEmissive: 0x9d6b36, body: [1.26, 0.92, 1.20], frond: [1.34, 0.88, 1.28], opacity: 0.98, glow: 0.28 }
            : livingState === "growth"
              ? { color: 0xb7dc88, accent: 0xffce68, emissive: 0x6e8838, accentEmissive: 0xb17224, body: [1.18, 1.17, 1.14], frond: [1.10, 1.46, 1.12], opacity: 1.1, glow: 0.38 }
              : { color: null, accent: null, emissive: null, accentEmissive: null, body: [0.98, 1, 0.96], frond: [0.94, 1.02, 0.92], opacity: 1, glow: 0.16 };

    if (tender) {
      tender.userData.livingState = livingState;
      tender.userData.livingStateAge = age;
      tender.userData.livingStatePass = "HC-023B";
      tender.traverse((child) => {
        if (!child.isMesh || !child.material) return;
        if (!child.userData.hc023bBaseScale) child.userData.hc023bBaseScale = child.scale.toArray();
        if (!child.userData.hc023bBaseMaterial) {
          child.userData.hc023bBaseMaterial = {
            color: child.material.color?.getHex(),
            emissive: child.material.emissive?.getHex(),
            emissiveIntensity: child.material.emissiveIntensity ?? 0,
            opacity: child.material.opacity ?? 1
          };
        }
        const base = child.userData.hc023bBaseScale;
        const baseMaterial = child.userData.hc023bBaseMaterial;
        const scale = child.name.includes("frond") ? stateStyle.frond : stateStyle.body;
        const accent = child.name.includes("seed_sac");
        child.scale.set(base[0] * scale[0], base[1] * scale[1], base[2] * scale[2]);
        if (child.material.color) child.material.color.setHex(
          stateStyle.color === null ? baseMaterial.color : accent ? stateStyle.accent : stateStyle.color
        );
        if (child.material.emissive) child.material.emissive.setHex(
          stateStyle.emissive === null ? baseMaterial.emissive : accent ? stateStyle.accentEmissive : stateStyle.emissive
        );
        if ("emissiveIntensity" in child.material) {
          child.material.emissiveIntensity = livingState === "cautious" ? baseMaterial.emissiveIntensity : stateStyle.glow;
        }
        if (child.material.transparent) child.material.opacity = Math.min(1, baseMaterial.opacity * stateStyle.opacity);
      });
      const seedGlow = tender.getObjectByName("tender_seed_sac_glow");
      if (seedGlow) seedGlow.intensity = livingState === "withered" ? 0.16 : livingState === "panic" ? 0.72 : 0.44 + pulse * 0.12;
    }

    const warningRing = watcher?.getObjectByName("small_warning_pulse_ring");
    if (warningRing?.material) {
      warningRing.material.opacity = livingState === "panic"
        ? 0.38 + pulse * 0.28
        : livingState === "withered" ? 0.12 : 0.03;
    }
    const signalThread = watcher?.getObjectByName("anchoring_signal_thread");
    if (signalThread?.material) {
      signalThread.material.opacity = livingState === "panic" ? 0.62 : livingState === "embrace" ? 0.28 : 0.14;
    }

    const scarPlate = scar?.getObjectByName("dark_hardened_scar_plate");
    if (scarPlate?.material && livingState === "panic") {
      scarPlate.material.emissiveIntensity = Math.max(scarPlate.material.emissiveIntensity, 0.46 + pulse * 0.18);
    }
    const signalFilaments = signal
      ? [signal.getObjectByName("thin_luminous_signal_thread"), ...this.childrenByName(signal, "secondary_signal_filament")].filter(Boolean)
      : [];
    for (const filament of signalFilaments) {
      if (!filament.material) continue;
      if (livingState === "panic") filament.material.opacity = Math.max(filament.material.opacity, 0.42 + pulse * 0.18);
      if (livingState === "embrace") filament.material.opacity = Math.max(filament.material.opacity, 0.24);
    }
  }

  childrenByName(root, name) {
    const matches = [];
    root?.traverse((child) => {
      if (child.name === name) matches.push(child);
    });
    return matches;
  }

  applyMoteIdentity(id, identity, color, localScale) {
    const root = this.findObject(id)?.root;
    if (!root) return;
    root.userData.visualIdentity = identity;
    root.userData.moteIdentityPass = "HC-008C";
    const pod = root.getObjectByName("protected_outer_seed_pod");
    if (pod) {
      pod.scale.multiply(localScale);
      if (pod.material?.color) pod.material.color.setHex(color);
      if (pod.material?.emissive) pod.material.emissive.setHex(color).multiplyScalar(0.14);
    }
    const inner = root.getObjectByName("warm_inner_seed_glow");
    if (inner?.material?.color) inner.material.color.setHex(color);
    for (const name of ["safe_absorb_readability_ring", "soft_safe_seed_outer_pulse", "protective_pod_rib", "split_protective_seed_shell_petal"]) {
      for (const child of this.childrenByName(root, name)) {
        child.visible = false;
      }
    }
  }

  createVisuals() {
    this.root = new THREE.Group();
    this.root.name = "surface_wake_visual_embodiment_HC008C";
    this.root.userData.targetingSuppressed = true;
    this.root.userData.directTriggerCompletion = false;
    this.scene.add(this.root);

    const answerMaterial = new THREE.MeshBasicMaterial({
      color: 0x9fe8ff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    for (let index = 0; index < 7; index += 1) {
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), answerMaterial.clone());
      node.name = `surface_wake_answer_relay_${index + 1}`;
      node.userData.targetingSuppressed = true;
      this.root.add(node);
      this.answerNodes.push(node);
    }

    const petalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffd69b,
      emissive: 0x4a2508,
      emissiveIntensity: 0.2,
      roughness: 0.48,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    for (let index = 0; index < 3; index += 1) {
      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 14, 8, 0, Math.PI * 0.82, 0.35, Math.PI * 0.62),
        petalMaterial.clone()
      );
      petal.name = `surface_wake_seed_presentation_petal_${index + 1}`;
      petal.userData.targetingSuppressed = true;
      petal.scale.set(1.18, 0.48, 0.84);
      this.root.add(petal);
      this.seedPetals.push(petal);
    }

    const seamGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const seamMaterial = new THREE.LineBasicMaterial({ color: 0xc7b4ff, transparent: true, opacity: 0 });
    this.seamLine = new THREE.Line(seamGeometry, seamMaterial);
    this.seamLine.name = "surface_wake_shared_exit_seam";
    this.seamLine.userData.targetingSuppressed = true;
    this.root.add(this.seamLine);

    this.createVerticalLandmarks();
  }

  animateResponseChain(t, layered, phase) {
    const signal = this.findObject(SIGNAL_ID);
    const current = this.findObject(CURRENT_ID);
    const seed = this.findObject(SEED_ID);
    const points = [
      new THREE.Vector3(-3.55, 0.28, -2.75),
      signal?.root.position ?? new THREE.Vector3(-1.8, 0.25, -1.5),
      current?.root.position ?? new THREE.Vector3(0, 0, 0),
      seed?.root.position ?? new THREE.Vector3(1.25, 0.15, 1.2)
    ];
    const phaseAge = Math.max(0, t - this.phaseEnteredAt);
    const traveling = (layered.stageIndex >= 3 && layered.stageIndex <= 4)
      || (phase === "receive" && phaseAge <= 1.15);
    for (let index = 0; index < this.answerNodes.length; index += 1) {
      const node = this.answerNodes[index];
      const pathT = ((t * 0.32 + index / this.answerNodes.length) % 1) * 3;
      const segment = Math.min(2, Math.floor(pathT));
      const local = pathT - segment;
      node.position.copy(points[segment]).lerp(points[segment + 1], local);
      node.material.opacity = traveling ? 0.2 + Math.sin((t + index) * 4) * 0.08 : 0;
      node.scale.setScalar(0.75 + Math.sin((t + index) * 3.1) * 0.18);
    }
  }

  animateSeedPresentation(t, phase, seed) {
    const phaseAge = Math.max(0, t - this.phaseEnteredAt);
    const visible = Boolean(seed && phase === "receive" && phaseAge <= 2.2);
    for (let index = 0; index < this.seedPetals.length; index += 1) {
      const petal = this.seedPetals[index];
      if (seed) petal.position.copy(seed.root.position);
      petal.rotation.set(
        -0.6 + index * 0.58,
        t * (index % 2 ? -0.08 : 0.07) + index * 2.05,
        -0.22 + index * 0.18
      );
      const open = visible ? Math.min(1, phaseAge / 0.7) : 0;
      petal.scale.set(1.18 + open * 0.35, 0.48, 0.84 + open * 0.25);
      petal.material.opacity = visible ? (0.22 - phaseAge * 0.045) : 0;
    }
  }

  animateExitSeam(t, phase) {
    const scar = this.findObject(SCAR_ID);
    const signal = this.findObject(SIGNAL_ID);
    const readable = Boolean(scar && signal && (phase === "outgrow" || phase === "depart"));
    if (readable) {
      this.seamLine.geometry.setFromPoints([scar.root.position, signal.root.position]);
      this.seamLine.material.color.setHex(this.departureExpression === "pressure_remembered_seam" ? 0xffa98e : 0xb9eaff);
      this.seamLine.material.opacity = 0.18 + Math.sin(t * 2.4) * 0.06;
    } else {
      this.seamLine.material.opacity = 0;
    }
  }

  animateVerticalReadability(frameState) {
    const y = this.playerRoot.position.y;
    this.animateVerticalLandmarks(frameState.runtimeSeconds ?? 0, y);
  }

  createVerticalLandmarks() {
    const landmarkSpecs = [
      { name: "lower_wound_shelf", position: [-3.2, -2.55, -2.35], scale: [1.7, 0.34, 0.82], color: 0x6a2630, layer: "background" },
      { name: "lower_foreground_lip", position: [3.25, -2.35, 2.35], scale: [1.3, 0.4, 0.72], color: 0x54343c, layer: "foreground" },
      { name: "mid_current_shelf", position: [2.75, -0.15, -3.25], scale: [1.45, 0.28, 0.74], color: 0x266f72, layer: "background" },
      { name: "mid_foreground_fold", position: [-3.45, 0.2, 1.8], scale: [1.18, 0.3, 0.68], color: 0x285763, layer: "foreground" },
      { name: "upper_listening_shelf", position: [-2.4, 2.35, -3.95], scale: [1.35, 0.3, 0.7], color: 0x365d72, layer: "background" },
      { name: "upper_foreground_rib", position: [3.35, 2.5, 1.15], scale: [1.2, 0.32, 0.62], color: 0x3d6570, layer: "foreground" }
    ];
    for (const spec of landmarkSpecs) {
      const landmark = new THREE.Mesh(
        new THREE.SphereGeometry(0.72, 18, 10),
        new THREE.MeshStandardMaterial({
          color: spec.color,
          emissive: spec.color,
          emissiveIntensity: 0.08,
          roughness: 0.86,
          transparent: true,
          opacity: spec.layer === "foreground" ? 0.2 : 0.28,
          depthWrite: true
        })
      );
      landmark.name = `surface_wake_altitude_landmark_${spec.name}`;
      landmark.position.set(...spec.position);
      landmark.scale.set(...spec.scale);
      landmark.userData.targetingSuppressed = true;
      landmark.userData.altitudeBand = spec.name.split("_")[0];
      landmark.userData.depthLayer = spec.layer;
      landmark.userData.authoredProxyBody = true;
      landmark.userData.baseZ = landmark.position.z;
      this.root.add(landmark);
      this.altitudeLandmarks.push(landmark);
    }

    for (let index = 0; index < 30; index += 1) {
      const band = index % 3;
      const mote = new THREE.Mesh(
        new THREE.SphereGeometry(0.022 + (index % 4) * 0.007, 7, 5),
        new THREE.MeshBasicMaterial({
          color: band === 0 ? 0xff9a82 : band === 1 ? 0x82e7df : 0xa8dbff,
          transparent: true,
          opacity: 0.12,
          depthWrite: false
        })
      );
      mote.name = `surface_wake_volume_mote_${index + 1}`;
      mote.position.set(
        -4.6 + ((index * 1.77) % 9.2),
        -2.7 + band * 2.45 + ((index % 2) * 0.28),
        -5.2 + ((index * 1.13) % 9.4)
      );
      mote.userData.baseY = mote.position.y;
      mote.userData.baseZ = mote.position.z;
      mote.userData.phase = index * 0.73;
      mote.userData.depthLayer = mote.position.z > 1.1
        ? "foreground"
        : mote.position.z < -2.1
          ? "background"
          : "middle";
      mote.userData.targetingSuppressed = true;
      this.root.add(mote);
      this.volumeMotes.push(mote);
    }
  }

  animateVerticalLandmarks(t, playerY) {
    const livingState = this.frameState.nurseryCircuit?.livingState ?? "cautious";
    const livingMotion = livingState === "panic" ? 1.85
      : livingState === "blooming" ? 1.28
      : livingState === "growth" ? 1.16
      : livingState === "withered" ? 0.42
      : livingState === "embrace" ? 0.72
      : 1;
    const livingOpacity = livingState === "withered" ? 0.48
      : livingState === "panic" ? 1.18
      : livingState === "blooming" ? 1.22
      : livingState === "growth" ? 1.12
      : livingState === "embrace" ? 0.86
      : 1;
    this.altitudeLandmarks.forEach((landmark, index) => {
      const separation = Math.abs(playerY - landmark.position.y);
      landmark.material.emissiveIntensity = 0.06 + Math.max(0, 1 - separation / 2.3) * 0.12;
      landmark.position.z = landmark.userData.baseZ + Math.sin(t * 0.32 + index) * 0.055;
    });
    this.volumeMotes.forEach((mote) => {
      mote.position.y = mote.userData.baseY + Math.sin(t * 0.55 * livingMotion + mote.userData.phase) * 0.13 * livingMotion;
      mote.position.z = mote.userData.baseZ + Math.sin(t * 0.42 * livingMotion + mote.userData.phase) * 0.08 * livingMotion;
      const layerOpacity = mote.userData.depthLayer === "foreground" ? 0.14 : mote.userData.depthLayer === "background" ? 0.08 : 0.11;
      mote.material.opacity = (layerOpacity + (Math.sin(t * 0.8 * livingMotion + mote.userData.phase) + 1) * 0.025) * livingOpacity;
    });
  }

  createState(active, extra = {}) {
    const phase = extra.phase ?? (active ? "awaken" : "inactive");
    return {
      pass: "HC-023B",
      id: RECIPE_ID,
      active: Boolean(active),
      phase,
      worldCondition: this.recipe?.phaseMeaning?.[phase] ?? "Surface Wake inactive.",
      playerQuestion: this.recipe?.playerQuestion ?? "What is this living pocket doing?",
      noticed: Boolean(active && this.noticed),
      awakeningSeconds: active ? this.awakeningSeconds : 0,
      movedDistance: active ? (extra.movedDistance ?? 0) : 0,
      careState: extra.careState ?? "inactive",
      circulationState: extra.circulationState ?? "inactive",
      sensoryState: extra.sensoryState ?? "inactive",
      currentPhase: extra.currentPhase ?? "inactive",
      foldStage: extra.foldStage ?? "inactive",
      foldResponseTraveling: Boolean(extra.foldResponseTraveling),
      seedPresented: Boolean(extra.seedPresented),
      seedAbsorbed: Boolean(extra.seedAbsorbed),
      seamReadable: Boolean(extra.seamReadable),
      departureExpression: this.departureExpression,
      persistentEcho: this.persistentEcho,
      lastMeaningfulAction: this.lastMeaningfulAction,
      lastWorldResponse: this.lastWorldResponse,
      recoveryAvailable: Boolean(extra.recoveryAvailable),
      triggerReadinessObserved: Boolean(this.frameState.surfaceWakeLayeredInteraction?.completed),
      triggerOwner: "SurfaceWakeLayeredInteractionSystem → BondSystem → LocalCellMorphSystem",
      directTriggerCompletion: false,
      directSeedAbsorption: false,
      directMorphActivation: false,
      directCellChange: false,
      directGateMutation: false,
      newEntityCount: 0,
      newRouteCount: 0,
      newRegionCount: 0,
      visualEmbodiment: "authored_proxy_anatomy_and_embodied_volumetric_motion",
      silhouetteClasses: ["seed_core", "tender", "watcher", "guide", "fold", "seed", "current", "scar", "signal"],
      spatialZones: ["awakening_pocket", "current_lane", "listening_wall", "protected_seed_pocket", "wounded_exit_seam"],
      verticalLayers: ["lower_scar_floor", "mid_current_and_seed", "upper_fold_and_watcher"],
      verticalTraversalActive: true,
      verticalControls: "RB/LB or D-Pad Up/Down · C/Z · PageUp/PageDown",
      focalEffectsPolicy: "one_short_lived_relationship_effect_at_a_time",
      permanentResonanceEffects: false,
      verticalDepthFeedback: "true_camera_pitch_motion_lagged_camera_anchor_parallax_occlusion_and_six_anatomy_bodies",
      altitudeLandmarks: this.altitudeLandmarks.map((landmark) => landmark.name),
      volumeMoteCount: this.volumeMotes.length,
      foregroundBodyCount: this.altitudeLandmarks.filter((landmark) => landmark.userData.depthLayer === "foreground").length,
      backgroundBodyCount: this.altitudeLandmarks.filter((landmark) => landmark.userData.depthLayer === "background").length,
      altitudeFilamentRemoved: true,
      idleSeedPocketRingsSuppressed: true,
      nurseryCircuit: extra.nurseryCircuit ?? {},
      livingCircuitOwner: "SurfaceWakeGameplaySystem",
      livingState: extra.nurseryCircuit?.livingState ?? "cautious",
      livingStateVisualAuthority: "existing Tender anatomy, Watcher signals, scar light, and volume motes only",
      ecologyRemainsObserver: true,
      nurseryAgencyProven: Boolean(extra.nurseryCircuit?.agencyProven),
      passiveEcologyDoesNotEqualPlayerAgency: true,
      nextAction: this.nextAction(phase, extra.nurseryCircuit ?? {})
    };
  }

  nextAction(phase, circuit = {}) {
    if (phase === "awaken") return "Move and let the nursery notice you.";
    if (phase === "observe") {
      if (circuit.foldInvitation) return "Follow the Watcher's turn toward the Listening Fold.";
      return circuit.nextAction ?? "Read how care, current, and scar respond.";
    }
    if (phase === "communicate") return "Let the fold's answer travel through the nursery.";
    if (phase === "receive") return "Accept the nourishment the Tender has presented.";
    if (phase === "outgrow") return "Read the shared seam; Pulse signal or scar to express how you leave.";
    if (phase === "depart") return "Follow the opening while the Tender repairs behind you.";
    return "Return to Surface Wake.";
  }

  findObject(id) {
    return this.chemObjectSystem.objects.find((item) => item.recipe.id === id) ?? null;
  }

  setVisible(visible) {
    if (this.root) this.root.visible = Boolean(visible);
  }
}
