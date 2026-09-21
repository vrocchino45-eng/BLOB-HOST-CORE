import { BaseMode } from "./BaseMode.js";

/**
 * HC-010G establishes the bounded runtime mount shared by the two authored
 * Hub routes. The mode exposes no progression behavior of its own; LocalCellBoundaryMorphSystem
 * owns crossings, Act1RouteContractSystem owns the destination boundary, and
 * the mounted region-specific system owns gameplay and presentation.
 */
export class RouteContractMode extends BaseMode {
  constructor({ id, label, runtimeMount = null }) {
    super({
      id,
      label,
      acceptedActions: [
        "move",
        "pulse",
        "stabilize",
        "absorb",
        "interact_scan_cross",
        "guide_focus",
        "status_page"
      ],
      runtimeMount
    });
  }
}
