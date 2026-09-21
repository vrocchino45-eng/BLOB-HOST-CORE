export class BaseMode {
  constructor({ id, label, acceptedActions = [], runtimeMount = null }) {
    this.id = id;
    this.label = label;
    this.acceptedActions = acceptedActions;
    this.runtimeMount = runtimeMount;
  }

  describe({ region, cameraProfile, visualLanguage }) {
    return {
      id: this.id,
      label: this.label,
      regionId: region.id,
      regionDisplayName: region.displayName,
      regionType: region.regionType,
      hostFunction: region.hostFunction,
      movementMode: region.movementMode,
      cameraProfileId: cameraProfile?.id ?? region.cameraProfile,
      cameraMode: cameraProfile?.mode ?? "unmapped_camera",
      visualLanguageId: visualLanguage?.id ?? region.visualLanguage,
      objectiveId: region.objective,
      gateOutId: region.gateOut,
      acceptedActions: [...this.acceptedActions],
      sceneBehaviorOwner: this.constructor.name,
      gameplayOwner: this.runtimeMount?.gameplayOwner ?? this.constructor.name,
      presentationOwner: this.runtimeMount?.presentationOwner ?? "unassigned_presentation_owner",
      cameraOwner: this.runtimeMount?.cameraOwner ?? "unassigned_camera_owner",
      mountedSystemIds: [...(this.runtimeMount?.systemIds ?? [])],
      implementationStatus: region.implementationStatus ?? "runtime_active",
      runtimeProxy: region.runtimeProxy ?? "none",
      fullRegionPending: Boolean(region.fullRegionPending)
    };
  }
}
