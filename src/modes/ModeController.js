import { LandingMode } from "./LandingMode.js";
import { ThresholdMode } from "./ThresholdMode.js";
import { HubMode } from "./HubMode.js";
import { MemoryRouteMode } from "./MemoryRouteMode.js";
import { RouteContractMode } from "./RouteContractMode.js";
import { VascularRhythmMode } from "./VascularRhythmMode.js";
import { CombThresholdMode } from "./CombThresholdMode.js";
import { ApertureFieldsArrivalMode } from "./ApertureFieldsArrivalMode.js";

export class ModeController {
  constructor({
    regionRegistry,
    cameraProfileRegistry,
    visualLanguageRegistry,
    frameState,
    runtimeProfile = null
  }) {
    if (!regionRegistry || !cameraProfileRegistry || !visualLanguageRegistry || !frameState) {
      throw new Error("[ModeController] registries and frameState are required.");
    }

    this.regionRegistry = regionRegistry;
    this.cameraProfileRegistry = cameraProfileRegistry;
    this.visualLanguageRegistry = visualLanguageRegistry;
    this.frameState = frameState;
    this.runtimeProfile = runtimeProfile ?? {
      id: "FIRST_SLICE_RUNTIME_PROFILE_FALLBACK",
      pass: "compatibility",
      sharedSystemIds: [],
      dormantCompatibilitySystemIds: [],
      regions: {}
    };
    this.lastRegionId = "none";
    this.mountSequence = 0;
    this.modes = new Map([
      ["landing", new LandingMode(this.runtimeProfile.regions?.surface_wake ?? null)],
      ["threshold", new ThresholdMode(this.runtimeProfile.regions?.guide_threshold ?? null)],
      ["hub", new HubMode(this.runtimeProfile.regions?.hub_chamber ?? null)],
      ["memory_route", new MemoryRouteMode(this.runtimeProfile.regions?.grave_memory_route ?? null)],
      ["vascular_rhythm", new VascularRhythmMode(
        this.runtimeProfile.regions?.vascular_route ?? null
      )],
      ["silt_route_contract", new RouteContractMode({
        id: "silt_route_contract_mode",
        label: "Silt Pressure Mode",
        runtimeMount: this.runtimeProfile.regions?.silt_burrow_route ?? null
      })],
      ["comb_threshold", new CombThresholdMode(
        this.runtimeProfile.regions?.comb_threshold ?? null
      )],
      ["aperture_fields_arrival", new ApertureFieldsArrivalMode(
        this.runtimeProfile.regions?.aperture_fields ?? null
      )]
    ]);
  }

  update(_dt, frameState) {
    const region = this.regionRegistry.getByRuntimeCellId(frameState.activeCellId);

    if (!region) {
      frameState.currentMode = {
        id: "legacy_route_mode",
        label: "Legacy Route Compatibility Mode",
        regionId: "outside_first_slice",
        runtimeCellId: frameState.activeCellId,
        sceneBehaviorOwner: "LegacyRouteCompatibilityAdapter",
        implementationStatus: "outside_hc006i_first_slice_rebind"
      };
      this.publishRuntimeMount(frameState, null, frameState.currentMode, null);
      this.publishOwnership(frameState, null, frameState.currentMode);
      return;
    }

    const mode = this.modes.get(region.movementMode);
    if (!mode) throw new Error(`[ModeController] no mode for movementMode ${region.movementMode}`);

    const cameraProfile = this.cameraProfileRegistry.get(region.cameraProfile);
    const visualLanguage = this.visualLanguageRegistry.get(region.visualLanguage);
    const description = mode.describe({ region, cameraProfile, visualLanguage });

    frameState.currentMode = {
      ...description,
      runtimeCellId: frameState.activeCellId,
      sourceAuthority: "HOST_CORE_Blueprint_v1_reference_docs.zip",
      ownershipPass: "HC-016M"
    };

    this.publishRuntimeMount(frameState, region, frameState.currentMode, mode);
    this.publishOwnership(frameState, region, frameState.currentMode);
  }

  publishRuntimeMount(frameState, region, currentMode, mode) {
    const regionId = region?.id ?? "outside_first_slice";
    const profileMount = mode?.runtimeMount ?? this.runtimeProfile.regions?.[regionId] ?? null;
    const regionSystems = profileMount?.systemIds ?? [];
    const activeSystemIds = region
      ? [...new Set([...(this.runtimeProfile.sharedSystemIds ?? []), ...regionSystems])]
      : [];

    if (regionId !== this.lastRegionId) {
      this.mountSequence += 1;
      this.lastRegionId = regionId;
    }

    frameState.firstSliceRuntimeMount = {
      pass: "HC-016M",
      profileId: this.runtimeProfile.id ?? "FIRST_SLICE_RUNTIME_PROFILE_FALLBACK",
      profilePass: this.runtimeProfile.pass ?? "compatibility",
      bootPolicy: this.runtimeProfile.bootPolicy ?? "first_slice_only",
      sourceAuthority: this.runtimeProfile.sourceAuthority ?? "HOST_CORE_Blueprint_v1_reference_docs.zip",
      active: Boolean(region),
      mountSequence: this.mountSequence,
      activeRegionId: regionId,
      activeRuntimeCellId: frameState.activeCellId,
      activeModeId: currentMode.id,
      modeOwner: currentMode.sceneBehaviorOwner,
      gameplayOwner: profileMount?.gameplayOwner ?? currentMode.sceneBehaviorOwner,
      presentationOwner: profileMount?.presentationOwner ?? "none",
      cameraOwner: profileMount?.cameraOwner ?? "none",
      transitionOwner: profileMount?.transitionOwner ?? "none",
      destinationRegionId: profileMount?.destinationRegionId ?? "none",
      sharedSystemIds: [...(this.runtimeProfile.sharedSystemIds ?? [])],
      regionSystemIds: [...regionSystems],
      activeSystemIds,
      activeSystemCount: activeSystemIds.length,
      activeUpdateBudget: profileMount?.activeUpdateBudget ?? activeSystemIds.length,
      dormantCompatibilitySystemIds: [...(this.runtimeProfile.dormantCompatibilitySystemIds ?? [])],
      dormantCompatibilitySystemCount: (this.runtimeProfile.dormantCompatibilitySystemIds ?? []).length,
      dormantCompatibilityRegistered: false,
      ownershipRule: this.runtimeProfile.ownershipRule
        ?? "The active mode mounts region systems. UI remains read-only.",
      mountStatus: region ? "active_region_mounted" : "outside_first_slice_no_region_mount"
    };
  }

  publishOwnership(frameState, region, currentMode) {
    frameState.firstSliceRuntimeOwnership = {
      pass: "HC-016M",
      active: Boolean(region),
      firstSlicePath: ["surface_wake", "guide_threshold", "hub_chamber"],
      act1PreviewPath: [
        "surface_wake",
        "guide_threshold",
        "hub_chamber",
        "grave_memory_route",
        "vascular_route",
        "silt_burrow_route",
        "comb_threshold",
        "aperture_fields"
      ],
      activeRuntimeCellId: frameState.activeCellId,
      activeRegionId: region?.id ?? "outside_first_slice",
      activeModeId: currentMode.id,
      modeOwner: currentMode.sceneBehaviorOwner,
      gameplayOwner: currentMode.gameplayOwner ?? currentMode.sceneBehaviorOwner,
      presentationOwner: currentMode.presentationOwner ?? "none",
      cameraOwner: currentMode.cameraOwner ?? "none",
      regionOwner: "RegionRegistry",
      objectiveOwner: "ObjectiveSystem",
      gateOwner: "LocalCellBoundaryMorphSystem",
      visualOwner: "VisualLanguageRegistry",
      promptOwner: "GuidePromptSystem",
      hudOwnership: "read_only",
      authoredContentSource: "act1RuntimeProfile_HC016M.json + firstSliceRegions_HC006I.json",
      signalChorusClassification: region?.id === "hub_chamber"
        ? "legacy runtime-cell adapter contained by HubMode; no parallel Signal Chorus runtime"
        : "not_active",
      sourceRule: "Modes mount scene behavior. Systems execute reusable gameplay only while mounted. Registries own authored content. UI displays state only.",
      activeSystemCount: frameState.firstSliceRuntimeMount?.activeSystemCount ?? 0,
      dormantCompatibilitySystemCount: frameState.firstSliceRuntimeMount?.dormantCompatibilitySystemCount ?? 0,
      mappingStatus: region ? "explicit_authored_act1_mapping" : "outside_authored_act1_mount"
    };
  }
}
