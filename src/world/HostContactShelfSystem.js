import * as THREE from "three";
import { applyCrawlableSurfaceMetadata } from "./CrawlableSurfaceRegistry.js";

const CELL_ID = "CELL_MEMBRANE_NURSERY_001";

/**
 * HC031F1B — Host Contact Shelf
 *
 * A small continuation inside Surface Wake that gives the tendril system an
 * explicitly authored ecological surface vocabulary. It owns presentation and
 * surface metadata only: no player translation, objectives, gates, targeting,
 * verb strength, or progression.
 */
export class HostContactShelfSystem {
  constructor({ scene, playerRoot, frameState }) {
    if (!scene) throw new Error("[HostContactShelfSystem] scene is required.");
    if (!playerRoot) throw new Error("[HostContactShelfSystem] playerRoot is required.");
    if (!frameState) throw new Error("[HostContactShelfSystem] frameState is required.");
    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.root = new THREE.Group();
    this.root.name = "host_contact_shelf_HC031F1B";
    this.root.userData.systemOwner = "HostContactShelfSystem";
    this.root.position.set(4.0, -1.15, -0.75);
    this.surfaces = [];
    this.time = 0;
    this.playerWorld = new THREE.Vector3();
    this.closestWorld = new THREE.Vector3();
    this.tempWorld = new THREE.Vector3();
  }

  init() {
    this.createShelf();
    this.scene.add(this.root);
    this.publish(false);
  }

  createShelf() {
    const membrane = new THREE.Mesh(
      new THREE.SphereGeometry(1, 28, 16),
      new THREE.MeshStandardMaterial({
        color: 0x347b78,
        emissive: 0x153f42,
        emissiveIntensity: 0.18,
        roughness: 0.80,
        metalness: 0.0,
        transparent: true,
        opacity: 0.76
      })
    );
    membrane.name = "contact_shelf_membrane_bed";
    membrane.position.set(0, 0, 0);
    membrane.scale.set(2.35, 0.30, 1.25);
    applyCrawlableSurfaceMetadata(membrane, {
      surfaceId: "HOST_CONTACT_SHELF_MEMBRANE",
      profileId: "membrane_stable",
      cellId: CELL_ID,
      contactPriority: 0.06
    });
    this.addSurface(membrane);

    const slope = new THREE.Mesh(
      new THREE.SphereGeometry(0.86, 24, 14),
      new THREE.MeshStandardMaterial({
        color: 0x4f8f86,
        emissive: 0x20483f,
        emissiveIntensity: 0.15,
        roughness: 0.88,
        transparent: true,
        opacity: 0.72
      })
    );
    slope.name = "contact_shelf_soft_tissue_slope";
    slope.position.set(-1.72, 0.62, 0.16);
    slope.rotation.z = -0.48;
    slope.scale.set(1.25, 0.34, 0.86);
    applyCrawlableSurfaceMetadata(slope, {
      surfaceId: "HOST_CONTACT_SHELF_SOFT_SLOPE",
      profileId: "soft_tissue",
      cellId: CELL_ID,
      contactPriority: 0.08
    });
    this.addSurface(slope);

    const scarMaterial = new THREE.MeshStandardMaterial({
      color: 0x7c403f,
      emissive: 0x3a1717,
      emissiveIntensity: 0.16,
      roughness: 0.94,
      transparent: true,
      opacity: 0.88
    });
    const scar = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 1.72, 8, 18), scarMaterial);
    scar.name = "contact_shelf_scar_brace_rib";
    scar.position.set(1.18, 0.72, -0.12);
    scar.rotation.z = Math.PI * 0.40;
    scar.rotation.x = Math.PI * 0.08;
    scar.scale.set(1.0, 1.0, 1.22);
    applyCrawlableSurfaceMetadata(scar, {
      surfaceId: "HOST_CONTACT_SHELF_SCAR_BRACE",
      profileId: "scar_brace",
      cellId: CELL_ID,
      contactPriority: 0.16
    });
    this.addSurface(scar);

    const residue = new THREE.Mesh(
      new THREE.SphereGeometry(0.66, 20, 12),
      new THREE.MeshStandardMaterial({
        color: 0x8b785c,
        emissive: 0x3f3325,
        emissiveIntensity: 0.12,
        roughness: 1.0,
        transparent: true,
        opacity: 0.62
      })
    );
    residue.name = "contact_shelf_residue_patch";
    residue.position.set(1.52, 0.36, 0.72);
    residue.scale.set(1.0, 0.20, 0.72);
    applyCrawlableSurfaceMetadata(residue, {
      surfaceId: "HOST_CONTACT_SHELF_RESIDUE_PATCH",
      profileId: "residue_weak",
      cellId: CELL_ID,
      contactPriority: 0.10
    });
    this.addSurface(residue);

    // A faint non-crawlable connective lip makes the shelf read as part of the
    // Host while proving that nearby visible geometry no longer becomes a target
    // merely because it is large and transparent.
    const connective = new THREE.Mesh(
      new THREE.TorusGeometry(1.9, 0.10, 8, 56, Math.PI * 1.18),
      new THREE.MeshStandardMaterial({
        color: 0x41656d,
        emissive: 0x173036,
        emissiveIntensity: 0.08,
        roughness: 0.92,
        transparent: true,
        opacity: 0.22,
        depthWrite: false
      })
    );
    connective.name = "contact_shelf_non_crawlable_connective_lip";
    connective.rotation.x = Math.PI * 0.52;
    connective.position.set(0.1, 0.42, -0.58);
    connective.userData.surfaceContactDisabled = true;
    connective.userData.targetingSuppressed = true;
    this.root.add(connective);
  }

  addSurface(mesh) {
    this.root.add(mesh);
    this.surfaces.push(mesh);
  }

  update(dt, frameState = this.frameState) {
    const safeDt = Math.max(0, Math.min(dt, 0.05));
    this.time += safeDt;
    const active = frameState.activeCellId === CELL_ID;
    this.root.visible = active;
    if (!active) {
      this.publish(false);
      return;
    }

    // Very small Host motion: enough to read living anatomy, never enough to
    // invalidate the local planar-contact proof or act as moving-platform logic.
    const breathe = Math.sin(this.time * 0.72);
    const membrane = this.surfaces[0];
    const slope = this.surfaces[1];
    const scar = this.surfaces[2];
    const residue = this.surfaces[3];
    membrane.scale.y = 0.30 * (1 + breathe * 0.035);
    slope.rotation.z = -0.48 + breathe * 0.018;
    scar.rotation.x = Math.PI * 0.08 + Math.sin(this.time * 0.58 + 1.3) * 0.018;
    residue.scale.y = 0.20 * (1 + Math.sin(this.time * 0.9 + 2.1) * 0.06);
    this.root.updateMatrixWorld(true);

    this.playerRoot.getWorldPosition(this.playerWorld);
    let nearest = null;
    let nearestDistance = Infinity;
    for (const surface of this.surfaces) {
      surface.getWorldPosition(this.tempWorld);
      const distance = this.tempWorld.distanceTo(this.playerWorld);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = surface;
        this.closestWorld.copy(this.tempWorld);
      }
    }
    this.publish(true, nearest, nearestDistance);
  }

  publish(active, nearest = null, nearestDistance = Infinity) {
    this.frameState.hostContactShelf = {
      pass: "HC-031F1B",
      active,
      cellId: CELL_ID,
      identity: "Host Contact Shelf",
      role: "surface_ecology_continuation",
      surfaceAuthority: "authored_crawlable_surface_metadata",
      surfaceCount: this.surfaces.length,
      surfaceIds: this.surfaces.map((surface) => surface.userData.crawlableSurfaceId),
      profiles: this.surfaces.map((surface) => surface.userData.crawlableSurfaceProfileId),
      nearestSurfaceId: nearest?.userData?.crawlableSurfaceId ?? "none",
      nearestSurfaceProfileId: nearest?.userData?.crawlableSurfaceProfileId ?? "none",
      nearestSurfaceCenterDistance: Number.isFinite(nearestDistance) ? Number(nearestDistance.toFixed(3)) : null,
      progressionAuthority: false,
      objectiveAuthority: false,
      movementAuthority: false,
      verbAuthority: false,
      noHardGate: true,
      nextEcologyProof: "stabilized_projection_reads_surface_load_without_anchor_gate"
    };
  }
}
