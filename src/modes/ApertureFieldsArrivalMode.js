import { BaseMode } from "./BaseMode.js";

export class ApertureFieldsArrivalMode extends BaseMode {
  constructor(runtimeMount = null) {
    super({
      id: "aperture_fields_arrival_mode",
      label: "Aperture Fields Arrival Mode",
      acceptedActions: ["move", "pulse", "absorb", "stabilize", "interact_return_fold", "guide_focus", "status_page"],
      runtimeMount
    });
  }
}
