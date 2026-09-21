import { BaseMode } from "./BaseMode.js";

/**
 * HC-011A1 retains the mounted Vascular destination's HC-011A playable mode while
 * leaving LocalCellBoundaryMorphSystem, ObjectiveSystem, and PlayerMovementController in their
 * established ownership roles.
 */
export class VascularRhythmMode extends BaseMode {
  constructor(runtimeMount = null) {
    super({
      id: "vascular_rhythm_mode",
      label: "Vascular Rhythm Mode",
      acceptedActions: [
        "move",
        "pulse",
        "stabilize",
        "interact_scan_cross",
        "guide_focus",
        "status_page"
      ],
      runtimeMount
    });
  }
}
