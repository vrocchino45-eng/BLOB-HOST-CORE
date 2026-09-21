import { AuthoredRegistry } from "./AuthoredRegistry.js";

export class VisualLanguageRegistry extends AuthoredRegistry {
  constructor(entries) {
    super({ id: "VisualLanguageRegistry", entries });
  }

  getByRegionId(regionId) {
    return [...this.entries.values()].find((language) => language.regionId === regionId) ?? null;
  }
}
