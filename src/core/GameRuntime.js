import * as THREE from "three";
import { SystemRegistry } from "./SystemRegistry.js";
import { FirstSliceTransitionCoordinator } from "./FirstSliceTransitionCoordinator.js";
import { RuntimeStateLedgerSystem } from "./RuntimeStateLedgerSystem.js";
import { SessionTelemetrySystem } from "./SessionTelemetrySystem.js";
import { LocalCellBoundaryMorphSystem } from "../morph/LocalCellBoundaryMorphSystem.js";
import { RecipeDataSystem } from "../data/RecipeDataSystem.js";
import { DebugDisplaySystem } from "../debug/DebugDisplaySystem.js";
import { DebugAreaJumpSystem } from "../debug/DebugAreaJumpSystem.js";
import { InputSystem } from "../input/InputSystem.js";
import { DeliberateCommitmentSystem } from "../input/DeliberateCommitmentSystem.js";
import { VerbCompositionSystem } from "../interaction/VerbCompositionSystem.js";
import { StabilizedProjectionSystem } from "../interaction/StabilizedProjectionSystem.js";
import { ReactiveStateGrammarSystem } from "../interaction/ReactiveStateGrammarSystem.js";
import { ResponsePersonalitySystem } from "../interaction/ResponsePersonalitySystem.js";
import { HOST_CORE_SOURCE_AUTHORITY } from "./HostCoreSourceAuthority.js";
import { ControllerComfortSystem } from "../input/ControllerComfortSystem.js";
import { PlayerMovementController } from "../player/PlayerMovementController.js";
import { CoreEmbodimentSystem } from "../player/CoreEmbodimentSystem.js";
import { CoreTendrilSurfaceContactSystem } from "../player/CoreTendrilSurfaceContactSystem.js";
import { CoreSurfaceTruthSystem } from "../player/CoreSurfaceTruthSystem.js";
import { CoreEngineSystem } from "../player/CoreEngineSystem.js";
import { CoreRadialPerformanceSystem } from "../player/CoreRadialPerformanceSystem.js";
import { CoreTopologyResonanceSystem } from "../player/CoreTopologyResonanceSystem.js";
import { CoreTopologyEnvironmentalHandlingSystem } from "../player/CoreTopologyEnvironmentalHandlingSystem.js";
import { CoreTopologyVerbCharacterSystem } from "../player/CoreTopologyVerbCharacterSystem.js";
import { CoreSensoryResponseSystem } from "../player/CoreSensoryResponseSystem.js";
import { CoreVerbPhysicalizationSystem } from "../player/CoreVerbPhysicalizationSystem.js";
import { CoreVerbEngineCouplingSystem } from "../player/CoreVerbEngineCouplingSystem.js";
import { AmbientMaterialInteractionSystem } from "../world/AmbientMaterialInteractionSystem.js";
import { HostRhythmSystem } from "../world/HostRhythmSystem.js";
import { RegionalPhysicalEmbodimentSystem } from "../world/RegionalPhysicalEmbodimentSystem.js";
import { HostContactShelfSystem } from "../world/HostContactShelfSystem.js";
import { LiftFieldReadabilitySystem } from "../world/LiftFieldReadabilitySystem.js";
import { CoreWorldResonanceSystem } from "../world/CoreWorldResonanceSystem.js";
import { EventAnchoredHostAudioSystem } from "../audio/EventAnchoredHostAudioSystem.js";
import { InteractionCompositionSystem } from "../presentation/InteractionCompositionSystem.js";
import { VisualHierarchyCompressionSystem } from "../presentation/VisualHierarchyCompressionSystem.js";
import { CoreGrowthSystem } from "../player/CoreGrowthSystem.js";
import { PlaceholderValidator } from "../visual/PlaceholderValidator.js";
import { VisualRecipeRegistry } from "../visual/VisualRecipeRegistry.js";
import { VisualComposer } from "../visual/VisualComposer.js";
import { MotionSignatureSystem } from "../visual/MotionSignatureSystem.js";
import { ChemObjectSystem } from "../chemistry/ChemObjectSystem.js";
import { BondSystem } from "../chemistry/BondSystem.js";
import { TargetingSystem } from "../targeting/TargetingSystem.js";
import { TargetFocusRegistry } from "../targeting/TargetFocusRegistry.js";
import { EntitySystem } from "../ecology/EntitySystem.js";
import { EntityEcologyResonanceSystem } from "../ecology/EntityEcologyResonanceSystem.js";
import { EntityRelationshipGrammarSystem } from "../ecology/EntityRelationshipGrammarSystem.js";
import { EntityReciprocalMemorySystem } from "../ecology/EntityReciprocalMemorySystem.js";
import { EntityReciprocalBehaviorSystem } from "../ecology/EntityReciprocalBehaviorSystem.js";
import { EntityLocalMatterCouplingSystem } from "../ecology/EntityLocalMatterCouplingSystem.js";
import { EntityEcologicalResidueSystem } from "../ecology/EntityEcologicalResidueSystem.js";
import { EntityResidueRecognitionSystem } from "../ecology/EntityResidueRecognitionSystem.js";
import { EntityEcologicalCrossInfluenceSystem } from "../ecology/EntityEcologicalCrossInfluenceSystem.js";
import { OrbiterSystem } from "../ecology/OrbiterSystem.js";
import { LocalCellMorphSystem } from "../morph/LocalCellMorphSystem.js";
import { MorphReadabilitySystem } from "../morph/MorphReadabilitySystem.js";
import { MorphCompletionSystem } from "../morph/MorphCompletionSystem.js";
import { ScarFlowArrivalSystem } from "../morph/ScarFlowArrivalSystem.js";
import { ScarFlowInteractionSystem } from "../morph/ScarFlowInteractionSystem.js";
import { GuideThresholdGameplaySystem } from "../morph/GuideThresholdGameplaySystem.js";
import { GuideThresholdLayeredInteractionSystem } from "../morph/GuideThresholdLayeredInteractionSystem.js";
import { SecondLocalCellMorphSystem } from "../morph/SecondLocalCellMorphSystem.js";
import { CameraReadabilitySystem } from "../camera/CameraReadabilitySystem.js";
import { InspectionCameraSystem } from "../camera/InspectionCameraSystem.js";
import { InspectionOcclusionSystem } from "../camera/InspectionOcclusionSystem.js";
import { GuidePromptSystem } from "../guide/GuidePromptSystem.js";
import { OpeningPacingSystem } from "../opening/OpeningPacingSystem.js";
import { SurfaceWakeLayeredInteractionSystem } from "../opening/SurfaceWakeLayeredInteractionSystem.js";
import { SurfaceWakeGameplaySystem } from "../opening/SurfaceWakeGameplaySystem.js";
import { SurfaceWakeEcologicalCausalitySystem } from "../opening/SurfaceWakeEcologicalCausalitySystem.js";
import { CinematicAwakeningSystem } from "../cinematic/CinematicAwakeningSystem.js";
import { PlaytestHudSystem } from "../ui/PlaytestHudSystem.js";
import { StatusPageSystem } from "../ui/StatusPageSystem.js";
import { RegionRegistry } from "../world/RegionRegistry.js";
import { GateRegistry } from "../world/GateRegistry.js";
import { ObjectiveRegistry } from "../world/ObjectiveRegistry.js";
import { CameraProfileRegistry } from "../world/CameraProfileRegistry.js";
import { VisualLanguageRegistry } from "../world/VisualLanguageRegistry.js";
import { ModeController } from "../modes/ModeController.js";
import { ObjectiveSystem } from "../systems/ObjectiveSystem.js";
import { HubChamberFoundationSystem } from "../hub/HubChamberFoundationSystem.js";
import { HubInvestigationGameplaySystem } from "../hub/HubInvestigationGameplaySystem.js";
import { FirstSliceCohesionSystem } from "./FirstSliceCohesionSystem.js";
import { GraveMemoryRouteSystem } from "../routes/GraveMemoryRouteSystem.js";
import { ReturnRegionEngineSystem } from "../routes/ReturnRegionEngineSystem.js";
import { GraveReturnRegionSystem } from "../routes/GraveReturnRegionSystem.js";
import { GraveResonanceGameplaySystem } from "../routes/GraveResonanceGameplaySystem.js";
import { GraveRuptureHarvestSystem } from "../combat/GraveRuptureHarvestSystem.js";
import { GraveRuptureConsequenceSystem } from "../combat/GraveRuptureConsequenceSystem.js";
import { Act1RouteContractSystem } from "../routes/Act1RouteContractSystem.js";
import { VascularRhythmRouteSystem } from "../routes/VascularRhythmRouteSystem.js";
import { SiltPressureRouteSystem } from "../routes/SiltPressureRouteSystem.js";
import { CombThresholdFoundationSystem } from "../thresholds/CombThresholdFoundationSystem.js";
import { CombThresholdPlayableSystem } from "../thresholds/CombThresholdPlayableSystem.js";
import { ApertureFieldsArrivalSystem } from "../fields/ApertureFieldsArrivalSystem.js";
import { SignalPlainEcologySystem } from "../fields/SignalPlainEcologySystem.js";
import { MembraneRidgeGameplaySystem } from "../fields/MembraneRidgeGameplaySystem.js";

export class GameRuntime {
  constructor({ appRoot, buildId, buildLabel }) {
    this.appRoot = appRoot;
    this.buildId = buildId;
    this.buildLabel = buildLabel;

    this.registry = new SystemRegistry();
    this.recipeDataSystem = new RecipeDataSystem({
      validationProfile: "first_slice_runtime"
    });
    this.placeholderValidator = null;
    this.visualRecipeRegistry = null;
    this.visualComposer = null;
    this.motionSignatureSystem = null;
    this.inputSystem = null;
    this.deliberateCommitmentSystem = null;
    this.verbCompositionSystem = null;
    this.stabilizedProjectionSystem = null;
    this.reactiveStateGrammarSystem = null;
    this.controllerComfortSystem = null;
    this.playerMovementController = null;
    this.coreSurfaceTruthSystem = null;
    this.hostContactShelfSystem = null;
    this.coreEmbodimentSystem = null;
    this.coreTendrilSurfaceContactSystem = null;
    this.coreEngineSystem = null;
    this.coreRadialPerformanceSystem = null;
    this.coreTopologyResonanceSystem = null;
    this.coreTopologyEnvironmentalHandlingSystem = null;
    this.coreSensoryResponseSystem = null;
    this.coreVerbPhysicalizationSystem = null;
    this.visualHierarchyCompressionSystem = null;
    this.coreVerbEngineCouplingSystem = null;
    this.hostRhythmSystem = null;
    this.regionalPhysicalEmbodimentSystem = null;
    this.coreWorldResonanceSystem = null;
    this.eventAnchoredHostAudioSystem = null;
    this.coreGrowthSystem = null;
    this.chemObjectSystem = null;
    this.bondSystem = null;
    this.targetFocusRegistry = null;
    this.targetingSystem = null;
    this.entitySystem = null;
    this.entityEcologyResonanceSystem = null;
    this.entityRelationshipGrammarSystem = null;
    this.entityReciprocalMemorySystem = null;
    this.entityReciprocalBehaviorSystem = null;
    this.entityLocalMatterCouplingSystem = null;
    this.entityEcologicalResidueSystem = null;
    this.entityResidueRecognitionSystem = null;
    this.entityEcologicalCrossInfluenceSystem = null;
    this.orbiterSystem = null;
    this.localCellMorphSystem = null;
    this.morphReadabilitySystem = null;
    this.morphCompletionSystem = null;
    this.scarFlowArrivalSystem = null;
    this.scarFlowInteractionSystem = null;
    this.guideThresholdGameplaySystem = null;
    this.guideThresholdLayeredInteractionSystem = null;
    this.secondLocalCellMorphSystem = null;
    this.debugDisplaySystem = null;
    this.cameraReadabilitySystem = null;
    this.inspectionCameraSystem = null;
    this.inspectionOcclusionSystem = null;
    this.guidePromptSystem = null;
    this.openingPacingSystem = null;
    this.surfaceWakeLayeredInteractionSystem = null;
    this.surfaceWakeGameplaySystem = null;
    this.surfaceWakeEcologicalCausalitySystem = null;
    this.cinematicAwakeningSystem = null;
    this.playtestHudSystem = null;
    this.statusPageSystem = null;
    this.regionRegistry = null;
    this.gateRegistry = null;
    this.objectiveRegistry = null;
    this.cameraProfileRegistry = null;
    this.visualLanguageRegistry = null;
    this.modeController = null;
    this.objectiveSystem = null;
    this.hubChamberFoundationSystem = null;
    this.hubInvestigationGameplaySystem = null;
    this.firstSliceCohesionSystem = null;
    this.graveMemoryRouteSystem = null;
    this.returnRegionEngineSystem = null;
    this.graveReturnRegionSystem = null;
    this.graveResonanceGameplaySystem = null;
    this.graveRuptureHarvestSystem = null;
    this.graveRuptureConsequenceSystem = null;
    this.act1RouteContractSystem = null;
    this.vascularRhythmRouteSystem = null;
    this.siltPressureRouteSystem = null;
    this.combThresholdFoundationSystem = null;
    this.combThresholdPlayableSystem = null;
    this.apertureFieldsArrivalSystem = null;
    this.signalPlainEcologySystem = null;
    this.membraneRidgeGameplaySystem = null;
    this.firstSliceTransitionCoordinator = null;
    this.localCellBoundaryMorphSystem = null;
    this.runtimeStateLedgerSystem = null;
    this.sessionTelemetrySystem = null;

    this.clock = new THREE.Clock();
    this.frame = 0;
    this.isRunning = false;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.playerCore = null;
    this.localCellRecipe = null;

    this.cameraTarget = new THREE.Vector3();
    this.cameraDesired = new THREE.Vector3();
    this.cameraLookAt = new THREE.Vector3();
    this.cameraOffset = new THREE.Vector3();
    this.cameraMotionLead = new THREE.Vector3();
    this.cameraVelocityDirection = new THREE.Vector3();
    this.inspectionFocus = new THREE.Vector3();
    this.inspectionDirection = new THREE.Vector3();
    this.inspectionRight = new THREE.Vector3();
    this.inspectionYawCenter = 0;
    this.cameraYaw = 0;
    this.cameraPitch = 0.34;
    this.cameraDistance = 8.35;
    this.cameraDefaultYaw = 0;
    this.cameraDefaultPitch = 0.34;
    this.cameraDefaultDistance = 8.35;
    this.lastManualCameraInputAt = -999;
    this.verticalCameraAnchorY = null;

    this.frameState = {
      buildId: this.buildId,
      buildLabel: this.buildLabel,
      buildManifest: null,
      lockState: null,
      sourceAuthority: { ...HOST_CORE_SOURCE_AUTHORITY, active: true, rebaselinePass: "HC-012A" },
      firstSliceRuntimeMount: {
        pass: "HC-012A",
        profileId: "mount_pending",
        active: false,
        activeRegionId: "not_initialized",
        activeModeId: "not_initialized",
        activeSystemIds: [],
        dormantCompatibilitySystemIds: []
      },
      performanceCapture: {
        pass: "HC-016N",
        status: "collecting",
        purpose: "separate updater-bound hitches from render/allocation/GC hitches"
      },
      runtimeExecution: {
        pass: "HC-012A",
        frame: 0,
        profileId: "mount_pending",
        activeRegionId: "not_initialized",
        executedSystemIds: [],
        skippedRegionSystemIds: []
      },
      compatibilityArchive: {
        pass: "HC-012A",
        referenceBuild: "HC-008G",
        sourceAndAuthoredDataRetained: true,
        registeredDuringFirstSliceBoot: false,
        initializedDuringFirstSliceBoot: false,
        updatedDuringFirstSliceBoot: false,
        dormantSystemIds: []
      },
      blueprintTranslation: {
        pass: "HC-009G",
        active: true,
        primaryReference: HOST_CORE_SOURCE_AUTHORITY.sourcePackage,
        translationRule: HOST_CORE_SOURCE_AUTHORITY.runtimeRule,
        activeCellRole: "not_initialized",
        activeBlueprintRole: "not_initialized",
        legacyRuntimeWarning: "Historical gate registry remains compatibility data only; runtime transitions are morph-owned and hard teleports remain forbidden.",
        localCellToBlueprintRole: [],
        legacyBlueprintRoleMap: []
      },
      firstRouteChoicePlanning: {
        pass: "HC-004A",
        active: false,
        recommendedRouteId: "none",
        recommendedRouteLabel: "none",
        status: "not_loaded",
        nextPassRecommendation: null
      },
      graveRouteRuntimePlanning: {
        pass: "HC-004A",
        active: false,
        selectedRouteId: "none",
        plannedCellId: "none",
        status: "not_loaded",
        nextRecommendedPass: null
      },
      debugDisplay: {
        mode: "hidden",
        hint: "F1 playtest trace / F2 system debug / F3 clean / Back cycles",
        changedBy: "default_playtest",
        changedAt: 0
      },
      inputSource: {
        keyboardActive: false,
        gamepadActive: false,
        gamepadName: "none",
        gamepadMapping: "none",
        gamepadButtonCount: 0,
        activeDevice: "keyboard",
        pulseContext: "none",
        pulseButtonIndex: 2,
        pulseButtonValue: 0,
        pulseButtonDown: false,
        contextButtonIndex: 0,
        contextButtonValue: 0,
        contextButtonDown: false,
        contextButtonActsAsPulse: false,
        contextButtonActsAsHold: false,
        contextHoldKind: "none",
        resonanceHeld: false,
        pulseSequence: 0,
        lastPulseSource: "none",
        inputReliabilityPass: "HC-004QC"
      },
      inputActionAudit: {
        pass: "HC-004QC",
        eventId: 0,
        producedAtFrame: -1,
        source: "none",
        activeCellId: "none",
        targetIdAtProduction: "none",
        consumedBy: "none",
        consumedAtFrame: -1,
        consumedTargetId: "none",
        result: "no_pulse_yet"
      },
      controllerOnboarding: {
        pass: "HC-003M",
        active: false,
        mode: "first_playable_minute_controller_comfort",
        tuning: null,
        comfortStage: "not_initialized",
        statusLine: "controller comfort tuning not loaded yet",
        noNewContent: true,
        noGates: true
      },
      runtimeSeconds: 0,
      frame: 0,
      activeHostId: "none",
      activeCellId: "none",
      selectedObject: null,
      recipeCounts: {
        hosts: 0,
        localCells: 0,
        visualRecipes: 0,
        placeholders: 0,
        chemObjects: 0,
        bondRecipes: 0,
        functionRecipes: 0,
        entityRecipes: 0,
        orbiterRecipes: 0,
        morphPlans: 0,
        morphCompletionHooks: 0,
        scarFlowInteractions: 0,
        secondMorphPlans: 0,
        signalChorusInteractions: 0,
        thirdMorphPlans: 0,
        bloomResidueInteractions: 0,
        targetFocusRules: 0,
        guidePromptRecipes: 0,
        openingFlowTuning: 0,
        cinematicAwakeningBeat: 0,
        blueprintTranslationLayer: 0,
        firstRouteChoicePlanning: 0,
        firstMinuteVisualReadabilityPolish: 0,
        graveRouteMorphPrototype: 0,
        graveRouteMorphPlans: 0,
        graveArrivalReadability: 0,
        graveReadBeforeAbsorbLoops: 0,
        graveLoopStabilityExitReadiness: 0,
        graveExitReadinessPrototype: 0,
        graveRouteContinuityPlanning: 0,
        graveScarMemorySeamArrivalPlanning: 0,
        graveScarMemorySeamRuntimeArrival: 0,
        graveScarMemorySeamFirstReadLoop: 0,
        graveSeamContinuityMicroExit: 0,
        graveBedPostSeamResponse: 0,
        graveRouteLockState: 0,
        graveReturnContinuityRecipes: 0,
        graveReturnContinuity: 0
      },
      input: {
        moveX: 0,
        moveY: 0,
        moveZ: 0,
        boostHeld: false,
        interactPressed: false,
        interactEventId: 0,
        pulsePressed: false,
        pulseEventId: 0,
        pulseSource: "none",
        pulseHeld: false,
        pulseReleased: false,
        pulseHoldSeconds: 0,
        pulseCharge01: 0,
        pulseReleaseCharge01: 0,
        pulseReleaseKind: "none",
        pulseCommitment: "idle",
        absorbHeld: false,
        stabilizeHeld: false,
        resonanceHeld: false,
        guideFocusPressed: false,
        cancelPressed: false,
        cameraLookX: 0,
        cameraLookY: 0,
        recenterCameraPressed: false,
        toggleInspectionCameraPressed: false
      },
      controlMap: {
        id: "HOST_CORE_CANONICAL_CONTROLS_V1",
        active: true,
        sourceAuthority: HOST_CORE_SOURCE_AUTHORITY.sourcePackage,
        expectedAction: "interact_or_absorb",
        compatibilityAliases: {
          resonanceHeld: "stabilizeHeld",
          toggleInspectionCameraPressed: "guideFocusPressed"
        }
      },
      surfaceWakeLayeredInteraction: {
        pass: "HC-006EA",
        active: false,
        stage: "surface_wake_inactive",
        stageIndex: 0,
        progress: 0,
        ready: false,
        completed: false,
        currentFocus: "none",
        focusDistance: 0,
        targetRequired: false,
        safeSeedReadable: false,
        blocksSafeSeedAbsorb: false,
        nextAction: "Approach the Surface Wake listening fold."
      },
      interactionInspectionFocus: {
        architecturePass: "HC-006D",
        providerId: "none",
        id: "none",
        active: false,
        inspectable: false,
        distance: Infinity
      },
      inspectionCamera: {
        pass: "HC-024C2",
        active: false,
        available: true,
        mode: "player_tethered_orbit",
        status: "core_inspection_available_globally",
        focusMode: "player_forward",
        focusObjectId: "player_core_self_inspection",
        selfInspection: false,
        coreWorkActive: false,
        coreWorkAvailable: false,
        toggleHint: "Y inspects the Core / adopts a readable authored focus.",
        reusableFromOpening: true,
        persistentAcrossCells: true,
        persistsWithoutAuthoredFocus: true,
        cameraRelativeMovementPreserved: true,
        routeActivated: false
      },
      tightInspectionCamera: {
        pass: "HC-024C2",
        active: false,
        available: true,
        mode: "player_tethered_orbit",
        status: "core_inspection_available_globally",
        focusMode: "player_forward",
        focusObjectId: "player_core_self_inspection",
        selfInspection: false,
        coreWorkActive: false,
        coreWorkAvailable: false,
        toggleHint: "Y inspects the Core / adopts a readable authored focus.",
        reusableFromOpening: true,
        persistentAcrossCells: true,
        persistsWithoutAuthoredFocus: true,
        cameraRelativeMovementPreserved: true,
        routeActivated: false
      },
      inspectionComposition: {
        pass: "HC-006D",
        active: false,
        focusMarker: "hidden",
        corridorClear: true,
        fadedBlockerCount: 0,
        fadedBlockers: [],
        ambientDensityReduced: false
      },
      cameraControl: {
        mode: "player_tethered_orbit",
        yaw: 0,
        pitch: 0.34,
        distance: 8.35,
        lookX: 0,
        lookY: 0,
        recenterHint: "Right stick orbit / R3 recenter / left-stick up follows camera forward",
        targetVisibleBias: 1,
        occlusionIntensity: 0,
        occludedObjectId: "none",
        playerHalo: "active",
        lastRecenterAt: 0
      },
      cameraReadability: {
        pass: "HC-003M",
        foregroundFade: "inactive",
        occlusionIntensity: 0,
        occludedObjectId: "none",
        playerHalo: "active",
        autoPullback: 0,
        note: "foreground tissue fades and camera pulls back to preserve the local play pocket"
      },
      guidePrompt: {
        active: false,
        id: "none",
        beat: "none",
        tone: "neutral",
        guideLine: "The lantern is waiting.",
        objectiveLine: "Move, pulse, and listen.",
        debugFallback: "none",
        priority: 0,
        age: 0,
        source: "not_initialized",
        noDialogueTree: true,
        noQuestLog: true
      },
      promptStack: {
        pass: "HC-003M",
        guidePrimary: true,
        morphPanelMode: "secondary_tissue_status",
        hostTissueInstructionSuppressed: true,
        firstMinuteLockStatus: "pending",
        optionalForkStatus: "not_reached",
        note: "Guide prompt is primary; tissue shift panel is secondary status while Guide is active."
      },
      openingFlow: {
        pass: "HC-003M",
        active: false,
        mode: "first_playable_minute_trim",
        stage: "not_initialized",
        stageLabel: "Opening flow waiting",
        firstMinuteBoundary: "Membrane Nursery → Scar-Flow Fold → Signal Chorus Nerve",
        bloomResidueRole: "beyond-minute optional fork",
        firstMinuteProgress: 0,
        preferredTargetId: "none",
        promptMinHoldSeconds: 2.8,
        worldFacingObjective: "Move, pulse, and listen.",
        noDialogueTree: true,
        noQuestLog: true,
        noGates: true
      },
      awakeningCinematic: {
        pass: "HC-003M",
        active: false,
        mode: "playable_awakened_cinematic_cues",
        beat: "not_initialized",
        beatLabel: "Cinematic cues waiting",
        progress: 0,
        intensity: 0,
        hostPulse: { active: false, progress: 0, intensity: 0 },
        guideReveal: { active: false, progress: 0, intensity: 0 },
        microMacroCue: { active: false, progress: 0, intensity: 0 },
        morphEmphasis: { active: false, progress: 0, intensity: 0 },
        cameraBias: { active: false, reason: "not_initialized" },
        noCutsceneLockout: true,
        playerControlPreserved: true
      },
      pulse: {
        active: false,
        age: 0,
        radius: 0,
        affectedObjects: []
      },
      chemistry: {
        form: 0,
        flux: 0,
        scar: 0,
        seed: 0,
        signal: 0
      },
      physicalFeel: {
        viscosity: 0,
        pressure: 0,
        flowVector: { x: 0, y: 0, z: 0 },
        boundaryBehavior: "none"
      },
      playerComposition: {
        form: 0.32,
        flux: 0.21,
        scar: 0.02,
        seed: 0.36,
        signal: 0.09
      },
      playerKinematics: {
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        speed: 0,
        viscosity: 0,
        pressure: 0,
        flowVector: { x: 0, y: 0, z: 0 },
        boundaryPressure: 0,
        kineticGlow: 0,
        movementFeel: "not_initialized"
      },
      currentBond: "none",
      currentChemTarget: "none",
      bondState: {
        active: false,
        objectId: "none",
        bondId: "none",
        strength: 0,
        stability: 0,
        absorbReadiness: 0,
        absorbProgress: 0,
        compatibility: "none",
        message: "none"
      },
      chemObjectState: {
        nearestObject: "none",
        nearestDistance: 0,
        pulseResponse: "none",
        absorbProgress: 0,
        absorbedObjects: 0
      },
      firstSliceCohesion: {
        pass: "HC-009E",
        active: false,
        status: "not_initialized",
        overallProgress: 0,
        emergingIdentity: "Emergent Conduit",
        identityIsSoft: true,
        practice: { reading: 0, binding: 0, stabilizing: 0 },
        practiceBalance: { reading: 1 / 3, binding: 1 / 3, stabilizing: 1 / 3 },
        lessons: [],
        sliceLockCriteria: {
          nurseryAgencyProven: false,
          surfaceFoldCompleted: false,
          bindingCoreCommitted: false,
          guidePressureTested: false,
          hubGrowthRecognized: false,
          hubInvestigationReady: false,
          hubSelfReadingComplete: false,
          graveMemoryCrossable: false
        },
        sliceLockReady: false,
        missingLockCriteria: [
          "nurseryAgencyProven",
          "surfaceFoldCompleted",
          "bindingCoreCommitted",
          "guidePressureTested",
          "hubGrowthRecognized",
          "hubInvestigationReady",
          "hubSelfReadingComplete",
          "graveMemoryCrossable"
        ],
        decorativePracticeVisualsDisabled: true,
        bodyEvidenceOwner: "CoreGrowthSystem",
        directTriggerCompletion: false,
        directObjectiveCompletion: false,
        directGateMutation: false,
        abilityUnlocks: false
      },
      interactionAssist: {
        active: false,
        objectId: "none",
        compatible: false,
        assistRange: 0,
        distance: 0,
        position: null
      },
      targetFocus: {
        active: false,
        provider: "none",
        ruleId: "none",
        activeCellId: "none",
        allowedCells: [],
        preferredTargetId: "none",
        preferredTargetLabel: "none",
        objectBoosts: {},
        cellBoosts: {},
        reasons: []
      },
      targeting: {
        active: false,
        targetId: "none",
        targetKind: "none",
        distance: 0,
        lockStrength: 0,
        reticleState: "idle",
        message: "none"
      },
      entityState: {
        total: 0,
        nearestEntity: "none",
        nearestDistance: 0,
        lastReaction: "none",
        tenderState: "not_spawned",
        watcherState: "not_spawned"
      },
      orbiterState: {
        total: 0,
        guideState: "not_spawned",
        guideTarget: "none",
        guideDistance: 0,
        lastReaction: "none",
        shimmerActive: false
      },
      visualCompositionState: {
        pass: "HC-003M",
        motionSignaturesActive: false,
        animatedParts: 0,
        readableVisuals: []
      },
      schemaValidationReport: {
        status: "pending",
        warnings: []
      },
      playtestHud: {
        active: false,
        pass: "HC-003M",
        mode: "debug_hidden_playtest",
        objective: "Move, pulse, and listen.",
        actionHint: "RT absorbs only when safe. X pulses when the tissue answers.",
        statusLine: "First Minute: waiting",
        noDebugDependency: true
      },
      morphReadabilityDebug: {
        pass: "HC-004QE",
        visible: false,
        title: "HOST TISSUE SHIFT — no gate",
        status: "not published",
        step: "not published",
        progress: 0,
        planId: "none",
        phase: "not_initialized"
      },
      placeholderVisualTriage: {
        pass: "HC-003M",
        active: false,
        visualLockFirst: [],
        prototypeAcceptedGroups: [],
        nextRecommendedPass: "HC-003N Opening Slice Gold Candidate"
      },
      firstMinuteVisualReadabilityPolish: {
        pass: "HC-003M",
        active: false,
        status: "not_loaded",
        visualTargets: [],
        nextRecommendedPass: "HC-003N Opening Slice Gold Candidate"
      },
      placeholderStatus: {
        currentPass: "HC-003M",
        total: 0,
        active: 0,
        expired: 0,
        warnings: []
      },
      morphCompletion: {
        active: false,
        cellId: "none",
        stability: 0,
        pressureRelief: 0,
        memoryEcho: 0,
        pathConfidence: 0,
        flowConfidence: 0,
        clotWarning: 0,
        lastHook: "none",
        nearestHook: "none",
        nearestDistance: 0,
        nextAction: "complete the local cell morph first",
        safeToExpand: false,
        hookCount: 0
      },
      scarFlowArrival: {
        active: false,
        cellId: "none",
        arrivalAge: 0,
        arrivalClarity: 0,
        nurseryFade: 0,
        focusObjectId: "none",
        focusDistance: 0,
        lastAction: "none",
        nextAction: "complete the local cell morph first",
        activeCellFocus: "nursery_pocket",
        sourceSuppressed: false
      },
      scarFlowInteraction: {
        active: false,
        loopId: "none",
        stage: "inactive",
        stageIndex: 0,
        progress: 0,
        memoryRead: false,
        pathAligned: false,
        pressureRelieved: false,
        clotRespected: false,
        preparedForNextBranch: false,
        currentFocus: "none",
        focusDistance: 0,
        lastInteraction: "none",
        nextAction: "complete the local cell morph first"
      },
      secondLocalCellMorph: {
        planId: "none",
        sourceCell: "none",
        destinationCell: "none",
        phase: "not_initialized",
        progress: 0,
        triggerReady: false,
        triggerReason: "none",
        nextAction: "none",
        triggerConfidence: 0,
        scarFlowStable: false,
        completed: false,
        noGate: true,
        continuousControl: true
      },
      signalChorusArrival: {
        active: false,
        cellId: "none",
        arrivalAge: 0,
        arrivalClarity: 0,
        listeningTrust: 0,
        chorusResponse: 0,
        sourceFade: 0,
        focusObjectId: "none",
        focusDistance: 0,
        lastAction: "none",
        nextAction: "complete the second local cell morph first",
        activeCellFocus: "not_signal_chorus",
        sourceSuppressed: false,
        readyForSignalLoop: false
      },

      signalChorusInteraction: {
        active: false,
        loopId: "none",
        stage: "inactive",
        stageIndex: 0,
        progress: 0,
        listenTrust: 0,
        answerStrength: 0,
        harmony: 0,
        bridgeWarmth: 0,
        forceRisk: 0,
        currentFocus: "none",
        focusDistance: 0,
        lastInteraction: "none",
        nextAction: "complete the second local cell morph first",
        preparedForNextBranch: false
      },
      thirdLocalCellMorph: {
        planId: "none",
        sourceCell: "none",
        destinationCell: "none",
        phase: "not_initialized",
        progress: 0,
        triggerReady: false,
        triggerReason: "none",
        nextAction: "none",
        triggerConfidence: 0,
        sourceLoopTuned: false,
        completed: false,
        noGate: true,
        continuousControl: true
      },
      bloomResidueArrival: {
        active: false,
        cellId: "none",
        arrivalAge: 0,
        arrivalClarity: 0,
        forkTrust: 0,
        residueMemory: 0,
        bloomPressure: 0,
        choiceWarmth: 0,
        sourceFade: 0,
        focusObjectId: "none",
        focusDistance: 0,
        lastAction: "none",
        nextAction: "complete the third local cell morph first",
        activeCellFocus: "not_bloom_residue",
        sourceSuppressed: false,
        readyForBloomLoop: false
      },
      bloomResidueInteraction: {
        active: false,
        loopId: "none",
        stage: "inactive",
        stageIndex: 0,
        progress: 0,
        residueMemory: 0,
        bloomCare: 0,
        braidWarmth: 0,
        warningRespect: 0,
        overgrowthRisk: 0,
        forkStability: 0,
        currentFocus: "none",
        focusDistance: 0,
        lastInteraction: "none",
        nextAction: "arrive in Bloom Residue Fork first",
        preparedForNextBranch: false
      },
      graveRouteMorph: {
        planId: "none",
        sourceCell: "none",
        destinationCell: "none",
        phase: "not_initialized",
        progress: 0,
        progressRate: 0,
        triggerReady: false,
        triggerReason: "none",
        nextAction: "stabilize Bloom Residue before the Grave route can form",
        triggerConfidence: 0,
        activeInSource: false,
        bloomPrepared: false,
        residueReady: false,
        stabilityReady: false,
        riskReady: false,
        compositionReady: false,
        focusReady: false,
        completed: false,
        noGate: true,
        continuousControl: true,
        interactionLoopActive: false
      },
      graveArrivalReadability: {
        pass: "HC-004E",
        active: false,
        cellId: "none",
        mode: "arrival_readability_before_interaction_loop",
        status: "inactive",
        arrivalAge: 0,
        arrivalClarity: 0,
        readConfidence: 0,
        currentFocus: "none",
        focusDistance: 0,
        huskMemoryRead: 0,
        siltSettled: 0,
        scarLockRead: 0,
        seedRemnantWarmth: 0,
        lastAction: "none",
        nextAction: "complete the Grave no-gate morph first",
        cameraBias: { active: false, reason: "inactive" },
        noGate: true,
        noDoor: true,
        noTeleport: true,
        noBranchMenu: true,
        noDialogueTree: true,
        noQuestLog: true,
        interactionLoopActive: false,
        fullGraveLoopDeferred: true
      },
      graveReadBeforeAbsorb: {
        pass: "HC-004F",
        active: false,
        loopId: "none",
        cellId: "none",
        stage: "inactive",
        stageIndex: 0,
        progress: 0,
        huskMemoryRead: 0,
        residueSiltSettled: 0,
        scarLockUnderstood: 0,
        seedRemnantWarmth: 0,
        recoilRisk: 0,
        safeAbsorbProgress: 0,
        safeAbsorbReady: false,
        safeMemoryTransferComplete: false,
        preparedForNextPass: false,
        currentFocus: "none",
        focusDistance: 0,
        focusRole: "none",
        lastInteraction: "none",
        nextAction: "arrive in the Grave bed and read first",
        safeTransferObject: "residue_silt_cloud_001",
        mustNotConsume: [
          "old_core_husk_memory_001",
          "scar_lock_plate_001",
          "inheritance_seed_remnant_001"
        ],
        noGate: true,
        noDoor: true,
        noTeleport: true,
        noBranchMenu: true,
        noDialogueTree: true,
        noQuestLog: true,
        noCombat: true,
        noNewRouteBranch: true
      },
      graveLoopStability: {
        pass: "HC-004G",
        active: false,
        planId: "none",
        sourceLoop: "none",
        cellId: "none",
        status: "inactive_no_exit_activation",
        stableSeconds: 0,
        minimumStableSeconds: 3.5,
        safeMemoryTransferComplete: false,
        protectedRemainsVisible: false,
        recoilSettled: false,
        recoilRisk: 0,
        forcingAbsorbAfterTransfer: false,
        planningReady: false,
        exitReadinessStatus: "inactive_no_exit_activation",
        nextAction: "complete Grave read-before-absorb first",
        nextPrototypeDeferredTo: "HC-004H",
        noGate: true,
        noDoor: true,
        noTeleport: true,
        noBranchMenu: true,
        noDialogueTree: true,
        noQuestLog: true,
        noCombat: true,
        noNewMorphActivation: true,
        noRuntimeExitActivation: true,
        noNewRouteBranch: true
      },

      graveExitReadiness: {
        pass: "HC-004H",
        active: false,
        prototypeId: "none",
        sourceStabilityPlan: "none",
        sourceLoop: "none",
        cellId: "none",
        focusObject: "none",
        status: "inactive_stability_not_ready",
        readinessSeconds: 0,
        minimumVisibleSeconds: 1.8,
        stableSourceReady: false,
        safeMemoryTransferComplete: false,
        protectedRemainsVisible: false,
        recoilSettled: false,
        recoilRisk: 0,
        forcedAbsorb: false,
        markerVisible: false,
        exitReadinessStatus: "inactive_stability_not_ready",
        nextAction: "complete Grave stability first",
        nextPrototypeDeferredTo: "HC-004I",
        noGate: true,
        noDoor: true,
        noTeleport: true,
        noBranchMenu: true,
        noDialogueTree: true,
        noQuestLog: true,
        noCombat: true,
        noNewMorphActivation: true,
        noRuntimeExitActivation: true,
        noNewRouteBranch: true,
        noPlayerRelocation: true,
        readoutOnly: true
      },

      graveRouteContinuityPlanning: {
        pass: "HC-004I",
        active: false,
        planId: "none",
        status: "not_loaded",
        sourceExitReadinessPrototype: "none",
        sourceCell: "none",
        chosenOptionId: "none",
        chosenOptionLabel: "none",
        plannedFutureCellId: "none",
        plannedFutureCellStatus: "none",
        readinessRemainsReadoutOnly: true,
        runtimeTransitionThisPass: false,
        playerRelocationThisPass: false,
        newRouteBranchThisPass: false,
        newMorphActivationThisPass: false,
        nextAction: "complete Grave exit-readiness first",
        nextRecommendedPass: "HC-004J",
        noGate: true,
        noDoor: true,
        noTeleport: true,
        noBranchMenu: true,
        noDialogueTree: true,
        noQuestLog: true,
        noCombat: true,
        noRuntimeExitActivation: true,
        noPlayerRelocation: true,
        planningOnly: true
      },

      graveScarMemorySeamArrivalPlanning: {
        pass: "HC-004L",
        active: false,
        planId: "none",
        status: "not_loaded",
        sourceCell: "none",
        plannedArrivalCell: "none",
        plannedArrivalCellStatus: "none",
        firstReadObject: "none",
        readabilityOrder: [],
        cameraPlan: { active: false, reason: "not_loaded" },
        hudStatus: "Seam Arrival Plan: not loaded",
        nextAction: "complete Grave route continuity planning first",
        runtimeTransitionThisPass: false,
        playerRelocationThisPass: false,
        newMorphActivationThisPass: false,
        targetFocusActivationThisPass: false,
        seamInteractionLoopThisPass: false,
        noGate: true,
        noDoor: true,
        noTeleport: true,
        noBranchMenu: true,
        noDialogueTree: true,
        noQuestLog: true,
        noCombat: true,
        planningOnly: true
      },

      graveScarMemorySeamRuntimeArrival: {
        pass: "HC-004M",
        active: false,
        planId: "none",
        status: "not_initialized",
        sourceCell: "none",
        destinationCell: "none",
        progress: 0,
        triggerReady: false,
        triggerReason: "none",
        nextAction: "complete Grave exit-readiness first",
        hudStatus: "Seam Arrival: waiting",
        destinationSpawned: false,
        completed: false,
        noGate: true,
        noDoor: true,
        noTeleport: true,
        noBranchMenu: true,
        noOldExitRegistry: true,
        noLegacyStageLoader: true,
        targetFocusActivation: false,
        seamInteractionLoopActive: false,
        noDialogueTree: true,
        noQuestLog: true,
        noCombat: true,
        playerRelocationMode: "none"
      },
      graveScarMemorySeamFirstRead: {
        pass: "HC-004N",
        active: false,
        loopId: "none",
        cellId: "none",
        stage: "inactive",
        stageIndex: 0,
        progress: 0,
        threadRead: 0,
        latticeRead: 0,
        echoRead: 0,
        sutureRead: 0,
        recoilRisk: 0,
        stableSeconds: 0,
        firstReadComplete: false,
        currentFocus: "none",
        focusDistance: 0,
        lastInteraction: "none",
        nextAction: "arrive in the scar-memory seam first",
        targetFocusActive: false,
        absorbBlocked: true,
        seamObjectsConsumed: false,
        closedInheritanceSutureOpened: false,
        runtimeExitActivation: false,
        newMorphActivation: false,
        routeBranchActivation: false,
        noGate: true,
        noDoor: true,
        noTeleport: true,
        noBranchMenu: true,
        noOldExitRegistry: true,
        noLegacyStageLoader: true,
        noDialogueTree: true,
        noQuestLog: true,
        noCombat: true
      },

      graveSeamContinuityMicroExit: {
        pass: "HC-004O",
        active: false,
        recipeId: "none",
        sourceCell: "none",
        destinationCell: "none",
        triggerObject: "none",
        stage: "inactive",
        progress: 0,
        progressRate: 0,
        ready: false,
        started: false,
        completed: false,
        triggerReason: "none",
        nextAction: "complete the seam first-read first",
        hudStatus: "Seam Micro-Exit: waiting",
        triggerConfidence: 0,
        activeInSource: false,
        activeInDestination: false,
        firstReadComplete: false,
        closedSutureVisible: false,
        noAbsorbHeld: true,
        pulsePressed: false,
        focusReady: false,
        playerRelocationMode: "none",
        microExitPrototypeActive: false,
        legacyExitArchitecture: false,
        oldExitRegistry: false,
        noGate: true,
        noDoor: true,
        noTeleport: true,
        noBranchMenu: true,
        noOldExitRegistry: true,
        noLegacyStageLoader: true,
        noNewMorphActivation: true,
        noNewRouteBranch: true,
        noDialogueTree: true,
        noQuestLog: true,
        noCombat: true,
        seamObjectsConsumed: false,
        closedInheritanceSutureOpened: false
      },

      graveReturnContinuity: {
        pass: "HC-005A",
        active: false,
        id: "none",
        sourceCellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
        destinationCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
        stage: "waiting_for_grave_route_lock",
        status: "waiting_for_grave_route_lock",
        progress: 0,
        ready: false,
        completed: false,
        routeAwarenessRestored: false,
        graveRouteRemainsLocked: false,
        movementRequired: true,
        targetRequired: false,
        inputRequired: true,
        currentFocus: "return_current_mouth",
        focusObjectId: "return_current_mouth",
        entryDistance: 0,
        pathDistance: 0,
        pathProgress: 0,
        hudStatus: "Grave Return: waiting",
        guideLine: "The return current has not formed.",
        objectiveLine: "Complete and lock the Grave memory route first.",
        nextAction: "Complete and lock the Grave memory route first.",
        noGate: true,
        noDoor: true,
        noTeleport: true,
        noBranchMenu: true,
        playerRelocation: false
      },

      signalChorusReturnState: {
        pass: "HC-005B",
        active: false,
        id: "SIGNAL_CHORUS_RETURN_STATE_HC005B",
        stage: "waiting_for_verified_return_handoff",
        status: "waiting_for_verified_return_handoff",
        progress: 0,
        ready: false,
        completed: false,
        handoffComplete: false,
        sourceCellId: "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
        destinationCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
        activeCellConfirmed: false,
        routeAwarenessRestored: false,
        graveRouteRemainsLocked: false,
        oldGraveOwnersRelinquished: false,
        oldSignalLoopSuppressed: false,
        targetRequired: false,
        inputRequired: false,
        movementRequired: false,
        currentFocus: "none",
        focusObjectId: "none",
        hudStatus: "Signal Chorus Return: waiting",
        guideLine: "Complete the return before the Chorus can hold the reading.",
        objectiveLine: "Follow the Grave return current to Signal Chorus.",
        nextAction: "Complete the HC-005A return current.",
        blocker: "none_detected"
      },



      hubChamberFoundation: {
        pass: "HC-006JA",
        id: "HUB_CHAMBER_PRESENTATION_LOCK_HC006JA",
        active: false,
        stage: "hub_foundation_inactive",
        status: "inactive",
        progress: 0,
        ready: false,
        completed: false,
        regionId: "hub_chamber",
        activeRouteId: "grave_memory_route",
        routeCount: 3,
        activeRouteCount: 1,
        dormantRouteCount: 2,
        centralAnchorReadable: false,
        threeRouteLayoutReadable: false,
        firstMemoryFragmentReadable: false,
        activeRouteIdentityDistinguished: false,
        targetRequired: false,
        inputRequired: false,
        movementRequired: false,
        nextAction: "Reach the Hub Chamber route-awareness junction."
      },

      hubInvestigationGameplay: {
        pass: "HC-007C",
        id: "HUB_INVESTIGATION_GAMEPLAY_HC007C",
        active: false,
        status: "inactive",
        progress: 0,
        systemicPlay: false,
        routeReadCount: 0,
        routeCount: 3,
        routeReads: [],
        allRoutesRead: false,
        memoryRead: false,
        returnedToCenter: false,
        investigationReady: false,
        statusPageTriggerPreserved: true,
        graveGateTriggerPreserved: true,
        directObjectiveCompletion: false,
        dormantRoutesOpened: false,
        nextAction: "Reach the Hub Chamber junction."
      },

      signalChorusLayeredInteraction: {
        pass: "HC-006B",
        id: "SIGNAL_CHORUS_LAYERED_INTERACTION_HC006B",
        active: false,
        stage: "waiting_for_living_signal_chorus",
        stageIndex: 0,
        status: "waiting",
        progress: 0,
        ready: false,
        completed: false,
        currentFocus: "none",
        focusObjectId: "none",
        focusDistance: 0,
        targetRequired: false,
        inputRequired: false,
        movementRequired: false,
        expectsPulse: false,
        expectsHold: false,
        expectsRelease: false,
        cadenceMatches: 0,
        cadenceMisses: 0,
        resonanceHold: 0,
        tissueResponse: 0,
        settleProgress: 0,
        routeActivated: false,
        thresholdOpened: false,
        activeCellChanges: false,
        nextAction: "Wait for the living Signal Chorus state."
      },

      signalChorusNextRoutePressure: {
        pass: "HC-005D",
        id: "SIGNAL_CHORUS_NEXT_ROUTE_PRESSURE_HC005D",
        active: false,
        stage: "waiting_for_signal_return_hold",
        status: "waiting_for_signal_return_hold",
        progress: 0,
        ready: false,
        completed: false,
        sourceCellId: "CELL_SIGNAL_CHORUS_NERVE_001",
        pressureId: "combward_resonance_pressure_001",
        currentFocus: "none",
        focusObjectId: "none",
        targetRequired: false,
        inputRequired: false,
        movementRequired: false,
        routeActivated: false,
        thresholdOpened: false,
        activeCellChanges: false,
        hudStatus: "Next Route Pressure: waiting",
        guideLine: "The returned reading must settle first.",
        objectiveLine: "Hold the returned Grave reading at Signal Chorus.",
        nextAction: "Complete the Signal Chorus return hold.",
        blocker: "none_detected",
        targetingSuppressed: true,
        noGate: true,
        noDoor: true,
        noTeleport: true,
        noBranchMenu: true,
        noNewMorphActivation: true,
        noNewRouteBranch: true
      },

      graveBedPostSeamResponse: {
        pass: "HC-004P",
        active: false,
        recipeId: "none",
        cellId: "none",
        stage: "inactive",
        stageIndex: 0,
        progress: 0,
        huskAcknowledged: 0,
        scarResealed: 0,
        seedWarmth: 0,
        recoilRisk: 0,
        stableSeconds: 0,
        currentFocus: "none",
        focusRole: "none",
        lastInteraction: "none",
        nextAction: "return from the seam before the Grave bed can answer",
        hudStatus: "Grave Bed: waiting for seam return",
        microExitComplete: false,
        protectedRemainsVisible: false,
        noAbsorbHeld: true,
        completed: false,
        responseComplete: false,
        runtimeExitActivation: false,
        newMorphActivation: false,
        newRouteBranch: false,
        combat: false,
        dialogueTree: false,
        questLog: false,
        protectedRemainsConsumed: false,
        inheritanceSeedRemnantOpened: false,
        noGate: true,
        noDoor: true,
        noTeleport: true,
        noBranchMenu: true,
        noOldExitRegistry: true,
        noLegacyStageLoader: true,
        noCombat: true,
        noDialogueTree: true,
        noQuestLog: true
      },
      localCellMorph: {
        planId: "none",
        sourceCell: "none",
        destinationCell: "none",
        phase: "not_initialized",
        progress: 0,
        triggerReady: false,
        triggerReason: "none",
        nextAction: "none",
        triggerConfidence: 0,
        noGate: true,
        continuousControl: true,
        destinationSpawned: false,
        completed: false,
        readabilityPass: "HC-002D"
      }
    };
  }

  async start() {
    await this.loadRecipeData();

    this.createRenderer();
    this.createScene();
    this.createVisualSystems();
    this.createHostChemistryVisualSlice();
    this.createGameplaySystems();
    this.createChemistrySystems();
    this.createMorphSystems();
    this.createEntitySystems();
    this.createOrbiterSystems();
    this.createTargetingSystems();
    this.createFirstSliceArchitecture();
    this.createOpeningPacingSystems();
    this.createCinematicSystems();
    this.createDebugSystems();
    this.registerRuntimeSystems();
    this.createTransitionCoordinator();

    this.isRunning = true;
    this.renderer.setAnimationLoop(() => this.tick());
    this.scheduleDeferredDebugPanels();
  }

  scheduleDeferredDebugPanels() {
    const load = async () => {
      try {
        const [{ RecipeDebugOverlay }, { ChemistryDebugPanel }] = await Promise.all([
          import("../debug/RecipeDebugOverlay.js"),
          import("../debug/ChemistryDebugPanel.js")
        ]);

        if (!this.registry.has("recipeDebugOverlay")) {
          this.registry.register(
            "recipeDebugOverlay",
            new RecipeDebugOverlay({ frameState: this.frameState }),
            { allowUpdateError: true }
          );
        }
        if (!this.registry.has("chemistryDebugPanel")) {
          this.registry.register(
            "chemistryDebugPanel",
            new ChemistryDebugPanel({ frameState: this.frameState }),
            { allowUpdateError: true }
          );
        }
        this.frameState.deferredDebugPanels = {
          pass: "HC-014B",
          status: "loaded_after_first_render",
          registered: true
        };
      } catch (error) {
        this.frameState.deferredDebugPanels = {
          pass: "HC-014B",
          status: "load_failed",
          registered: false,
          error: error?.message ?? String(error)
        };
        console.warn("[GameRuntime] Deferred debug panels failed to load:", error);
      }
    };

    this.frameState.deferredDebugPanels = {
      pass: "HC-014B",
      status: "scheduled",
      registered: false
    };

    if (typeof globalThis.requestIdleCallback === "function") {
      globalThis.requestIdleCallback(() => void load(), { timeout: 1200 });
    } else {
      globalThis.setTimeout(() => void load(), 180);
    }
  }

  async loadRecipeData() {
    await this.recipeDataSystem.loadAll();

    this.placeholderValidator = new PlaceholderValidator({
      recipeDataSystem: this.recipeDataSystem,
      currentPass: this.buildId
    });

    this.placeholderValidator.validateAll();

    this.frameState.recipeCounts = this.recipeDataSystem.getCounts();
    this.frameState.buildManifest = this.recipeDataSystem.data.buildManifest;
    this.frameState.schemaValidationReport = this.recipeDataSystem.data.schemaValidationReport;
    this.frameState.placeholderStatus = this.placeholderValidator.getStatusReport();
    this.frameState.lockState = this.recipeDataSystem.data.lockState;
    this.frameState.blueprintTranslation = this.createBlueprintTranslationState(
      this.recipeDataSystem.data.blueprintTranslationLayer
    );
    this.frameState.firstRouteChoicePlanning = this.createFirstRouteChoicePlanningState(
      this.recipeDataSystem.data.firstRouteChoicePlanning
    );
    this.frameState.placeholderVisualTriage = this.createPlaceholderVisualTriageState(
      this.recipeDataSystem.data.placeholderVisualTriage,
      this.recipeDataSystem.data.p0VisualLockReplacements
    );
    this.frameState.controllerOnboarding = this.createControllerOnboardingState(
      this.recipeDataSystem.data.controllerOnboardingTuning
    );
    this.frameState.firstMinuteVisualReadabilityPolish = this.createFirstMinuteVisualReadabilityPolishState(
      this.recipeDataSystem.data.firstMinuteVisualReadabilityPolish
    );
    const runtimeProfile = this.recipeDataSystem.data.firstSliceRuntimeProfile;
    this.frameState.compatibilityArchive = {
      pass: "HC-012A",
      referenceBuild: runtimeProfile?.archivePolicy?.referenceBuild ?? "HC-008G",
      sourceAndAuthoredDataRetained: Boolean(runtimeProfile?.archivePolicy?.sourceAndAuthoredDataRetained),
      registeredDuringFirstSliceBoot: false,
      initializedDuringFirstSliceBoot: false,
      updatedDuringFirstSliceBoot: false,
      dormantSystemIds: [...(runtimeProfile?.dormantCompatibilitySystemIds ?? [])],
      dormantSystemCount: runtimeProfile?.dormantCompatibilitySystemIds?.length ?? 0,
      reactivationRule: runtimeProfile?.archivePolicy?.reactivationRule ?? "later_milestone_only",
      status: "retained_reference_not_active_runtime"
    };

    const host = this.recipeDataSystem.get(
      "hosts",
      "HOST_ALPHA_WOUNDED_NURSERY"
    );

    const cell = this.recipeDataSystem.get(
      "localCellRecipes",
      "CELL_MEMBRANE_NURSERY_001"
    );

    this.localCellRecipe = cell;
    this.frameState.activeHostId = host.id;
    this.frameState.activeCellId = cell.id;

    this.frameState.chemistry = {
      form: cell.chemistryField.form,
      flux: cell.chemistryField.flux,
      scar: cell.chemistryField.scar,
      seed: cell.chemistryField.seed,
      signal: cell.chemistryField.signal
    };

    const flowVector = cell.physicalFeel.flowVector ?? [0, 0, 0];
    this.frameState.physicalFeel = {
      viscosity: cell.physicalFeel.viscosity,
      pressure: cell.physicalFeel.pressure,
      flowVector: {
        x: flowVector[0] ?? 0,
        y: flowVector[1] ?? 0,
        z: flowVector[2] ?? 0
      },
      boundaryBehavior: cell.physicalFeel.boundaryBehavior
    };
  }

  createBlueprintTranslationState(layer) {
    return {
      pass: "HC-003M",
      active: Boolean(layer),
      primaryReference: layer?.primaryReference ?? HOST_CORE_SOURCE_AUTHORITY.sourcePackage,
      translationRule: layer?.translationRule ?? "Function maps across; old chambers/gates do not return.",
      activeCellRole: "pending_active_cell",
      activeBlueprintRole: "pending_active_cell",
      firstPlayableMinute: layer?.firstPlayableMinute ?? null,
      localCellToBlueprintRole: layer?.localCellToBlueprintRole ?? [],
      legacyBlueprintRoleMap: layer?.legacyBlueprintRoleMap ?? [],
      legacyRuntimeWarning: layer?.debugReadout?.warning ?? "Blueprint role mapping is not permission to revive old gates/chambers.",
      nextRecommendedPass: layer?.nextRecommendedPass ?? null
    };
  }

  createPlaceholderVisualTriageState(triage, p0VisualLock = null) {
    if (!triage) {
      return {
        pass: "HC-003M",
        active: false,
        visualLockFirst: [],
        p0VisualLockCompleted: [],
        p0LockedCount: 0,
        prototypeAcceptedGroups: [],
        nextRecommendedPass: "HC-003N Opening Slice Gold Candidate"
      };
    }

    const completed = triage.p0VisualLockCompleted ?? p0VisualLock?.lockedReplacements ?? [];

    return {
      pass: triage.pass ?? "HC-003JA",
      active: true,
      status: triage.currentVisualStatus?.triageDecision ?? "triage loaded",
      totalPlaceholders: triage.currentVisualStatus?.totalPlaceholders ?? 0,
      expiredPlaceholders: triage.currentVisualStatus?.expiredPlaceholders ?? 0,
      blockerForFutureVisualLock: Boolean(triage.currentVisualStatus?.blockerForFutureVisualLock),
      visualLockFirst: triage.visualLockRequiredFirst ?? [],
      p0VisualLockCompleted: completed,
      p0LockedCount: completed.filter((entry) => entry.status === "p0_locked").length,
      prototypeAcceptedGroups: triage.prototypeAcceptedForNow ?? [],
      nextRecommendedPass: triage.nextRecommendedPass ?? "HC-003M Opening Slice Gold Candidate"
    };
  }

  createFirstRouteChoicePlanningState(plan) {
    const route = plan?.recommendedFirstRoute ?? {};

    return {
      pass: "HC-004A",
      active: Boolean(plan),
      status: plan?.status ?? "not_loaded",
      planningRule: plan?.planningRule ?? "Plan route pressure before runtime.",
      recommendedRouteId: route.id ?? "none",
      recommendedRouteLabel: route.label ?? "none",
      routeStatus: route.status ?? "none",
      firstRouteQuestion: route.firstRouteQuestion ?? "none",
      hostAnatomySources: route.hostAnatomySources ?? [],
      dominantDomains: route.dominantDomains ?? [],
      playerLearningGoals: route.playerLearningGoals ?? [],
      mustNotBuildYet: route.mustNotBuildYet ?? [],
      alternatives: plan?.alternativeRoutePressures ?? [],
      nextPassRecommendation: plan?.nextPassRecommendation ?? null
    };
  }


  createGraveRouteRuntimePlanningState(plan) {
    const route = plan?.selectedRoute ?? {};
    const plannedCell = plan?.plannedLocalCell ?? {};
    return {
      pass: "HC-004A",
      active: Boolean(plan),
      status: plan?.status ?? "not_loaded",
      selectedRouteId: route.id ?? "none",
      selectedRouteLabel: route.label ?? "none",
      routeQuestion: route.routeQuestion ?? "none",
      plannedCellId: plannedCell.id ?? "none",
      plannedCellStatus: plannedCell.status ?? "none",
      dominantDomains: plan?.chemicalPlan?.dominantDomains ?? [],
      hostAnatomySources: (plan?.hostAnatomySources ?? []).map((entry) => entry.id ?? entry),
      plannedChemObjects: (plan?.plannedChemObjects ?? []).map((entry) => entry.id),
      entryMode: plan?.plannedRuntimeEntry?.mode ?? "none",
      runtimeActive: false,
      noGates: true,
      noBranchMenu: true,
      nextRecommendedPass: plan?.nextRecommendedPass?.id
        ? `${plan.nextRecommendedPass.id} ${plan.nextRecommendedPass.label}`
        : null
    };
  }


  createGraveRouteContinuityPlanningState(plan) {
    const selected = (plan?.candidateContinuityOptions ?? []).find((entry) =>
      entry.id === plan?.continuityDecision?.chosenOptionId
    ) ?? {};
    return {
      pass: "HC-004I",
      active: Boolean(plan),
      planId: plan?.id ?? "none",
      status: plan?.status ?? "not_loaded",
      sourceExitReadinessPrototype: plan?.sourceExitReadinessPrototype ?? "none",
      sourceCell: plan?.sourceCell ?? "none",
      sourceRoute: plan?.sourceRoute ?? "none",
      chosenOptionId: plan?.continuityDecision?.chosenOptionId ?? "none",
      chosenOptionLabel: plan?.continuityDecision?.chosenOptionLabel ?? "none",
      plannedFutureCellId: selected.plannedFutureCellId ?? plan?.plannedNextPrototype?.plannedFutureCellId ?? "none",
      plannedFutureCellStatus: selected.plannedFutureCellStatus ?? "none",
      readinessRemainsReadoutOnly: Boolean(plan?.continuityRules?.keepExitReadinessReadoutOnly),
      runtimeTransitionThisPass: Boolean(plan?.continuityRules?.runtimeTransitionThisPass),
      playerRelocationThisPass: Boolean(plan?.continuityRules?.playerRelocationThisPass),
      newRouteBranchThisPass: Boolean(plan?.continuityRules?.newRouteBranchThisPass),
      newMorphActivationThisPass: Boolean(plan?.continuityRules?.newMorphActivationThisPass),
      nextAction: plan?.hudLanguage?.readinessMeaning ?? "The scar lock points toward a later seam, not a doorway in this pass.",
      nextRecommendedPass: plan?.nextRecommendedPass?.id ?? "HC-004J",
      noGate: true,
      noDoor: true,
      noTeleport: true,
      noBranchMenu: true,
      noDialogueTree: true,
      noQuestLog: true,
      noCombat: true,
      noRuntimeExitActivation: true,
      noPlayerRelocation: true,
      planningOnly: true
    };
  }


  createGraveScarMemorySeamArrivalPlanningState(plan) {
    const rules = plan?.arrivalReadabilityRules ?? {};
    const language = plan?.playerFacingLanguage ?? {};
    return {
      pass: "HC-004L",
      active: Boolean(plan),
      planId: plan?.id ?? "none",
      status: plan?.status ?? "not_loaded",
      sourceContinuityPlan: plan?.sourceContinuityPlan ?? "none",
      sourceRecipePack: plan?.sourceRecipePack ?? "none",
      sourceVisualComposerSupport: plan?.sourceVisualComposerSupport ?? "none",
      sourceCell: plan?.sourceCell ?? "none",
      plannedArrivalCell: plan?.plannedArrivalCell ?? "none",
      plannedArrivalCellStatus: plan?.plannedArrivalCellStatus ?? "none",
      firstReadObject: plan?.arrivalPosture?.firstReadObject ?? "none",
      readabilityOrder: plan?.arrivalPosture?.readabilityOrder ?? [],
      carryForwardProtectedRemains: plan?.arrivalPosture?.mustCarryForward ?? [],
      safeTransferMemory: plan?.arrivalPosture?.safeTransferMemory ?? "none",
      cameraPlan: plan?.arrivalCameraPlan ? {
        active: true,
        mode: plan.arrivalCameraPlan.mode ?? "planned_close_low_suture_read",
        yaw: plan.arrivalCameraPlan.yaw ?? -0.18,
        pitch: plan.arrivalCameraPlan.pitch ?? 0.46,
        distance: plan.arrivalCameraPlan.distance ?? 7.25,
        lift: plan.arrivalCameraPlan.lift ?? 0.28,
        blendStrength: plan.arrivalCameraPlan.blendStrength ?? 1.15,
        reason: plan.arrivalCameraPlan.reason ?? "planned seam arrival camera only"
      } : { active: false, reason: "not_loaded" },
      hudStatus: language.hudStatus ?? "Seam Arrival Plan: readable / no transition",
      guideLine: language.guideLine ?? "The seam can be imagined now, but not entered.",
      objectiveLine: language.objectiveLine ?? "Arrival into the seam is planned, not active.",
      nextAction: language.nextAction ?? "Keep the scar lock readable. No movement to the seam exists in HC-004L.",
      runtimeTransitionThisPass: Boolean(rules.runtimeTransitionThisPass),
      playerRelocationThisPass: Boolean(rules.playerRelocationThisPass),
      newMorphActivationThisPass: Boolean(rules.newMorphActivationThisPass),
      targetFocusActivationThisPass: Boolean(rules.targetFocusActivationThisPass),
      seamInteractionLoopThisPass: Boolean(rules.seamInteractionLoopThisPass),
      requiresSeamCellAuthoredInactive: Boolean(rules.requiresSeamCellAuthoredInactive),
      noGate: true,
      noDoor: true,
      noTeleport: true,
      noBranchMenu: true,
      noDialogueTree: true,
      noQuestLog: true,
      noCombat: true,
      noRuntimeExitActivation: true,
      noPlayerRelocation: true,
      planningOnly: true,
      nextRecommendedPass: plan?.nextRecommendedPass?.id ?? "HC-004M"
    };
  }


  createGraveScarMemorySeamRuntimeArrivalState(plan) {
    const language = plan?.playerFacingLanguage ?? {};
    return {
      pass: "HC-004M",
      active: Boolean(plan),
      planId: plan?.id ?? "none",
      status: plan?.status ?? "not_loaded",
      sourceArrivalPlanning: plan?.sourceArrivalPlanning ?? "none",
      sourceCell: plan?.sourceCell ?? "none",
      destinationCell: plan?.destinationCell ?? "none",
      mode: plan?.arrivalPrototype?.mode ?? "slow_no_gate_continuity_pull",
      durationSeconds: plan?.arrivalPrototype?.durationSeconds ?? 5.4,
      triggerReady: false,
      triggerReason: "waiting_for_grave_exit_readiness",
      nextAction: language.nextActionReady ?? "Pulse the visible scar-readiness marker. Do not hold absorb.",
      hudStatus: "Seam Arrival: waiting for Grave readiness",
      destinationSpawned: false,
      completed: false,
      cameraPlan: plan?.cameraPlan ? {
        active: true,
        mode: plan.cameraPlan.mode ?? "runtime_close_low_suture_arrival",
        yaw: plan.cameraPlan.yaw ?? -0.24,
        pitch: plan.cameraPlan.pitch ?? 0.50,
        distance: plan.cameraPlan.distance ?? 7.05,
        lift: plan.cameraPlan.lift ?? 0.36,
        blendStrength: plan.cameraPlan.blendStrength ?? 1.38
      } : { active: false, reason: "not_loaded" },
      noGate: true,
      noDoor: true,
      noTeleport: true,
      noBranchMenu: true,
      noOldExitRegistry: true,
      noLegacyStageLoader: true,
      targetFocusActivation: false,
      seamInteractionLoopActive: false,
      noDialogueTree: true,
      noQuestLog: true,
      noCombat: true,
      playerRelocationMode: "smooth_continuity_arrival_pull_after_start"
    };
  }


  createFirstMinuteVisualReadabilityPolishState(polish) {
    return {
      pass: "HC-003M",
      active: Boolean(polish),
      status: polish ? "first_minute_visual_polish_loaded" : "not_loaded",
      requiredChain: polish?.requiredChain ?? [],
      optionalBeyondMinuteFork: polish?.optionalBeyondMinuteFork ?? "CELL_BLOOM_RESIDUE_FORK_001",
      visualTargets: (polish?.visualTargets ?? []).map((target) => ({
        id: target.id,
        role: target.role,
        status: target.status
      })),
      hudRules: polish?.hudReadabilityRules ?? [],
      nextRecommendedPass: polish?.nextRecommendedPass ?? "HC-003N Opening Slice Gold Candidate",
      noNewContent: true,
      noGates: true
    };
  }

  createControllerOnboardingState(tuning) {
    return {
      pass: "HC-003M",
      active: Boolean(tuning),
      mode: tuning?.mode ?? "first_playable_minute_controller_comfort",
      primaryReference: tuning?.primaryReference ?? HOST_CORE_SOURCE_AUTHORITY.sourcePackage,
      tuning: tuning ? {
        deadZones: tuning.deadZones ?? {},
        responseCurves: tuning.responseCurves ?? {},
        movement: tuning.movement ?? {},
        camera: tuning.camera ?? {},
        absorbAssist: tuning.absorbAssist ?? {},
        targeting: tuning.targeting ?? {},
        pulseFeedback: tuning.pulseFeedback ?? {}
      } : null,
      device: {
        activeDevice: "keyboard",
        gamepadActive: false,
        gamepadName: "none",
        keyboardActive: false
      },
      comfortStage: "not_started",
      statusLine: tuning ? "controller comfort tuning loaded" : "controller comfort tuning missing",
      noNewContent: true,
      noGates: true,
      nextRecommendedPass: tuning?.nextRecommendedPass ?? "HC-003M Opening Slice Gold Candidate"
    };
  }


  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.appRoot.innerHTML = "";
    this.appRoot.appendChild(this.renderer.domElement);

    window.addEventListener("resize", () => this.resize());
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07080d);
    this.scene.fog = new THREE.FogExp2(0x07080d, 0.045);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(0, 2.4, 8.4);
    this.camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 0.36);
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.05);
    key.position.set(4, 8, 6);
    this.scene.add(key);

    const nurseryGlow = new THREE.PointLight(0xffb36a, 1.2, 18);
    nurseryGlow.position.set(0, 1.2, 2.5);
    this.scene.add(nurseryGlow);
  }

  createVisualSystems() {
    this.visualRecipeRegistry = new VisualRecipeRegistry({
      recipeDataSystem: this.recipeDataSystem
    });

    this.visualComposer = new VisualComposer({
      scene: this.scene,
      visualRecipeRegistry: this.visualRecipeRegistry,
      placeholderValidator: this.placeholderValidator
    });

    this.motionSignatureSystem = new MotionSignatureSystem({
      visualComposer: this.visualComposer,
      frameState: this.frameState
    });
  }

  createHostChemistryVisualSlice() {
    this.visualComposer.compose({
      objectId: "host_alpha_distant_silhouette_001",
      visualRecipeId: "host_alpha_distant_silhouette_v01",
      position: [0.9, 2.8, -26],
      scale: 2.2
    });

    this.visualComposer.compose({
      objectId: "membrane_pocket_surface_001",
      visualRecipeId: "membrane_pocket_surface_v01",
      position: [0, 0, 0],
      scale: 1
    });

    this.visualComposer.compose({
      objectId: "nursery_soft_pressure_fog_001",
      visualRecipeId: "nursery_soft_pressure_fog_v01",
      position: [0, 0, 0],
      scale: 1
    });

    this.playerCore = this.visualComposer.compose({
      objectId: "debug_player_core_001",
      visualRecipeId: "player_seed_core_stage_01",
      placeholderRecipeId: "debug_player_core_001",
      position: [0, 0, 0],
      scale: 0.82
    });

    this.frameState.selectedObject = this.playerCore.userData;

    this.cameraReadabilitySystem = new CameraReadabilitySystem({
      camera: this.camera,
      playerRoot: this.playerCore,
      visualComposer: this.visualComposer,
      frameState: this.frameState
    });
  }

  createGameplaySystems() {
    this.inputSystem = new InputSystem();
    this.deliberateCommitmentSystem = new DeliberateCommitmentSystem({ frameState: this.frameState });
    this.controllerComfortSystem = new ControllerComfortSystem({
      recipeDataSystem: this.recipeDataSystem,
      frameState: this.frameState
    });
    this.hostContactShelfSystem = new HostContactShelfSystem({
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.coreSurfaceTruthSystem = new CoreSurfaceTruthSystem({
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.playerMovementController = new PlayerMovementController({
      playerRoot: this.playerCore,
      camera: this.camera,
      frameState: this.frameState,
      localCellRecipe: this.localCellRecipe
    });
    this.coreEngineSystem = new CoreEngineSystem({
      frameState: this.frameState,
      playerRoot: this.playerCore
    });
    this.coreRadialPerformanceSystem = new CoreRadialPerformanceSystem({
      frameState: this.frameState,
      playerRoot: this.playerCore
    });
    this.coreTopologyResonanceSystem = new CoreTopologyResonanceSystem({
      frameState: this.frameState
    });
    this.coreTopologyEnvironmentalHandlingSystem = new CoreTopologyEnvironmentalHandlingSystem({
      frameState: this.frameState
    });
    this.coreTopologyVerbCharacterSystem = new CoreTopologyVerbCharacterSystem({
      frameState: this.frameState
    });
    this.coreEmbodimentSystem = new CoreEmbodimentSystem({
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.coreTendrilSurfaceContactSystem = new CoreTendrilSurfaceContactSystem({
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.stabilizedProjectionSystem = new StabilizedProjectionSystem({
      frameState: this.frameState
    });

    this.coreVerbPhysicalizationSystem = new CoreVerbPhysicalizationSystem({
      scene: this.scene,
      playerRoot: this.playerCore,
      chemObjectSystem: this.chemObjectSystem,
      frameState: this.frameState
    });

    this.hostRhythmSystem = new HostRhythmSystem({ frameState: this.frameState });
    this.regionalPhysicalEmbodimentSystem = new RegionalPhysicalEmbodimentSystem({ frameState: this.frameState });
    this.liftFieldReadabilitySystem = new LiftFieldReadabilitySystem({
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.coreWorldResonanceSystem = new CoreWorldResonanceSystem({ frameState: this.frameState });
    this.coreVerbEngineCouplingSystem = new CoreVerbEngineCouplingSystem({ frameState: this.frameState });
    this.eventAnchoredHostAudioSystem = new EventAnchoredHostAudioSystem({
      frameState: this.frameState,
      camera: this.camera,
      playerRoot: this.playerCore
    });
    this.ambientMaterialInteractionSystem = new AmbientMaterialInteractionSystem({
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });

    this.interactionCompositionSystem = new InteractionCompositionSystem({
      frameState: this.frameState
    });
    this.verbCompositionSystem = new VerbCompositionSystem({ frameState: this.frameState });
  }

  createChemistrySystems() {
    this.chemObjectSystem = new ChemObjectSystem({
      recipeDataSystem: this.recipeDataSystem,
      visualComposer: this.visualComposer,
      playerRoot: this.playerCore,
      localCellRecipe: this.localCellRecipe,
      frameState: this.frameState
    });

    this.reactiveStateGrammarSystem = new ReactiveStateGrammarSystem({
      frameState: this.frameState,
      chemObjectSystem: this.chemObjectSystem
    });

    this.bondSystem = new BondSystem({
      recipeDataSystem: this.recipeDataSystem,
      chemObjectSystem: this.chemObjectSystem,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });

    this.coreSensoryResponseSystem = new CoreSensoryResponseSystem({
      frameState: this.frameState,
      playerRoot: this.playerCore,
      chemObjectSystem: this.chemObjectSystem
    });

    // HC027D dependency correction: CoreVerbPhysicalizationSystem is created with
    // the gameplay systems before chemistry exists. Rebind the live chemistry owner
    // once it has been constructed so Absorb/Stabilize presentation can resolve targets.
    if (this.coreVerbPhysicalizationSystem) {
      this.coreVerbPhysicalizationSystem.chemObjectSystem = this.chemObjectSystem;
    }

    this.coreGrowthSystem = new CoreGrowthSystem({
      recipeDataSystem: this.recipeDataSystem,
      chemObjectSystem: this.chemObjectSystem,
      playerRoot: this.playerCore,
      frameState: this.frameState,
      embodimentSystem: this.coreEmbodimentSystem
    });
  }

  createMorphSystems() {
    this.localCellMorphSystem = new LocalCellMorphSystem({
      recipeDataSystem: this.recipeDataSystem,
      visualComposer: this.visualComposer,
      chemObjectSystem: this.chemObjectSystem,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });

    this.morphReadabilitySystem = new MorphReadabilitySystem({
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });

    this.morphCompletionSystem = new MorphCompletionSystem({
      recipeDataSystem: this.recipeDataSystem,
      chemObjectSystem: this.chemObjectSystem,
      playerRoot: this.playerCore,
      scene: this.scene,
      frameState: this.frameState
    });

    this.scarFlowArrivalSystem = new ScarFlowArrivalSystem({
      visualComposer: this.visualComposer,
      chemObjectSystem: this.chemObjectSystem,
      playerRoot: this.playerCore,
      scene: this.scene,
      frameState: this.frameState
    });

    this.guideThresholdGameplaySystem = new GuideThresholdGameplaySystem({
      recipeDataSystem: this.recipeDataSystem,
      chemObjectSystem: this.chemObjectSystem,
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });

    this.guideThresholdLayeredInteractionSystem = new GuideThresholdLayeredInteractionSystem({
      recipeDataSystem: this.recipeDataSystem,
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });

    this.scarFlowInteractionSystem = new ScarFlowInteractionSystem({
      recipeDataSystem: this.recipeDataSystem,
      chemObjectSystem: this.chemObjectSystem,
      playerRoot: this.playerCore,
      scene: this.scene,
      frameState: this.frameState
    });

    this.secondLocalCellMorphSystem = new SecondLocalCellMorphSystem({
      recipeDataSystem: this.recipeDataSystem,
      visualComposer: this.visualComposer,
      chemObjectSystem: this.chemObjectSystem,
      playerRoot: this.playerCore,
      scene: this.scene,
      frameState: this.frameState
    });

    this.inspectionCameraSystem = new InspectionCameraSystem({
      recipeDataSystem: this.recipeDataSystem,
      frameState: this.frameState,
      playerRoot: this.playerCore
    });

    this.inspectionOcclusionSystem = new InspectionOcclusionSystem({
      scene: this.scene
    });
  }

  createEntitySystems() {
    this.entitySystem = new EntitySystem({
      recipeDataSystem: this.recipeDataSystem,
      visualComposer: this.visualComposer,
      playerRoot: this.playerCore,
      localCellRecipe: this.localCellRecipe,
      frameState: this.frameState
    });
    this.responsePersonalitySystem = new ResponsePersonalitySystem({
      frameState: this.frameState,
      chemObjectSystem: this.chemObjectSystem,
      entitySystem: this.entitySystem
    });
    this.entityRelationshipGrammarSystem = new EntityRelationshipGrammarSystem({
      entitySystem: this.entitySystem,
      frameState: this.frameState
    });
    this.entityReciprocalMemorySystem = new EntityReciprocalMemorySystem({
      entitySystem: this.entitySystem,
      frameState: this.frameState
    });
    this.entityReciprocalBehaviorSystem = new EntityReciprocalBehaviorSystem({
      entitySystem: this.entitySystem,
      frameState: this.frameState
    });
    this.entityEcologyResonanceSystem = new EntityEcologyResonanceSystem({
      entitySystem: this.entitySystem,
      frameState: this.frameState
    });
    this.entityLocalMatterCouplingSystem = new EntityLocalMatterCouplingSystem({
      entitySystem: this.entitySystem,
      frameState: this.frameState
    });
    this.entityEcologicalResidueSystem = new EntityEcologicalResidueSystem({
      entitySystem: this.entitySystem,
      frameState: this.frameState
    });
    this.entityResidueRecognitionSystem = new EntityResidueRecognitionSystem({
      entitySystem: this.entitySystem,
      frameState: this.frameState
    });
    this.entityEcologicalCrossInfluenceSystem = new EntityEcologicalCrossInfluenceSystem({
      entitySystem: this.entitySystem,
      frameState: this.frameState
    });
  }

  createOrbiterSystems() {
    this.orbiterSystem = new OrbiterSystem({
      recipeDataSystem: this.recipeDataSystem,
      visualComposer: this.visualComposer,
      playerRoot: this.playerCore,
      chemObjectSystem: this.chemObjectSystem,
      localCellRecipe: this.localCellRecipe,
      frameState: this.frameState
    });
  }

  createTargetingSystems() {
    this.targetFocusRegistry = new TargetFocusRegistry({
      recipeDataSystem: this.recipeDataSystem,
      frameState: this.frameState
    });

    this.targetingSystem = new TargetingSystem({
      scene: this.scene,
      camera: this.camera,
      playerRoot: this.playerCore,
      chemObjectSystem: this.chemObjectSystem,
      frameState: this.frameState
    });

    this.visualHierarchyCompressionSystem = new VisualHierarchyCompressionSystem({
      scene: this.scene,
      targetingSystem: this.targetingSystem,
      coreVerbPhysicalizationSystem: this.coreVerbPhysicalizationSystem,
      frameState: this.frameState
    });
  }

  createFirstSliceArchitecture() {
    this.regionRegistry = new RegionRegistry([...this.recipeDataSystem.data.firstSliceRegions.values()]);
    this.gateRegistry = new GateRegistry([...this.recipeDataSystem.data.firstSliceGates.values()]);
    this.objectiveRegistry = new ObjectiveRegistry([...this.recipeDataSystem.data.firstSliceObjectives.values()]);
    this.cameraProfileRegistry = new CameraProfileRegistry([...this.recipeDataSystem.data.firstSliceCameraProfiles.values()]);
    this.visualLanguageRegistry = new VisualLanguageRegistry([...this.recipeDataSystem.data.firstSliceVisualLanguages.values()]);

    this.modeController = new ModeController({
      regionRegistry: this.regionRegistry,
      cameraProfileRegistry: this.cameraProfileRegistry,
      visualLanguageRegistry: this.visualLanguageRegistry,
      frameState: this.frameState,
      runtimeProfile: this.recipeDataSystem.data.firstSliceRuntimeProfile
    });

    this.objectiveSystem = new ObjectiveSystem({
      objectiveRegistry: this.objectiveRegistry,
      regionRegistry: this.regionRegistry,
      frameState: this.frameState
    });

    this.hubChamberFoundationSystem = new HubChamberFoundationSystem({
      recipeDataSystem: this.recipeDataSystem,
      scene: this.scene,
      camera: this.camera,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.hubInvestigationGameplaySystem = new HubInvestigationGameplaySystem({
      recipeDataSystem: this.recipeDataSystem,
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.firstSliceCohesionSystem = new FirstSliceCohesionSystem({
      recipeDataSystem: this.recipeDataSystem,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.graveMemoryRouteSystem = new GraveMemoryRouteSystem({
      recipeDataSystem: this.recipeDataSystem,
      chemObjectSystem: this.chemObjectSystem,
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.returnRegionEngineSystem = new ReturnRegionEngineSystem({
      frameState: this.frameState
    });
    this.graveReturnRegionSystem = new GraveReturnRegionSystem({
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState,
      graveMemoryRouteSystem: this.graveMemoryRouteSystem
    });
    this.graveResonanceGameplaySystem = new GraveResonanceGameplaySystem({
      frameState: this.frameState,
      chemObjectSystem: this.chemObjectSystem,
      graveReturnRegionSystem: this.graveReturnRegionSystem
    });
    this.graveRuptureHarvestSystem = new GraveRuptureHarvestSystem({
      scene: this.scene,
      camera: this.camera,
      playerRoot: this.playerCore,
      frameState: this.frameState,
      chemObjectSystem: this.chemObjectSystem,
      graveMemoryRouteSystem: this.graveMemoryRouteSystem,
      graveReturnRegionSystem: this.graveReturnRegionSystem
    });
    this.graveRuptureConsequenceSystem = new GraveRuptureConsequenceSystem({
      frameState: this.frameState,
      graveRuptureHarvestSystem: this.graveRuptureHarvestSystem
    });
    this.act1RouteContractSystem = new Act1RouteContractSystem({
      recipeDataSystem: this.recipeDataSystem,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.vascularRhythmRouteSystem = new VascularRhythmRouteSystem({
      recipeDataSystem: this.recipeDataSystem,
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.siltPressureRouteSystem = new SiltPressureRouteSystem({
      recipeDataSystem: this.recipeDataSystem,
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.combThresholdFoundationSystem = new CombThresholdFoundationSystem({
      recipeDataSystem: this.recipeDataSystem,
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.combThresholdPlayableSystem = new CombThresholdPlayableSystem({
      recipeDataSystem: this.recipeDataSystem,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.apertureFieldsArrivalSystem = new ApertureFieldsArrivalSystem({
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.signalPlainEcologySystem = new SignalPlainEcologySystem({
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.membraneRidgeGameplaySystem = new MembraneRidgeGameplaySystem({
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
    this.localCellBoundaryMorphSystem = new LocalCellBoundaryMorphSystem({
      frameState: this.frameState,
      scene: this.scene,
      playerRoot: this.playerCore
    });
    this.runtimeStateLedgerSystem = new RuntimeStateLedgerSystem({
      frameState: this.frameState
    });
  }

  createOpeningPacingSystems() {
    this.openingPacingSystem = new OpeningPacingSystem({
      recipeDataSystem: this.recipeDataSystem,
      chemObjectSystem: this.chemObjectSystem,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });

    this.surfaceWakeGameplaySystem = new SurfaceWakeGameplaySystem({
      recipeDataSystem: this.recipeDataSystem,
      chemObjectSystem: this.chemObjectSystem,
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });

    this.surfaceWakeLayeredInteractionSystem = new SurfaceWakeLayeredInteractionSystem({
      recipeDataSystem: this.recipeDataSystem,
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });

    this.surfaceWakeEcologicalCausalitySystem = new SurfaceWakeEcologicalCausalitySystem({
      recipeDataSystem: this.recipeDataSystem,
      chemObjectSystem: this.chemObjectSystem,
      scene: this.scene,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
  }

  createCinematicSystems() {
    this.cinematicAwakeningSystem = new CinematicAwakeningSystem({
      recipeDataSystem: this.recipeDataSystem,
      scene: this.scene,
      camera: this.camera,
      visualComposer: this.visualComposer,
      playerRoot: this.playerCore,
      frameState: this.frameState
    });
  }

  createDebugSystems() {
    this.debugDisplaySystem = new DebugDisplaySystem({
      frameState: this.frameState
    });

    this.guidePromptSystem = new GuidePromptSystem({
      recipeDataSystem: this.recipeDataSystem,
      frameState: this.frameState
    });

    this.statusPageSystem = new StatusPageSystem({
      appRoot: this.appRoot,
      frameState: this.frameState
    });

    this.debugAreaJumpSystem = new DebugAreaJumpSystem({
      playerMovementController: this.playerMovementController,
      inspectionCameraSystem: this.inspectionCameraSystem,
      coreGrowthSystem: this.coreGrowthSystem,
      coreSensoryResponseSystem: this.coreSensoryResponseSystem,
      playerRoot: this.playerCore
    });

    this.playtestHudSystem = new PlaytestHudSystem({
      recipeDataSystem: this.recipeDataSystem,
      frameState: this.frameState
    });

    this.sessionTelemetrySystem = new SessionTelemetrySystem({
      frameState: this.frameState,
      baselineId: "HC027L1_GOLDEN_INQUIRY_BASELINE_01"
    });
  }

  registerRuntimeSystems() {
    const regionScoped = {
      runtimeScope: "active_region",
      lazyInit: true,
      settleOnDeactivate: true
    };
    const regionScopedSoft = {
      ...regionScoped,
      allowUpdateError: true
    };

    this.registry.register("input", this.inputSystem);
    this.registry.register("deliberateCommitmentSystem", this.deliberateCommitmentSystem);
    this.registry.register("debugAreaJumpSystem", this.debugAreaJumpSystem);
    this.registry.register("controllerComfortSystem", this.controllerComfortSystem, { allowUpdateError: true });
    this.registry.register("modeController", this.modeController);
    this.registry.register("statusPageSystem", this.statusPageSystem, { allowUpdateError: true });
    this.registry.register("debugDisplaySystem", this.debugDisplaySystem, { allowUpdateError: true });

    this.registry.register("chemObjectSystem", this.chemObjectSystem, regionScoped);
    this.registry.register("hostRhythmSystem", this.hostRhythmSystem, regionScopedSoft);
    // HC028F resolves regional composition into bounded matter behavior before
    // the existing ambient Host field updates. It has no player or route authority.
    this.registry.register("regionalPhysicalEmbodimentSystem", this.regionalPhysicalEmbodimentSystem, regionScopedSoft);
    this.registry.register("ambientMaterialInteractionSystem", this.ambientMaterialInteractionSystem, regionScopedSoft);
    this.registry.register("interactionCompositionSystem", this.interactionCompositionSystem, { allowUpdateError: true });
    this.registry.register("surfaceWakeGameplaySystem", this.surfaceWakeGameplaySystem, regionScoped);
    this.registry.register("openingPacingSystem", this.openingPacingSystem, regionScopedSoft);
    this.registry.register("surfaceWakeLayeredInteractionSystem", this.surfaceWakeLayeredInteractionSystem, regionScoped);
    this.registry.register("surfaceWakeEcologicalCausalitySystem", this.surfaceWakeEcologicalCausalitySystem, regionScoped);
    this.registry.register("cinematicAwakeningSystem", this.cinematicAwakeningSystem, regionScopedSoft);
    this.registry.register("localCellMorphSystem", this.localCellMorphSystem, regionScoped);
    this.registry.register("morphCompletionSystem", this.morphCompletionSystem, regionScoped);
    this.registry.register("entitySystem", this.entitySystem);
    this.registry.register("scarFlowArrivalSystem", this.scarFlowArrivalSystem, regionScoped);
    this.registry.register("guideThresholdGameplaySystem", this.guideThresholdGameplaySystem, regionScoped);
    this.registry.register("guideThresholdLayeredInteractionSystem", this.guideThresholdLayeredInteractionSystem, regionScoped);
    this.registry.register("scarFlowInteractionSystem", this.scarFlowInteractionSystem, regionScoped);
    this.registry.register("secondLocalCellMorphSystem", this.secondLocalCellMorphSystem, regionScoped);
    this.registry.register("morphReadabilitySystem", this.morphReadabilitySystem, regionScopedSoft);
    this.registry.register("targetFocusRegistry", this.targetFocusRegistry, regionScoped);
    this.registry.register("targetingSystem", this.targetingSystem, regionScoped);
    // HC029C resolves simultaneous verb intent only after HC029A has published the
    // retained relationship, then primitive effect owners consume one shared grammar.
    this.registry.register("verbCompositionSystem", this.verbCompositionSystem);
    // HC030A gives the retained ChemObject relationship a live condition before
    // Bond consumes Absorb, without gaining targeting or progression authority.
    this.registry.register("reactiveStateGrammarSystem", this.reactiveStateGrammarSystem, regionScoped);
    // HC030B derives bounded response personality from existing authored matter/entity
    // identity after HC030A resolves condition. It owns no condition, target, AI or route state.
    this.registry.register("responsePersonalitySystem", this.responsePersonalitySystem, regionScoped);
    this.registry.register("orbiterSystem", this.orbiterSystem, regionScoped);
    this.registry.register("bondSystem", this.bondSystem, regionScoped);
    this.registry.register("hubChamberFoundationSystem", this.hubChamberFoundationSystem, regionScoped);
    this.registry.register("hubInvestigationGameplaySystem", this.hubInvestigationGameplaySystem, regionScoped);
    this.registry.register("firstSliceCohesionSystem", this.firstSliceCohesionSystem, regionScoped);
    this.registry.register("graveMemoryRouteSystem", this.graveMemoryRouteSystem, regionScoped);
    // HC031A turns retained route history into deterministic return composition and progression credits.
    this.registry.register("returnRegionEngineSystem", this.returnRegionEngineSystem);
    // Grave II is a second-visit spatial octave over the existing Grave DNA; it owns no crossing or target selection.
    this.registry.register("graveReturnRegionSystem", this.graveReturnRegionSystem);
    // HC031B couples the existing Grave landmarks into one regional resonance field after the octave geometry updates.
    this.registry.register("graveResonanceGameplaySystem", this.graveResonanceGameplaySystem);
    // HC031C adds the first rupture -> fragment -> absorb -> residue combat-language proof.
    // It reads the existing relationship grammar and cannot own targeting, exits, or route progression.
    this.registry.register("graveRuptureHarvestSystem", this.graveRuptureHarvestSystem);
    // HC031D turns missed rupture debris into bounded Grave memory after harvest resolves.
    this.registry.register("graveRuptureConsequenceSystem", this.graveRuptureConsequenceSystem);
    this.registry.register("act1RouteContractSystem", this.act1RouteContractSystem, regionScoped);
    this.registry.register("vascularRhythmRouteSystem", this.vascularRhythmRouteSystem, regionScoped);
    this.registry.register("siltPressureRouteSystem", this.siltPressureRouteSystem, regionScoped);
    this.registry.register("combThresholdFoundationSystem", this.combThresholdFoundationSystem, regionScoped);
    this.registry.register("combThresholdPlayableSystem", this.combThresholdPlayableSystem, regionScoped);
    this.registry.register("apertureFieldsArrivalSystem", this.apertureFieldsArrivalSystem, regionScoped);
    this.registry.register("signalPlainEcologySystem", this.signalPlainEcologySystem, regionScoped);
    this.registry.register("membraneRidgeGameplaySystem", this.membraneRidgeGameplaySystem, regionScoped);
    // HC-016C: boundary morph owner runs before ledger; legacy gate runtime retired.
    this.registry.register("localCellBoundaryMorphSystem", this.localCellBoundaryMorphSystem);
    this.registry.register("runtimeStateLedgerSystem", this.runtimeStateLedgerSystem);

    this.registry.register("objectiveSystem", this.objectiveSystem);
    this.registry.register("inspectionCameraSystem", this.inspectionCameraSystem, regionScoped);
    this.registry.register("guidePromptSystem", this.guidePromptSystem, { allowUpdateError: true });
    // HC028H1 converts the prior-frame canonical topology interpretation into two
    // bounded environmental-reception modifiers before movement consumes them.
    // It cannot move the player or alter player input/world-force generation.
    this.registry.register("coreTopologyEnvironmentalHandlingSystem", this.coreTopologyEnvironmentalHandlingSystem);
    // HC031F1B authors the first explicit surface-ecology continuation inside
    // Surface Wake. It owns geometry + metadata only and runs before contact truth.
    this.registry.register("hostContactShelfSystem", this.hostContactShelfSystem);
    // HC031F1B accepts only registered ecological surfaces as local contact truth.
    // Decorative/transparent world meshes can no longer become attachment targets.
    this.registry.register("coreSurfaceTruthSystem", this.coreSurfaceTruthSystem);
    this.registry.register("playerMovement", this.playerMovementController);
    // HC028G reads the resolved environmental force after movement and renders
    // diegetic local streamlines only; it never owns force, pressure or traversal.
    this.registry.register("liftFieldReadabilitySystem", this.liftFieldReadabilitySystem, { allowUpdateError: true });
    this.registry.register("coreEngineSystem", this.coreEngineSystem);
    // HC028H reads the existing HC027C topology profile and current regional
    // composition as a presentation/telemetry bridge. It owns no gameplay.
    this.registry.register("coreTopologyResonanceSystem", this.coreTopologyResonanceSystem);
    // HC028D bridges the already-resolved Host composition and Core engine state.
    // It runs before CoreGrowth/Embodiment so the same-frame gyro can visually entrain.
    this.registry.register("coreWorldResonanceSystem", this.coreWorldResonanceSystem);
    // HC028D1 reads canonical verb intent after the Core engine has resolved and
    // publishes presentation-only function-plane drive before embodiment renders.
    this.registry.register("coreVerbEngineCouplingSystem", this.coreVerbEngineCouplingSystem);
    this.registry.register("coreGrowthSystem", this.coreGrowthSystem);
    // HC031F1B reads the same authored ecological surface truth used by movement
    // and renders three suction relationships against that shared local contact plane.
    this.registry.register("coreTendrilSurfaceContactSystem", this.coreTendrilSurfaceContactSystem);
    // HC031G expresses the existing HC029C Stabilize + Pulse chord as a focused
    // projection. Free space self-braces; authored surface anchors only enhance it.
    this.registry.register("stabilizedProjectionSystem", this.stabilizedProjectionSystem);
    // HC027C reads the topology published by CoreEmbodimentSystem through CoreGrowthSystem.
    // PlayerMovementController consumes these modifiers on the following frame, preserving
    // movement ownership and preventing radial physiology from moving the player directly.
    this.registry.register("coreRadialPerformanceSystem", this.coreRadialPerformanceSystem);
    // HC028H2 translates the canonical topology physiology into presentation/audio
    // character only. It owns no verb strength, range, cost, input or progression.
    this.registry.register("coreTopologyVerbCharacterSystem", this.coreTopologyVerbCharacterSystem);
    // HC028J reads the same-frame Core verb chord against the already-authored
    // Tender/Watcher bodies and publishes interpretation only. EntitySystem keeps
    // all behavior, bond, repair and movement authority.
    this.registry.register("entityRelationshipGrammarSystem", this.entityRelationshipGrammarSystem, { allowUpdateError: true });
    // HC028K retains a short-lived embodied memory of meaningful relationship
    // gestures. It owns no bond, repair, progression, movement or combat state.
    this.registry.register("entityReciprocalMemorySystem", this.entityReciprocalMemorySystem, { allowUpdateError: true });
    // HC028L translates retained memory into a bounded next-behavior directive.
    // EntitySystem remains the only owner that can actually move/steer organisms.
    this.registry.register("entityReciprocalBehaviorSystem", this.entityReciprocalBehaviorSystem, { allowUpdateError: true });
    // HC028O reads the prior-frame HC028N residue before body presentation. The
    // one-frame handoff prevents circular residue/recognition feedback while remaining
    // perceptually immediate; it owns no movement, behavior, targeting, or progression.
    this.registry.register("entityResidueRecognitionSystem", this.entityResidueRecognitionSystem, { allowUpdateError: true });
    // HC028I/HC028J/HC028K/HC028L/HC028O render world entrainment plus relationship,
    // memory and passive residue recognition through existing organism bodies only.
    this.registry.register("entityEcologyResonanceSystem", this.entityEcologyResonanceSystem, { allowUpdateError: true });
    // HC028P listens only to other-organism residue recognition after the body has
    // visibly read it. It publishes one brief local Host-matter reply around the
    // recognizing organism and cannot create residue or recursive propagation.
    this.registry.register("entityEcologicalCrossInfluenceSystem", this.entityEcologicalCrossInfluenceSystem, { allowUpdateError: true });
    // HC028M converts the retained ecological relationship into a bounded local
    // matter field. AmbientMaterialInteractionSystem consumes it on the following
    // frame; this bridge owns no particles, movement, collision, chemistry or routes.
    this.registry.register("entityLocalMatterCouplingSystem", this.entityLocalMatterCouplingSystem, { allowUpdateError: true });
    // HC028N records one faint, cell-scoped world-space trace after the immediate
    // organism response ends. AmbientMaterialInteractionSystem remains the only
    // owner that can move Host motes; this system owns no gameplay or save state.
    this.registry.register("entityEcologicalResidueSystem", this.entityEcologicalResidueSystem, { allowUpdateError: true });
    // HC027D interprets the already-resolved Pulse contacts as presentation-only sonar
    // before audio consumes the same-frame return events.
    this.registry.register("coreSensoryResponseSystem", this.coreSensoryResponseSystem);
    this.registry.register("eventAnchoredHostAudioSystem", this.eventAnchoredHostAudioSystem, { allowUpdateError: true });
    this.registry.register("visualComposer", this.visualComposer);
    this.registry.register("motionSignatureSystem", this.motionSignatureSystem);
    this.registry.register("playtestHudSystem", this.playtestHudSystem, { allowUpdateError: true });
    // HC028A read-only observer runs last so it sees the resolved frame truth.
    this.registry.register("sessionTelemetrySystem", this.sessionTelemetrySystem, { allowUpdateError: true });

  }

  createTransitionCoordinator() {
    this.firstSliceTransitionCoordinator = new FirstSliceTransitionCoordinator({
      registry: this.registry,
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      localCellMorphSystem: this.localCellMorphSystem,
      secondLocalCellMorphSystem: this.secondLocalCellMorphSystem,
      frameState: this.frameState
    });
  }

  tick() {
    if (!this.isRunning) return;

    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.05);

    this.frame += 1;
    this.frameState.frame = this.frame;
    this.frameState.runtimeSeconds += dt;

    this.registry.update(dt, this.frameState);
    this.firstSliceTransitionCoordinator?.update(dt, this.frameState, rawDt);
    this.coreVerbPhysicalizationSystem?.update(dt, this.frameState);
    this.visualHierarchyCompressionSystem?.update(dt, this.frameState);
    this.updateCamera(dt);

    this.renderer.render(this.scene, this.camera);
  }

  updateCamera(dt) {
    if (!this.playerCore || !this.camera) return;

    const input = this.frameState.input ?? {};
    const inspection = this.frameState.inspectionCamera ?? this.frameState.tightInspectionCamera ?? {};
    const inspectionActive = Boolean(inspection.active);
    const lookX = Number.isFinite(input.cameraLookX) ? input.cameraLookX : 0;
    const lookY = Number.isFinite(input.cameraLookY) ? input.cameraLookY : 0;

    if (inspection.justActivated) {
      if (inspection.focusMode === "authored_interaction") {
        this.alignInspectionCamera(inspection);
        this.cameraPitch = Number.isFinite(inspection.pitch) ? inspection.pitch : 0.24;
      } else if (inspection.selfInspection) {
        // HC024A: entering self-inspection preserves the scene the player just framed.
        // Clamp only if the exploration angle is outside the wider inspection arc.
        this.cameraPitch = this.clamp(
          this.cameraPitch,
          inspection.pitchMin ?? -1.0,
          inspection.pitchMax ?? 1.22
        );
      } else {
        this.cameraPitch = Number.isFinite(inspection.pitch) ? inspection.pitch : 0.24;
      }
      this.inspectionYawCenter = this.cameraYaw;
    }

    if (inspection.justFocusChanged && inspection.constrainYaw !== false) {
      this.inspectionYawCenter = this.cameraYaw;
    }

    if (input.recenterCameraPressed) {
      if (inspectionActive) {
        if (inspection.selfInspection) {
          this.alignCoreInspectionCamera();
        } else {
          this.alignInspectionCamera(inspection);
        }
        this.inspectionYawCenter = this.cameraYaw;
        this.cameraPitch = Number.isFinite(inspection.pitch) ? inspection.pitch : 0.24;
        this.cameraDistance = Number.isFinite(inspection.distance) ? inspection.distance : 2.65;
      } else {
        this.cameraYaw = this.cameraDefaultYaw;
        this.cameraPitch = this.cameraDefaultPitch;
        this.cameraDistance = this.cameraDefaultDistance;
      }
      this.frameState.cameraControl.lastRecenterAt = this.frameState.runtimeSeconds;
    }

    const cameraTuning = this.frameState.controllerOnboarding?.tuning?.camera ?? {};
    const manualThreshold = cameraTuning.manualInputThreshold ?? 0.035;
    const manualCameraActive = Math.hypot(lookX, lookY) > manualThreshold;
    if (manualCameraActive) {
      this.lastManualCameraInputAt = this.frameState.runtimeSeconds;
    }
    const manualOverrideActive = (this.frameState.runtimeSeconds - this.lastManualCameraInputAt) <= (cameraTuning.manualOverrideHoldSeconds ?? 2.2);

    const baseYawSpeed = cameraTuning.yawSpeed ?? 2.25;
    const basePitchSpeed = cameraTuning.pitchSpeed ?? (baseYawSpeed * 0.72);
    const yawSpeed = baseYawSpeed * (inspectionActive ? (inspection.yawSensitivityScale ?? 0.62) : 1);
    const pitchSpeed = basePitchSpeed * (inspectionActive ? (inspection.pitchSensitivityScale ?? 0.58) : 1);
    this.cameraYaw += lookX * yawSpeed * dt;
    this.cameraPitch = this.clamp(
      this.cameraPitch + lookY * pitchSpeed * dt,
      inspectionActive ? (inspection.pitchMin ?? 0.08) : (cameraTuning.pitchMin ?? -0.34),
      inspectionActive ? (inspection.pitchMax ?? 0.5) : (cameraTuning.pitchMax ?? 0.92)
    );
    if (inspectionActive && inspection.constrainYaw !== false) {
      this.cameraYaw = this.clampAngleAround(
        this.cameraYaw,
        this.inspectionYawCenter,
        inspection.maxYawOffset ?? 0.58
      );
    }

    const openingCameraBias = this.frameState.openingFlow?.cameraBias ?? {};
    if (openingCameraBias.active && !manualOverrideActive && !inspectionActive) {
      const biasBlend = 1 - Math.exp(-dt * 1.75);
      this.cameraYaw += ((openingCameraBias.yaw ?? this.cameraYaw) - this.cameraYaw) * biasBlend;
      this.cameraPitch += ((openingCameraBias.pitch ?? this.cameraPitch) - this.cameraPitch) * biasBlend;
    }

    const cinematicCameraBias = this.frameState.awakeningCinematic?.cameraBias ?? {};
    if (cinematicCameraBias.active && !manualOverrideActive && !inspectionActive) {
      const strength = cinematicCameraBias.blendStrength ?? 1.15;
      const cinematicBlend = 1 - Math.exp(-dt * strength);
      this.cameraYaw += ((cinematicCameraBias.yaw ?? this.cameraYaw) - this.cameraYaw) * cinematicBlend;
      this.cameraPitch += ((cinematicCameraBias.pitch ?? this.cameraPitch) - this.cameraPitch) * cinematicBlend;
    }

    const inSurfaceWake = this.frameState.activeCellId === "CELL_MEMBRANE_NURSERY_001";
    const inGuideThreshold = this.frameState.activeCellId === "CELL_SCAR_FLOW_FOLD_001";
    const inHubVolume = Boolean(this.frameState.hubChamberFoundation?.active);
    const inGraveMemoryRoute = Boolean(this.frameState.graveMemoryRoute?.active);
    const inRouteContract = Boolean(this.frameState.act1RouteContract?.active);
    const inVascularRhythmRoute = Boolean(this.frameState.vascularRhythmRoute?.active);
    const inSiltPressureRoute = Boolean(this.frameState.siltPressureRoute?.active);
    const inCombThreshold = Boolean(this.frameState.combThresholdFoundation?.active);
    const inApertureArrival = Boolean(this.frameState.apertureFieldsArrival?.active);
    const inVolumetricFirstSlice = inSurfaceWake || inGuideThreshold || inHubVolume || inGraveMemoryRoute || inRouteContract || inCombThreshold || inApertureArrival;
    const hubCameraMode = this.frameState.hubChamberFoundation?.cameraMode ?? "inactive";
    const hubEstablishing = inHubVolume && hubCameraMode === "hub_establishing_whole_junction";
    const hubTerritoryExploration = inHubVolume && hubCameraMode === "player_tethered_territory_exploration";
    const altitude = this.frameState.playerKinematics?.altitude ?? this.playerCore.position.y;
    const altitudeRange = Math.max(0.1, this.frameState.playerKinematics?.altitudeRange?.max ?? 3.45);
    const normalizedAltitude = this.clamp(altitude / altitudeRange, -1, 1);
    const verticalInput = this.frameState.playerKinematics?.verticalInput ?? 0;
    const playerVelocity = this.frameState.playerKinematics?.velocity ?? {};
    const motionSpeed = this.frameState.playerKinematics?.speed ?? 0;
    this.cameraVelocityDirection.set(
      playerVelocity.x ?? 0,
      playerVelocity.y ?? 0,
      playerVelocity.z ?? 0
    );
    if (this.cameraVelocityDirection.lengthSq() > 0.0025) {
      this.cameraVelocityDirection.normalize();
    } else {
      this.cameraVelocityDirection.set(0, 0, 0);
    }
    this.cameraMotionLead.copy(this.cameraVelocityDirection)
      .multiplyScalar(Math.min(0.72, motionSpeed * 0.16));
    if (this.verticalCameraAnchorY == null || !Number.isFinite(this.verticalCameraAnchorY)) {
      this.verticalCameraAnchorY = this.playerCore.position.y;
    }
    const verticalAnchorRate = inVolumetricFirstSlice
      ? Math.abs(verticalInput) > 0.08 ? 1.12 : 2.05
      : 7.5;
    this.verticalCameraAnchorY += (this.playerCore.position.y - this.verticalCameraAnchorY)
      * (1 - Math.exp(-dt * verticalAnchorRate));
    const screenAltitudeOffset = this.playerCore.position.y - this.verticalCameraAnchorY;

    if (inVolumetricFirstSlice && !inspectionActive && !manualOverrideActive) {
      // A delayed vertical anchor lets the player visibly cross the frame before
      // the camera catches up. Pitch supports the move without cancelling it.
      const verticalBlend = 1 - Math.exp(-dt * 2.4);
      const readablePitch = (
        inHubVolume ? 0.31
          : inGraveMemoryRoute ? 0.24
            : inRouteContract ? 0.26
              : inCombThreshold ? 0.25
                : inApertureArrival ? 0.18
                  : 0.28
      ) + normalizedAltitude * 0.16;
      this.cameraPitch += (readablePitch - this.cameraPitch) * verticalBlend;
    }
    this.frameState.verticalReadability = {
      pass: "HC-009B",
      referenceVisualPass: "HC-008G",
      active: inVolumetricFirstSlice,
      altitude,
      normalizedAltitude,
      verticalInput,
      cameraPitchFeedback: inVolumetricFirstSlice && !inspectionActive && !manualOverrideActive,
      verticalCameraAnchorY: this.verticalCameraAnchorY,
      screenAltitudeOffset,
      delayedVerticalFollow: true,
      parallaxStrength: Math.min(1, Math.abs(screenAltitudeOffset) * 0.78 + Math.abs(normalizedAltitude) * 0.28),
      occlusionBands: "lower_mid_upper",
      altitudeBand: altitude < -1.15 ? "lower" : altitude > 1.15 ? "upper" : "middle",
      hubTerritoryFraming: inHubVolume,
      guideThresholdFraming: inGuideThreshold,
      graveMemoryRouteFraming: inGraveMemoryRoute,
      act1RouteContractFraming: inRouteContract,
      vascularRhythmFraming: inVascularRhythmRoute,
      siltPressureFraming: inSiltPressureRoute,
      combThresholdFraming: inCombThreshold,
      apertureFieldsArrivalFraming: inApertureArrival,
      hubCameraMode,
      playerTetheredTerritoryExploration: hubTerritoryExploration,
      wideEstablishingView: hubEstablishing,
      localScaleParallax: hubTerritoryExploration,
      movementReferencePreserved: "camera_relative_embodied_free_3d_plus_explicit_world_y",
      motionLead: this.cameraMotionLead.length(),
      speedFieldOfViewResponse: true,
      bodyBankCameraResponse: true
    };

    const readability = this.frameState.cameraReadability ?? {};
    const rawOcclusionPullback = this.clamp(readability.autoPullback ?? 0, 0, 2.6);
    const occlusionPullback = rawOcclusionPullback * (inspectionActive ? (inspection.occlusionPullbackScale ?? 0.12) : 1);
    const pocketLift = this.clamp(readability.pocketLift ?? 0, 0, 0.65) * (inspectionActive ? 0.18 : 1);
    const cinematicDistance = cinematicCameraBias.active && Number.isFinite(cinematicCameraBias.distance)
      ? cinematicCameraBias.distance
      : null;
    const openingDistance = openingCameraBias.active && !manualOverrideActive && Number.isFinite(openingCameraBias.distance)
      ? openingCameraBias.distance
      : (cameraTuning.defaultDistance ?? this.cameraDefaultDistance);
    const authoredDistance = cinematicDistance ?? openingDistance;
    const hubExplorationDistance = this.frameState.hubChamberFoundation?.normalCameraDistance ?? 6.6;
    const hubEstablishingDistance = this.frameState.hubChamberFoundation?.establishingCameraDistance ?? 8.6;
    const graveRouteDistance = this.recipeDataSystem.data.graveMemoryRouteCircuit?.camera?.distance ?? 6.35;
    const routeContractCamera = this.cameraProfileRegistry?.find?.(
      this.frameState.currentMode?.cameraProfileId
    );
    const apertureCamera = inApertureArrival ? this.cameraProfileRegistry?.find?.("camera_aperture_fields_arrival") : null;
    const volumetricDistance = inHubVolume
      ? hubEstablishing
        ? hubEstablishingDistance
        : hubExplorationDistance
      : inGraveMemoryRoute
        ? graveRouteDistance
        : inRouteContract
          ? (routeContractCamera?.distance ?? 6.45)
          : inApertureArrival
            ? (this.frameState.apertureFieldsArrival?.cameraDistanceIntent ?? apertureCamera?.distance ?? 14.8)
            : authoredDistance;
    const normalDistance = volumetricDistance
      + Math.min(1.25, (this.frameState.playerKinematics?.speed ?? 0) * 0.18)
      + occlusionPullback * 0.36;
    const signalPlainDebugFraming = this.frameState.debugSignalPlainFraming ?? {};
    const signalPlainDebugFramingActive = Boolean(
      inApertureArrival
      && signalPlainDebugFraming.active
      && (this.frameState.runtimeSeconds ?? 0) <= (signalPlainDebugFraming.endsAt ?? -1)
      && signalPlainDebugFraming.focusPosition
    );
    const interactionBreathingRoom = this.clamp(
      this.frameState.interactionComposition?.cameraBreathingRoom ?? 0,
      0,
      0.80
    );
    const targetDistance = inspectionActive && Number.isFinite(inspection.distance)
      ? inspection.coreWorkActive
        ? inspection.distance
        : inspection.distance + Math.min(0.28, (this.frameState.playerKinematics?.speed ?? 0) * 0.04) + interactionBreathingRoom
      : signalPlainDebugFramingActive && Number.isFinite(signalPlainDebugFraming.cameraDistance)
        ? signalPlainDebugFraming.cameraDistance
        : normalDistance + interactionBreathingRoom;
    const distanceSmoothing = inspectionActive ? (inspection.followSmoothing ?? 8.4) : 2.8;
    this.cameraDistance += (targetDistance - this.cameraDistance) * (1 - Math.exp(-dt * distanceSmoothing));

    if (inspectionActive && inspection.focusPosition) {
      this.inspectionFocus.set(
        inspection.focusPosition.x ?? this.playerCore.position.x,
        inspection.focusPosition.y ?? this.playerCore.position.y,
        inspection.focusPosition.z ?? this.playerCore.position.z
      );
      const blend = this.clamp(inspection.targetBlendTowardFocus ?? 0.58, 0.2, 0.82);
      this.cameraTarget.copy(this.playerCore.position).lerp(this.inspectionFocus, blend);
      this.cameraTarget.y += inspection.targetLift ?? 0.16;
    } else {
      this.cameraTarget.copy(this.playerCore.position);
      this.cameraTarget.add(this.cameraMotionLead);
      if (signalPlainDebugFramingActive) {
        const focus = signalPlainDebugFraming.focusPosition;
        this.inspectionFocus.set(focus.x ?? this.playerCore.position.x, focus.y ?? this.playerCore.position.y, focus.z ?? this.playerCore.position.z);
        this.cameraTarget.lerp(this.inspectionFocus, signalPlainDebugFraming.focusBlend ?? 0.52);
        this.cameraTarget.y += 0.22;
      } else if (signalPlainDebugFraming.active) {
        this.frameState.debugSignalPlainFraming = { ...signalPlainDebugFraming, active: false, completed: true };
      }
      if (hubEstablishing && this.frameState.interactionInspectionFocus?.position) {
        const hubFocus = this.frameState.interactionInspectionFocus.position;
        this.cameraTarget.x += ((hubFocus.x ?? this.cameraTarget.x) - this.cameraTarget.x) * 0.24;
        this.cameraTarget.z += ((hubFocus.z ?? this.cameraTarget.z) - this.cameraTarget.z) * 0.24;
      }
      this.cameraTarget.y = (inVolumetricFirstSlice ? this.verticalCameraAnchorY : this.playerCore.position.y)
        + 0.36
        + pocketLift * 0.32
        + (openingCameraBias.active && !manualOverrideActive ? (openingCameraBias.seedViewLift ?? 0) : 0)
        + (cinematicCameraBias.active && !manualOverrideActive ? (cinematicCameraBias.lift ?? 0) : 0);
    }

    const cosPitch = Math.cos(this.cameraPitch);
    const baseHeight = inspectionActive
      ? (inspection.baseHeight ?? 0.48)
      : hubTerritoryExploration ? 1.32 : inApertureArrival ? 1.18 : inGraveMemoryRoute ? 1.42 : inRouteContract ? 1.18 : 2.05;
    this.cameraOffset.set(
      Math.sin(this.cameraYaw) * cosPitch * this.cameraDistance,
      baseHeight + Math.sin(this.cameraPitch) * this.cameraDistance,
      Math.cos(this.cameraYaw) * cosPitch * this.cameraDistance
    );

    this.cameraDesired.copy(this.cameraTarget).add(this.cameraOffset);
    if (inspectionActive) {
      this.inspectionRight.set(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));
      this.cameraDesired.addScaledVector(this.inspectionRight, inspection.shoulderOffset ?? 0.62);
      this.inspectionDirection.set(
        (inspection.focusPosition?.x ?? this.playerCore.position.x) - this.playerCore.position.x,
        0,
        (inspection.focusPosition?.z ?? this.playerCore.position.z) - this.playerCore.position.z
      );
      if (this.inspectionDirection.lengthSq() > 0.0001) {
        this.inspectionDirection.normalize();
        this.cameraDesired.addScaledVector(this.inspectionDirection, -(inspection.forwardOffset ?? 0.18));
      }
    }

    const smoothing = 1 - Math.exp(-dt * (inspectionActive ? (inspection.followSmoothing ?? 8.4) : (cameraTuning.followSmoothing ?? 6.6)));
    this.camera.position.lerp(this.cameraDesired, smoothing);

    if (inspectionActive || signalPlainDebugFramingActive) {
      // HC-015G debug staging: frame the whole Signal Plain play pocket, not only the Core.
      // Normal camera ownership resumes automatically when the short framing window expires.
      this.cameraLookAt.copy(this.cameraTarget);
    } else {
      this.cameraLookAt.copy(this.playerCore.position);
      this.cameraLookAt.addScaledVector(this.cameraMotionLead, 0.42);
      this.cameraLookAt.y = (inVolumetricFirstSlice ? this.verticalCameraAnchorY : this.playerCore.position.y) + 0.18;
    }
    this.camera.lookAt(this.cameraLookAt);
    if (!inspectionActive) {
      this.camera.rotateZ((this.frameState.coreEmbodiment?.bank ?? 0) * -0.12);
    }

    const correctedDistance = this.cameraDistance + occlusionPullback * 0.42;
    if (occlusionPullback > 0.01) {
      const pullDirection = this.camera.position.clone().sub(this.cameraTarget).normalize();
      this.camera.position.addScaledVector(pullDirection, occlusionPullback * dt * 5.2);
      this.camera.position.y += pocketLift * dt * 1.35;
    }

    const baseTargetFov = inspectionActive
      ? (inspection.fieldOfView ?? 46)
      : signalPlainDebugFramingActive && Number.isFinite(signalPlainDebugFraming.fieldOfView)
        ? signalPlainDebugFraming.fieldOfView
      : inHubVolume
        ? hubEstablishing
          ? (this.frameState.hubChamberFoundation?.establishingFieldOfView ?? 60)
          : (this.frameState.hubChamberFoundation?.normalFieldOfView ?? 56)
        : inSurfaceWake || inGuideThreshold
        ? 58 + Math.abs(normalizedAltitude) * 3
        : inApertureArrival
          ? (apertureCamera?.fieldOfView ?? 72)
          : inRouteContract
            ? (routeContractCamera?.fieldOfView ?? 57)
            : 60;
    const motionFov = inspectionActive
      ? 0
      : Math.min(3.2, motionSpeed * 0.58)
        + Math.min(1.6, (this.frameState.coreEmbodiment?.fluidSlip ?? 0) * 1.15);
    const targetFov = baseTargetFov + motionFov;
    const fovSmoothing = inspectionActive ? (inspection.fovSmoothing ?? 7.2) : 5.4;
    const nextFov = this.camera.fov + (targetFov - this.camera.fov) * (1 - Math.exp(-dt * fovSmoothing));
    if (Math.abs(nextFov - this.camera.fov) > 0.0001) {
      this.camera.fov = nextFov;
      this.camera.updateProjectionMatrix();
    }

    this.updateCameraReadabilitySafely(dt);
    this.inspectionOcclusionSystem?.update(dt, this.frameState, this.camera, this.playerCore);

    this.camera.getWorldDirection(this.inspectionDirection);
    const cameraWorldForward = {
      x: this.inspectionDirection.x,
      y: this.inspectionDirection.y,
      z: this.inspectionDirection.z
    };
    const cameraWorldPosition = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z
    };

    this.frameState.cameraControl = {
      mode: inspectionActive ? (inspection.mode ?? "core_self_inspection_orbit") : "player_tethered_orbit",
      yaw: this.cameraYaw,
      pitch: this.cameraPitch,
      distance: correctedDistance,
      fieldOfView: this.camera.fov,
      worldPosition: cameraWorldPosition,
      worldForward: cameraWorldForward,
      lookX,
      lookY,
      inspectionActive,
      inspectionAvailable: Boolean(inspection.available),
      inspectionFocus: inspection.focusObjectId ?? "none",
      inspectionToggleHint: inspection.toggleHint ?? "Y inspects the Core / adopts a readable authored focus.",
      recenterHint: inspectionActive
        ? inspection.coreWorkActive
          ? "D-Pad selects Core piece / A grab-place / Left stick moves held piece / RT-LT changes Deep-Inner-Membrane / Right stick orbits / B Core inspection / Y world"
          : (inspection.selfInspection
              ? "Right stick orbits / A interacts with world / D-Pad Down enters Core Work / Guide hone shows focus / R3 recenters / Y world"
              : "Right stick inspects the authored focus / R3 reframe / Y or V return")
        : "Right stick orbit / R3 recenter / Y or V inspect Core / left-stick up follows camera forward",
      selfInspection: Boolean(inspection.selfInspection),
      coreCenteredInspection: Boolean(inspection.coreCentered),
      coreWorkActive: Boolean(inspection.coreWorkActive),
      coreWorkAvailable: Boolean(inspection.coreWorkAvailable),
      coreWorkBlend: inspection.coreWorkBlend ?? 0,
      coreWorkHint: this.frameState.guideFocus?.honed ? "Guide honed; A still interacts. D-Pad Down enters Core Work." : "A interacts normally; D-Pad Down intentionally enters Core Work.",
      worldInteractSuppressedDuringSelfInspection: Boolean(inspection.worldInteractSuppressedDuringSelfInspection),
      chemistryEnabledInCoreWork: Boolean(inspection.chemistryEnabled),
      pieceManipulationEnabledInCoreWork: Boolean(inspection.pieceManipulationEnabled),
      targetVisibleBias: inspectionActive ? (inspection.coreWorkActive ? 1.55 : 1.35) : 1,
      occlusionIntensity: this.frameState.cameraReadability?.occlusionIntensity ?? 0,
      playPocketWindow: this.frameState.cameraReadability?.playPocketWindow ?? "clear",
      sourceSurfaceIntensity: this.frameState.cameraReadability?.sourceSurfaceIntensity ?? 0,
      occludedObjectId: this.frameState.cameraReadability?.occludedObjectId ?? "none",
      playerHalo: this.frameState.cameraReadability?.playerHalo ?? "active",
      lastRecenterAt: this.frameState.cameraControl?.lastRecenterAt ?? 0,
      manualOverrideActive,
      cameraRelativeMovementPreserved: inspection.cameraRelativeMovementPreserved !== false,
      hubSpatialAuthorityPass: inHubVolume ? "HC-008G" : "inactive",
      hubCameraMode,
      hubWideEstablishing: hubEstablishing,
      hubPlayerTetheredExploration: hubTerritoryExploration,
      hubWholeJunctionViewAvailableThroughGuideFocus: inHubVolume,
      routeActivated: false,
      sensitivity: {
        yawSpeed,
        pitchSpeed,
        manualOverrideHoldSeconds: cameraTuning.manualOverrideHoldSeconds ?? 2.2
      }
    };
  }


  alignCoreInspectionCamera() {
    const facing = this.frameState.coreEmbodiment?.facingDirection ?? {};
    let fx = Number.isFinite(facing.x) ? facing.x : 0;
    let fz = Number.isFinite(facing.z) ? facing.z : -1;
    const length = Math.hypot(fx, fz);
    if (length <= 0.0001) {
      fx = 0;
      fz = -1;
    } else {
      fx /= length;
      fz /= length;
    }
    // Camera offset opposite the Core's facing direction = readable rear view.
    this.cameraYaw = Math.atan2(-fx, -fz);
  }

  alignInspectionCamera(inspection) {
    if (!inspection?.focusPosition || !this.playerCore) return;

    this.inspectionDirection.set(
      (inspection.focusPosition.x ?? this.playerCore.position.x) - this.playerCore.position.x,
      0,
      (inspection.focusPosition.z ?? this.playerCore.position.z) - this.playerCore.position.z
    );

    if (this.inspectionDirection.lengthSq() <= 0.0001) return;
    this.inspectionDirection.normalize();
    this.cameraYaw = Math.atan2(-this.inspectionDirection.x, -this.inspectionDirection.z);
  }

  updateCameraReadabilitySafely(dt) {
    if (!this.cameraReadabilitySystem) return;

    try {
      this.cameraReadabilitySystem.update(dt, this.frameState);
    } catch (error) {
      this.frameState.cameraReadability = {
        ...(this.frameState.cameraReadability ?? {}),
        pass: "HC-003M",
        foregroundFade: "inactive",
        occlusionIntensity: 0,
        occludedObjectId: "none",
        playerHalo: "active",
        autoPullback: 0,
        status: "non_fatal_error",
        note: `camera readability skipped: ${error?.message ?? String(error)}`
      };

      if (typeof this.registry?.recordNonFatalUpdateError === "function") {
        this.registry.recordNonFatalUpdateError("cameraReadabilitySystem", error, this.frameState);
      } else {
        console.warn("[GameRuntime] Non-fatal camera readability error:", error);
      }
    }
  }

  clampAngleAround(value, center, maxOffset) {
    let delta = value - center;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    return center + this.clamp(delta, -maxOffset, maxOffset);
  }

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  resize() {
    if (!this.renderer || !this.camera) return;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
