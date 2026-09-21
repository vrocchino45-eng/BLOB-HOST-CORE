import { AuthoredRegistry } from "./AuthoredRegistry.js";

export class RegionRegistry extends AuthoredRegistry {
  constructor(entries) {
    super({ id: "RegionRegistry", entries });
    this.byRuntimeCell = new Map();

    for (const region of [...this.entries.values()]) {
      for (const cellId of region.runtimeCellIds ?? []) {
        if (this.byRuntimeCell.has(cellId)) {
          throw new Error(`[RegionRegistry] runtime cell mapped twice: ${cellId}`);
        }
        this.byRuntimeCell.set(cellId, region);
      }
    }
  }

  getByRuntimeCellId(cellId) {
    return this.byRuntimeCell.get(cellId) ?? null;
  }
}
