export const HOST_CORE_CONTROL_MAP_ID = "HOST_CORE_CANONICAL_CONTROLS_V1";

export const HOST_CORE_CONTROL_BINDINGS = Object.freeze({
  controller: Object.freeze({
    move: "Left Stick (Core Work: move held piece)",
    verticalMove: "RB rise / LB descend (D-Pad Up / Down also accepted in gameplay)",
    look: "Right Stick",
    interact: "A — Commit when a deliberate world commitment is offered; Core Work grab-place",
    pulse: "X",
    absorb: "RT (Core Work: move held piece outward)",
    stabilize: "LT (Core Work: move held piece inward)",
    cancel: "B",
    guideFocus: "Y — Core inspect / authored focus",
    boost: "L3",
    recenter: "R3",
    statusPage: "View / Select (Menu / Start also accepted)",
    statusTabs: "LB / RB",
    menuNavigation: "D-Pad (Core Inspection: Down enters Work; Core Work: Left/Right select piece)",
    coreWorkView: "D-Pad Down while in Core Inspection"
  }),
  keyboard: Object.freeze({
    move: "WASD / Arrow Keys (Core Work: move held piece)",
    verticalMove: "C / Z or Page Up / Page Down",
    look: "Mouse / IJKL compatibility",
    interact: "E — Commit when a deliberate world commitment is offered; Core Work grab-place",
    pulse: "Left Mouse / X / Space",
    absorb: "Right Mouse",
    stabilize: "Q",
    guideFocus: "F — Core inspect / authored focus",
    guideFocusAlias: "V",
    boost: "Shift",
    recenter: "R",
    cancel: "Escape",
    statusPage: "Tab",
    menuNavigation: "Arrow Keys",
    coreWorkView: "G while in Core Inspection"
  })
});

/**
 * Canonical HOST CORE action mapping.
 *
 * InputSystem owns physical device reading. ControlMap owns the stable mapping
 * from physical controls to gameplay actions. Region systems may interpret an
 * action, but may not remap the physical button that produces it.
 */
export class ControlMap {
  constructor() {
    this.id = HOST_CORE_CONTROL_MAP_ID;
    this.version = 1;
  }

  mapKeyboard({ isDown, mouseButtons, queued }) {
    const left = isDown("KeyA") || isDown("ArrowLeft");
    const right = isDown("KeyD") || isDown("ArrowRight");
    const forward = isDown("KeyW") || isDown("ArrowUp");
    const back = isDown("KeyS") || isDown("ArrowDown");
    const ascend = isDown("KeyC") || isDown("PageUp");
    const descend = isDown("KeyZ") || isDown("PageDown");

    const cameraLeft = isDown("KeyJ");
    const cameraRight = isDown("KeyL");
    const cameraUp = isDown("KeyI");
    const cameraDown = isDown("KeyK");

    return {
      moveX: Number(right) - Number(left),
      moveY: Number(ascend) - Number(descend),
      moveZ: Number(back) - Number(forward),
      cameraLookX: Number(cameraRight) - Number(cameraLeft),
      cameraLookY: Number(cameraDown) - Number(cameraUp),
      boostHeld: isDown("ShiftLeft") || isDown("ShiftRight"),
      pulsePressed: Boolean(queued.pulse),
      pulseSource: queued.pulseSource,
      absorbHeld: mouseButtons.has(2),
      stabilizeHeld: isDown("KeyQ"),
      interactPressed: Boolean(queued.interact),
      coreWorkViewPressed: Boolean(queued.coreWorkView),
      guideFocusPressed: Boolean(queued.guideFocus),
      recenterCameraPressed: Boolean(queued.recenter),
      cancelPressed: Boolean(queued.cancel),
      statusPageTogglePressed: Boolean(queued.statusPage),
      statusPageSource: queued.statusPageSource ?? (queued.statusPage ? "keyboard_tab" : "none"),
      statusTabPrevPressed: Boolean(queued.statusTabPrev),
      statusTabNextPressed: Boolean(queued.statusTabNext),
      menuUpPressed: Boolean(queued.menuUp),
      menuDownPressed: Boolean(queued.menuDown),
      menuLeftPressed: Boolean(queued.menuLeft),
      menuRightPressed: Boolean(queued.menuRight),
      active: false
    };
  }

  mapGamepad({
    leftX,
    leftY,
    rightX,
    rightY,
    triggerLeft,
    triggerRight,
    button,
    pressedEdge
  }) {
    const pulse = button(2);
    const interact = button(0);
    const cancel = button(1);
    const guideFocus = button(3);
    const boost = button(10);
    const recenter = button(11);
    const statusPage = button(8);
    const statusPageMenu = button(9);
    const statusTabPrev = button(4);
    const statusTabNext = button(5);
    const dpadUp = button(12);
    const dpadDown = button(13);
    const dpadLeft = button(14);
    const dpadRight = button(15);

    return {
      moveX: leftX,
      moveY: Number(dpadUp.down) - Number(dpadDown.down),
      gameplayVerticalY: Number(statusTabNext.down) - Number(statusTabPrev.down),
      moveZ: leftY,
      cameraLookX: rightX,
      cameraLookY: rightY,
      boostHeld: boost.down,
      pulsePressed: pressedEdge(2, pulse.down),
      pulseSource: pulse.down ? "gamepad_x_button_2" : "none",
      absorbHeld: triggerRight > 0,
      stabilizeHeld: triggerLeft > 0,
      interactPressed: pressedEdge(0, interact.down),
      coreWorkViewPressed: pressedEdge(13, dpadDown.down),
      guideFocusPressed: pressedEdge(3, guideFocus.down),
      recenterCameraPressed: pressedEdge(11, recenter.down),
      cancelPressed: pressedEdge(1, cancel.down),
      statusPageTogglePressed: pressedEdge(8, statusPage.down) || pressedEdge(9, statusPageMenu.down),
      statusPageSource: pressedEdge(8, statusPage.down)
        ? "gamepad_view_select_button_8"
        : pressedEdge(9, statusPageMenu.down)
          ? "gamepad_menu_start_button_9"
          : "none",
      statusTabPrevPressed: pressedEdge(4, statusTabPrev.down),
      statusTabNextPressed: pressedEdge(5, statusTabNext.down),
      menuUpPressed: pressedEdge(12, dpadUp.down),
      menuDownPressed: pressedEdge(13, dpadDown.down),
      menuLeftPressed: pressedEdge(14, dpadLeft.down),
      menuRightPressed: pressedEdge(15, dpadRight.down),
      raw: {
        pulse,
        interact,
        cancel,
        guideFocus,
        boost,
        recenter,
        statusPage,
        statusPageMenu,
        statusTabPrev,
        statusTabNext,
        dpadUp,
        dpadDown,
        dpadLeft,
        dpadRight,
        triggerLeft,
        triggerRight
      }
    };
  }

  describe() {
    return {
      id: this.id,
      version: this.version,
      controller: { ...HOST_CORE_CONTROL_BINDINGS.controller },
      keyboard: { ...HOST_CORE_CONTROL_BINDINGS.keyboard },
      ownershipRule: "ControlMap maps physical input; region systems consume actions without remapping buttons."
    };
  }
}
