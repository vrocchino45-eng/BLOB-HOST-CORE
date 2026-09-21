export class DebugDisplaySystem {
  constructor({ frameState }) {
    this.frameState = frameState;
    // HC027K1 HOTFIX2 — playtest recording hierarchy:
    // F1 = readable input/action trace, F2 = deep system diagnostics, F3 = clean play.
    this.modeOrder = ["hidden", "trace", "full"];
    this.prevSelectHeld = false;
    this.boundKeyDown = (event) => this.onKeyDown(event);
  }

  init() {
    this.frameState.debugDisplay = {
      mode: "hidden",
      hint: "F1 playtest trace / F2 system debug / F3 clean / Back cycles",
      changedBy: "default_playtest",
      changedAt: 0,
      pass: "HC-028C1"
    };

    window.addEventListener("keydown", this.boundKeyDown);
  }

  update(_dt, frameState) {
    this.readGamepadDebugToggle(frameState);
  }

  onKeyDown(event) {
    if (event.code === "F1") {
      this.setMode("trace", "F1");
      event.preventDefault();
    } else if (event.code === "F2") {
      this.setMode("full", "F2");
      event.preventDefault();
    } else if (event.code === "F3") {
      this.setMode("hidden", "F3");
      event.preventDefault();
    }
  }

  readGamepadDebugToggle(frameState) {
    const pads = typeof navigator.getGamepads === "function"
      ? navigator.getGamepads()
      : [];

    let selectHeld = false;

    for (const pad of pads ?? []) {
      if (!pad) continue;
      selectHeld = selectHeld || Boolean(pad.buttons?.[8]?.pressed);
    }

    if (selectHeld && !this.prevSelectHeld) {
      this.cycleMode("controller_back_select");
    }

    this.prevSelectHeld = selectHeld;
    frameState.debugDisplay = this.frameState.debugDisplay;
  }

  cycleMode(changedBy) {
    const current = this.frameState.debugDisplay?.mode ?? "hidden";
    const index = Math.max(0, this.modeOrder.indexOf(current));
    const next = this.modeOrder[(index + 1) % this.modeOrder.length];
    this.setMode(next, changedBy);
  }

  setMode(mode, changedBy) {
    const safeMode = this.modeOrder.includes(mode) ? mode : "hidden";
    this.frameState.debugDisplay = {
      mode: safeMode,
      hint: "F1 playtest trace / F2 system debug / F3 clean / Back cycles",
      changedBy,
      changedAt: this.frameState.runtimeSeconds ?? 0,
      pass: "HC-028C1"
    };
  }
}
