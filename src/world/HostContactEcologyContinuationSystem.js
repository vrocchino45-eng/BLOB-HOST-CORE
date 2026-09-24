import * as THREE from "three";

const CELL_ID = "CELL_MEMBRANE_NURSERY_001";
const clamp01 = (value) => THREE.MathUtils.clamp(Number.isFinite(value) ? value : 0, 0, 1);

/**
 * HC031I — Host Contact Ecology Continuation.
 *
 * Presentation/ecology consumer for the already-proven H3 contact architecture.
 * It never creates movement, attachment, targeting, verb strength, progression,
 * objectives, or gates. Instead it lets authored Host material visibly answer:
 * - living membrane carries and recovers around crawling contact,
 * - scar anatomy bears and concentrates stabilized projection load,
 * - residue yields/slumps under traversal and recoil, while Stabilize alone can
 *   temporarily cohere its presentation.
 *
 * Physical crawlable meshes remain static; all deformation happens on disabled,
 * non-targetable response shells so planted world anchors stay mechanically true.
 */
export class HostContactEcologyContinuationSystem {
  constructor({ scene, frameState }) {
    if (!scene) throw new Error("[HostContactEcologyContinuationSystem] scene is required.");
    if (!frameState) throw new Error("[HostContactEcologyContinuationSystem] frameState is required.");
    this.scene = scene;
    this.frameState = frameState;
    this.entries = new Map();
    this.time = 0;
    this.imprint = {
      membraneCarry01: 0,
      scarBrace01: 0,
      residueYield01: 0,
      residueCohesion01: 0
    };
    this.lastActiveSurfaceId = "none";
    this.surfaceChangeCount = 0;
  }

  init() {
    this.refreshEntries();
    this.publish(false, {
      activeSurfaceId: "none",
      activeRole: "none",
      responseMode: "inactive"
    });
  }

  refreshEntries() {
    this.entries.clear();
    this.scene.traverse((object) => {
      const role = object?.userData?.hostContactEcologyRole;
      const surfaceId = object?.userData?.crawlableSurfaceId;
      if (!object?.isMesh || !role || !surfaceId) return;
      const responseShell = this.createResponseShell(object, role);
      this.entries.set(surfaceId, {
        surfaceId,
        role,
        segment: object.userData.hostContactEcologySegment ?? "unassigned",
        mesh: object,
        responseShell,
        profileId: object.userData.crawlableSurfaceProfileId ?? "unknown_profile",
        materialFamily: object.userData.crawlableSurfaceProfile?.materialFamily ?? "unknown"
      });
    });
  }

  createResponseShell(surface, role) {
    const palette = role === "scar_load_buttress"
      ? { color: 0xb85f57, emissive: 0x7a2927 }
      : role === "residue_yield_field"
        ? { color: 0xc7ab78, emissive: 0x6b542d }
        : { color: 0x63c4b2, emissive: 0x246a63 };
    const material = new THREE.MeshStandardMaterial({
      color: palette.color,
      emissive: palette.emissive,
      emissiveIntensity: 0.12,
      roughness: role === "residue_yield_field" ? 1.0 : 0.82,
      metalness: 0,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const shell = new THREE.Mesh(surface.geometry.clone(), material);
    shell.name = `${surface.name}_hc031i_ecology_response`;
    shell.scale.setScalar(1.025);
    shell.renderOrder = 1;
    shell.userData.surfaceContactDisabled = true;
    shell.userData.targetingSuppressed = true;
    shell.userData.hostContactEcologyResponse = true;
    shell.userData.hostContactEcologyRole = role;
    surface.add(shell);
    return shell;
  }

  update(dt, frameState = this.frameState) {
    const safeDt = Math.max(0, Math.min(dt, 0.05));
    this.time += safeDt;
    const active = frameState.activeCellId === CELL_ID;
    if (!active) {
      this.decayImprint(safeDt, 2.5);
      this.applyResponseVisuals("none", "none", false);
      this.publish(false, {
        activeSurfaceId: "none",
        activeRole: "none",
        responseMode: "inactive"
      });
      return;
    }

    if (this.entries.size === 0) this.refreshEntries();

    const relationship = this.resolveSurfaceRelationship(frameState);
    if (relationship.surfaceId !== this.lastActiveSurfaceId) {
      this.lastActiveSurfaceId = relationship.surfaceId;
      this.surfaceChangeCount += 1;
    }

    this.updateImprint(safeDt, relationship, frameState);
    const responseMode = this.resolveResponseMode(relationship, frameState);
    this.applyResponseVisuals(relationship.surfaceId, relationship.role, true);

    this.publish(true, {
      ...relationship,
      responseMode
    });
  }

  resolveSurfaceRelationship(frameState) {
    const projection = frameState.stabilizedProjection ?? {};
    const support = frameState.coreTendrilSupportPlane ?? {};
    const attachment = frameState.playerAttachment ?? {};
    const truth = frameState.coreSurfaceTruth ?? {};

    let surfaceId = "none";
    let source = "none";
    if (projection.surfaceBraced && (projection.surface?.id ?? "none") !== "none") {
      surfaceId = projection.surface.id;
      source = `stabilized_projection:${projection.externalBraceSource ?? "unknown"}`;
    } else if (support.active && (support.surfaceId ?? "none") !== "none") {
      surfaceId = support.surfaceId;
      source = "anchor_carried_support_plane";
    } else if (attachment.active && (attachment.authoredSuctionSupportSurfaceId ?? "none") !== "none") {
      surfaceId = attachment.authoredSuctionSupportSurfaceId;
      source = "authored_suction_attachment";
    } else if (truth.valid && (truth.surfaceId ?? "none") !== "none") {
      surfaceId = truth.surfaceId;
      source = "surface_truth_proximity";
    }

    const entry = this.entries.get(surfaceId);
    return {
      surfaceId,
      role: entry?.role ?? "none",
      segment: entry?.segment ?? "none",
      profileId: entry?.profileId ?? projection.surface?.profileId ?? truth.profileId ?? "none",
      materialFamily: entry?.materialFamily ?? projection.surface?.materialFamily ?? truth.materialFamily ?? "none",
      source,
      attached: Boolean(attachment.active && attachment.authority === "authored_suction_support"),
      locomotionActive: Boolean(attachment.tendrilLocomotionActive),
      supportCount: Number(attachment.tendrilSupportCount ?? attachment.authoredSuctionSupportCount ?? 0),
      supportQuality01: clamp01(attachment.tendrilSupportPlaneQuality01 ?? support.supportQuality01 ?? 0),
      projectionActive: Boolean(projection.active),
      projectionSurfaceBraced: Boolean(projection.surfaceBraced),
      braceQuality01: clamp01(projection.braceQuality01 ?? 0)
    };
  }

  updateImprint(dt, relationship, frameState) {
    const decay = (key, rate) => {
      this.imprint[key] = Math.max(0, this.imprint[key] - dt * rate);
    };
    decay("membraneCarry01", 0.075);
    decay("scarBrace01", 0.045);
    decay("residueYield01", 0.035);
    decay("residueCohesion01", 0.09);

    const chord = frameState.verbComposition?.chord ?? "idle";
    if (relationship.role === "living_membrane_path") {
      if (relationship.attached) this.imprint.membraneCarry01 += dt * 0.18;
      if (relationship.locomotionActive) this.imprint.membraneCarry01 += dt * 0.62;
      if (relationship.projectionSurfaceBraced) this.imprint.membraneCarry01 += dt * 0.34;
    } else if (relationship.role === "scar_load_buttress") {
      if (relationship.attached) this.imprint.scarBrace01 += dt * 0.16;
      if (relationship.projectionSurfaceBraced) {
        this.imprint.scarBrace01 += dt * (0.72 + relationship.braceQuality01 * 0.72);
      }
    } else if (relationship.role === "residue_yield_field") {
      if (relationship.attached) this.imprint.residueYield01 += dt * 0.18;
      if (relationship.locomotionActive) this.imprint.residueYield01 += dt * 0.70;
      if (relationship.projectionSurfaceBraced) this.imprint.residueYield01 += dt * 0.92;
      if (chord === "cohere" && relationship.attached) {
        this.imprint.residueCohesion01 += dt * 0.82;
        this.imprint.residueYield01 -= dt * 0.34;
      }
    }

    for (const key of Object.keys(this.imprint)) this.imprint[key] = clamp01(this.imprint[key]);
  }

  decayImprint(dt, multiplier = 1) {
    this.imprint.membraneCarry01 = Math.max(0, this.imprint.membraneCarry01 - dt * 0.075 * multiplier);
    this.imprint.scarBrace01 = Math.max(0, this.imprint.scarBrace01 - dt * 0.045 * multiplier);
    this.imprint.residueYield01 = Math.max(0, this.imprint.residueYield01 - dt * 0.035 * multiplier);
    this.imprint.residueCohesion01 = Math.max(0, this.imprint.residueCohesion01 - dt * 0.09 * multiplier);
  }

  resolveResponseMode(relationship, frameState) {
    if (relationship.role === "living_membrane_path") {
      if (relationship.projectionSurfaceBraced) return "membrane_transmitting_focused_projection";
      if (relationship.locomotionActive) return "membrane_carrying_core_load";
      if (relationship.attached) return "membrane_accepting_suction_seal";
      return "membrane_breathing";
    }
    if (relationship.role === "scar_load_buttress") {
      if (relationship.projectionSurfaceBraced) return "scar_bearing_focused_recoil";
      if (relationship.locomotionActive) return "scar_carrying_body_load";
      if (relationship.attached) return "scar_holding_anchor";
      return "scar_quiet_load_memory";
    }
    if (relationship.role === "residue_yield_field") {
      const chord = frameState.verbComposition?.chord ?? "idle";
      if (chord === "cohere" && relationship.attached) return "residue_temporarily_cohering";
      if (relationship.projectionSurfaceBraced) return "residue_yielding_under_focused_recoil";
      if (relationship.locomotionActive) return "residue_slumping_under_traversal";
      if (relationship.attached) return "residue_holding_temporary_seal";
      return "residue_settling";
    }
    return "ambient_contact_ecology";
  }

  applyResponseVisuals(activeSurfaceId, activeRole, visible) {
    const membraneCarry = this.imprint.membraneCarry01;
    const scarBrace = this.imprint.scarBrace01;
    const residueYield = this.imprint.residueYield01;
    const residueCohesion = this.imprint.residueCohesion01;
    const breathe = 0.5 + Math.sin(this.time * 1.35) * 0.5;

    for (const entry of this.entries.values()) {
      const shell = entry.responseShell;
      if (!shell?.material) continue;
      shell.visible = visible;
      const activeBoost = entry.surfaceId === activeSurfaceId ? 1 : 0;

      if (entry.role === "living_membrane_path") {
        const intensity = clamp01(membraneCarry * 0.78 + activeBoost * 0.22);
        shell.material.opacity = 0.015 + intensity * 0.16;
        shell.material.emissiveIntensity = 0.10 + intensity * 0.68 + breathe * 0.04;
        const swell = 1.018 + intensity * 0.025;
        shell.scale.set(swell, 1.02 + intensity * 0.015, swell);
        shell.position.set(0, Math.sin(this.time * 1.8 + entry.surfaceId.length) * 0.008 * intensity, 0);
      } else if (entry.role === "scar_load_buttress") {
        const intensity = clamp01(scarBrace * 0.84 + activeBoost * 0.16);
        shell.material.opacity = 0.018 + intensity * 0.22;
        shell.material.emissiveIntensity = 0.12 + intensity * 0.92;
        shell.scale.set(1.018 + intensity * 0.018, 1.018 - intensity * 0.010, 1.018 + intensity * 0.018);
        shell.position.set(0, 0, 0);
      } else if (entry.role === "residue_yield_field") {
        const yield01 = clamp01(residueYield * 0.86 + activeBoost * 0.14);
        const cohere01 = clamp01(residueCohesion);
        shell.material.opacity = 0.014 + Math.max(yield01, cohere01 * 0.62) * 0.19;
        shell.material.emissiveIntensity = 0.08 + cohere01 * 0.50 + yield01 * 0.20;
        shell.scale.set(
          1.02 + yield01 * 0.105 - cohere01 * 0.020,
          Math.max(0.82, 1.02 - yield01 * 0.16 + cohere01 * 0.055),
          1.02 + yield01 * 0.09 - cohere01 * 0.016
        );
        shell.position.set(0, -yield01 * 0.075 + cohere01 * 0.018, yield01 * 0.025);
      }
    }
  }

  publish(active, data) {
    this.frameState.hostContactEcologyContinuation = {
      pass: "HC-031I",
      active,
      cellId: CELL_ID,
      identity: "Host Contact Ecology Continuation",
      surfaceRelationshipSource: data.source ?? "none",
      activeSurfaceId: data.surfaceId ?? "none",
      activeRole: data.role ?? "none",
      activeSegment: data.segment ?? "none",
      activeProfileId: data.profileId ?? "none",
      activeMaterialFamily: data.materialFamily ?? "none",
      responseMode: data.responseMode ?? "inactive",
      attached: Boolean(data.attached),
      tendrilLocomotionActive: Boolean(data.locomotionActive),
      supportCount: Number(data.supportCount ?? 0),
      supportQuality01: Number((data.supportQuality01 ?? 0).toFixed(3)),
      stabilizedProjectionActive: Boolean(data.projectionActive),
      stabilizedProjectionSurfaceBraced: Boolean(data.projectionSurfaceBraced),
      stabilizedProjectionBraceQuality01: Number((data.braceQuality01 ?? 0).toFixed(3)),
      surfaceChangeCount: this.surfaceChangeCount,
      localImprint: {
        membraneCarry01: Number(this.imprint.membraneCarry01.toFixed(3)),
        scarBrace01: Number(this.imprint.scarBrace01.toFixed(3)),
        residueYield01: Number(this.imprint.residueYield01.toFixed(3)),
        residueCohesion01: Number(this.imprint.residueCohesion01.toFixed(3))
      },
      rules: {
        addsNewAbility: false,
        addsNewButton: false,
        movementAuthority: false,
        attachmentAuthority: false,
        targetingAuthority: false,
        verbStrengthAuthority: false,
        progressionAuthority: false,
        objectiveAuthority: false,
        hardGateAuthority: false,
        regionalHistoryAuthority: false,
        responseShellsAffectContactTruth: false,
        governingLaw: "player_uses_same_body_grammar_host_material_changes_the_answer"
      }
    };
  }
}
