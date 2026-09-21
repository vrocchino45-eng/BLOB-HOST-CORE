import { BaseMode } from "./BaseMode.js";

export class MemoryRouteMode extends BaseMode {
  constructor(runtimeMount = null) {
    super({
      id: "memory_route_mode",
      label: "Memory Route Mode",
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
