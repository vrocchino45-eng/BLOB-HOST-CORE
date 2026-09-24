const TARGETS = [
  null,
  { slot: 1, label: "Surface Wake", cellId: "CELL_MEMBRANE_NURSERY_001" },
  { slot: 2, label: "Guide Threshold", cellId: "CELL_SCAR_FLOW_FOLD_001" },
  { slot: 3, label: "Hub Chamber", cellId: "CELL_SIGNAL_CHORUS_NERVE_001" },
  { slot: 4, label: "Grave Memory", cellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001" },
  { slot: 5, label: "Vascular Rhythm", cellId: "CELL_VASCULAR_RHYTHM_ROUTE_001" },
  { slot: 6, label: "Silt Pressure", cellId: "CELL_SILT_PRESSURE_ROUTE_001" },
  { slot: 7, label: "Comb Threshold", cellId: "CELL_COMB_THRESHOLD_FILTER_001" },
  { slot: 8, label: "Aperture Fields", cellId: "CELL_APERTURE_FIELDS_ARRIVAL_001" }
];

// HC027G1 — one deterministic debug-only platform per suggested minute of a
// focused eight-minute playtest. Shift+1..8 is intentionally separate from the
// historical Ctrl/Cmd+1..8 area-jump layer because browsers often reserve
// Ctrl/Cmd+number for tab switching.
const TEST_PLATFORMS = [
  null,
  {
    slot: 1,
    label: "Surface Wake / Host Contact Shelf",
    cellId: "CELL_MEMBRANE_NURSERY_001",
    position: [4.0, -0.40, -0.55],
    suggestedSeconds: 60,
    purpose: "land in membrane contact range + move camera-forward through membrane, scar, and residue visual grammar",
    entryLockPass: "HC-031I1"
  },
  {
    slot: 2,
    label: "Pressure / Guide Threshold",
    cellId: "CELL_SCAR_FLOW_FOLD_001",
    position: [0, 0, 0],
    suggestedSeconds: 60,
    purpose: "camera-relative movement + pressure current + Stabilize/Pulse language"
  },
  {
    slot: 3,
    label: "Inquiry / Hub Core Work",
    cellId: "CELL_SIGNAL_CHORUS_NERVE_001",
    position: [0, 0, 0],
    suggestedSeconds: 60,
    purpose: "route comparison + Core inspection + close-view hierarchy",
    seedCoreWork: true
  },
  {
    slot: 4,
    label: "Memory / Grave Reply",
    cellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
    position: [0, 0, 0],
    suggestedSeconds: 60,
    purpose: "scar-memory Pulse answer + material reply + local consequence"
  },
  {
    slot: 5,
    label: "Flow / Vascular Physiology",
    cellId: "CELL_VASCULAR_RHYTHM_ROUTE_001",
    position: [0, 0, 0],
    suggestedSeconds: 60,
    purpose: "current traversal + boost/endurance physiology + cadence readability",
    seedCoreWork: true
  },
  {
    slot: 6,
    label: "Pressure / Silt Intake",
    cellId: "CELL_SILT_PRESSURE_ROUTE_001",
    position: [0, 0, 0],
    suggestedSeconds: 60,
    purpose: "resistance + selective Absorb + pressure recovery"
  },
  {
    slot: 7,
    label: "Coherence / Comb Threshold",
    cellId: "CELL_COMB_THRESHOLD_FILTER_001",
    position: [0, 0, 0],
    suggestedSeconds: 60,
    purpose: "mixed-read sequencing + Stabilize coherence + threshold readability"
  },
  {
    slot: 8,
    label: "Open Inquiry / Signal Plain",
    cellId: "CELL_APERTURE_FIELDS_ARRIVAL_001",
    position: [0, 0, 0],
    suggestedSeconds: 60,
    purpose: "open-field orientation + Pulse inquiry + ecology/material response",
    directSignalPlain: true
  }
];

export class DebugAreaJumpSystem {
  constructor({
    playerMovementController = null,
    inspectionCameraSystem = null,
    coreGrowthSystem = null,
    coreSensoryResponseSystem = null,
    playerRoot = null
  } = {}) {
    this.playerMovementController = playerMovementController;
    this.inspectionCameraSystem = inspectionCameraSystem;
    this.coreGrowthSystem = coreGrowthSystem;
    this.coreSensoryResponseSystem = coreSensoryResponseSystem;
    this.playerRoot = playerRoot ?? playerMovementController?.playerRoot ?? null;
    this.lastJumpFrame = -1;
    this.lastTestPlatformFrame = -1;
    this.lastCoreWorkSeedFrame = -1;
    this.activeTestPlatform = null;
    this.activeTestPlatformStartedAt = 0;
  }

  update(_dt, frameState) {
    if (frameState.input?.debugCoreWorkSeedPressed && this.lastCoreWorkSeedFrame !== frameState.frame) {
      const result = this.coreGrowthSystem?.seedCoreWorkRetainedAnatomyForDebug?.() ?? { seeded: false };
      this.lastCoreWorkSeedFrame = frameState.frame ?? -1;
      frameState.coreWorkQuickTest = {
        pass: "HC-024D0",
        active: Boolean(result.seeded),
        command: "P",
        purpose: "seed_and_reset_grave_vascular_silt_for_core_work_iteration",
        routeProgressionMutated: false,
        retainedRouteFlagsMutated: false,
        seedCount: result.seedCount ?? 0,
        lastSeedFrame: frameState.frame ?? -1
      };
    }

    const platformSlot = frameState.input?.debugTestPlatformSlot ?? 0;
    if (platformSlot && this.lastTestPlatformFrame !== frameState.frame) {
      this.activateTestPlatform(platformSlot, frameState);
      this.publish(frameState);
      return;
    }

    const slot = frameState.input?.debugJumpSlot ?? 0;
    const direct = Boolean(frameState.input?.debugJumpDirect);
    if (!slot || this.lastJumpFrame === frameState.frame) {
      this.publish(frameState);
      return;
    }
    const target = TARGETS[slot];
    if (!target) return;
    const sourceCellId = frameState.activeCellId ?? "none";
    frameState.activeCellId = target.cellId;
    this.zeroMomentum();
    this.lastJumpFrame = frameState.frame ?? -1;
    if (slot === 8 && direct) {
      // A direct test jump must be deterministic. The global tight camera is intentionally
      // persistent across normal cell changes, but inheriting it here makes the same debug
      // shortcut produce different first frames depending on prior player state.
      this.inspectionCameraSystem?.release?.("debug_signal_plain_direct_jump_forced_orbit");
      frameState.debugSignalPlainJumpRequest = {
        pending: true,
        requestedAtFrame: frameState.frame ?? 0,
        resetEncounter: true,
        source: "Ctrl+Shift+8"
      };
    }
    frameState.debugAreaJump = {
      pass: "HC-015G", enabled: true, bypassesProgression: true, mutatesProgression: false,
      lastJump: { slot, label: direct && slot === 8 ? "Signal Plain Test Position" : target.label, sourceCellId, destinationCellId: target.cellId, frame: frameState.frame ?? 0, direct },
      controls: this.areaControls(),
      testPlatforms: this.platformControls()
    };
  }

  activateTestPlatform(slot, frameState) {
    const platform = TEST_PLATFORMS[slot];
    if (!platform) return;

    const sourceCellId = frameState.activeCellId ?? "none";
    const position = platform.position ?? [0, 0, 0];

    // Deterministic test setup only. The active-region mount happens later in the
    // same frame, so entry-anchored systems receive this canonical player position.
    if (this.playerRoot?.position?.set) {
      this.playerRoot.position.set(position[0] ?? 0, position[1] ?? 0, position[2] ?? 0);
    }
    frameState.activeCellId = platform.cellId;
    this.zeroMomentum();
    this.inspectionCameraSystem?.release?.(`hc027g1_test_platform_${slot}_world_view`);
    this.coreSensoryResponseSystem?.clearDebugTestState?.();

    let anatomySeeded = false;
    let seedCount = 0;
    if (platform.seedCoreWork) {
      const result = this.coreGrowthSystem?.seedCoreWorkRetainedAnatomyForDebug?.() ?? { seeded: false, seedCount: 0 };
      anatomySeeded = Boolean(result.seeded);
      seedCount = result.seedCount ?? 0;
    }

    if (platform.directSignalPlain) {
      frameState.debugSignalPlainJumpRequest = {
        pending: true,
        requestedAtFrame: frameState.frame ?? 0,
        resetEncounter: true,
        source: `Shift+${slot}`
      };
    }

    this.activeTestPlatform = platform;
    this.activeTestPlatformStartedAt = frameState.runtimeSeconds ?? 0;
    this.lastTestPlatformFrame = frameState.frame ?? -1;
    this.lastJumpFrame = frameState.frame ?? -1;

    frameState.debugTestPlatform = {
      pass: "HC-027G1",
      active: true,
      slot,
      totalSlots: 8,
      shortcut: `Shift+${slot}`,
      label: platform.label,
      purpose: platform.purpose,
      entryLockPass: platform.entryLockPass ?? "none",
      sourceCellId,
      destinationCellId: platform.cellId,
      canonicalPosition: { x: position[0] ?? 0, y: position[1] ?? 0, z: position[2] ?? 0 },
      startedAtSeconds: this.activeTestPlatformStartedAt,
      elapsedSeconds: 0,
      suggestedSeconds: platform.suggestedSeconds ?? 60,
      nextSlot: slot < 8 ? slot + 1 : 1,
      nextShortcut: `Shift+${slot < 8 ? slot + 1 : 1}`,
      progressionMutated: false,
      objectiveMutated: false,
      routeHistoryMutated: false,
      gatesMutated: false,
      sonarTransientStateCleared: true,
      worldViewReset: true,
      momentumCleared: true,
      anatomySeeded,
      seedCount
    };
  }

  zeroMomentum() {
    this.playerMovementController?.velocity?.set?.(0, 0, 0);
    this.playerMovementController?.fluidSlip?.set?.(0, 0, 0);
    this.playerMovementController?.flowVelocity?.set?.(0, 0, 0);
  }

  areaControls() {
    return [
      ...TARGETS.slice(1).map(({ slot, label, cellId }) => ({ key: `Ctrl+${slot}`, label, cellId })),
      { key: "Ctrl+Shift+8", label: "Signal Plain Test Position (reset encounter)", cellId: "CELL_APERTURE_FIELDS_ARRIVAL_001" },
      { key: "P", label: "Seed/Reset Core Work Test Anatomy", cellId: "current" }
    ];
  }

  platformControls() {
    return TEST_PLATFORMS.slice(1).map(({ slot, label, cellId, purpose, suggestedSeconds }) => ({
      key: `Shift+${slot}`,
      slot,
      label,
      cellId,
      purpose,
      suggestedSeconds: suggestedSeconds ?? 60
    }));
  }

  hotButtonCatalog() {
    return {
      pass: "HC-027K1",
      display: [
        { key: "F1", label: "Playtest Trace", purpose: "large live physical-input + interpreted-action trace with a small contextual HUD" },
        { key: "F2", label: "System Debug", purpose: "show the deep runtime/system diagnostic overlay without the large input panel" },
        { key: "F3", label: "Clean Play", purpose: "hide debug overlays and return to normal playtest presentation" }
      ],
      testPlatforms: this.platformControls(),
      areaJumps: TARGETS.slice(1).map(({ slot, label, cellId }) => ({
        key: `Ctrl+${slot}`, label, cellId, purpose: "legacy direct area jump; browser may intercept Ctrl+number"
      })),
      tools: [
        { key: "Ctrl+Shift+8", label: "Signal Plain direct reset", purpose: "jump directly to Signal Plain and reset the local encounter" },
        { key: "P", label: "Seed / reset Core Work anatomy", purpose: "debug-only retained anatomy setup without route progression" },
        { key: "O", label: "Cycle Core engine 3 → 6 → 12", purpose: "debug-only architecture comparison; does not change progression" },
        { key: "Shift+T", label: "Export telemetry session", purpose: "download the current HC028A1 calibrated session JSON" },
        { key: "Shift+M", label: "Mark playtest moment", purpose: "add a timestamped manual marker to the current telemetry session" }
      ],
      authority: "debug_only_no_progression",
      gameplayControlsChanged: false
    };
  }

  publish(frameState) {
    if (this.activeTestPlatform) {
      const elapsedSeconds = Math.max(0, (frameState.runtimeSeconds ?? 0) - this.activeTestPlatformStartedAt);
      frameState.debugTestPlatform = {
        ...(frameState.debugTestPlatform ?? {}),
        pass: "HC-027G1",
        active: true,
        elapsedSeconds: Number(elapsedSeconds.toFixed(2)),
        suggestedSeconds: this.activeTestPlatform.suggestedSeconds ?? 60,
        overtime: elapsedSeconds > (this.activeTestPlatform.suggestedSeconds ?? 60)
      };
    }

    frameState.debugAreaJump = {
      ...(frameState.debugAreaJump ?? {}),
      pass: "HC-015G",
      enabled: true,
      bypassesProgression: true,
      mutatesProgression: false,
      controls: this.areaControls(),
      testPlatforms: this.platformControls(),
      hotButtons: this.hotButtonCatalog(),
      testPlatformHarness: {
        pass: "HC-027G1",
        shortcutFamily: "Shift+1..8",
        suggestedTotalSeconds: 480,
        automaticAdvance: false,
        progressionAuthority: false,
        browserTabShortcutCollisionAvoided: true
      }
    };
  }
}
