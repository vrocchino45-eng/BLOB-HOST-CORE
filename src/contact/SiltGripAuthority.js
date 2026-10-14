/** LS1D1A: simulation-only grip authority. Does not own input, rendering or Silt cycle. */
export class SiltGripAuthority {
  constructor({ range = 2.2, maxOffset = 1.6 } = {}) {
    this.range = range;
    this.maxOffset = maxOffset;
    this.heldId = null;
    this.position = null;
    this.status = 'idle';
  }
  tryGrip({ unit, unitPosition, corePosition, stabilizeHeld, aPressed, coreWork = false }) {
    if (!aPressed || !stabilizeHeld || coreWork || this.heldId) return false;
    if (!unit || !['veins', 'garden_transit', 'settled'].includes(unit.phase)) return false;
    if (!valid(unitPosition) || !valid(corePosition) || distance(unitPosition, corePosition) > this.range) return false;
    this.heldId = unit.id;
    this.position = [...unitPosition];
    this.status = 'gripping';
    return true;
  }
  update({ corePosition, stabilizeHeld, unitExists = true }) {
    if (!this.heldId) return null;
    if (!stabilizeHeld || !unitExists || !valid(corePosition)) return this.release();
    const delta = this.position.map((x, i) => x - corePosition[i]);
    const length = Math.hypot(...delta);
    if (length > this.maxOffset) this.position = corePosition.map((x, i) => x + delta[i] * this.maxOffset / length);
    return { unitId: this.heldId, position: [...this.position] };
  }
  moveTo(position, corePosition) {
    if (!this.heldId || !valid(position) || !valid(corePosition)) return false;
    if (distance(position, corePosition) > this.maxOffset) return false;
    this.position = [...position];
    return true;
  }
  release() {
    const id = this.heldId;
    this.heldId = null;
    this.position = null;
    this.status = id ? 'released' : 'idle';
    return id ? { releasedUnitId: id } : null;
  }
  snapshot() { return { status: this.status, heldId: this.heldId, position: this.position && [...this.position] }; }
}
function valid(v) { return Array.isArray(v) && v.length === 3 && v.every(Number.isFinite); }
function distance(a,b) { return Math.hypot(...a.map((x,i)=>x-b[i])); }
