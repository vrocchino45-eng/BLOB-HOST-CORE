import * as THREE from "three";

const clamp01 = (value) => THREE.MathUtils.clamp(Number.isFinite(value) ? value : 0, 0, 1);

/**
 * HC031H3 — Stabilized Projection Brace Continuity.
 *
 * Resolves how the already-authored Stabilize + Pulse chord (HC029C cohere_project)
 * expresses physically. Focused Pulse is always available in free space through a
 * self-braced Core/tendril posture. Authored surface anchors can reinforce that same
 * function through adhesion, load tolerance and Pulse transmission, but never unlock it.
 *
 * Live anchor support remains the highest-fidelity brace source. During a normal
 * tendril peel/replant handoff, PlayerMovementController already retains authored
 * suction attachment for 0.22 s; HC031H3 lets focused projection honor that same
 * movement-owned continuity instead of dropping to self-brace for a frame.
 *
 * This system owns no input, targeting, movement, surface authoring, grace timer or progression.
 */
export class StabilizedProjectionSystem {
  constructor({ frameState }) {
    if (!frameState) throw new Error("[StabilizedProjectionSystem] frameState is required.");
    this.frameState = frameState;
    this.lastMode = "inactive";
    this.modeChangeCount = 0;
  }

  init() {
    this.publish(this.frameState, false, "inactive", {});
  }

  update(_dt, frameState = this.frameState) {
    const composition = frameState.verbComposition ?? {};
    const active = composition.chord === "cohere_project"
      && Boolean(composition.intent?.pulse)
      && Boolean(composition.intent?.stabilize);

    const contact = frameState.coreTendrilContact ?? {};
    const truth = frameState.coreSurfaceTruth ?? {};
    const support = frameState.coreTendrilSupportPlane ?? {};
    const attachment = frameState.playerAttachment ?? {};
    const carriedSupportActive = Boolean(
      support.active
      && support.carriedSurfaceIdentity === true
      && (support.surfaceId ?? "none") !== "none"
      && (support.supportCount ?? 0) > 0
    );
    const liveAnchorBrace = Boolean(
      active
      && carriedSupportActive
      && attachment.authoredSuctionSupportActive
    );
    const authoredAttachmentContinuityBrace = Boolean(
      active
      && !carriedSupportActive
      && attachment.active
      && attachment.authority === "authored_suction_support"
      && attachment.authoredSuctionSupportActive
      && (attachment.authoredSuctionSupportSurfaceId ?? "none") !== "none"
      && (Number(attachment.authoredSuctionSupportCount) || 0) > 0
    );
    const legacySurfaceBrace = Boolean(
      active
      && contact.sealedCount > 0
      && contact.contactState === "attached"
      && truth.valid
      && truth.mechanicalEligible !== false
      && truth.authoredEcologicalSurface === true
    );
    const surfaceBraced = Boolean(
      liveAnchorBrace
      || authoredAttachmentContinuityBrace
      || legacySurfaceBrace
    );
    const sealedCount = liveAnchorBrace
      ? Math.max(0, Math.min(3, Number(support.supportCount) || 0))
      : authoredAttachmentContinuityBrace
        ? Math.max(0, Math.min(3, Number(attachment.authoredSuctionSupportCount) || 0))
        : Math.max(0, Math.min(3, Number(contact.sealedCount) || 0));

    let mode = "inactive";
    if (active) {
      if (!surfaceBraced) mode = "self_braced";
      else if (sealedCount >= 3) mode = "tri_anchor_braced";
      else if (sealedCount === 2) mode = "dual_anchor_braced";
      else mode = "single_anchor_braced";
    }

    if (mode !== this.lastMode) {
      this.lastMode = mode;
      this.modeChangeCount += 1;
    }

    const continuityStrength = clamp01(attachment.authoredSuctionSupportStrength ?? 0);
    const adhesion = surfaceBraced
      ? clamp01(
          liveAnchorBrace
            ? support.adhesion
            : authoredAttachmentContinuityBrace
              ? continuityStrength
              : (truth.adhesion ?? contact.surfaceTruthAdhesion ?? 0.75)
        )
      : 0;
    const loadTolerance = surfaceBraced
      ? clamp01(
          liveAnchorBrace
            ? support.loadTolerance
            : authoredAttachmentContinuityBrace
              ? continuityStrength
              : (truth.loadTolerance ?? contact.surfaceTruthLoadTolerance ?? 0.70)
        )
      : 0;
    const pulseTransmission = surfaceBraced
      ? clamp01(
          liveAnchorBrace
            ? support.verbTransmission?.pulse
            : authoredAttachmentContinuityBrace
              ? continuityStrength
              : (truth.verbTransmission?.pulse ?? contact.surfaceTruthVerbTransmission?.pulse ?? 0.5)
        )
      : 0;
    const compliance = surfaceBraced
      ? clamp01(
          liveAnchorBrace
            ? support.compliance
            : authoredAttachmentContinuityBrace
              ? 0.5
              : (truth.compliance ?? contact.surfaceTruthCompliance ?? 0.5)
        )
      : 0;
    const support01 = surfaceBraced ? clamp01(sealedCount / 3) : 0;
    const surfaceQuality01 = surfaceBraced
      ? clamp01(adhesion * 0.34 + loadTolerance * 0.40 + pulseTransmission * 0.26)
      : 0;

    // The Core can always self-brace. External support increases containment and
    // force transfer, but never turns the chord into a separate super move.
    const selfBrace01 = active ? 0.62 : 0;
    const braceQuality01 = active
      ? clamp01(selfBrace01 + (surfaceBraced ? (0.12 + support01 * 0.14) * (0.62 + surfaceQuality01 * 0.38) : 0))
      : 0;
    const focus01 = active
      ? clamp01(0.70 + (surfaceBraced ? 0.12 * support01 + 0.10 * surfaceQuality01 : 0))
      : 0;
    const recoilContainment01 = active
      ? clamp01(0.58 + (surfaceBraced ? 0.18 * support01 + 0.18 * surfaceQuality01 : 0))
      : 0;

    // HC029C deliberately makes cohere_project controlled rather than stronger.
    // These multipliers only express how much of that controlled projection reaches
    // the intended direction versus diffusing through the local field.
    const focusedResponseMultiplier = active
      ? surfaceBraced
        ? THREE.MathUtils.clamp(0.94 + surfaceQuality01 * 0.28 + support01 * 0.07, 0.90, 1.28)
        : 1.04
      : 1;
    const ambientResponseMultiplier = active
      ? surfaceBraced
        ? THREE.MathUtils.lerp(0.48, 0.34, focus01)
        : 0.52
      : 1;

    const cameraForward = frameState.playerKinematics?.cameraRelativeForward ?? {};
    const direction = {
      x: Number.isFinite(cameraForward.x) ? cameraForward.x : 0,
      y: Number.isFinite(cameraForward.y) ? cameraForward.y : 0,
      z: Number.isFinite(cameraForward.z) ? cameraForward.z : -1
    };

    this.publish(frameState, active, mode, {
      sealedCount,
      surfaceBraced,
      adhesion,
      loadTolerance,
      compliance,
      pulseTransmission,
      support01,
      surfaceQuality01,
      selfBrace01,
      braceQuality01,
      focus01,
      recoilContainment01,
      focusedResponseMultiplier,
      ambientResponseMultiplier,
      direction,
      liveAnchorBrace,
      authoredAttachmentContinuityBrace,
      continuityStrength,
      surfaceId: surfaceBraced
        ? (
            liveAnchorBrace
              ? support.surfaceId
              : authoredAttachmentContinuityBrace
                ? attachment.authoredSuctionSupportSurfaceId
                : (truth.surfaceId ?? contact.surfaceTruthSurfaceId ?? "authored_surface")
          )
        : "none",
      profileId: surfaceBraced
        ? (
            liveAnchorBrace
              ? support.surfaceProfileId
              : authoredAttachmentContinuityBrace
                ? "retained_authored_suction_attachment"
                : (truth.profileId ?? contact.surfaceTruthProfileId ?? "unknown_profile")
          )
        : "none",
      materialFamily: surfaceBraced
        ? (
            liveAnchorBrace
              ? support.materialFamily
              : authoredAttachmentContinuityBrace
                ? "retained_authored_surface"
                : (truth.materialFamily ?? contact.surfaceTruthMaterialFamily ?? "unknown")
          )
        : "none",
      externalBraceSource: surfaceBraced
        ? (
            liveAnchorBrace
              ? "anchor_carried_surface_identity"
              : authoredAttachmentContinuityBrace
                ? "authored_suction_attachment_continuity"
                : "same_frame_surface_truth_legacy"
          )
        : "none"
    });
  }

  publish(frameState, active, mode, data) {
    frameState.stabilizedProjection = {
      pass: "HC-031G",
      owner: "StabilizedProjectionSystem",
      grammarOwner: "VerbCompositionSystem / HC029C",
      active,
      chord: active ? "cohere_project" : "idle",
      mode,
      modeChangeCount: this.modeChangeCount,
      selfBracedWithoutSurface: Boolean(active && !data.surfaceBraced),
      surfaceBraced: Boolean(data.surfaceBraced),
      anchorCount: data.sealedCount ?? 0,
      support01: Number((data.support01 ?? 0).toFixed(3)),
      selfBrace01: Number((data.selfBrace01 ?? 0).toFixed(3)),
      braceQuality01: Number((data.braceQuality01 ?? 0).toFixed(3)),
      focus01: Number((data.focus01 ?? 0).toFixed(3)),
      recoilContainment01: Number((data.recoilContainment01 ?? 0).toFixed(3)),
      surfaceQuality01: Number((data.surfaceQuality01 ?? 0).toFixed(3)),
      externalBraceSource: data.externalBraceSource ?? "none",
      contactIntegrationPass: "HC-031H3",
      liveAnchorBraceActive: Boolean(data.liveAnchorBrace),
      authoredAttachmentContinuityBraceActive: Boolean(data.authoredAttachmentContinuityBrace),
      continuityStrength01: Number((data.continuityStrength ?? 0).toFixed(3)),
      surface: {
        id: data.surfaceId ?? "none",
        profileId: data.profileId ?? "none",
        materialFamily: data.materialFamily ?? "none",
        adhesion: Number((data.adhesion ?? 0).toFixed(3)),
        loadTolerance: Number((data.loadTolerance ?? 0).toFixed(3)),
        compliance: Number((data.compliance ?? 0).toFixed(3)),
        pulseTransmission: Number((data.pulseTransmission ?? 0).toFixed(3))
      },
      direction: {
        x: Number((data.direction?.x ?? 0).toFixed(4)),
        y: Number((data.direction?.y ?? 0).toFixed(4)),
        z: Number((data.direction?.z ?? -1).toFixed(4))
      },
      effects: {
        focusedResponseMultiplier: Number((data.focusedResponseMultiplier ?? 1).toFixed(3)),
        ambientResponseMultiplier: Number((data.ambientResponseMultiplier ?? 1).toFixed(3))
      },
      rules: {
        requiresSurfaceAnchor: false,
        requiresRetainedTargetToExist: false,
        addsNewAbility: false,
        addsNewButton: false,
        changesTargetingAuthority: false,
        surfaceAnchorEnhancesSameFunction: true,
        freeSpaceExpression: "self_braced_stabilized_projection",
        anchoredExpression: "same_projection_with_external_host_brace",
        governingLaw: "player_owns_the_verb_environment_changes_its_expression"
      }
    };
  }
}
