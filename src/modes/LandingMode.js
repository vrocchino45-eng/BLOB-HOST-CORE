import { BaseMode } from "./BaseMode.js";

export class LandingMode extends BaseMode {
  constructor(runtimeMount = null) {
    super({
      id: "landing_mode",
      label: "Landing Mode",
      acceptedActions: ["move", "pulse", "absorb", "stabilize", "interact_scan_cross", "guide_focus"],
      runtimeMount
    });
  }
}
