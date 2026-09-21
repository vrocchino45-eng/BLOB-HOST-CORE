import { ControlMap, HOST_CORE_CONTROL_MAP_ID } from "./ControlMap.js";

export class InputSystem {
  constructor({ controlMap = new ControlMap() } = {}) {
    this.controlMap = controlMap;
    this.keys = new Set();
    this.mouseButtons = new Set();
    this.frameInput = this.createEmptyInput();

    this.queued = {
      pulse: false,
      pulseSource: "none",
      pulseReleased: false,
      pulseReleaseSource: "none",
      interact: false,
      coreWorkView: false,
      guideFocus: false,
      recenter: false,
      cancel: false,
      statusPage: false,
      statusPageSource: "none",
      statusTabPrev: false,
      statusTabNext: false,
      menuUp: false,
      menuDown: false,
      menuLeft: false,
      menuRight: false,
      debugJumpSlot: 0,
      debugJumpDirect: false,
      debugTestPlatformSlot: 0,
      debugCoreWorkSeedPressed: false,
      debugCoreEngineCyclePressed: false
    };

    this.activeGamepadIndex = null;
    this.prevGamepadButtonDown = new Map();
    this.pulseSequence = 0;
    // HC027J1: Pulse becomes a tap/hold/release verb. A quick release emits the
    // established local Pulse; holding commits the Core and releases a deeper Pulse.
    this.pulsePhysicalWasDown = false;
    this.pulseHoldSeconds = 0;
    this.pulseCharge01 = 0;
    this.pulseLastReleaseCharge01 = 0;
    this.pulseHoldSource = "none";
    this.pulseChargeThresholdSeconds = 0.34;
    this.pulseFullChargeSeconds = 1.28;
    this.interactSequence = 0;
    this.coreWorkSequence = 0;
    this.statusPageSequence = 0;
    this.lastPulseSource = "none";
    this.lastPulseAtFrame = -1;
    this.lastStatusPageSource = "none";
    this.lastStatusPageAtFrame = -1;

    // HC027K1 — playtest input instrumentation. This is debug-only telemetry:
    // it observes physical input and the already-resolved canonical actions without
    // changing mappings, action timing, dead zones, or gameplay authority.
    this.inputTelemetryHistory = [];
    this.inputTelemetryMaxEvents = 8;
    this.inputTelemetryWindowMs = 3600;
    this.prevTelemetryTriggerState = { absorb: false, stabilize: false };

    this.boundKeyDown = (event) => this.onKeyDown(event);
    this.boundKeyUp = (event) => this.onKeyUp(event);
    this.boundMouseDown = (event) => this.onMouseDown(event);
    this.boundMouseUp = (event) => this.onMouseUp(event);
    this.boundContextMenu = (event) => event.preventDefault();
    this.boundGamepadConnected = (event) => this.onGamepadConnected(event);
    this.boundGamepadDisconnected = (event) => this.onGamepadDisconnected(event);
  }

  init() {
    window.addEventListener("keydown", this.boundKeyDown);
    window.addEventListener("keyup", this.boundKeyUp);
    window.addEventListener("mousedown", this.boundMouseDown);
    window.addEventListener("mouseup", this.boundMouseUp);
    window.addEventListener("contextmenu", this.boundContextMenu);
    window.addEventListener("gamepadconnected", this.boundGamepadConnected);
    window.addEventListener("gamepaddisconnected", this.boundGamepadDisconnected);
  }

  createEmptyInput() {
    return {
      moveX: 0,
      moveY: 0,
      moveZ: 0,
      boostHeld: false,
      interactPressed: false,
      interactEventId: 0,
      coreWorkViewPressed: false,
      coreWorkViewSource: "none",
      primaryActionContext: "world",
      primaryActionRole: "commit_reserved",
      primaryActionSuppressed: false,
      coreWorkPressed: false,
      coreWorkEventId: 0,
      coreWorkManipX: 0,
      coreWorkManipY: 0,
      coreWorkManipDepth: 0,
      coreWorkSelectPrevPressed: false,
      coreWorkSelectNextPressed: false,
      coreWorkTraversalSuppressed: false,
      worldInteractSuppressedByCoreWork: false,
      pulsePressed: false,
      pulseEventId: 0,
      pulseSource: "none",
      pulseHeld: false,
      pulseReleased: false,
      pulseHoldSeconds: 0,
      pulseCharge01: 0,
      pulseReleaseCharge01: 0,
      pulseReleaseKind: "none",
      pulseCommitment: "idle",
      pulseChargeRateMultiplier: 1,
      pulseEffectiveChargeThresholdSeconds: this?.pulseChargeThresholdSeconds ?? 0.34,
      pulseEffectiveFullChargeSeconds: this?.pulseFullChargeSeconds ?? 1.28,
      absorbHeld: false,
      stabilizeHeld: false,
      resonanceHeld: false,
      guideFocusPressed: false,
      cancelPressed: false,
      cameraLookX: 0,
      cameraLookY: 0,
      recenterCameraPressed: false,
      toggleInspectionCameraPressed: false,
      statusPageTogglePressed: false,
      statusPageEventId: 0,
      statusPageSource: "none",
      statusTabPrevPressed: false,
      statusTabNextPressed: false,
      menuUpPressed: false,
      menuDownPressed: false,
      menuLeftPressed: false,
      menuRightPressed: false,
      debugJumpSlot: 0,
      debugJumpDirect: false,
      debugTestPlatformSlot: 0,
      debugCoreWorkSeedPressed: false,
      debugCoreEngineCyclePressed: false
    };
  }

  onKeyDown(event) {
    this.keys.add(event.code);

    if (!event.repeat) {
      this.recordInputTelemetryEvent(`${this.keyboardEventLabel(event)} DOWN`, "keyboard");
    }

    if ((event.code === "Space" || event.code === "KeyX") && !event.repeat) {
      this.queuePulse(event.code === "Space" ? "keyboard_space" : "keyboard_x");
      event.preventDefault();
    }

    if (event.code === "KeyE" && !event.repeat) {
      this.queued.interact = true;
      event.preventDefault();
    }

    // HC024D0C keyboard companion for the intentional controller D-Pad Down
    // Core Work command. It is separate from E so external inspection can keep
    // normal target interaction without mode leakage.
    if (event.code === "KeyG" && !event.repeat) {
      this.queued.coreWorkView = true;
      event.preventDefault();
    }

    if ((event.code === "KeyF" || event.code === "KeyV") && !event.repeat) {
      this.queued.guideFocus = true;
      event.preventDefault();
    }

    if (event.code === "KeyR" && !event.repeat) {
      this.queued.recenter = true;
      event.preventDefault();
    }

    if (event.code === "Tab" && !event.repeat) {
      this.queued.statusPage = true;
      this.queued.statusPageSource = "keyboard_tab";
      event.preventDefault();
    }

    if (event.code === "BracketLeft" && !event.repeat) {
      this.queued.statusTabPrev = true;
      event.preventDefault();
    }

    if (event.code === "BracketRight" && !event.repeat) {
      this.queued.statusTabNext = true;
      event.preventDefault();
    }

    if (event.code === "ArrowUp" && !event.repeat) this.queued.menuUp = true;
    if (event.code === "ArrowDown" && !event.repeat) this.queued.menuDown = true;
    if (event.code === "ArrowLeft" && !event.repeat) this.queued.menuLeft = true;
    if (event.code === "ArrowRight" && !event.repeat) this.queued.menuRight = true;

    if ((event.ctrlKey || event.metaKey) && !event.repeat && /^Digit[1-8]$/.test(event.code)) {
      this.queued.debugJumpSlot = Number(event.code.slice(-1));
      this.queued.debugJumpDirect = Boolean(event.shiftKey);
      event.preventDefault();
    }

    // HC027G1 deterministic 8-minute playtest harness. Shift+1..8 stays page-local
    // in external browsers, unlike Ctrl/Cmd+number which commonly switches tabs.
    // This is debug-only test positioning and never completes progression.
    if (event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey && !event.repeat && /^Digit[1-8]$/.test(event.code)) {
      this.queued.debugTestPlatformSlot = Number(event.code.slice(-1));
      event.preventDefault();
    }

    // HC024D0 quick-test only: expose the three retained Core anatomy groups
    // without completing or mutating their authored routes. This is intentionally
    // a keyboard-only dev key so it cannot become accidental gameplay input.
    if (event.code === "KeyP" && !event.repeat) {
      this.queued.debugCoreWorkSeedPressed = true;
      event.preventDefault();
    }

    // HC027B debug-only engine architecture comparison. This never changes
    // progression or Core Work placement; it cycles the physiology proof
    // through the canonical 3 -> 6 -> 12 firing resolutions.
    if (event.code === "KeyO" && !event.repeat) {
      this.queued.debugCoreEngineCyclePressed = true;
      event.preventDefault();
    }

    if (event.code === "Escape" && !event.repeat) {
      this.queued.cancel = true;
    }
  }

  onKeyUp(event) {
    this.keys.delete(event.code);
    this.recordInputTelemetryEvent(`${this.keyboardEventLabel(event)} UP`, "keyboard");
    if (event.code === "Space" || event.code === "KeyX") {
      this.queued.pulseReleased = true;
      this.queued.pulseReleaseSource = event.code === "Space" ? "keyboard_space" : "keyboard_x";
      event.preventDefault();
    }
  }

  onMouseDown(event) {
    this.mouseButtons.add(event.button);
    this.recordInputTelemetryEvent(`MOUSE ${this.mouseButtonLabel(event.button)} DOWN`, "mouse");
    if (event.button === 0) {
      this.queuePulse("mouse_left");
    }
  }

  onMouseUp(event) {
    this.mouseButtons.delete(event.button);
    this.recordInputTelemetryEvent(`MOUSE ${this.mouseButtonLabel(event.button)} UP`, "mouse");
    if (event.button === 0) {
      this.queued.pulseReleased = true;
      this.queued.pulseReleaseSource = "mouse_left";
    }
  }

  onGamepadConnected(event) {
    if (this.activeGamepadIndex === null) {
      this.activeGamepadIndex = event.gamepad.index;
    }
  }

  onGamepadDisconnected(event) {
    if (this.activeGamepadIndex === event.gamepad.index) {
      this.activeGamepadIndex = null;
      this.prevGamepadButtonDown.clear();
    }
  }

  update(_dt, frameState) {
    const tuning = this.getTuning(frameState);
    const keyboard = this.readKeyboard();
    const gamepad = this.readGamepad(tuning);

    const rawMoveX = this.clamp(keyboard.moveX + gamepad.moveX, -1, 1);
    const statusOpen = Boolean(frameState.statusPage?.open);
    const gameplayBumperLift = statusOpen ? 0 : (gamepad.gameplayVerticalY ?? 0);
    const rawMoveY = this.clamp(keyboard.moveY + gamepad.moveY + gameplayBumperLift, -1, 1);
    const rawMoveZ = this.clamp(keyboard.moveZ + gamepad.moveZ, -1, 1);
    const rawMoveLength = Math.hypot(rawMoveX, rawMoveY, rawMoveZ) || 1;

    const cameraLookX = this.clamp(keyboard.cameraLookX + gamepad.cameraLookX, -1, 1);
    const cameraLookY = this.clamp(keyboard.cameraLookY + gamepad.cameraLookY, -1, 1);

    // HC027J1: physical Pulse down-state is continuous; the gameplay Pulse event
    // is emitted on release so hold duration can become meaningful without remapping X.
    const keyboardPulseDown = Boolean(
      this.keys.has("Space") || this.keys.has("KeyX") || this.mouseButtons.has(0)
    );
    const gamepadPulseDown = Boolean(gamepad.pulseButtonDown);
    const physicalPulseDown = Boolean(keyboardPulseDown || gamepadPulseDown);
    const pulseStarted = Boolean(physicalPulseDown && !this.pulsePhysicalWasDown);
    const explicitRelease = Boolean(this.queued.pulseReleased);
    const pulseReleased = Boolean((this.pulsePhysicalWasDown && !physicalPulseDown) || explicitRelease);
    const pulseSource = gamepadPulseDown
      ? "gamepad_x_button_2"
      : keyboardPulseDown
        ? (this.mouseButtons.has(0) ? "mouse_left" : this.keys.has("Space") ? "keyboard_space" : "keyboard_x")
        : this.queued.pulseReleaseSource !== "none"
          ? this.queued.pulseReleaseSource
          : (this.pulseHoldSource !== "none" ? this.pulseHoldSource : this.lastPulseSource);

    if (pulseStarted) {
      this.pulseHoldSeconds = 0;
      this.pulseHoldSource = pulseSource;
    }
    if (physicalPulseDown) this.pulseHoldSeconds += Math.max(0, _dt ?? 0);
    const pulsePhysiology = frameState.corePerformance?.verbModifiers?.pulse ?? {};
    const chargeRateMultiplier = this.clamp(pulsePhysiology.chargeRateMultiplier ?? 1, 0.84, 1.20);
    const effectivePulseChargeThresholdSeconds = this.pulseChargeThresholdSeconds / Math.sqrt(chargeRateMultiplier);
    const effectivePulseFullChargeSeconds = this.pulseFullChargeSeconds / chargeRateMultiplier;
    const chargeSpan = Math.max(0.01, effectivePulseFullChargeSeconds - effectivePulseChargeThresholdSeconds);
    this.pulseCharge01 = physicalPulseDown
      ? this.clamp((this.pulseHoldSeconds - effectivePulseChargeThresholdSeconds) / chargeSpan, 0, 1)
      : 0;
    const releasedHoldSeconds = pulseReleased ? this.pulseHoldSeconds : 0;
    const releasedCharge01 = pulseReleased
      ? this.clamp((releasedHoldSeconds - effectivePulseChargeThresholdSeconds) / chargeSpan, 0, 1)
      : 0;
    const pulseReleaseKind = pulseReleased
      ? (releasedHoldSeconds >= effectivePulseChargeThresholdSeconds ? "charged" : "quick")
      : "none";
    const rawPulsePressed = pulseReleased;
    const rawInteractPressed = gamepad.interactPressed || keyboard.interactPressed;
    const priorInspection = frameState.inspectionCamera ?? frameState.tightInspectionCamera ?? {};
    const inspectionContext = Boolean(priorInspection.active);
    const coreWorkContext = Boolean(inspectionContext && priorInspection.coreWorkActive);
    const coreInspectionContext = Boolean(inspectionContext && !priorInspection.coreWorkActive);

    // HC028D2: A/E is no longer a generic world-interact button. In World and
    // external Core Inspection it is reserved for deliberate commitment only.
    // Entering Core Work remains a separate intentional command: D-Pad Down on
    // controller (G on keyboard). Once Core Work is active, A/E owns grab/place
    // because placing internal anatomy is itself an intentional arrangement action.
    const guideFocus = frameState.guideFocus ?? {};
    const guideHoned = Boolean(coreInspectionContext && guideFocus.honed);
    const primaryActionContext = statusOpen
      ? "status_ui"
      : coreWorkContext
        ? "core_work"
        : coreInspectionContext
          ? "core_inspection_world"
          : "world";
    const primaryActionRole = primaryActionContext === "core_work"
      ? "core_work_grab_place"
      : primaryActionContext === "status_ui"
        ? "status_ui_reserved"
        : "commit_reserved";
    const primaryActionSuppressed = Boolean(statusOpen && rawInteractPressed);
    const coreWorkPressed = Boolean(rawInteractPressed && !statusOpen && coreWorkContext);
    const interactPressed = Boolean(rawInteractPressed && !statusOpen && !coreWorkContext);
    const pulsePressed = Boolean(rawPulsePressed && !coreWorkContext);
    const pulseHeld = Boolean(physicalPulseDown && !coreWorkContext);
    const pulseReleaseCharge01 = pulsePressed ? releasedCharge01 : 0;
    const pulseCommitment = pulseHeld
      ? (this.pulseHoldSeconds < effectivePulseChargeThresholdSeconds ? "priming" : this.pulseCharge01 >= 0.98 ? "full_charge" : "charging")
      : pulsePressed
        ? pulseReleaseKind
        : "idle";
    const coreWorkManipX = coreWorkContext ? rawMoveX : 0;
    const coreWorkManipY = coreWorkContext ? -rawMoveZ : 0;
    const guideFocusPressed = gamepad.guideFocusPressed || keyboard.guideFocusPressed;
    const recenterCameraPressed = gamepad.recenterCameraPressed || keyboard.recenterCameraPressed;
    const cancelPressed = gamepad.cancelPressed || keyboard.cancelPressed;
    const statusPageTogglePressed = gamepad.statusPageTogglePressed || keyboard.statusPageTogglePressed;
    const statusPageSource = gamepad.statusPageTogglePressed
      ? gamepad.statusPageSource
      : keyboard.statusPageSource;
    const statusTabPrevPressed = gamepad.statusTabPrevPressed || keyboard.statusTabPrevPressed;
    const statusTabNextPressed = gamepad.statusTabNextPressed || keyboard.statusTabNextPressed;
    const menuUpPressed = gamepad.menuUpPressed || keyboard.menuUpPressed;
    const menuDownPressed = gamepad.menuDownPressed || keyboard.menuDownPressed;
    const menuLeftPressed = gamepad.menuLeftPressed || keyboard.menuLeftPressed;
    const menuRightPressed = gamepad.menuRightPressed || keyboard.menuRightPressed;
    const coreWorkViewPressed = Boolean(
      coreInspectionContext
      && !statusOpen
      && (gamepad.coreWorkViewPressed || keyboard.coreWorkViewPressed)
    );
    const coreWorkViewSource = coreWorkViewPressed
      ? (gamepad.coreWorkViewPressed ? "gamepad_dpad_down" : "keyboard_g")
      : "none";
    const rawAbsorbHeld = keyboard.absorbHeld || gamepad.absorbHeld;
    const rawStabilizeHeld = keyboard.stabilizeHeld || gamepad.stabilizeHeld;
    const coreWorkManipDepth = coreWorkContext
      ? this.clamp(
          Math.max(gamepad.absorbTriggerValue ?? 0, keyboard.absorbHeld ? 1 : 0)
          - Math.max(gamepad.stabilizeTriggerValue ?? 0, keyboard.stabilizeHeld ? 1 : 0),
          -1,
          1
        )
      : 0;
    const absorbHeld = Boolean(rawAbsorbHeld && !coreWorkContext);
    const stabilizeHeld = Boolean(rawStabilizeHeld && !coreWorkContext);
    const coreWorkSelectPrevPressed = Boolean(coreWorkContext && menuLeftPressed);
    const coreWorkSelectNextPressed = Boolean(coreWorkContext && menuRightPressed);

    if (pulsePressed) {
      this.pulseSequence += 1;
      this.lastPulseSource = pulseSource;
      this.lastPulseAtFrame = frameState.frame ?? -1;
      this.pulseLastReleaseCharge01 = pulseReleaseCharge01;
    }
    this.pulsePhysicalWasDown = physicalPulseDown;
    if (pulseReleased) {
      this.pulseHoldSeconds = 0;
      this.pulseHoldSource = "none";
    }

    if (interactPressed) {
      this.interactSequence += 1;
    }
    if (coreWorkPressed || coreWorkViewPressed) {
      this.coreWorkSequence += 1;
    }
    if (statusPageTogglePressed) {
      this.statusPageSequence += 1;
      this.lastStatusPageSource = statusPageSource;
      this.lastStatusPageAtFrame = frameState.frame ?? -1;
    }

    this.frameInput = {
      moveX: coreWorkContext ? 0 : rawMoveX / rawMoveLength,
      moveY: (coreWorkContext || coreWorkViewPressed) ? 0 : rawMoveY / rawMoveLength,
      moveZ: coreWorkContext ? 0 : rawMoveZ / rawMoveLength,
      boostHeld: coreWorkContext ? false : (keyboard.boostHeld || gamepad.boostHeld),
      interactPressed,
      interactEventId: this.interactSequence,
      primaryActionContext,
      primaryActionRole,
      primaryActionSuppressed,
      coreWorkPressed,
      coreWorkViewPressed,
      coreWorkViewSource,
      coreWorkEventId: this.coreWorkSequence,
      coreWorkManipX,
      coreWorkManipY,
      coreWorkManipDepth,
      coreWorkSelectPrevPressed,
      coreWorkSelectNextPressed,
      coreWorkTraversalSuppressed: coreWorkContext,
      worldInteractSuppressedByCoreWork: Boolean(rawInteractPressed && coreWorkContext),
      guideHonedForReadability: guideHoned,
      pulsePressed,
      pulseEventId: this.pulseSequence,
      pulseSource,
      pulseHeld,
      pulseReleased: pulsePressed,
      pulseHoldSeconds: pulseHeld ? this.pulseHoldSeconds : releasedHoldSeconds,
      pulseCharge01: pulseHeld ? this.pulseCharge01 : 0,
      pulseReleaseCharge01,
      pulseReleaseKind: pulsePressed ? pulseReleaseKind : "none",
      pulseCommitment,
      pulseChargeRateMultiplier: chargeRateMultiplier,
      pulseEffectiveChargeThresholdSeconds: effectivePulseChargeThresholdSeconds,
      pulseEffectiveFullChargeSeconds: effectivePulseFullChargeSeconds,
      absorbHeld,
      stabilizeHeld,
      // Compatibility alias while existing authored interactions are rebound.
      resonanceHeld: stabilizeHeld,
      guideFocusPressed,
      cancelPressed,
      cameraLookX,
      cameraLookY,
      recenterCameraPressed,
      // Y/F retains the canonical focus action and now toggles Core self-inspection when no authored focus is adopted.
      toggleInspectionCameraPressed: guideFocusPressed,
      statusPageTogglePressed,
      statusPageEventId: this.statusPageSequence,
      statusPageSource,
      statusTabPrevPressed,
      statusTabNextPressed,
      menuUpPressed: coreWorkContext ? false : menuUpPressed,
      menuDownPressed: (coreWorkContext || coreWorkViewPressed) ? false : menuDownPressed,
      menuLeftPressed: coreWorkContext ? false : menuLeftPressed,
      menuRightPressed: coreWorkContext ? false : menuRightPressed,
      debugJumpSlot: this.queued.debugJumpSlot ?? 0,
      debugJumpDirect: Boolean(this.queued.debugJumpDirect),
      debugTestPlatformSlot: this.queued.debugTestPlatformSlot ?? 0,
      debugCoreWorkSeedPressed: Boolean(this.queued.debugCoreWorkSeedPressed),
      debugCoreEngineCyclePressed: Boolean(this.queued.debugCoreEngineCyclePressed)
    };

    const expectedAction = this.getExpectedAction(frameState);

    frameState.input = { ...this.frameInput };
    frameState.controlMap = {
      ...this.controlMap.describe(),
      active: true,
      sourceAuthority: "HOST_CORE_Blueprint_v1_reference_docs.zip",
      expectedAction,
      primaryActionContext,
      primaryActionRole,
      primaryActionOwnership: {
        world: "A/E -> deliberate Commit only when authored opportunity exists",
        core_inspection: "A/E -> deliberate Commit only; D-Pad Down/G enters Core Work",
        core_work: "A/E -> grab/place selected retained anatomy",
        status_ui: "A/E -> reserved; no world/Core action"
      },
      compatibilityAliases: {
        resonanceHeld: "stabilizeHeld",
        toggleInspectionCameraPressed: "guideFocusPressed"
      }
    };

    frameState.inputSource = {
      keyboardActive: keyboard.active,
      gamepadActive: gamepad.connected,
      gamepadName: gamepad.name,
      gamepadMapping: gamepad.mapping,
      gamepadButtonCount: gamepad.buttonCount,
      activeDevice: gamepad.connected ? "gamepad+keyboard" : "keyboard+mouse",
      controlMapId: HOST_CORE_CONTROL_MAP_ID,
      canonicalControlsActive: true,
      expectedAction,
      coreSelfInspectionContext: coreInspectionContext,
      coreWorkActive: Boolean(priorInspection.coreWorkActive),
      coreWorkPressed,
      coreWorkSequence: this.coreWorkSequence,
      coreWorkManipX,
      coreWorkManipY,
      coreWorkManipDepth,
      coreWorkSelectPrevPressed,
      coreWorkSelectNextPressed,
      coreWorkTraversalSuppressed: coreWorkContext,
      worldInteractSuppressedByCoreWork: Boolean(rawInteractPressed && coreWorkContext),
      guideHonedForReadability: guideHoned,
      cameraControlActive: Math.abs(cameraLookX) > 0 || Math.abs(cameraLookY) > 0 || recenterCameraPressed || guideFocusPressed,
      inspectionCameraTogglePressed: Boolean(guideFocusPressed),
      inspectionCameraButtonIndex: 3,
      inspectionCameraButtonValue: gamepad.guideFocusButtonValue ?? 0,
      inspectionCameraButtonDown: Boolean(gamepad.guideFocusButtonDown),
      inspectionCameraKeyboardKey: "F",
      inspectionCameraKeyboardAlias: "V",
      leftStickMagnitude: gamepad.leftStickMagnitude ?? 0,
      rightStickMagnitude: gamepad.rightStickMagnitude ?? 0,
      pulseButtonIndex: 2,
      pulseButtonValue: gamepad.pulseButtonValue ?? 0,
      pulseButtonDown: Boolean(gamepad.pulseButtonDown),
      pulseHeld,
      pulseHoldSeconds: Number((pulseHeld ? this.pulseHoldSeconds : 0).toFixed(3)),
      pulseCharge01: Number((pulseHeld ? this.pulseCharge01 : 0).toFixed(3)),
      pulseReleaseKind: pulsePressed ? pulseReleaseKind : "none",
      pulseReleaseCharge01: Number(pulseReleaseCharge01.toFixed(3)),
      pulseCommitment,
      interactButtonIndex: 0,
      interactButtonValue: gamepad.interactButtonValue ?? 0,
      interactButtonDown: Boolean(gamepad.interactButtonDown),
      absorbTriggerIndex: 7,
      absorbTriggerValue: gamepad.absorbTriggerValue ?? 0,
      stabilizeTriggerIndex: 6,
      stabilizeTriggerValue: gamepad.stabilizeTriggerValue ?? 0,
      absorbHeld: Boolean(absorbHeld),
      stabilizeHeld: Boolean(stabilizeHeld),
      resonanceHeld: Boolean(stabilizeHeld),
      verticalBumperInput: gameplayBumperLift,
      verticalBumpersSuppressedByStatus: statusOpen,
      verticalAscendButtonIndex: 5,
      verticalDescendButtonIndex: 4,
      interactSequence: this.interactSequence,
      coreWorkSequence: this.coreWorkSequence,
      coreWorkViewPressed,
      coreWorkViewSource,
      coreWorkViewButtonIndex: 13,
      pulseSequence: this.pulseSequence,
      statusPageSequence: this.statusPageSequence,
      statusPageTogglePressed: Boolean(statusPageTogglePressed),
      statusPageSource,
      statusPageViewButtonIndex: 8,
      statusPageMenuButtonIndex: 9,
      lastStatusPageSource: this.lastStatusPageSource,
      lastStatusPageAtFrame: this.lastStatusPageAtFrame,
      lastPulseSource: this.lastPulseSource,
      lastPulseAtFrame: this.lastPulseAtFrame,
      inputReliabilityPass: "HC-006H",
      inputComfortPass: "HC-003I",
      // Deprecated compatibility diagnostics retained for older debug panels.
      pulseContext: expectedAction,
      contextButtonIndex: 0,
      contextButtonValue: gamepad.interactButtonValue ?? 0,
      contextButtonDown: Boolean(gamepad.interactButtonDown),
      contextButtonActsAsPulse: false,
      contextButtonActsAsHold: false,
      contextHoldKind: "none",
      primaryActionContext,
      primaryActionRole,
      primaryActionSuppressed
    };

    frameState.inputTelemetry = this.buildInputTelemetry({
      frameState,
      gamepad,
      rawMoveX,
      rawMoveY,
      rawMoveZ,
      cameraLookX,
      cameraLookY,
      physicalPulseDown,
      pulsePressed,
      pulseReleaseKind,
      pulseReleaseCharge01,
      primaryActionContext,
      expectedAction
    });

    if (pulsePressed) {
      frameState.inputActionAudit = {
        pass: "HC-006H",
        eventId: this.pulseSequence,
        producedAtFrame: frameState.frame ?? -1,
        source: pulseSource,
        activeCellId: frameState.activeCellId ?? "none",
        targetIdAtProduction: frameState.targeting?.targetId ?? "none",
        consumedBy: "none",
        consumedAtFrame: -1,
        consumedTargetId: "none",
        result: "pulse_produced_waiting_for_consumer"
      };
    } else if (!frameState.inputActionAudit) {
      frameState.inputActionAudit = {
        pass: "HC-006H",
        eventId: 0,
        producedAtFrame: -1,
        source: "none",
        activeCellId: frameState.activeCellId ?? "none",
        targetIdAtProduction: "none",
        consumedBy: "none",
        consumedAtFrame: -1,
        consumedTargetId: "none",
        result: "no_pulse_yet"
      };
    }

    if (interactPressed) {
      frameState.interactActionAudit = {
        pass: "HC-006H",
        eventId: this.interactSequence,
        producedAtFrame: frameState.frame ?? -1,
        source: gamepad.interactPressed ? "gamepad_a_button_0" : "keyboard_e",
        activeCellId: frameState.activeCellId ?? "none",
        result: "commit_press_reserved_waiting_for_explicit_commitment_consumer"
      };
    }

    if (coreWorkViewPressed || coreWorkPressed) {
      frameState.coreWorkInputAudit = {
        pass: "HC-024D0C",
        eventId: this.coreWorkSequence,
        producedAtFrame: frameState.frame ?? -1,
        source: coreWorkViewPressed
          ? coreWorkViewSource
          : (gamepad.interactPressed ? "gamepad_a_button_0" : "keyboard_e"),
        activeCellId: frameState.activeCellId ?? "none",
        worldInteractSuppressed: Boolean(coreWorkContext && rawInteractPressed),
        guideHoned,
        result: coreWorkViewPressed
          ? "core_work_entry_requested_intentionally"
          : "core_work_piece_grab_or_place_requested"
      };
    }

    if (statusPageTogglePressed) {
      frameState.statusPageInputAudit = {
        pass: "HC-008F",
        eventId: this.statusPageSequence,
        producedAtFrame: frameState.frame ?? -1,
        source: statusPageSource,
        activeCellId: frameState.activeCellId ?? "none",
        consumedBy: "none",
        consumedAtFrame: -1,
        result: "status_toggle_produced_waiting_for_status_page"
      };
    } else if (!frameState.statusPageInputAudit) {
      frameState.statusPageInputAudit = {
        pass: "HC-008F",
        eventId: 0,
        producedAtFrame: -1,
        source: "none",
        activeCellId: frameState.activeCellId ?? "none",
        consumedBy: "none",
        consumedAtFrame: -1,
        result: "no_status_toggle_yet"
      };
    }

    this.clearQueuedEdges();
  }

  queuePulse(source) {
    this.queued.pulse = true;
    this.queued.pulseSource = source;
  }

  clearQueuedEdges() {
    this.queued.pulse = false;
    this.queued.pulseSource = "none";
    this.queued.pulseReleased = false;
    this.queued.pulseReleaseSource = "none";
    this.queued.interact = false;
    this.queued.coreWorkView = false;
    this.queued.guideFocus = false;
    this.queued.recenter = false;
    this.queued.cancel = false;
    this.queued.statusPage = false;
    this.queued.statusPageSource = "none";
    this.queued.statusTabPrev = false;
    this.queued.statusTabNext = false;
    this.queued.menuUp = false;
    this.queued.menuDown = false;
    this.queued.menuLeft = false;
    this.queued.menuRight = false;
    this.queued.debugJumpSlot = 0;
    this.queued.debugJumpDirect = false;
    this.queued.debugTestPlatformSlot = 0;
    this.queued.debugCoreWorkSeedPressed = false;
    this.queued.debugCoreEngineCyclePressed = false;
  }

  getTuning(frameState) {
    return frameState.controllerOnboarding?.tuning ?? {
      deadZones: { leftStick: 0.13, rightStick: 0.11, trigger: 0.08 },
      responseCurves: { leftStick: 1.18, rightStick: 1.32, trigger: 1.05 }
    };
  }

  readKeyboard() {
    const mapped = this.controlMap.mapKeyboard({
      isDown: (code) => this.isDown(code),
      mouseButtons: this.mouseButtons,
      queued: this.queued
    });

    return {
      ...mapped,
      active: this.keys.size > 0 || this.mouseButtons.size > 0 || this.queued.pulse || this.queued.interact || this.queued.coreWorkView || this.queued.guideFocus || this.queued.recenter || this.queued.cancel || this.queued.statusPage || this.queued.statusTabPrev || this.queued.statusTabNext || this.queued.menuUp || this.queued.menuDown || this.queued.menuLeft || this.queued.menuRight || this.queued.debugTestPlatformSlot || this.queued.debugCoreWorkSeedPressed || this.queued.debugCoreEngineCyclePressed
    };
  }

  readGamepad(tuning) {
    const pads = typeof navigator !== "undefined" && typeof navigator.getGamepads === "function"
      ? navigator.getGamepads()
      : [];

    let pad = null;

    if (this.activeGamepadIndex !== null && pads?.[this.activeGamepadIndex]) {
      pad = pads[this.activeGamepadIndex];
    }

    if (!pad) {
      for (const candidate of pads ?? []) {
        if (candidate) {
          pad = candidate;
          this.activeGamepadIndex = candidate.index;
          break;
        }
      }
    }

    if (!pad) {
      this.prevGamepadButtonDown.clear();
      return this.emptyGamepadState();
    }

    const deadZones = tuning.deadZones ?? {};
    const curves = tuning.responseCurves ?? {};
    const leftDeadzone = deadZones.leftStick ?? 0.13;
    const rightDeadzone = deadZones.rightStick ?? 0.11;
    const triggerDeadzone = deadZones.trigger ?? 0.08;
    const leftCurve = curves.leftStick ?? 1.18;
    const rightCurve = curves.rightStick ?? 1.32;
    const triggerCurve = curves.trigger ?? 1.05;

    const leftX = this.applyDeadzoneCurve(pad.axes?.[0] ?? 0, leftDeadzone, leftCurve);
    const leftY = this.applyDeadzoneCurve(pad.axes?.[1] ?? 0, leftDeadzone, leftCurve);
    const rightX = this.applyDeadzoneCurve(pad.axes?.[2] ?? 0, rightDeadzone, rightCurve);
    const rightY = this.applyDeadzoneCurve(pad.axes?.[3] ?? 0, rightDeadzone, rightCurve);
    const triggerRight = this.applyTriggerCurve(pad.buttons?.[7]?.value ?? 0, triggerDeadzone, triggerCurve);
    const triggerLeft = this.applyTriggerCurve(pad.buttons?.[6]?.value ?? 0, triggerDeadzone, triggerCurve);

    const buttonStates = new Map();
    const button = (index) => {
      if (!buttonStates.has(index)) buttonStates.set(index, this.getButtonState(pad.buttons?.[index]));
      return buttonStates.get(index);
    };
    const pressedEdge = (index, down) => Boolean(down && !this.prevGamepadButtonDown.get(index));

    const mapped = this.controlMap.mapGamepad({
      leftX,
      leftY,
      rightX,
      rightY,
      triggerLeft,
      triggerRight,
      button,
      pressedEdge
    });

    const telemetryButtonNames = {
      0: "A", 1: "B", 2: "X", 3: "Y", 4: "LB", 5: "RB",
      8: "View", 9: "Menu", 10: "L3", 11: "R3",
      12: "DPad Up", 13: "DPad Down", 14: "DPad Left", 15: "DPad Right"
    };
    const telemetryIndices = Object.keys(telemetryButtonNames).map(Number);
    const activeButtonLabels = [];
    for (const index of telemetryIndices) {
      const down = button(index).down;
      const wasDown = Boolean(this.prevGamepadButtonDown.get(index));
      if (down) activeButtonLabels.push(telemetryButtonNames[index]);
      if (down !== wasDown) {
        this.recordInputTelemetryEvent(`PAD ${telemetryButtonNames[index]} ${down ? "DOWN" : "UP"}`, "gamepad");
      }
    }

    const absorbTriggerActive = triggerRight > 0.04;
    const stabilizeTriggerActive = triggerLeft > 0.04;
    if (absorbTriggerActive !== this.prevTelemetryTriggerState.absorb) {
      this.recordInputTelemetryEvent(`PAD RT ${absorbTriggerActive ? "DOWN" : "UP"}`, "gamepad");
      this.prevTelemetryTriggerState.absorb = absorbTriggerActive;
    }
    if (stabilizeTriggerActive !== this.prevTelemetryTriggerState.stabilize) {
      this.recordInputTelemetryEvent(`PAD LT ${stabilizeTriggerActive ? "DOWN" : "UP"}`, "gamepad");
      this.prevTelemetryTriggerState.stabilize = stabilizeTriggerActive;
    }

    for (const index of telemetryIndices) {
      this.prevGamepadButtonDown.set(index, button(index).down);
    }

    return {
      connected: true,
      name: pad.id || `gamepad_${pad.index}`,
      mapping: pad.mapping || "unmapped",
      buttonCount: pad.buttons?.length ?? 0,
      activeButtonLabels,
      ...mapped,
      pulseButtonValue: mapped.raw.pulse.value,
      pulseButtonDown: mapped.raw.pulse.down,
      interactButtonValue: mapped.raw.interact.value,
      interactButtonDown: mapped.raw.interact.down,
      guideFocusButtonValue: mapped.raw.guideFocus.value,
      guideFocusButtonDown: mapped.raw.guideFocus.down,
      absorbTriggerValue: triggerRight,
      stabilizeTriggerValue: triggerLeft,
      leftStickMagnitude: Math.hypot(leftX, leftY),
      rightStickMagnitude: Math.hypot(rightX, rightY)
    };
  }

  emptyGamepadState() {
    return {
      connected: false,
      name: "none",
      mapping: "none",
      buttonCount: 0,
      activeButtonLabels: [],
      moveX: 0,
      moveY: 0,
      gameplayVerticalY: 0,
      moveZ: 0,
      cameraLookX: 0,
      cameraLookY: 0,
      boostHeld: false,
      pulsePressed: false,
      pulseSource: "none",
      absorbHeld: false,
      stabilizeHeld: false,
      interactPressed: false,
      coreWorkViewPressed: false,
      guideFocusPressed: false,
      recenterCameraPressed: false,
      cancelPressed: false,
      statusPageTogglePressed: false,
      statusPageSource: "none",
      statusTabPrevPressed: false,
      statusTabNextPressed: false,
      menuUpPressed: false,
      menuDownPressed: false,
      menuLeftPressed: false,
      menuRightPressed: false,
      pulseButtonValue: 0,
      pulseButtonDown: false,
      interactButtonValue: 0,
      interactButtonDown: false,
      guideFocusButtonValue: 0,
      guideFocusButtonDown: false,
      absorbTriggerValue: 0,
      stabilizeTriggerValue: 0,
      leftStickMagnitude: 0,
      rightStickMagnitude: 0
    };
  }

  buildInputTelemetry({
    frameState,
    gamepad,
    rawMoveX,
    rawMoveY,
    rawMoveZ,
    cameraLookX,
    cameraLookY,
    physicalPulseDown,
    pulsePressed,
    pulseReleaseKind,
    pulseReleaseCharge01,
    primaryActionContext,
    expectedAction
  }) {
    const now = this.telemetryNow();
    this.inputTelemetryHistory = this.inputTelemetryHistory
      .filter((entry) => now - entry.atMs <= this.inputTelemetryWindowMs)
      .slice(-this.inputTelemetryMaxEvents);

    const keyboardKeys = [...new Set([...this.keys].map((code) => this.keyboardCodeLabel(code)))].sort();
    const mouseButtons = [...this.mouseButtons].map((button) => `Mouse ${this.mouseButtonLabel(button)}`);
    const padButtons = [...(gamepad.activeButtonLabels ?? [])].map((label) => `Pad ${label}`);
    const analogPhysical = [];
    if ((gamepad.absorbTriggerValue ?? 0) > 0.02) analogPhysical.push(`RT ${Number(gamepad.absorbTriggerValue).toFixed(2)}`);
    if ((gamepad.stabilizeTriggerValue ?? 0) > 0.02) analogPhysical.push(`LT ${Number(gamepad.stabilizeTriggerValue).toFixed(2)}`);
    if ((gamepad.leftStickMagnitude ?? 0) > 0.08) analogPhysical.push(`LS ${Number(gamepad.leftStickMagnitude).toFixed(2)}`);
    if ((gamepad.rightStickMagnitude ?? 0) > 0.08) analogPhysical.push(`RS ${Number(gamepad.rightStickMagnitude).toFixed(2)}`);

    const activeActions = [];
    if (Math.hypot(rawMoveX, rawMoveY, rawMoveZ) > 0.04) {
      activeActions.push(`MOVE ${rawMoveX.toFixed(2)}/${rawMoveY.toFixed(2)}/${rawMoveZ.toFixed(2)}`);
    }
    if (Math.hypot(cameraLookX, cameraLookY) > 0.04) {
      activeActions.push(`LOOK ${cameraLookX.toFixed(2)}/${cameraLookY.toFixed(2)}`);
    }
    if (this.frameInput.boostHeld) activeActions.push("BOOST HELD");
    if (physicalPulseDown && this.frameInput.pulseHeld) {
      activeActions.push(`PULSE ${String(this.frameInput.pulseCommitment ?? "held").toUpperCase()} ${Math.round((this.frameInput.pulseCharge01 ?? 0) * 100)}% ${Number(this.frameInput.pulseHoldSeconds ?? 0).toFixed(2)}s`);
    }
    if (pulsePressed) {
      activeActions.push(`PULSE RELEASE ${String(pulseReleaseKind ?? "quick").toUpperCase()} ${Math.round((pulseReleaseCharge01 ?? 0) * 100)}%`);
    }
    if (this.frameInput.absorbHeld) activeActions.push(`ABSORB HELD${(gamepad.absorbTriggerValue ?? 0) > 0 ? ` ${Number(gamepad.absorbTriggerValue).toFixed(2)}` : ""}`);
    if (this.frameInput.stabilizeHeld) activeActions.push(`STABILIZE HELD${(gamepad.stabilizeTriggerValue ?? 0) > 0 ? ` ${Number(gamepad.stabilizeTriggerValue).toFixed(2)}` : ""}`);
    if (this.frameInput.interactPressed) activeActions.push(`COMMIT → ${this.frameInput.primaryActionRole ?? "commit_reserved"}`);
    if (this.frameInput.coreWorkPressed) activeActions.push("CORE WORK GRAB/PLACE");
    if (this.frameInput.coreWorkViewPressed) activeActions.push("ENTER CORE WORK");
    if (this.frameInput.guideFocusPressed) activeActions.push("CORE/FOCUS TOGGLE");
    if (this.frameInput.recenterCameraPressed) activeActions.push("CAMERA RECENTER");
    if (this.frameInput.statusPageTogglePressed) activeActions.push("STATUS TOGGLE");
    if (this.frameInput.debugTestPlatformSlot) activeActions.push(`TEST PLATFORM SHIFT+${this.frameInput.debugTestPlatformSlot}`);
    if (this.frameInput.debugJumpSlot) activeActions.push(`AREA JUMP ${this.frameInput.debugJumpDirect ? "CTRL+SHIFT" : "CTRL"}+${this.frameInput.debugJumpSlot}`);
    if (this.frameInput.debugCoreWorkSeedPressed) activeActions.push("DEBUG CORE WORK SEED (P)");
    if (this.frameInput.debugCoreEngineCyclePressed) activeActions.push("DEBUG ENGINE 3→6→12 (O)");

    const recentEvents = [...this.inputTelemetryHistory]
      .reverse()
      .map((entry) => ({
        ...entry,
        ageSeconds: Number(Math.max(0, (now - entry.atMs) / 1000).toFixed(2))
      }));

    return {
      pass: "HC-027K1",
      active: true,
      frame: frameState.frame ?? -1,
      context: primaryActionContext ?? "world",
      expectedAction: expectedAction ?? "none",
      activePhysical: [...keyboardKeys, ...mouseButtons, ...padButtons, ...analogPhysical],
      keyboardKeysDown: keyboardKeys,
      mouseButtonsDown: mouseButtons,
      gamepadButtonsDown: gamepad.activeButtonLabels ?? [],
      activeActions,
      recentEvents,
      mostRecentEvent: recentEvents[0]?.text ?? "none",
      telemetryChangesGameplay: false,
      telemetryChangesControls: false,
      telemetryCreatesProgression: false
    };
  }

  recordInputTelemetryEvent(text, source = "unknown") {
    if (!text) return;
    const entry = { text: String(text), source, atMs: this.telemetryNow() };
    const previous = this.inputTelemetryHistory[this.inputTelemetryHistory.length - 1];
    if (previous?.text === entry.text && entry.atMs - previous.atMs < 45) return;
    this.inputTelemetryHistory.push(entry);
    if (this.inputTelemetryHistory.length > this.inputTelemetryMaxEvents * 2) {
      this.inputTelemetryHistory = this.inputTelemetryHistory.slice(-this.inputTelemetryMaxEvents);
    }
  }

  telemetryNow() {
    return typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();
  }

  keyboardEventLabel(event) {
    const code = event?.code ?? "Unknown";
    const ownModifier = /^(Shift|Control|Alt|Meta)(Left|Right)$/.test(code);
    const parts = [];
    if (!ownModifier && event?.ctrlKey) parts.push("Ctrl");
    if (!ownModifier && event?.shiftKey) parts.push("Shift");
    if (!ownModifier && event?.altKey) parts.push("Alt");
    if (!ownModifier && event?.metaKey) parts.push("Meta");
    parts.push(this.keyboardCodeLabel(code));
    return parts.join("+");
  }

  keyboardCodeLabel(code) {
    const fixed = {
      ShiftLeft: "Shift", ShiftRight: "Shift", ControlLeft: "Ctrl", ControlRight: "Ctrl",
      AltLeft: "Alt", AltRight: "Alt", MetaLeft: "Meta", MetaRight: "Meta",
      Space: "Space", Tab: "Tab", Escape: "Esc", BracketLeft: "[", BracketRight: "]",
      ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→",
      PageUp: "PgUp", PageDown: "PgDn"
    };
    if (fixed[code]) return fixed[code];
    if (/^Key[A-Z]$/.test(code)) return code.slice(3);
    if (/^Digit[0-9]$/.test(code)) return code.slice(5);
    if (/^F[0-9]{1,2}$/.test(code)) return code;
    return String(code ?? "Unknown");
  }

  mouseButtonLabel(button) {
    if (button === 0) return "L";
    if (button === 1) return "M";
    if (button === 2) return "R";
    return String(button);
  }

  getExpectedAction(frameState) {
    const inspection = frameState.inspectionCamera ?? frameState.tightInspectionCamera ?? {};
    if (inspection.coreWorkActive) return "core_work_piece_manipulation";
    if (inspection.active) return "interact_or_dpad_down_core_work";

    const cellId = frameState.activeCellId ?? "none";
    const surfaceWakeInteraction = frameState.surfaceWakeLayeredInteraction ?? {};
    const guideThresholdInteraction = frameState.guideThresholdLayeredInteraction ?? {};
    const layeredInteraction = frameState.signalChorusLayeredInteraction ?? {};

    if (cellId === "CELL_MEMBRANE_NURSERY_001" && surfaceWakeInteraction.active && !surfaceWakeInteraction.completed) {
      return surfaceWakeInteraction.expectsHold ? "stabilize" : "pulse";
    }

    if (cellId === "CELL_SCAR_FLOW_FOLD_001" && guideThresholdInteraction.active && !guideThresholdInteraction.completed) {
      if (guideThresholdInteraction.expectsRelease) return "release_stabilize";
      if (guideThresholdInteraction.expectsHold) return "stabilize";
      if (guideThresholdInteraction.expectsPulse) return "pulse";
      return guideThresholdInteraction.movementRequired ? "move_with_current" : "observe";
    }

    if (cellId === "CELL_SIGNAL_CHORUS_NERVE_001" && layeredInteraction.active && !layeredInteraction.completed) {
      return layeredInteraction.expectsHold ? "stabilize" : "pulse";
    }

    if (cellId === "CELL_GRAVE_MEMORY_RESIDUE_BED_001") {
      const preview = frameState.graveMemoryRoute ?? {};
      if (preview.active) {
        if (preview.returnFoldReady) return "interact";
        if (preview.stage === "stabilize_memory_silt") return "stabilize";
        return "pulse";
      }
      const readLoop = frameState.graveReadBeforeAbsorb ?? {};
      if (readLoop.active && !readLoop.safeMemoryTransferComplete) {
        return readLoop.safeAbsorbReady ? "absorb" : "pulse";
      }
    }

    return "interact_or_absorb";
  }


  // Compatibility semantic context for historical validators and debug panels.
  // This does not remap A; physical ownership remains in ControlMap.
  getPulseContext(frameState) {
    const expected = this.getExpectedAction(frameState);
    if (expected === "stabilize") return "resonance_hold";
    if (expected === "absorb") return "absorb";
    if (expected === "pulse") return "pulse_listen";
    if (expected === "release_stabilize") return "release_stabilize";
    if (expected === "move_with_current") return "movement";
    if (expected === "observe") return "observe";
    if (expected === "interact") return "interact";
    return "absorb";
  }

  getButtonState(button) {
    const value = Number.isFinite(button?.value) ? button.value : 0;
    return {
      value,
      down: Boolean(button?.pressed || button?.touched || value >= 0.35)
    };
  }

  applyDeadzoneCurve(value, deadzone = 0.18, curve = 1.0) {
    if (Math.abs(value) <= deadzone) return 0;
    const sign = Math.sign(value);
    const magnitude = (Math.abs(value) - deadzone) / Math.max(1 - deadzone, 0.001);
    return sign * Math.pow(Math.min(magnitude, 1), Math.max(curve, 0.25));
  }

  applyTriggerCurve(value, deadzone = 0.08, curve = 1.0) {
    if (value <= deadzone) return 0;
    const magnitude = (value - deadzone) / Math.max(1 - deadzone, 0.001);
    return Math.pow(Math.min(magnitude, 1), Math.max(curve, 0.25));
  }

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  isDown(code) {
    return this.keys.has(code);
  }
}
