import { BaseMode } from "./BaseMode.js";

/**
 * HC-013A mounts the authored Comb Threshold foundation after the three-route
 * Hub convergence. This mode introduces no new verb or progression behavior;
 * it only binds the dedicated threshold camera, anatomy owner, and existing
 * movement / Pulse / Stabilize / return inputs.
 */
export class CombThresholdMode extends BaseMode {
  constructor(runtimeMount = null) {
    super({
      id: "comb_threshold_mode",
      label: "Comb Threshold Mode",
      acceptedActions: [
        "move",
        "pulse",
        "stabilize",
        "interact_return_fold",
        "guide_focus",
        "status_page"
      ],
      runtimeMount
    });
  }
}
