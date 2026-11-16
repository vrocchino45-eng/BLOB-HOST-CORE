import * as THREE from "three";

const SILT_CELL = "CELL_SILT_PRESSURE_ROUTE_001";
const GEOLOGY_ROOT = "silt_contained_geologic_medium_LS1A2";

// CONNECTION17: only decorative Silt geology may yield to the Core silhouette.
// Five sampled rays use a cached, bounded mesh list. No collision, targeting,
// conserved matter, scene visibility, or camera position is changed.
export class CoreSightlinePresentation {
  constructor({ scene, camera, playerRoot }) {
    this.scene = scene;
    this.camera = camera;
    this.playerRoot = playerRoot;
    this.root = null;
    this.candidates = [];
    this.faded = new Map();
    this.sampleAge = 0;
    this.discoveryAge = 0;
    this.active = false;
    this.raycaster = new THREE.Raycaster();
    this.origin = new THREE.Vector3();
    this.core = new THREE.Vector3();
    this.right = new THREE.Vector3();
    this.up = new THREE.Vector3();
    this.probe = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.quaternion = new THREE.Quaternion();
    this.offsets = [[0, 0], [0.32, 0], [-0.32, 0], [0, 0.32], [0, -0.32]];
    this.lastRayCount = 0;
  }

  update(dt, frameState, protectedRoot = null) {
    // Inspection has its own occlusion owner; Core Work must preserve anatomy.
    const inspectionActive = frameState.inspectionCamera?.active || frameState.tightInspectionCamera?.active
      || frameState.inspectionCamera?.coreWorkActive || frameState.tightInspectionCamera?.coreWorkActive;
    const active = frameState.activeCellId === SILT_CELL && !inspectionActive
      && this.scene && this.camera && this.playerRoot;
    if (!active) {
      this.restoreAll();
      this.active = false;
      this.root = null;
      this.candidates = [];
      this.sampleAge = 0;
      this.discoveryAge = 0;
      return this.publish(frameState, false);
    }
    this.discoveryAge -= Math.max(0, dt);
    if ((!this.active || !this.root) && this.discoveryAge <= 0) {
      this.discoveryAge = 0.5;
      this.root = this.scene.getObjectByName(GEOLOGY_ROOT);
      this.candidates = [];
      // This root contains only authored decorative geology. Never scan the
      // scene for generic meshes or include resources/contact anatomy.
      this.root?.traverse(object => {
        const foregroundSediment = object.name.includes("_stone_inclusion_")
          || object.name.endsWith("_sediment_catchment_bed");
        if (foregroundSediment && object.isMesh && object.material && this.candidates.length < 64) this.candidates.push(object);
      });
      this.sampleAge = 0;
    }
    this.active = true;
    this.sampleAge -= Math.max(0, dt);
    if (this.sampleAge <= 0) {
      this.sampleAge = 0.10;
      this.sample(protectedRoot);
    }
    return this.publish(frameState, true);
  }

  sample(protectedRoot) {
    this.camera.getWorldPosition(this.origin);
    this.camera.getWorldQuaternion(this.quaternion);
    this.playerRoot.getWorldPosition(this.core);
    this.right.set(1, 0, 0).applyQuaternion(this.quaternion);
    this.up.set(0, 1, 0).applyQuaternion(this.quaternion);
    this.root?.updateWorldMatrix(true, true);
    const current = new Set();
    this.lastRayCount = 0;
    const candidates = this.candidates.filter(object => {
      for (let p = object; p; p = p.parent) {
        if (!p.visible || p === protectedRoot || p === this.playerRoot) return false;
      }
      return true;
    });
    for (const [x, y] of this.offsets) {
      this.probe.copy(this.core).addScaledVector(this.right, x).addScaledVector(this.up, y);
      this.direction.copy(this.probe).sub(this.origin);
      const distance = this.direction.length();
      if (distance <= 0.15) continue;
      this.raycaster.set(this.origin, this.direction.normalize());
      this.raycaster.far = distance - 0.12;
      this.lastRayCount += 1;
      for (const hit of this.raycaster.intersectObjects(candidates, false)) current.add(hit.object);
    }
    for (const object of current) this.fade(object);
    for (const object of this.faded.keys()) if (!current.has(object)) this.restore(object);
  }

  fade(object) {
    if (this.faded.has(object)) return;
    const original = object.material;
    const clone = material => {
      const copy = material.clone();
      // Silt's existing distant-fog shader is part of its material identity.
      copy.onBeforeCompile = material.onBeforeCompile;
      copy.customProgramCacheKey = material.customProgramCacheKey;
      copy.transparent = true;
      copy.depthWrite = false;
      copy.opacity = Math.min(material.opacity, 0.18);
      return copy;
    };
    const replacement = Array.isArray(original) ? original.map(clone) : clone(original);
    this.faded.set(object, { original, replacement });
    object.material = replacement;
  }

  restore(object) {
    const entry = this.faded.get(object);
    if (!entry) return;
    // Restore the exact shared material reference; do not overwrite a later owner.
    if (object.material === entry.replacement) object.material = entry.original;
    for (const material of Array.isArray(entry.replacement) ? entry.replacement : [entry.replacement]) material.dispose();
    this.faded.delete(object);
  }

  restoreAll() { for (const object of this.faded.keys()) this.restore(object); }

  publish(frameState, active) {
    frameState.coreSightlinePresentation = {
      pass: "CONNECTION17", active, owner: "CoreSightlinePresentation",
      candidateCount: active ? this.candidates.length : 0,
      attenuatedCount: this.faded.size,
      sampleIntervalSeconds: 0.10,
      rayCount: active ? this.lastRayCount : 0,
      scope: "decorative_silt_geology_only",
      gameplayAuthority: false
    };
  }
}
