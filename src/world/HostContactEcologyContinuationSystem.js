import * as THREE from "three";

const CELL_ID = "CELL_MEMBRANE_NURSERY_001";
const clamp01 = (value) => THREE.MathUtils.clamp(Number.isFinite(value) ? value : 0, 0, 1);

/**
 * HC031I1 — Contact Ecology Entry and Visual Readability Lock.
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
    this.visualCue01 = 0;
    this.visualGrammar = "inactive";
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
      const grammarCue = this.createGrammarCue(object, role);
      this.entries.set(surfaceId, {
        surfaceId,
        role,
        segment: object.userData.hostContactEcologySegment ?? "unassigned",
        mesh: object,
        responseShell,
        grammarCue,
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
    shell.name = `${surface.name}_hc031i1_ecology_response`;
    shell.scale.setScalar(1.025);
    shell.renderOrder = 1;
    shell.userData.surfaceContactDisabled = true;
    shell.userData.targetingSuppressed = true;
    shell.userData.hostContactEcologyResponse = true;
    shell.userData.hostContactEcologyRole = role;
    surface.add(shell);
    return shell;
  }

  createGrammarCue(surface, role) {
    const cue = new THREE.Group();
    cue.name = `${surface.name}_hc031i1_visual_grammar`;
    cue.userData.surfaceContactDisabled = true;
    cue.userData.targetingSuppressed = true;
    cue.userData.hostContactVisualCue = true;

    const makeMaterial = (color) => new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    if (role === "scar_load_buttress") {
      for (const y of [-0.42, 0, 0.42]) {
        const band = new THREE.Mesh(
          new THREE.TorusGeometry(0.39, 0.035, 6, 28),
          makeMaterial(0xff8a62)
        );
        band.position.y = y;
        band.rotation.x = Math.PI * 0.5;
        cue.add(band);
      }
    } else {
      const isResidue = role === "residue_yield_field";
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.34, 0.50, isResidue ? 6 : 36),
        makeMaterial(isResidue ? 0xffca72 : 0x79ffe1)
      );
      ring.rotation.x = -Math.PI * 0.5;
      ring.position.y = 1.035;
      cue.add(ring);
    }

    surface.add(cue);
    return cue;
  }

  update(dt, frameState = this.frameState) {
    const safeDt = Math.max(0, Math.min(dt, 0.05));
    this.time += safeDt;
    const active = frameState.activeCellId === CELL_ID;
    if (!active) {
      this.decayImprint(safeDt, 2.5);
      this.applyResponseVisuals({ surfaceId: "none", role: "none" }, frameState, "inactive", false);
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
    this.applyResponseVisuals(relationship, frameState, responseMode, true);

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

  applyResponseVisuals(relationship, frameState, responseMode, visible) {
    const membraneCarry = this.imprint.membraneCarry01;
    const scarBrace = this.imprint.scarBrace01;
    const residueYield = this.imprint.residueYield01;
    const residueCohesion = this.imprint.residueCohesion01;
    const breathe = 0.5 + Math.sin(this.time * 1.35) * 0.5;
    const chord = frameState.verbComposition?.chord ?? "idle";
    const activeSurfaceId = relationship.surfaceId ?? "none";
    const attachedBoost = relationship.attached ? 1 : 0;
    const locomotionBoost = relationship.locomotionActive ? 1 : 0;
    const projectionBoost = relationship.projectionSurfaceBraced ? 1 : 0;
    let strongestCue = 0;

    const setCue = (cue, opacity, scale, rotation = 0) => {
      if (!cue) return;
      cue.visible = visible && opacity > 0.01;
      cue.scale.setScalar(scale);
      cue.rotation.y = rotation;
      cue.traverse((part) => {
        if (part?.material) part.material.opacity = opacity;
      });
    };

    for (const entry of this.entries.values()) {
      const shell = entry.responseShell;
      if (!shell?.material) continue;
      shell.visible = visible;
      const activeBoost = entry.surfaceId === activeSurfaceId ? 1 : 0;

      if (entry.role === "living_membrane_path") {
        const immediate = activeBoost * (0.16 + attachedBoost * 0.20 + locomotionBoost * 0.44 + projectionBoost * 0.34);
        const intensity = clamp01(membraneCarry * 0.68 + immediate);
        shell.material.opacity = 0.025 + intensity * 0.29;
        shell.material.emissiveIntensity = 0.12 + intensity * 1.05 + breathe * 0.06;
        const swell = 1.018 + intensity * 0.080;
        shell.scale.set(swell, 1.02 + intensity * 0.055, swell);
        shell.position.set(0, Math.sin(this.time * 2.25 + entry.surfaceId.length) * 0.018 * intensity, 0);
        const wave = intensity * (0.72 + breathe * 0.28);
        setCue(entry.grammarCue, wave * 0.58, 0.82 + ((this.time * 0.68) % 1) * 0.72, this.time * 0.08);
        strongestCue = Math.max(strongestCue, wave);
      } else if (entry.role === "scar_load_buttress") {
        const immediate = activeBoost * (0.14 + attachedBoost * 0.18 + projectionBoost * 0.68);
        const intensity = clamp01(scarBrace * 0.68 + immediate);
        shell.material.opacity = 0.030 + intensity * 0.34;
        shell.material.emissiveIntensity = 0.14 + intensity * 1.30;
        shell.scale.set(1.018 + intensity * 0.045, 1.018 - intensity * 0.060, 1.018 + intensity * 0.045);
        shell.position.set(0, 0, 0);
        const bracePulse = intensity * (0.82 + Math.sin(this.time * 5.2) * 0.18);
        setCue(entry.grammarCue, bracePulse * 0.68, 1.14 - bracePulse * 0.20);
        strongestCue = Math.max(strongestCue, bracePulse);
      } else if (entry.role === "residue_yield_field") {
        const yieldImmediate = activeBoost * (0.12 + attachedBoost * 0.14 + locomotionBoost * 0.42 + projectionBoost * 0.56);
        const cohereImmediate = activeBoost * (chord === "cohere" && relationship.attached ? 0.58 : 0);
        const yield01 = clamp01(residueYield * 0.70 + yieldImmediate);
        const cohere01 = clamp01(residueCohesion * 0.72 + cohereImmediate);
        shell.material.opacity = 0.025 + Math.max(yield01, cohere01) * 0.31;
        shell.material.emissiveIntensity = 0.10 + cohere01 * 1.02 + yield01 * 0.36;
        shell.scale.set(
          1.02 + yield01 * 0.20 - cohere01 * 0.050,
          Math.max(0.72, 1.02 - yield01 * 0.28 + cohere01 * 0.11),
          1.02 + yield01 * 0.18 - cohere01 * 0.045
        );
        shell.position.set(0, -yield01 * 0.13 + cohere01 * 0.038, yield01 * 0.040);
        const residueCue = Math.max(yield01 * 0.62, cohere01);
        setCue(entry.grammarCue, residueCue * 0.70, 1.08 + yield01 * 0.38 - cohere01 * 0.22, cohere01 * this.time * 0.34);
        strongestCue = Math.max(strongestCue, residueCue);
      }
    }

    this.visualCue01 = visible ? clamp01(strongestCue) : 0;
    this.visualGrammar = !visible ? "inactive"
      : responseMode.startsWith("membrane_") ? "teal_pressure_wave"
        : responseMode.startsWith("scar_") ? "orange_brace_bands"
          : responseMode === "residue_temporarily_cohering" ? "amber_hex_coherence"
            : responseMode.startsWith("residue_") ? "amber_yield_hex"
              : "ambient_contact_ecology";
  }

  publish(active, data) {
    this.frameState.hostContactEcologyContinuation = {
      pass: "HC-031I1",
      active,
      cellId: CELL_ID,
      identity: "Contact Ecology Entry and Visual Readability Lock",
      surfaceRelationshipSource: data.source ?? "none",
      activeSurfaceId: data.surfaceId ?? "none",
      activeRole: data.role ?? "none",
      activeSegment: data.segment ?? "none",
      activeProfileId: data.profileId ?? "none",
      activeMaterialFamily: data.materialFamily ?? "none",
      responseMode: data.responseMode ?? "inactive",
      visualCue01: Number(this.visualCue01.toFixed(3)),
      visualGrammar: this.visualGrammar,
      visualProofRequired: true,
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
