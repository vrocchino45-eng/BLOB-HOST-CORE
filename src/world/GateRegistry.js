import { AuthoredRegistry } from "./AuthoredRegistry.js";

export class GateRegistry extends AuthoredRegistry {
  constructor(entries) {
    super({ id: "GateRegistry", entries });
  }

  getFromRegion(regionId) {
    return [...this.entries.values()].filter((gate) => gate.from === regionId);
  }
}
