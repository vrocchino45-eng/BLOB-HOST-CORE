/** LS1D1D0: material identity independent of mesh, region and physics representation. */
export class MaterialIdentityLedger {
  constructor({ originRegion, originSignature }) {
    this.originRegion = originRegion;
    this.originSignature = originSignature;
    this.records = new Map();
  }
  register({ id, mass, composition = { silt: 1 } }) {
    if (typeof id !== 'string' || !id || this.records.has(id)) throw new Error('duplicate/invalid material identity');
    if (!Number.isFinite(mass) || mass <= 0) throw new Error('invalid material mass');
    const record = { id, originRegion: this.originRegion, originSignature: this.originSignature,
      mass, composition: Object.freeze({ ...composition }), owner: 'environment',
      representation: 'individual', historySequence: 0 };
    this.records.set(id, record);
    return record;
  }
  get(id) { return this.records.get(id) ?? null; }
  transfer(id, owner, representation) {
    const record = this.get(id);
    if (!record) return false;
    if (!['environment', 'grip', 'orbit', 'core'].includes(owner)) throw new Error('invalid material owner');
    if (!['individual', 'aggregate', 'dormant'].includes(representation)) throw new Error('invalid material representation');
    if (record.owner !== owner || record.representation !== representation) {
      record.owner = owner;
      record.representation = representation;
      record.historySequence++;
    }
    return true;
  }
  totalMass() { let total = 0; for (const record of this.records.values()) total += record.mass; return total; }
  snapshot() { return { originRegion: this.originRegion, count: this.records.size,
    totalMass: this.totalMass(), records: [...this.records.values()].map(record => ({ ...record })) }; }
}
