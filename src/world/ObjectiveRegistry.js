import { AuthoredRegistry } from "./AuthoredRegistry.js";

export class ObjectiveRegistry extends AuthoredRegistry {
  constructor(entries) {
    super({ id: "ObjectiveRegistry", entries });
  }

  getByRegionId(regionId) {
    return [...this.entries.values()].find((objective) => objective.regionId === regionId) ?? null;
  }
}
