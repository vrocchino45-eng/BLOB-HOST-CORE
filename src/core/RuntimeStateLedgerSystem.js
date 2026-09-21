/**
 * HC-016B / R1 runtime ownership ledger.
 *
 * This system does not create progression. It makes ownership explicit so legacy
 * compatibility systems cannot silently become authoritative again.
 */
export class RuntimeStateLedgerSystem {
  constructor({ frameState }) {
    if (!frameState) throw new Error("[RuntimeStateLedgerSystem] frameState is required.");
    this.frameState = frameState;
    this.lastCellId = frameState.activeCellId ?? "none";
    this.cellChangeCount = 0;
  }

  init() {
    this.publish(this.frameState);
  }

  update(_dt, frameState) {
    if ((frameState.activeCellId ?? "none") !== this.lastCellId) {
      this.lastCellId = frameState.activeCellId ?? "none";
      this.cellChangeCount += 1;
    }
    this.publish(frameState);
  }

  publish(frameState) {
    const localMorph = frameState.localCellMorph ?? {};
    const secondMorph = frameState.secondLocalCellMorph ?? {};
    const boundaryMorph = frameState.localCellBoundaryMorph ?? {};
    const activeMorph = this.activeMorph(localMorph, secondMorph, boundaryMorph);
    const activeCellId = frameState.activeCellId ?? "none";

    const transitionAuthority = activeMorph
      ? {
          mode: "morph_owned",
          owner: activeMorph.owner,
          boundary: activeMorph.boundary,
          canLegacyGateMutateActiveCell: false,
          reason: "continuous_local_cell_morph_is_authoritative"
        }
      : {
          mode: "steady_local_cell",
          owner: "activeCellId/local-cell runtime",
          boundary: "none",
          canLegacyGateMutateActiveCell: true,
          reason: "legacy_gate_adapter_temporarily_allowed_only_for_unmigrated_boundaries"
        };

    const bond = frameState.bondState ?? frameState.bond ?? {};
    const chem = frameState.chemObjectState ?? {};
    const growth = frameState.coreGrowth ?? {};
    const embodiment = frameState.coreEmbodiment ?? {};

    frameState.runtimeStateLedger = {
      pass: "HC-016B",
      strategy: "R1_RUNTIME_OWNERSHIP",
      authoritative: true,
      host: {
        hostId: "wounded_nursery_host",
        hostCondition: "unstable_reseeding_event",
        sourceAuthority: "BLOB_HOST_CORE_REBUILD_BLUEPRINT_v0_1",
        macroCauseRequired: true
      },
      localCell: {
        activeCellId,
        owner: "local_cell_runtime",
        cellChangeCount: this.cellChangeCount,
        transitionAuthority
      },
      chemistry: {
        owner: "ChemObjectSystem + BondSystem + recipe registries",
        currentTargetId: frameState.currentChemTarget ?? chem.nearestObject ?? "none",
        pulseResponse: chem.pulseResponse ?? "none",
        activeBondId: bond.activeBondId ?? bond.bondId ?? "none",
        authoritativeForMaterialInteraction: true
      },
      playerComposition: {
        owner: "CoreEmbodimentSystem + CoreGrowthSystem",
        displayStage: growth.displayStage ?? growth.stage ?? "unknown",
        composition: embodiment.composition ?? growth.composition ?? null,
        migrationStatus: "R4_not_yet_authoritative_for_all_gameplay"
      },
      presentation: {
        owner: "camera + Guide + HUD",
        mayMutateGameplayTruth: false,
        guideOwner: frameState.guidePrompt?.contentOwner ?? "none",
        hudActive: Boolean(frameState.playtestHud?.active ?? true)
      },
      compatibility: {
        gateSystem: "retired_HC016K_read_model_owned_by_LocalCellBoundaryMorphSystem",
        objectiveSystem: "derived_observer_pending_R1_demotion",
        regionRegistry: "compatibility_metadata",
        hardRegionTransitionsAllowedByBlueprint: false,
        gateMutationAuthority: false,
        gateSystemRegistered: false
      }
    };
  }

  activeMorph(localMorph, secondMorph, boundaryMorph) {
    if (localMorph.phase === "morphing_continuous_control" && !localMorph.completed) {
      return { owner: "LocalCellMorphSystem", boundary: "surface_to_guide" };
    }
    if (secondMorph.phase === "morphing_into_signal_chorus" && !secondMorph.completed) {
      return { owner: "SecondLocalCellMorphSystem", boundary: "guide_to_hub" };
    }
    if (boundaryMorph.active) {
      return {
        owner: "LocalCellBoundaryMorphSystem",
        boundary: boundaryMorph.activeBoundary ?? "recipe_driven_boundary"
      };
    }
    return null;
  }

}
