export class ControllerComfortSystem {
  constructor({ recipeDataSystem, frameState }) {
    if (!recipeDataSystem) throw new Error("[ControllerComfortSystem] recipeDataSystem is required.");
    this.recipeDataSystem = recipeDataSystem;
    this.frameState = frameState;
    this.tuning = recipeDataSystem.data.controllerOnboardingTuning ?? null;
    this.lastPulseAt = -999;
    this.lastAbsorbAt = -999;
    this.lastRecenterAt = -999;
    this.lastManualCameraAt = -999;
  }

  init() {
    this.applyState(this.frameState, 0);
  }

  update(dt, frameState) {
    this.applyState(frameState, dt);
  }

  applyState(frameState, _dt) {
    const input = frameState.input ?? {};
    const inputSource = frameState.inputSource ?? {};
    const camera = this.tuning?.camera ?? {};
    const now = frameState.runtimeSeconds ?? 0;
    const lookMagnitude = Math.hypot(input.cameraLookX ?? 0, input.cameraLookY ?? 0);
    const manualThreshold = camera.manualInputThreshold ?? 0.035;

    if (lookMagnitude > manualThreshold) this.lastManualCameraAt = now;
    if (input.pulsePressed) this.lastPulseAt = now;
    if (input.absorbHeld) this.lastAbsorbAt = now;
    if (input.recenterCameraPressed) this.lastRecenterAt = now;

    const manualOverrideAge = now - this.lastManualCameraAt;
    const manualOverrideActive = manualOverrideAge <= (camera.manualOverrideHoldSeconds ?? 2.2);
    const pulseAge = now - this.lastPulseAt;
    const absorbAge = now - this.lastAbsorbAt;
    const target = frameState.targeting ?? {};
    const bond = frameState.bondState ?? {};

    frameState.controllerOnboarding = {
      pass: "HC-005C",
      active: true,
      mode: this.tuning?.mode ?? "first_playable_minute_controller_comfort",
      primaryReference: this.tuning?.primaryReference ?? "HOST_CORE_Blueprint_v1_reference_docs.zip",
      tuning: this.publicTuning(),
      device: {
        activeDevice: inputSource.activeDevice ?? "keyboard",
        gamepadActive: Boolean(inputSource.gamepadActive),
        gamepadName: inputSource.gamepadName ?? "none",
        keyboardActive: Boolean(inputSource.keyboardActive)
      },
      movement: {
        moveMagnitude: Math.hypot(input.moveX ?? 0, input.moveY ?? 0, input.moveZ ?? 0),
        boostHeld: Boolean(input.boostHeld),
        feel: this.tuning?.movement?.movementFeel ?? "controller_comfort_soft_viscous_membrane_drift",
        referenceMode: this.tuning?.movement?.referenceMode ?? "camera_relative_free_3d",
        forwardStickMeaning: this.tuning?.movement?.forwardStickMeaning ?? "left_stick_up_follows_camera_forward_projected_to_xz",
        verticalControl: this.tuning?.movement?.verticalControl ?? "triggers_and_shoulders_remain_world_y",
        cameraPitchAffectsPlanarMovement: Boolean(this.tuning?.movement?.cameraPitchAffectsPlanarMovement)
      },
      camera: {
        rightStickLookMagnitude: lookMagnitude,
        manualLookActive: lookMagnitude > manualThreshold,
        manualOverrideActive,
        manualOverrideAge: Number.isFinite(manualOverrideAge) ? manualOverrideAge : 999,
        recenterPressed: Boolean(input.recenterCameraPressed),
        lastRecenterAge: now - this.lastRecenterAt,
        note: manualOverrideActive
          ? "manual camera input has priority; opening/cinematic bias is muted"
          : "soft follow / cinematic bias may assist readability"
      },
      actions: {
        absorbHeld: Boolean(input.absorbHeld),
        absorbAge: Number.isFinite(absorbAge) ? absorbAge : 999,
        pulsePressed: Boolean(input.pulsePressed),
        pulseAge: Number.isFinite(pulseAge) ? pulseAge : 999,
        pulseEventId: input.pulseEventId ?? 0,
        pulseSource: input.pulseSource ?? "none",
        pulseSequence: inputSource.pulseSequence ?? 0,
        lastPulseSource: inputSource.lastPulseSource ?? "none",
        pulseContext: inputSource.pulseContext ?? "none",
        pulseButtonValue: inputSource.pulseButtonValue ?? 0,
        pulseButtonDown: Boolean(inputSource.pulseButtonDown),
        contextButtonValue: inputSource.contextButtonValue ?? 0,
        contextButtonDown: Boolean(inputSource.contextButtonDown),
        contextButtonActsAsPulse: Boolean(inputSource.contextButtonActsAsPulse),
        targetId: target.targetId ?? "none",
        targetKind: target.targetKind ?? "none",
        absorbProgress: bond.absorbProgress ?? 0,
        lockStrength: target.lockStrength ?? 0,
        hint: target.absorbHint ?? "none"
      },
      comfortStage: this.getComfortStage(frameState),
      statusLine: this.getStatusLine(frameState),
      noNewContent: true,
      noGates: true,
      nextRecommendedPass: this.tuning?.nextRecommendedPass ?? "HC-003K Opening Objective + Prompt Lock"
    };
  }

  publicTuning() {
    const t = this.tuning ?? {};
    return {
      deadZones: t.deadZones ?? { leftStick: 0.13, rightStick: 0.11, trigger: 0.08 },
      responseCurves: t.responseCurves ?? { leftStick: 1.18, rightStick: 1.32, trigger: 1.05 },
      movement: t.movement ?? {},
      camera: t.camera ?? {},
      absorbAssist: t.absorbAssist ?? {},
      targeting: t.targeting ?? {},
      pulseFeedback: t.pulseFeedback ?? {}
    };
  }

  getComfortStage(frameState) {
    const cell = frameState.activeCellId;
    if (cell === "CELL_MEMBRANE_NURSERY_001") {
      if ((frameState.chemObjectState?.absorbedObjects ?? 0) <= 0) return "seed_absorb_onboarding";
      return "first_fold_onboarding";
    }
    if (cell === "CELL_SCAR_FLOW_FOLD_001") return "scar_flow_controller_loop";
    if (cell === "CELL_SIGNAL_CHORUS_NERVE_001") return "signal_chorus_controller_loop";
    if (cell === "CELL_BLOOM_RESIDUE_FORK_001") return "beyond_minute_optional_controller_extension";
    return "controller_ready";
  }

  getStatusLine(frameState) {
    const device = frameState.inputSource?.gamepadActive ? "controller" : "keyboard fallback";
    const stage = this.getComfortStage(frameState).replaceAll("_", " ");
    const target = frameState.targeting?.targetId ?? "none";
    return `${device}: ${stage}; LS camera-forward; target ${target}`;
  }
}
