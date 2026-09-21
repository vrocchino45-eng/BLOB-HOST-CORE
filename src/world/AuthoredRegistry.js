export class AuthoredRegistry {
  constructor({ id, entries = [] }) {
    if (!id) throw new Error("[AuthoredRegistry] id is required.");
    if (!Array.isArray(entries)) throw new Error(`[${id}] entries must be an array.`);

    this.id = id;
    this.entries = new Map();

    for (const entry of entries) {
      if (!entry?.id) throw new Error(`[${id}] entry missing id.`);
      if (this.entries.has(entry.id)) throw new Error(`[${id}] duplicate id: ${entry.id}`);
      this.entries.set(entry.id, Object.freeze({ ...entry }));
    }
  }

  get(id) {
    const entry = this.entries.get(id);
    if (!entry) throw new Error(`[${this.id}] unknown authored id: ${id}`);
    return entry;
  }

  find(id) {
    return this.entries.get(id) ?? null;
  }

  has(id) {
    return this.entries.has(id);
  }

  list() {
    return [...this.entries.values()];
  }

  get size() {
    return this.entries.size;
  }
}
