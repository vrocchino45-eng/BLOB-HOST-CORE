export class MotionSignatureSystem {
  constructor({ visualComposer, frameState }) {
    if (!visualComposer) throw new Error("[MotionSignatureSystem] visualComposer is required.");

    this.visualComposer = visualComposer;
    this.frameState = frameState;
  }

  init() {
    this.frameState.visualCompositionState = {
      pass: "HC-002S",
      motionSignaturesActive: true,
      animatedParts: 0,
      readableVisuals: [
        "player_seed_core",
        "dormant_seed_pod",
        "scar_plate",
        "signal_thread",
        "flux_ribbon",
        "tender",
        "watcher",
        "guide",
        "scar_flow_fold",
        "resonant_path_thread",
        "signal_chorus_nerve",
        "choir_resonance_node",
        "listening_pore",
        "harmonic_wave_thread",
        "seed_signal_bridge",
        "bloom_residue_fork",
        "bloom_spore_lantern",
        "residue_memory_silt",
        "seed_choice_braid",
        "overgrowth_warning_tendril"
      ]
    };
  }

  update(dt, frameState) {
    let animatedParts = 0;
    const t = frameState.runtimeSeconds;

    for (const item of this.visualComposer.composedObjects) {
      const root = item.root;
      if (!root?.visible) continue;
      const recipeId = root.userData?.visualRecipe ?? "unknown";

      if (recipeId === "player_seed_core_stage_01") {
        animatedParts += frameState.coreEmbodiment?.active
          ? (frameState.coreEmbodiment?.authoredProxyParts?.fins ?? 0)
            + (frameState.coreEmbodiment?.authoredProxyParts?.trailingVeils ?? 0)
            + 3
          : this.animatePlayerSeed(root, t, frameState);
      } else if (recipeId === "dormant_seed_nutrient_v01") {
        animatedParts += this.animateDormantSeed(root, t, frameState);
      } else if (recipeId === "scar_contamination_plate_v01") {
        animatedParts += this.animateScarPlate(root, t, frameState);
      } else if (recipeId === "flux_current_ribbon_v01") {
        animatedParts += this.animateFluxRibbon(root, t, dt, frameState);
      } else if (recipeId === "signal_vapor_thread_v01") {
        animatedParts += this.animateSignalThread(root, t, dt, frameState);
      } else if (recipeId === "nursery_membrane_tender_v01") {
        animatedParts += this.animateTender(root, t, frameState);
      } else if (recipeId === "membrane_watcher_v01") {
        animatedParts += this.animateWatcher(root, t, frameState);
      } else if (recipeId === "guide_orbiter_folded_lantern_v01") {
        animatedParts += this.animateGuide(root, t, dt, frameState);
      } else if (recipeId === "scar_flow_fold_surface_v01") {
        animatedParts += this.animateScarFlowFold(root, t, dt, frameState);
      } else if (recipeId === "scar_pressure_haze_v01") {
        animatedParts += this.animateScarPressureHaze(root, t, frameState);
      } else if (recipeId === "scar_memory_fleck_v01") {
        animatedParts += this.animateScarMemoryFleck(root, t, dt, frameState);
      } else if (recipeId === "scar_flow_clot_v01") {
        animatedParts += this.animateScarFlowClot(root, t, dt, frameState);
      } else if (recipeId === "resonant_path_thread_v01") {
        animatedParts += this.animateResonantPathThread(root, t, dt, frameState);
      } else if (recipeId === "pressure_fold_current_v01") {
        animatedParts += this.animatePressureFoldCurrent(root, t, dt, frameState);
      } else if (recipeId === "signal_chorus_nerve_surface_v01") {
        animatedParts += this.animateSignalChorusSurface(root, t, dt, frameState);
      } else if (recipeId === "signal_chorus_soft_haze_v01") {
        animatedParts += this.animateSignalChorusHaze(root, t, frameState);
      } else if (recipeId === "choir_resonance_node_v01") {
        animatedParts += this.animateChoirResonanceNode(root, t, dt, frameState);
      } else if (recipeId === "listening_pore_membrane_v01") {
        animatedParts += this.animateListeningPore(root, t, frameState);
      } else if (recipeId === "harmonic_wave_thread_v01") {
        animatedParts += this.animateHarmonicWaveThread(root, t, dt, frameState);
      } else if (recipeId === "seed_signal_bridge_v01") {
        animatedParts += this.animateSeedSignalBridge(root, t, dt, frameState);
      } else if (recipeId === "bloom_spore_lantern_v01") {
        animatedParts += this.animateBloomSporeLantern(root, t, frameState);
      } else if (recipeId === "residue_memory_silt_v01") {
        animatedParts += this.animateResidueMemorySilt(root, t, frameState);
      } else if (recipeId === "seed_choice_braid_v01") {
        animatedParts += this.animateSeedChoiceBraid(root, t, dt, frameState);
      } else if (recipeId === "overgrowth_warning_tendril_v01") {
        animatedParts += this.animateOvergrowthWarningTendril(root, t, frameState);
      }
    }

    frameState.visualCompositionState = {
      ...(frameState.visualCompositionState ?? {}),
      motionSignaturesActive: true,
      animatedParts,
      lastUpdate: t
    };
  }

  animatePlayerSeed(root, t, frameState) {
    let count = 0;
    const pulseActive = Boolean(frameState.pulse?.active);
    const speed = frameState.playerKinematics?.speed ?? 0;
    const shell = root.getObjectByName("soft_membrane_shell");
    const inner = root.getObjectByName("inner_seed_light");
    const ring = root.getObjectByName("weak_signal_ring");

    if (shell) {
      const breathe = 1 + Math.sin(t * 2.2) * 0.035 + Math.min(speed, 1.4) * 0.018;
      shell.scale.setScalar(breathe);
      count += 1;
    }

    if (inner) {
      const glow = 1 + Math.sin(t * 3.8) * 0.06 + (pulseActive ? 0.16 : 0);
      inner.scale.setScalar(glow);
      count += 1;
    }

    if (ring) {
      ring.rotation.z += 0.018 + speed * 0.002;
      ring.scale.setScalar(1 + (pulseActive ? 0.18 : 0) + Math.sin(t * 4.0) * 0.025);
      count += 1;
    }

    return count;
  }

  animateDormantSeed(root, t, frameState) {
    let count = 0;
    const active = frameState.currentChemTarget === "dormant_seed_nutrient_001";
    const absorbing = frameState.bondState?.objectId === "dormant_seed_nutrient_001";
    const progress = frameState.bondState?.absorbProgress ?? 0;

    const inner = root.getObjectByName("warm_inner_seed_glow");
    const seam = root.getObjectByName("slightly_opening_seed_seam");
    const ribs = this.childrenByName(root, "protective_pod_rib");
    const safeRing = root.getObjectByName("safe_absorb_readability_ring");
    const outerPulse = root.getObjectByName("soft_safe_seed_outer_pulse");
    const presented = Boolean(frameState.surfaceWakeEcology?.seedPresented);

    if (inner) {
      const scale = 1 + Math.sin(t * 3.0) * 0.08 + progress * 0.28;
      inner.scale.setScalar(scale);
      count += 1;
    }

    if (seam) {
      seam.rotation.z += 0.012;
      seam.scale.setScalar(1 + (active ? 0.12 : 0.02) + progress * 0.18);
      if (seam.material) seam.material.opacity = 0.24 + progress * 0.42;
      count += 1;
    }

    ribs.forEach((rib, i) => {
      rib.rotation.z = Math.sin(t * 1.6 + i) * 0.08 + progress * 0.12;
      count += 1;
    });

    if (safeRing?.material) {
      safeRing.material.opacity = presented ? 0.12 + progress * 0.28 + (active ? 0.1 : 0) : 0;
      safeRing.scale.setScalar(1 + Math.sin(t * 2.2) * 0.035 + progress * 0.18);
      count += 1;
    }
    if (outerPulse?.material) {
      outerPulse.material.opacity = presented ? 0.05 + progress * 0.16 : 0;
      outerPulse.scale.setScalar(1 + ((t * 0.18) % 1) * 0.34);
      count += 1;
    }

    return count;
  }

  animateScarPlate(root, t, frameState) {
    let count = 0;
    const targeted = frameState.currentChemTarget === "scar_contamination_plate_001";
    const pulseActive = Boolean(frameState.pulse?.active);
    const cracks = this.childrenByName(root, "faint_inner_crack_glow");
    const warningHalo = root.getObjectByName("do_not_absorb_scar_warning_halo");

    cracks.forEach((crack, i) => {
      if (crack.material) {
        const flicker = Math.sin(t * 7.0 + i * 1.7) * 0.18;
        crack.material.opacity = 0.38 + flicker + (targeted ? 0.18 : 0) + (pulseActive ? 0.12 : 0);
      }
      count += 1;
    });

    const memoryMotes = this.childrenByName(root, "scar_memory_mote");
    memoryMotes.forEach((mote, i) => {
      mote.position.y = 0.12 + Math.sin(t * 1.7 + i) * 0.035;
      mote.rotation.y += 0.01 + i * 0.001;
      count += 1;
    });

    if (warningHalo?.material) {
      const warning = targeted || Boolean(frameState.surfaceWakeGameplay?.unsafeNearScar);
      warningHalo.material.opacity = warning ? 0.24 + Math.sin(t * 4.2) * 0.07 : 0;
      warningHalo.scale.setScalar(1 + Math.sin(t * 3.4) * 0.06);
      count += 1;
    }

    return count;
  }

  animateFluxRibbon(root, t, dt, frameState) {
    let count = 0;
    const active = frameState.currentChemTarget === "flux_current_ribbon_001";
    const beads = this.childrenByName(root, "moving_current_bead_hint");
    const ribbons = [root.getObjectByName("transparent_ribbon_current"), ...this.childrenByName(root, "current_lane_filament")].filter(Boolean);
    const speed = active ? 2.4 : 1.0;

    ribbons.forEach((ribbon, index) => {
      if (ribbon.material) ribbon.material.opacity = active ? 0.28 - index * 0.04 : 0.16 - index * 0.035;
      count += 1;
    });

    beads.forEach((bead, i) => {
      const phase = (t * 0.13 * speed + i / Math.max(beads.length, 1)) % 1;
      bead.position.x = -2.5 + phase * 5.4;
      bead.position.y = Math.sin(phase * Math.PI * 3 + i) * 0.12;
      bead.position.z = 0.66 - phase * 1.58;
      count += 1;
    });

    return count;
  }

  animateSignalThread(root, t, dt, frameState) {
    let count = 0;
    const targeted = frameState.currentChemTarget === "signal_vapor_thread_001";
    const thread = root.getObjectByName("thin_luminous_signal_thread");
    const rings = this.childrenByName(root, "small_answering_wave_node");

    if (thread) {
      thread.rotation.y += dt * (targeted ? 0.3 : 0.11);
      const communicating = frameState.surfaceWakeEcology?.phase === "communicate";
      if (thread.material) thread.material.opacity = targeted ? 0.62 : communicating ? 0.42 : 0.11;
      count += 1;
    }

    rings.forEach((ring, i) => {
      const wave = 1 + Math.sin(t * 3.1 + i) * 0.08 + (targeted ? 0.12 : 0);
      ring.scale.setScalar(wave);
      if (ring.material) ring.material.opacity = targeted ? 0.26 + Math.sin(t * 2.0 + i) * 0.06 : 0;
      count += 1;
    });

    return count;
  }

  animateTender(root, t, frameState) {
    let count = 0;
    const open = root.userData?.entityState === "open_fronds";
    const defensive = root.userData?.entityState === "curl_defensive";
    const fronds = this.childrenByName(root, "filter_frond");
    const sacs = this.childrenByName(root, "tiny_seed_sac");

    fronds.forEach((frond, i) => {
      frond.rotation.x = (open ? 0.42 : defensive ? 1.28 : 0.72) + Math.sin(t * 1.8 + i) * 0.08;
      frond.rotation.z = -0.25 + i * 0.12 + Math.sin(t * 1.2 + i) * 0.05;
      count += 1;
    });

    sacs.forEach((sac, i) => {
      sac.scale.setScalar(1 + Math.sin(t * 2.3 + i) * 0.08 + (open ? 0.1 : 0));
      count += 1;
    });

    return count;
  }

  animateWatcher(root, t, frameState) {
    let count = 0;
    const warning = root.userData?.entityState === "warning_attention";
    const bulbs = this.childrenByName(root, "rotating_sensing_bulb");
    const warningRing = root.getObjectByName("small_warning_pulse_ring");

    bulbs.forEach((bulb, i) => {
      const angle = t * 1.1 + i * Math.PI * 0.5;
      bulb.position.x = Math.cos(angle) * 0.47;
      bulb.position.z = Math.sin(angle) * 0.28;
      bulb.scale.setScalar(1 + (warning ? 0.12 : 0) + Math.sin(t * 3 + i) * 0.04);
      count += 1;
    });

    if (warningRing) {
      warningRing.scale.setScalar(1 + Math.sin(t * (warning ? 5.5 : 2.2)) * (warning ? 0.16 : 0.05));
      if (warningRing.material) warningRing.material.opacity = warning ? 0.48 : 0;
      count += 1;
    }

    return count;
  }

  animateGuide(root, t, dt, frameState) {
    let count = 0;
    const answering = root.userData?.orbiterState === "answering_player_pulse";
    const warning = root.userData?.orbiterState === "fold_shut_and_dim";
    const lantern = root.getObjectByName("single_luminous_sensing_membrane");
    const ring = root.getObjectByName("small_answering_wave_ring");
    const outerRing = root.getObjectByName("larger_interpreter_answer_ring");
    const ribs = this.childrenByName(root, "folded_signal_membrane_rib");

    if (lantern) {
      lantern.scale.setScalar(1 + Math.sin(t * 3.4) * 0.08 + (answering ? 0.18 : 0) - (warning ? 0.08 : 0));
      count += 1;
    }

    if (ring) {
      ring.rotation.z += dt * (answering ? 0.6 : 0.2);
      ring.scale.setScalar(1 + (answering ? 0.22 : 0.04) + Math.sin(t * 2.5) * 0.05);
      if (ring.material) ring.material.opacity = warning ? 0.08 : answering ? 0.52 : 0;
      count += 1;
    }
    if (outerRing?.material) {
      outerRing.rotation.z -= dt * 0.16;
      outerRing.material.opacity = answering ? 0.16 : 0;
      count += 1;
    }

    ribs.forEach((rib, i) => {
      rib.rotation.z = -0.18 + i * 0.18 + Math.sin(t * 1.5 + i) * (warning ? 0.02 : 0.07);
      count += 1;
    });

    return count;
  }


  animateScarFlowFold(root, t, dt, frameState) {
    let count = 0;
    const progress = frameState.localCellMorph?.progress ?? 0;
    const arcs = this.childrenByName(root, "scar_route_fracture_arc");
    const veins = this.childrenByName(root, "pressure_flow_vein");

    arcs.forEach((arc, i) => {
      arc.rotation.z += dt * (0.04 + progress * 0.1);
      if (arc.material) arc.material.opacity = 0.12 + progress * 0.28 + Math.sin(t * 2.0 + i) * 0.04;
      count += 1;
    });

    veins.forEach((vein, i) => {
      vein.scale.y = 1 + Math.sin(t * 1.4 + i) * 0.05 + progress * 0.08;
      count += 1;
    });

    return count;
  }

  animateScarPressureHaze(root, t, frameState) {
    let count = 0;
    const progress = frameState.localCellMorph?.progress ?? 0;
    const motes = this.childrenByName(root, "scar_pressure_haze_mote");
    motes.forEach((mote, i) => {
      mote.position.x += Math.sin(t * 0.5 + i) * 0.0008 * (1 + progress);
      mote.position.z -= 0.0012 * (1 + progress);
      count += 1;
    });
    return count;
  }

  animateScarMemoryFleck(root, t, dt, frameState) {
    root.rotation.y += dt * 0.18;
    root.rotation.x = Math.sin(t * 0.7) * 0.08;
    return 1;
  }

  animateScarFlowClot(root, t, dt, frameState) {
    const leaks = this.childrenByName(root, "current_leak_under_clot_crack");
    leaks.forEach((leak, i) => {
      if (leak.material) leak.material.opacity = 0.22 + Math.sin(t * 3 + i) * 0.08;
    });
    return leaks.length;
  }

  animateResonantPathThread(root, t, dt, frameState) {
    let count = 0;
    const beads = this.childrenByName(root, "path_thread_pressure_bead");
    beads.forEach((bead, i) => {
      bead.position.y = -0.48 + ((i * 0.16 + t * 0.18) % 1.12);
      bead.scale.setScalar(1 + Math.sin(t * 3 + i) * 0.08);
      count += 1;
    });
    return count;
  }

  animatePressureFoldCurrent(root, t, dt, frameState) {
    const ribbon = root.getObjectByName("pressure_fold_current_ribbon");
    const beads = this.childrenByName(root, "scarred_current_edge_bead");
    if (ribbon) ribbon.rotation.z += dt * 0.45;
    beads.forEach((bead, i) => {
      const angle = t * 1.3 + i * Math.PI * 0.25;
      bead.position.x = Math.cos(angle) * 1.3;
      bead.position.y = Math.sin(angle) * 0.16;
      bead.position.z = Math.sin(angle) * 0.42;
    });
    return beads.length + (ribbon ? 1 : 0);
  }



  animateSignalChorusSurface(root, t, dt, frameState) {
    let count = 0;
    const clarity = frameState.signalChorusArrival?.arrivalClarity ?? 0;
    const returnHeld = Boolean(frameState.signalChorusReturnReadability?.active);
    const arcs = this.childrenByName(root, "chorus_surface_thread_arc");
    arcs.forEach((arc, i) => {
      arc.rotation.z += dt * (returnHeld ? 0.028 : 0.035 + clarity * 0.08);
      if (arc.material) {
        arc.material.opacity = returnHeld
          ? 0.13 + Math.sin(t * 1.35 + i) * 0.025
          : 0.10 + clarity * 0.18 + Math.sin(t * 1.8 + i) * 0.03;
        arc.material.userData.blobBaseOpacity = arc.material.opacity;
      }
      count += 1;
    });
    return count;
  }

  animateSignalChorusHaze(root, t, frameState) {
    const haze = root.getObjectByName("signal_chorus_soft_haze");
    if (!haze) return 0;

    const returnReadability = frameState.signalChorusReturnReadability ?? {};
    if (returnReadability.active) {
      const [sx = 0.94, sy = 0.46, sz = 0.72] = returnReadability.hazeScale ?? [];
      const [px = 0, py = 0.34, pz = -1.15] = returnReadability.hazeOffset ?? [];
      const breath = Math.sin(t * 0.55) * 0.012;
      haze.scale.set(sx + breath, sy + breath * 0.45, sz + breath * 0.65);
      haze.position.set(px, py, pz);
      return 1;
    }

    const response = frameState.signalChorusArrival?.chorusResponse ?? 0;
    haze.scale.set(1.2 + Math.sin(t * 0.8) * 0.02 + response * 0.06, 0.7 + Math.sin(t * 0.6) * 0.015, 1.0 + response * 0.04);
    haze.position.set(0, 0, 0);
    return 1;
  }

  animateChoirResonanceNode(root, t, dt, frameState) {
    let count = 0;
    const response = frameState.signalChorusArrival?.chorusResponse ?? 0;
    const center = root.getObjectByName("choir_resonance_center");
    const rings = this.childrenByName(root, "choir_answering_ring");
    if (center) {
      center.scale.setScalar(1 + Math.sin(t * 3.2) * 0.08 + response * 0.22);
      count += 1;
    }
    rings.forEach((ring, i) => {
      ring.rotation.z += dt * (0.18 + response * 0.4 + i * 0.02);
      ring.scale.setScalar(1 + Math.sin(t * 2.4 + i) * 0.06 + response * 0.18);
      if (ring.material) ring.material.opacity = 0.28 + response * 0.35;
      count += 1;
    });
    return count;
  }

  animateListeningPore(root, t, frameState) {
    let count = 0;
    const trust = frameState.signalChorusArrival?.listeningTrust ?? 0;
    const pad = root.getObjectByName("listening_pore_membrane_pad");
    const pores = this.childrenByName(root, "listening_pore_ring");
    if (pad) {
      pad.scale.set(1.2 + trust * 0.08, 0.22 + Math.sin(t * 1.8) * 0.02, 0.72 + trust * 0.05);
      count += 1;
    }
    pores.forEach((pore, i) => {
      pore.scale.setScalar(1 + Math.sin(t * 2.1 + i) * 0.08 + trust * 0.2);
      if (pore.material) pore.material.opacity = 0.26 + trust * 0.32;
      count += 1;
    });
    return count;
  }

  animateHarmonicWaveThread(root, t, dt, frameState) {
    let count = 0;
    const clarity = frameState.signalChorusArrival?.arrivalClarity ?? 0;
    const thread = root.getObjectByName("harmonic_wave_main_thread");
    const beads = this.childrenByName(root, "harmonic_wave_bead");
    if (thread) {
      thread.rotation.y += dt * (0.16 + clarity * 0.28);
      if (thread.material) thread.material.opacity = 0.38 + clarity * 0.28;
      count += 1;
    }
    beads.forEach((bead, i) => {
      const a = t * (0.9 + clarity) + i * Math.PI * 0.42;
      bead.position.x = Math.cos(a) * 0.38;
      bead.position.y = Math.sin(a) * 0.92;
      bead.scale.setScalar(1 + Math.sin(t * 3.0 + i) * 0.08);
      count += 1;
    });
    return count;
  }

  animateSeedSignalBridge(root, t, dt, frameState) {
    let count = 0;
    const ready = frameState.signalChorusArrival?.readyForSignalLoop ? 1 : 0;
    const seed = root.getObjectByName("bridge_seed_core");
    const threads = this.childrenByName(root, "seed_signal_bridge_thread");
    if (seed) {
      seed.scale.setScalar(1 + Math.sin(t * 3.5) * 0.08 + ready * 0.16);
      count += 1;
    }
    threads.forEach((thread, i) => {
      thread.rotation.z += dt * (0.22 + ready * 0.24 + i * 0.05);
      if (thread.material) thread.material.opacity = 0.32 + ready * 0.28;
      count += 1;
    });
    return count;
  }



  animateBloomSporeLantern(root, t, frameState) {
    let count = 0;
    const glow = root.getObjectByName("bloom_lantern_inner_glow");
    const sac = root.getObjectByName("bloom_lantern_membrane_sac");
    const spores = this.childrenByName(root, "preview_growth_spore");
    if (sac) {
      sac.scale.set(0.82, 1.18 + Math.sin(t * 2.1) * 0.08, 0.82);
      count += 1;
    }
    if (glow) {
      glow.scale.setScalar(1 + Math.sin(t * 3.2) * 0.12);
      count += 1;
    }
    spores.forEach((spore, i) => {
      const a = t * 0.9 + i;
      spore.position.y = -0.12 + Math.sin(a) * 0.14;
      count += 1;
    });
    return count;
  }

  animateResidueMemorySilt(root, t, frameState) {
    let count = 0;
    const motes = this.childrenByName(root, "old_core_memory_silt_mote");
    const echo = root.getObjectByName("prior_core_echo_ring");
    motes.forEach((mote, i) => {
      mote.position.y = 0.1 + Math.sin(t * 1.4 + i) * 0.07;
      count += 1;
    });
    if (echo) {
      echo.scale.setScalar(1 + Math.sin(t * 1.2) * 0.08);
      if (echo.material) echo.material.opacity = 0.22 + Math.sin(t * 1.8) * 0.08;
      count += 1;
    }
    return count;
  }

  animateSeedChoiceBraid(root, t, dt, frameState) {
    let count = 0;
    const core = root.getObjectByName("choice_braid_seed_core");
    const bloom = this.childrenByName(root, "bloom_choice_strand");
    const residue = this.childrenByName(root, "residue_choice_strand");
    if (core) {
      core.scale.setScalar(1 + Math.sin(t * 2.8) * 0.08);
      count += 1;
    }
    bloom.forEach((strand, i) => {
      strand.rotation.z += dt * (0.18 + i * 0.04);
      count += 1;
    });
    residue.forEach((strand, i) => {
      strand.rotation.z -= dt * (0.14 + i * 0.04);
      count += 1;
    });
    return count;
  }

  animateOvergrowthWarningTendril(root, t, frameState) {
    let count = 0;
    const segments = this.childrenByName(root, "overgrowth_tendril_segment");
    const ring = root.getObjectByName("overgrowth_warning_ring");
    segments.forEach((segment, i) => {
      segment.position.y = Math.sin(i * 0.8) * 0.13 + Math.sin(t * 3.4 + i) * 0.035;
      segment.rotation.z = Math.sin(t * 2.2 + i) * 0.08;
      count += 1;
    });
    if (ring) {
      ring.scale.setScalar(1 + Math.sin(t * 4.4) * 0.14);
      if (ring.material) ring.material.opacity = 0.24 + Math.sin(t * 5.0) * 0.12;
      count += 1;
    }
    return count;
  }


  childrenByName(root, name) {
    const results = [];
    root.traverse((child) => {
      if (child.name === name) results.push(child);
    });
    return results;
  }
}
