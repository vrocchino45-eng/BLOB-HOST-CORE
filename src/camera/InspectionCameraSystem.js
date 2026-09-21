const PROFILE_ID = "FOUNDATIONAL_INSPECTION_CAMERA_HC006D";

/**
 * HC-024C Core inspection + Guide-assisted physical Core piece manipulation.
 *
 * Y/F still selects the fast global Core-centered orbit introduced in HC024A.
 * While inspection is active, A/E remains reserved for deliberate commitment.
 * Core Work entry is intentionally separate (D-Pad Down / G); once Core Work is
 * active, A/E owns grab/place as an intentional internal arrangement action.
 * Core Work remains the same live Host scene. HC024C enables only physical
 * selection/grab/reposition of existing visible Core anatomy; chemistry stays
 * disabled, no new pieces are spawned, and GameRuntime remains the sole camera
 * transform owner.
 */
export class InspectionCameraSystem {
  constructor({ recipeDataSystem, frameState, playerRoot }) {
    if (!recipeDataSystem) throw new Error("[InspectionCameraSystem] recipeDataSystem is required.");
    if (!frameState) throw new Error("[InspectionCameraSystem] frameState is required.");
    if (!playerRoot) throw new Error("[InspectionCameraSystem] playerRoot is required.");

    this.recipeDataSystem = recipeDataSystem;
    this.frameState = frameState;
    this.playerRoot = playerRoot;
    this.profile = null;
    this.active = false;
    this.available = true;
    this.justActivated = false;
    this.justDeactivated = false;
    this.justFocusChanged = false;
    this.workActive = false;
    this.justWorkActivated = false;
    this.justWorkDeactivated = false;
    this.workBlend = 0;
    this.workEntryCount = 0;
    this.lastWorkAt = -1;
    this.lastWorkEvent = "core_work_available_from_self_inspection";
    this.toggleCount = 0;
    this.lastToggleAt = -1;
    this.lastEvent = "tight_camera_available_from_opening";
    this.deniedReason = "none";
    this.activeFocusId = "player_core_self_inspection";
    this.focusMode = "player_forward";
    this.manualFocusOverrideSeconds = 0;
    this.lastIntentAlignment = 0;
    this.lastIntentReason = "player_forward";
    this.lastCellId = frameState.activeCellId ?? "none";
  }

  init() {
    this.profile = this.recipeDataSystem.get("inspectionCameraProfiles", PROFILE_ID);
    const state = this.createState(this.createPlayerForwardFocus(this.frameState), false);
    this.frameState.inspectionCamera = state;
    this.frameState.tightInspectionCamera = state;
  }

  update(dt, frameState) {
    this.justActivated = false;
    this.justDeactivated = false;
    this.justFocusChanged = false;
    this.justWorkActivated = false;
    this.justWorkDeactivated = false;
    this.available = Boolean(this.playerRoot);

    const lookMagnitude = Math.hypot(
      frameState.input?.cameraLookX ?? 0,
      frameState.input?.cameraLookY ?? 0
    );
    if (
      this.active
      && !this.workActive
      && this.focusMode === "authored_interaction"
      && lookMagnitude > 0.22
    ) {
      this.manualFocusOverrideSeconds = 0.85;
      this.lastIntentReason = "manual_camera_look_released_authored_lock";
    } else {
      this.manualFocusOverrideSeconds = Math.max(0, this.manualFocusOverrideSeconds - Math.max(0, dt));
    }

    const rawAuthored = this.resolveAuthoredFocus(frameState);
    const authored = this.workActive
      ? { ...rawAuthored, assistAvailable: false }
      : rawAuthored;
    const effectiveFocus = authored.assistAvailable
      ? authored.focus
      : this.createPlayerForwardFocus(frameState);
    const nextFocusMode = authored.assistAvailable ? "authored_interaction" : "player_forward";
    const nextFocusId = effectiveFocus.id ?? "player_core_self_inspection";
    const guideAvailable = this.isGuideAvailable(frameState);

    if (frameState.input?.toggleInspectionCameraPressed) {
      this.toggleCount += 1;
      this.lastToggleAt = frameState.runtimeSeconds ?? 0;

      if (this.workActive) {
        this.exitCoreWork("core_work_closed_with_inspection_toggle");
        this.release("core_work_and_inspection_released_by_player");
      } else if (this.active) {
        this.release("tight_camera_released_by_player");
      } else if (this.available) {
        this.active = true;
        this.justActivated = true;
        this.activeFocusId = nextFocusId;
        this.focusMode = nextFocusMode;
        this.lastEvent = authored.assistAvailable
          ? "tight_camera_entered_with_authored_focus"
          : "tight_camera_entered_player_forward";
        this.deniedReason = "none";
      } else {
        this.lastEvent = "tight_camera_toggle_denied_runtime_unavailable";
        this.deniedReason = "player_camera_runtime_unavailable";
      }
    }

    if (this.workActive && frameState.input?.cancelPressed) {
      this.exitCoreWork("core_work_returned_to_external_inspection");
      this.active = true;
      this.activeFocusId = "player_core_self_inspection";
      this.focusMode = "player_forward";
      this.lastEvent = "core_work_returned_to_core_inspection";
    }

    if (
      frameState.input?.coreWorkViewPressed
      && this.active
      && !this.workActive
    ) {
      // HC024D0C: Core Work entry is intentionally separate from A/E.
      // D-Pad Down (G keyboard) asks the Guide to attend the Core from external
      // inspection, while A/E remains reserved for deliberate commitment.
      if (guideAvailable) {
        this.enterCoreWork(frameState);
      } else {
        this.lastWorkEvent = "core_work_denied_guide_unavailable";
        this.deniedReason = "guide_unavailable_for_core_work";
      }
    }

    if (this.workActive && !guideAvailable) {
      this.exitCoreWork("core_work_released_guide_unavailable");
      this.lastEvent = "core_work_released_guide_unavailable";
    }

    if (this.workActive && frameState.input?.coreWorkPressed && !this.justWorkActivated) {
      // HC024C forwards A/E to CoreEmbodimentSystem as physical grab/place.
      // InspectionCameraSystem still owns only the work-view state.
      this.lastWorkEvent = "core_work_piece_grab_or_place_forwarded";
    }

    const targetWorkBlend = this.workActive ? 1 : 0;
    this.workBlend += (targetWorkBlend - this.workBlend) * (1 - Math.exp(-Math.max(0, dt) * 6.2));

    const stateAuthored = this.workActive
      ? { ...rawAuthored, assistAvailable: false }
      : authored;
    const stateFocus = this.workActive
      ? this.createPlayerForwardFocus(frameState)
      : effectiveFocus;
    const stateFocusMode = stateAuthored.assistAvailable ? "authored_interaction" : "player_forward";
    const stateFocusId = stateFocus.id ?? "player_core_self_inspection";

    if (this.active) {
      const cellChanged = this.lastCellId !== (frameState.activeCellId ?? "none");
      const focusChanged = this.activeFocusId !== stateFocusId || this.focusMode !== stateFocusMode;

      if (focusChanged) {
        this.justFocusChanged = true;
        this.activeFocusId = stateFocusId;
        this.focusMode = stateFocusMode;
        this.lastEvent = stateAuthored.assistAvailable
          ? "tight_camera_attached_authored_focus"
          : this.workActive
            ? "core_work_kept_camera_on_player_core"
            : "tight_camera_returned_to_player_forward";
      }

      if (cellChanged) {
        this.lastEvent = this.workActive
          ? "core_work_persisted_across_cell_change"
          : "tight_camera_persisted_across_cell_change";
      }
    } else {
      this.activeFocusId = stateFocusId;
      this.focusMode = stateFocusMode;
    }

    this.lastCellId = frameState.activeCellId ?? "none";

    const state = this.createState(stateFocus, stateAuthored.assistAvailable, stateAuthored, guideAvailable);
    frameState.inspectionCamera = state;
    frameState.tightInspectionCamera = state;
  }

  enterCoreWork(frameState) {
    this.workActive = true;
    this.justWorkActivated = true;
    this.workEntryCount += 1;
    this.lastWorkAt = frameState.runtimeSeconds ?? 0;
    this.lastWorkEvent = "guide_called_into_core_work_view";
    this.lastEvent = "guide_called_into_core_work_view";
    this.deniedReason = "none";
    this.manualFocusOverrideSeconds = 0;
    this.activeFocusId = "player_core_self_inspection";
    this.focusMode = "player_forward";
  }

  exitCoreWork(event) {
    if (!this.workActive) return;
    this.workActive = false;
    this.justWorkDeactivated = true;
    this.lastWorkEvent = event;
    this.deniedReason = "none";
  }

  isGuideAvailable(frameState) {
    const guide = frameState.orbiterState ?? {};
    return Boolean(
      (guide.total ?? 0) > 0
      && guide.guideState !== "not_spawned"
    );
  }

  resolveAuthoredFocus(frameState) {
    const focus = frameState.interactionInspectionFocus ?? {};
    const activation = this.profile?.activation ?? {};
    const focusActive = Boolean(focus.active && focus.inspectable !== false);
    const focusDistance = Number.isFinite(focus.distance) ? focus.distance : Infinity;
    const assistRange = focus.autoExitRange ?? activation.authoredFocusAssistRange ?? activation.autoExitRange ?? 6.2;
    const cellMatches = !focus.requiredCellId || focus.requiredCellId === frameState.activeCellId;

    const alignment = this.computeFocusIntentAlignment(frameState, focus.position);
    const intentDot = activation.authoredFocusIntentDot ?? 0.72;
    const targeting = frameState.targeting ?? {};
    const targetMatches = Boolean(
      targeting.active
      && targeting.targetId
      && targeting.targetId !== "none"
      && targeting.targetId === focus.id
    );
    const manuallyReleased = this.manualFocusOverrideSeconds > 0;
    const intentAligned = targetMatches || alignment >= intentDot;

    this.lastIntentAlignment = alignment;
    this.lastIntentReason = manuallyReleased
      ? "manual_override_player_forward"
      : targetMatches
        ? "targeting_matches_authored_focus"
        : intentAligned
          ? "authored_focus_inside_view_intent_cone"
          : "authored_focus_not_where_player_is_looking";

    return {
      focus,
      focusActive,
      focusDistance,
      assistRange,
      cellMatches,
      intentAlignment: alignment,
      intentDot,
      targetMatches,
      manuallyReleased,
      intentAligned,
      assistAvailable: Boolean(
        focusActive
        && cellMatches
        && focusDistance <= assistRange
        && intentAligned
        && !manuallyReleased
      )
    };
  }

  computeFocusIntentAlignment(frameState, position) {
    if (!position || !this.playerRoot) return -1;
    const px = this.playerRoot.position.x;
    const pz = this.playerRoot.position.z;
    let tx = (position.x ?? px) - px;
    let tz = (position.z ?? pz) - pz;
    const targetLength = Math.hypot(tx, tz);
    if (targetLength <= 0.0001) return 1;
    tx /= targetLength;
    tz /= targetLength;

    const forward = frameState.playerKinematics?.cameraRelativeForward;
    const yaw = frameState.cameraControl?.yaw ?? 0;
    let fx = Number.isFinite(forward?.x) ? forward.x : -Math.sin(yaw);
    let fz = Number.isFinite(forward?.z) ? forward.z : -Math.cos(yaw);
    const forwardLength = Math.hypot(fx, fz);
    if (forwardLength <= 0.0001) return 0;
    fx /= forwardLength;
    fz /= forwardLength;
    return fx * tx + fz * tz;
  }

  createPlayerForwardFocus(frameState) {
    const free = this.profile?.freeFraming ?? {};
    const player = this.playerRoot?.position ?? { x: 0, y: 0, z: 0 };
    const kinematicForward = frameState.playerKinematics?.cameraRelativeForward;
    const yaw = frameState.cameraControl?.yaw ?? 0;

    let forwardX = Number.isFinite(kinematicForward?.x) ? kinematicForward.x : -Math.sin(yaw);
    let forwardZ = Number.isFinite(kinematicForward?.z) ? kinematicForward.z : -Math.cos(yaw);
    const length = Math.hypot(forwardX, forwardZ);
    if (length <= 0.0001) {
      forwardX = 0;
      forwardZ = -1;
    } else {
      forwardX /= length;
      forwardZ /= length;
    }

    const coreCentered = free.mode === "core_centered_orbit" || free.coreCentered === true;
    const focusAhead = coreCentered ? 0 : (free.focusAhead ?? 2.2);
    const focusLift = coreCentered ? 0 : (free.focusLift ?? 0.28);

    return {
      architecturePass: "HC-024B",
      providerId: "InspectionCameraSystem",
      id: coreCentered ? "player_core_self_inspection" : "player_forward_tight_camera",
      label: coreCentered ? "Core self-inspection" : "Player-forward tight view",
      active: true,
      inspectable: true,
      requiredCellId: null,
      position: {
        x: (player.x ?? 0) + forwardX * focusAhead,
        y: (player.y ?? 0) + focusLift,
        z: (player.z ?? 0) + forwardZ * focusAhead
      },
      distance: coreCentered ? 0 : focusAhead,
      toggleRange: Infinity,
      autoExitRange: Infinity,
      selfInspection: coreCentered,
      camera: {
        distance: free.distance ?? 2.65,
        fieldOfView: free.fieldOfView ?? 48,
        targetBlendTowardFocus: free.targetBlendTowardFocus ?? 0.2,
        targetLift: free.targetLift ?? 0.04,
        baseHeight: free.baseHeight ?? 0.18,
        pitch: free.pitch ?? 0.18,
        shoulderOffset: coreCentered ? 0 : (free.shoulderOffset ?? 0.12),
        forwardOffset: coreCentered ? 0 : (free.forwardOffset ?? 0),
        yawSensitivityScale: free.yawSensitivityScale,
        pitchSensitivityScale: free.pitchSensitivityScale,
        maxYawOffset: free.maxYawOffset ?? 3.14,
        pitchMin: free.pitchMin ?? -1.0,
        pitchMax: free.pitchMax ?? 1.22,
        constrainYaw: false,
        showFocusMarker: false,
        blockerOpacity: free.blockerOpacity ?? 0.08,
        ambientDensityScale: free.ambientDensityScale ?? 0.58,
        nearCameraFadeRadius: free.nearCameraFadeRadius ?? 1.55,
        corridorRadius: free.corridorRadius ?? 0.38,
        occlusionPullbackScale: free.occlusionPullbackScale,
        followSmoothing: free.followSmoothing,
        fovSmoothing: free.fovSmoothing,
        preserveEntryAngle: free.preserveEntryAngle !== false
      }
    };
  }

  release(event) {
    if (this.workActive) this.exitCoreWork(`${event}_core_work_released`);
    this.active = false;
    this.justDeactivated = true;
    this.lastEvent = event;
    this.deniedReason = "none";
  }

  createState(
    focus = this.createPlayerForwardFocus(this.frameState),
    authoredAssistAvailable = false,
    authored = {},
    guideAvailable = this.isGuideAvailable(this.frameState)
  ) {
    const activation = this.profile?.activation ?? {};
    const framing = this.profile?.framing ?? {};
    const workFraming = this.profile?.workFraming ?? {};
    const behavior = this.profile?.behavior ?? {};
    const copy = this.profile?.copy ?? {};
    const focusDistance = Number.isFinite(focus.distance) ? focus.distance : 0;
    const position = focus.position ?? { x: 0, y: 0, z: 0 };
    const coreCamera = focus.camera ?? {};
    const camera = this.workActive ? workFraming : coreCamera;
    const focusMode = authoredAssistAvailable ? "authored_interaction" : "player_forward";
    const selfInspection = Boolean(this.active && focus.selfInspection && !authoredAssistAvailable);
    const workComposition = workFraming.guideComposition ?? {};

    return {
      pass: "HC-024C2",
      id: this.profile?.id ?? PROFILE_ID,
      architecture: "persistent_core_inspection_plus_guide_physical_piece_manipulation",
      active: this.active,
      available: this.available,
      mode: this.active
        ? this.workActive
          ? "guide_assisted_core_work"
          : focusMode === "authored_interaction"
            ? "foundational_interaction_inspection"
            : (focus.selfInspection ? "core_self_inspection_orbit" : "persistent_tight_third_person")
        : "player_tethered_orbit",
      status: this.active
        ? this.workActive
          ? "guide_attending_core_work_view"
          : focusMode === "authored_interaction"
            ? "tight_camera_authored_focus"
            : (focus.selfInspection ? "core_self_inspection_active" : "tight_camera_player_forward")
        : "core_inspection_available_globally",
      justActivated: this.justActivated,
      justDeactivated: this.justDeactivated,
      justFocusChanged: this.justFocusChanged,
      justWorkActivated: this.justWorkActivated,
      justWorkDeactivated: this.justWorkDeactivated,
      toggleCount: this.toggleCount,
      lastToggleAt: this.lastToggleAt,
      lastEvent: this.lastEvent,
      deniedReason: this.deniedReason,
      focusMode,
      focusProviderId: focus.providerId ?? "InspectionCameraSystem",
      focusObjectId: focus.id ?? "player_core_self_inspection",
      focusLabel: this.workActive ? "Guide-assisted Core Work" : (focus.label ?? "Core self-inspection"),
      selfInspection,
      coreCentered: selfInspection,
      coreWorkActive: Boolean(this.workActive),
      coreWorkBlend: this.workBlend,
      coreWorkAvailable: Boolean(this.active && selfInspection && guideAvailable),
      guideWorkAvailable: guideAvailable,
      workEntryCount: this.workEntryCount,
      lastWorkAt: this.lastWorkAt,
      lastWorkEvent: this.lastWorkEvent,
      coreWorkInput: "D-Pad Down controller / G keyboard while in Core Inspection",
      coreWorkExitInput: "B controller / Escape keyboard returns to external Core inspection; Y/F exits to world view",
      worldInteractSuppressedDuringSelfInspection: false,
      targetOwnedPrimaryAction: true,
      intentionalCoreWorkEntry: true,
      coreWorkEntryButton: "dpad_down",
      guideHoneRequiredForCoreWorkEntry: false,
      chemistryEnabled: Boolean(this.profile?.behavior?.coreWorkChemistryEnabled),
      pieceManipulationEnabled: Boolean(this.workActive),
      traversalPaused: false,
      traversalInputSuppressed: Boolean(this.workActive),
      guideComposition: {
        sideOffset: workComposition.sideOffset ?? 0.76,
        lift: workComposition.lift ?? 0.34,
        cameraTowardOffset: workComposition.cameraTowardOffset ?? 0.18,
        minimumCoreSeparation: workComposition.minimumCoreSeparation ?? 0.54
      },
      membraneTransparencyTarget: workFraming.membraneTransparencyTarget ?? 0.58,
      focusPosition: {
        x: position.x ?? 0,
        y: position.y ?? 0,
        z: position.z ?? 0
      },
      focusDistance,
      authoredFocusReadable: Boolean(authored.focusActive && authored.cellMatches),
      authoredFocusAvailable: authoredAssistAvailable,
      authoredFocusDistance: authored.focusDistance ?? Infinity,
      authoredFocusAssistRange: authored.assistRange ?? activation.authoredFocusAssistRange ?? 6.2,
      authoredFocusIntentAlignment: authored.intentAlignment ?? this.lastIntentAlignment,
      authoredFocusIntentDot: authored.intentDot ?? activation.authoredFocusIntentDot ?? 0.72,
      authoredFocusIntentAligned: Boolean(authored.intentAligned),
      authoredFocusTargetMatches: Boolean(authored.targetMatches),
      manualFocusOverrideSeconds: this.manualFocusOverrideSeconds,
      focusIntentReason: this.workActive ? "core_work_suppresses_authored_focus_assist" : this.lastIntentReason,
      authoredLockPolicy: "Y enters tight view; authored object lock requires view intent; Core Work keeps the focus on the player Core",
      showFocusMarker: this.workActive ? false : (camera.showFocusMarker ?? authoredAssistAvailable),
      constrainYaw: this.workActive ? false : (camera.constrainYaw ?? authoredAssistAvailable),
      toggleRange: authoredAssistAvailable ? (focus.toggleRange ?? activation.toggleRange ?? 4.6) : Infinity,
      autoExitRange: Infinity,
      controllerButtonIndex: activation.controllerButtonIndex ?? 3,
      controllerButtonLabel: activation.controllerButtonLabel ?? "Y",
      keyboardCode: activation.keyboardCode ?? "KeyF",
      keyboardLabel: activation.keyboardLabel ?? "F",
      toggleHint: this.workActive
        ? (copy.workManipulate ?? "D-Pad chooses a piece · A grabs/places · Left Stick moves · RT/LT shifts depth · B backs out · Y returns to world.")
        : this.active
          ? selfInspection
            ? (copy.workEnter ?? "Press D-Pad Down / G to enter Core Work; Y returns to exploration.")
            : (copy.exit ?? "Press Y to return to exploration orbit.")
          : authoredAssistAvailable
            ? (copy.enterFocused ?? copy.enter ?? "Press Y to inspect this interaction closely.")
            : (copy.enterGlobal ?? "Press Y to inspect the Core; look toward an authored object to focus it."),
      distance: camera.distance ?? framing.distance ?? 4.55,
      fieldOfView: camera.fieldOfView ?? framing.fieldOfView ?? 52,
      targetBlendTowardFocus: camera.targetBlendTowardFocus ?? framing.targetBlendTowardFocus ?? 0.72,
      targetLift: camera.targetLift ?? framing.targetLift ?? 0.12,
      baseHeight: camera.baseHeight ?? framing.baseHeight ?? 0.92,
      pitch: camera.pitch ?? framing.pitch ?? 0.24,
      shoulderOffset: camera.shoulderOffset ?? framing.shoulderOffset ?? 0.62,
      forwardOffset: camera.forwardOffset ?? framing.forwardOffset ?? 0.18,
      yawSensitivityScale: camera.yawSensitivityScale ?? framing.yawSensitivityScale ?? 0.46,
      pitchSensitivityScale: camera.pitchSensitivityScale ?? framing.pitchSensitivityScale ?? 0.44,
      maxYawOffset: camera.maxYawOffset ?? framing.maxYawOffset ?? 0.58,
      pitchMin: camera.pitchMin ?? framing.pitchMin ?? 0.08,
      pitchMax: camera.pitchMax ?? framing.pitchMax ?? 0.5,
      occlusionPullbackScale: camera.occlusionPullbackScale ?? framing.occlusionPullbackScale ?? 0.3,
      followSmoothing: camera.followSmoothing ?? framing.followSmoothing ?? 7.2,
      fovSmoothing: camera.fovSmoothing ?? framing.fovSmoothing ?? 6.4,
      focusMarkerScale: camera.focusMarkerScale ?? framing.focusMarkerScale ?? 0.72,
      blockerOpacity: camera.blockerOpacity ?? framing.blockerOpacity ?? 0.075,
      ambientDensityScale: camera.ambientDensityScale ?? framing.ambientDensityScale ?? 0.36,
      nearCameraFadeRadius: camera.nearCameraFadeRadius ?? 2.15,
      corridorRadius: camera.corridorRadius ?? 0.62,
      preserveEntryAngle: camera.preserveEntryAngle !== false,
      optional: behavior.optional !== false,
      forced: Boolean(behavior.forced),
      firstPerson: Boolean(behavior.firstPerson),
      reusableFromOpening: true,
      persistentAcrossCells: true,
      persistsWithoutAuthoredFocus: true,
      playerSelectedMode: true,
      authoredFocusAssistOnly: true,
      cameraRelativeMovementPreserved: behavior.preserveCameraRelativeMovement !== false,
      rightStickOrbitPreserved: behavior.preserveRightStickOrbit !== false,
      r3RecentersInspection: behavior.r3RecentersInspection !== false,
      instantReturnAvailable: behavior.instantReturnAvailable !== false,
      targetRequired: false,
      routeActivated: false,
      activeCellChanges: false,
      interactionStateChanged: this.workActive,
      blocker: "none_detected"
    };
  }
}
