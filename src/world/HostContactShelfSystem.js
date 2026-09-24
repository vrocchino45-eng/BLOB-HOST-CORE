import * as THREE from "three";
import { applyCrawlableSurfaceMetadata } from "./CrawlableSurfaceRegistry.js";

const CELL_ID = "CELL_MEMBRANE_NURSERY_001";

/**
 * HC031I3 — Residue Attempt / Confirmation Lock.
 *
 * Extends the HC031F1B contact shelf into a small continuous ecology proof.
 * The same authored surface profiles remain the mechanical truth; this system
 * only authors additional reachable anatomy and labels its ecological role.
 * No objectives, hard gates, player translation, targeting, verb strength, or
 * progression are introduced here.
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
    this.root.name = "host_contact_shelf_HC031I3";
    this.root.userData.systemOwner = "HostContactShelfSystem";
    this.root.userData.ecologyContinuation = "HC031I3";
    this.root.position.set(4.0, -1.15, -0.75);
    this.surfaces = [];
    this.time = 0;
    this.playerWorld = new THREE.Vector3();
    this.closestWorld = new THREE.Vector3();
    this.tempWorld = new THREE.Vector3();
  }

  init() {
    this.createShelf();
    this.createEcologyContinuation();
    this.scene.add(this.root);
    this.publish(false);
  }

  makeMembraneMaterial({ opacity = 0.76, emissiveIntensity = 0.18, color = 0x347b78 } = {}) {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: 0x153f42,
      emissiveIntensity,
      roughness: 0.80,
      metalness: 0.0,
      transparent: true,
      opacity
    });
  }

  makeResidueMaterial({ opacity = 0.62, color = 0x8b785c } = {}) {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: 0x3f3325,
      emissiveIntensity: 0.12,
      roughness: 1.0,
      transparent: true,
      opacity
    });
  }

  createShelf() {
    const membrane = new THREE.Mesh(
      new THREE.SphereGeometry(1, 28, 16),
      this.makeMembraneMaterial()
    );
    membrane.name = "contact_shelf_membrane_bed";
    membrane.position.set(0, 0, 0);
    membrane.scale.set(2.35, 0.30, 1.25);
    this.authorSurface(membrane, {
      surfaceId: "HOST_CONTACT_SHELF_MEMBRANE",
      profileId: "membrane_stable",
      contactPriority: 0.06,
      ecologyRole: "living_membrane_path",
      ecologySegment: "entry_membrane"
    });

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
    this.authorSurface(slope, {
      surfaceId: "HOST_CONTACT_SHELF_SOFT_SLOPE",
      profileId: "soft_tissue",
      contactPriority: 0.08,
      ecologyRole: "living_membrane_path",
      ecologySegment: "entry_soft_slope"
    });

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
    this.authorSurface(scar, {
      surfaceId: "HOST_CONTACT_SHELF_SCAR_BRACE",
      profileId: "scar_brace",
      contactPriority: 0.16,
      ecologyRole: "scar_load_buttress",
      ecologySegment: "entry_scar_rib"
    });

    const residue = new THREE.Mesh(
      new THREE.SphereGeometry(0.66, 20, 12),
      this.makeResidueMaterial()
    );
    residue.name = "contact_shelf_residue_patch";
    residue.position.set(1.52, 0.36, 0.72);
    residue.scale.set(1.0, 0.20, 0.72);
    this.authorSurface(residue, {
      surfaceId: "HOST_CONTACT_SHELF_RESIDUE_PATCH",
      profileId: "residue_weak",
      contactPriority: 0.10,
      ecologyRole: "residue_yield_field",
      ecologySegment: "entry_residue_patch"
    });

    // A faint non-crawlable connective lip keeps the contact shelf visually part
    // of the Host without becoming hidden contact geometry.
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

  createEcologyContinuation() {
    // 1) Living membrane causeway — broad enough to crawl naturally rather than
    // behaving like a narrow traversal beam. It turns away from the original
    // test shelf instead of simply making the shelf longer.
    const membraneA = new THREE.Mesh(
      new THREE.SphereGeometry(0.92, 26, 15),
      this.makeMembraneMaterial({ opacity: 0.72, emissiveIntensity: 0.14, color: 0x3d8580 })
    );
    membraneA.name = "host_contact_membrane_causeway_01";
    membraneA.position.set(-0.20, 0.12, -1.36);
    membraneA.rotation.y = -0.20;
    membraneA.scale.set(1.62, 0.25, 0.78);
    this.authorSurface(membraneA, {
      surfaceId: "HOST_CONTACT_CONTINUATION_MEMBRANE_01",
      profileId: "membrane_stable",
      contactPriority: 0.09,
      ecologyRole: "living_membrane_path",
      ecologySegment: "membrane_causeway"
    });

    const membraneB = new THREE.Mesh(
      new THREE.SphereGeometry(0.88, 26, 15),
      this.makeMembraneMaterial({ opacity: 0.70, emissiveIntensity: 0.13, color: 0x428d85 })
    );
    membraneB.name = "host_contact_membrane_causeway_02";
    membraneB.position.set(0.04, 0.25, -2.18);
    membraneB.rotation.y = 0.28;
    membraneB.scale.set(1.42, 0.23, 0.72);
    this.authorSurface(membraneB, {
      surfaceId: "HOST_CONTACT_CONTINUATION_MEMBRANE_02",
      profileId: "membrane_stable",
      contactPriority: 0.10,
      ecologyRole: "living_membrane_path",
      ecologySegment: "membrane_causeway"
    });

    // 2) Scar buttress — a dense brace anatomy that intersects the living path.
    // The player can pass around it, crawl it, or use it for stronger focused
    // projection. It is leverage, not a keyhole or permission gate.
    const scarMaterial = new THREE.MeshStandardMaterial({
      color: 0x824745,
      emissive: 0x3a1717,
      emissiveIntensity: 0.13,
      roughness: 0.95,
      transparent: true,
      opacity: 0.9
    });
    const scarButtress = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.95, 8, 18), scarMaterial);
    scarButtress.name = "host_contact_scar_buttress_01";
    scarButtress.position.set(0.94, 0.76, -2.54);
    scarButtress.rotation.z = Math.PI * 0.34;
    scarButtress.rotation.x = -Math.PI * 0.16;
    scarButtress.scale.set(1.0, 1.0, 1.28);
    this.authorSurface(scarButtress, {
      surfaceId: "HOST_CONTACT_CONTINUATION_SCAR_BRACE_01",
      profileId: "scar_brace",
      contactPriority: 0.18,
      ecologyRole: "scar_load_buttress",
      ecologySegment: "scar_buttress"
    });

    const scarFoot = new THREE.Mesh(
      new THREE.SphereGeometry(0.68, 22, 13),
      new THREE.MeshStandardMaterial({
        color: 0x75413f,
        emissive: 0x351616,
        emissiveIntensity: 0.11,
        roughness: 0.96,
        transparent: true,
        opacity: 0.86
      })
    );
    scarFoot.name = "host_contact_scar_buttress_foot";
    scarFoot.position.set(1.18, 0.12, -2.44);
    scarFoot.scale.set(1.05, 0.24, 0.72);
    this.authorSurface(scarFoot, {
      surfaceId: "HOST_CONTACT_CONTINUATION_SCAR_BRACE_02",
      profileId: "scar_brace",
      contactPriority: 0.17,
      ecologyRole: "scar_load_buttress",
      ecologySegment: "scar_buttress"
    });

    // 3) Residue wash — broad, weak material after the brace. It remains fully
    // traversable but should visibly yield and poorly carry sustained recoil.
    const residueA = new THREE.Mesh(
      new THREE.SphereGeometry(0.82, 22, 13),
      this.makeResidueMaterial({ opacity: 0.58, color: 0x907b5d })
    );
    residueA.name = "host_contact_residue_wash_01";
    residueA.position.set(1.58, 0.18, -2.92);
    residueA.rotation.y = -0.24;
    residueA.scale.set(1.48, 0.30, 0.88);
    this.authorSurface(residueA, {
      surfaceId: "HOST_CONTACT_CONTINUATION_RESIDUE_01",
      profileId: "residue_weak",
      contactPriority: 0.11,
      ecologyRole: "residue_yield_field",
      ecologySegment: "residue_wash"
    });

    const residueB = new THREE.Mesh(
      new THREE.SphereGeometry(0.70, 20, 12),
      this.makeResidueMaterial({ opacity: 0.54, color: 0x9a8260 })
    );
    residueB.name = "host_contact_residue_wash_02";
    residueB.position.set(2.12, 0.14, -3.56);
    residueB.rotation.y = 0.38;
    residueB.scale.set(1.34, 0.28, 0.80);
    this.authorSurface(residueB, {
      surfaceId: "HOST_CONTACT_CONTINUATION_RESIDUE_02",
      profileId: "residue_weak",
      contactPriority: 0.10,
      ecologyRole: "residue_yield_field",
      ecologySegment: "residue_wash"
    });

    // Non-crawlable connective tissue visually joins the three material regimes
    // without creating a hidden traversal rail.
    const tissue = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.78, 0.045, 72, 8, 2, 3),
      new THREE.MeshStandardMaterial({
        color: 0x31565b,
        emissive: 0x132d31,
        emissiveIntensity: 0.08,
        roughness: 0.9,
        transparent: true,
        opacity: 0.16,
        depthWrite: false
      })
    );
    tissue.name = "host_contact_ecology_connective_tissue";
    tissue.position.set(1.02, 0.52, -2.74);
    tissue.rotation.x = Math.PI * 0.48;
    tissue.scale.set(1.65, 0.64, 1.35);
    tissue.userData.surfaceContactDisabled = true;
    tissue.userData.targetingSuppressed = true;
    tissue.userData.ecologyRole = "connective_tissue_only";
    this.root.add(tissue);
  }

  authorSurface(mesh, {
    surfaceId,
    profileId,
    contactPriority,
    ecologyRole,
    ecologySegment
  }) {
    applyCrawlableSurfaceMetadata(mesh, {
      surfaceId,
      profileId,
      cellId: CELL_ID,
      contactPriority
    });
    mesh.userData.hostContactEcologyRole = ecologyRole;
    mesh.userData.hostContactEcologySegment = ecologySegment;
    mesh.userData.hostContactEcologyPass = "HC031I3";
    mesh.userData.targetingSuppressed = true;
    this.addSurface(mesh);
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

    // Only the original entry shelf breathes mechanically. Continuation response
    // is presentation-only in HostContactEcologyContinuationSystem so planted
    // world anchors never chase moving traversal geometry.
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
    const roleCounts = this.surfaces.reduce((counts, surface) => {
      const role = surface.userData.hostContactEcologyRole ?? "unassigned";
      counts[role] = (counts[role] ?? 0) + 1;
      return counts;
    }, {});

    this.frameState.hostContactShelf = {
      pass: "HC-031I3",
      parentSurfacePass: "HC-031F1B",
      active,
      cellId: CELL_ID,
      identity: "Host Contact Shelf / Ecology Continuation",
      role: "surface_ecology_continuation",
      surfaceAuthority: "authored_crawlable_surface_metadata",
      surfaceCount: this.surfaces.length,
      surfaceIds: this.surfaces.map((surface) => surface.userData.crawlableSurfaceId),
      profiles: this.surfaces.map((surface) => surface.userData.crawlableSurfaceProfileId),
      ecologicalRoles: roleCounts,
      nearestSurfaceId: nearest?.userData?.crawlableSurfaceId ?? "none",
      nearestSurfaceProfileId: nearest?.userData?.crawlableSurfaceProfileId ?? "none",
      nearestEcologyRole: nearest?.userData?.hostContactEcologyRole ?? "none",
      nearestEcologySegment: nearest?.userData?.hostContactEcologySegment ?? "none",
      nearestSurfaceCenterDistance: Number.isFinite(nearestDistance) ? Number(nearestDistance.toFixed(3)) : null,
      continuationSequence: ["living_membrane_path", "scar_load_buttress", "residue_yield_field"],
      residueRouteAxis: "positive_x_negative_z_after_scar",
      residueAccessibilityPass: "raised_thickened_profile_values_unchanged",
      testEntryPosition: { x: 3.20, y: -0.40, z: -0.55 },
      entryForwardAxis: "observed_positive_x_negative_z_camera_forward",
      testLandingWithinContactRange: true,
      progressionAuthority: false,
      objectiveAuthority: false,
      movementAuthority: false,
      verbAuthority: false,
      noHardGate: true,
      ecologicalLaw: "same_body_grammar_different_host_material_answer"
    };
  }
}
