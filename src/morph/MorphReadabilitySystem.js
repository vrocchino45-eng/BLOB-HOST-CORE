import * as THREE from "three";
import { selectCurrentMorphState } from "./MorphStateSelector.js";

export class MorphReadabilitySystem {
  constructor({ scene, playerRoot, frameState }) {
    if (!scene) throw new Error("[MorphReadabilitySystem] scene is required.");
    if (!playerRoot) throw new Error("[MorphReadabilitySystem] playerRoot is required.");

    this.scene = scene;
    this.playerRoot = playerRoot;
    this.frameState = frameState;
    this.panel = null;
    this.progressBar = null;
    this.titleLine = null;
    this.statusLine = null;
    this.stepLine = null;
    this.ring = null;
    this.innerRing = null;
  }

  init() {
    this.createPanel();
    this.createWorldCue();
  }

  update(_dt, frameState) {
    const morph = selectCurrentMorphState(frameState);
    frameState.currentMorphState = morph;

    this.updatePanel(morph, frameState);
    this.publishDebugState(morph, frameState);
    this.updateWorldCue(morph, frameState);
  }

  onRuntimeUnmount(frameState) {
    if (this.panel) this.panel.style.display = "none";
    if (this.ring) this.ring.visible = false;
    if (this.innerRing) this.innerRing.visible = false;

    frameState.morphReadabilityDebug = {
      pass: "HC-009G",
      visible: false,
      title: "HOST TISSUE SHIFT — released",
      status: frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001"
        ? "Hub Chamber owns the current presentation."
        : "No active tissue transition.",
      step: frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001"
        ? "Read the Hub territories in the world."
        : "none",
      progress: 0,
      planId: "none",
      phase: "runtime_mount_released",
      staleTransitionLanguageSuppressed: true,
      decorativeTransitionRingsHidden: true
    };
  }

  publishDebugState(morph, frameState) {
    frameState.morphReadabilityDebug = {
      pass: "HC-006KD",
      visible: this.panel?.style.display !== "none",
      title: this.titleLine?.textContent ?? "HOST TISSUE SHIFT — no gate",
      status: this.statusLine?.textContent ?? "none",
      step: this.stepLine?.textContent ?? morph.nextAction ?? "none",
      progress: this.clamp01(morph.progress ?? 0),
      planId: morph.planId ?? "none",
      phase: morph.phase ?? "none"
    };
  }

  createPanel() {
    const panel = document.createElement("div");
    panel.id = "morph-readability-panel";

    Object.assign(panel.style, {
      position: "fixed",
      left: "50%",
      bottom: "18px",
      transform: "translateX(-50%)",
      minWidth: "360px",
      maxWidth: "520px",
      padding: "10px 12px",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: "12px",
      lineHeight: "1.35",
      color: "#ffe7c6",
      background: "rgba(8, 5, 8, 0.70)",
      border: "1px solid rgba(255, 196, 130, 0.34)",
      borderRadius: "12px",
      pointerEvents: "none",
      zIndex: "18",
      boxShadow: "0 0 24px rgba(255, 160, 88, 0.12)"
    });

    const title = document.createElement("div");
    title.textContent = "HOST TISSUE SHIFT — no gate";
    Object.assign(title.style, {
      letterSpacing: "0.08em",
      opacity: "0.82",
      marginBottom: "6px"
    });

    const status = document.createElement("div");
    status.textContent = "waiting";
    Object.assign(status.style, {
      marginBottom: "6px",
      color: "#fff3d7"
    });

    const track = document.createElement("div");
    Object.assign(track.style, {
      width: "100%",
      height: "7px",
      background: "rgba(255,255,255,0.09)",
      borderRadius: "999px",
      overflow: "hidden",
      marginBottom: "6px"
    });

    const bar = document.createElement("div");
    Object.assign(bar.style, {
      height: "100%",
      width: "0%",
      background: "linear-gradient(90deg, rgba(255,197,116,0.78), rgba(255,101,124,0.88))",
      borderRadius: "999px"
    });
    track.appendChild(bar);

    const step = document.createElement("div");
    step.textContent = "absorb seed → approach scar/signal → pulse";
    Object.assign(step.style, {
      opacity: "0.82"
    });

    panel.appendChild(title);
    panel.appendChild(status);
    panel.appendChild(track);
    panel.appendChild(step);
    document.body.appendChild(panel);

    this.panel = panel;
    this.titleLine = title;
    this.progressBar = bar;
    this.statusLine = status;
    this.stepLine = step;
  }

  createWorldCue() {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffc076,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.012, 8, 120), material);
    ring.name = "morph_readiness_world_cue_ring";
    ring.rotation.x = Math.PI / 2;
    ring.visible = false;
    this.scene.add(ring);
    this.ring = ring;

    const innerMaterial = material.clone();
    innerMaterial.color.set(0xff6f86);
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.008, 8, 96), innerMaterial);
    innerRing.name = "morph_progress_inner_cue_ring";
    innerRing.rotation.x = Math.PI / 2;
    innerRing.visible = false;
    this.scene.add(innerRing);
    this.innerRing = innerRing;
  }

  updatePanel(morph, frameState) {
    if (!this.panel || !this.progressBar || !this.statusLine || !this.stepLine) return;

    const progress = this.clamp01(morph.progress ?? 0);
    const readiness = this.clamp01(morph.triggerConfidence ?? 0);
    const isVisible = morph.phase !== "not_initialized";

    this.panel.style.display = isVisible ? "block" : "none";
    this.applyPromptStackMode(frameState, morph);
    this.progressBar.style.width = `${Math.round(progress * 100)}%`;

    // HC-006KD: once HubMode owns the readable junction, the lower tissue panel must
    // follow Hub presentation ownership instead of replaying the retained Signal Chorus
    // return-state language. The retained return state remains durable history only.
    const hubFoundation = frameState.hubChamberFoundation ?? {};
    const hubModeActive = frameState.currentMode?.id === "hub_mode" || frameState.currentMode?.modeId === "hub_mode";
    const hubPresentationActive = Boolean(
      hubFoundation.active && (hubFoundation.presentationOwnershipLocked || hubModeActive)
    );
    if (hubPresentationActive) {
      const graveGate = frameState.firstSliceGates?.hub_to_grave_memory_route ?? frameState.gateState ?? {};
      const routeCrossable = Boolean(graveGate.crossable || hubFoundation.activeRouteCrossable);
      const routeReadable = Boolean(graveGate.readable || routeCrossable || hubFoundation.activeRouteReadable);
      const routeContractsAwake = hubFoundation.routeContractsAwake === true;
      this.titleLine.textContent = "HOST HUB READING — junction";
      this.progressBar.style.background = "linear-gradient(90deg, rgba(173,219,230,0.90), rgba(255,217,160,0.94))";
      this.progressBar.style.width = `${Math.round(this.clamp01(hubFoundation.progress ?? 1) * 100)}%`;
      this.statusLine.textContent = routeCrossable
        ? "Hub junction: Grave Memory is crossable."
        : routeReadable
          ? "Hub junction: Grave Memory is readable; complete the core self-reading before crossing."
          : "Hub junction: three route identities are separating.";
      this.stepLine.textContent = routeCrossable
        ? routeContractsAwake
          ? "Grave Memory remains crossable. Vascular Rhythm is open; Silt Pressure is awake but still forming."
          : "Move toward Grave Memory to cross. Vascular Rhythm and Silt Pressure remain dormant."
        : (hubFoundation.nextAction ?? "Hold the junction in view while the three route identities separate.");
      this.panel.style.borderColor = routeCrossable
        ? "rgba(255, 217, 160, 0.94)"
        : "rgba(173, 219, 230, 0.82)";
      return;
    }

    const signalReturnState = frameState.signalChorusReturnState ?? {};
    if (signalReturnState.active) {
      this.progressBar.style.background = "linear-gradient(90deg, rgba(189,239,255,0.88), rgba(255,240,184,0.92))";
      this.progressBar.style.width = "100%";
      this.statusLine.textContent = "Signal Chorus: returned Grave reading held.";
      this.stepLine.textContent = signalReturnState.nextAction ?? "The stable return state is waiting for the next route-pressure plan.";
      this.panel.style.borderColor = "rgba(255, 240, 184, 0.94)";
      return;
    }

    const graveReturn = frameState.graveReturnContinuity ?? {};
    if (graveReturn.active) {
      const returnProgress = this.clamp01(graveReturn.progress ?? 0);
      this.progressBar.style.background = "linear-gradient(90deg, rgba(189,239,255,0.88), rgba(255,240,184,0.92))";
      this.progressBar.style.width = `${Math.round(returnProgress * 100)}%`;
      this.statusLine.textContent = graveReturn.completed
        ? "Signal Chorus: Grave reading returned."
        : graveReturn.started
          ? `Return current: ${Math.round(returnProgress * 100)}% through the tissue fold.`
          : "Grave return current: readable by movement.";
      this.stepLine.textContent = graveReturn.nextAction ?? "Move into the pale current and follow it with normal movement.";
      this.panel.style.borderColor = graveReturn.completed
        ? "rgba(255, 240, 184, 0.94)"
        : "rgba(189, 239, 255, 0.90)";
      return;
    }

    // HC-004QG: the lower tissue panel must follow the live Grave-bed owner,
    // not the oldest completed morph in MorphStateSelector.
    if (frameState.activeCellId === "CELL_GRAVE_MEMORY_RESIDUE_BED_001") {
      const routeLock = frameState.graveRouteLock ?? {};
      const postSeam = frameState.graveBedPostSeamResponse ?? {};
      const microExit = frameState.graveSeamContinuityMicroExit ?? {};
      const graveLoop = frameState.graveReadBeforeAbsorb ?? {};
      const graveStability = frameState.graveLoopStability ?? {};

      this.progressBar.style.background = "linear-gradient(90deg, rgba(222,185,151,0.84), rgba(255,220,176,0.90))";

      if (routeLock.active) {
        this.progressBar.style.width = "100%";
        this.statusLine.textContent = "Grave memory route: complete and locked.";
        this.stepLine.textContent = routeLock.nextAction ?? "The memory loop is complete. No exit opens from this bed.";
        this.panel.style.borderColor = "rgba(205, 255, 218, 0.92)";
        return;
      }

      if (postSeam.active) {
        const postProgress = postSeam.completed ? 1 : this.clamp01(postSeam.progress ?? 0);
        this.progressBar.style.width = `${Math.round(postProgress * 100)}%`;
        this.statusLine.textContent = postSeam.completed
          ? "Grave bed: post-seam response settled."
          : `Grave bed response: ${this.formatGraveStage(postSeam.stage)}.`;
        this.stepLine.textContent = postSeam.nextAction ?? "Pulse-read the husk, scar lock, then inheritance seed remnant. Do not absorb.";
        this.panel.style.borderColor = postSeam.completed
          ? "rgba(255, 226, 184, 0.90)"
          : "rgba(255, 218, 176, 0.82)";
        return;
      }

      if (microExit.completed) {
        this.progressBar.style.width = "100%";
        this.statusLine.textContent = "Returned to the Grave bed with the seam reading.";
        this.stepLine.textContent = "Let the Grave bed restore its protected remains; then read the old husk first.";
        this.panel.style.borderColor = "rgba(255, 226, 184, 0.82)";
        return;
      }

      if (graveStability.active || graveLoop.active) {
        const postTransferStability = Boolean(graveStability.active && graveLoop.safeMemoryTransferComplete);
        const graveProgress = this.clamp01(graveLoop.progress ?? 0);
        this.progressBar.style.width = `${Math.round(graveProgress * 100)}%`;
        this.statusLine.textContent = postTransferStability
          ? "Grave bed: settling after the safe memory transfer."
          : "Grave bed: read before absorb.";
        this.stepLine.textContent = postTransferStability
          ? (graveStability.nextAction ?? "Let the Grave settle; do not force the remains.")
          : (graveLoop.nextAction ?? "Read the remains before receiving the settled silt trace.");
        this.panel.style.borderColor = "rgba(216, 177, 162, 0.72)";
        return;
      }
    }

    // HC-004QD: active-cell ownership wins over stale earlier morph state.
    // This prevents Nursery-era status text from surviving inside Bloom Residue.
    if (frameState.activeCellId === "CELL_BLOOM_RESIDUE_FORK_001") {
      const bloomLoop = frameState.bloomResidueInteraction ?? {};
      const graveMorph = frameState.graveRouteMorph ?? {};
      if (bloomLoop.active) {
        const bloomStable = this.isBloomEffectivelyStable(bloomLoop);
        const loopProgress = bloomStable ? 1 : this.clamp01(bloomLoop.progress ?? 0);
        this.progressBar.style.background = "linear-gradient(90deg, rgba(255,183,116,0.82), rgba(217,163,255,0.88))";
        this.progressBar.style.width = `${Math.round(loopProgress * 100)}%`;
        this.statusLine.textContent = bloomStable
          ? "Bloom Residue Fork: stable — deeper tissue can answer."
          : `Bloom Residue Fork: ${this.formatBloomStage(bloomLoop.stage)}.`;
        this.stepLine.textContent = bloomStable
          ? (graveMorph.nextAction ?? "Release pulse, then pulse the stable residue once more.")
          : (bloomLoop.nextAction ?? "Read memory, open growth carefully, warm the braid, respect warning.");
        this.panel.style.borderColor = bloomStable
          ? "rgba(255, 216, 168, 0.86)"
          : "rgba(255, 190, 128, 0.70)";
        return;
      }
    }

    if (morph.planId === "MORPH_SIGNAL_CHORUS_TO_BLOOM_RESIDUE_FORK_001") {
      this.progressBar.style.background = "linear-gradient(90deg, rgba(255,183,116,0.82), rgba(217,163,255,0.88))";
      if (morph.completed) {
        const bloomLoop = frameState.bloomResidueInteraction ?? {};
        const bloomArrival = frameState.bloomResidueArrival ?? {};
        if (bloomLoop.active) {
          const bloomStable = this.isBloomEffectivelyStable(bloomLoop);
          const loopProgress = bloomStable ? 1 : this.clamp01(bloomLoop.progress ?? 0);
          this.progressBar.style.width = `${Math.round(loopProgress * 100)}%`;
          this.statusLine.textContent = bloomStable
            ? "Bloom Residue Fork: stable / complete — four-cell lock candidate."
            : `Bloom Residue Fork: ${this.formatBloomStage(bloomLoop.stage)}.`;
          this.stepLine.textContent = bloomStable
            ? "First playable minute is locked separately; Bloom remains the optional beyond-minute fork."
            : bloomLoop.nextAction ?? "Read memory, open growth carefully, warm the braid, respect warning.";
          this.panel.style.borderColor = bloomStable
            ? "rgba(255, 216, 168, 0.86)"
            : "rgba(255, 190, 128, 0.70)";
          return;
        }
        const arrivalProgress = this.clamp01(((bloomArrival.arrivalClarity ?? 0) + (bloomArrival.forkTrust ?? 0)) / 2);
        this.progressBar.style.width = `${Math.round(arrivalProgress * 100)}%`;
        this.statusLine.textContent = bloomArrival.readyForBloomLoop
          ? "The Bloom Residue Fork is ready to be read."
          : "You are inside the Bloom Residue Fork.";
        this.stepLine.textContent = bloomArrival.nextAction ?? "Read both living paths before choosing what to nourish or metabolize.";
        this.panel.style.borderColor = "rgba(255, 190, 128, 0.78)";
        return;
      }
      if (progress > 0) {
        this.statusLine.textContent = `The signal chorus is becoming a bloom-residue fork… ${Math.round(progress * 100)}%`;
        this.stepLine.textContent = "Keep moving. Growth and memory are separating into living paths. No gate.";
        this.panel.style.borderColor = "rgba(255, 183, 116, 0.62)";
        return;
      }
      if (morph.triggerReady) {
        this.statusLine.textContent = "The chorus has tuned. A fork is forming inside the host tissue.";
        this.stepLine.textContent = "Pulse the warmed seed-signal bridge and let choice become matter.";
        this.panel.style.borderColor = "rgba(255, 216, 138, 0.72)";
        return;
      }
      this.statusLine.textContent = "The chorus hears you, but the bridge is still learning your rhythm.";
      this.stepLine.textContent = morph.nextAction ?? "Tune the signal chorus before the fork can form.";
      this.panel.style.borderColor = "rgba(255, 183, 116, 0.34)";
      return;
    }

    if (morph.planId === "MORPH_SCAR_FLOW_TO_SIGNAL_CHORUS_001") {
      this.progressBar.style.background = "linear-gradient(90deg, rgba(174,239,255,0.78), rgba(255,226,168,0.88))";
      if (morph.completed) {
        const signalArrival = frameState.signalChorusArrival ?? {};
        const signalLoop = frameState.signalChorusInteraction ?? {};
        if (signalLoop.active) {
          const loopProgress = this.clamp01(signalLoop.progress ?? 0);
          this.progressBar.style.width = `${Math.round(loopProgress * 100)}%`;
          this.statusLine.textContent = signalLoop.preparedForNextBranch
            ? "The signal chorus is tuned enough to branch."
            : `Signal Chorus tuning: ${this.formatSignalStage(signalLoop.stage)}.`;
          this.stepLine.textContent = signalLoop.nextAction ?? "Pulse the active chorus focus, then wait for the bridge.";
          this.panel.style.borderColor = signalLoop.preparedForNextBranch
            ? "rgba(255, 226, 168, 0.82)"
            : "rgba(174, 239, 255, 0.68)";
          return;
        }
        const arrivalProgress = this.clamp01(
          ((signalArrival.arrivalClarity ?? 0) +
            (signalArrival.listeningTrust ?? 0) +
            (signalArrival.chorusResponse ?? 0)) / 3
        );
        this.progressBar.style.width = `${Math.round(arrivalProgress * 100)}%`;
        this.statusLine.textContent = signalArrival.readyForSignalLoop
          ? "The signal chorus nerve is listening clearly."
          : "You are inside the signal chorus nerve.";
        this.stepLine.textContent = signalArrival.nextAction ?? "Listen first. Pulse the chorus nodes before forcing absorption.";
        this.panel.style.borderColor = signalArrival.readyForSignalLoop
          ? "rgba(174, 239, 255, 0.78)"
          : "rgba(174, 239, 255, 0.58)";
        return;
      }
      if (progress > 0) {
        this.statusLine.textContent = `The scar-flow is becoming signal… ${Math.round(progress * 100)}%`;
        this.stepLine.textContent = "Keep moving. Match the answering waves. No door, no teleport.";
        this.panel.style.borderColor = "rgba(174, 239, 255, 0.58)";
        return;
      }
      if (morph.triggerReady) {
        this.statusLine.textContent = "A buried choir nerve is answering.";
        this.stepLine.textContent = "Pulse the answering signal focus once; let the chorus hand you forward.";
        this.panel.style.borderColor = "rgba(174, 239, 255, 0.62)";
        return;
      }
      this.statusLine.textContent = "The scar-flow is not ready to sing yet.";
      this.stepLine.textContent = morph.nextAction ?? "Stabilize scar-flow first.";
      this.panel.style.borderColor = "rgba(174, 239, 255, 0.34)";
      return;
    }

    this.progressBar.style.background = "linear-gradient(90deg, rgba(255,197,116,0.78), rgba(255,101,124,0.88))";

    if (morph.completed) {
      const arrival = frameState.scarFlowArrival ?? {};
      const interaction = frameState.scarFlowInteraction ?? {};
      const interactionProgress = this.clamp01(interaction.progress ?? 0);
      this.progressBar.style.width = `${Math.round(interaction.active ? interactionProgress * 100 : 100)}%`;
      this.statusLine.textContent = interaction.active
        ? interaction.preparedForNextBranch
          ? "The scar-flow fold is stable enough to branch."
          : `Scar-flow stabilization: ${this.formatStage(interaction.stage)}.`
        : arrival.active
          ? "You are inside the scar-flow fold now."
          : "Scar-flow fold has opened inside the nursery.";
      this.stepLine.textContent = interaction.active
        ? interaction.nextAction ?? this.worldCompletionInstruction(frameState)
        : arrival.active
          ? arrival.nextAction ?? this.worldCompletionInstruction(frameState)
          : this.worldCompletionInstruction(frameState);
      this.panel.style.borderColor = interaction.preparedForNextBranch
        ? "rgba(255, 210, 126, 0.72)"
        : "rgba(255, 108, 132, 0.55)";
      return;
    }

    if (progress > 0) {
      this.statusLine.textContent = `The membrane is folding through scar pressure… ${Math.round(progress * 100)}%`;
      this.stepLine.textContent = "Keep moving. Stay with the pressure. No door, no teleport.";
      this.panel.style.borderColor = "rgba(255, 122, 138, 0.50)";
      return;
    }

    if (morph.triggerReady) {
      this.statusLine.textContent = "Scar pressure is listening.";
      this.stepLine.textContent = "Pulse the scar plate or signal thread to let the cell fold.";
      this.panel.style.borderColor = "rgba(255, 196, 110, 0.62)";
      return;
    }

    this.statusLine.textContent = this.worldWaitingStatus(morph);
    this.stepLine.textContent = this.worldWaitingStep(morph);
    this.panel.style.borderColor = "rgba(255, 196, 130, 0.34)";
  }


  applyPromptStackMode(frameState, morph) {
    if (!this.panel || !this.titleLine || !this.stepLine) return;

    const guide = frameState.guidePrompt ?? {};
    const debugMode = frameState.debugDisplay?.mode ?? "compact";
    const guidePrimary = Boolean(guide.active) && debugMode !== "full";
    const firstMinuteComplete = this.isFirstMinuteComplete(frameState);
    const optionalForkStatus = this.optionalForkStatus(frameState);

    frameState.promptStack = {
      pass: "HC-003K",
      guidePrimary,
      morphPanelMode: guidePrimary ? "secondary_tissue_status" : "full_tissue_instruction",
      hostTissueInstructionSuppressed: guidePrimary,
      firstMinuteLockStatus: firstMinuteComplete ? "lock_candidate_complete" : "in_progress",
      optionalForkStatus,
      activeGuidePromptId: guide.id ?? "none",
      currentMorphPlan: morph.planId ?? "none"
    };

    if (guidePrimary) {
      const debugHidden = debugMode === "hidden";
      this.titleLine.textContent = "TISSUE SHIFT — no gate";
      Object.assign(this.panel.style, {
        bottom: debugHidden ? "12px" : "14px",
        minWidth: debugHidden ? "250px" : "280px",
        maxWidth: debugHidden ? "360px" : "400px",
        padding: debugHidden ? "5px 8px" : "6px 9px",
        fontSize: "10px",
        opacity: debugHidden ? "0.54" : "0.58",
        background: "rgba(8, 5, 8, 0.42)",
        borderRadius: "9px"
      });
      this.stepLine.style.display = "none";
      return;
    }

    this.titleLine.textContent = "HOST TISSUE SHIFT — no gate";
    Object.assign(this.panel.style, {
      bottom: "18px",
      minWidth: "360px",
      maxWidth: "520px",
      padding: "10px 12px",
      fontSize: "12px",
      opacity: "1",
      background: "rgba(8, 5, 8, 0.70)",
      borderRadius: "12px"
    });
    this.stepLine.style.display = "block";
  }

  isFirstMinuteComplete(frameState) {
    return Boolean(frameState.firstSliceCohesion?.sliceLockReady);
  }

  optionalForkStatus(frameState) {
    const bloomLoop = frameState.bloomResidueInteraction ?? {};
    if (frameState.activeCellId !== "CELL_BLOOM_RESIDUE_FORK_001") return "not_reached";
    if (this.isBloomEffectivelyStable(bloomLoop)) return "optional_beyond_minute_stable_complete";
    return "optional_beyond_minute_active";
  }

  isBloomEffectivelyStable(bloomLoop) {
    return Boolean(
      bloomLoop?.preparedForNextBranch ||
      (bloomLoop?.stage === "fork_stable" && (bloomLoop?.progress ?? 0) >= 0.95)
    );
  }

  worldWaitingStatus(morph) {
    const reason = morph.triggerReason ?? "waiting";

    if (reason.includes("composition_growth") || reason.includes("composition")) {
      return "The nursery is still feeding the seed-core.";
    }

    if (reason.includes("scar") || reason.includes("signal")) {
      return "The scar-flow fold is nearby but not listening yet.";
    }

    return `The host tissue is not ready to fold. ${Math.round((morph.triggerConfidence ?? 0) * 100)}%`;
  }

  worldWaitingStep(morph) {
    const reason = morph.triggerReason ?? "waiting";

    if (reason.includes("composition_growth") || reason.includes("composition")) {
      return "Hold absorb on the safe seed until Form and Seed settle.";
    }

    if (reason.includes("scar") || reason.includes("signal")) {
      return "Move closer to scar or signal, then pulse.";
    }

    return morph.nextAction ?? "Absorb seed → approach scar/signal → pulse.";
  }


  formatGraveStage(stage) {
    const map = {
      husk_acknowledges_return: "old husk acknowledging the returned seam",
      scar_lock_reseals_meaning: "scar lock resealing around the meaning",
      inheritance_seed_warms_closed: "inheritance seed warming while closed",
      grave_bed_post_seam_response_complete: "response complete"
    };
    return map[stage] ?? String(stage ?? "post-seam reading").replaceAll("_", " ");
  }

  formatBloomStage(stage) {
    if (stage === "memory_read") return "read the residue memory";
    if (stage === "bloom_opened") return "open bloom carefully";
    if (stage === "braid_warmed") return "warm the seed-choice braid";
    if (stage === "warning_respected") return "respect the overgrowth warning";
    if (stage === "fork_stable") return "stable";
    return String(stage ?? "bloom residue").replaceAll("_", " ");
  }

  formatSignalStage(stage) {
    if (stage === "choir_heard") return "hear the choir";
    if (stage === "pore_opened") return "open the listening pore";
    if (stage === "wave_followed") return "follow the harmonic wave";
    if (stage === "bridge_warmed") return "warm the seed-signal bridge";
    if (stage === "signal_chorus_tuned") return "tuned";
    return String(stage ?? "signal chorus").replaceAll("_", " ");
  }

  formatStage(stage) {
    if (stage === "memory_read") return "read the memory";
    if (stage === "path_aligned") return "align the path";
    if (stage === "pressure_relieved") return "relieve the pressure";
    if (stage === "clot_respected") return "respect the clot";
    if (stage === "scar_flow_stable") return "stable";
    return String(stage ?? "scar-flow").replaceAll("_", " ");
  }

  worldCompletionInstruction(frameState) {
    const completion = frameState?.morphCompletion ?? {};

    if (completion.nearestHook && completion.nearestHook !== "none") {
      return `Read the ${completion.nearestHook.replaceAll("_", " ")}.`;
    }

    return completion.nextAction ?? "Pulse scar-flow objects to stabilize the new cell.";
  }

  updateWorldCue(morph, frameState) {
    if (!this.ring || !this.innerRing) return;

    const progress = this.clamp01(morph.progress ?? 0);
    const readiness = this.clamp01(morph.triggerConfidence ?? 0);
    const active = morph.triggerReady || progress > 0 || morph.completed;
    const t = frameState.runtimeSeconds ?? 0;

    this.ring.visible = active;
    this.innerRing.visible = active;

    if (!active) return;

    this.ring.position.copy(this.playerRoot.position);
    this.ring.position.y -= 0.16;
    this.innerRing.position.copy(this.ring.position);
    this.innerRing.position.y += 0.012;

    const breathe = 1 + Math.sin(t * 3.2) * 0.05;
    const armedScale = 1.0 + readiness * 0.25 + progress * 0.55;
    this.ring.scale.setScalar(armedScale * breathe);
    this.innerRing.scale.setScalar((0.72 + progress * 0.82) * (1 + Math.sin(t * 5.4) * 0.035));

    this.ring.rotation.z += 0.014 + progress * 0.03;
    this.innerRing.rotation.z -= 0.018 + progress * 0.045;

    this.ring.material.opacity = morph.completed ? 0.22 : 0.14 + readiness * 0.28 + progress * 0.18;
    this.innerRing.material.opacity = morph.completed ? 0.32 : 0.10 + progress * 0.42;
  }

  clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }
}
