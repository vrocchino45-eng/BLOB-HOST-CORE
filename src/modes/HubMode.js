import { BaseMode } from "./BaseMode.js";

export class HubMode extends BaseMode {
  constructor(runtimeMount = null) {
    super({
      id: "hub_mode",
      label: "Hub Mode",
      acceptedActions: ["move", "pulse", "interact_scan_cross", "guide_focus", "status_page"],
      runtimeMount
    });
  }
}
