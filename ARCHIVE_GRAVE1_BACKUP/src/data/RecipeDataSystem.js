import { HOST_CORE_SOURCE_AUTHORITY } from "../core/HostCoreSourceAuthority.js";
export class RecipeDataSystem {
  constructor({ validationProfile = "first_slice_runtime" } = {}) {
    this.validationProfile = validationProfile;
    this.data = {
      hosts: new Map(),
      anatomyRecipes: new Map(),
      localCellRecipes: new Map(),
      firstSliceRegions: new Map(),
      firstSliceGates: new Map(),
      firstSliceObjectives: new Map(),
      firstSliceCameraProfiles: new Map(),
      firstSliceVisualLanguages: new Map(),
      hubChamberFoundationRecipes: new Map(),
      hubInvestigationGameplayRecipes: new Map(),
      firstSliceCohesion: null,
      firstSliceRuntimeProfile: null,
      firstVisibleCoreGrowth: null,
      graveMemoryRoutePreview: null,
      graveMemoryRouteCircuit: null,
      vascularRhythmRouteCircuit: null,
      vascularRhythmReturnConsequence: null,
      siltPressureRouteCircuit: null,
      siltPressureReturnConsequence: null,
      combThresholdFoundation: null,
      combThresholdPlayable: null,
      act1RouteContracts: null,
      returnRegionGrammar: null,
      chemicalDomains: new Map(),
      matterStates: new Map(),
      chemObjectRecipes: new Map(),
      bondRecipes: new Map(),
      functionRecipes: new Map(),
      entityRecipes: new Map(),
      orbiterRecipes: new Map(),
      visualCompositionRecipes: new Map(),
      placeholderReplacementRecipes: new Map(),
      morphPlans: new Map(),
      morphCompletionHookRecipes: new Map(),
      scarFlowInteractionRecipes: new Map(),
      guideThresholdGameplayRecipes: new Map(),
      guideThresholdLayeredInteractionRecipes: new Map(),
      signalChorusInteractionRecipes: new Map(),
      bloomResidueInteractionRecipes: new Map(),
      graveReadBeforeAbsorbRecipes: new Map(),
      graveScarMemorySeamFirstReadRecipes: new Map(),
      graveSeamContinuityMicroExitRecipes: new Map(),
      graveBedPostSeamResponseRecipes: new Map(),
      graveReturnContinuityRecipes: new Map(),
      signalChorusReturnStateRecipes: new Map(),
      signalChorusNextRoutePressureRecipes: new Map(),
      signalChorusVisualIdentityRecipes: new Map(),
      signalChorusLayeredInteractionRecipes: new Map(),
      surfaceWakeLayeredInteractionRecipes: new Map(),
      surfaceWakeGameplayRecipes: new Map(),
      surfaceWakeLivingCircuit: null,
      surfaceWakeEcologicalCausality: null,
      signalChorusInspectionCameraRecipes: new Map(),
      inspectionCameraProfiles: new Map(),
      secondMorphPlans: new Map(),
      scarFlowExitReadinessRules: new Map(),
      thirdMorphPlans: new Map(),
      graveRouteMorphPlans: new Map(),
      signalChorusExitReadinessRules: new Map(),
      targetFocusRules: new Map(),
      guidePromptRecipes: new Map(),
      openingFlowTuning: null,
      cinematicAwakeningBeat: null,
      blueprintTranslationLayer: null,
      firstRouteChoicePlanning: null,
      graveRouteRuntimePlanning: null,
      graveRouteRecipePack: null,
      graveRouteMorphPrototype: null,
      graveArrivalReadability: null,
      graveLoopStabilityExitReadiness: null,
      graveExitReadinessPrototype: null,
      graveRouteContinuityPlanning: null,
      graveScarMemorySeamRecipePack: null,
      graveScarMemorySeamVisualComposerSupport: null,
      graveScarMemorySeamArrivalPlanning: null,
      graveScarMemorySeamRuntimeArrival: null,
      graveScarMemorySeamFirstReadLoop: null,
      graveSeamContinuityMicroExit: null,
      graveBedPostSeamResponse: null,
      graveRouteLockState: null,
      graveReturnContinuity: null,
      signalChorusReturnState: null,
      signalChorusNextRoutePressure: null,
      signalChorusVisualIdentity: null,
      signalChorusLayeredInteraction: null,
      surfaceWakeLayeredInteraction: null,
      guideThresholdLayeredInteraction: null,
      signalChorusInspectionCamera: null,
      inspectionCameraProfile: null,
      placeholderVisualTriage: null,
      p0VisualLockReplacements: null,
      controllerOnboardingTuning: null,
      openingObjectivePromptLock: null,
      debugHiddenPlaytestMode: null,
      firstMinuteVisualReadabilityPolish: null,
      buildManifest: null,
      lockState: null,
      schemaValidationReport: null
    };
  }

  async loadAll() {
    const [
      hostAlpha,
      anatomyRecipes,
      localCellRecipes,
      firstSliceRegions,
      firstSliceGates,
      firstSliceObjectives,
      firstSliceCameraProfiles,
      firstSliceVisualLanguages,
      hubChamberFoundationRecipes,
      hubChamberPresentationLockRecipes,
      hubInvestigationGameplayRecipes,
      firstSliceCohesion,
      firstSliceRuntimeProfile,
      firstVisibleCoreGrowth,
      graveMemoryRoutePreview,
      graveMemoryRouteCircuit,
      vascularRhythmRouteCircuit,
      vascularRhythmReturnConsequence,
      siltPressureRouteCircuit,
      siltPressureReturnConsequence,
      combThresholdFoundation,
      combThresholdPlayable,
      act1RouteContracts,
      returnRegionGrammar,
      chemicalDomains,
      matterStates,
      chemObjectRecipes,
      bondRecipes,
      functionRecipes,
      entityRecipes,
      orbiterRecipes,
      visualCompositionRecipes,
      placeholderReplacementRecipes,
      morphPlans,
      morphCompletionHookRecipes,
      scarFlowInteractionRecipes,
      guideThresholdGameplayRecipes,
      guideThresholdLayeredInteractionRecipes,
      signalChorusInteractionRecipes,
      bloomResidueInteractionRecipes,
      graveReadBeforeAbsorbRecipes,
      graveScarMemorySeamFirstReadRecipes,
      graveSeamContinuityMicroExitRecipes,
      graveBedPostSeamResponseRecipes,
      graveRouteLockState,
      graveReturnContinuityRecipes,
      signalChorusReturnStateRecipes,
      signalChorusNextRoutePressureRecipes,
      signalChorusVisualIdentityRecipes,
      signalChorusLayeredInteractionRecipes,
      surfaceWakeLayeredInteractionRecipes,
      surfaceWakeGameplayRecipes,
      surfaceWakeLivingCircuit,
      surfaceWakeEcologicalCausality,
      signalChorusInspectionCameraRecipes,
      inspectionCameraProfiles,
      secondMorphPlans,
      scarFlowExitReadinessRules,
      thirdMorphPlans,
      graveRouteMorphPlans,
      signalChorusExitReadinessRules,
      targetFocusRules,
      guidePromptRecipes,
      openingFlowTuning,
      cinematicAwakeningBeat,
      blueprintTranslationLayer,
      firstRouteChoicePlanning,
      graveRouteRuntimePlanning,
      graveRouteRecipePack,
      graveRouteMorphPrototype,
      graveArrivalReadability,
      graveLoopStabilityExitReadiness,
      graveExitReadinessPrototype,
      graveRouteContinuityPlanning,
      graveScarMemorySeamRecipePack,
      graveScarMemorySeamVisualComposerSupport,
      graveScarMemorySeamArrivalPlanning,
      graveScarMemorySeamRuntimeArrival,
      placeholderVisualTriage,
      p0VisualLockReplacements,
      controllerOnboardingTuning,
      openingObjectivePromptLock,
      debugHiddenPlaytestMode,
      firstMinuteVisualReadabilityPolish,
      buildManifest,
      lockState
    ] = await Promise.all([
      this.loadJson("/data/hosts/HOST_ALPHA_WOUNDED_NURSERY.json"),
      this.loadJson("/data/world/anatomyRecipes.json"),
      this.loadJson("/data/world/localCellRecipes.json"),
      this.loadJson("/data/world/firstSliceRegions_HC006I.json"),
      this.loadJson("/data/gates/firstSliceGates_HC006I.json"),
      this.loadJson("/data/objectives/firstSliceObjectives_HC006I.json"),
      this.loadJson("/data/camera/firstSliceCameraProfiles_HC006I.json"),
      this.loadJson("/data/visual/firstSliceVisualLanguages_HC006I.json"),
      this.loadJson("/data/hub/hubChamberFoundation_HC006J.json"),
      this.loadJson("/data/hub/hubChamberPresentationLock_HC006JA.json"),
      this.loadJson("/data/hub/hubInvestigationGameplay_HC007C.json"),
      this.loadJson("/data/core/firstSliceCohesion_HC007E.json"),
      this.loadJson("/data/runtime/act1RuntimeProfile_HC016M.json"),
      this.loadJson("/data/core/firstVisibleCoreGrowth_HC009D.json"),
      this.loadJson("/data/routes/graveMemoryRoutePreview_HC010A.json"),
      this.loadJson("/data/routes/graveMemoryRouteCircuit_HC010B.json"),
      this.loadJson("/data/routes/vascularRhythmRouteCircuit_HC011A1.json"),
      this.loadJson("/data/routes/vascularRhythmReturnConsequence_HC011B.json"),
      this.loadJson("/data/routes/siltPressureRouteCircuit_HC012A.json"),
      this.loadJson("/data/routes/siltPressureReturnConsequence_HC012B.json"),
      this.loadJson("/data/thresholds/combThresholdFoundation_HC013A.json"),
      this.loadJson("/data/thresholds/combThresholdPlayable_HC013B.json"),
      this.loadJson("/data/routes/act1RouteContracts_HC012A.json"),
      this.loadJson("/data/routes/returnRegionGrammar_HC031A1.json"),
      this.loadJson("/data/chemistry/chemicalDomains.json"),
      this.loadJson("/data/chemistry/matterStates.json"),
      this.loadJson("/data/chemistry/chemObjectRecipes.json"),
      this.loadJson("/data/chemistry/bondRecipes.json"),
      this.loadJson("/data/ecology/functionRecipes.json"),
      this.loadJson("/data/ecology/entityRecipes.json"),
      this.loadJson("/data/orbiters/orbiterRecipes.json"),
      this.loadJson("/data/visual/visualCompositionRecipes.json"),
      this.loadJson("/data/visual/placeholderReplacementRecipes.json"),
      this.loadJson("/data/morph/localCellMorphPlans.json"),
      this.loadJson("/data/morph/morphCompletionHookRecipes.json"),
      this.loadJson("/data/morph/scarFlowInteractionRecipes.json"),
      this.loadJson("/data/morph/guideThresholdGameplayRecipes.json"),
      this.loadJson("/data/morph/guideThresholdLayeredInteractionRecipes.json"),
      this.loadJson("/data/morph/signalChorusInteractionRecipes.json"),
      this.loadJson("/data/morph/bloomResidueInteractionRecipes.json"),
      this.loadJson("/data/morph/graveReadBeforeAbsorbRecipes.json"),
      this.loadJson("/data/morph/graveScarMemorySeamFirstReadRecipes.json"),
      this.loadJson("/data/morph/graveSeamContinuityMicroExitRecipes.json"),
      this.loadJson("/data/morph/graveBedPostSeamResponseRecipes.json"),
      this.loadJson("/data/lock/graveRouteLockState_HC004R.json"),
      this.loadJson("/data/morph/graveReturnContinuityRecipes.json"),
      this.loadJson("/data/morph/signalChorusReturnStateRecipes.json"),
      this.loadJson("/data/morph/signalChorusNextRoutePressureRecipes.json"),
      this.loadJson("/data/visual/signalChorusVisualIdentity_HC006A.json"),
      this.loadJson("/data/morph/signalChorusLayeredInteractionRecipes.json"),
      this.loadJson("/data/opening/surfaceWakeLayeredInteractionRecipes.json"),
      this.loadJson("/data/opening/surfaceWakeGameplayRecipes.json"),
      this.loadJson("/data/opening/surfaceWakeLivingCircuit_HC009C.json"),
      this.loadJson("/data/opening/surfaceWakeEcologicalCausality_HC008B.json"),
      this.loadJson("/data/camera/signalChorusInspectionCameraRecipes.json"),
      this.loadJson("/data/camera/inspectionCameraProfiles.json"),
      this.loadJson("/data/morph/secondLocalCellMorphPlans.json"),
      this.loadJson("/data/morph/scarFlowExitReadinessRules.json"),
      this.loadJson("/data/morph/thirdLocalCellMorphPlans.json"),
      this.loadJson("/data/morph/graveRouteMorphPlans.json"),
      this.loadJson("/data/morph/signalChorusExitReadinessRules.json"),
      this.loadJson("/data/targeting/targetFocusRules.json"),
      this.loadJson("/data/guide/guidePromptRecipes.json"),
      this.loadJson("/data/pacing/openingFlowTuning_HC003C.json"),
      this.loadJson("/data/cinematic/cinematicAwakeningBeat_HC003D.json"),
      this.validationProfile === "legacy_archive" ? this.loadJson("/data/planning/blueprintTranslationLayer_HC003F.json") : Promise.resolve(null),
      this.validationProfile === "legacy_archive" ? this.loadJson("/data/planning/firstRouteChoicePlanning_HC003G.json") : Promise.resolve(null),
      this.validationProfile === "legacy_archive" ? this.loadJson("/data/planning/graveRouteRuntimePlanning_HC004A.json") : Promise.resolve(null),
      this.validationProfile === "legacy_archive" ? this.loadJson("/data/planning/graveRouteRecipePack_HC004B.json") : Promise.resolve(null),
      this.validationProfile === "legacy_archive" ? this.loadJson("/data/planning/graveRouteMorphPrototype_HC004D.json") : Promise.resolve(null),
      this.validationProfile === "legacy_archive" ? this.loadJson("/data/planning/graveArrivalReadability_HC004E.json") : Promise.resolve(null),
      this.validationProfile === "legacy_archive" ? this.loadJson("/data/planning/graveLoopStabilityAndExitReadiness_HC004G.json") : Promise.resolve(null),
      this.validationProfile === "legacy_archive" ? this.loadJson("/data/planning/graveExitReadinessPrototype_HC004H.json") : Promise.resolve(null),
      this.validationProfile === "legacy_archive" ? this.loadJson("/data/planning/graveRouteContinuityPlanning_HC004I.json") : Promise.resolve(null),
      this.validationProfile === "legacy_archive" ? this.loadJson("/data/planning/graveScarMemorySeamRecipePack_HC004J.json") : Promise.resolve(null),
      this.validationProfile === "legacy_archive" ? this.loadJson("/data/planning/graveScarMemorySeamVisualComposerSupport_HC004K.json") : Promise.resolve(null),
      this.validationProfile === "legacy_archive" ? this.loadJson("/data/planning/graveScarMemorySeamArrivalPlanning_HC004L.json") : Promise.resolve(null),
      this.validationProfile === "legacy_archive" ? this.loadJson("/data/planning/graveScarMemorySeamRuntimeArrival_HC004M.json") : Promise.resolve(null),
      this.loadJson("/data/visual/placeholderVisualTriage_HC003J.json"),
      this.loadJson("/data/visual/p0VisualLockReplacements_HC003J.json"),
      this.loadJson("/data/input/controllerOnboardingTuning_HC003I.json"),
      this.loadJson("/data/ui/openingObjectivePromptLock_HC003K.json"),
      this.loadJson("/data/ui/debugHiddenPlaytestMode_HC003L.json"),
      this.loadJson("/data/visual/firstMinuteVisualReadabilityPolish_HC003M.json"),
      this.loadJson("/data/build/buildManifest.json"),
      this.loadJson("/data/lock/hc003FirstPlayableMinuteLockState.json")
    ]);

    this.addOne(this.data.hosts, hostAlpha);
    this.addMany(this.data.anatomyRecipes, anatomyRecipes);
    this.addMany(this.data.localCellRecipes, localCellRecipes);
    this.addMany(this.data.firstSliceRegions, firstSliceRegions);
    this.addMany(this.data.firstSliceGates, firstSliceGates);
    this.addMany(this.data.firstSliceObjectives, firstSliceObjectives);
    this.addMany(this.data.firstSliceCameraProfiles, firstSliceCameraProfiles);
    this.addMany(this.data.firstSliceVisualLanguages, firstSliceVisualLanguages);
    this.addMany(this.data.hubChamberFoundationRecipes, hubChamberFoundationRecipes);
    this.addMany(this.data.hubChamberFoundationRecipes, hubChamberPresentationLockRecipes);
    this.addMany(this.data.hubInvestigationGameplayRecipes, hubInvestigationGameplayRecipes);
    this.data.firstSliceCohesion = firstSliceCohesion;
    this.data.firstSliceRuntimeProfile = firstSliceRuntimeProfile;
    this.data.firstVisibleCoreGrowth = firstVisibleCoreGrowth;
    this.data.graveMemoryRoutePreview = graveMemoryRoutePreview;
    this.data.graveMemoryRouteCircuit = graveMemoryRouteCircuit;
    this.data.vascularRhythmRouteCircuit = vascularRhythmRouteCircuit;
    this.data.vascularRhythmReturnConsequence = vascularRhythmReturnConsequence;
    this.data.siltPressureRouteCircuit = siltPressureRouteCircuit;
    this.data.siltPressureReturnConsequence = siltPressureReturnConsequence;
    this.data.combThresholdFoundation = combThresholdFoundation;
    this.data.combThresholdPlayable = combThresholdPlayable;
    this.data.act1RouteContracts = act1RouteContracts;
    this.data.returnRegionGrammar = returnRegionGrammar;
    this.addMany(this.data.chemicalDomains, chemicalDomains);
    this.addMany(this.data.matterStates, matterStates);
    this.addMany(this.data.chemObjectRecipes, chemObjectRecipes);
    this.addMany(this.data.bondRecipes, bondRecipes);
    this.addMany(this.data.functionRecipes, functionRecipes);
    this.addMany(this.data.entityRecipes, entityRecipes);
    this.addMany(this.data.orbiterRecipes, orbiterRecipes);
    this.addMany(this.data.visualCompositionRecipes, visualCompositionRecipes);
    this.addMany(
      this.data.placeholderReplacementRecipes,
      placeholderReplacementRecipes
    );
    this.addMany(this.data.morphPlans, morphPlans);
    this.addMany(this.data.morphCompletionHookRecipes, morphCompletionHookRecipes);
    this.addMany(this.data.scarFlowInteractionRecipes, scarFlowInteractionRecipes);
    this.addMany(this.data.guideThresholdGameplayRecipes, guideThresholdGameplayRecipes);
    this.addMany(this.data.guideThresholdLayeredInteractionRecipes, guideThresholdLayeredInteractionRecipes);
    this.data.guideThresholdLayeredInteraction = guideThresholdLayeredInteractionRecipes?.[0] ?? null;
    this.addMany(this.data.signalChorusInteractionRecipes, signalChorusInteractionRecipes);
    this.addMany(this.data.bloomResidueInteractionRecipes, bloomResidueInteractionRecipes);
    this.addMany(this.data.graveReadBeforeAbsorbRecipes, graveReadBeforeAbsorbRecipes);
    this.addMany(this.data.graveScarMemorySeamFirstReadRecipes, graveScarMemorySeamFirstReadRecipes);
    this.data.graveScarMemorySeamFirstReadLoop = graveScarMemorySeamFirstReadRecipes?.[0] ?? null;
    this.addMany(this.data.graveSeamContinuityMicroExitRecipes, graveSeamContinuityMicroExitRecipes);
    this.data.graveSeamContinuityMicroExit = graveSeamContinuityMicroExitRecipes?.[0] ?? null;
    this.addMany(this.data.graveBedPostSeamResponseRecipes, graveBedPostSeamResponseRecipes);
    this.data.graveBedPostSeamResponse = graveBedPostSeamResponseRecipes?.[0] ?? null;
    this.data.graveRouteLockState = graveRouteLockState;
    this.addMany(this.data.graveReturnContinuityRecipes, graveReturnContinuityRecipes);
    this.data.graveReturnContinuity = graveReturnContinuityRecipes?.[0] ?? null;
    this.addMany(this.data.signalChorusReturnStateRecipes, signalChorusReturnStateRecipes);
    this.data.signalChorusReturnState = signalChorusReturnStateRecipes?.[0] ?? null;
    this.addMany(this.data.signalChorusNextRoutePressureRecipes, signalChorusNextRoutePressureRecipes);
    this.data.signalChorusNextRoutePressure = signalChorusNextRoutePressureRecipes?.[0] ?? null;
    this.addMany(this.data.signalChorusVisualIdentityRecipes, signalChorusVisualIdentityRecipes);
    this.data.signalChorusVisualIdentity = signalChorusVisualIdentityRecipes?.[0] ?? null;
    this.addMany(this.data.signalChorusLayeredInteractionRecipes, signalChorusLayeredInteractionRecipes);
    this.data.signalChorusLayeredInteraction = signalChorusLayeredInteractionRecipes?.[0] ?? null;
    this.addMany(this.data.surfaceWakeLayeredInteractionRecipes, surfaceWakeLayeredInteractionRecipes);
    this.data.surfaceWakeLayeredInteraction = surfaceWakeLayeredInteractionRecipes?.[0] ?? null;
    this.addMany(this.data.surfaceWakeGameplayRecipes, surfaceWakeGameplayRecipes);
    this.data.surfaceWakeLivingCircuit = surfaceWakeLivingCircuit;
    this.data.surfaceWakeEcologicalCausality = surfaceWakeEcologicalCausality;
    this.addMany(this.data.signalChorusInspectionCameraRecipes, signalChorusInspectionCameraRecipes);
    this.data.signalChorusInspectionCamera = signalChorusInspectionCameraRecipes?.[0] ?? null;
    this.addMany(this.data.inspectionCameraProfiles, inspectionCameraProfiles);
    this.data.inspectionCameraProfile = inspectionCameraProfiles?.[0] ?? null;
    this.addMany(this.data.secondMorphPlans, secondMorphPlans);
    this.addMany(this.data.scarFlowExitReadinessRules, scarFlowExitReadinessRules);
    this.addMany(this.data.thirdMorphPlans, thirdMorphPlans);
    this.addMany(this.data.graveRouteMorphPlans, graveRouteMorphPlans);
    this.addMany(this.data.signalChorusExitReadinessRules, signalChorusExitReadinessRules);
    this.addMany(this.data.targetFocusRules, targetFocusRules);
    this.addMany(this.data.guidePromptRecipes, guidePromptRecipes);
    this.data.openingFlowTuning = openingFlowTuning;
    this.data.cinematicAwakeningBeat = cinematicAwakeningBeat;
    this.data.blueprintTranslationLayer = blueprintTranslationLayer;
    this.data.firstRouteChoicePlanning = firstRouteChoicePlanning;
    this.data.graveRouteRuntimePlanning = graveRouteRuntimePlanning;
    this.data.graveRouteRecipePack = graveRouteRecipePack;
    this.data.graveRouteMorphPrototype = graveRouteMorphPrototype;
    this.data.graveArrivalReadability = graveArrivalReadability;
    this.data.graveLoopStabilityExitReadiness = graveLoopStabilityExitReadiness;
    this.data.graveExitReadinessPrototype = graveExitReadinessPrototype;
    this.data.graveRouteContinuityPlanning = graveRouteContinuityPlanning;
    this.data.graveScarMemorySeamRecipePack = graveScarMemorySeamRecipePack;
    this.data.graveScarMemorySeamVisualComposerSupport = graveScarMemorySeamVisualComposerSupport;
    this.data.graveScarMemorySeamArrivalPlanning = graveScarMemorySeamArrivalPlanning;
    this.data.graveScarMemorySeamRuntimeArrival = graveScarMemorySeamRuntimeArrival;
    this.data.placeholderVisualTriage = placeholderVisualTriage;
    this.data.p0VisualLockReplacements = p0VisualLockReplacements;
    this.data.controllerOnboardingTuning = controllerOnboardingTuning;
    this.data.openingObjectivePromptLock = openingObjectivePromptLock;
    this.data.debugHiddenPlaytestMode = debugHiddenPlaytestMode;
    this.data.firstMinuteVisualReadabilityPolish = firstMinuteVisualReadabilityPolish;
    this.data.buildManifest = buildManifest;
    this.data.lockState = lockState;

    this.validateFirstSliceRuntimeData();
    if (this.validationProfile === "legacy_archive") {
      this.validateCoreRecipeIds();
    } else if (this.validationProfile !== "first_slice_runtime") {
      throw new Error(`[RecipeDataSystem] Unknown validation profile: ${this.validationProfile}`);
    }
    this.data.schemaValidationReport = this.validateSchemaReferences();
    this.data.schemaValidationReport.validationProfile = this.validationProfile;

    return this.data;
  }

  async loadJson(path) {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(
        `[RecipeDataSystem] Failed to load ${path}: ${response.status}`
      );
    }

    return response.json();
  }

  addOne(map, recipe) {
    if (!recipe?.id) {
      throw new Error("[RecipeDataSystem] Recipe missing id.");
    }

    if (map.has(recipe.id)) {
      throw new Error(`[RecipeDataSystem] Duplicate recipe id: ${recipe.id}`);
    }

    map.set(recipe.id, recipe);
  }

  addMany(map, recipes) {
    if (!Array.isArray(recipes)) {
      throw new Error("[RecipeDataSystem] Expected recipe array.");
    }

    for (const recipe of recipes) {
      this.addOne(map, recipe);
    }
  }

  get(category, id) {
    const map = this.data[category];

    if (!map) {
      throw new Error(`[RecipeDataSystem] Unknown recipe category: ${category}`);
    }

    const recipe = map.get(id);

    if (!recipe) {
      throw new Error(
        `[RecipeDataSystem] Missing recipe ${id} in category ${category}`
      );
    }

    return recipe;
  }

  getCounts() {
    return {
      hosts: this.data.hosts.size,
      localCells: this.data.localCellRecipes.size,
      firstSliceRegions: this.data.firstSliceRegions.size,
      firstSliceGates: this.data.firstSliceGates.size,
      firstSliceObjectives: this.data.firstSliceObjectives.size,
      firstSliceCameraProfiles: this.data.firstSliceCameraProfiles.size,
      firstSliceVisualLanguages: this.data.firstSliceVisualLanguages.size,
      hubChamberFoundationRecipes: this.data.hubChamberFoundationRecipes.size,
      hubInvestigationGameplayRecipes: this.data.hubInvestigationGameplayRecipes.size,
      firstSliceCohesion: this.data.firstSliceCohesion ? 1 : 0,
      firstSliceRuntimeProfile: this.data.firstSliceRuntimeProfile ? 1 : 0,
      firstVisibleCoreGrowth: this.data.firstVisibleCoreGrowth ? 1 : 0,
      graveMemoryRoutePreview: this.data.graveMemoryRoutePreview ? 1 : 0,
      graveMemoryRouteCircuit: this.data.graveMemoryRouteCircuit ? 1 : 0,
      vascularRhythmRouteCircuit: this.data.vascularRhythmRouteCircuit ? 1 : 0,
      vascularRhythmReturnConsequence: this.data.vascularRhythmReturnConsequence ? 1 : 0,
      siltPressureRouteCircuit: this.data.siltPressureRouteCircuit ? 1 : 0,
      siltPressureReturnConsequence: this.data.siltPressureReturnConsequence ? 1 : 0,
      combThresholdFoundation: this.data.combThresholdFoundation ? 1 : 0,
      combThresholdPlayable: this.data.combThresholdPlayable ? 1 : 0,
      act1RouteContracts: this.data.act1RouteContracts ? 1 : 0,
      validationProfile: this.validationProfile,
      visualRecipes: this.data.visualCompositionRecipes.size,
      placeholders: this.data.placeholderReplacementRecipes.size,
      chemObjects: this.data.chemObjectRecipes.size,
      bondRecipes: this.data.bondRecipes.size,
      functionRecipes: this.data.functionRecipes.size,
      entityRecipes: this.data.entityRecipes.size,
      orbiterRecipes: this.data.orbiterRecipes.size,
      morphPlans: this.data.morphPlans.size,
      morphCompletionHooks: this.data.morphCompletionHookRecipes.size,
      scarFlowInteractions: this.data.scarFlowInteractionRecipes.size,
      guideThresholdLayeredInteractionRecipes: this.data.guideThresholdLayeredInteractionRecipes.size,
      signalChorusInteractions: this.data.signalChorusInteractionRecipes.size,
      bloomResidueInteractions: this.data.bloomResidueInteractionRecipes.size,
      graveReadBeforeAbsorbLoops: this.data.graveReadBeforeAbsorbRecipes.size,
      graveScarMemorySeamFirstReadLoops: this.data.graveScarMemorySeamFirstReadRecipes.size,
      graveSeamContinuityMicroExitRecipes: this.data.graveSeamContinuityMicroExitRecipes.size,
      graveBedPostSeamResponseRecipes: this.data.graveBedPostSeamResponseRecipes.size,
      graveReturnContinuityRecipes: this.data.graveReturnContinuityRecipes.size,
      signalChorusReturnStateRecipes: this.data.signalChorusReturnStateRecipes.size,
      signalChorusNextRoutePressureRecipes: this.data.signalChorusNextRoutePressureRecipes.size,
      signalChorusVisualIdentityRecipes: this.data.signalChorusVisualIdentityRecipes.size,
      signalChorusLayeredInteractionRecipes: this.data.signalChorusLayeredInteractionRecipes.size,
      surfaceWakeLayeredInteractionRecipes: this.data.surfaceWakeLayeredInteractionRecipes.size,
      surfaceWakeGameplayRecipes: this.data.surfaceWakeGameplayRecipes.size,
      surfaceWakeLivingCircuit: this.data.surfaceWakeLivingCircuit ? 1 : 0,
      surfaceWakeEcologicalCausality: this.data.surfaceWakeEcologicalCausality ? 1 : 0,
      signalChorusInspectionCameraRecipes: this.data.signalChorusInspectionCameraRecipes.size,
      inspectionCameraProfiles: this.data.inspectionCameraProfiles.size,
      secondMorphPlans: this.data.secondMorphPlans.size,
      thirdMorphPlans: this.data.thirdMorphPlans.size,
      graveRouteMorphPlans: this.data.graveRouteMorphPlans.size,
      signalChorusExitRules: this.data.signalChorusExitReadinessRules.size,
      schemaWarnings: this.data.schemaValidationReport?.warnings?.length ?? 0,
      targetFocusRules: this.data.targetFocusRules.size,
      guidePromptRecipes: this.data.guidePromptRecipes.size,
      openingFlowTuning: this.data.openingFlowTuning ? 1 : 0,
      cinematicAwakeningBeat: this.data.cinematicAwakeningBeat ? 1 : 0,
      blueprintTranslationLayer: this.data.blueprintTranslationLayer ? 1 : 0,
      firstRouteChoicePlanning: this.data.firstRouteChoicePlanning ? 1 : 0,
      graveRouteRuntimePlanning: this.data.graveRouteRuntimePlanning ? 1 : 0,
      graveRouteRecipePack: this.data.graveRouteRecipePack ? 1 : 0,
      graveRouteMorphPrototype: this.data.graveRouteMorphPrototype ? 1 : 0,
      graveArrivalReadability: this.data.graveArrivalReadability ? 1 : 0,
      graveLoopStabilityExitReadiness: this.data.graveLoopStabilityExitReadiness ? 1 : 0,
      graveExitReadinessPrototype: this.data.graveExitReadinessPrototype ? 1 : 0,
      graveRouteContinuityPlanning: this.data.graveRouteContinuityPlanning ? 1 : 0,
      graveScarMemorySeamRecipePack: this.data.graveScarMemorySeamRecipePack ? 1 : 0,
      graveScarMemorySeamVisualComposerSupport: this.data.graveScarMemorySeamVisualComposerSupport ? 1 : 0,
      graveScarMemorySeamArrivalPlanning: this.data.graveScarMemorySeamArrivalPlanning ? 1 : 0,
      graveScarMemorySeamRuntimeArrival: this.data.graveScarMemorySeamRuntimeArrival ? 1 : 0,
      graveScarMemorySeamFirstReadLoop: this.data.graveScarMemorySeamFirstReadLoop ? 1 : 0,
      graveSeamContinuityMicroExit: this.data.graveSeamContinuityMicroExit ? 1 : 0,
      graveBedPostSeamResponse: this.data.graveBedPostSeamResponse ? 1 : 0,
      graveRouteLockState: this.data.graveRouteLockState ? 1 : 0,
      graveReturnContinuity: this.data.graveReturnContinuity ? 1 : 0,
      signalChorusReturnState: this.data.signalChorusReturnState ? 1 : 0,
      signalChorusNextRoutePressure: this.data.signalChorusNextRoutePressure ? 1 : 0,
      signalChorusVisualIdentity: this.data.signalChorusVisualIdentity ? 1 : 0,
      surfaceWakeLayeredInteraction: this.data.surfaceWakeLayeredInteraction ? 1 : 0,
      signalChorusInspectionCamera: this.data.signalChorusInspectionCamera ? 1 : 0,
      placeholderVisualTriage: this.data.placeholderVisualTriage ? 1 : 0,
      p0VisualLockReplacements: this.data.p0VisualLockReplacements ? 1 : 0,
      controllerOnboardingTuning: this.data.controllerOnboardingTuning ? 1 : 0,
      openingObjectivePromptLock: this.data.openingObjectivePromptLock ? 1 : 0,
      debugHiddenPlaytestMode: this.data.debugHiddenPlaytestMode ? 1 : 0,
      firstMinuteVisualReadabilityPolish: this.data.firstMinuteVisualReadabilityPolish ? 1 : 0
    };
  }

  validateFirstSliceRuntimeData() {
    this.get("hosts", "HOST_ALPHA_WOUNDED_NURSERY");
    this.get("anatomyRecipes", "membrane_layer");

    const requiredCells = [
      "CELL_MEMBRANE_NURSERY_001",
      "CELL_SCAR_FLOW_FOLD_001",
      "CELL_SIGNAL_CHORUS_NERVE_001",
      "CELL_GRAVE_MEMORY_RESIDUE_BED_001",
      "CELL_VASCULAR_RHYTHM_ROUTE_001",
      "CELL_SILT_PRESSURE_ROUTE_001",
      "CELL_COMB_THRESHOLD_FILTER_001",
      "CELL_APERTURE_FIELDS_ARRIVAL_001"
    ];
    for (const cellId of requiredCells) this.get("localCellRecipes", cellId);

    const requiredRegions = [
      "surface_wake",
      "guide_threshold",
      "hub_chamber",
      "grave_memory_route",
      "vascular_route",
      "silt_burrow_route",
      "comb_threshold",
      "aperture_fields"
    ];
    for (const regionId of requiredRegions) this.get("firstSliceRegions", regionId);

    for (const id of [
      "surface_to_guide_threshold",
      "guide_to_hub_chamber",
      "hub_to_grave_memory_route",
      "hub_to_vascular_route",
      "hub_to_silt_burrow_route",
      "grave_memory_to_hub_chamber",
      "vascular_route_to_hub_chamber",
      "silt_burrow_route_to_hub_chamber",
      "hub_to_comb_threshold",
      "comb_threshold_to_hub_chamber",
      "comb_threshold_to_aperture_fields"
    ]) {
      this.get("firstSliceGates", id);
    }

    for (const id of [
      "surface_absorb_first_nutrient",
      "guide_stabilize_and_cross",
      "hub_read_route_gates",
      "grave_memory_read_and_stabilize",
      "vascular_route_playable_circuit",
      "silt_route_playable_circuit",
      "comb_threshold_playable_synthesis"
    ]) {
      this.get("firstSliceObjectives", id);
    }

    for (const id of [
      "camera_surface_wake_landing",
      "camera_guide_threshold_directional",
      "camera_hub_chamber_interpretive",
      "camera_grave_memory_route",
      "camera_vascular_rhythm_contract",
      "camera_silt_pressure_contract",
      "camera_comb_threshold_filter"
    ]) {
      this.get("firstSliceCameraProfiles", id);
    }

    for (const id of [
      "surface_wake_embryonic_membrane",
      "guide_threshold_pressurized_current",
      "hub_chamber_route_chorus",
      "grave_memory_residue_bed",
      "vascular_rhythm_contract",
      "silt_pressure_contract",
      "comb_threshold_living_filter"
    ]) {
      this.get("firstSliceVisualLanguages", id);
    }

    for (const id of [
      "player_seed_core_stage_01",
      "nursery_membrane_tender_v01",
      "membrane_watcher_v01",
      "guide_orbiter_folded_lantern_v01"
    ]) {
      this.get("visualCompositionRecipes", id);
    }

    for (const id of [
      "debug_player_core_001",
      "debug_tender_001",
      "debug_watcher_001",
      "debug_guide_orbiter_001"
    ]) {
      this.get("placeholderReplacementRecipes", id);
    }

    for (const id of ["repair_filter_protect", "sense_warn_record"]) {
      this.get("functionRecipes", id);
    }
    for (const id of ["nursery_membrane_tender_001", "membrane_watcher_001"]) {
      this.get("entityRecipes", id);
    }
    this.get("orbiterRecipes", "guide_orbiter_folded_lantern_001");
    for (const id of ["soft_bond", "flow_bond", "scar_bond", "resonant_bond"]) {
      this.get("bondRecipes", id);
    }

    this.get("surfaceWakeGameplayRecipes", "SURFACE_WAKE_GAMEPLAY_FILL_HC007A");
    if (this.data.surfaceWakeLivingCircuit?.id !== "SURFACE_WAKE_LIVING_NURSERY_CIRCUIT_HC009C") {
      throw new Error("[RecipeDataSystem] Missing HC-009C living nursery circuit recipe.");
    }
    if (
      this.data.surfaceWakeLivingCircuit?.agencyLock?.pass !== "HC-009E"
      || this.data.surfaceWakeLivingCircuit?.agencyLock?.pulseRequiredBeforeFiltering !== true
      || this.data.surfaceWakeLivingCircuit?.constraints?.passiveSuccessCanRevealFold !== false
    ) {
      throw new Error("[RecipeDataSystem] Missing HC-009E nursery agency lock.");
    }
    if (this.data.firstVisibleCoreGrowth?.id !== "FIRST_VISIBLE_CORE_GROWTH_HC009D") {
      throw new Error("[RecipeDataSystem] Missing HC-009D first visible Core-growth recipe.");
    }
    this.get("surfaceWakeLayeredInteractionRecipes", "SURFACE_WAKE_LAYERED_INTERACTION_HC006E");
    this.get("guideThresholdGameplayRecipes", "GUIDE_THRESHOLD_GAMEPLAY_FILL_HC007B");
    this.get("guideThresholdLayeredInteractionRecipes", "GUIDE_THRESHOLD_LAYERED_INTERACTION_HC006F");
    this.get("morphPlans", "MORPH_MEMBRANE_TO_SCAR_FLOW_001");
    this.get("secondMorphPlans", "MORPH_SCAR_FLOW_TO_SIGNAL_CHORUS_001");
    this.get("scarFlowInteractionRecipes", "SCAR_FLOW_LOOP_001");
    this.get("hubChamberFoundationRecipes", "HUB_CHAMBER_FOUNDATION_HC006J");
    this.get("hubChamberFoundationRecipes", "HUB_CHAMBER_PRESENTATION_LOCK_HC006JA");
    this.get("hubInvestigationGameplayRecipes", "HUB_INVESTIGATION_GAMEPLAY_HC007C");

    if (this.data.firstSliceCohesion?.id !== "FIRST_SLICE_COHESION_HC007E") {
      throw new Error("[RecipeDataSystem] Missing first-slice cohesion recipe.");
    }
    if (
      this.data.firstSliceCohesion?.sliceLock?.pass !== "HC-009E"
      || this.data.firstSliceCohesion?.sliceLock?.staleSignalChorusCompletionDependency !== false
    ) {
      throw new Error("[RecipeDataSystem] Missing HC-009E vertical-slice lock definition.");
    }

    const profile = this.data.firstSliceRuntimeProfile;
    if (!profile || profile.id !== "ACT1_RUNTIME_PROFILE_HC014G" || !["HC-014I", "HC-014J", "HC-014K", "HC-014L", "HC-015B", "HC-015C", "HC-015E", "HC-015F", "HC-015G", "HC-015H", "HC-015I", "HC-015J", "HC-015K", "HC-015L", "HC-015M", "HC-015N"].includes(profile.pass)) {
      throw new Error("[RecipeDataSystem] Missing or unsupported Act 1/Aperture runtime profile for the current successor build.");
    }
    if (profile.sourceAuthority !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-014A runtime profile must use the authoritative HOST CORE package.");
    }
    const lockedFirstSliceRegions = requiredRegions.slice(0, 3);
    const lockedFirstSliceCells = requiredCells.slice(0, 3);
    if ((profile.firstSlicePath ?? []).join("|") !== lockedFirstSliceRegions.join("|")) {
      throw new Error("[RecipeDataSystem] HC-013B runtime profile changed the locked first-slice path.");
    }
    if ((profile.runtimeCellPath ?? []).join("|") !== lockedFirstSliceCells.join("|")) {
      throw new Error("[RecipeDataSystem] HC-013B runtime profile changed the locked first-slice runtime-cell path.");
    }
    if ((profile.act1PreviewPath ?? []).join("|") !== requiredRegions.join("|")) {
      throw new Error("[RecipeDataSystem] HC-014A runtime profile must retain the first slice, all three route readings, Comb Threshold, and the Aperture arrival boundary.");
    }
    if ((profile.act1PreviewCellPath ?? []).join("|") !== requiredCells.join("|")) {
      throw new Error("[RecipeDataSystem] HC-014A runtime profile must retain all eight authored runtime cells.");
    }

    const globalIds = new Set(profile.globalSystemIds ?? []);
    const sharedIds = new Set(profile.sharedSystemIds ?? []);
    const dormantIds = new Set(profile.dormantCompatibilitySystemIds ?? []);
    if (!globalIds.size || !sharedIds.size || !dormantIds.size) {
      throw new Error("[RecipeDataSystem] HC-010B runtime profile requires global, shared, and dormant system declarations.");
    }
    if (!globalIds.has("playerMovement") || !globalIds.has("coreGrowthSystem") || globalIds.has("coreEmbodimentSystem")) {
      throw new Error("[RecipeDataSystem] HC-010B requires PlayerMovementController plus one CoreGrowthSystem registry slot; CoreEmbodimentSystem must remain its collaborator rather than a second updater.");
    }
    for (const id of dormantIds) {
      if (globalIds.has(id) || sharedIds.has(id)) {
        throw new Error(`[RecipeDataSystem] Dormant compatibility system is active in HC-010B: ${id}`);
      }
    }

    for (const regionId of requiredRegions) {
      const mount = profile.regions?.[regionId];
      if (!mount) throw new Error(`[RecipeDataSystem] HC-010B runtime mount missing region: ${regionId}`);
      if (!mount.modeId || !mount.gameplayOwner || !mount.presentationOwner || !mount.cameraOwner) {
        throw new Error(`[RecipeDataSystem] HC-010B runtime mount lacks a single owner set: ${regionId}`);
      }
      const regionSystems = mount.systemIds ?? [];
      if (new Set(regionSystems).size !== regionSystems.length) {
        throw new Error(`[RecipeDataSystem] HC-010B runtime mount repeats a system: ${regionId}`);
      }
      for (const id of regionSystems) {
        if (dormantIds.has(id)) {
          throw new Error(`[RecipeDataSystem] HC-010B region mount activates archived system ${id}`);
        }
      }
      const expectedBudget = sharedIds.size + regionSystems.length;
      if (mount.activeUpdateBudget !== expectedBudget) {
        throw new Error(`[RecipeDataSystem] HC-010B ${regionId} update budget must equal its authored mount (${expectedBudget}).`);
      }
    }
    const routeContract = this.data.act1RouteContracts;
    const topologyContract = profile.threeRouteRuntimeContract ?? {};
    const contractRouteIds = ["vascular_route", "silt_burrow_route"];
    const contractCellIds = ["CELL_VASCULAR_RHYTHM_ROUTE_001", "CELL_SILT_PRESSURE_ROUTE_001"];
    if (
      routeContract?.id !== "ACT1_THREE_ROUTE_RUNTIME_CONTRACT_HC012A"
      || routeContract.pass !== "HC-012A"
      || routeContract.owner !== "Act1RouteContractSystem"
      || routeContract.crossingOwner !== "GateSystem"
      || routeContract.persistenceOwner !== "GateSystem"
      || routeContract.wakeCondition !== "graveReturned"
      || (routeContract.routes ?? []).length !== 2
      || routeContract.constraints?.emptyPlayerFacingCrossings !== false
      || routeContract.constraints?.destinationMountRequiredBeforeWake !== true
      || routeContract.constraints?.gameplayReadyRequiredBeforeCrossing !== true
      || routeContract.constraints?.onlyActiveRegionUpdates !== true
      || routeContract.constraints?.playerRelocation !== false
      || routeContract.constraints?.newAbilities !== 0
      || routeContract.constraints?.archivedCompatibilitySystemsActivated !== 0
      || routeContract.historySchema?.serializable !== true
      || routeContract.historySchema?.restorable !== true
      || (routeContract.constraints?.playableRouteIds ?? []).join("|") !== "vascular_route|silt_burrow_route"
      || (routeContract.constraints?.gameplayPendingRouteIds ?? []).length !== 0
    ) {
      throw new Error("[RecipeDataSystem] HC-012B three-route destination, wake, history, or safety contract is incomplete.");
    }
    const expectedGameplayReady = [true, true];
    for (let index = 0; index < contractRouteIds.length; index += 1) {
      const route = routeContract.routes[index];
      if (
        route.id !== contractRouteIds[index]
        || route.runtimeCellId !== contractCellIds[index]
        || route.gameplayReady !== expectedGameplayReady[index]
        || route.movementBounds?.mode !== "entry_anchored_ellipsoid"
        || route.movementBounds?.centerSource !== "preserved_gate_entry_position"
        || route.movementBounds?.collisionOwner !== "PlayerMovementController"
        || route.movementBounds?.tuningOwner !== "Act1RouteContractSystem"
        || (route.movementBounds?.radii ?? []).length !== 3
        || (route.movementBounds?.radii ?? []).some((radius) => !Number.isFinite(radius) || radius <= 0.25)
      ) {
        throw new Error(`[RecipeDataSystem] HC-012B route contract invalid: ${contractRouteIds[index]}.`);
      }
    }
    if (
      topologyContract.pass !== "HC-012A"
      || topologyContract.foundationPass !== "HC-010G"
      || topologyContract.recipeId !== routeContract.id
      || topologyContract.destinationOwner !== "Act1RouteContractSystem"
      || topologyContract.crossingOwner !== "GateSystem"
      || topologyContract.persistenceOwner !== "GateSystem"
      || topologyContract.wakeCondition !== "graveReturned"
      || (topologyContract.mountedContractRouteIds ?? []).join("|") !== contractRouteIds.join("|")
      || topologyContract.destinationMountRequiredBeforeWake !== true
      || topologyContract.gameplayReadyRequiredBeforeCrossing !== true
      || topologyContract.emptyPlayerFacingCrossings !== false
      || topologyContract.onlyActiveRegionUpdates !== true
      || topologyContract.playerPositionPreserved !== true
      || topologyContract.historySnapshotSerializable !== true
      || topologyContract.historySnapshotRestorable !== true
      || (topologyContract.playableRouteIds ?? []).join("|") !== "vascular_route|silt_burrow_route"
      || (topologyContract.gameplayPendingRouteIds ?? []).length !== 0
      || topologyContract.foundationRegisteredSystemCount !== 1
      || topologyContract.registeredDestinationSystemCount !== 2
      || topologyContract.newRegisteredSystemCountThisPass !== 1
      || topologyContract.newAbilityUnlocks !== 0
      || topologyContract.archivedCompatibilitySystemsActivated !== 0
      || topologyContract.mutatesExistingRouteCompletion !== false
    ) {
      throw new Error("[RecipeDataSystem] HC-012B runtime profile does not bind the three-route contract safely.");
    }
    const vascularProfile = profile.vascularRhythmPlayableCircuit ?? {};
    const vascularRecipe = this.data.vascularRhythmRouteCircuit ?? {};
    const vascularMount = profile.regions?.vascular_route ?? {};
    const vascularCompletion = vascularRecipe.completion ?? {};
    const vascularConstraints = vascularRecipe.constraints ?? {};
    if (
      vascularProfile.pass !== "HC-011A1"
      || vascularProfile.recipeId !== "VASCULAR_RHYTHM_PLAYABLE_CIRCUIT_HC011A1"
      || vascularProfile.gameplayOwner !== "VascularRhythmRouteSystem"
      || vascularProfile.presentationOwner !== "VascularRhythmRouteSystem"
      || vascularProfile.movementOwner !== "PlayerMovementController"
      || vascularProfile.objectiveOwner !== "ObjectiveSystem"
      || vascularProfile.crossingOwner !== "GateSystem"
      || vascularProfile.requiredCadenceReads !== 3
      || vascularProfile.continuousMovementRequired !== true
      || vascularProfile.visibleMovingCharge !== true
      || vascularProfile.stabilizeRequired !== true
      || vascularProfile.failureRecoverable !== true
      || vascularProfile.lockedCadenceReadsIrreversible !== true
      || vascularProfile.postReadPulseCanDesynchronize !== false
      || vascularProfile.maximumWorstStatePostReadRecoverySeconds !== 3.5
      || vascularProfile.authoredValveDepthIsCanonical !== true
      || vascularProfile.currentReversesTowardEntryAfterSynchronization !== true
      || vascularProfile.returnFoldLockedUntilObjectiveComplete !== true
      || vascularProfile.genericRings !== 0
      || vascularProfile.triggerMarkers !== 0
      || vascularProfile.forcedPlayerRelocation !== false
      || vascularProfile.newRegisteredSystemCount !== 1
      || vascularProfile.newAbilityUnlocks !== 0
      || vascularProfile.newEntities !== 0
      || vascularProfile.combat !== false
      || vascularProfile.siltGameplayActivated !== false
      || vascularProfile.archivedCompatibilitySystemsActivated !== 0
      || vascularProfile.vascularRouteUpdateBudget !== 8
      || vascularMount.modeId !== "vascular_rhythm_mode"
      || vascularMount.modeOwner !== "VascularRhythmMode"
      || vascularMount.gameplayOwner !== "VascularRhythmRouteSystem"
      || vascularMount.presentationOwner !== "VascularRhythmRouteSystem"
      || (vascularMount.systemIds ?? []).join("|") !== "act1RouteContractSystem|vascularRhythmRouteSystem"
      || vascularMount.activeUpdateBudget !== 8
      || vascularMount.gameplayReady !== true
      || vascularRecipe.id !== vascularProfile.recipeId
      || vascularRecipe.pass !== "HC-011A1"
      || vascularRecipe.routeId !== "vascular_route"
      || vascularRecipe.runtimeCellId !== "CELL_VASCULAR_RHYTHM_ROUTE_001"
      || vascularRecipe.gameplayOwner !== "VascularRhythmRouteSystem"
      || vascularRecipe.presentationOwner !== "VascularRhythmRouteSystem"
      || vascularRecipe.movementBoundaryOwner !== "PlayerMovementController"
      || vascularRecipe.crossingOwner !== "GateSystem"
      || vascularRecipe.objectiveOwner !== "ObjectiveSystem"
      || (vascularRecipe.anatomy?.valveProgress ?? []).length !== 3
      || vascularRecipe.cadence?.requiredReads !== 3
      || vascularCompletion.failureMustRemainRecoverable !== true
      || vascularCompletion.cleanRunMayCompleteWithoutFailure !== true
      || vascularCompletion.lockedCadenceReadsIrreversible !== true
      || vascularCompletion.postReadPulseCanDesynchronize !== false
      || vascularCompletion.maximumWorstStatePostReadRecoverySeconds !== 3.5
      || vascularCompletion.authoredValveDepthIsCanonical !== true
      || vascularRecipe.stabilization?.postReadRangeFromCenterline !== 2.1
      || vascularRecipe.stabilization?.postReadRecoveryMultiplier !== 2.4
      || vascularRecipe.stabilization?.postReadSynchronizationPerSecond !== 0.34
      || vascularRecipe.returnFold?.currentReversesTowardHub !== true
      || vascularRecipe.visual?.genericRings !== 0
      || vascularRecipe.visual?.triggerMarkers !== 0
      || vascularConstraints.newAbilities !== 0
      || vascularConstraints.newEntities !== 0
      || vascularConstraints.combat !== false
      || vascularConstraints.forcedRestart !== false
      || vascularConstraints.forcedPlayerRelocation !== false
      || vascularConstraints.directObjectiveMutation !== false
      || vascularConstraints.directGateMutation !== false
      || vascularConstraints.directActiveCellMutation !== false
      || vascularConstraints.siltGameplayActivated !== false
      || vascularConstraints.archivedCompatibilitySystemsActivated !== 0
    ) {
      throw new Error("[RecipeDataSystem] HC-011A1 Vascular Rhythm ownership, playability, recovery, or bounded-scope contract is incomplete.");
    }
    const vascularConsequence = this.data.vascularRhythmReturnConsequence ?? {};
    const consequenceProfile = profile.vascularRhythmReturnConsequence ?? {};
    const retention = vascularConsequence.retentionCondition ?? {};
    const coreFilament = vascularConsequence.coreFilament ?? {};
    const hubEcho = vascularConsequence.hubEcho ?? {};
    const consequenceConstraints = vascularConsequence.constraints ?? {};
    if (
      vascularConsequence.id !== "VASCULAR_RHYTHM_RETURN_CONSEQUENCE_HC011B"
      || vascularConsequence.pass !== "HC-011B"
      || consequenceProfile.pass !== "HC-011B"
      || consequenceProfile.recipeId !== vascularConsequence.id
      || consequenceProfile.historyOwner !== "GateSystem"
      || consequenceProfile.coreStateOwner !== "CoreGrowthSystem"
      || consequenceProfile.corePresentationOwner !== "CoreEmbodimentSystem"
      || consequenceProfile.hubPresentationOwner !== "HubChamberFoundationSystem"
      || consequenceProfile.promptSelectionOwner !== "GuidePromptSystem"
      || retention.routeEntered !== true
      || retention.routeCompleted !== true
      || retention.routeReturned !== true
      || retention.requiredCadenceReads !== 3
      || retention.currentReversedTowardHub !== true
      || coreFilament.filamentCount !== 3
      || coreFilament.cadenceNodeCount !== 3
      || coreFilament.chargeCount !== 1
      || coreFilament.objectDefiningRings !== 0
      || coreFilament.permanentHalos !== 0
      || hubEcho.filamentCount !== 3
      || hubEcho.valveCount !== 3
      || hubEcho.chargeCount !== 1
      || hubEcho.objectDefiningRings !== 0
      || hubEcho.triggerMarkers !== 0
      || consequenceConstraints.newAbilities !== 0
      || consequenceConstraints.newEntities !== 0
      || consequenceConstraints.combat !== false
      || consequenceConstraints.permanentClass !== false
      || consequenceConstraints.directObjectiveMutation !== false
      || consequenceConstraints.directGateMutation !== false
      || consequenceConstraints.directActiveCellMutation !== false
      || consequenceConstraints.routeMechanicMutation !== false
      || consequenceConstraints.siltGameplayActivated !== false
      || consequenceConstraints.newRegisteredSystems !== 0
      || consequenceConstraints.archivedCompatibilitySystemsActivated !== 0
    ) {
      throw new Error("[RecipeDataSystem] HC-011B Vascular return consequence ownership, anatomy, or bounded-scope contract is incomplete.");
    }
    const siltProfile = profile.siltPressurePlayableCircuit ?? {};
    const siltRecipe = this.data.siltPressureRouteCircuit ?? {};
    const siltMount = profile.regions?.silt_burrow_route ?? {};
    const siltCompletion = siltRecipe.completion ?? {};
    const siltConstraints = siltRecipe.constraints ?? {};
    if (
      siltProfile.pass !== "HC-012A"
      || siltProfile.recipeId !== "SILT_PRESSURE_PLAYABLE_CIRCUIT_HC012A"
      || siltProfile.gameplayOwner !== "SiltPressureRouteSystem"
      || siltProfile.presentationOwner !== "SiltPressureRouteSystem"
      || siltProfile.movementOwner !== "PlayerMovementController"
      || siltProfile.objectiveOwner !== "ObjectiveSystem"
      || siltProfile.crossingOwner !== "GateSystem"
      || siltProfile.continuousMovementRequired !== true
      || siltProfile.pulsePressureReadRequired !== true
      || siltProfile.stabilizeBraceRequired !== true
      || siltProfile.selectiveAbsorbRequired !== true
      || siltProfile.packedResidueMustRemain !== true
      || siltProfile.failureRecoverable !== true
      || siltProfile.maximumWorstStateRecoverySeconds !== 2.5
      || siltProfile.earnedPressureReadIrreversible !== true
      || siltProfile.earnedBraceIrreversible !== true
      || siltProfile.returnFoldLockedUntilObjectiveComplete !== true
      || siltProfile.genericRings !== 0
      || siltProfile.triggerMarkers !== 0
      || siltProfile.forcedPlayerRelocation !== false
      || siltProfile.newRegisteredSystemCount !== 1
      || siltProfile.newAbilityUnlocks !== 0
      || siltProfile.newEntities !== 0
      || siltProfile.combat !== false
      || siltProfile.death !== false
      || siltProfile.forcedRestart !== false
      || siltProfile.archivedCompatibilitySystemsActivated !== 0
      || siltProfile.siltRouteUpdateBudget !== 8
      || siltMount.modeId !== "silt_route_contract_mode"
      || siltMount.modeOwner !== "RouteContractMode"
      || siltMount.gameplayOwner !== "SiltPressureRouteSystem"
      || siltMount.presentationOwner !== "SiltPressureRouteSystem"
      || (siltMount.systemIds ?? []).join("|") !== "act1RouteContractSystem|siltPressureRouteSystem"
      || siltMount.activeUpdateBudget !== 8
      || siltMount.gameplayReady !== true
      || siltRecipe.id !== siltProfile.recipeId
      || siltRecipe.pass !== "HC-012A"
      || siltRecipe.routeId !== "silt_burrow_route"
      || siltRecipe.runtimeCellId !== "CELL_SILT_PRESSURE_ROUTE_001"
      || siltRecipe.gameplayOwner !== "SiltPressureRouteSystem"
      || siltRecipe.presentationOwner !== "SiltPressureRouteSystem"
      || siltRecipe.movementBoundaryOwner !== "PlayerMovementController"
      || siltRecipe.crossingOwner !== "GateSystem"
      || siltRecipe.objectiveOwner !== "ObjectiveSystem"
      || (siltRecipe.anatomy?.ribProgress ?? []).length !== 5
      || siltRecipe.pressure?.earnedReadIrreversible !== true
      || siltRecipe.pressure?.earnedBraceIrreversible !== true
      || siltRecipe.appetite?.protectedDenseMatterConsumed !== false
      || siltRecipe.recovery?.maximumWorstStateRecoverySeconds !== 2.5
      || siltRecipe.recovery?.failureErasesPressureRead !== false
      || siltRecipe.recovery?.failureErasesBrace !== false
      || siltCompletion.pressureReadRequired !== true
      || siltCompletion.ribsReleasedRequired !== true
      || siltCompletion.selectiveAbsorbRequired !== true
      || siltCompletion.packedResidueMustRemain !== true
      || siltCompletion.failureMustRemainRecoverable !== true
      || siltRecipe.returnFold?.siltBreathReversesTowardHub !== true
      || siltRecipe.visual?.genericRings !== 0
      || siltRecipe.visual?.triggerMarkers !== 0
      || siltConstraints.newAbilities !== 0
      || siltConstraints.newEntities !== 0
      || siltConstraints.combat !== false
      || siltConstraints.death !== false
      || siltConstraints.forcedRestart !== false
      || siltConstraints.forcedPlayerRelocation !== false
      || siltConstraints.directObjectiveMutation !== false
      || siltConstraints.directGateMutation !== false
      || siltConstraints.directActiveCellMutation !== false
      || siltConstraints.directRouteHistoryMutation !== false
      || siltConstraints.vascularGameplayMutation !== false
      || siltConstraints.graveGameplayMutation !== false
      || siltConstraints.archivedCompatibilitySystemsActivated !== 0
    ) {
      throw new Error("[RecipeDataSystem] HC-012A Silt Pressure ownership, playability, recovery, or bounded-scope contract is incomplete.");
    }
    const siltConsequence = this.data.siltPressureReturnConsequence ?? {};
    const siltConsequenceProfile = profile.siltPressureReturnConsequence ?? {};
    const siltRetention = siltConsequence.retentionCondition ?? {};
    const siltCoreAdaptation = siltConsequence.coreAdaptation ?? {};
    const siltHubEcho = siltConsequence.hubEcho ?? {};
    const siltConsequenceConstraints = siltConsequence.constraints ?? {};
    if (
      siltConsequence.id !== "SILT_PRESSURE_RETURN_CONSEQUENCE_HC012B"
      || siltConsequence.pass !== "HC-012B"
      || siltConsequenceProfile.pass !== "HC-012B"
      || siltConsequenceProfile.recipeId !== siltConsequence.id
      || siltConsequenceProfile.historyOwner !== "GateSystem"
      || siltConsequenceProfile.coreStateOwner !== "CoreGrowthSystem"
      || siltConsequenceProfile.corePresentationOwner !== "CoreEmbodimentSystem"
      || siltConsequenceProfile.hubPresentationOwner !== "HubChamberFoundationSystem"
      || siltConsequenceProfile.promptSelectionOwner !== "GuidePromptSystem"
      || siltRetention.routeEntered !== true
      || siltRetention.routeCompleted !== true
      || siltRetention.routeReturned !== true
      || siltRetention.pressureRead !== true
      || siltRetention.ribsReleased !== true
      || siltRetention.safeMatterAbsorbed !== true
      || siltRetention.denseMatterLeftIntact !== true
      || siltCoreAdaptation.plateCount !== 3
      || siltCoreAdaptation.porousNodeCount !== 1
      || siltCoreAdaptation.residueNodeCount !== 2
      || siltCoreAdaptation.objectDefiningRings !== 0
      || siltCoreAdaptation.permanentHalos !== 0
      || siltHubEcho.plateCount !== 3
      || siltHubEcho.porousNodeCount !== 1
      || siltHubEcho.residueNodeCount !== 2
      || siltHubEcho.objectDefiningRings !== 0
      || siltHubEcho.triggerMarkers !== 0
      || siltConsequenceConstraints.newAbilities !== 0
      || siltConsequenceConstraints.newEntities !== 0
      || siltConsequenceConstraints.combat !== false
      || siltConsequenceConstraints.permanentClass !== false
      || siltConsequenceConstraints.directObjectiveMutation !== false
      || siltConsequenceConstraints.directGateMutation !== false
      || siltConsequenceConstraints.directActiveCellMutation !== false
      || siltConsequenceConstraints.routeMechanicMutation !== false
      || siltConsequenceConstraints.newRegisteredSystems !== 0
      || siltConsequenceConstraints.archivedCompatibilitySystemsActivated !== 0
    ) {
      throw new Error("[RecipeDataSystem] HC-012B Silt return consequence ownership, anatomy, or bounded-scope contract is incomplete.");
    }
    const convergenceProfile = profile.threeRouteHubConvergence ?? {};
    const convergenceRecipe = this.get("hubInvestigationGameplayRecipes", "HUB_INVESTIGATION_GAMEPLAY_HC007C")?.threeRouteConvergence ?? {};
    if (
      convergenceProfile.pass !== "HC-012C"
      || convergenceProfile.gameplayOwner !== "HubInvestigationGameplaySystem"
      || convergenceProfile.presentationOwner !== "HubChamberFoundationSystem"
      || convergenceProfile.persistenceOwner !== "GateSystem"
      || convergenceProfile.mode !== "continuous_spiral_weave"
      || convergenceProfile.routeOrderIndependent !== true
      || convergenceProfile.routeTriggerChecklist !== false
      || convergenceProfile.oneFinalPulse !== true
      || convergenceProfile.recoverableWithoutRestart !== true
      || convergenceProfile.combwardBodyReadableAfterCompletion !== true
      || !([false, true].includes(convergenceProfile.combThresholdCrossable))
      || convergenceProfile.newRegisteredSystemCount !== 0
      || convergenceProfile.newAbilityUnlocks !== 0
      || convergenceProfile.newEntities !== 0
      || convergenceProfile.directObjectiveMutation !== false
      || convergenceProfile.directGateMutationByGameplay !== false
      || convergenceProfile.archivedCompatibilitySystemsActivated !== 0
      || convergenceRecipe.pass !== "HC-012C"
      || convergenceRecipe.mode !== "continuous_spiral_weave"
      || convergenceRecipe.routeOrderIndependent !== true
      || convergenceRecipe.routeTriggerChecklist !== false
      || convergenceRecipe.oneFinalPulse !== true
      || convergenceRecipe.combThresholdCrossable !== false
    ) {
      throw new Error("[RecipeDataSystem] HC-012C three-route Hub convergence ownership or bounded-scope contract is incomplete.");
    }
    const combProfile = profile.combThresholdFoundation ?? {};
    const combRecipe = this.data.combThresholdFoundation ?? {};
    const combAperture = combRecipe.apertureDestinationContract ?? {};
    const combConstraints = combRecipe.constraints ?? {};
    if (
      ["HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014H", "HC-014I"].includes(profile.pass)
      && (
        !["ACT1_RUNTIME_PROFILE_HC013A", "ACT1_RUNTIME_PROFILE_HC013B", "ACT1_RUNTIME_PROFILE_HC013C", "ACT1_RUNTIME_PROFILE_HC013D", "ACT1_RUNTIME_PROFILE_HC014A", "ACT1_RUNTIME_PROFILE_HC014B", "ACT1_RUNTIME_PROFILE_HC014C", "ACT1_RUNTIME_PROFILE_HC014D", "ACT1_RUNTIME_PROFILE_HC014E", "ACT1_RUNTIME_PROFILE_HC014F", "ACT1_RUNTIME_PROFILE_HC014G"].includes(profile.id)
        || combProfile.pass !== "HC-013A"
        || combProfile.recipeId !== "COMB_THRESHOLD_FOUNDATION_HC013A"
        || combProfile.modeOwner !== "CombThresholdMode"
        || combProfile.presentationOwner !== "CombThresholdFoundationSystem"
        || combProfile.crossingOwner !== "GateSystem"
        || combProfile.entryGateId !== "hub_to_comb_threshold"
        || combProfile.returnGateId !== "comb_threshold_to_hub_chamber"
        || combProfile.apertureGateId !== "comb_threshold_to_aperture_fields"
        || combProfile.toothStationCount !== 12
        || combProfile.filterLobeCount !== 6
        || (["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014H", "HC-014I"].includes(profile.pass) ? combProfile.apertureDestinationMounted !== true : combProfile.apertureDestinationMounted !== false)
        || (["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014H", "HC-014I"].includes(profile.pass) ? combProfile.apertureCrossable !== true : combProfile.apertureCrossable !== false)
        || combProfile.newRegisteredSystemCount !== 1
        || combRecipe.id !== "COMB_THRESHOLD_FOUNDATION_HC013A"
        || combRecipe.runtimeCellId !== "CELL_COMB_THRESHOLD_FILTER_001"
        || combRecipe.owners?.movement !== "PlayerMovementController"
        || combRecipe.owners?.crossing !== "GateSystem"
        || combRecipe.anatomy?.toothStationCount !== 12
        || combRecipe.anatomy?.filterLobeCount !== 6
        || combAperture.destinationMounted !== false
        || combAperture.gameplayReady !== false
        || combAperture.crossable !== false
        || combConstraints.newAbilityUnlocks !== 0
        || combConstraints.newEntities !== 0
        || combConstraints.newBaseVerbs !== 0
        || combConstraints.directObjectiveMutation !== false
        || combConstraints.directGateMutation !== false
        || combConstraints.apertureFieldsImplemented !== false
      )
    ) {
      throw new Error("[RecipeDataSystem] HC-013A Comb Threshold foundation ownership or sealed Aperture contract is incomplete.");
    }
    const combPlayableProfile = profile.combThresholdPlayable ?? {};
    const combPlayableRecipe = this.data.combThresholdPlayable ?? {};
    const combInteraction = combPlayableRecipe.interaction ?? {};
    const combCompletion = combPlayableRecipe.completion ?? {};
    const combPlayableConstraints = combPlayableRecipe.constraints ?? {};
    if (
      ["HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014H", "HC-014I"].includes(profile.pass)
      && (
        !["ACT1_RUNTIME_PROFILE_HC013B", "ACT1_RUNTIME_PROFILE_HC013C", "ACT1_RUNTIME_PROFILE_HC013D", "ACT1_RUNTIME_PROFILE_HC014A", "ACT1_RUNTIME_PROFILE_HC014B", "ACT1_RUNTIME_PROFILE_HC014C", "ACT1_RUNTIME_PROFILE_HC014D", "ACT1_RUNTIME_PROFILE_HC014E", "ACT1_RUNTIME_PROFILE_HC014F", "ACT1_RUNTIME_PROFILE_HC014G"].includes(profile.id)
        || combPlayableProfile.pass !== "HC-013B"
        || combPlayableProfile.recipeId !== "COMB_THRESHOLD_PLAYABLE_PROOF_HC013B"
        || combPlayableProfile.gameplayOwner !== "CombThresholdPlayableSystem"
        || combPlayableProfile.presentationOwner !== "CombThresholdFoundationSystem"
        || combPlayableProfile.objectiveOwner !== "ObjectiveSystem"
        || combPlayableProfile.historyOwner !== "GateSystem"
        || combPlayableProfile.crossingOwner !== "GateSystem"
        || combPlayableProfile.requiredFilterReads !== 6
        || combPlayableProfile.oneFinalPulse !== true
        || combPlayableProfile.mistakesResetRun !== false
        || (["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014H", "HC-014I"].includes(profile.pass) ? combPlayableProfile.apertureDestinationMounted !== true : combPlayableProfile.apertureDestinationMounted !== false)
        || (["HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014H", "HC-014I"].includes(profile.pass) ? combPlayableProfile.apertureCrossable !== true : combPlayableProfile.apertureCrossable !== false)
        || combPlayableProfile.newRegisteredSystemCount !== 1
        || combPlayableRecipe.id !== "COMB_THRESHOLD_PLAYABLE_PROOF_HC013B"
        || combPlayableRecipe.runtimeCellId !== "CELL_COMB_THRESHOLD_FILTER_001"
        || combPlayableRecipe.owners?.movement !== "PlayerMovementController"
        || combPlayableRecipe.owners?.objective !== "ObjectiveSystem"
        || combPlayableRecipe.owners?.history !== "GateSystem"
        || combInteraction.requiredFilterReads !== 6
        || combInteraction.oneFinalPulse !== true
        || combInteraction.stabilizeRequiredForRead !== true
        || combInteraction.centeredMovementRequiredForRead !== true
        || combInteraction.cadenceWindowRequiredForRead !== true
        || combInteraction.mistakesResetRun !== false
        || combInteraction.hardMovementGate !== false
        || combCompletion.firstFieldReveal !== true
        || combCompletion.apertureDestinationMounted !== false
        || combCompletion.apertureCrossable !== false
        || combPlayableConstraints.newAbilityUnlocks !== 0
        || combPlayableConstraints.newEntities !== 0
        || combPlayableConstraints.newBaseVerbs !== 0
        || combPlayableConstraints.directObjectiveMutation !== false
        || combPlayableConstraints.directGateMutation !== false
        || combPlayableConstraints.directActiveCellMutation !== false
        || combPlayableConstraints.apertureFieldsImplemented !== false
        || combPlayableConstraints.hardFailureRestart !== false
      )
    ) {
      throw new Error("[RecipeDataSystem] HC-013B Comb Threshold playable proof ownership, recovery, or sealed Aperture contract is incomplete.");
    }

    const transitionPreparation = profile.transitionPreparation ?? {};
    if (
      transitionPreparation.owner !== "FirstSliceTransitionCoordinator"
      || transitionPreparation.registeredUpdater !== false
      || transitionPreparation.mutatesProgression !== false
      || transitionPreparation.synchronousFallback !== true
    ) {
      throw new Error("[RecipeDataSystem] HC-010B transition preparation must remain read-only, unregistered, and fallback-safe.");
    }
    const renderTruth = profile.renderTruth ?? {};
    if (
      renderTruth.pass !== "HC-010C"
      || renderTruth.owner !== "HubChamberFoundationSystem"
      || renderTruth.hubGenericTargetingSuppressed !== true
      || renderTruth.clearTargetOnRegionOwnershipChange !== true
      || renderTruth.timerOnlyReadabilityDisabled !== true
      || renderTruth.screenSpaceRequired !== true
      || renderTruth.minimumScreenSeparation !== 0.25
      || renderTruth.maximumScreenOverlapRatio !== 0.48
      || renderTruth.screenTruthStableFrames !== 6
      || renderTruth.distantHostViewportDominanceLimit !== 0.33
      || renderTruth.worldSpaceOnlyReadabilityForbidden !== true
      || renderTruth.projectedDistantHostMeasurementRequired !== true
      || renderTruth.playerFacingTechnicalIds !== false
      || renderTruth.normalHudPrimaryInstructionCount !== 1
      || renderTruth.mutatesProgression !== false
    ) {
      throw new Error("[RecipeDataSystem] HC-010C requires active-camera screen truth, projected Host dominance measurement, target cleanup, and one read-only player-facing instruction.");
    }
    const promptOwnership = profile.promptOwnership ?? {};
    if (
      promptOwnership.pass !== "HC-010C"
      || promptOwnership.selectionOwner !== "GuidePromptSystem"
      || promptOwnership.activeRegionOverridesRetainedGuidance !== true
      || promptOwnership.activeCellOverridesPreviousMountDuringGateFrame !== true
      || promptOwnership.regionChangeClearsPromptHold !== true
      || promptOwnership.atomicClearAndRepublish !== true
      || promptOwnership.graveContentOwner !== "GraveMemoryRouteSystem"
      || promptOwnership.hubContentOwner !== "HubChamberFoundationSystem"
      || promptOwnership.internalStagePlayerFacing !== false
      || promptOwnership.staleHubGuidanceAllowedInGrave !== false
      || promptOwnership.mutatesProgression !== false
    ) {
      throw new Error("[RecipeDataSystem] HC-010C active-region prompt ownership contract is incomplete.");
    }
    const routePreview = profile.firstRoutePreview ?? {};
    if (
      routePreview.owner !== "GraveMemoryRouteSystem"
      || routePreview.entryGateOwner !== "GateSystem"
      || routePreview.returnGateOwner !== "GateSystem"
      || routePreview.archivedCompatibilitySystemsActivated !== 0
      || routePreview.registeredRouteSystemCount !== 1
      || routePreview.protectedRemainsConsumable !== false
      || profile.regions?.grave_memory_route?.activeUpdateBudget !== 7
    ) {
      throw new Error("[RecipeDataSystem] HC-010B must retain the HC-010A bounded Grave route owner, GateSystem crossings, protected remains, and seven-system route budget.");
    }
    const routeRecipe = this.data.graveMemoryRouteCircuit;
    const graveMovementBounds = routeRecipe?.movementBounds ?? {};
    const graveBoundaryRadii = graveMovementBounds.radii ?? [];
    if (
      routeRecipe?.id !== "GRAVE_MEMORY_SAFE_TRANSFER_CIRCUIT_HC010B"
      || routeRecipe.regionId !== "grave_memory_route"
      || routeRecipe.runtimeCellId !== "CELL_GRAVE_MEMORY_RESIDUE_BED_001"
      || routeRecipe.constraints?.archivedCompatibilitySystemsActivated !== 0
      || routeRecipe.constraints?.protectedRemainsConsumable !== false
      || routeRecipe.constraints?.safeTransferRequired !== true
      || routeRecipe.constraints?.failureRecoverable !== true
      || routeRecipe.consequence?.newAbilityUnlocks !== 0
      || routeRecipe.consequence?.permanentClass !== false
      || graveMovementBounds.mode !== "entry_anchored_ellipsoid"
      || graveMovementBounds.centerSource !== "preserved_gate_entry_position"
      || graveMovementBounds.collisionOwner !== "PlayerMovementController"
      || graveMovementBounds.tuningOwner !== "GraveMemoryRouteSystem"
      || graveMovementBounds.restoresPriorBoundaryOnExit !== true
      || graveBoundaryRadii.length !== 3
      || graveBoundaryRadii.some((radius) => !Number.isFinite(radius) || radius <= 0.25)
    ) {
      throw new Error("[RecipeDataSystem] Missing HC-010B Grave Memory consequence or HC-010D entry-anchored movement-boundary contract.");
    }
    const routeCircuit = profile.firstRouteCircuit ?? {};
    if (
      routeCircuit.owner !== "GraveMemoryRouteSystem"
      || routeCircuit.growthObserver !== "CoreGrowthSystem"
      || routeCircuit.bodyLanguageOwner !== "CoreEmbodimentSystem"
      || routeCircuit.hubReflectionOwner !== "HubChamberFoundationSystem"
      || routeCircuit.objectiveOwner !== "ObjectiveSystem"
      || routeCircuit.crossingOwner !== "GateSystem"
      || routeCircuit.safeTransferRequired !== true
      || routeCircuit.failureRecoverable !== true
      || routeCircuit.newAbilityUnlocks !== 0
      || routeCircuit.permanentClass !== false
      || routeCircuit.newRegisteredSystemCount !== 0
      || routeCircuit.archivedCompatibilitySystemsActivated !== 0
      || routeCircuit.graveMemoryRouteUpdateBudget !== 7
    ) {
      throw new Error("[RecipeDataSystem] HC-010B ownership or scope contract is incomplete.");
    }
    const movementBoundaryRepair = profile.movementBoundaryRepair ?? {};
    if (
      movementBoundaryRepair.pass !== "HC-010D"
      || movementBoundaryRepair.collisionOwner !== "PlayerMovementController"
      || movementBoundaryRepair.regionTuningOwner !== "GraveMemoryRouteSystem"
      || movementBoundaryRepair.regionId !== "grave_memory_route"
      || movementBoundaryRepair.mode !== "entry_anchored_ellipsoid"
      || movementBoundaryRepair.centerSource !== "preserved_gate_entry_position"
      || movementBoundaryRepair.legacyWorldOriginClampDisabledInGrave !== true
      || movementBoundaryRepair.allAuthoredObjectsApproachable !== true
      || movementBoundaryRepair.priorBoundaryRestoredOnExit !== true
      || movementBoundaryRepair.forcedPlayerRelocation !== false
      || movementBoundaryRepair.interactionRangesChanged !== false
      || movementBoundaryRepair.newRegisteredSystemCount !== 0
      || movementBoundaryRepair.mutatesProgression !== false
    ) {
      throw new Error("[RecipeDataSystem] HC-010D movement-boundary repair ownership or scope contract is incomplete.");
    }
    const visualConsequence = profile.visualConsequenceReadability ?? {};
    const visualRecipe = routeRecipe.visualConsequence ?? {};
    const hubReturnPresentation = routeRecipe.hubReturnPresentation ?? {};
    const expectedConsequencePhases = [
      "recoil_scatter",
      "stabilization_reweave",
      "safe_trace_transfer",
      "retained_memory_imprint"
    ];
    if (
      visualConsequence.pass !== "HC-010E"
      || visualConsequence.gravePresentationOwner !== "GraveMemoryRouteSystem"
      || visualConsequence.coreImprintOwner !== "CoreEmbodimentSystem"
      || visualConsequence.hubReflectionOwner !== "HubChamberFoundationSystem"
      || visualConsequence.guidePerchOwner !== "OrbiterSystem"
      || visualConsequence.diagnosticOwner !== "ChemistryDebugPanel"
      || (visualConsequence.phaseOrder ?? []).join("|") !== expectedConsequencePhases.join("|")
      || (visualConsequence.postReturnLayerHierarchy ?? []).length !== 3
      || visualConsequence.centralCradleQuietedAfterReturn !== true
      || visualConsequence.internalDiagnosticScopeErrorFixed !== true
      || visualConsequence.objectDefiningRingsAdded !== false
      || visualConsequence.newRegisteredSystemCount !== 0
      || visualConsequence.newAbilityUnlocks !== 0
      || visualConsequence.newRouteContent !== false
      || visualConsequence.mutatesProgression !== false
      || visualRecipe.pass !== "HC-010E"
      || visualRecipe.owner !== "GraveMemoryRouteSystem"
      || (visualRecipe.phaseOrder ?? []).join("|") !== expectedConsequencePhases.join("|")
      || visualRecipe.recoilShardCount !== 9
      || visualRecipe.recoveryStrandCount !== 6
      || visualRecipe.transferThreadMoteCount !== 13
      || visualRecipe.objectDefiningRings !== false
      || hubReturnPresentation.pass !== "HC-010E"
      || hubReturnPresentation.owner !== "HubChamberFoundationSystem"
      || hubReturnPresentation.guidePerchOwner !== "OrbiterSystem"
      || hubReturnPresentation.centralCradleQuieted !== true
      || hubReturnPresentation.minimumPlayerEchoWorldSeparation !== visualConsequence.minimumPlayerEchoWorldSeparation
      || hubReturnPresentation.minimumGuideEchoWorldSeparation !== visualConsequence.minimumGuideEchoWorldSeparation
      || hubReturnPresentation.minimumGuidePlayerWorldSeparation !== visualConsequence.minimumGuidePlayerWorldSeparation
      || hubReturnPresentation.minimumPlayerEchoScreenSeparation !== visualConsequence.minimumPlayerEchoScreenSeparation
      || hubReturnPresentation.minimumGuideEchoScreenSeparation !== visualConsequence.minimumGuideEchoScreenSeparation
      || hubReturnPresentation.minimumGuidePlayerScreenSeparation !== visualConsequence.minimumGuidePlayerScreenSeparation
      || hubReturnPresentation.newRouteContent !== false
    ) {
      throw new Error("[RecipeDataSystem] HC-010E Grave-to-Hub visual consequence ownership or readability contract is incomplete.");
    }

    const landmarkLock = profile.graveLandmarkVisualLock ?? {};
    const landmarkIds = [
      "old_core_husk_memory_001",
      "residue_silt_cloud_001",
      "scar_lock_plate_001",
      "inheritance_seed_remnant_001"
    ];
    const landmarkRecipeIds = [
      "old_core_husk_memory_v01",
      "residue_silt_cloud_v01",
      "scar_lock_plate_v01",
      "inheritance_seed_remnant_v01"
    ];
    const landmarkPlaceholderIds = [
      "debug_old_core_husk_memory_001",
      "debug_residue_silt_cloud_001",
      "debug_scar_lock_plate_001",
      "debug_inheritance_seed_remnant_001"
    ];
    if (
      landmarkLock.pass !== "HC-010F"
      || landmarkLock.geometryOwner !== "ChemObjectVisualComposer"
      || landmarkLock.motionOwner !== "GraveMemoryRouteSystem"
      || landmarkLock.regionId !== "grave_memory_route"
      || landmarkLock.runtimeCellId !== "CELL_GRAVE_MEMORY_RESIDUE_BED_001"
      || (landmarkLock.landmarkIds ?? []).join("|") !== landmarkIds.join("|")
      || (landmarkLock.replacementRecipeIds ?? []).join("|") !== landmarkRecipeIds.join("|")
      || (landmarkLock.retiredPlaceholderIds ?? []).join("|") !== landmarkPlaceholderIds.join("|")
      || landmarkLock.distinctSilhouetteCount !== 4
      || landmarkLock.distinctMotionLanguageCount !== 4
      || landmarkLock.idleObjectDefiningRings !== false
      || landmarkLock.transientVerbCuesOnly !== true
      || landmarkLock.interactionRangesChanged !== false
      || landmarkLock.objectPositionsChanged !== false
      || landmarkLock.newRegisteredSystemCount !== 0
      || landmarkLock.newAbilityUnlocks !== 0
      || landmarkLock.newRouteContent !== false
      || landmarkLock.mutatesProgression !== false
    ) {
      throw new Error("[RecipeDataSystem] HC-010F Grave landmark anatomy or visual-lock contract is incomplete.");
    }
    for (let index = 0; index < landmarkIds.length; index += 1) {
      const objectRecipe = this.get("chemObjectRecipes", landmarkIds[index]);
      const visualComposition = this.get("visualCompositionRecipes", landmarkRecipeIds[index]);
      const placeholder = this.get("placeholderReplacementRecipes", landmarkPlaceholderIds[index]);
      if (
        objectRecipe.visual?.visualRecipe !== landmarkRecipeIds[index]
        || objectRecipe.visual?.placeholderRecipe !== landmarkPlaceholderIds[index]
        || placeholder.placeholder?.active !== false
        || placeholder.placeholder?.severityAfterExpiration !== "resolved"
        || placeholder.replacement?.requiredBeforeLock !== false
        || placeholder.visualLock?.status !== "replaced_by_recipe_composition"
        || placeholder.visualLock?.pass !== "HC-010F"
        || visualComposition.visualLock?.status !== "p0_locked_recipe_composition"
        || visualComposition.visualLock?.pass !== "HC-010F"
        || visualComposition.recipePack?.status !== "runtime_visual_locked"
      ) {
        throw new Error(`[RecipeDataSystem] HC-010F Grave landmark visual is not locked: ${landmarkIds[index]}.`);
      }
    }

    if (this.validationProfile === "legacy_archive") {
      this.validateBlueprintTranslationLayer();
    }
    this.validateSurfaceWakeLayeredInteraction();
    this.validateGuideThresholdLayeredInteraction();
    this.validateFirstSliceOwnershipRegistries();
    this.validateFoundationalInspectionCamera();
    this.validateControllerOnboardingTuning();
    this.validateOpeningObjectivePromptLock();
    this.validateDebugHiddenPlaytestMode();
    this.validateFirstMinuteVisualReadabilityPolish();
  }

  validateCoreRecipeIds() {
    this.get("hosts", "HOST_ALPHA_WOUNDED_NURSERY");
    this.get("anatomyRecipes", "membrane_layer");
    this.get("localCellRecipes", "CELL_MEMBRANE_NURSERY_001");
    this.get("localCellRecipes", "CELL_SCAR_FLOW_FOLD_001");
    this.get("morphPlans", "MORPH_MEMBRANE_TO_SCAR_FLOW_001");
    this.get("localCellRecipes", "CELL_SCAR_FLOW_FOLD_001");
    this.get("visualCompositionRecipes", "player_seed_core_stage_01");
    this.get("placeholderReplacementRecipes", "debug_player_core_001");
    this.get("functionRecipes", "repair_filter_protect");
    this.get("functionRecipes", "sense_warn_record");
    this.get("entityRecipes", "nursery_membrane_tender_001");
    this.get("entityRecipes", "membrane_watcher_001");
    this.get("visualCompositionRecipes", "nursery_membrane_tender_v01");
    this.get("visualCompositionRecipes", "membrane_watcher_v01");
    this.get("placeholderReplacementRecipes", "debug_tender_001");
    this.get("placeholderReplacementRecipes", "debug_watcher_001");
    this.get("orbiterRecipes", "guide_orbiter_folded_lantern_001");
    this.get("visualCompositionRecipes", "guide_orbiter_folded_lantern_v01");
    this.get("placeholderReplacementRecipes", "debug_guide_orbiter_001");

    for (const id of ["soft_bond", "flow_bond", "scar_bond", "resonant_bond"]) {
      this.get("bondRecipes", id);
    }


    const requiredEntities = [
      "nursery_membrane_tender_001",
      "membrane_watcher_001"
    ];

    for (const id of requiredEntities) {
      const entityRecipe = this.get("entityRecipes", id);
      this.get("functionRecipes", entityRecipe.origin.hostFunction);
      this.get("visualCompositionRecipes", entityRecipe.visual.visualRecipe);
      this.get("placeholderReplacementRecipes", entityRecipe.visual.placeholderRecipe);
    }

    const requiredOrbiters = [
      "guide_orbiter_folded_lantern_001"
    ];

    for (const id of requiredOrbiters) {
      const orbiterRecipe = this.get("orbiterRecipes", id);
      this.get("visualCompositionRecipes", orbiterRecipe.visual.visualRecipe);
      this.get("placeholderReplacementRecipes", orbiterRecipe.visual.placeholderRecipe);
    }


    this.get("scarFlowInteractionRecipes", "SCAR_FLOW_LOOP_001");
    const signalLoop = this.get("signalChorusInteractionRecipes", "SIGNAL_CHORUS_LOOP_001");
    this.get("localCellRecipes", signalLoop.cellId);
    for (const step of signalLoop.sequence ?? []) this.get("chemObjectRecipes", step.focusObject);

    const thirdMorphPlan = this.get("thirdMorphPlans", "MORPH_SIGNAL_CHORUS_TO_BLOOM_RESIDUE_FORK_001");
    this.get("localCellRecipes", thirdMorphPlan.sourceCell);
    const signalExitRule = this.get("signalChorusExitReadinessRules", "SIGNAL_CHORUS_EXIT_READINESS_001");
    this.get("signalChorusInteractionRecipes", signalExitRule.sourceLoop);
    this.get("thirdMorphPlans", signalExitRule.nextMorphPlan);

    const requiredMorphCompletionHooks = [
      "HOOK_SCAR_MEMORY_FLECK_ECHO",
      "HOOK_RESONANT_PATH_THREAD_ALIGN",
      "HOOK_PRESSURE_FOLD_CURRENT_RELIEF",
      "HOOK_SCAR_FLOW_CLOT_WARNING"
    ];

    for (const id of requiredMorphCompletionHooks) {
      const hook = this.get("morphCompletionHookRecipes", id);
      this.get("localCellRecipes", hook.cellId);
      this.get("chemObjectRecipes", hook.sourceObject);
    }


    this.get("localCellRecipes", "CELL_SIGNAL_CHORUS_NERVE_001");
    this.get("secondMorphPlans", "MORPH_SCAR_FLOW_TO_SIGNAL_CHORUS_001");
    this.get("scarFlowExitReadinessRules", "SCAR_FLOW_EXIT_READINESS_001");

    const signalChorusObjects = [
      "choir_resonance_node_001",
      "listening_pore_membrane_001",
      "harmonic_wave_thread_001",
      "seed_signal_bridge_001"
    ];

    for (const id of signalChorusObjects) {
      const objectRecipe = this.get("chemObjectRecipes", id);
      this.get("visualCompositionRecipes", objectRecipe.visual.visualRecipe);
      this.get("placeholderReplacementRecipes", objectRecipe.visual.placeholderRecipe);
    }

    const signalChorusCell = this.get("localCellRecipes", "CELL_SIGNAL_CHORUS_NERVE_001");
    this.get("visualCompositionRecipes", signalChorusCell.visuals.environmentRecipe);
    this.get("visualCompositionRecipes", signalChorusCell.visuals.atmosphereRecipe);

    const signalExit = this.get("signalChorusExitReadinessRules", "SIGNAL_CHORUS_EXIT_READINESS_001");
    this.get("signalChorusInteractionRecipes", signalExit.sourceLoop);
    this.get("thirdMorphPlans", signalExit.nextMorphPlan);

    const thirdMorph = this.get("thirdMorphPlans", "MORPH_SIGNAL_CHORUS_TO_BLOOM_RESIDUE_FORK_001");
    this.get("localCellRecipes", thirdMorph.sourceCell);
    this.get("localCellRecipes", thirdMorph.destinationCell ?? thirdMorph.plannedDestinationCell);

    this.get("localCellRecipes", "CELL_BLOOM_RESIDUE_FORK_001");
    const bloomResidueCell = this.get("localCellRecipes", "CELL_BLOOM_RESIDUE_FORK_001");
    this.get("visualCompositionRecipes", bloomResidueCell.visuals.environmentRecipe);
    this.get("visualCompositionRecipes", bloomResidueCell.visuals.atmosphereRecipe);

    const bloomResidueObjects = [
      "bloom_spore_lantern_001",
      "residue_memory_silt_001",
      "seed_choice_braid_001",
      "overgrowth_warning_tendril_001"
    ];

    for (const id of bloomResidueObjects) {
      const objectRecipe = this.get("chemObjectRecipes", id);
      this.get("visualCompositionRecipes", objectRecipe.visual.visualRecipe);
      this.get("placeholderReplacementRecipes", objectRecipe.visual.placeholderRecipe);
    }

    const bloomResidueLoop = this.get("bloomResidueInteractionRecipes", "BLOOM_RESIDUE_LOOP_001");
    this.get("localCellRecipes", bloomResidueLoop.cellId);
    for (const step of bloomResidueLoop.sequence ?? []) this.get("chemObjectRecipes", step.focusObject);


    const graveMorph = this.get("graveRouteMorphPlans", "MORPH_BLOOM_RESIDUE_TO_GRAVE_MEMORY_001");
    this.get("localCellRecipes", graveMorph.sourceCell);
    this.get("localCellRecipes", graveMorph.destinationCell);

    const graveObjects = [
      "old_core_husk_memory_001",
      "residue_silt_cloud_001",
      "scar_lock_plate_001",
      "inheritance_seed_remnant_001"
    ];

    for (const id of graveObjects) {
      const objectRecipe = this.get("chemObjectRecipes", id);
      this.get("visualCompositionRecipes", objectRecipe.visual.visualRecipe);
      this.get("placeholderReplacementRecipes", objectRecipe.visual.placeholderRecipe);
    }

    this.validateGraveRouteMorphPrototype();
    this.validateGraveArrivalReadability();
    this.validateGraveReadBeforeAbsorbLoop();
    this.validateGraveLoopStabilityExitReadiness();
    this.validateGraveExitReadinessPrototype();
    this.validateGraveRouteContinuityPlanning();
    this.validateGraveScarMemorySeamRecipePack();
    this.validateGraveScarMemorySeamArrivalPlanning();
    this.validateGraveScarMemorySeamRuntimeArrival();
    this.validateGraveScarMemorySeamFirstReadLoop();
    this.validateGraveSeamContinuityMicroExit();
    this.validateGraveBedPostSeamResponse();
    this.validateGraveRouteLockState();
    this.validateGraveReturnContinuity();
    this.validateSignalChorusReturnState();
    this.validateSignalChorusNextRoutePressure();
    this.validateSignalChorusVisualIdentity();
    this.validateSignalChorusLayeredInteraction();
    this.validateSignalChorusInspectionCamera();
    this.validateFoundationalInspectionCamera();
    this.validateSurfaceWakeLayeredInteraction();
    this.validateGuideThresholdLayeredInteraction();
    this.validateFirstSliceOwnershipRegistries();

    const requiredTargetFocusRules = [
      "TARGET_FOCUS_NURSERY_001",
      "TARGET_FOCUS_SCAR_FLOW_001",
      "TARGET_FOCUS_SIGNAL_CHORUS_001",
      "TARGET_FOCUS_BLOOM_RESIDUE_001",
      "TARGET_FOCUS_GRAVE_MEMORY_001",
      "TARGET_FOCUS_GRAVE_SCAR_MEMORY_SEAM_001"
    ];

    for (const id of requiredTargetFocusRules) {
      const rule = this.get("targetFocusRules", id);
      this.get("localCellRecipes", rule.cellId);
      for (const objectId of Object.keys(rule.preferredObjects ?? {})) {
        this.get("chemObjectRecipes", objectId);
      }
      for (const objectId of Object.keys(rule.targetKinds ?? {})) {
        this.get("chemObjectRecipes", objectId);
      }
      for (const provider of rule.providers ?? []) {
        if (provider.targetId) this.get("chemObjectRecipes", provider.targetId);
      }
    }

    const openingTuning = this.data.openingFlowTuning;
    if (!openingTuning?.id) {
      throw new Error("[RecipeDataSystem] openingFlowTuning_HC003C requires an id.");
    }
    for (const cellId of openingTuning.requiredFirstMinuteCells ?? []) {
      this.get("localCellRecipes", cellId);
    }
    for (const cellId of openingTuning.beyondMinuteCells ?? []) {
      this.get("localCellRecipes", cellId);
    }
    if (openingTuning.safeSeedTuning?.objectId) {
      this.get("chemObjectRecipes", openingTuning.safeSeedTuning.objectId);
    }

    const cinematicBeat = this.data.cinematicAwakeningBeat;
    if (!cinematicBeat?.id) {
      throw new Error("[RecipeDataSystem] cinematicAwakeningBeat_HC003D requires an id.");
    }
    if (!cinematicBeat.beatDurations || !cinematicBeat.cameraBeats) {
      throw new Error("[RecipeDataSystem] cinematicAwakeningBeat_HC003D requires beatDurations and cameraBeats.");
    }

    const requiredGuidePrompts = [
      "GUIDE_PROMPT_AWAKENING_001",
      "GUIDE_PROMPT_OPENING_FLOW_001",
      "GUIDE_PROMPT_SAFE_SEED_001",
      "GUIDE_PROMPT_SCAR_WARNING_001",
      "GUIDE_PROMPT_FIRST_FOLD_READY_001",
      "GUIDE_PROMPT_SCAR_FLOW_ARRIVAL_001",
      "GUIDE_PROMPT_SIGNAL_REVEAL_001",
      "GUIDE_PROMPT_FALLBACK_001"
    ];

    for (const id of requiredGuidePrompts) {
      const prompt = this.get("guidePromptRecipes", id);
      if (!prompt.guideLine || !prompt.objectiveLine) {
        throw new Error(`[RecipeDataSystem] Guide prompt ${id} needs guideLine and objectiveLine.`);
      }
      for (const cellId of prompt.cellIds ?? []) {
        if (cellId !== "*") this.get("localCellRecipes", cellId);
      }
    }

    const requiredChemObjects = [
      "dormant_seed_nutrient_001",
      "scar_contamination_plate_001",
      "flux_current_ribbon_001",
      "signal_vapor_thread_001",
      "scar_memory_fleck_001",
      "scar_flow_clot_001",
      "resonant_path_thread_001",
      "pressure_fold_current_001",
      "bloom_spore_lantern_001",
      "residue_memory_silt_001",
      "seed_choice_braid_001",
      "overgrowth_warning_tendril_001"
    ];



    const requiredMorphVisualRecipes = [
      "scar_flow_fold_surface_v01",
      "scar_pressure_haze_v01",
      "bloom_residue_fork_surface_v01",
      "bloom_residue_choice_haze_v01"
    ];

    for (const id of requiredMorphVisualRecipes) {
      this.get("visualCompositionRecipes", id);
    }

    for (const id of requiredChemObjects) {
      const objectRecipe = this.get("chemObjectRecipes", id);
      this.get("visualCompositionRecipes", objectRecipe.visual.visualRecipe);
      this.get("placeholderReplacementRecipes", objectRecipe.visual.placeholderRecipe);
      for (const bondId of objectRecipe.chemistry?.bondTypes ?? []) {
        this.get("bondRecipes", bondId);
      }
    }

    this.validateBlueprintTranslationLayer();
    this.validateFirstRouteChoicePlanning();
    this.validateGraveRouteRuntimePlanning();
    this.validateGraveRouteRecipePack();
    this.validatePlaceholderVisualTriage();
    this.validateP0VisualLockReplacements();
    this.validateControllerOnboardingTuning();
    this.validateOpeningObjectivePromptLock();
    this.validateDebugHiddenPlaytestMode();
    this.validateFirstMinuteVisualReadabilityPolish();
  }

  validateBlueprintTranslationLayer() {
    const layer = this.data.blueprintTranslationLayer;

    if (!layer || layer.id !== "HC003F_BLUEPRINT_TRANSLATION_LAYER") {
      throw new Error("[RecipeDataSystem] Missing HC-003F blueprint translation layer.");
    }

    if (layer.primaryReference !== HOST_CORE_SOURCE_AUTHORITY.sourcePackage
      || layer.compatibleDetailReference !== HOST_CORE_SOURCE_AUTHORITY.compatibleDetailSourcePackage) {
      throw new Error("[RecipeDataSystem] HC-003F translation layer must use the Host Core Rebuild blueprint as primary reference.");
    }

    // AUTHORITY1: archived role maps cannot override the rebuild architecture.
    for (const rule of ["local_cells_replace_chambers", "morph_regions_replace_exits", "no_gates_or_hard_region_transitions"]) {
      if (!layer.architectureRules?.includes(rule)) {
        throw new Error(`[RecipeDataSystem] Translation missing rebuild architecture rule: ${rule}`);
      }
    }

    const mappings = layer.localCellToBlueprintRole ?? [];
    const requiredCells = [
      "CELL_MEMBRANE_NURSERY_001",
      "CELL_SCAR_FLOW_FOLD_001",
      "CELL_SIGNAL_CHORUS_NERVE_001",
      "CELL_BLOOM_RESIDUE_FORK_001"
    ];

    for (const cellId of requiredCells) {
      this.get("localCellRecipes", cellId);
      if (!mappings.some((entry) => entry.cellId === cellId)) {
        throw new Error(`[RecipeDataSystem] Blueprint translation missing local cell mapping: ${cellId}`);
      }
    }

    const warning = layer.noLegacyRuntimeWarning ?? {};
    const searchableNoLegacyText = [
      layer.translationRule,
      layer.debugReadout?.warning,
      warning.strictMarker,
      warning.plainLanguage,
      warning.permissionWarning,
      warning.allowedTranslation,
      ...(warning.forbiddenRuntimeArchitecture ?? []),
      JSON.stringify(layer.localCellToBlueprintRole ?? []),
      JSON.stringify(layer.legacyBlueprintRoleMap ?? [])
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const requiredAuthorityMarkers = [
      "no hard gates",
      "arbitrary",
      "renderer-owned progression"
    ];

    for (const marker of requiredAuthorityMarkers) {
      if (!searchableNoLegacyText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] True-source translation missing authority marker: ${marker}`);
      }
    }

    const forbiddenRuntimeTerms = ["arbitrary doors", "teleports", "renderer-owned progression", "legacy stage"];
    const forbiddenRuntimeWarning = warning.forbiddenRuntimeArchitecture ?? [];
    for (const term of forbiddenRuntimeTerms) {
      if (!forbiddenRuntimeWarning.some((entry) => String(entry).toLowerCase().includes(term))) {
        throw new Error(`[RecipeDataSystem] True-source translation missing forbidden runtime architecture: ${term}`);
      }
    }
  }

  validateFirstRouteChoicePlanning() {
    const plan = this.data.firstRouteChoicePlanning;

    if (!plan || plan.id !== "HC003G_FIRST_ROUTE_CHOICE_PLANNING") {
      throw new Error("[RecipeDataSystem] Missing HC-003G first route choice planning data.");
    }

    if (plan.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-003G route planning must use the Host Core Rebuild blueprint as primary reference.");
    }

    const foundation = plan.currentLockedFoundation ?? {};
    for (const cellId of foundation.requiredFirstPlayableMinute ?? []) {
      this.get("localCellRecipes", cellId);
    }

    if (foundation.optionalBeyondMinuteFork) {
      this.get("localCellRecipes", foundation.optionalBeyondMinuteFork);
    }

    const route = plan.recommendedFirstRoute ?? {};
    if (route.id !== "ROUTE_GRAVE_MEMORY_RESIDUE_SCAR_001") {
      throw new Error("[RecipeDataSystem] HC-003G recommended first route must be Grave / memory / residue-scar.");
    }

    const requiredDomains = ["residue", "scar", "seed", "signal"];
    for (const domain of requiredDomains) {
      this.get("chemicalDomains", domain);
      if (!(route.dominantDomains ?? []).includes(domain)) {
        throw new Error(`[RecipeDataSystem] HC-003G route planning missing dominant domain ${domain}.`);
      }
    }

    const forbiddenText = JSON.stringify(plan).toLowerCase();
    const requiredWarnings = [
      "no old gates",
      "branch select menu",
      "not runtime active"
    ];

    for (const marker of requiredWarnings) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-003G route planning missing warning marker: ${marker}`);
      }
    }

    for (const option of plan.alternativeRoutePressures ?? []) {
      if (!option.id || !option.status || !option.reasonToDefer) {
        throw new Error("[RecipeDataSystem] HC-003G alternative route pressures need id, status, and reasonToDefer.");
      }
    }
  }


  validateGraveRouteRuntimePlanning() {
    const plan = this.data.graveRouteRuntimePlanning;

    if (!plan || plan.id !== "HC004A_GRAVE_ROUTE_RUNTIME_PLANNING") {
      throw new Error("[RecipeDataSystem] Missing HC-004A Grave route runtime planning data.");
    }

    if (plan.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-004A Grave route planning must use the Host Core Rebuild blueprint as primary reference.");
    }

    const route = plan.selectedRoute ?? {};
    if (route.id !== "ROUTE_GRAVE_MEMORY_RESIDUE_SCAR_001") {
      throw new Error("[RecipeDataSystem] HC-004A must preserve Grave Memory / Residue-Scar as selected route.");
    }

    const foundation = plan.currentFoundation ?? {};
    for (const cellId of foundation.requiredOpeningChain ?? []) {
      this.get("localCellRecipes", cellId);
    }
    if (foundation.optionalBeyondMinuteFork) {
      this.get("localCellRecipes", foundation.optionalBeyondMinuteFork);
    }

    const requiredDomains = ["residue", "scar", "seed", "signal"];
    const dominantDomains = plan.chemicalPlan?.dominantDomains ?? [];
    for (const domain of requiredDomains) {
      this.get("chemicalDomains", domain);
      if (!dominantDomains.includes(domain)) {
        throw new Error(`[RecipeDataSystem] HC-004A Grave route planning missing dominant domain ${domain}.`);
      }
    }

    for (const stateId of plan.chemicalPlan?.matterStates ?? []) {
      this.get("matterStates", stateId);
    }

    const plannedCell = plan.plannedLocalCell ?? {};
    if (plannedCell.id !== "CELL_GRAVE_MEMORY_RESIDUE_BED_001") {
      throw new Error("[RecipeDataSystem] HC-004A planned local cell must be CELL_GRAVE_MEMORY_RESIDUE_BED_001.");
    }
    const graveRecipePackActive = this.data.graveRouteRecipePack?.id === "HC004B_GRAVE_ROUTE_RECIPE_PACK";
    if (this.data.localCellRecipes.has(plannedCell.id) && !graveRecipePackActive) {
      throw new Error("[RecipeDataSystem] HC-004A planned Grave cell must not be runtime-authored before the HC-004B recipe pack.");
    }
    if (!plannedCell.status?.includes("not_runtime_active")) {
      throw new Error("[RecipeDataSystem] HC-004A planned Grave cell must remain not runtime active.");
    }

    for (const object of plan.plannedChemObjects ?? []) {
      if (!object.id || !object.status?.includes("planned_recipe_pack_only")) {
        throw new Error("[RecipeDataSystem] HC-004A planned chem objects require id and planned_recipe_pack_only status.");
      }
      for (const domain of object.domains ?? []) this.get("chemicalDomains", domain);
      if (object.matterState) this.get("matterStates", object.matterState);
      if (this.data.chemObjectRecipes.has(object.id) && !graveRecipePackActive) {
        throw new Error(`[RecipeDataSystem] HC-004A planned chem object must not be runtime-authored before the HC-004B recipe pack: ${object.id}`);
      }
    }

    const warningText = JSON.stringify(plan.branchRules?.noLegacyRuntimeArchitecture ?? {}).toLowerCase();
    for (const marker of [
      "legacy runtime architecture does not",
      "no old gates",
      "no doors",
      "no teleports",
      "no old chamber exits",
      "no stage node loaders",
      "no branch select menu",
      "not runtime active"
    ]) {
      if (!warningText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-004A Grave planning missing no-legacy marker: ${marker}`);
      }
    }

    if (plan.nextRecommendedPass?.id !== "HC-004B") {
      throw new Error("[RecipeDataSystem] HC-004A next recommended pass must be HC-004B.");
    }
  }


  validateGraveRouteRecipePack() {
    const pack = this.data.graveRouteRecipePack;

    if (!pack || pack.id !== "HC004B_GRAVE_ROUTE_RECIPE_PACK") {
      throw new Error("[RecipeDataSystem] Missing HC-004B Grave route recipe pack data.");
    }

    if (pack.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-004B Grave recipe pack must use the Host Core Rebuild blueprint as primary reference.");
    }

    if (pack.status !== "data_recipe_pack_only_not_runtime_active") {
      throw new Error("[RecipeDataSystem] HC-004B Grave recipe pack must remain data-only and not runtime active.");
    }

    if (pack.route?.id !== "ROUTE_GRAVE_MEMORY_RESIDUE_SCAR_001") {
      throw new Error("[RecipeDataSystem] HC-004B Grave recipe pack must preserve the selected Grave route id.");
    }

    const cell = this.get("localCellRecipes", "CELL_GRAVE_MEMORY_RESIDUE_BED_001");
    const graveMorphPrototypeActive = this.data.graveRouteMorphPrototype?.id === "HC004D_GRAVE_ROUTE_MORPH_PROTOTYPE";
    const graveReadLoopActive = ["HC-004F", "HC-004G", "HC-004H", "HC-004I", "HC-004J", "HC-004K", "HC-004L", "HC-004M", "HC-004N", "HC-004O", "HC-004P", "HC-004Q", "HC-004QA", "HC-004QB", "HC-004QC", "HC-004QD", "HC-004QE", "HC-004QF", "HC-004QG", "HC-004QH", "HC-004QI", "HC-004QJ", "HC-004R", "HC-005A", "HC-005B", "HC-005C", "HC-005D", "HC-006A", "HC-006B", "HC-006C", "HC-006D", "HC-006E", "HC-006EA", "HC-006EB", "HC-006F", "HC-006G", "HC-006H", "HC-006HA", "HC-006I", "HC-006IA", "HC-006J", "HC-006JA", "HC-006K", "HC-006KA", "HC-006KB", "HC-006KC", "HC-006KD", "HC-007A", "HC-007B", "HC-007C", "HC-007D", "HC-007E", "HC-008B", "HC-008C", "HC-008D", "HC-008E", "HC-008F", "HC-008G", "HC-009A", "HC-009B", "HC-009C", "HC-009D", "HC-009E", "HC-009F", "HC-009G"] .includes(this.data.buildManifest?.id);
    const graveRouteReadDataActive = graveReadLoopActive || ["HC-010A", "HC-010B", "HC-010C", "HC-010D", "HC-010E", "HC-010F", "HC-010G", "HC-011A", "HC-011A1", "HC-011B", "HC-012A", "HC-012B", "HC-012C", "HC-013A", "HC-013B", "HC-013C", "HC-013D", "HC-014A", "HC-014B", "HC-014C", "HC-014D", "HC-014E", "HC-014F", "HC-014G", "HC-014H", "HC-014I"].includes(this.data.buildManifest?.id);
    const allowedCellStatus = graveRouteReadDataActive
      ? ["authored_recipe_pack_not_runtime_active", "runtime_grave_morph_destination_prototype", "runtime_grave_read_before_absorb_loop_active", "runtime_grave_read_loop_stability_active_exit_deferred", "runtime_grave_exit_readiness_prototype_active_exit_deferred"]
      : graveMorphPrototypeActive
        ? ["authored_recipe_pack_not_runtime_active", "runtime_grave_morph_destination_prototype"]
        : ["authored_recipe_pack_not_runtime_active"];
    if (!allowedCellStatus.includes(cell.status)) {
      throw new Error("[RecipeDataSystem] Grave local cell status is not valid for the current Grave pass.");
    }
    const allowedLoopStatus = graveRouteReadDataActive
      ? ["planned_only_not_runtime_active", "runtime_destination_arrival_only_interaction_loop_deferred", "runtime_active_minimal_read_before_absorb_loop", "runtime_active_minimal_read_before_absorb_loop_stability_tuned", "runtime_active_minimal_read_before_absorb_loop_exit_readiness_prototype"]
      : graveMorphPrototypeActive
        ? ["planned_only_not_runtime_active", "runtime_destination_arrival_only_interaction_loop_deferred"]
        : ["planned_only_not_runtime_active"];
    if (!allowedLoopStatus.includes(cell.gameplayLoop?.status)) {
      throw new Error("[RecipeDataSystem] Grave local cell gameplay loop status is not valid for the current Grave pass.");
    }

    const requiredDomains = ["residue", "scar", "seed", "signal"];
    for (const domain of requiredDomains) {
      this.get("chemicalDomains", domain);
      if (!(pack.localCell?.dominantDomains ?? []).includes(domain)) {
        throw new Error(`[RecipeDataSystem] HC-004B Grave recipe pack missing dominant domain ${domain}.`);
      }
      if (!Object.keys(cell.chemistryField ?? {}).includes(domain)) {
        throw new Error(`[RecipeDataSystem] Grave local cell chemistry field missing ${domain}.`);
      }
    }

    for (const stateId of pack.localCell?.matterStates ?? []) {
      this.get("matterStates", stateId);
    }

    this.get("visualCompositionRecipes", cell.visuals?.environmentRecipe);
    this.get("visualCompositionRecipes", cell.visuals?.atmosphereRecipe);
    if (cell.visuals?.distantHostRecipe) this.get("visualCompositionRecipes", cell.visuals.distantHostRecipe);

    const expectedObjects = [
      "old_core_husk_memory_001",
      "residue_silt_cloud_001",
      "scar_lock_plate_001",
      "inheritance_seed_remnant_001"
    ];

    for (const objectId of expectedObjects) {
      if (!(cell.contents?.chemObjects ?? []).includes(objectId)) {
        throw new Error(`[RecipeDataSystem] Grave local cell contents missing ${objectId}.`);
      }

      const objectRecipe = this.get("chemObjectRecipes", objectId);
      const allowedObjectStatus = graveMorphPrototypeActive
        ? ["authored_recipe_pack_not_runtime_spawned", "runtime_spawned_by_grave_morph_prototype"]
        : ["authored_recipe_pack_not_runtime_spawned"];
      if (!allowedObjectStatus.includes(objectRecipe.status)) {
        throw new Error(`[RecipeDataSystem] Grave chem object status is not valid for the current Grave pass: ${objectId}`);
      }
      if (objectRecipe.origin?.localCell !== cell.id) {
        throw new Error(`[RecipeDataSystem] Grave chem object ${objectId} must point back to the Grave local cell.`);
      }
      for (const domain of objectRecipe.chemistry?.domains ?? []) this.get("chemicalDomains", domain);
      if (objectRecipe.chemistry?.matterState) this.get("matterStates", objectRecipe.chemistry.matterState);
      for (const bondId of objectRecipe.chemistry?.bondTypes ?? []) this.get("bondRecipes", bondId);
      this.get("visualCompositionRecipes", objectRecipe.visual?.visualRecipe);
      this.get("placeholderReplacementRecipes", objectRecipe.visual?.placeholderRecipe);
    }

    for (const recipeId of pack.visualRecipes ?? []) this.get("visualCompositionRecipes", recipeId);
    for (const placeholderId of pack.placeholderContracts ?? []) this.get("placeholderReplacementRecipes", placeholderId);

    const activeMorphMaps = [
      this.data.morphPlans,
      this.data.secondMorphPlans,
      this.data.thirdMorphPlans
    ];
    for (const morphMap of activeMorphMaps) {
      for (const morph of morphMap.values()) {
        if (morph.sourceCell === cell.id || morph.destinationCell === cell.id || morph.plannedDestinationCell === cell.id) {
          throw new Error(`[RecipeDataSystem] Grave cell must not be referenced by morph plan ${morph.id}.`);
        }
      }
    }

    for (const rule of this.data.targetFocusRules.values()) {
      if (rule.cellId === cell.id && !graveRouteReadDataActive) {
        throw new Error(`[RecipeDataSystem] Grave cell must not have an active target focus rule yet: ${rule.id}`);
      }
      if (rule.cellId === cell.id && graveRouteReadDataActive && rule.id !== "TARGET_FOCUS_GRAVE_MEMORY_001") {
        throw new Error(`[RecipeDataSystem] HC-004F only permits the Grave read-loop target focus rule: ${rule.id}`);
      }
    }

    const forbiddenText = JSON.stringify(pack).toLowerCase();
    for (const marker of [
      "runtime route activation",
      "new morph activation",
      "gates",
      "doors",
      "teleports",
      "old chamber runtime",
      "stage-node loaders",
      "branch select menu"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-004B Grave recipe pack missing forbidden marker: ${marker}`);
      }
    }
  }


  validateGraveRouteMorphPrototype() {
    const prototype = this.data.graveRouteMorphPrototype;

    if (!prototype || prototype.id !== "HC004D_GRAVE_ROUTE_MORPH_PROTOTYPE") {
      throw new Error("[RecipeDataSystem] Missing HC-004D Grave route morph prototype data.");
    }

    if (prototype.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-004D Grave morph prototype must use the Host Core Rebuild blueprint as primary reference.");
    }

    if (prototype.status !== "runtime_morph_prototype_active_no_interaction_loop") {
      throw new Error("[RecipeDataSystem] HC-004D Grave morph prototype must be active as a morph only, with interaction loop deferred.");
    }

    const morph = this.get("graveRouteMorphPlans", "MORPH_BLOOM_RESIDUE_TO_GRAVE_MEMORY_001");
    if (morph.sourceCell !== "CELL_BLOOM_RESIDUE_FORK_001") {
      throw new Error("[RecipeDataSystem] HC-004D Grave morph source must be Bloom Residue Fork.");
    }
    if (morph.destinationCell !== "CELL_GRAVE_MEMORY_RESIDUE_BED_001") {
      throw new Error("[RecipeDataSystem] HC-004D Grave morph destination must be Grave Memory Residue Bed.");
    }

    const sourceCell = this.get("localCellRecipes", morph.sourceCell);
    const destinationCell = this.get("localCellRecipes", morph.destinationCell);
    if (!["runtime_grave_morph_destination_prototype", "runtime_grave_read_before_absorb_loop_active", "runtime_grave_read_loop_stability_active_exit_deferred", "runtime_grave_exit_readiness_prototype_active_exit_deferred"].includes(destinationCell.status)) {
      throw new Error("[RecipeDataSystem] Grave cell must remain the HC-004D destination or HC-004F read-loop active cell.");
    }
    if (!["runtime_destination_arrival_only_interaction_loop_deferred", "runtime_active_minimal_read_before_absorb_loop", "runtime_active_minimal_read_before_absorb_loop_stability_tuned", "runtime_active_minimal_read_before_absorb_loop_exit_readiness_prototype"].includes(destinationCell.gameplayLoop?.status)) {
      throw new Error("[RecipeDataSystem] Grave gameplay loop must be deferred or HC-004F minimal read-before-absorb only.");
    }

    const sourceObjects = sourceCell.contents?.chemObjects ?? [];
    for (const objectId of morph.readiness?.requiredFocusObjects ?? []) {
      if (!sourceObjects.includes(objectId)) {
        throw new Error(`[RecipeDataSystem] Grave morph readiness focus must be a Bloom Residue object: ${objectId}`);
      }
    }

    const requiredObjects = [
      "old_core_husk_memory_001",
      "residue_silt_cloud_001",
      "scar_lock_plate_001",
      "inheritance_seed_remnant_001"
    ];

    for (const objectId of requiredObjects) {
      if (!(destinationCell.contents?.chemObjects ?? []).includes(objectId)) {
        throw new Error(`[RecipeDataSystem] Grave destination contents missing ${objectId}.`);
      }
      const objectRecipe = this.get("chemObjectRecipes", objectId);
      if (objectRecipe.status !== "runtime_spawned_by_grave_morph_prototype") {
        throw new Error(`[RecipeDataSystem] Grave object must be runtime-spawned by HC-004D morph prototype: ${objectId}`);
      }
      this.get("visualCompositionRecipes", objectRecipe.visual?.visualRecipe);
      this.get("placeholderReplacementRecipes", objectRecipe.visual?.placeholderRecipe);
    }

    const forbiddenText = JSON.stringify({ prototype, morph, destinationCell }).toLowerCase();
    for (const marker of [
      "no old gates",
      "no doors",
      "no teleports",
      "no stage-node loaders",
      "no branch select menu",
      "no grave interaction loop yet"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-004D Grave morph missing forbidden marker: ${marker}`);
      }
    }
  }


  validateGraveArrivalReadability() {
    const arrival = this.data.graveArrivalReadability;

    if (!arrival || arrival.id !== "GRAVE_ARRIVAL_READABILITY_HC004E") {
      throw new Error("[RecipeDataSystem] Missing HC-004E Grave arrival readability data.");
    }

    if (arrival.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-004E Grave arrival readability must use the Host Core Rebuild blueprint as primary reference.");
    }

    if (arrival.status !== "arrival_readability_active_no_interaction_loop") {
      throw new Error("[RecipeDataSystem] HC-004E Grave arrival readability must remain arrival-only with no interaction loop.");
    }

    if (arrival.sourceMorphPrototype !== "HC004D_GRAVE_ROUTE_MORPH_PROTOTYPE") {
      throw new Error("[RecipeDataSystem] HC-004E must build on HC-004D Grave morph prototype.");
    }

    if (arrival.cellId !== "CELL_GRAVE_MEMORY_RESIDUE_BED_001") {
      throw new Error("[RecipeDataSystem] HC-004E must target CELL_GRAVE_MEMORY_RESIDUE_BED_001.");
    }

    this.get("localCellRecipes", arrival.cellId);
    this.get("graveRouteMorphPlans", "MORPH_BLOOM_RESIDUE_TO_GRAVE_MEMORY_001");

    for (const entry of arrival.readabilityObjects ?? []) {
      this.get("chemObjectRecipes", entry.id);
      if (!entry.arrivalRole || !entry.firstRead) {
        throw new Error(`[RecipeDataSystem] Grave readability object ${entry.id} needs arrivalRole and firstRead.`);
      }
    }

    const requiredObjects = [
      "old_core_husk_memory_001",
      "residue_silt_cloud_001",
      "scar_lock_plate_001",
      "inheritance_seed_remnant_001"
    ];

    for (const id of requiredObjects) {
      if (!(arrival.readabilityObjects ?? []).some((entry) => entry.id === id)) {
        throw new Error(`[RecipeDataSystem] HC-004E Grave arrival readability missing ${id}.`);
      }
    }

    const graveFocusRule = this.data.targetFocusRules.get("TARGET_FOCUS_GRAVE_MEMORY_001");
    if (graveFocusRule && graveFocusRule.cellId !== arrival.cellId) {
      throw new Error("[RecipeDataSystem] Grave target focus rule must target the Grave Memory Residue Bed.");
    }

    const forbiddenText = JSON.stringify(arrival).toLowerCase();
    for (const marker of [
      "full grave interaction loop",
      "combat",
      "dialogue tree",
      "quest log",
      "gates",
      "doors",
      "teleports",
      "old chamber runtime",
      "stage-node loaders",
      "branch select menu"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-004E Grave arrival readability missing forbidden marker: ${marker}`);
      }
    }
  }


  validateGraveReadBeforeAbsorbLoop() {
    const loop = this.get("graveReadBeforeAbsorbRecipes", "GRAVE_READ_BEFORE_ABSORB_LOOP_001");

    if (loop.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-004F Grave read-before-absorb loop must use the Host Core Rebuild blueprint as primary reference.");
    }

    if (!["runtime_active_minimal_read_before_absorb_loop", "runtime_active_minimal_read_before_absorb_loop_stability_tuned", "runtime_active_minimal_read_before_absorb_loop_exit_readiness_prototype"].includes(loop.status)) {
      throw new Error("[RecipeDataSystem] Grave loop must remain a minimal read-before-absorb loop.");
    }

    if (loop.cellId !== "CELL_GRAVE_MEMORY_RESIDUE_BED_001") {
      throw new Error("[RecipeDataSystem] HC-004F Grave loop must target CELL_GRAVE_MEMORY_RESIDUE_BED_001.");
    }

    const arrival = this.data.graveArrivalReadability;
    if (loop.sourceArrivalReadability !== arrival?.id) {
      throw new Error("[RecipeDataSystem] HC-004F Grave loop must build on the HC-004E arrival readability record.");
    }

    this.get("localCellRecipes", loop.cellId);
    this.get("graveRouteMorphPlans", "MORPH_BLOOM_RESIDUE_TO_GRAVE_MEMORY_001");

    const requiredObjects = [
      "old_core_husk_memory_001",
      "residue_silt_cloud_001",
      "scar_lock_plate_001",
      "inheritance_seed_remnant_001"
    ];

    const sequenceObjects = new Set((loop.sequence ?? []).map((step) => step.focusObject));
    for (const objectId of requiredObjects) {
      this.get("chemObjectRecipes", objectId);
      if (!sequenceObjects.has(objectId)) {
        throw new Error(`[RecipeDataSystem] HC-004F Grave loop sequence missing ${objectId}.`);
      }
    }

    if (loop.safeTransfer?.allowedObject !== "residue_silt_cloud_001") {
      throw new Error("[RecipeDataSystem] HC-004F safe transfer must be limited to residue_silt_cloud_001.");
    }

    for (const objectId of loop.safeTransfer?.mustNotConsume ?? []) {
      if (!["old_core_husk_memory_001", "scar_lock_plate_001", "inheritance_seed_remnant_001"].includes(objectId)) {
        throw new Error(`[RecipeDataSystem] HC-004F unexpected must-not-consume object: ${objectId}`);
      }
      this.get("chemObjectRecipes", objectId);
    }

    const graveFocusRule = this.get("targetFocusRules", "TARGET_FOCUS_GRAVE_MEMORY_001");
    if (graveFocusRule.cellId !== loop.cellId) {
      throw new Error("[RecipeDataSystem] HC-004F target focus rule must belong to the Grave cell.");
    }
    for (const objectId of requiredObjects) {
      if (!(objectId in (graveFocusRule.preferredObjects ?? {}))) {
        throw new Error(`[RecipeDataSystem] HC-004F target focus rule missing preferred Grave object ${objectId}.`);
      }
      if (!(objectId in (graveFocusRule.targetKinds ?? {}))) {
        throw new Error(`[RecipeDataSystem] HC-004F target focus rule missing Grave target kind ${objectId}.`);
      }
    }

    const forbiddenText = JSON.stringify(loop).toLowerCase();
    for (const marker of [
      "combat",
      "dialogue tree",
      "quest log",
      "new route branch",
      "new morph activation",
      "gates",
      "doors",
      "teleports",
      "old chamber runtime",
      "stage-node loaders",
      "branch select menu",
      "act expansion",
      "consuming the old core husk",
      "opening the inheritance seed remnant"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-004F Grave loop missing forbidden marker: ${marker}`);
      }
    }
  }


  validateGraveLoopStabilityExitReadiness() {
    const plan = this.data.graveLoopStabilityExitReadiness;
    if (!plan?.id) {
      throw new Error("[RecipeDataSystem] HC-004G Grave loop stability/readiness plan requires an id.");
    }

    if (plan.id !== "GRAVE_LOOP_STABILITY_EXIT_READINESS_HC004G") {
      throw new Error("[RecipeDataSystem] HC-004G Grave stability plan id mismatch.");
    }

    if (plan.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-004G Grave stability plan must use the Host Core Rebuild blueprint as primary reference.");
    }

    if (plan.status !== "runtime_stability_readout_active_exit_planning_only") {
      throw new Error("[RecipeDataSystem] HC-004G must be a stability readout with exit planning only.");
    }

    const loop = this.get("graveReadBeforeAbsorbRecipes", plan.sourceLoop);
    if (loop.cellId !== plan.sourceCell) {
      throw new Error("[RecipeDataSystem] HC-004G source loop and source cell must match.");
    }

    this.get("localCellRecipes", plan.sourceCell);
    this.get("graveRouteMorphPlans", "MORPH_BLOOM_RESIDUE_TO_GRAVE_MEMORY_001");

    if (plan.exitReadinessPlan?.runtimeActivationThisPass !== "none") {
      throw new Error("[RecipeDataSystem] HC-004G must not activate a Grave exit at runtime.");
    }

    if (plan.exitReadinessPlan?.newRouteBranchThisPass !== false || plan.exitReadinessPlan?.morphActivationThisPass !== false) {
      throw new Error("[RecipeDataSystem] HC-004G must not create a new route branch or morph activation.");
    }

    if (plan.stabilityRules?.requiresSafeMemoryTransferComplete !== true) {
      throw new Error("[RecipeDataSystem] HC-004G stability must require safeMemoryTransferComplete.");
    }

    const protectedRemains = plan.stabilityRules?.requiredProtectedRemainsVisible ?? [];
    for (const objectId of ["old_core_husk_memory_001", "scar_lock_plate_001", "inheritance_seed_remnant_001"]) {
      if (!protectedRemains.includes(objectId)) {
        throw new Error(`[RecipeDataSystem] HC-004G protected remains missing ${objectId}.`);
      }
      this.get("chemObjectRecipes", objectId);
    }

    if (plan.stabilityRules?.safeTransferObject !== "residue_silt_cloud_001") {
      throw new Error("[RecipeDataSystem] HC-004G safe transfer object must remain residue_silt_cloud_001.");
    }
    this.get("chemObjectRecipes", "residue_silt_cloud_001");

    const forbiddenText = JSON.stringify(plan).toLowerCase();
    for (const marker of [
      "full grave route branch",
      "new morph activation",
      "runtime exit activation",
      "combat",
      "dialogue tree",
      "quest log",
      "gates",
      "doors",
      "teleports",
      "old chamber runtime",
      "stage-node loaders",
      "branch select menu",
      "act expansion",
      "consuming the old core husk",
      "opening the inheritance seed remnant"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-004G Grave stability plan missing forbidden marker: ${marker}`);
      }
    }
  }


  validateGraveExitReadinessPrototype() {
    const prototype = this.data.graveExitReadinessPrototype;
    if (!prototype?.id) {
      throw new Error("[RecipeDataSystem] HC-004H Grave exit-readiness prototype requires an id.");
    }

    if (prototype.id !== "GRAVE_EXIT_READINESS_PROTOTYPE_HC004H") {
      throw new Error("[RecipeDataSystem] HC-004H Grave exit-readiness prototype id mismatch.");
    }

    if (prototype.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-004H Grave exit-readiness must use the Host Core Rebuild blueprint as primary reference.");
    }

    if (prototype.status !== "runtime_exit_readiness_prototype_active_exit_deferred") {
      throw new Error("[RecipeDataSystem] HC-004H must be an exit-readiness prototype with exit activation deferred.");
    }

    const stability = this.data.graveLoopStabilityExitReadiness;
    if (prototype.sourceStabilityPlan !== stability?.id) {
      throw new Error("[RecipeDataSystem] HC-004H must build directly on the HC-004G Grave stability plan.");
    }

    const loop = this.get("graveReadBeforeAbsorbRecipes", prototype.sourceLoop);
    if (loop.cellId !== prototype.sourceCell) {
      throw new Error("[RecipeDataSystem] HC-004H source loop and source cell must match.");
    }

    const cell = this.get("localCellRecipes", prototype.sourceCell);
    if (cell.status !== "runtime_grave_exit_readiness_prototype_active_exit_deferred") {
      throw new Error("[RecipeDataSystem] HC-004H Grave cell must identify exit-readiness prototype active with exit deferred.");
    }

    if (cell.gameplayLoop?.status !== "runtime_active_minimal_read_before_absorb_loop_exit_readiness_prototype") {
      throw new Error("[RecipeDataSystem] HC-004H Grave gameplay loop must remain minimal read-before-absorb with exit-readiness prototype only.");
    }

    if (prototype.prototypeBehavior?.exitActivationThisPass !== false || prototype.prototypeBehavior?.playerRelocationThisPass !== false) {
      throw new Error("[RecipeDataSystem] HC-004H must not activate an exit or relocate the player.");
    }

    if (prototype.prototypeBehavior?.newRouteBranchThisPass !== false || prototype.prototypeBehavior?.morphActivationThisPass !== false) {
      throw new Error("[RecipeDataSystem] HC-004H must not create a new route branch or morph activation.");
    }

    if (prototype.readinessRules?.requiresStabilityPlanningReady !== true) {
      throw new Error("[RecipeDataSystem] HC-004H readiness must require HC-004G planningReady.");
    }

    const protectedRemains = prototype.readinessRules?.protectedRemains ?? [];
    for (const objectId of ["old_core_husk_memory_001", "scar_lock_plate_001", "inheritance_seed_remnant_001"]) {
      if (!protectedRemains.includes(objectId)) {
        throw new Error(`[RecipeDataSystem] HC-004H protected remains missing ${objectId}.`);
      }
      this.get("chemObjectRecipes", objectId);
    }

    if (prototype.readinessRules?.safeTransferObject !== "residue_silt_cloud_001") {
      throw new Error("[RecipeDataSystem] HC-004H safe transfer object must remain residue_silt_cloud_001.");
    }
    this.get("chemObjectRecipes", "residue_silt_cloud_001");
    this.get("chemObjectRecipes", prototype.readinessRules?.focusObject);

    const forbiddenText = JSON.stringify(prototype).toLowerCase();
    for (const marker of [
      "full grave route branch",
      "new morph activation",
      "runtime exit activation",
      "combat",
      "dialogue tree",
      "quest log",
      "gates",
      "doors",
      "teleports",
      "old chamber runtime",
      "stage-node loaders",
      "branch select menu",
      "act expansion",
      "consuming the old core husk",
      "opening the inheritance seed remnant",
      "moving the player to a new cell"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-004H Grave exit-readiness prototype missing forbidden marker: ${marker}`);
      }
    }
  }


  validateGraveRouteContinuityPlanning() {
    const plan = this.data.graveRouteContinuityPlanning;
    if (!plan?.id) {
      throw new Error("[RecipeDataSystem] HC-004I Grave route-continuity planning requires an id.");
    }

    if (plan.id !== "GRAVE_ROUTE_CONTINUITY_PLANNING_HC004I") {
      throw new Error("[RecipeDataSystem] HC-004I Grave route-continuity planning id mismatch.");
    }

    if (plan.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-004I Grave route-continuity planning must use the Host Core Rebuild blueprint as primary reference.");
    }

    if (plan.status !== "authored_route_continuity_planning_only_no_transition") {
      throw new Error("[RecipeDataSystem] HC-004I must remain authored route-continuity planning only with no transition.");
    }

    const prototype = this.data.graveExitReadinessPrototype;
    if (plan.sourceExitReadinessPrototype !== prototype?.id) {
      throw new Error("[RecipeDataSystem] HC-004I must build directly on the HC-004H Grave exit-readiness prototype.");
    }

    const stability = this.data.graveLoopStabilityExitReadiness;
    if (plan.sourceStabilityPlan !== stability?.id) {
      throw new Error("[RecipeDataSystem] HC-004I must preserve the HC-004G Grave stability source.");
    }

    const loop = this.get("graveReadBeforeAbsorbRecipes", plan.sourceLoop);
    if (loop.cellId !== plan.sourceCell) {
      throw new Error("[RecipeDataSystem] HC-004I source loop and source cell must match.");
    }

    const cell = this.get("localCellRecipes", plan.sourceCell);
    if (cell.status !== "runtime_grave_exit_readiness_prototype_active_exit_deferred") {
      throw new Error("[RecipeDataSystem] HC-004I must not replace the HC-004H Grave cell status.");
    }

    if (cell.gameplayLoop?.status !== "runtime_active_minimal_read_before_absorb_loop_exit_readiness_prototype") {
      throw new Error("[RecipeDataSystem] HC-004I must not replace the minimal Grave read-loop gameplay status.");
    }

    if (plan.continuityDecision?.chosenOptionId !== "deeper_grave_scar_memory_seam") {
      throw new Error("[RecipeDataSystem] HC-004I must choose deeper Grave / scar-memory seam as the next authored direction.");
    }

    const selected = (plan.candidateContinuityOptions ?? []).find((entry) => entry.id === plan.continuityDecision?.chosenOptionId);
    if (!selected || selected.decision !== "selected_for_next_data_pass") {
      throw new Error("[RecipeDataSystem] HC-004I selected continuity option must be selected for the next data pass.");
    }

    if (selected.plannedFutureCellId !== "CELL_GRAVE_SCAR_MEMORY_SEAM_001" || selected.plannedFutureCellStatus !== "not_authored_not_runtime_active") {
      throw new Error("[RecipeDataSystem] HC-004I must name the future scar-memory seam without authoring it as active runtime.");
    }

    const futureSeam = this.data.localCellRecipes.get("CELL_GRAVE_SCAR_MEMORY_SEAM_001");
    if (futureSeam && !["authored_recipe_pack_not_runtime_active", "runtime_arrival_prototype_active_loop_deferred", "runtime_arrival_and_first_read_loop_active"].includes(futureSeam.status)) {
      throw new Error("[RecipeDataSystem] Future scar-memory seam may only exist as an authored inactive recipe after HC-004J or as the HC-004M arrival-only prototype.");
    }
    if (futureSeam?.status === "runtime_arrival_prototype_active_loop_deferred" && futureSeam.runtimeActivation?.interactionLoopStatus !== "deferred_no_seam_loop") {
      throw new Error("[RecipeDataSystem] HC-004M seam arrival must keep the seam interaction loop deferred.");
    }
    if (futureSeam?.status === "runtime_arrival_and_first_read_loop_active" && futureSeam.runtimeActivation?.interactionLoopStatus !== "active_first_read_loop_HC004N") {
      throw new Error("[RecipeDataSystem] HC-004N seam must identify the first-read loop as active.");
    }

    const rules = plan.continuityRules ?? {};
    for (const key of [
      "requiresHC004HExitReadinessVisible",
      "requiresSafeMemoryTransferComplete",
      "requiresProtectedRemainsVisible",
      "requiresNoForcedAbsorb",
      "keepExitReadinessReadoutOnly",
      "noGateDoorTeleportMenu",
      "futureContinuityActivationRequiresSeparateLockDecision"
    ]) {
      if (rules[key] !== true) {
        throw new Error(`[RecipeDataSystem] HC-004I continuity rule ${key} must be true.`);
      }
    }

    for (const key of [
      "nextCellRecipeAuthoredThisPass",
      "runtimeTransitionThisPass",
      "playerRelocationThisPass",
      "newRouteBranchThisPass",
      "newMorphActivationThisPass"
    ]) {
      if (rules[key] !== false) {
        throw new Error(`[RecipeDataSystem] HC-004I continuity rule ${key} must be false.`);
      }
    }

    if (plan.carryForwardState?.safeTransferObject !== "residue_silt_cloud_001") {
      throw new Error("[RecipeDataSystem] HC-004I safe transfer object must remain residue_silt_cloud_001.");
    }
    this.get("chemObjectRecipes", "residue_silt_cloud_001");

    const protectedRemains = plan.carryForwardState?.protectedRemains ?? [];
    for (const objectId of ["old_core_husk_memory_001", "scar_lock_plate_001", "inheritance_seed_remnant_001"]) {
      if (!protectedRemains.includes(objectId)) {
        throw new Error(`[RecipeDataSystem] HC-004I protected remains missing ${objectId}.`);
      }
      this.get("chemObjectRecipes", objectId);
    }

    if (plan.plannedNextPrototype?.id !== "HC-004J" || plan.plannedNextPrototype?.runtimeActivation !== "forbidden_until_later_lock_decision") {
      throw new Error("[RecipeDataSystem] HC-004I next prototype must be HC-004J with runtime activation forbidden until later lock decision.");
    }

    const forbiddenText = JSON.stringify(plan).toLowerCase();
    for (const marker of [
      "full grave route branch",
      "new morph activation",
      "runtime exit activation",
      "combat",
      "dialogue tree",
      "quest log",
      "gates",
      "doors",
      "teleports",
      "old chamber runtime",
      "stage-node loaders",
      "branch select menu",
      "act expansion",
      "consuming the old core husk",
      "opening the inheritance seed remnant",
      "moving the player to a new cell",
      "player relocation",
      "exit transition"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-004I Grave route-continuity planning missing forbidden marker: ${marker}`);
      }
    }
  }



  validateGraveScarMemorySeamRecipePack() {
    const pack = this.data.graveScarMemorySeamRecipePack;
    if (!pack || pack.id !== "HC004J_GRAVE_SCAR_MEMORY_SEAM_RECIPE_PACK") {
      throw new Error("[RecipeDataSystem] Missing HC-004J Grave scar-memory seam recipe pack data.");
    }

    if (pack.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-004J seam recipe pack must use the Host Core Rebuild blueprint as primary reference.");
    }

    if (pack.status !== "recipe_pack_only_not_runtime_active") {
      throw new Error("[RecipeDataSystem] HC-004J seam recipe pack must remain recipe/data only and not runtime active.");
    }

    if (pack.sourceContinuityPlan !== this.data.graveRouteContinuityPlanning?.id) {
      throw new Error("[RecipeDataSystem] HC-004J seam recipe pack must build directly from HC-004I continuity planning.");
    }

    const sourceCell = this.get("localCellRecipes", pack.sourceCell);
    if (sourceCell.id !== "CELL_GRAVE_MEMORY_RESIDUE_BED_001") {
      throw new Error("[RecipeDataSystem] HC-004J source cell must remain Grave Memory Residue Bed.");
    }

    const seam = this.get("localCellRecipes", "CELL_GRAVE_SCAR_MEMORY_SEAM_001");
    const seamRuntimeArrivalActive = Boolean(this.data.graveScarMemorySeamRuntimeArrival);
    const allowedSeamStatuses = seamRuntimeArrivalActive
      ? ["authored_recipe_pack_not_runtime_active", "runtime_arrival_prototype_active_loop_deferred", "runtime_arrival_and_first_read_loop_active"]
      : ["authored_recipe_pack_not_runtime_active"];
    if (!allowedSeamStatuses.includes(seam.status)) {
      throw new Error("[RecipeDataSystem] HC-004J seam cell must be authored data only until HC-004M runtime arrival activates it.");
    }

    if (!seamRuntimeArrivalActive && (seam.runtimeActivation?.status !== "not_runtime_active" || seam.runtimeActivation?.transitionStatus !== "forbidden_this_pass")) {
      throw new Error("[RecipeDataSystem] HC-004J seam runtime activation must remain forbidden before HC-004M.");
    }

    for (const domain of pack.localCell?.dominantDomains ?? []) this.get("chemicalDomains", domain);
    for (const state of pack.localCell?.matterStates ?? []) this.get("matterStates", state);
    this.get("visualCompositionRecipes", seam.visuals?.environmentRecipe);
    this.get("visualCompositionRecipes", seam.visuals?.atmosphereRecipe);
    if (seam.visuals?.distantHostRecipe) this.get("visualCompositionRecipes", seam.visuals.distantHostRecipe);

    for (const objectId of pack.chemObjects ?? []) {
      if (!(seam.contents?.chemObjects ?? []).includes(objectId)) {
        throw new Error(`[RecipeDataSystem] HC-004J seam contents missing ${objectId}.`);
      }
      const objectRecipe = this.get("chemObjectRecipes", objectId);
      const allowedObjectStatuses = this.data.graveScarMemorySeamRuntimeArrival
        ? ["authored_recipe_pack_not_runtime_spawned", "runtime_spawned_by_seam_arrival_prototype", "runtime_readable_by_seam_first_read_loop"]
        : ["authored_recipe_pack_not_runtime_spawned"];
      if (!allowedObjectStatuses.includes(objectRecipe.status)) {
        throw new Error(`[RecipeDataSystem] HC-004J seam object has unexpected runtime status: ${objectId}`);
      }
      if (objectRecipe.origin?.localCell !== seam.id) {
        throw new Error(`[RecipeDataSystem] HC-004J seam object must point back to seam cell: ${objectId}`);
      }
      for (const domain of objectRecipe.chemistry?.domains ?? []) this.get("chemicalDomains", domain);
      if (objectRecipe.chemistry?.matterState) this.get("matterStates", objectRecipe.chemistry.matterState);
      for (const bondId of objectRecipe.chemistry?.bondTypes ?? []) this.get("bondRecipes", bondId);
      this.get("visualCompositionRecipes", objectRecipe.visual?.visualRecipe);
      this.get("placeholderReplacementRecipes", objectRecipe.visual?.placeholderRecipe);
    }

    for (const recipeId of pack.visualRecipes ?? []) this.get("visualCompositionRecipes", recipeId);
    for (const placeholderId of pack.placeholderContracts ?? []) this.get("placeholderReplacementRecipes", placeholderId);

    const morphMaps = [this.data.morphPlans, this.data.secondMorphPlans, this.data.thirdMorphPlans, this.data.graveRouteMorphPlans];
    for (const morphMap of morphMaps) {
      for (const morph of morphMap.values()) {
        if (morph.sourceCell === seam.id || morph.destinationCell === seam.id || morph.plannedDestinationCell === seam.id) {
          throw new Error(`[RecipeDataSystem] HC-004J seam must not be referenced by morph plan ${morph.id}.`);
        }
      }
    }

    for (const rule of this.data.targetFocusRules.values()) {
      if (rule.cellId === seam.id && !this.data.graveScarMemorySeamFirstReadLoop) {
        throw new Error(`[RecipeDataSystem] HC-004J seam must not have a target focus rule yet: ${rule.id}`);
      }
      for (const provider of rule.providers ?? []) {
        if ((pack.chemObjects ?? []).includes(provider.targetId) && !this.data.graveScarMemorySeamFirstReadLoop) {
          throw new Error(`[RecipeDataSystem] HC-004J seam object must not have an active target provider yet: ${provider.targetId}`);
        }
      }
    }

    for (const objectId of pack.carryForwardProtectedRemains ?? []) this.get("chemObjectRecipes", objectId);
    if (pack.carryForwardSafeTransferObject !== "residue_silt_cloud_001") {
      throw new Error("[RecipeDataSystem] HC-004J must keep safe transfer limited to residue_silt_cloud_001.");
    }

    const forbiddenText = JSON.stringify(pack).toLowerCase();
    for (const marker of ["runtime route activation", "new morph activation", "runtime exit activation", "player relocation", "gates", "doors", "teleports", "old chamber runtime", "stage-node loaders", "branch select menu"]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-004J seam recipe pack missing forbidden marker: ${marker}`);
      }
    }
  }


  validateGraveScarMemorySeamArrivalPlanning() {
    const plan = this.data.graveScarMemorySeamArrivalPlanning;
    if (!plan || plan.id !== "HC004L_GRAVE_SCAR_MEMORY_SEAM_ARRIVAL_PLANNING") {
      throw new Error("[RecipeDataSystem] Missing HC-004L Grave scar-memory seam arrival planning data.");
    }

    if (plan.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-004L seam arrival planning must use the Host Core Rebuild blueprint as primary reference.");
    }

    if (plan.status !== "arrival_planning_only_no_runtime_transition") {
      throw new Error("[RecipeDataSystem] HC-004L must remain arrival planning only with no runtime transition.");
    }

    if (plan.sourceContinuityPlan !== this.data.graveRouteContinuityPlanning?.id) {
      throw new Error("[RecipeDataSystem] HC-004L must build directly from HC-004I route continuity planning.");
    }
    if (plan.sourceRecipePack !== this.data.graveScarMemorySeamRecipePack?.id) {
      throw new Error("[RecipeDataSystem] HC-004L must build directly from HC-004J scar-memory seam recipe pack.");
    }
    if (plan.sourceVisualComposerSupport !== this.data.graveScarMemorySeamVisualComposerSupport?.id) {
      throw new Error("[RecipeDataSystem] HC-004L must build directly from HC-004K scar-memory seam visual composer support.");
    }
    if (plan.sourceExitReadinessPrototype !== this.data.graveExitReadinessPrototype?.id) {
      throw new Error("[RecipeDataSystem] HC-004L must preserve the HC-004H exit-readiness prototype as source.");
    }

    const sourceCell = this.get("localCellRecipes", plan.sourceCell);
    if (sourceCell.id !== "CELL_GRAVE_MEMORY_RESIDUE_BED_001") {
      throw new Error("[RecipeDataSystem] HC-004L source cell must remain Grave Memory Residue Bed.");
    }

    const seam = this.get("localCellRecipes", plan.plannedArrivalCell);
    if (seam.id !== "CELL_GRAVE_SCAR_MEMORY_SEAM_001") {
      throw new Error("[RecipeDataSystem] HC-004L planned arrival cell must be CELL_GRAVE_SCAR_MEMORY_SEAM_001.");
    }
    const seamRuntimeArrivalActive = Boolean(this.data.graveScarMemorySeamRuntimeArrival);
    const allowedSeamStatuses = seamRuntimeArrivalActive
      ? ["authored_recipe_pack_not_runtime_active", "runtime_arrival_prototype_active_loop_deferred", "runtime_arrival_and_first_read_loop_active"]
      : ["authored_recipe_pack_not_runtime_active"];
    const allowedLoopStatuses = seamRuntimeArrivalActive
      ? ["planned_only_not_runtime_active", "runtime_arrival_prototype_active_loop_deferred", "runtime_arrival_and_first_read_loop_active"]
      : ["planned_only_not_runtime_active"];
    if (!allowedSeamStatuses.includes(seam.status) || !allowedLoopStatuses.includes(seam.gameplayLoop?.status)) {
      throw new Error("[RecipeDataSystem] HC-004L seam cell must remain planned-only until HC-004M activates arrival only.");
    }
    if (!seamRuntimeArrivalActive && (seam.runtimeActivation?.status !== "not_runtime_active" || seam.runtimeActivation?.transitionStatus !== "forbidden_this_pass")) {
      throw new Error("[RecipeDataSystem] HC-004L seam runtime activation must remain forbidden before HC-004M.");
    }

    const seamObjects = plan.seamObjects ?? [];
    const readOrder = plan.arrivalPosture?.readabilityOrder ?? [];
    for (const objectId of seamObjects) {
      const object = this.get("chemObjectRecipes", objectId);
      if (object.origin?.localCell !== seam.id) {
        throw new Error(`[RecipeDataSystem] HC-004L seam object must still point back to seam cell: ${objectId}`);
      }
      const allowedObjectStatuses = this.data.graveScarMemorySeamRuntimeArrival
        ? ["authored_recipe_pack_not_runtime_spawned", "runtime_spawned_by_seam_arrival_prototype", "runtime_readable_by_seam_first_read_loop"]
        : ["authored_recipe_pack_not_runtime_spawned"];
      if (!allowedObjectStatuses.includes(object.status)) {
        throw new Error(`[RecipeDataSystem] HC-004L seam object has unexpected runtime status: ${objectId}`);
      }
      if (!readOrder.includes(objectId)) {
        throw new Error(`[RecipeDataSystem] HC-004L readability order missing seam object: ${objectId}`);
      }
    }
    if (plan.arrivalPosture?.firstReadObject !== "scar_memory_seam_thread_001") {
      throw new Error("[RecipeDataSystem] HC-004L first seam read must start at scar_memory_seam_thread_001.");
    }

    for (const objectId of plan.arrivalPosture?.mustCarryForward ?? []) {
      this.get("chemObjectRecipes", objectId);
    }
    if (plan.arrivalPosture?.safeTransferMemory !== "residue_silt_cloud_001_trace_only") {
      throw new Error("[RecipeDataSystem] HC-004L must carry forward only the residue_silt_cloud_001 trace memory.");
    }

    const rules = plan.arrivalReadabilityRules ?? {};
    for (const key of [
      "requiresHC004HExitReadinessVisible",
      "requiresHC004GPlanningReady",
      "requiresSafeMemoryTransferComplete",
      "requiresProtectedRemainsVisible",
      "requiresNoForcedAbsorb",
      "requiresHC004KVisualSupport",
      "requiresSeamCellAuthoredInactive",
      "noGateDoorTeleportMenu",
      "futureArrivalActivationRequiresSeparateLockDecision"
    ]) {
      if (rules[key] !== true) {
        throw new Error(`[RecipeDataSystem] HC-004L arrival rule ${key} must be true.`);
      }
    }
    for (const key of [
      "runtimeTransitionThisPass",
      "playerRelocationThisPass",
      "newMorphActivationThisPass",
      "targetFocusActivationThisPass",
      "seamInteractionLoopThisPass"
    ]) {
      if (rules[key] !== false) {
        throw new Error(`[RecipeDataSystem] HC-004L arrival rule ${key} must be false.`);
      }
    }

    for (const morphMap of [this.data.morphPlans, this.data.secondMorphPlans, this.data.thirdMorphPlans, this.data.graveRouteMorphPlans]) {
      for (const morph of morphMap.values()) {
        if (morph.sourceCell === seam.id || morph.destinationCell === seam.id || morph.plannedDestinationCell === seam.id) {
          throw new Error(`[RecipeDataSystem] HC-004L seam must not be referenced by morph plan ${morph.id}.`);
        }
      }
    }

    for (const rule of this.data.targetFocusRules.values()) {
      if (rule.cellId === seam.id && !this.data.graveScarMemorySeamFirstReadLoop) {
        throw new Error(`[RecipeDataSystem] HC-004L seam must not have a target focus rule yet: ${rule.id}`);
      }
      for (const provider of rule.providers ?? []) {
        if (seamObjects.includes(provider.targetId) && !this.data.graveScarMemorySeamFirstReadLoop) {
          throw new Error(`[RecipeDataSystem] HC-004L seam object must not have active target provider yet: ${provider.targetId}`);
        }
      }
    }

    const activationText = JSON.stringify(plan.runtimeActivation ?? {}).toLowerCase();
    for (const marker of ["forbidden_this_pass"]) {
      if (!activationText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-004L runtime activation must include ${marker}.`);
      }
    }

    const forbiddenText = JSON.stringify(plan).toLowerCase();
    for (const marker of [
      "runtime route activation",
      "new morph activation",
      "runtime exit activation",
      "player relocation",
      "moving the player to the scar-memory seam",
      "target focus activation",
      "seam interaction loop",
      "gates",
      "doors",
      "teleports",
      "old chamber runtime",
      "stage-node loaders",
      "branch select menu",
      "exit transition"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-004L seam arrival planning missing forbidden marker: ${marker}`);
      }
    }
  }

  validateGraveScarMemorySeamRuntimeArrival() {
    const plan = this.data.graveScarMemorySeamRuntimeArrival;
    if (!plan || plan.id !== "HC004M_GRAVE_SCAR_MEMORY_SEAM_RUNTIME_ARRIVAL") {
      throw new Error("[RecipeDataSystem] Missing HC-004M Grave scar-memory seam runtime arrival data.");
    }

    if (plan.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-004M seam runtime arrival must use the Host Core Rebuild blueprint as primary reference.");
    }

    if (plan.status !== "runtime_arrival_prototype_active_loop_deferred") {
      throw new Error("[RecipeDataSystem] HC-004M must identify runtime arrival active with seam loop deferred.");
    }

    if (plan.sourceArrivalPlanning !== this.data.graveScarMemorySeamArrivalPlanning?.id) {
      throw new Error("[RecipeDataSystem] HC-004M must build directly from HC-004L arrival planning.");
    }
    if (plan.sourceContinuityPlan !== this.data.graveRouteContinuityPlanning?.id) {
      throw new Error("[RecipeDataSystem] HC-004M must preserve HC-004I continuity planning as source.");
    }
    if (plan.sourceExitReadinessPrototype !== this.data.graveExitReadinessPrototype?.id) {
      throw new Error("[RecipeDataSystem] HC-004M must preserve HC-004H exit-readiness as source.");
    }
    if (plan.sourceVisualComposerSupport !== this.data.graveScarMemorySeamVisualComposerSupport?.id) {
      throw new Error("[RecipeDataSystem] HC-004M must preserve HC-004K visual support as source.");
    }
    if (plan.sourceRecipePack !== this.data.graveScarMemorySeamRecipePack?.id) {
      throw new Error("[RecipeDataSystem] HC-004M must preserve HC-004J seam recipe pack as source.");
    }

    const sourceCell = this.get("localCellRecipes", plan.sourceCell);
    const seam = this.get("localCellRecipes", plan.destinationCell);
    if (sourceCell.id !== "CELL_GRAVE_MEMORY_RESIDUE_BED_001") {
      throw new Error("[RecipeDataSystem] HC-004M source cell must remain Grave Memory Residue Bed.");
    }
    if (seam.id !== "CELL_GRAVE_SCAR_MEMORY_SEAM_001") {
      throw new Error("[RecipeDataSystem] HC-004M destination cell must be CELL_GRAVE_SCAR_MEMORY_SEAM_001.");
    }
    const firstReadActive = Boolean(this.data.graveScarMemorySeamFirstReadLoop);
    if (firstReadActive) {
      if (seam.status !== "runtime_arrival_and_first_read_loop_active") {
        throw new Error("[RecipeDataSystem] HC-004N seam cell must be runtime arrival plus first-read loop active.");
      }
      if (seam.gameplayLoop?.status !== "runtime_arrival_and_first_read_loop_active") {
        throw new Error("[RecipeDataSystem] HC-004N seam gameplay loop must identify first-read loop active.");
      }
      if (seam.runtimeActivation?.targetFocusStatus !== "active_seam_read_targets_only_HC004N") {
        throw new Error("[RecipeDataSystem] HC-004N seam target focus status mismatch.");
      }
      if (seam.runtimeActivation?.interactionLoopStatus !== "active_first_read_loop_HC004N") {
        throw new Error("[RecipeDataSystem] HC-004N seam interaction loop status mismatch.");
      }
    } else {
      if (seam.status !== "runtime_arrival_prototype_active_loop_deferred") {
        throw new Error("[RecipeDataSystem] HC-004M seam cell must be runtime arrival active with loop deferred.");
      }
      if (seam.gameplayLoop?.status !== "runtime_arrival_prototype_active_loop_deferred") {
        throw new Error("[RecipeDataSystem] HC-004M seam gameplay loop must be arrival-only and loop-deferred.");
      }
      if (seam.runtimeActivation?.status !== "runtime_arrival_prototype_active_HC004M") {
        throw new Error("[RecipeDataSystem] HC-004M seam runtime activation status mismatch.");
      }
      if (seam.runtimeActivation?.targetFocusStatus !== "deferred_no_target_focus_rule") {
        throw new Error("[RecipeDataSystem] HC-004M target focus must remain deferred.");
      }
      if (seam.runtimeActivation?.interactionLoopStatus !== "deferred_no_seam_loop") {
        throw new Error("[RecipeDataSystem] HC-004M seam interaction loop must remain deferred.");
      }
    }

    const trigger = plan.triggerRules ?? {};
    for (const key of [
      "requiresActiveSourceCell",
      "requiresGraveExitReadinessActive",
      "requiresGraveExitReadinessMarkerVisible",
      "requiresGraveLoopStabilityPlanningReady",
      "requiresSafeMemoryTransferComplete",
      "requiresProtectedRemainsVisible",
      "requiresNoForcedAbsorb",
      "requiresPulsePressed"
    ]) {
      if (trigger[key] !== true) {
        throw new Error(`[RecipeDataSystem] HC-004M trigger rule ${key} must be true.`);
      }
    }
    if (trigger.absorbStartsArrival !== false) {
      throw new Error("[RecipeDataSystem] HC-004M absorb must not start seam arrival.");
    }
    if (trigger.preferredFocusObject !== "scar_lock_plate_001") {
      throw new Error("[RecipeDataSystem] HC-004M preferred focus object must be scar_lock_plate_001.");
    }

    const prototype = plan.arrivalPrototype ?? {};
    if (prototype.mode !== "slow_no_gate_continuity_pull") {
      throw new Error("[RecipeDataSystem] HC-004M arrival mode must be slow_no_gate_continuity_pull.");
    }
    if (prototype.playerRelocationThisPass !== true || prototype.runtimeArrivalThisPass !== true) {
      throw new Error("[RecipeDataSystem] HC-004M must explicitly allow only smooth runtime arrival/player relocation.");
    }
    for (const key of [
      "newMorphPlanThisPass",
      "runtimeExitArchitectureThisPass",
      "targetFocusActivationThisPass",
      "seamInteractionLoopThisPass"
    ]) {
      if (prototype[key] !== false) {
        throw new Error(`[RecipeDataSystem] HC-004M prototype rule ${key} must be false.`);
      }
    }

    const spawnPlan = plan.seamSpawnPlan ?? {};
    if (spawnPlan.firstReadObject !== "scar_memory_seam_thread_001") {
      throw new Error("[RecipeDataSystem] HC-004M first seam read must remain scar_memory_seam_thread_001.");
    }
    for (const objectId of spawnPlan.chemObjects ?? []) {
      const object = this.get("chemObjectRecipes", objectId);
      if (object.origin?.localCell !== seam.id) {
        throw new Error(`[RecipeDataSystem] HC-004M seam object must point back to seam cell: ${objectId}`);
      }
      const allowedStatus = firstReadActive ? ["runtime_spawned_by_seam_arrival_prototype", "runtime_readable_by_seam_first_read_loop"] : ["runtime_spawned_by_seam_arrival_prototype"];
      if (!allowedStatus.includes(object.status)) {
        throw new Error(`[RecipeDataSystem] HC-004M/HC-004N seam object has invalid runtime status: ${objectId}`);
      }
      this.get("visualCompositionRecipes", object.visual?.visualRecipe);
      this.get("placeholderReplacementRecipes", object.visual?.placeholderRecipe);
    }
    for (const entry of spawnPlan.environmentObjects ?? []) {
      this.get("visualCompositionRecipes", entry.visualRecipeId);
    }
    for (const objectId of spawnPlan.carryForwardProtectedRemains ?? []) this.get("chemObjectRecipes", objectId);
    if (spawnPlan.safeTraceObject !== "residue_silt_cloud_001") {
      throw new Error("[RecipeDataSystem] HC-004M safe trace object must remain residue_silt_cloud_001.");
    }

    for (const morphMap of [this.data.morphPlans, this.data.secondMorphPlans, this.data.thirdMorphPlans, this.data.graveRouteMorphPlans]) {
      for (const morph of morphMap.values()) {
        if (morph.sourceCell === seam.id || morph.destinationCell === seam.id || morph.plannedDestinationCell === seam.id) {
          throw new Error(`[RecipeDataSystem] HC-004M must not add a morph plan for seam arrival: ${morph.id}.`);
        }
      }
    }
    for (const rule of this.data.targetFocusRules.values()) {
      if (rule.cellId === seam.id && !this.data.graveScarMemorySeamFirstReadLoop) {
        throw new Error(`[RecipeDataSystem] HC-004M must not add target focus for the seam yet: ${rule.id}`);
      }
      for (const provider of rule.providers ?? []) {
        if ((spawnPlan.chemObjects ?? []).includes(provider.targetId) && !this.data.graveScarMemorySeamFirstReadLoop) {
          throw new Error(`[RecipeDataSystem] HC-004M seam object must not be an active target-focus provider: ${provider.targetId}`);
        }
      }
    }

    const forbiddenText = JSON.stringify(plan).toLowerCase();
    for (const marker of [
      "old gates",
      "doors",
      "teleports",
      "branch select menu",
      "old chamber runtime",
      "stage-node loaders",
      "target focus activation for the seam",
      "full seam interaction loop",
      "combat",
      "dialogue tree",
      "quest log"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-004M missing forbidden marker: ${marker}`);
      }
    }
  }



  validateGraveScarMemorySeamFirstReadLoop() {
    const loop = this.data.graveScarMemorySeamFirstReadLoop;
    if (!loop || loop.id !== "GRAVE_SCAR_MEMORY_SEAM_FIRST_READ_LOOP_HC004N") {
      throw new Error("[RecipeDataSystem] Missing HC-004N Grave scar-memory seam first-read loop data.");
    }

    if (loop.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-004N seam first-read loop must use the Host Core Rebuild blueprint as primary reference.");
    }

    if (loop.status !== "runtime_active_first_read_loop_no_exit_no_absorb_consumption") {
      throw new Error("[RecipeDataSystem] HC-004N seam loop must be active first-read only, with no exit and no absorption consumption.");
    }

    if (loop.sourceRuntimeArrival !== this.data.graveScarMemorySeamRuntimeArrival?.id) {
      throw new Error("[RecipeDataSystem] HC-004N seam loop must build directly on HC-004M runtime arrival.");
    }

    const seam = this.get("localCellRecipes", loop.cellId);
    if (seam.id !== "CELL_GRAVE_SCAR_MEMORY_SEAM_001") {
      throw new Error("[RecipeDataSystem] HC-004N loop cell must be CELL_GRAVE_SCAR_MEMORY_SEAM_001.");
    }
    if (seam.status !== "runtime_arrival_and_first_read_loop_active") {
      throw new Error("[RecipeDataSystem] HC-004N seam cell must identify first-read loop active.");
    }
    if (seam.gameplayLoop?.status !== "runtime_arrival_and_first_read_loop_active") {
      throw new Error("[RecipeDataSystem] HC-004N seam gameplay loop must identify first-read loop active.");
    }
    if (seam.runtimeActivation?.targetFocusStatus !== "active_seam_read_targets_only_HC004N") {
      throw new Error("[RecipeDataSystem] HC-004N seam target focus status mismatch.");
    }
    if (seam.runtimeActivation?.interactionLoopStatus !== "active_first_read_loop_HC004N") {
      throw new Error("[RecipeDataSystem] HC-004N seam interaction loop status mismatch.");
    }

    const expectedObjects = [
      "scar_memory_seam_thread_001",
      "residue_stitch_lattice_001",
      "echo_husk_imprint_001",
      "closed_inheritance_suture_001"
    ];
    const sequenceObjects = new Set((loop.sequence ?? []).map((step) => step.focusObject));
    for (const objectId of expectedObjects) {
      if (!sequenceObjects.has(objectId)) {
        throw new Error(`[RecipeDataSystem] HC-004N seam sequence missing ${objectId}.`);
      }
      const object = this.get("chemObjectRecipes", objectId);
      if (object.origin?.localCell !== seam.id) {
        throw new Error(`[RecipeDataSystem] HC-004N seam object ${objectId} must point back to the seam cell.`);
      }
      if (object.status !== "runtime_readable_by_seam_first_read_loop") {
        throw new Error(`[RecipeDataSystem] HC-004N seam object ${objectId} must be runtime readable by the first-read loop.`);
      }
      this.get("visualCompositionRecipes", object.visual?.visualRecipe);
      this.get("placeholderReplacementRecipes", object.visual?.placeholderRecipe);
    }

    const focusRule = this.get("targetFocusRules", "TARGET_FOCUS_GRAVE_SCAR_MEMORY_SEAM_001");
    if (focusRule.cellId !== seam.id) {
      throw new Error("[RecipeDataSystem] HC-004N seam target focus rule must belong to the seam cell.");
    }
    for (const objectId of expectedObjects) {
      if (!(objectId in (focusRule.preferredObjects ?? {}))) {
        throw new Error(`[RecipeDataSystem] HC-004N seam target focus missing preferred object ${objectId}.`);
      }
      if (!(objectId in (focusRule.targetKinds ?? {}))) {
        throw new Error(`[RecipeDataSystem] HC-004N seam target focus missing target kind ${objectId}.`);
      }
    }

    for (const morphMap of [this.data.morphPlans, this.data.secondMorphPlans, this.data.thirdMorphPlans, this.data.graveRouteMorphPlans]) {
      for (const morph of morphMap.values()) {
        if (morph.sourceCell === seam.id || morph.destinationCell === seam.id || morph.plannedDestinationCell === seam.id) {
          throw new Error(`[RecipeDataSystem] HC-004N must not add a morph plan for the seam loop: ${morph.id}.`);
        }
      }
    }

    const forbiddenText = JSON.stringify({ loop, seam }).toLowerCase();
    for (const marker of [
      "runtime exit activation",
      "new morph activation",
      "route branch activation",
      "combat",
      "dialogue tree",
      "quest log",
      "gates",
      "doors",
      "teleports",
      "old chamber runtime",
      "stage-node loaders",
      "branch select menu",
      "seam object absorption",
      "opening closed inheritance suture",
      "consuming the old core husk"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-004N seam first-read loop missing forbidden marker: ${marker}`);
      }
    }
  }

  validateGraveSeamContinuityMicroExit() {
    const microExit = this.data.graveSeamContinuityMicroExit;
    if (!microExit || microExit.id !== "GRAVE_SEAM_CONTINUITY_MICRO_EXIT_HC004O") {
      throw new Error("[RecipeDataSystem] Missing HC-004O Grave seam continuity micro-exit data.");
    }

    if (microExit.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-004O micro-exit must use the Host Core Rebuild blueprint as primary reference.");
    }

    if (microExit.status !== "runtime_active_no_gate_micro_exit_return_to_grave_bed") {
      throw new Error("[RecipeDataSystem] HC-004O micro-exit status must be active, no-gate, and return to Grave bed.");
    }

    const firstRead = this.data.graveScarMemorySeamFirstReadLoop;
    if (microExit.sourceFirstReadLoop !== firstRead?.id) {
      throw new Error("[RecipeDataSystem] HC-004O micro-exit must build directly on HC-004N first-read loop.");
    }

    const source = this.get("localCellRecipes", microExit.sourceCell);
    const destination = this.get("localCellRecipes", microExit.destinationCell);
    if (source.id !== "CELL_GRAVE_SCAR_MEMORY_SEAM_001") {
      throw new Error("[RecipeDataSystem] HC-004O source cell must be the Grave Scar-Memory Seam.");
    }
    if (destination.id !== "CELL_GRAVE_MEMORY_RESIDUE_BED_001") {
      throw new Error("[RecipeDataSystem] HC-004O destination cell must be the Grave Memory Residue Bed.");
    }

    const triggerObject = this.get("chemObjectRecipes", microExit.triggerObject);
    if (triggerObject.id !== "closed_inheritance_suture_001") {
      throw new Error("[RecipeDataSystem] HC-004O trigger object must be the closed inheritance suture.");
    }
    if (triggerObject.origin?.localCell !== source.id) {
      throw new Error("[RecipeDataSystem] HC-004O trigger object must belong to the seam cell.");
    }

    const rules = microExit.triggerRules ?? {};
    for (const key of ["requiresActiveSourceCell", "requiresFirstReadComplete", "requiresClosedSutureVisible", "requiresPulsePressed", "requiresNoAbsorbHeld"]) {
      if (rules[key] !== true) throw new Error(`[RecipeDataSystem] HC-004O trigger rule ${key} must be true.`);
    }
    if (rules.absorbStartsMicroExit !== false) {
      throw new Error("[RecipeDataSystem] HC-004O absorb must not start the micro-exit.");
    }

    const proto = microExit.microExitPrototype ?? {};
    if (proto.mode !== "short_no_gate_continuity_fold_back") {
      throw new Error("[RecipeDataSystem] HC-004O micro-exit mode mismatch.");
    }
    if (proto.playerRelocationThisPass !== true) {
      throw new Error("[RecipeDataSystem] HC-004O intentionally allows only short continuity relocation.");
    }
    for (const key of ["legacyExitArchitectureThisPass", "doorTeleportOrGateThisPass", "newMorphPlanThisPass", "newRouteBranchThisPass", "combatThisPass", "dialogueTreeThisPass", "questLogThisPass"]) {
      if (proto[key] !== false) throw new Error(`[RecipeDataSystem] HC-004O ${key} must remain false.`);
    }

    const completion = microExit.completion ?? {};
    if (completion.setsActiveCell !== destination.id) {
      throw new Error("[RecipeDataSystem] HC-004O completion must return to the Grave bed.");
    }
    if (completion.seamObjectsConsumed !== false || completion.closedInheritanceSutureOpened !== false || completion.newRouteBranchActivated !== false) {
      throw new Error("[RecipeDataSystem] HC-004O completion must not consume seam objects, open the suture, or activate a branch.");
    }

    for (const morphMap of [this.data.morphPlans, this.data.secondMorphPlans, this.data.thirdMorphPlans, this.data.graveRouteMorphPlans]) {
      for (const morph of morphMap.values()) {
        if (morph.sourceCell === source.id || morph.destinationCell === source.id || morph.plannedDestinationCell === source.id) {
          throw new Error(`[RecipeDataSystem] HC-004O must not add a morph plan for seam exit: ${morph.id}.`);
        }
      }
    }

    const forbiddenText = JSON.stringify(microExit).toLowerCase();
    for (const marker of [
      "old gates",
      "doors",
      "teleports",
      "branch select menu",
      "old chamber runtime",
      "old exit registries",
      "stage-node loaders",
      "new morph activation",
      "new route branch",
      "combat",
      "dialogue tree",
      "quest log",
      "seam object absorption",
      "opening closed inheritance suture",
      "consuming the old core husk",
      "opening inheritance seed remnant"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-004O micro-exit forbidden scope missing ${marker}.`);
      }
    }
  }


  validateGraveBedPostSeamResponse() {
    const response = this.data.graveBedPostSeamResponse;
    if (!response || response.id !== "GRAVE_BED_POST_SEAM_RESPONSE_HC004P") {
      throw new Error("[RecipeDataSystem] Missing HC-004P Grave bed post-seam response data.");
    }

    if (response.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-004P post-seam response must use the Host Core Rebuild blueprint reference.");
    }

    if (response.status !== "runtime_active_post_seam_grave_bed_response_no_branch") {
      throw new Error("[RecipeDataSystem] HC-004P response must be active post-seam response with no branch.");
    }

    const microExit = this.data.graveSeamContinuityMicroExit;
    if (response.sourceMicroExit !== microExit?.id) {
      throw new Error("[RecipeDataSystem] HC-004P response must build directly on the HC-004O micro-exit.");
    }

    const cell = this.get("localCellRecipes", response.cellId);
    if (cell.id !== "CELL_GRAVE_MEMORY_RESIDUE_BED_001") {
      throw new Error("[RecipeDataSystem] HC-004P response must run in the Grave Memory Residue Bed.");
    }
    if (cell.runtimeActivation?.postSeamResponseStatus !== "active_after_HC004O_micro_exit_HC004P_no_branch") {
      throw new Error("[RecipeDataSystem] Grave bed must expose HC-004P post-seam response status.");
    }

    const rules = response.activationRules ?? {};
    if (rules.requiresActiveCell !== cell.id) {
      throw new Error("[RecipeDataSystem] HC-004P active-cell rule must target the Grave bed.");
    }
    for (const key of ["requiresMicroExitComplete", "requiresProtectedRemainsVisible", "requiresNoAbsorbHeld", "pulseOrProximityReadsOnly"]) {
      if (rules[key] !== true) throw new Error(`[RecipeDataSystem] HC-004P activation rule ${key} must be true.`);
    }
    if (rules.absorbStartsResponse !== false) {
      throw new Error("[RecipeDataSystem] HC-004P absorb must not start the post-seam response.");
    }

    const expectedObjects = [
      "old_core_husk_memory_001",
      "scar_lock_plate_001",
      "inheritance_seed_remnant_001"
    ];
    const sequenceObjects = new Set((response.sequence ?? []).map((step) => step.focusObject));
    for (const objectId of expectedObjects) {
      if (!sequenceObjects.has(objectId)) {
        throw new Error(`[RecipeDataSystem] HC-004P sequence missing ${objectId}.`);
      }
      const object = this.get("chemObjectRecipes", objectId);
      if (object.origin?.localCell !== cell.id) {
        throw new Error(`[RecipeDataSystem] HC-004P object ${objectId} must belong to Grave bed.`);
      }
      if (object.runtimeActivation?.postSeamResponseStatus !== "readable_protected_after_seam_return_HC004P") {
        throw new Error(`[RecipeDataSystem] HC-004P object ${objectId} must expose protected post-seam response status.`);
      }
    }

    const residue = this.get("chemObjectRecipes", "residue_silt_cloud_001");
    if (residue.runtimeActivation?.postSeamResponseStatus !== "preserved_safe_transfer_trace_after_seam_return_HC004P") {
      throw new Error("[RecipeDataSystem] HC-004P must preserve residue_silt_cloud_001 as a safe-transfer trace, not a new consumable.");
    }

    const completion = response.completion ?? {};
    if (completion.protectedRemainsConsumed !== false || completion.inheritanceSeedRemnantOpened !== false || completion.newRouteBranchActivated !== false || completion.runtimeExitActivation !== false) {
      throw new Error("[RecipeDataSystem] HC-004P completion must not consume protected remains, open inheritance, activate an exit, or open a branch.");
    }

    for (const morphMap of [this.data.morphPlans, this.data.secondMorphPlans, this.data.thirdMorphPlans, this.data.graveRouteMorphPlans]) {
      for (const morph of morphMap.values()) {
        if (morph.sourceCell === cell.id && morph.id !== "MORPH_BLOOM_RESIDUE_TO_GRAVE_MEMORY_001") {
          throw new Error(`[RecipeDataSystem] HC-004P must not add a new morph source from Grave bed: ${morph.id}.`);
        }
      }
    }

    const forbiddenText = JSON.stringify({ response, cell }).toLowerCase();
    for (const marker of [
      "old gates",
      "doors",
      "teleports",
      "branch select menu",
      "old chamber runtime",
      "old exit registries",
      "stage-node loaders",
      "new morph activation",
      "new route branch",
      "runtime exit activation",
      "combat",
      "dialogue tree",
      "quest log",
      "new entity spawns",
      "consuming old core husk",
      "opening inheritance seed remnant",
      "seam object absorption",
      "opening closed inheritance suture"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-004P post-seam response forbidden scope missing ${marker}.`);
      }
    }
  }


  validateGraveRouteLockState() {
    const lock = this.data.graveRouteLockState;
    if (!lock || lock.id !== "GRAVE_ROUTE_LOCK_HC004R") {
      throw new Error("[RecipeDataSystem] Missing HC-004R Grave route lock state.");
    }

    if (lock.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-004R must use the Host Core Rebuild blueprint reference.");
    }
    if (lock.buildStrategyReference !== "BUILD_STRATEGY_REFERENCE.md") {
      throw new Error("[RecipeDataSystem] HC-004R must use the build strategy reference.");
    }
    if (lock.lockDecision !== "self_contained_memory_loop_locked") {
      throw new Error("[RecipeDataSystem] HC-004R lock decision must keep the Grave route self-contained.");
    }

    const source = lock.sourceCompletion ?? {};
    if (source.system !== "GraveBedPostSeamResponseSystem" || source.recipeId !== "GRAVE_BED_POST_SEAM_RESPONSE_HC004P") {
      throw new Error("[RecipeDataSystem] HC-004R must lock from the verified post-seam response owner.");
    }
    if (source.requiredCell !== "CELL_GRAVE_MEMORY_RESIDUE_BED_001" || source.requiredStage !== "grave_bed_post_seam_response_complete") {
      throw new Error("[RecipeDataSystem] HC-004R source cell or completion stage mismatch.");
    }
    if (source.requiresCompleted !== true || source.requiresResponseComplete !== true) {
      throw new Error("[RecipeDataSystem] HC-004R may not lock before full post-seam completion.");
    }

    const behavior = lock.runtimeBehavior ?? {};
    for (const key of ["readOnlyCompletionOwner", "protectedRemainsStayVisible", "inheritanceSeedRemainsClosed"]) {
      if (behavior[key] !== true) throw new Error(`[RecipeDataSystem] HC-004R runtime behavior ${key} must be true.`);
    }
    for (const key of ["playerRelocation", "runtimeExitActivation", "newMorphActivation", "newRouteBranch", "targetRequired", "inputRequired"]) {
      if (behavior[key] !== false) throw new Error(`[RecipeDataSystem] HC-004R runtime behavior ${key} must be false.`);
    }

    const next = lock.nextRecommendedPass ?? {};
    if (next.id !== "HC-005A" || !String(next.label ?? "").includes("Return Continuity")) {
      throw new Error("[RecipeDataSystem] HC-004R must point next to return-continuity planning, not a runtime exit.");
    }

    const forbiddenText = JSON.stringify(lock).toLowerCase();
    for (const marker of [
      "old gates",
      "doors",
      "teleports",
      "branch select menu",
      "old chamber runtime",
      "old exit registries",
      "stage-node loaders",
      "runtime exit activation",
      "new morph activation",
      "new route branch",
      "player relocation",
      "combat",
      "dialogue tree",
      "quest log",
      "opening inheritance seed remnant"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-004R forbidden scope missing ${marker}.`);
      }
    }
  }


  validateGraveReturnContinuity() {
    const recipe = this.data.graveReturnContinuity;
    if (!recipe || recipe.id !== "GRAVE_RETURN_CONTINUITY_HC005A") {
      throw new Error("[RecipeDataSystem] Missing HC-005A Grave return continuity recipe.");
    }
    if (recipe.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-005A must use the Host Core Rebuild blueprint reference.");
    }
    if (recipe.buildStrategyReference !== "BUILD_STRATEGY_REFERENCE.md") {
      throw new Error("[RecipeDataSystem] HC-005A must use the build strategy reference.");
    }
    if (recipe.status !== "runtime_active_continuous_return_prototype") {
      throw new Error("[RecipeDataSystem] HC-005A return continuity must be the active movement-driven prototype.");
    }
    if (recipe.sourceLock !== "GRAVE_ROUTE_LOCK_HC004R") {
      throw new Error("[RecipeDataSystem] HC-005A must start only from the locked HC-004R Grave route.");
    }
    if (recipe.sourceCell !== "CELL_GRAVE_MEMORY_RESIDUE_BED_001" || recipe.destinationCell !== "CELL_SIGNAL_CHORUS_NERVE_001") {
      throw new Error("[RecipeDataSystem] HC-005A source/destination continuity mismatch.");
    }
    this.get("localCellRecipes", recipe.sourceCell);
    this.get("localCellRecipes", recipe.destinationCell);

    const activation = recipe.activationRules ?? {};
    for (const key of ["requiresGraveRouteLocked", "requiresActiveSourceCell", "requiresPostSeamCompletion", "movementStartsReturn"]) {
      if (activation[key] !== true) throw new Error(`[RecipeDataSystem] HC-005A activation rule ${key} must be true.`);
    }
    for (const key of ["pulseStartsReturn", "absorbStartsReturn", "targetRequired"]) {
      if (activation[key] !== false) throw new Error(`[RecipeDataSystem] HC-005A activation rule ${key} must be false.`);
    }

    const path = recipe.path ?? {};
    for (const key of ["mouth", "controlA", "controlB", "destination"]) {
      if (!Array.isArray(path[key]) || path[key].length !== 3 || path[key].some((value) => !Number.isFinite(value))) {
        throw new Error(`[RecipeDataSystem] HC-005A path point ${key} must contain three finite numbers.`);
      }
    }
    if (!(path.mouthRadius > 0 && path.followRadius > path.mouthRadius && path.completionProgress > 0.8 && path.completionProgress <= 1)) {
      throw new Error("[RecipeDataSystem] HC-005A path radii or completion threshold are invalid.");
    }

    const completion = recipe.completion ?? {};
    if (completion.setsActiveCell !== recipe.destinationCell || completion.graveRouteRemainsLocked !== true || completion.routeAwarenessRestored !== true) {
      throw new Error("[RecipeDataSystem] HC-005A completion must restore Signal Chorus while preserving the Grave lock.");
    }
    for (const key of ["protectedRemainsConsumed", "inheritanceSeedRemnantOpened", "playerRelocation", "runtimeExitActivation", "newBranchSelection"]) {
      if (completion[key] !== false) throw new Error(`[RecipeDataSystem] HC-005A completion ${key} must be false.`);
    }

    const forbiddenText = JSON.stringify(recipe).toLowerCase();
    for (const marker of [
      "old gates", "doors", "teleports", "branch select menu", "old chamber runtime",
      "old exit registries", "stage-node loaders", "player relocation", "pulse-triggered return",
      "absorb-triggered return", "reopening grave interaction", "consuming old core husk",
      "opening inheritance seed remnant", "comb threshold runtime", "aperture fields runtime"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-005A forbidden scope missing ${marker}.`);
      }
    }
  }


  validateSignalChorusReturnState() {
    const recipe = this.data.signalChorusReturnState;
    if (!recipe || recipe.id !== "SIGNAL_CHORUS_RETURN_STATE_HC005B") {
      throw new Error("[RecipeDataSystem] Missing HC-005B Signal Chorus return-state recipe.");
    }
    if (recipe.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-005B must use the Host Core Rebuild blueprint reference.");
    }
    if (recipe.buildStrategyReference !== "BUILD_STRATEGY_REFERENCE.md") {
      throw new Error("[RecipeDataSystem] HC-005B must use the build strategy reference.");
    }
    if (recipe.status !== "runtime_active_return_state_convergence") {
      throw new Error("[RecipeDataSystem] HC-005B return state must be runtime active.");
    }
    if (recipe.sourceHandoff !== "GRAVE_RETURN_CONTINUITY_HC005A") {
      throw new Error("[RecipeDataSystem] HC-005B must activate only from the verified HC-005A return handoff.");
    }
    if (recipe.sourceCell !== "CELL_GRAVE_MEMORY_RESIDUE_BED_001" || recipe.destinationCell !== "CELL_SIGNAL_CHORUS_NERVE_001") {
      throw new Error("[RecipeDataSystem] HC-005B source/destination mismatch.");
    }
    this.get("localCellRecipes", recipe.sourceCell);
    this.get("localCellRecipes", recipe.destinationCell);

    const ownership = recipe.ownershipRules ?? {};
    for (const key of [
      "requiresVerifiedReturnCompletion",
      "reassertsDestinationCell",
      "suppressesOldSignalLoopReplay",
      "suppressesStaleGraveTargets",
      "preservesGraveRouteLock"
    ]) {
      if (ownership[key] !== true) throw new Error(`[RecipeDataSystem] HC-005B ownership rule ${key} must be true.`);
    }
    for (const key of ["opensNewRoute", "activatesNewMorph", "requiresInput", "requiresTarget"]) {
      if (ownership[key] !== false) throw new Error(`[RecipeDataSystem] HC-005B ownership rule ${key} must be false.`);
    }

    const completion = recipe.completion ?? {};
    if (completion.activeCell !== recipe.destinationCell || completion.routeAwarenessRestored !== true || completion.graveRouteRemainsLocked !== true) {
      throw new Error("[RecipeDataSystem] HC-005B completion must hold Signal Chorus while preserving the Grave lock.");
    }
    for (const key of ["oldGraveOwnersRelinquished", "oldSignalLoopSuppressed"]) {
      if (completion[key] !== true) throw new Error(`[RecipeDataSystem] HC-005B completion ${key} must be true.`);
    }
    for (const key of ["protectedRemainsConsumed", "inheritanceSeedRemnantOpened", "runtimeExitActivation", "newRouteBranch", "playerRelocation"]) {
      if (completion[key] !== false) throw new Error(`[RecipeDataSystem] HC-005B completion ${key} must be false.`);
    }

    const forbiddenText = JSON.stringify(recipe).toLowerCase();
    for (const marker of [
      "old gates", "doors", "teleports", "branch select menu", "old chamber runtime",
      "old exit registries", "stage-node loaders", "replaying the old signal chorus tuning loop",
      "reopening grave interaction", "opening inheritance seed remnant", "runtime exit activation",
      "new route branch", "new morph activation", "comb threshold runtime", "aperture fields runtime"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-005B forbidden scope missing ${marker}.`);
      }
    }
  }


  validateSignalChorusNextRoutePressure() {
    const recipe = this.data.signalChorusNextRoutePressure;
    if (!recipe || recipe.id !== "SIGNAL_CHORUS_NEXT_ROUTE_PRESSURE_HC005D") {
      throw new Error("[RecipeDataSystem] Missing HC-005D next-route pressure recipe.");
    }
    if (recipe.status !== "runtime_active_passive_pressure_only") {
      throw new Error("[RecipeDataSystem] HC-005D pressure must remain passive and runtime-readable only.");
    }
    if (recipe.sourceCellId !== "CELL_SIGNAL_CHORUS_NERVE_001") {
      throw new Error("[RecipeDataSystem] HC-005D pressure must originate in Signal Chorus.");
    }
    this.get("localCellRecipes", recipe.sourceCellId);

    const activation = recipe.activation ?? {};
    if (activation.requiresReturnState !== "signal_chorus_return_state_held") {
      throw new Error("[RecipeDataSystem] HC-005D pressure requires the held Signal return state.");
    }
    if (activation.requiresActiveCell !== recipe.sourceCellId || !(activation.minimumHeldSeconds > 0)) {
      throw new Error("[RecipeDataSystem] HC-005D activation prerequisites are invalid.");
    }

    const geometry = recipe.geometry ?? {};
    for (const key of ["start", "controlA", "controlB", "combCenter"]) {
      if (!Array.isArray(geometry[key]) || geometry[key].length !== 3 || geometry[key].some((value) => !Number.isFinite(value))) {
        throw new Error(`[RecipeDataSystem] HC-005D geometry ${key} must contain three finite numbers.`);
      }
    }
    if ((geometry.strandCount ?? 0) < 3 || (geometry.ribCount ?? 0) < 4 || (geometry.beadCount ?? 0) < 2) {
      throw new Error("[RecipeDataSystem] HC-005D visual pressure requires readable strands, ribs, and pulses.");
    }

    const completion = recipe.completion ?? {};
    if (completion.pressureReadable !== true) {
      throw new Error("[RecipeDataSystem] HC-005D must make the pressure readable.");
    }
    for (const key of ["routeActivated", "thresholdOpened", "targetActivated", "inputRequired", "activeCellChanges"]) {
      if (completion[key] !== false) throw new Error(`[RecipeDataSystem] HC-005D completion ${key} must be false.`);
    }

    const forbiddenText = JSON.stringify(recipe).toLowerCase();
    for (const marker of [
      "comb threshold runtime", "aperture fields runtime", "new local cell", "new morph destination",
      "target lock", "pulse activation", "absorb activation", "gate", "door", "teleport",
      "branch menu", "player relocation", "reopening grave", "replaying original signal chorus loop"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-005D forbidden scope missing ${marker}.`);
      }
    }
  }


  validateSignalChorusVisualIdentity() {
    const recipe = this.data.signalChorusVisualIdentity;
    if (!recipe || recipe.id !== "SIGNAL_CHORUS_VISUAL_IDENTITY_HC006A") {
      throw new Error("[RecipeDataSystem] Missing HC-006A Signal Chorus visual-identity recipe.");
    }
    if (recipe.status !== "runtime_active_visual_identity_only") {
      throw new Error("[RecipeDataSystem] HC-006A must remain a visual-identity-only runtime pass.");
    }
    if (recipe.sourceCellId !== "CELL_SIGNAL_CHORUS_NERVE_001") {
      throw new Error("[RecipeDataSystem] HC-006A visual identity must belong to Signal Chorus.");
    }
    this.get("localCellRecipes", recipe.sourceCellId);

    const activation = recipe.activation ?? {};
    if (activation.requiresReturnState !== "signal_chorus_return_state_held" || activation.requiresActiveCell !== recipe.sourceCellId) {
      throw new Error("[RecipeDataSystem] HC-006A must activate only from the held Signal Chorus return state.");
    }
    if (!(activation.minimumHeldSeconds >= 0) || !(activation.revealSeconds > 0)) {
      throw new Error("[RecipeDataSystem] HC-006A activation timing must be finite and non-negative.");
    }

    const geometry = recipe.geometry ?? {};
    for (const key of ["anchor", "combwardStart", "combwardAim"]) {
      if (!Array.isArray(geometry[key]) || geometry[key].length !== 3 || geometry[key].some((value) => !Number.isFinite(value))) {
        throw new Error(`[RecipeDataSystem] HC-006A geometry ${key} must contain three finite numbers.`);
      }
    }
    if ((geometry.lobeCount ?? 0) < 7 || (geometry.filamentCount ?? 0) < 12 || (geometry.combwardTrunkCount ?? 0) < 3 || (geometry.moteCount ?? 0) < 16) {
      throw new Error("[RecipeDataSystem] HC-006A requires enough lobes, filaments, trunks, and motes to read as living tissue.");
    }

    const completion = recipe.completion ?? {};
    for (const key of ["visualIdentityReadable", "livingMotionReadable", "combwardDirectionReinforced"]) {
      if (completion[key] !== true) throw new Error(`[RecipeDataSystem] HC-006A completion ${key} must be true.`);
    }
    for (const key of ["routeActivated", "targetActivated", "inputRequired", "activeCellChanges"]) {
      if (completion[key] !== false) throw new Error(`[RecipeDataSystem] HC-006A completion ${key} must be false.`);
    }

    const future = recipe.futureDepthPlan ?? {};
    if (!future.interaction || !future.camera || future.prototypeTarget !== "choir_resonance_node_001") {
      throw new Error("[RecipeDataSystem] HC-006A must preserve the authored trigger-depth and inspection-camera handoff plan.");
    }
    this.get("chemObjectRecipes", future.prototypeTarget);

    const forbiddenText = JSON.stringify(recipe).toLowerCase();
    for (const marker of [
      "comb threshold runtime", "aperture fields runtime", "new local cell", "new morph destination",
      "target lock", "pulse activation", "absorb activation", "route activation", "gate", "door",
      "teleport", "branch menu", "player relocation", "reopening grave",
      "replaying original signal chorus loop", "combat", "objective completion",
      "first person camera activation", "inspection camera activation"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-006A forbidden scope missing ${marker}.`);
      }
    }
  }


  validateSignalChorusLayeredInteraction() {
    const recipe = this.data.signalChorusLayeredInteraction;
    if (!recipe || recipe.id !== "SIGNAL_CHORUS_LAYERED_INTERACTION_HC006B") {
      throw new Error("[RecipeDataSystem] Missing HC-006B Signal Chorus layered-interaction recipe.");
    }
    if (recipe.status !== "runtime_active_layered_trigger_prototype") {
      throw new Error("[RecipeDataSystem] HC-006B must remain a scoped layered-trigger prototype.");
    }
    if (recipe.sourceCellId !== "CELL_SIGNAL_CHORUS_NERVE_001") {
      throw new Error("[RecipeDataSystem] HC-006B layered interaction must remain inside Signal Chorus.");
    }
    this.get("localCellRecipes", recipe.sourceCellId);

    const activation = recipe.activation ?? {};
    if (
      activation.requiresReturnState !== "signal_chorus_return_state_held" ||
      activation.requiresPressureStage !== "combward_pressure_readable" ||
      activation.requiresVisualIdentityStage !== "signal_chorus_living_tissue_identity_readable" ||
      activation.requiresActiveCell !== recipe.sourceCellId
    ) {
      throw new Error("[RecipeDataSystem] HC-006B activation prerequisites must preserve the stable return, pressure, identity, and active cell locks.");
    }

    const geometry = recipe.geometry ?? {};
    for (const key of ["anchor", "chorusCenter", "combwardAim"]) {
      if (!Array.isArray(geometry[key]) || geometry[key].length !== 3 || geometry[key].some((value) => !Number.isFinite(value))) {
        throw new Error(`[RecipeDataSystem] HC-006B geometry ${key} must contain three finite numbers.`);
      }
    }
    if (!(geometry.approachRange > 0) || !(geometry.interactionRange > 0) || !(geometry.sustainRange > 0)) {
      throw new Error("[RecipeDataSystem] HC-006B approach, interaction, and sustain ranges must be positive.");
    }

    const timing = recipe.timing ?? {};
    if (!(timing.approachHoldSeconds > 0) || !(timing.cadencePeriodSeconds > 0) || !(timing.sustainSeconds > 0) || !(timing.releaseSettleSeconds > 0)) {
      throw new Error("[RecipeDataSystem] HC-006B stage timing values must be positive.");
    }
    if ((timing.requiredCadenceMatches ?? 0) < 2 || !(timing.cadenceWindowFraction > 0 && timing.cadenceWindowFraction < 0.5)) {
      throw new Error("[RecipeDataSystem] HC-006B requires at least two cadence matches and a bounded visible timing window.");
    }

    const requiredStages = [
      "approach_cadence_knot",
      "observe_read",
      "align_with_cadence",
      "sustain_resonance",
      "release_and_settle",
      "layered_interaction_complete"
    ];
    const stageIds = (recipe.stages ?? []).map((stage) => stage.id);
    if (stageIds.join("|") !== requiredStages.join("|")) {
      throw new Error("[RecipeDataSystem] HC-006B stage grammar must remain ordered and complete.");
    }
    for (const stage of recipe.stages ?? []) {
      if (!stage.guideLine || !stage.objectiveLine || !stage.nextAction) {
        throw new Error(`[RecipeDataSystem] HC-006B stage ${stage.id} needs guide, objective, and next-action language.`);
      }
    }

    const completion = recipe.completion ?? {};
    if (completion.registersLayeredInteraction !== true) {
      throw new Error("[RecipeDataSystem] HC-006B must register layered interaction completion.");
    }
    for (const key of ["routeActivated", "thresholdOpened", "activeCellChanges"]) {
      if (completion[key] !== false) throw new Error(`[RecipeDataSystem] HC-006B completion ${key} must be false.`);
    }
    if (!String(completion.nextRecommendedPass ?? "").includes("HC-006E")) {
      throw new Error("[RecipeDataSystem] HC-006D foundation must hand off to HC-006E Surface Wake retrofit.");
    }

    const forbiddenText = JSON.stringify(recipe).toLowerCase();
    for (const marker of [
      "comb threshold runtime", "aperture fields runtime", "new local cell", "new morph destination",
      "route activation", "gate", "door", "teleport", "branch menu", "player relocation",
      "reopening grave", "replaying original signal chorus loop", "combat",
      "forced first-person camera", "inspection camera activation"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-006B forbidden scope missing ${marker}.`);
      }
    }
  }


  validateSignalChorusInspectionCamera() {
    const recipe = this.data.signalChorusInspectionCamera;
    if (!recipe || recipe.id !== "SIGNAL_CHORUS_TIGHT_INSPECTION_CAMERA_HC006C") {
      throw new Error("[RecipeDataSystem] Missing HC-006C Signal Chorus inspection-camera recipe.");
    }
    if (recipe.status !== "deprecated_compatibility_recipe" || recipe.replacedBy !== "FOUNDATIONAL_INSPECTION_CAMERA_HC006D") {
      throw new Error("[RecipeDataSystem] HC-006C inspection recipe must be explicitly deprecated in favor of HC-006D.");
    }
    if (recipe.sourceCellId !== "CELL_SIGNAL_CHORUS_NERVE_001" || recipe.focusObjectId !== "chorus_cadence_knot_001") {
      throw new Error("[RecipeDataSystem] HC-006C inspection camera must remain bound to the Signal Chorus cadence knot.");
    }

    const activation = recipe.activation ?? {};
    if (activation.controllerButtonIndex !== 3 || activation.keyboardCode !== "KeyF" || !activation.keyboardAliases?.includes("KeyV")) {
      throw new Error("[RecipeDataSystem] Inspection camera must use controller Y and canonical keyboard F, with V retained as a compatibility alias.");
    }
    if (!(activation.toggleRange > 0) || !(activation.autoExitRange > activation.toggleRange)) {
      throw new Error("[RecipeDataSystem] HC-006C inspection ranges must be positive with auto-exit beyond toggle range.");
    }

    const framing = recipe.framing ?? {};
    for (const key of ["distance", "fieldOfView", "targetBlendTowardFocus", "followSmoothing", "fovSmoothing"]) {
      if (!(framing[key] > 0) || !Number.isFinite(framing[key])) {
        throw new Error(`[RecipeDataSystem] HC-006C framing ${key} must be finite and positive.`);
      }
    }
    if (!(framing.fieldOfView >= 35 && framing.fieldOfView <= 65)) {
      throw new Error("[RecipeDataSystem] HC-006C inspection FOV must remain readable and non-extreme.");
    }
    if (!(framing.targetBlendTowardFocus > 0 && framing.targetBlendTowardFocus < 1)) {
      throw new Error("[RecipeDataSystem] HC-006C focus blend must frame between player and cadence knot.");
    }

    const behavior = recipe.behavior ?? {};
    if (behavior.optional !== true || behavior.forced !== false || behavior.firstPerson !== false) {
      throw new Error("[RecipeDataSystem] HC-006C must remain optional close third-person, never forced first-person.");
    }
    for (const key of ["preserveCameraRelativeMovement", "preserveRightStickOrbit", "r3RecentersInspection", "instantReturnAvailable"]) {
      if (behavior[key] !== true) throw new Error(`[RecipeDataSystem] HC-006C behavior ${key} must remain true.`);
    }
    for (const key of ["routeActivated", "targetRequired", "interactionStateChanged"]) {
      if (behavior[key] !== false) throw new Error(`[RecipeDataSystem] HC-006C behavior ${key} must remain false.`);
    }

    const forbiddenText = JSON.stringify(recipe).toLowerCase();
    for (const marker of [
      "forced first-person camera", "permanent camera lock", "movement-reference change",
      "interaction completion shortcut", "target acquisition", "route activation",
      "comb threshold activation", "aperture fields runtime", "player relocation",
      "gate", "door", "teleport"
    ]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-006C forbidden scope missing ${marker}.`);
      }
    }
  }


  validateSurfaceWakeLayeredInteraction() {
    const recipe = this.get("surfaceWakeLayeredInteractionRecipes", "SURFACE_WAKE_LAYERED_INTERACTION_HC006E");
    if (recipe.sourceCellId !== "CELL_MEMBRANE_NURSERY_001") {
      throw new Error("[RecipeDataSystem] HC-006E Surface Wake interaction must belong to the opening nursery cell.");
    }
    const expectedStages = [
      "approach_listening_fold",
      "observe_first_answer",
      "sustain_first_resonance",
      "watch_tissue_response",
      "release_and_settle",
      "surface_wake_complete"
    ];
    if ((recipe.stages ?? []).map((stage) => stage.id).join(",") !== expectedStages.join(",")) {
      throw new Error("[RecipeDataSystem] HC-006E Surface Wake interaction stage order is invalid.");
    }
    if (recipe.activation?.targetRequired !== false || recipe.completion?.routeActivated !== false || recipe.completion?.activeCellChanges !== false) {
      throw new Error("[RecipeDataSystem] HC-006E Surface Wake interaction must remain target-free and route-neutral.");
    }
    if (!recipe.activation?.blocksSafeSeedAbsorbUntilComplete || !recipe.completion?.unlocksSafeSeedReadability) {
      throw new Error("[RecipeDataSystem] HC-006E must hold safe-seed absorption until the shared lesson completes.");
    }
    if (recipe.completion?.safeSeedObjectId !== "dormant_seed_nutrient_001") {
      throw new Error("[RecipeDataSystem] HC-006E completion must hand off to the existing safe seed.");
    }
  }


  validateGuideThresholdLayeredInteraction() {
    const recipe = this.get("guideThresholdLayeredInteractionRecipes", "GUIDE_THRESHOLD_LAYERED_INTERACTION_HC006F");
    if (recipe.sourceCellId !== "CELL_SCAR_FLOW_FOLD_001") {
      throw new Error("[RecipeDataSystem] HC-006F Guide Threshold interaction must belong to Scar Flow.");
    }
    const expectedStages = [
      "approach_guiding_current",
      "observe_current_direction",
      "align_movement_with_fold",
      "sustain_resonance_while_traversing",
      "watch_threshold_tissue_answer",
      "release_at_settling_point",
      "guide_threshold_complete"
    ];
    if ((recipe.stages ?? []).map((stage) => stage.id).join(",") !== expectedStages.join(",")) {
      throw new Error("[RecipeDataSystem] HC-006F Guide Threshold stage order is invalid.");
    }
    if (recipe.activation?.targetRequired !== false || recipe.completion?.routeActivated !== false || recipe.completion?.thresholdOpened !== false || recipe.completion?.activeCellChanges !== false) {
      throw new Error("[RecipeDataSystem] HC-006F must remain target-free, no-gate, and cell-neutral until the existing morph handoff owns transition.");
    }
    if (recipe.completion?.preparedForSecondMorph !== true || recipe.completion?.noGate !== true) {
      throw new Error("[RecipeDataSystem] HC-006F must prepare the existing second morph through continuous tissue traversal.");
    }
    if (!Array.isArray(recipe.geometry?.pathPoints) || recipe.geometry.pathPoints.length < 4) {
      throw new Error("[RecipeDataSystem] HC-006F requires an authored directional tissue path.");
    }
    const forbidden = JSON.stringify(recipe.forbiddenScope ?? []).toLowerCase();
    for (const marker of ["hard gate", "door prompt", "teleport", "single pulse completion", "forced camera"]) {
      if (!forbidden.includes(marker)) throw new Error(`[RecipeDataSystem] HC-006F forbidden scope missing ${marker}.`);
    }
  }

  validateFirstSliceOwnershipRegistries() {
    const requiredRegions = [
      "surface_wake",
      "guide_threshold",
      "hub_chamber",
      "grave_memory_route",
      "vascular_route",
      "silt_burrow_route",
      "comb_threshold",
      "aperture_fields"
    ];
    const requiredGates = [
      "surface_to_guide_threshold",
      "guide_to_hub_chamber",
      "grave_memory_to_hub_chamber",
      "vascular_route_to_hub_chamber",
      "silt_burrow_route_to_hub_chamber",
      "hub_to_comb_threshold",
      "comb_threshold_to_hub_chamber",
      "comb_threshold_to_aperture_fields",
      "aperture_fields_to_comb_threshold"
    ];
    const requiredObjectives = [
      "surface_absorb_first_nutrient",
      "guide_stabilize_and_cross",
      "hub_read_route_gates",
      "grave_memory_read_and_stabilize",
      "vascular_route_playable_circuit",
      "silt_route_playable_circuit",
      "comb_threshold_playable_synthesis",
      "aperture_fields_arrival_read"
    ];

    for (const id of requiredRegions) this.get("firstSliceRegions", id);
    for (const id of requiredGates) this.get("firstSliceGates", id);
    for (const id of requiredObjectives) this.get("firstSliceObjectives", id);

    const cells = new Set();
    for (const region of this.data.firstSliceRegions.values()) {
      for (const field of ["displayName", "regionType", "hostFunction", "movementMode", "cameraProfile", "objective", "gateOut", "cinematicBeat", "visualLanguage"]) {
        if (!region[field]) throw new Error(`[RecipeDataSystem] HC-006I region ${region.id} missing ${field}.`);
      }
      this.get("firstSliceObjectives", region.objective);
      this.get("firstSliceCameraProfiles", region.cameraProfile);
      this.get("firstSliceVisualLanguages", region.visualLanguage);
      for (const cellId of region.runtimeCellIds ?? []) {
        this.get("localCellRecipes", cellId);
        if (cells.has(cellId)) throw new Error(`[RecipeDataSystem] HC-006I runtime cell mapped twice: ${cellId}`);
        cells.add(cellId);
      }
    }

    const surface = this.get("firstSliceRegions", "surface_wake");
    const guide = this.get("firstSliceRegions", "guide_threshold");
    const hub = this.get("firstSliceRegions", "hub_chamber");
    const grave = this.get("firstSliceRegions", "grave_memory_route");
    const vascular = this.get("firstSliceRegions", "vascular_route");
    const silt = this.get("firstSliceRegions", "silt_burrow_route");
    const comb = this.get("firstSliceRegions", "comb_threshold");
    const aperture = this.get("firstSliceRegions", "aperture_fields");
    if (
      surface.movementMode !== "landing"
      || guide.movementMode !== "threshold"
      || hub.movementMode !== "hub"
      || grave.movementMode !== "memory_route"
      || vascular.movementMode !== "vascular_rhythm"
      || silt.movementMode !== "silt_route_contract"
      || comb.movementMode !== "comb_threshold"
      || aperture.movementMode !== "aperture_fields_arrival"
    ) {
      throw new Error("[RecipeDataSystem] HC-014A mode mapping must retain the locked Act 1 owners plus the dedicated Aperture arrival mode.");
    }
    const legacyHubFoundation = hub.runtimeProxy === "signal_chorus_route_awareness_core_inside_hub_foundation"
      && hub.fullRegionPending === true
      && hub.foundationBuild === "HC-006J";
    const rebaselinedHub = hub.runtimeProxy === "none"
      && hub.fullRegionPending === false
      && ["FIRST_SLICE_RUNTIME_PROFILE_HC009A", "FIRST_SLICE_RUNTIME_PROFILE_HC009B", "FIRST_SLICE_RUNTIME_PROFILE_HC009D", "FIRST_SLICE_RUNTIME_PROFILE_HC009E", "FIRST_SLICE_RUNTIME_PROFILE_HC009F", "FIRST_SLICE_RUNTIME_PROFILE_HC009G", "ACT1_RUNTIME_PROFILE_HC010A", "ACT1_RUNTIME_PROFILE_HC010B", "ACT1_RUNTIME_PROFILE_HC010C", "ACT1_RUNTIME_PROFILE_HC010D", "ACT1_RUNTIME_PROFILE_HC010E", "ACT1_RUNTIME_PROFILE_HC010F", "ACT1_RUNTIME_PROFILE_HC010G", "ACT1_RUNTIME_PROFILE_HC011A", "ACT1_RUNTIME_PROFILE_HC011A1", "ACT1_RUNTIME_PROFILE_HC011B", "ACT1_RUNTIME_PROFILE_HC012A", "ACT1_RUNTIME_PROFILE_HC012B", "ACT1_RUNTIME_PROFILE_HC012C", "ACT1_RUNTIME_PROFILE_HC013A", "ACT1_RUNTIME_PROFILE_HC013B", "ACT1_RUNTIME_PROFILE_HC013C", "ACT1_RUNTIME_PROFILE_HC013D", "ACT1_RUNTIME_PROFILE_HC014A", "ACT1_RUNTIME_PROFILE_HC014B", "ACT1_RUNTIME_PROFILE_HC014C", "ACT1_RUNTIME_PROFILE_HC014D", "ACT1_RUNTIME_PROFILE_HC014E", "ACT1_RUNTIME_PROFILE_HC014F", "ACT1_RUNTIME_PROFILE_HC014G"].includes(hub.runtimeMountProfile)
      && hub.legacyRuntimeCellAdapter === "CELL_SIGNAL_CHORUS_NERVE_001";
    if (!legacyHubFoundation && !rebaselinedHub) {
      throw new Error("[RecipeDataSystem] Hub must be either the historical HC-006J proxy or the HC-009A through HC-014A authored mount.");
    }

    const requiredHubGates = ["hub_to_grave_memory_route", "hub_to_vascular_route", "hub_to_silt_burrow_route", "hub_to_comb_threshold"];
    for (const id of requiredHubGates) this.get("firstSliceGates", id);

    for (const gate of this.data.firstSliceGates.values()) {
      this.get("firstSliceRegions", gate.from);
      const isFirstSliceTransition = ["surface_to_guide_threshold", "guide_to_hub_chamber"].includes(gate.id);
      const isHubRouteIdentity = gate.from === "hub_chamber" && Boolean(gate.routeIdentity);
      const isRouteReturn = [
        "grave_memory_to_hub_chamber",
        "vascular_route_to_hub_chamber",
        "silt_burrow_route_to_hub_chamber",
        "comb_threshold_to_hub_chamber",
        "aperture_fields_to_comb_threshold"
      ].includes(gate.id);

      if (isFirstSliceTransition) {
        this.get("firstSliceRegions", gate.to);
        for (const objectiveId of gate.requirements ?? []) this.get("firstSliceObjectives", objectiveId);
        if (!gate.runtimeTransitionAdapter || gate.runtimeTransitionAdapter === "none") {
          throw new Error(`[RecipeDataSystem] HC-006I gate ${gate.id} missing transition adapter.`);
        }
      } else if (isHubRouteIdentity) {
        if (!gate.authoredStatus || !["active_route", "dormant_route", "contract_bound_route", "foundation_bound_threshold"].includes(gate.authoredStatus)) {
          throw new Error(`[RecipeDataSystem] HC-006J Hub gate ${gate.id} has invalid authored status.`);
        }
        if (gate.authoredStatus === "active_route") {
          for (const objectiveId of gate.requirements ?? []) this.get("firstSliceObjectives", objectiveId);
          if (!gate.runtimeTransitionAdapter || gate.runtimeTransitionAdapter === "none") {
            throw new Error(`[RecipeDataSystem] HC-006J active Hub gate ${gate.id} requires the existing runtime compatibility adapter.`);
          }
        } else if (gate.authoredStatus === "contract_bound_route") {
          this.get("firstSliceRegions", gate.to);
          for (const objectiveId of gate.requirements ?? []) this.get("firstSliceObjectives", objectiveId);
          const expectedImplementation = gate.id === "hub_to_vascular_route"
            ? "runtime_playable_vascular_rhythm_HC011A"
            : gate.id === "hub_to_silt_burrow_route"
              ? "runtime_playable_silt_pressure_HC012A"
              : "none";
          if (
            gate.runtimeTransitionAdapter !== "GateSystem"
            || !gate.runtimeCompatibilityDestination
            || gate.wakeCondition !== "graveReturned"
            || gate.playableReady !== true
            || gate.implementationStatus !== expectedImplementation
          ) {
            throw new Error(`[RecipeDataSystem] HC-012B route ${gate.id} is not safely destination-bound at its declared playability.`);
          }
        } else if (gate.authoredStatus === "foundation_bound_threshold") {
          this.get("firstSliceRegions", gate.to);
          if (
            gate.id !== "hub_to_comb_threshold"
            || gate.runtimeTransitionAdapter !== "GateSystem"
            || gate.runtimeCompatibilityDestination !== "CELL_COMB_THRESHOLD_FILTER_001"
            || gate.wakeCondition !== "hubThreeRouteConvergenceCompleted"
            || gate.playableReady !== true
            || gate.implementationStatus !== "runtime_comb_foundation_entry_HC013A"
          ) {
            throw new Error(`[RecipeDataSystem] HC-013A Comb entry ${gate.id} is not safely bound to completed Hub convergence.`);
          }
        } else if (gate.runtimeTransitionAdapter !== "none") {
          throw new Error(`[RecipeDataSystem] HC-006J dormant Hub gate ${gate.id} must not own a runtime transition adapter.`);
        }
      } else if (isRouteReturn) {
        this.get("firstSliceRegions", gate.to);
        for (const objectiveId of gate.requirements ?? []) this.get("firstSliceObjectives", objectiveId);
        const isGraveReturn = gate.id === "grave_memory_to_hub_chamber";
        const isVascularReturn = gate.id === "vascular_route_to_hub_chamber";
        const isSiltReturn = gate.id === "silt_burrow_route_to_hub_chamber";
        const isCombReturn = gate.id === "comb_threshold_to_hub_chamber";
        const isApertureReturn = gate.id === "aperture_fields_to_comb_threshold";
        if (
          gate.runtimeTransitionAdapter !== "GateSystem"
          || (!isApertureReturn && gate.runtimeCompatibilityDestination !== "CELL_SIGNAL_CHORUS_NERVE_001")
          || (isApertureReturn && gate.runtimeCompatibilityDestination !== "CELL_COMB_THRESHOLD_FILTER_001")
          || (isGraveReturn && gate.authoredStatus !== "active_return")
          || (isVascularReturn && (
            gate.authoredStatus !== "contract_return"
            || gate.allowNoRequirements === true
            || gate.playableReady !== true
            || gate.implementationStatus !== "runtime_vascular_return_after_synchronization_HC011A"
          ))
          || (isSiltReturn && (
            gate.authoredStatus !== "contract_return"
            || gate.allowNoRequirements === true
            || gate.playableReady !== true
            || gate.implementationStatus !== "runtime_silt_return_after_pressure_release_HC012A"
          ))
          || (isCombReturn && (
            gate.authoredStatus !== "foundation_return"
            || gate.allowNoRequirements !== true
            || gate.playableReady !== true
            || gate.implementationStatus !== "runtime_comb_foundation_return_HC013A"
          ))
          || (isApertureReturn && (
            gate.authoredStatus !== "foundation_bound_threshold"
            || gate.allowNoRequirements !== true
            || gate.playableReady !== true
            || gate.implementationStatus !== "runtime_aperture_return_HC014A"
          ))
        ) {
          throw new Error(`[RecipeDataSystem] HC-014A route return ${gate.id} must remain a GateSystem-owned fold to its authored parent boundary.`);
        }
      } else if (gate.id === "comb_threshold_to_aperture_fields") {
        if (
          gate.from !== "comb_threshold"
          || gate.to !== "aperture_fields"
          || gate.authoredStatus !== "foundation_bound_threshold"
          || gate.runtimeTransitionAdapter !== "GateSystem"
          || gate.runtimeCompatibilityDestination !== "CELL_APERTURE_FIELDS_ARRIVAL_001"
          || gate.allowNoRequirements !== true
          || gate.playableReady !== true
          || gate.wakeCondition !== "combThresholdPlayableCompleted"
          || gate.implementationStatus !== "runtime_aperture_arrival_crossing_HC014A"
          || !this.data.firstSliceRegions.has("aperture_fields")
        ) {
          throw new Error("[RecipeDataSystem] HC-014A Aperture arrival gate must remain Comb-synthesis-gated and bound to the arrival shelf only.");
        }
      } else {
        throw new Error(`[RecipeDataSystem] Unknown first-slice gate classification: ${gate.id}`);
      }
    }

    const hubRecipe = this.get("hubChamberFoundationRecipes", "HUB_CHAMBER_FOUNDATION_HC006J");
    const routes = hubRecipe.routes ?? [];
    if (hubRecipe.sourceCellId !== "CELL_SIGNAL_CHORUS_NERVE_001" || routes.length !== 3) {
      throw new Error("[RecipeDataSystem] HC-006J Hub foundation requires the Signal Chorus cell and exactly three authored route identities.");
    }
    if (routes.filter((route) => route.status === "active_route").length !== 1 || routes.filter((route) => route.status === "dormant_route").length !== 2) {
      throw new Error("[RecipeDataSystem] HC-006J Hub foundation requires one active route and two dormant routes.");
    }
    for (const route of routes) this.get("firstSliceGates", route.gateId);
    const forbidden = JSON.stringify(hubRecipe.forbidden ?? []).toLowerCase();
    for (const marker of ["teleport", "branch menu", "forced player relocation", "combat"]) {
      if (!forbidden.includes(marker)) throw new Error(`[RecipeDataSystem] HC-006J Hub forbidden scope missing ${marker}.`);
    }
    const hubPresentationLock = this.get("hubChamberFoundationRecipes", "HUB_CHAMBER_PRESENTATION_LOCK_HC006JA");
    if (this.data.buildManifest?.id === "HC-006JA") {
      if (hubPresentationLock.routes?.length !== 3 || hubPresentationLock.build !== "HC-006JA") {
        throw new Error("[RecipeDataSystem] HC-006JA requires the authored Hub presentation-lock recipe with exactly three routes.");
      }
      if ((hubPresentationLock.camera?.distance ?? 0) < 8 || (hubPresentationLock.visual?.hubClutterOpacityScale ?? 1) > 0.2) {
        throw new Error("[RecipeDataSystem] HC-006JA requires junction-wide camera framing and quiet retained Signal presentation.");
      }
    }

  }

  validateFoundationalInspectionCamera() {
    const profile = this.data.inspectionCameraProfile;
    if (!profile || profile.id !== "FOUNDATIONAL_INSPECTION_CAMERA_HC006D") {
      throw new Error("[RecipeDataSystem] Missing HC-006D foundational inspection-camera profile.");
    }
    if (!["runtime_active_reusable_inspection_camera", "runtime_active_persistent_global_tight_camera", "runtime_active_core_inspection_plus_guide_core_work_view", "runtime_active_core_inspection_plus_guide_piece_manipulation", "runtime_active_core_inspection_plus_chemistry_plus_visual_contact_language", "runtime_active_core_inspection_plus_chemistry_plus_attachment_proof", "runtime_active_core_inspection_plus_chemistry_plus_attachment_surface_coverage_lock", "runtime_active_core_inspection_plus_chemistry_plus_attachment_plus_hub_core_spatial_mirror", "runtime_active_core_inspection_plus_chemistry_plus_attachment_plus_hub_core_spatial_mirror_refined", "runtime_active_core_inspection_plus_consequence_rhythm_system_turntaking", "runtime_active_core_inspection_plus_host_answer_memory_traversal_inquiry", "runtime_active_core_inspection_plus_host_material_reply_grammar", "runtime_active_core_inspection_plus_traversal_intention_architecture", "runtime_active_core_inspection_plus_embodied_verb_affordance", "runtime_active_core_inspection_plus_persistent_local_consequence", "runtime_active_core_inspection_plus_verb_hierarchy_pulse_reachability", "runtime_active_core_inspection_plus_verb_power_cost_physiology", "runtime_active_core_inspection_plus_consequence_next_question"].includes(profile.status)) {
      throw new Error("[RecipeDataSystem] Foundational inspection camera must be an active reusable or persistent runtime profile.");
    }

    const activation = profile.activation ?? {};
    if (activation.controllerButtonIndex !== 3 || activation.keyboardCode !== "KeyF" || !activation.keyboardAliases?.includes("KeyV")) {
      throw new Error("[RecipeDataSystem] Foundational inspection camera must use Y / F with V as a compatibility alias.");
    }
    if (!(activation.autoExitRange > activation.toggleRange && activation.toggleRange > 0)) {
      throw new Error("[RecipeDataSystem] HC-006D inspection ranges must be positive and safely ordered.");
    }

    const framing = profile.framing ?? {};
    for (const key of ["distance", "fieldOfView", "targetBlendTowardFocus", "baseHeight", "shoulderOffset", "maxYawOffset", "blockerOpacity"]) {
      if (!Number.isFinite(framing[key]) || framing[key] <= 0) {
        throw new Error(`[RecipeDataSystem] HC-006D framing ${key} must be finite and positive.`);
      }
    }
    if (framing.distance < 4 || framing.fieldOfView < 48 || framing.fieldOfView > 60) {
      throw new Error("[RecipeDataSystem] HC-006D composition must remain pulled back and readable.");
    }
    if (!(framing.pitchMin < framing.pitchMax)) {
      throw new Error("[RecipeDataSystem] HC-006D inspection pitch bounds are invalid.");
    }

    const behavior = profile.behavior ?? {};
    if (behavior.optional !== true || behavior.forced !== false || behavior.firstPerson !== false || behavior.reusableFromOpening !== true) {
      throw new Error("[RecipeDataSystem] HC-006D must be optional close third-person and reusable from the opening.");
    }
    for (const key of ["preserveCameraRelativeMovement", "preserveRightStickOrbit", "r3RecentersInspection", "instantReturnAvailable"]) {
      if (behavior[key] !== true) throw new Error(`[RecipeDataSystem] HC-006D behavior ${key} must remain true.`);
    }
    for (const key of ["routeActivated", "targetRequired", "interactionStateChanged"]) {
      if (behavior[key] !== false) throw new Error(`[RecipeDataSystem] HC-006D behavior ${key} must remain false.`);
    }

    if (["runtime_active_persistent_global_tight_camera", "runtime_active_core_inspection_plus_guide_core_work_view", "runtime_active_core_inspection_plus_guide_piece_manipulation"].includes(profile.status)) {
      for (const key of ["globalToggle", "persistAcrossCells", "persistWithoutAuthoredFocus", "authoredFocusAssistOnly"]) {
        if (behavior[key] !== true) throw new Error(`[RecipeDataSystem] HC-006EB behavior ${key} must be true.`);
      }
      for (const key of ["autoExitOnFocusLoss", "autoExitOutsideRange"]) {
        if (behavior[key] !== false) throw new Error(`[RecipeDataSystem] HC-006EB behavior ${key} must be false.`);
      }
      const freeFraming = profile.freeFraming ?? {};
      for (const key of ["focusAhead", "distance", "fieldOfView", "targetBlendTowardFocus", "baseHeight", "shoulderOffset"]) {
        if (!Number.isFinite(freeFraming[key]) || freeFraming[key] <= 0) {
          throw new Error(`[RecipeDataSystem] HC-006EB/HC-024A free framing ${key} must be finite and positive.`);
        }
      }
      if (freeFraming.mode === "core_centered_orbit") {
        if (freeFraming.coreCentered !== true || freeFraming.fullYawOrbit !== true || freeFraming.preserveEntryAngle !== true) {
          throw new Error("[RecipeDataSystem] HC-024A/HC-024B Core inspection must remain centered, full-yaw, and preserve the entry composition.");
        }
        if (!(freeFraming.distance >= 2.2 && freeFraming.distance <= 3.2)) {
          throw new Error("[RecipeDataSystem] HC-024A/HC-024B Core inspection distance must remain intimate but third-person readable.");
        }
        if (!(freeFraming.pitchMin <= -0.8 && freeFraming.pitchMax >= 1.0)) {
          throw new Error("[RecipeDataSystem] HC-024A/HC-024B Core inspection must expose both underside and overhead viewing arcs.");
        }
      }

      if (["runtime_active_core_inspection_plus_guide_core_work_view", "runtime_active_core_inspection_plus_guide_piece_manipulation", "runtime_active_core_inspection_plus_chemistry_plus_visual_contact_language", "runtime_active_core_inspection_plus_chemistry_plus_attachment_proof", "runtime_active_core_inspection_plus_chemistry_plus_attachment_surface_coverage_lock", "runtime_active_core_inspection_plus_chemistry_plus_attachment_plus_hub_core_spatial_mirror", "runtime_active_core_inspection_plus_chemistry_plus_attachment_plus_hub_core_spatial_mirror_refined"].includes(profile.status)) {
        const workFraming = profile.workFraming ?? {};
        if (workFraming.mode !== "guide_assisted_core_work") {
          throw new Error("[RecipeDataSystem] HC-024B+ requires a Guide-assisted Core Work framing mode.");
        }
        if (!(workFraming.distance >= 1.6 && workFraming.distance <= 2.3)) {
          throw new Error("[RecipeDataSystem] HC-024B+ Core Work camera must remain intimate without becoming first-person.");
        }
        if (!(workFraming.fieldOfView >= 38 && workFraming.fieldOfView <= 48)) {
          throw new Error("[RecipeDataSystem] HC-024B+ Core Work field of view must remain readable and cinematic.");
        }
        const contextualInteractEntry = behavior.coreWorkUsesExistingInteractButtonContextually === true;
        const intentionalDpadEntry = behavior.coreWorkUsesIntentionalDpadDownEntry === true;
        if (behavior.guideAssistedCoreWork !== true || (!contextualInteractEntry && !intentionalDpadEntry)) {
          throw new Error("[RecipeDataSystem] HC-024B+ Core Work must be Guide-assisted and expose one explicit entry action.");
        }
        if (["HC-024D0C", "HC-024D1", "HC-024D2", "HC-024D3", "HC-024E", "HC-025A", "HC-025B", "HC-025C", "HC-026A", "HC-026A1", "HC-026B", "HC-026C", "HC-026C1", "HC-027A", "HC-027B", "HC-027C"].includes(profile.build) && (contextualInteractEntry || !intentionalDpadEntry)) {
          throw new Error("[RecipeDataSystem] HC-024D0C+ must keep A/E separate from Core Work entry and use intentional D-Pad Down Core Work entry.");
        }
        if (["HC-024D1", "HC-024D2", "HC-024D3", "HC-024E", "HC-025A", "HC-025B", "HC-025C", "HC-026A", "HC-026A1", "HC-026B", "HC-026C", "HC-026C1", "HC-027A", "HC-027B", "HC-027C"].includes(profile.build)) {
          if (behavior.coreWorkChemistryEnabled !== true
            || behavior.coreWorkSpatialChemistryEnabled !== true
            || behavior.coreWorkThreeZoneChemistry !== true
            || behavior.coreWorkFundamentalInteractionCount !== 9
            || behavior.coreWorkWholeCoreTopologyStateCount !== 10
            || behavior.coreWorkTopologyVisualReadabilityRequired !== true) {
            throw new Error("[RecipeDataSystem] HC-024D1+ requires visible three-zone spatial chemistry with 9 fundamental interactions and 10 whole-Core topology states.");
          }
        } else if (behavior.coreWorkChemistryEnabled !== false) {
          throw new Error("[RecipeDataSystem] HC-024B/HC-024C Core Work may not enable chemistry before HC-024D1.");
        }
        if (["HC-024D2", "HC-024D3", "HC-024E", "HC-025A", "HC-025B", "HC-025C", "HC-026A", "HC-026A1", "HC-026B", "HC-026C", "HC-026C1", "HC-027A", "HC-027B", "HC-027C"].includes(profile.build) && behavior.coreWorkTopologyVisualReadabilityRefined !== true) {
          throw new Error("[RecipeDataSystem] HC-024D2+ must preserve the strengthened whole-Core topology visual-readability pass.");
        }
        if (["HC-024D3", "HC-024E", "HC-025A", "HC-025B", "HC-025C", "HC-026A", "HC-026A1", "HC-026B", "HC-026C", "HC-026C1", "HC-027A", "HC-027B", "HC-027C"].includes(profile.build)) {
          if (behavior.coreWorkTelemetryCloudEnabled !== true
            || behavior.coreWorkTelemetryPatternRecognitionEnabled !== true
            || behavior.coreWorkRecognizedCloudPatternCount !== 5
            || behavior.coreWorkPatternPopEnabled !== true
            || behavior.coreWorkPatternPopOneShotOnStateEntry !== true
            || behavior.coreWorkPatternPopRequiresStablePlacement !== true) {
            throw new Error("[RecipeDataSystem] HC-024D3 requires continuous three-piece telemetry, five recognized cloud patterns, and one-shot stable-placement recognition pops.");
          }
        }
        if (["HC-024E", "HC-025A", "HC-025B", "HC-025C", "HC-026A", "HC-026A1", "HC-026B", "HC-026C", "HC-026C1", "HC-027A", "HC-027B", "HC-027C"].includes(profile.build)) {
          if (behavior.coreWorkWorldChemistryOutputEnabled !== true
            || behavior.coreWorkHostResponseVisualProofEnabled !== true
            || behavior.coreWorkCollisionConsequencesEnabled !== false) {
            throw new Error("[RecipeDataSystem] HC-024E+ requires generic chemistry output into Host response while collision authority remains locked.");
          }
          if (["HC-024E", "HC-025A"].includes(profile.build) && behavior.coreWorkMovementConsequencesEnabled !== false) {
            throw new Error("[RecipeDataSystem] HC-024E/HC-025A must keep chemistry movement consequences disabled.");
          }
          if (["HC-025B", "HC-025C", "HC-026A", "HC-026A1", "HC-026B", "HC-026C", "HC-026C1", "HC-027A", "HC-027B", "HC-027C"].includes(profile.build) && behavior.coreWorkMovementConsequencesEnabled !== true) {
            throw new Error("[RecipeDataSystem] HC-025B must enable only the contained Silt-membrane attachment movement consequence.");
          }
        }
        if (profile.build === "HC-025A") {
          if (behavior.coreContactLanguageEnabled !== true
            || !Array.isArray(behavior.coreContactLanguageStates)
            || behavior.coreContactLanguageStates.join(",") !== "suspended,brushing,attached,releasing"
            || behavior.coreContactUsesMovementBoundaryTelemetry !== true
            || behavior.coreContactVisualOnly !== true
            || behavior.coreContactMovementConsequencesEnabled !== false
            || behavior.coreContactCollisionConsequencesEnabled !== false
            || behavior.coreContactAdhesionPhysicsEnabled !== false) {
            throw new Error("[RecipeDataSystem] HC-025A requires visual-only suspended/brushing/attached/releasing contact language from existing boundary telemetry while movement/collision remain locked.");
          }
        }
        if (["HC-025B", "HC-025C", "HC-026A", "HC-026A1", "HC-026B", "HC-026C", "HC-026C1", "HC-027A", "HC-027B", "HC-027C"].includes(profile.build)) {
          if (behavior.coreContactLanguageEnabled !== true
            || !Array.isArray(behavior.coreContactLanguageStates)
            || behavior.coreContactLanguageStates.join(",") !== "suspended,brushing,attached,releasing"
            || behavior.coreContactUsesMovementBoundaryTelemetry !== true
            || behavior.coreContactVisualOnly !== false
            || behavior.coreContactMovementConsequencesEnabled !== true
            || behavior.coreContactCollisionConsequencesEnabled !== false
            || behavior.coreContactAdhesionPhysicsEnabled !== true
            || behavior.coreContactAttachmentUsesTrustedBoundaryOnly !== true
            || behavior.coreContactAttachmentRequiresSiltMembrane !== true
            || behavior.coreContactAttachmentUsesSiltWorldAlignment !== true
            || behavior.coreContactAttachmentReleaseUsesAwayIntent !== true) {
            throw new Error("[RecipeDataSystem] HC-025B+ requires chemistry-driven Silt-membrane attachment on the existing trusted boundary, with directional alignment and pull-away release, while collision/geography remain locked.");
          }
        }
        if (["HC-025C", "HC-026A", "HC-026A1", "HC-026B", "HC-026C", "HC-026C1", "HC-027A", "HC-027B", "HC-027C"].includes(profile.build)) {
          if (behavior.coreContactSurfaceCoverageAuditEnabled !== true
            || behavior.coreContactSurfaceCoverageUsesAuthoredMovementBoundsOnly !== true
            || behavior.coreContactInteriorDecorativeGeometryPhysicalized !== false
            || behavior.coreContactSurfaceExpansionThisPass !== false) {
            throw new Error("[RecipeDataSystem] HC-025C must lock contact coverage to existing authored movement envelopes and keep decorative/interior geometry visual-only.");
          }
        }
        if (["HC-026A", "HC-026A1", "HC-026B", "HC-026C", "HC-026C1", "HC-027A", "HC-027B", "HC-027C"].includes(profile.build)) {
          if (behavior.hubCoreSpatialMirrorEnabled !== true
            || behavior.hubCoreSpatialMirrorUsesSpatialCoreChemistry !== true
            || behavior.hubCoreSpatialMirrorMovesRetainedEchoAnatomy !== true
            || behavior.hubCoreSpatialMirrorMovesRouteGates !== false
            || behavior.hubCoreSpatialMirrorMovesRouteCorridors !== false
            || behavior.hubCoreSpatialMirrorTopologyStateCount !== 10) {
            throw new Error("[RecipeDataSystem] HC-026A+ must mirror spatial Core chemistry into retained Hub anatomy while route gates/corridors remain fixed.");
          }
          const expectedTelemetryInfluence = ["HC-026A1", "HC-026B", "HC-026C", "HC-026C1", "HC-027A", "HC-027B", "HC-027C"].includes(profile.build) ? 0.22 : 0.34;
          if (Math.abs((behavior.hubCoreSpatialMirrorExactTelemetryInfluence ?? 0) - expectedTelemetryInfluence) > 0.0001) {
            throw new Error(`[RecipeDataSystem] ${profile.build} Hub mirror exact-telemetry influence mismatch.`);
          }
          if (["HC-026A1", "HC-026B", "HC-026C", "HC-026C1", "HC-027A", "HC-027B", "HC-027C"].includes(profile.build)) {
            const radii = behavior.hubCoreSpatialMirrorZoneRadii ?? {};
            const scales = behavior.hubCoreSpatialMirrorZoneVisualScale ?? {};
            if (behavior.hubCoreSpatialMirrorMacroReadabilityRefined !== true
              || behavior.hubCoreSpatialMirrorRadialZoneDominance !== true
              || Math.abs((radii.deep ?? 0) - 1.55) > 0.0001
              || Math.abs((radii.inner ?? 0) - 3.75) > 0.0001
              || Math.abs((radii.membrane ?? 0) - 6.25) > 0.0001
              || Math.abs((scales.deep ?? 0) - 0.78) > 0.0001
              || Math.abs((scales.inner ?? 0) - 1.08) > 0.0001
              || Math.abs((scales.membrane ?? 0) - 1.38) > 0.0001) {
              throw new Error("[RecipeDataSystem] HC-026A1 requires stronger Hub-scale radial separation and zone silhouette scaling while exact XYZ remains secondary.");
            }
          }
        }
        if (["HC-026B", "HC-026C", "HC-026C1", "HC-027A", "HC-027B", "HC-027C"].includes(profile.build)) {
          if (behavior.earlyRegionReturnTraversalEnabled !== true
            || behavior.earlyRegionReturnTraversalMovementLed !== true
            || behavior.earlyRegionReturnTraversalRequiresHubReached !== true
            || behavior.earlyRegionReturnTraversalRetainsPlayerPosition !== true
            || behavior.earlyRegionReturnTraversalUsesTeleport !== false
            || behavior.earlyRegionReturnTraversalMutatesProgression !== false
            || behavior.earlyRegionReturnTraversalMovesRouteTopology !== false
            || behavior.earlyRegionReturnTraversalGuideRevisitGameplayEnabled !== true
            || behavior.earlyRegionReturnTraversalSurfaceGuideBidirectional !== true
            || behavior.earlyRegionReturnTraversalGuideHubBidirectional !== true) {
            throw new Error("[RecipeDataSystem] HC-026B requires movement-led, progression-neutral Surface/Guide/Hub revisit folds with stable Hub route topology.");
          }
        }
        if (["HC-026C", "HC-026C1", "HC-027A", "HC-027B", "HC-027C"].includes(profile.build)) {
          if (behavior.earlyRegionSpatialMemoryLandmarksEnabled !== true
            || behavior.earlyRegionSpatialMemoryLandmarksUseDestinationIdentity !== true
            || behavior.earlyRegionSpatialMemoryGuideSeamsDistinct !== true
            || behavior.earlyRegionSpatialMemoryUsesWaypointArrows !== false
            || behavior.earlyRegionSpatialMemoryUsesHudNavigation !== false
            || behavior.earlyRegionSpatialMemorySurfaceSignature !== "nursery_triad"
            || behavior.earlyRegionSpatialMemoryGuideSignature !== "scar_double_rib"
            || behavior.earlyRegionSpatialMemoryHubSignature !== "chorus_triad") {
            throw new Error("[RecipeDataSystem] HC-026C requires destination-identity anatomical memory landmarks with distinct Guide folds and no waypoint/HUD navigation dependency.");
          }
        }
        if (["HC-026C1", "HC-027A", "HC-027B", "HC-027C"].includes(profile.build)) {
          if (behavior.earlyRegionSpatialMemoryLandmarkContinuityEnabled !== true
            || behavior.earlyRegionSpatialMemoryApproachMotifRepeats !== true
            || behavior.earlyRegionSpatialMemoryApproachEchoCountPerDestination !== 3
            || behavior.earlyRegionSpatialMemoryLandmarkContinuityUsesArrows !== false
            || behavior.earlyRegionSpatialMemoryLandmarkContinuityMutatesSeams !== false) {
            throw new Error("[RecipeDataSystem] HC-026C1 requires three repeated destination-anatomy echoes through each approach while seam topology and no-arrow navigation remain locked.");
          }
        }
        if (["HC-027A", "HC-027B", "HC-027C"].includes(profile.build)) {
          if (behavior.eventAnchoredHostAudioEnabled !== true
            || behavior.eventAnchoredHostAudioOwner !== "EventAnchoredHostAudioSystem"
            || behavior.eventAnchoredHostAudioProceduralWebAudio !== true
            || behavior.eventAnchoredHostAudioSpatialized !== true
            || behavior.eventAnchoredHostAudioDistanceAttenuation !== true
            || behavior.eventAnchoredHostAudioDrivesGameplay !== false
            || behavior.eventAnchoredHostAudioDrivesProgression !== false
            || behavior.eventAnchoredHostAudioMusicLayerEnabled !== false) {
            throw new Error("[RecipeDataSystem] HC-027A requires one read-only event-anchored spatial audio owner with no gameplay/progression authority and no music layer.");
          }
        }
        if (["HC-027B", "HC-027C"].includes(profile.build)) {
          const architectures = behavior.triadicCoreEngineArchitectures ?? [];
          const functions = behavior.triadicCoreEngineFunctions ?? [];
          if (behavior.triadicCoreEngineEnabled !== true
            || behavior.triadicCoreEngineOwner !== "CoreEngineSystem"
            || behavior.triadicCoreEngineGeometryLaw !== "3_to_6_to_12"
            || JSON.stringify(architectures) !== JSON.stringify([3, 6, 12])
            || JSON.stringify(functions) !== JSON.stringify(["pulse", "absorb", "stabilize"])
            || behavior.triadicCoreEngineDefaultPhaseCount !== 3
            || behavior.triadicCoreEngineRpmTelemetryEnabled !== true
            || behavior.triadicCoreEngineRpmMin !== 3000
            || behavior.triadicCoreEngineRpmMax !== 10000
            || behavior.triadicCoreEngineRpmDrivesGameplay !== false
            || behavior.triadicCoreEngineArchitectureDrivesGameplay !== false
            || behavior.triadicCoreEnginePowerEnduranceConsequencesEnabled !== false
            || behavior.triadicCoreEngineNonTriadicGeometryEnabled !== false
            || behavior.triadicCoreEngineGeometryViolationEnabled !== false) {
            throw new Error("[RecipeDataSystem] HC-027B requires the read-only triadic 3→6→12 Core engine foundation with no power/endurance gameplay consequences yet.");
          }
        }
        if (profile.build === "HC-027C") {
          if (behavior.radialCorePerformanceEnabled !== true
            || behavior.radialCorePerformanceOwner !== "CoreRadialPerformanceSystem"
            || behavior.radialCorePerformanceSource !== "spatialCoreChemistry_topology"
            || behavior.radialCorePerformanceDeepRole !== "reserve_recovery_stability"
            || behavior.radialCorePerformanceInnerRole !== "processing_transmission_control"
            || behavior.radialCorePerformanceMembraneRole !== "response_output_consumption_instability_risk"
            || behavior.radialCorePerformanceContinuousBlend !== true
            || behavior.radialCorePerformanceEnduranceReserveEnabled !== true
            || behavior.radialCorePerformanceBoostConsequencesEnabled !== true
            || behavior.radialCorePerformanceNormalMovementChanged !== false
            || behavior.radialCorePerformanceRandomFailureEnabled !== false
            || behavior.radialCorePerformanceArchitectureMutation !== false
            || behavior.radialCorePerformanceProgressionMutation !== false) {
            throw new Error("[RecipeDataSystem] HC-027C requires continuous Deep/Inner/Membrane radial performance blending with endurance reserve and boost-only consequences, while 3→6→12 architecture and progression remain unchanged.");
          }
        }
        if (profile.status === "runtime_active_core_inspection_plus_guide_core_work_view") {
          if (behavior.coreWorkPieceManipulationEnabled !== false || behavior.coreWorkTraversalPaused !== false) {
            throw new Error("[RecipeDataSystem] HC-024B may not enable piece manipulation or suppress traversal yet.");
          }
        } else {
          if (behavior.coreWorkPieceManipulationEnabled !== true || behavior.coreWorkTraversalPaused !== false || behavior.coreWorkTraversalInputSuppressed !== true) {
            throw new Error("[RecipeDataSystem] HC-024C must enable physical piece manipulation, keep the live Host unpaused, and suppress traversal input only during Core Work.");
          }
          for (const key of ["coreWorkLeftStickManipulatesHeldPiece", "coreWorkTriggersShiftPieceDepth", "coreWorkDpadCyclesPieces"]) {
            if (behavior[key] !== true) throw new Error(`[RecipeDataSystem] HC-024C behavior ${key} must remain true.`);
          }
          if (["HC-024C1", "HC-024C2"].includes(profile.build) && behavior.coreWorkDepthReadabilityRefined !== true) {
            throw new Error("[RecipeDataSystem] HC-024C1+ must advertise the depth-readability refinement while chemistry remains disabled.");
          }
          if (profile.build === "HC-024C2" && (behavior.coreWorkRetainedAnatomyManipulation !== true || behavior.coreWorkManipulatesRecognizableRouteRetention !== true)) {
            throw new Error("[RecipeDataSystem] HC-024C2 must manipulate recognizable retained route anatomy rather than hidden binding nodes.");
          }
        }
      }
    }
  }


  validatePlaceholderVisualTriage() {
    const triage = this.data.placeholderVisualTriage;

    if (!triage || !["HC003H_PLACEHOLDER_VISUAL_TRIAGE", "HC003J_PLACEHOLDER_VISUAL_TRIAGE"].includes(triage.id)) {
      throw new Error("[RecipeDataSystem] Missing HC-003H/HC-003J placeholder visual triage data.");
    }

    if (triage.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] Placeholder visual triage must use the Host Core Rebuild blueprint as primary reference.");
    }

    const knownPlaceholderIds = new Set(this.data.placeholderReplacementRecipes.keys());
    const visualLockFirst = triage.visualLockRequiredFirst ?? [];
    const completedP0 = triage.p0VisualLockCompleted ?? [];
    const requiredP0 = [
      "debug_player_core_001",
      "debug_guide_orbiter_001",
      "debug_nutrient_seed_001"
    ];

    for (const id of requiredP0) {
      const stillRequired = visualLockFirst.some((entry) => entry.placeholderId === id && entry.priority === "P0");
      const completed = completedP0.some((entry) => entry.placeholderId === id && entry.status === "p0_locked");
      if (!stillRequired && !completed) {
        throw new Error(`[RecipeDataSystem] visual triage missing P0 placeholder ${id} as required or completed.`);
      }
    }

    for (const entry of [...visualLockFirst, ...completedP0]) {
      if (!knownPlaceholderIds.has(entry.placeholderId)) {
        throw new Error(`[RecipeDataSystem] visual triage references unknown placeholder ${entry.placeholderId}.`);
      }
      this.get("visualCompositionRecipes", entry.replacementRecipe ?? entry.recipeId);
    }

    for (const group of triage.prototypeAcceptedForNow ?? []) {
      for (const placeholderId of group.placeholderIds ?? []) {
        if (!knownPlaceholderIds.has(placeholderId)) {
          throw new Error(`[RecipeDataSystem] prototype-accepted group references unknown placeholder ${placeholderId}.`);
        }
      }
    }

    const forbiddenText = JSON.stringify(triage).toLowerCase();
    for (const marker of ["replace all 26 visuals", "new cells", "new morphs"]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] visual triage missing forbidden marker: ${marker}`);
      }
    }
  }

  validateP0VisualLockReplacements() {
    const visualLock = this.data.p0VisualLockReplacements;

    if (!visualLock || visualLock.id !== "HC003J_P0_VISUAL_LOCK_REPLACEMENTS") {
      throw new Error("[RecipeDataSystem] Missing HC-003J P0 visual lock replacement data.");
    }

    if (visualLock.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-003J visual lock must use the Host Core Rebuild blueprint as primary reference.");
    }

    const requiredP0 = new Map([
      ["debug_player_core_001", "player_seed_core_stage_01"],
      ["debug_guide_orbiter_001", "guide_orbiter_folded_lantern_v01"],
      ["debug_nutrient_seed_001", "dormant_seed_nutrient_v01"]
    ]);

    for (const [placeholderId, recipeId] of requiredP0) {
      const entry = (visualLock.lockedReplacements ?? []).find((candidate) =>
        candidate.placeholderId === placeholderId &&
        candidate.recipeId === recipeId &&
        candidate.status === "p0_locked"
      );
      if (!entry) {
        throw new Error(`[RecipeDataSystem] HC-003J visual lock missing ${placeholderId} -> ${recipeId}.`);
      }

      const placeholder = this.get("placeholderReplacementRecipes", placeholderId);
      if (placeholder.placeholder?.active !== false) {
        throw new Error(`[RecipeDataSystem] ${placeholderId} should be inactive after HC-003J visual lock.`);
      }
      if (placeholder.visualLock?.status !== "replaced_by_recipe_composition") {
        throw new Error(`[RecipeDataSystem] ${placeholderId} missing replaced_by_recipe_composition status.`);
      }

      const recipe = this.get("visualCompositionRecipes", recipeId);
      if (recipe.visualLock?.status !== "p0_locked_recipe_composition") {
        throw new Error(`[RecipeDataSystem] ${recipeId} missing p0 visual lock status.`);
      }
    }

    const forbiddenText = JSON.stringify(visualLock).toLowerCase();
    for (const marker of ["replace all visuals", "new cells", "new morphs", "old gates", "old chamber loading"]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-003J visual lock missing forbidden marker: ${marker}`);
      }
    }
  }


  validateControllerOnboardingTuning() {
    const tuning = this.data.controllerOnboardingTuning;

    if (!tuning || tuning.id !== "HC003I_CONTROLLER_ONBOARDING_TUNING") {
      throw new Error("[RecipeDataSystem] Missing HC-003I controller onboarding tuning data.");
    }

    if (tuning.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-003I controller tuning must use the Host Core Rebuild blueprint as primary reference.");
    }

    const requiredSections = ["deadZones", "responseCurves", "movement", "camera", "absorbAssist", "targeting", "pulseFeedback"];
    for (const section of requiredSections) {
      if (!tuning[section]) {
        throw new Error(`[RecipeDataSystem] HC-003I controller tuning missing section: ${section}`);
      }
    }

    const numericChecks = [
      ["deadZones.leftStick", tuning.deadZones.leftStick, 0, 0.5],
      ["deadZones.rightStick", tuning.deadZones.rightStick, 0, 0.5],
      ["movement.baseAcceleration", tuning.movement.baseAcceleration, 1, 30],
      ["camera.yawSpeed", tuning.camera.yawSpeed, 0.1, 6],
      ["camera.pitchSpeed", tuning.camera.pitchSpeed, 0.1, 6],
      ["absorbAssist.progressRateMultiplier", tuning.absorbAssist.progressRateMultiplier, 0.5, 2.5],
      ["targeting.lockDistance", tuning.targeting.lockDistance, 1, 10]
    ];

    for (const [label, value, min, max] of numericChecks) {
      if (!Number.isFinite(value) || value < min || value > max) {
        throw new Error(`[RecipeDataSystem] HC-003I controller tuning invalid ${label}: ${value}`);
      }
    }

    const forbiddenText = JSON.stringify(tuning).toLowerCase();
    for (const marker of ["new cells", "new morphs", "hard gates", "old chamber loading"]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-003I controller tuning missing forbidden marker: ${marker}`);
      }
    }
  }


  validateOpeningObjectivePromptLock() {
    const lock = this.data.openingObjectivePromptLock;

    if (!lock || lock.id !== "HC003K_OPENING_OBJECTIVE_PROMPT_LOCK") {
      throw new Error("[RecipeDataSystem] Missing HC-003K opening objective prompt lock data.");
    }

    if (lock.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-003K prompt lock must use the Host Core Rebuild blueprint as primary reference.");
    }

    for (const cellId of lock.firstPlayableMinuteRequiredChain ?? []) {
      this.get("localCellRecipes", cellId);
    }
    if (lock.beyondMinuteOptionalFork) this.get("localCellRecipes", lock.beyondMinuteOptionalFork);

    for (const promptId of lock.requiredGuidePrompts ?? []) {
      const prompt = this.get("guidePromptRecipes", promptId);
      if (!prompt.guideLine || !prompt.objectiveLine) {
        throw new Error(`[RecipeDataSystem] HC-003K prompt ${promptId} needs guideLine and objectiveLine.`);
      }
    }

    const forbiddenText = JSON.stringify(lock).toLowerCase();
    for (const marker of ["dialogue tree", "quest log", "new cells", "new morphs", "gates", "old chamber runtime"]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-003K prompt lock missing forbidden marker: ${marker}`);
      }
    }

    const layer = lock.playerFacingLayer ?? {};
    if (layer.primary !== "GuidePromptSystem" || layer.secondary !== "MorphReadabilitySystem") {
      throw new Error("[RecipeDataSystem] HC-003K prompt lock must keep Guide primary and MorphReadability secondary.");
    }
  }


  validateDebugHiddenPlaytestMode() {
    const mode = this.data.debugHiddenPlaytestMode;

    if (!mode || mode.id !== "HC003L_DEBUG_HIDDEN_PLAYTEST_MODE") {
      throw new Error("[RecipeDataSystem] Missing HC-003L debug-hidden playtest mode data.");
    }

    if (mode.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-003L debug-hidden playtest mode must use the Host Core Rebuild blueprint as primary reference.");
    }

    if (mode.defaultDebugMode !== "hidden") {
      throw new Error("[RecipeDataSystem] HC-003L debug-hidden playtest mode must default debugDisplay to hidden.");
    }

    for (const cellId of mode.firstPlayableMinuteRequiredChain ?? []) {
      this.get("localCellRecipes", cellId);
    }
    if (mode.beyondMinuteOptionalFork) this.get("localCellRecipes", mode.beyondMinuteOptionalFork);

    const visible = mode.visibleWhenDebugHidden ?? {};
    if (visible.primary !== "GuidePromptSystem" || visible.secondary !== "PlaytestHudSystem") {
      throw new Error("[RecipeDataSystem] HC-003L visibleWhenDebugHidden must keep Guide primary and PlaytestHud secondary.");
    }

    const controlText = JSON.stringify(mode.minimalControls ?? []).toLowerCase();
    for (const marker of ["absorb", "pulse", "debug"]) {
      if (!controlText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-003L minimal controls missing marker: ${marker}`);
      }
    }

    const forbiddenText = JSON.stringify(mode).toLowerCase();
    for (const marker of ["new cells", "new morphs", "gates", "old chamber runtime", "dialogue trees", "quest logs"]) {
      if (!forbiddenText.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-003L debug-hidden mode missing forbidden marker: ${marker}`);
      }
    }
  }


  validateFirstMinuteVisualReadabilityPolish() {
    const polish = this.data.firstMinuteVisualReadabilityPolish;

    if (!polish || polish.id !== "HC003M_FIRST_MINUTE_VISUAL_READABILITY_POLISH") {
      throw new Error("[RecipeDataSystem] Missing HC-003M first-minute visual readability polish data.");
    }

    if (polish.primaryReference !== "HOST_CORE_Blueprint_v1_reference_docs.zip") {
      throw new Error("[RecipeDataSystem] HC-003M visual polish must use the Host Core Rebuild blueprint as primary reference.");
    }

    for (const cellId of polish.requiredChain ?? []) {
      this.get("localCellRecipes", cellId);
    }

    if (polish.optionalBeyondMinuteFork) {
      this.get("localCellRecipes", polish.optionalBeyondMinuteFork);
    }

    const requiredTargets = [
      "player_seed_core_stage_01",
      "dormant_seed_nutrient_v01",
      "scar_contamination_plate_v01",
      "seed_signal_bridge_v01",
      "guide_orbiter_folded_lantern_v01"
    ];

    const targetIds = new Set((polish.visualTargets ?? []).map((target) => target.id));
    for (const id of requiredTargets) {
      if (!targetIds.has(id)) {
        throw new Error(`[RecipeDataSystem] HC-003M visual polish missing target: ${id}`);
      }
      this.get("visualCompositionRecipes", id);
    }

    const forbidden = (polish.forbiddenScope ?? []).join(" ").toLowerCase();
    for (const marker of ["new cells", "new morphs", "old gates", "old chamber loading"]) {
      if (!forbidden.includes(marker)) {
        throw new Error(`[RecipeDataSystem] HC-003M visual polish forbidden scope missing marker: ${marker}`);
      }
    }
  }

  validateSchemaReferences() {
    const report = {
      status: "ok",
      missingDomains: [],
      missingBonds: [],
      missingVisualRecipes: [],
      missingPlaceholderRecipes: [],
      warnings: []
    };

    const knownDomains = new Set(this.data.chemicalDomains.keys());
    const knownBonds = new Set(this.data.bondRecipes.keys());
    const knownVisuals = new Set(this.data.visualCompositionRecipes.keys());
    const knownPlaceholders = new Set(this.data.placeholderReplacementRecipes.keys());

    const recordMissing = (bucket, message) => {
      report[bucket].push(message);
      report.warnings.push(message);
    };

    for (const cell of this.data.localCellRecipes.values()) {
      for (const key of Object.keys(cell.chemistryField ?? {})) {
        if (!knownDomains.has(key)) {
          recordMissing("missingDomains", `Local cell ${cell.id} uses unknown domain ${key}`);
        }
      }

      for (const recipeId of Object.values(cell.visuals ?? {})) {
        if (recipeId && !knownVisuals.has(recipeId)) {
          recordMissing("missingVisualRecipes", `Local cell ${cell.id} references unknown visual ${recipeId}`);
        }
      }
    }

    for (const objectRecipe of this.data.chemObjectRecipes.values()) {
      for (const domain of objectRecipe.chemistry?.domains ?? []) {
        if (!knownDomains.has(domain)) {
          recordMissing("missingDomains", `Chem object ${objectRecipe.id} uses unknown domain ${domain}`);
        }
      }

      for (const bondId of objectRecipe.chemistry?.bondTypes ?? []) {
        if (!knownBonds.has(bondId)) {
          recordMissing("missingBonds", `Chem object ${objectRecipe.id} references unknown bond ${bondId}`);
        }
      }

      const visualRecipe = objectRecipe.visual?.visualRecipe;
      if (visualRecipe && !knownVisuals.has(visualRecipe)) {
        recordMissing("missingVisualRecipes", `Chem object ${objectRecipe.id} references unknown visual ${visualRecipe}`);
      }

      const placeholderRecipe = objectRecipe.visual?.placeholderRecipe;
      if (placeholderRecipe && !knownPlaceholders.has(placeholderRecipe)) {
        recordMissing("missingPlaceholderRecipes", `Chem object ${objectRecipe.id} references unknown placeholder ${placeholderRecipe}`);
      }
    }

    for (const entityRecipe of this.data.entityRecipes.values()) {
      for (const domain of entityRecipe.chemistry?.domains ?? []) {
        if (!knownDomains.has(domain)) {
          recordMissing("missingDomains", `Entity ${entityRecipe.id} uses unknown domain ${domain}`);
        }
      }
    }

    for (const orbiterRecipe of this.data.orbiterRecipes.values()) {
      for (const domain of orbiterRecipe.chemistry?.domains ?? []) {
        if (!knownDomains.has(domain)) {
          recordMissing("missingDomains", `Orbiter ${orbiterRecipe.id} uses unknown domain ${domain}`);
        }
      }
    }

    for (const rule of this.data.targetFocusRules.values()) {
      if (!this.data.localCellRecipes.has(rule.cellId)) {
        report.warnings.push(`Target focus rule ${rule.id} references unknown cell ${rule.cellId}`);
      }
      for (const objectId of Object.keys(rule.preferredObjects ?? {})) {
        if (!this.data.chemObjectRecipes.has(objectId)) {
          report.warnings.push(`Target focus rule ${rule.id} prefers unknown object ${objectId}`);
        }
      }
      for (const objectId of Object.keys(rule.targetKinds ?? {})) {
        if (!this.data.chemObjectRecipes.has(objectId)) {
          report.warnings.push(`Target focus rule ${rule.id} maps unknown target kind object ${objectId}`);
        }
      }
      for (const provider of rule.providers ?? []) {
        if (provider.targetId && !this.data.chemObjectRecipes.has(provider.targetId)) {
          report.warnings.push(`Target focus rule ${rule.id} provider ${provider.label ?? "unnamed"} targets unknown object ${provider.targetId}`);
        }
      }
    }

    for (const prompt of this.data.guidePromptRecipes.values()) {
      for (const cellId of prompt.cellIds ?? []) {
        if (cellId !== "*" && !this.data.localCellRecipes.has(cellId)) {
          report.warnings.push(`Guide prompt ${prompt.id} references unknown cell ${cellId}`);
        }
      }

      const targetIds = prompt.conditions?.targetIds ?? [];
      for (const targetId of targetIds) {
        if (targetId !== "none" && !this.data.chemObjectRecipes.has(targetId)) {
          report.warnings.push(`Guide prompt ${prompt.id} targets unknown object ${targetId}`);
        }
      }

      const focusIds = prompt.conditions?.currentFocusIds ?? [];
      for (const focusId of focusIds) {
        if (focusId !== "none" && !this.data.chemObjectRecipes.has(focusId)) {
          report.warnings.push(`Guide prompt ${prompt.id} focuses unknown object ${focusId}`);
        }
      }

      if (!prompt.guideLine || !prompt.objectiveLine) {
        report.warnings.push(`Guide prompt ${prompt.id} needs guideLine and objectiveLine`);
      }
    }

    const tuning = this.data.openingFlowTuning;
    if (!tuning?.id) {
      report.warnings.push("Opening flow tuning data missing id");
    } else {
      for (const cellId of tuning.requiredFirstMinuteCells ?? []) {
        if (!this.data.localCellRecipes.has(cellId)) {
          report.warnings.push(`Opening flow tuning references unknown required cell ${cellId}`);
        }
      }
      for (const cellId of tuning.beyondMinuteCells ?? []) {
        if (!this.data.localCellRecipes.has(cellId)) {
          report.warnings.push(`Opening flow tuning references unknown beyond-minute cell ${cellId}`);
        }
      }
      const seedId = tuning.safeSeedTuning?.objectId;
      if (seedId && !this.data.chemObjectRecipes.has(seedId)) {
        report.warnings.push(`Opening flow tuning references unknown safe seed ${seedId}`);
      }
    }

    const cinematic = this.data.cinematicAwakeningBeat;
    if (!cinematic?.id) {
      report.warnings.push("Cinematic awakening beat data missing id");
    } else {
      if (!cinematic.beatDurations?.cameraSettleSeconds) {
        report.warnings.push("Cinematic awakening beat missing cameraSettleSeconds");
      }
      for (const beatId of ["camera_settle", "host_pulse_seed_cue", "first_fold_emphasis"]) {
        if (!cinematic.cameraBeats?.[beatId]) {
          report.warnings.push(`Cinematic awakening beat missing camera beat ${beatId}`);
        }
      }
      if (cinematic.forbiddenScope?.includes("cutscene lockout")) {
        // explicit scope marker for audit readability
      }
    }

    if (report.warnings.length > 0) {
      report.status = "warnings";
      throw new Error(`[RecipeDataSystem] Schema validation failed: ${report.warnings.join(" | ")}`);
    }

    return report;
  }
}
