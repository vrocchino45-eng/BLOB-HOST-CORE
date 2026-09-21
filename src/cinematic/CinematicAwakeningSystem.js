import * as THREE from "three";
import { selectCurrentMorphState } from "../morph/MorphStateSelector.js";

export class CinematicAwakeningSystem {
  constructor({ recipeDataSystem, scene, camera, visualComposer, playerRoot, frameState }) {
    if (!recipeDataSystem) throw new Error("[CinematicAwakeningSystem] recipeDataSystem is required.");
    if (!scene) throw new Error("[CinematicAwakeningSystem] scene is required.");
    if (!camera) throw new Error("[CinematicAwakeningSystem] camera is required.");
    if (!visualComposer) throw new Error("[CinematicAwakeningSystem] visualComposer is required.");
    if (!playerRoot) throw new Error("[CinematicAwakeningSystem] playerRoot is required.");
    if (!frameState) throw new Error("[CinematicAwakeningSystem] frameState is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.scene = scene;
    this.camera = camera;
    this.visualComposer = visualComposer;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.config = null;
    this.group = null;
    this.hostPulseRing = null;
    this.guideRevealRing = null;
    this.microMacroLine = null;
    this.microMacroLinePositions = null;
    this.firstFoldRing = null;
    this.lastBeat = "not_initialized";
  }

  init() {
    this.config = this.recipeDataSystem.data.cinematicAwakeningBeat ?? this.defaultConfig();
    this.createCinematicCues();
    this.frameState.awakeningCinematic = this.createState("initialized");
  }

  update(dt, frameState) {
    const beat = this.computeBeat(frameState);
    const progress = this.computeBeatProgress(frameState, beat);
    const intensity = this.computeIntensity(frameState, beat, progress);

    this.updateCueVisuals(dt, frameState, beat, progress, intensity);

    frameState.awakeningCinematic = {
      ...this.createState(beat),
      active: this.isActiveBeat(beat),
      beat,
      beatLabel: this.labelForBeat(beat),
      progress,
      intensity,
      hostPulse: this.hostPulseState(beat, progress, intensity),
      guideReveal: this.guideRevealState(beat, progress, intensity),
      microMacroCue: this.microMacroState(beat, progress, intensity),
      morphEmphasis: this.morphEmphasisState(frameState, beat, progress, intensity),
      cameraBias: this.cameraBiasForBeat(frameState, beat, progress, intensity),
      noCutsceneLockout: true,
      playerControlPreserved: true,
      debugNote: "HC-003F preserves cinematic feel cues while cleaning blueprint translation/readouts."
    };

    this.lastBeat = beat;
  }

  createCinematicCues() {
    this.group = new THREE.Group();
    this.group.name = "awakening_cinematic_cue_group";
    this.scene.add(this.group);

    const hostPulseMaterial = new THREE.MeshBasicMaterial({
      color: 0xffc285,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.hostPulseRing = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.018, 8, 96), hostPulseMaterial);
    this.hostPulseRing.name = "cinematic_host_pulse_ring";
    this.hostPulseRing.position.set(0.9, 2.8, -25.4);
    this.hostPulseRing.rotation.set(1.15, 0.18, 0.12);
    this.group.add(this.hostPulseRing);

    const guideMaterial = new THREE.MeshBasicMaterial({
      color: 0xbff6ff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.guideRevealRing = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.012, 8, 72), guideMaterial);
    this.guideRevealRing.name = "cinematic_guide_reveal_ring";
    this.group.add(this.guideRevealRing);

    const morphMaterial = new THREE.MeshBasicMaterial({
      color: 0xffdfae,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.firstFoldRing = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.014, 8, 96), morphMaterial);
    this.firstFoldRing.name = "cinematic_first_fold_emphasis_ring";
    this.firstFoldRing.rotation.set(Math.PI / 2, 0, 0);
    this.group.add(this.firstFoldRing);

    this.microMacroLinePositions = new Float32Array(6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(this.microMacroLinePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x9df1ff,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    this.microMacroLine = new THREE.Line(lineGeometry, lineMaterial);
    this.microMacroLine.name = "cinematic_micro_to_macro_scale_thread";
    this.group.add(this.microMacroLine);
  }

  computeBeat(frameState) {
    const activeCellId = frameState.activeCellId ?? "none";
    const runtime = frameState.runtimeSeconds ?? 0;
    const openingStage = frameState.openingFlow?.stage ?? "none";
    const morph = selectCurrentMorphState(frameState);
    const seedAbsorbed = (frameState.chemObjectState?.absorbedObjects ?? 0) > 0;

    if (activeCellId !== "CELL_MEMBRANE_NURSERY_001") {
      if (activeCellId === "CELL_SCAR_FLOW_FOLD_001") return "scar_flow_release";
      if (activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001") return "signal_chorus_release";
      if (activeCellId === "CELL_BLOOM_RESIDUE_FORK_001") return "beyond_minute_release";
      return "inactive";
    }

    if (morph.triggerReady || morph.phase === "waiting_for_pulse" || morph.phase === "ready_for_pulse" || openingStage === "pulse_first_fold") {
      return "first_fold_emphasis";
    }

    if (seedAbsorbed || openingStage === "read_scar_response") {
      return "guide_reveal";
    }

    if (runtime < (this.config.beatDurations?.cameraSettleSeconds ?? 4.5)) {
      return "camera_settle";
    }

    return "host_pulse_seed_cue";
  }

  computeBeatProgress(frameState, beat) {
    const runtime = frameState.runtimeSeconds ?? 0;
    const durations = this.config.beatDurations ?? {};

    if (beat === "camera_settle") return this.clamp(runtime / (durations.cameraSettleSeconds ?? 4.5), 0, 1);
    if (beat === "host_pulse_seed_cue") return this.oscillatingProgress(runtime, 3.4);
    if (beat === "guide_reveal") return this.clamp((frameState.guidePrompt?.age ?? 0) / (durations.guideRevealSeconds ?? 4), 0, 1);
    if (beat === "first_fold_emphasis") return this.oscillatingProgress(runtime, 2.2);
    if (beat.endsWith("release")) return this.clamp((selectCurrentMorphState(frameState).progress ?? 1), 0, 1);
    return 0;
  }

  computeIntensity(frameState, beat, progress) {
    if (!this.isActiveBeat(beat)) return 0;
    if (beat === "camera_settle") return this.smoothstep(1 - progress) * 0.72 + 0.14;
    if (beat === "host_pulse_seed_cue") return 0.34 + progress * 0.28;
    if (beat === "guide_reveal") return this.smoothstep(progress) * 0.62;
    if (beat === "first_fold_emphasis") return 0.48 + progress * 0.34;
    if (beat.endsWith("release")) return 0.18;
    return 0;
  }

  updateCueVisuals(dt, frameState, beat, progress, intensity) {
    const time = frameState.runtimeSeconds ?? 0;
    const guideRoot = this.findComposedRoot("guide_orbiter_folded_lantern_001");

    this.hostPulseRing.visible = beat === "camera_settle" || beat === "host_pulse_seed_cue" || beat === "guide_reveal";
    this.hostPulseRing.scale.setScalar(1 + Math.sin(time * 1.2) * 0.08 + intensity * 0.22);
    this.hostPulseRing.rotation.z += dt * 0.08;
    this.setMaterialOpacity(this.hostPulseRing, this.hostPulseRing.visible ? 0.05 + intensity * 0.22 : 0);

    if (guideRoot) {
      this.guideRevealRing.visible = beat === "guide_reveal" || beat === "first_fold_emphasis";
      this.guideRevealRing.position.copy(guideRoot.position);
      this.guideRevealRing.position.y += 0.04;
      this.guideRevealRing.lookAt(this.camera.position);
      this.guideRevealRing.scale.setScalar(1 + Math.sin(time * 2.1) * 0.06 + intensity * 0.18);
      this.setMaterialOpacity(this.guideRevealRing, this.guideRevealRing.visible ? 0.08 + intensity * 0.32 : 0);
    } else {
      this.guideRevealRing.visible = false;
      this.setMaterialOpacity(this.guideRevealRing, 0);
    }

    this.firstFoldRing.visible = beat === "first_fold_emphasis";
    this.firstFoldRing.position.copy(this.playerRoot.position);
    this.firstFoldRing.position.y += 0.02;
    this.firstFoldRing.scale.setScalar(1.0 + progress * 0.2 + Math.sin(time * 4.8) * 0.05);
    this.firstFoldRing.rotation.z += dt * 0.42;
    this.setMaterialOpacity(this.firstFoldRing, this.firstFoldRing.visible ? 0.10 + intensity * 0.30 : 0);

    const showLine = beat === "camera_settle" || beat === "host_pulse_seed_cue" || beat === "guide_reveal";
    this.microMacroLine.visible = showLine;
    if (showLine) {
      const start = this.playerRoot.position;
      const end = this.config.macroCue?.hostAnchor ?? [0.9, 2.8, -25.4];
      this.microMacroLinePositions[0] = start.x;
      this.microMacroLinePositions[1] = start.y + 0.12;
      this.microMacroLinePositions[2] = start.z;
      this.microMacroLinePositions[3] = end[0];
      this.microMacroLinePositions[4] = end[1];
      this.microMacroLinePositions[5] = end[2];
      this.microMacroLine.geometry.attributes.position.needsUpdate = true;
      this.setMaterialOpacity(this.microMacroLine, 0.018 + intensity * 0.075);
    } else {
      this.setMaterialOpacity(this.microMacroLine, 0);
    }
  }

  cameraBiasForBeat(frameState, beat, progress, intensity) {
    const manualLook = Math.abs(frameState.input?.cameraLookX ?? 0) + Math.abs(frameState.input?.cameraLookY ?? 0) > 0.01;
    const camera = this.config.cameraBeats?.[beat] ?? null;
    if (!camera || (manualLook && camera.doNotOverrideManualLook !== false)) {
      return { active: false, reason: "manual_or_no_cinematic_camera_bias" };
    }

    return {
      active: true,
      yaw: camera.yaw ?? 0,
      pitch: camera.pitch ?? 0.34,
      distance: camera.distance ?? 8.35,
      lift: camera.lift ?? 0,
      blendStrength: camera.blendStrength ?? 1.2,
      progress,
      intensity,
      reason: `cinematic_${beat}`
    };
  }

  hostPulseState(beat, progress, intensity) {
    return {
      active: beat === "camera_settle" || beat === "host_pulse_seed_cue" || beat === "guide_reveal",
      progress,
      intensity,
      meaning: "macro host breathes before the player understands the scale"
    };
  }

  guideRevealState(beat, progress, intensity) {
    return {
      active: beat === "guide_reveal" || beat === "first_fold_emphasis",
      progress,
      intensity,
      meaning: "Folded Lantern becomes interpreter, not dialogue NPC"
    };
  }

  microMacroState(beat, progress, intensity) {
    return {
      active: beat === "camera_settle" || beat === "host_pulse_seed_cue" || beat === "guide_reveal",
      progress,
      intensity,
      meaning: "microscopic player sits inside host-scale life"
    };
  }

  morphEmphasisState(frameState, beat, progress, intensity) {
    const morph = selectCurrentMorphState(frameState);
    return {
      active: beat === "first_fold_emphasis",
      progress,
      intensity,
      phase: morph.phase ?? "none",
      meaning: "first tissue fold gets camera/scale clarity without removing control"
    };
  }

  createState(beat) {
    return {
      pass: "HC-003F",
      active: false,
      mode: this.config?.mode ?? "playable_awakened_cinematic_cues",
      beat,
      beatLabel: this.labelForBeat(beat),
      progress: 0,
      intensity: 0,
      hostPulse: { active: false, progress: 0, intensity: 0 },
      guideReveal: { active: false, progress: 0, intensity: 0 },
      microMacroCue: { active: false, progress: 0, intensity: 0 },
      morphEmphasis: { active: false, progress: 0, intensity: 0 },
      cameraBias: { active: false, reason: "not_initialized" },
      noCutsceneLockout: true,
      playerControlPreserved: true,
      noDialogueTree: true,
      noNewGameplay: true
    };
  }

  findComposedRoot(objectId) {
    const item = this.visualComposer.composedObjects.find((entry) => entry.root?.userData?.objectId === objectId || entry.root?.name === objectId);
    return item?.root ?? null;
  }

  setMaterialOpacity(object, opacity) {
    const safeOpacity = this.clamp(opacity, 0, 1);
    if (object.material) object.material.opacity = safeOpacity;
    object.traverse?.((child) => {
      if (child.material) child.material.opacity = safeOpacity;
    });
  }

  isActiveBeat(beat) {
    return !["inactive", "initialized"].includes(beat);
  }

  labelForBeat(beat) {
    const labels = {
      initialized: "Cinematic cues initialized",
      camera_settle: "First awakening camera settle",
      host_pulse_seed_cue: "Host pulse / safe seed cue",
      guide_reveal: "Folded Lantern reveal",
      first_fold_emphasis: "First tissue fold emphasis",
      scar_flow_release: "Scar-Flow release",
      signal_chorus_release: "Signal Chorus release",
      beyond_minute_release: "Beyond-minute fork release",
      inactive: "Cinematic cues inactive"
    };
    return labels[beat] ?? beat;
  }

  oscillatingProgress(time, speed) {
    return (Math.sin(time * speed) + 1) * 0.5;
  }

  smoothstep(value) {
    const x = this.clamp(value, 0, 1);
    return x * x * (3 - 2 * x);
  }

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  defaultConfig() {
    return {
      id: "CINEMATIC_AWAKENING_BEAT_RUNTIME_DEFAULT",
      mode: "playable_awakened_cinematic_cues",
      beatDurations: {
        cameraSettleSeconds: 4.5,
        guideRevealSeconds: 4.0
      },
      macroCue: {
        hostAnchor: [0.9, 2.8, -25.4]
      },
      cameraBeats: {
        camera_settle: { yaw: 0.05, pitch: 0.38, distance: 8.15, lift: 0.06, blendStrength: 1.35, doNotOverrideManualLook: true },
        host_pulse_seed_cue: { yaw: 0.12, pitch: 0.33, distance: 7.95, lift: 0.08, blendStrength: 1.05, doNotOverrideManualLook: true },
        first_fold_emphasis: { yaw: 0.02, pitch: 0.42, distance: 8.55, lift: 0.12, blendStrength: 1.15, doNotOverrideManualLook: true }
      }
    };
  }
}
