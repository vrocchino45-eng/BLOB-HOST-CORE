import { Raycaster, Vector3 } from "three";

const NEAR_DISTANCE = 3.8;
const MIN_CLEAR_DISTANCE = 2.65;
const WALL_CLEARANCE = 0.24;

export class NearWorldFraming {
  constructor() {
    this.nearRequested = false;
    this.toggleSequence = 0;
    this.blend = 0;
    this.camera = null;
    this.forward = new Vector3();
    this.toCore = new Vector3();
    this.ray = new Raycaster();
    this.hits = [];
    this.obstructed = false;
  }

  update(dt, sequence, allowed, worldCamera, corePosition, surfaces) {
    if (Number.isSafeInteger(sequence) && sequence > this.toggleSequence) {
      if ((sequence - this.toggleSequence) % 2 === 1) this.nearRequested = !this.nearRequested;
      this.toggleSequence = sequence;
    }

    this.obstructed = false;
    if (!allowed || (!this.nearRequested && this.blend < 0.001)) {
      this.blend = 0;
      return worldCamera;
    }

    this.blend += (Number(this.nearRequested) - this.blend) * (1 - Math.exp(-dt * 11));
    worldCamera.getWorldDirection(this.forward);
    const farDepth = this.toCore.subVectors(corePosition, worldCamera.position).dot(this.forward);
    if (farDepth <= NEAR_DISTANCE) return worldCamera;

    const depth = farDepth + (NEAR_DISTANCE - farDepth) * this.blend;
    this.ray.ray.origin.copy(worldCamera.position).addScaledVector(this.forward, farDepth);
    this.ray.ray.direction.copy(this.forward).negate();
    this.ray.near = 0.05;
    this.ray.far = depth + WALL_CLEARANCE;
    this.hits.length = 0;
    for (const { object } of surfaces) {
      let ancestor = object;
      while (ancestor?.visible) ancestor = ancestor.parent;
      if (ancestor) continue;
      object.updateWorldMatrix(true, false);
      this.ray.intersectObject(object, false, this.hits);
    }
    const blocker = this.hits[0];
    const clearDepth = blocker ? blocker.distance - WALL_CLEARANCE : depth;
    this.obstructed = clearDepth < depth;
    if (clearDepth < MIN_CLEAR_DISTANCE) return worldCamera;

    // Render on the same sightline. The world camera still owns all gameplay rays.
    this.camera ??= worldCamera.clone(false);
    this.camera.copy(worldCamera, false);
    this.camera.position.addScaledVector(this.forward, farDepth - Math.min(depth, clearDepth));
    this.camera.updateMatrixWorld();
    return this.camera;
  }
}
