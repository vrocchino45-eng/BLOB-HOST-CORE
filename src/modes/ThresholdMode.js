import { BaseMode } from "./BaseMode.js";

export class ThresholdMode extends BaseMode {
  constructor(runtimeMount = null) {
    super({
      id: "threshold_mode",
      label: "Threshold Mode",
      acceptedActions: ["move", "pulse", "stabilize", "interact_scan_cross", "guide_focus"],
      runtimeMount
    });
  }
}
