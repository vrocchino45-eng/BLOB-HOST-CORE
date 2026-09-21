const TABS = ["Core", "Chemistry", "Region", "Controls", "Telemetry"];

/**
 * HOST CORE V001 Status Page.
 *
 * GameState/frameState owns truth. This system owns only status-page interaction
 * state and presentation. It never changes route availability, chemistry, or
 * objective truth directly. HC020B removes Status-page usage from all gameplay
 * completion requirements; firstHubUseComplete remains UI analytics only.
 */
export class StatusPageSystem {
  constructor({ appRoot, frameState }) {
    if (!appRoot) throw new Error("[StatusPageSystem] appRoot is required.");
    if (!frameState) throw new Error("[StatusPageSystem] frameState is required.");

    this.appRoot = appRoot;
    this.frameState = frameState;
    this.open = false;
    this.activeTabIndex = 0;
    this.firstHubUseComplete = false;
    this.openCount = 0;
    this.lastEvent = "not_opened";
    this.root = null;
    this.tabRow = null;
    this.content = null;
    this.footer = null;
    this.renderScheduled = false;
    this.firstHubUseCommitFrame = null;
    this.firstHubUseCommitMode = "none";
    this.hubSelfReadingIntentLatched = false;
    this.lastToggleEventId = 0;
    this.lastToggleSource = "none";
    this.lastToggleFrame = -1;
    this.confirmationSeconds = 0;
    this.confirmationRoot = null;
  }

  init() {
    this.createDom();
    this.publish(this.frameState);
  }

  update(dt, frameState) {
    const input = frameState.input ?? {};
    const toggleEventId = input.statusPageEventId ?? 0;
    const freshToggle = Boolean(
      input.statusPageTogglePressed
      && (toggleEventId <= 0 || toggleEventId !== this.lastToggleEventId)
    );

    if (freshToggle) {
      this.lastToggleEventId = toggleEventId;
      this.lastToggleSource = input.statusPageSource ?? "legacy_unattributed_input";
      this.lastToggleFrame = frameState.frame ?? -1;
      this.open = !this.open;
      this.lastEvent = this.open ? "status_page_opened" : "status_page_closed";
      frameState.statusPageInputAudit = {
        ...(frameState.statusPageInputAudit ?? {}),
        pass: "HC-008F",
        eventId: toggleEventId,
        source: this.lastToggleSource,
        consumedBy: "StatusPageSystem",
        consumedAtFrame: frameState.frame ?? -1,
        result: this.open ? "status_page_opened" : "status_page_closed"
      };
      if (this.open) {
        this.openCount += 1;
        if (this.isHubContext(frameState)) {
          this.hubSelfReadingIntentLatched = true;
        }
        // Older focused validators do not construct the HC-007C state. Runtime
        // always does, so absence remains backward-compatible while an explicit
        // false value correctly blocks the authored Hub self-reading commit.
        const investigationReady = frameState.hubInvestigationGameplay == null
          || frameState.hubInvestigationGameplay.investigationReady === true;
        if (this.isHubContext(frameState) && investigationReady && !this.firstHubUseComplete) {
          this.commitFirstHubUse(frameState, "open_event_ready");
        } else if (this.isHubContext(frameState) && !investigationReady && !this.firstHubUseComplete) {
          this.lastEvent = "hub_status_page_opened_before_investigation_converged";
        }
      }
    }

    // Hub investigation is published after StatusPageSystem in the runtime stack.
    // Keep the player's demonstrated self-reading intent and commit on the first
    // subsequent frame where the authored investigation is ready. This also fixes
    // the case where the page stays open while the third Hub read settles.
    const investigationReadyNow = frameState.hubInvestigationGameplay == null
      || frameState.hubInvestigationGameplay.investigationReady === true;
    if (
      this.isHubContext(frameState)
      && this.hubSelfReadingIntentLatched
      && investigationReadyNow
      && !this.firstHubUseComplete
    ) {
      this.commitFirstHubUse(frameState, this.open ? "open_page_became_ready" : "latched_open_intent_became_ready");
    }

    this.confirmationSeconds = Math.max(0, this.confirmationSeconds - dt);
    this.renderConfirmation();

    if (this.open && input.cancelPressed) {
      this.open = false;
      this.lastEvent = "status_page_closed_by_cancel";
    }

    if (this.open) {
      if (input.statusTabPrevPressed || input.menuLeftPressed) {
        this.activeTabIndex = (this.activeTabIndex - 1 + TABS.length) % TABS.length;
        this.lastEvent = "status_tab_previous";
      }
      if (input.statusTabNextPressed || input.menuRightPressed) {
        this.activeTabIndex = (this.activeTabIndex + 1) % TABS.length;
        this.lastEvent = "status_tab_next";
      }
      if (input.menuUpPressed && this.content) {
        this.content.scrollTop = Math.max(0, this.content.scrollTop - 96);
      }
      if (input.menuDownPressed && this.content) {
        this.content.scrollTop += 96;
      }

      // StatusMode consumes gameplay actions while the self-reading is open.
      // This is input routing, not gameplay-state mutation.
      this.suppressGameplayInput(frameState);
    }

    this.publish(frameState);
    this.scheduleRender(frameState);
  }

  isHubContext(frameState) {
    return Boolean(
      frameState.currentMode?.id === "hub_mode"
      || frameState.currentMode?.regionId === "hub_chamber"
      || frameState.activeCellId === "CELL_SIGNAL_CHORUS_NERVE_001"
    );
  }

  commitFirstHubUse(frameState, reason) {
    if (this.firstHubUseComplete) return;
    this.firstHubUseComplete = true;
    this.firstHubUseCommitFrame = frameState.frame ?? 0;
    this.firstHubUseCommitMode = frameState.currentMode?.id ?? "hub_mode";
    this.lastEvent = `first_hub_status_page_use_committed_${reason}`;
    this.confirmationSeconds = 2.8;
    frameState.statusPageInputAudit = {
      ...(frameState.statusPageInputAudit ?? {}),
      pass: "HC-008F",
      consumedBy: "StatusPageSystem",
      consumedAtFrame: frameState.frame ?? -1,
      intentLatched: true,
      investigationReady: true,
      commitFrame: this.firstHubUseCommitFrame,
      result: "hub_self_reading_committed"
    };
  }

  scheduleRender(frameState) {
    if (this.renderScheduled) return;
    this.renderScheduled = true;

    const flush = () => {
      this.renderScheduled = false;
      // Render after the runtime update stack so ObjectiveSystem, LocalCellBoundaryMorphSystem, and
      // HubChamberFoundationSystem have published the state caused by this open event.
      this.render(this.frameState ?? frameState);
    };

    if (typeof queueMicrotask === "function") {
      queueMicrotask(flush);
    } else {
      Promise.resolve().then(flush);
    }
  }

  suppressGameplayInput(frameState) {
    if (!frameState.input) return;
    Object.assign(frameState.input, {
      moveX: 0,
      moveY: 0,
      moveZ: 0,
      boostHeld: false,
      interactPressed: false,
      coreWorkPressed: false,
      coreWorkManipX: 0,
      coreWorkManipY: 0,
      coreWorkManipDepth: 0,
      coreWorkSelectPrevPressed: false,
      coreWorkSelectNextPressed: false,
      pulsePressed: false,
      absorbHeld: false,
      stabilizeHeld: false,
      resonanceHeld: false,
      guideFocusPressed: false,
      cameraLookX: 0,
      cameraLookY: 0,
      recenterCameraPressed: false,
      toggleInspectionCameraPressed: false
    });
  }

  publish(frameState) {
    const inHub = this.isHubContext(frameState);
    frameState.statusPage = {
      pass: "HC-008F",
      active: true,
      open: this.open,
      tabs: [...TABS],
      activeTabIndex: this.activeTabIndex,
      activeTab: TABS[this.activeTabIndex],
      openCount: this.openCount,
      firstHubUseComplete: this.firstHubUseComplete,
      firstHubUsePending: Boolean(inHub && !this.firstHubUseComplete),
      hubInvestigationReady: Boolean(frameState.hubInvestigationGameplay?.investigationReady),
      firstHubUseBlockedByInvestigation: Boolean(inHub && !this.firstHubUseComplete && !frameState.hubInvestigationGameplay?.investigationReady),
      firstHubUseCommittedOnOpen: this.firstHubUseComplete,
      hubSelfReadingIntentLatched: this.hubSelfReadingIntentLatched,
      firstHubUseCommitFrame: this.firstHubUseCommitFrame,
      firstHubUseCommitMode: this.firstHubUseCommitMode,
      lastToggleEventId: this.lastToggleEventId,
      lastToggleSource: this.lastToggleSource,
      lastToggleFrame: this.lastToggleFrame,
      inputEventObserved: this.lastToggleFrame >= 0,
      commitConfirmationVisible: this.confirmationSeconds > 0,
      objectiveConsumedCompletion: false,
      gateConsumedCompletion: false,
      progressionAuthority: false,
      objectiveAuthority: false,
      gateAuthority: false,
      availableInput: "Tab / View-Select / Menu-Start",
      tabInput: "LB/RB or D-Pad Left/Right",
      navigationInput: "D-Pad / Arrow Keys",
      closeInput: "B/Escape or Tab/View-Select",
      owner: "StatusPageSystem",
      displayOwner: "StatusPageSystem",
      truthOwner: "GameState/frameState",
      uiMutationRule: "read_only_gameplay_truth",
      mode: this.open ? "status_mode" : "inactive",
      lastEvent: this.lastEvent
    };

    frameState.statusMode = {
      id: "status_mode",
      active: this.open,
      label: "Status Mode",
      sceneBehaviorOwner: "StatusPageSystem",
      underlyingMode: frameState.currentMode?.id ?? "none",
      gameplayInputSuppressed: this.open,
      worldStatePaused: false,
      uiMutatesGameplayState: false
    };
  }

  createDom() {
    this.root = document.createElement("section");
    this.root.id = "host-core-status-page";
    Object.assign(this.root.style, {
      position: "fixed",
      inset: "clamp(18px, 4vw, 52px)",
      zIndex: "120",
      display: "none",
      flexDirection: "column",
      color: "#e8fdff",
      background: "linear-gradient(145deg, rgba(4, 12, 16, 0.96), rgba(10, 14, 21, 0.94))",
      border: "1px solid rgba(157, 238, 255, 0.38)",
      borderRadius: "18px",
      boxShadow: "0 0 70px rgba(76, 214, 255, 0.12), inset 0 0 60px rgba(121, 231, 255, 0.035)",
      backdropFilter: "blur(10px)",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      overflow: "hidden"
    });

    const header = document.createElement("div");
    Object.assign(header.style, {
      padding: "18px 22px 12px",
      borderBottom: "1px solid rgba(157, 238, 255, 0.14)"
    });
    header.innerHTML = `
      <div style="font-size:10px;letter-spacing:.18em;color:#8defff;opacity:.78">HOST CORE // SELF-READING</div>
      <div style="margin-top:5px;font-size:20px;letter-spacing:.04em">STATUS PAGE</div>
      <div style="margin-top:5px;font-size:11px;color:#ffdca8;opacity:.82">The core reads itself. World state remains live and unchanged.</div>
    `;

    this.tabRow = document.createElement("div");
    Object.assign(this.tabRow.style, {
      display: "grid",
      gridTemplateColumns: `repeat(${TABS.length}, minmax(0, 1fr))`,
      gap: "8px",
      padding: "12px 18px",
      borderBottom: "1px solid rgba(157, 238, 255, 0.12)"
    });

    this.content = document.createElement("div");
    Object.assign(this.content.style, {
      flex: "1",
      overflowY: "auto",
      padding: "18px 22px 24px",
      scrollbarWidth: "thin"
    });

    this.footer = document.createElement("div");
    Object.assign(this.footer.style, {
      padding: "10px 18px 12px",
      fontSize: "10px",
      color: "#a9dce5",
      opacity: ".78",
      borderTop: "1px solid rgba(157, 238, 255, 0.12)"
    });

    this.root.append(header, this.tabRow, this.content, this.footer);
    document.body.appendChild(this.root);

    this.confirmationRoot = document.createElement("div");
    this.confirmationRoot.id = "host-core-self-reading-confirmation";
    this.confirmationRoot.textContent = "SELF-READING HELD · GRAVE MEMORY CAN NOW ANSWER";
    Object.assign(this.confirmationRoot.style, {
      position: "fixed",
      left: "50%",
      bottom: "28px",
      transform: "translate(-50%, 10px)",
      zIndex: "126",
      display: "none",
      padding: "10px 14px",
      color: "#fff0c8",
      background: "rgba(5, 14, 18, 0.9)",
      border: "1px solid rgba(255, 224, 165, 0.5)",
      borderRadius: "999px",
      boxShadow: "0 0 28px rgba(147, 230, 255, 0.18)",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: "10px",
      letterSpacing: ".12em",
      pointerEvents: "none"
    });
    document.body.appendChild(this.confirmationRoot);
  }

  renderConfirmation() {
    if (!this.confirmationRoot) return;
    const visible = this.confirmationSeconds > 0;
    this.confirmationRoot.style.display = visible ? "block" : "none";
    this.confirmationRoot.style.opacity = String(Math.min(1, this.confirmationSeconds * 1.4));
    this.confirmationRoot.style.transform = `translate(-50%, ${visible ? "0" : "10px"})`;
  }

  render(frameState) {
    if (!this.root) return;
    this.root.style.display = this.open ? "flex" : "none";
    if (!this.open) return;

    this.renderTabs();
    const tab = TABS[this.activeTabIndex];
    this.content.innerHTML = this.renderTab(tab, frameState);
    this.footer.textContent = "View/Select, Menu/Start, or Tab: close  •  LB/RB or ←/→: tabs  •  D-Pad or ↑/↓: navigate  •  B/Escape: back";
  }

  renderTabs() {
    this.tabRow.innerHTML = "";
    TABS.forEach((tab, index) => {
      const el = document.createElement("div");
      const active = index === this.activeTabIndex;
      el.textContent = tab.toUpperCase();
      Object.assign(el.style, {
        padding: "9px 10px",
        textAlign: "center",
        fontSize: "11px",
        letterSpacing: ".1em",
        color: active ? "#fff3cb" : "#9bcad2",
        background: active ? "rgba(255, 221, 160, 0.10)" : "rgba(111, 218, 239, 0.035)",
        border: `1px solid ${active ? "rgba(255, 221, 160, 0.38)" : "rgba(111, 218, 239, 0.12)"}`,
        borderRadius: "10px"
      });
      this.tabRow.appendChild(el);
    });
  }

  renderTab(tab, frameState) {
    if (tab === "Chemistry") return this.renderChemistry(frameState);
    if (tab === "Region") return this.renderRegion(frameState);
    if (tab === "Controls") return this.renderControls(frameState);
    if (tab === "Telemetry") return this.renderTelemetry(frameState);
    return this.renderCore(frameState);
  }

  renderCore(frameState) {
    const composition = frameState.playerComposition ?? {};
    const growth = frameState.coreGrowth ?? {};
    const bond = frameState.bondState ?? {};
    const inspection = frameState.inspectionCamera ?? frameState.tightInspectionCamera ?? {};
    const cohesion = frameState.firstSliceCohesion ?? {};
    const practice = cohesion.practice ?? {};
    const balance = cohesion.practiceBalance ?? {};
    const retainedLessons = (cohesion.lessons ?? [])
      .filter((lesson) => lesson.retained)
      .map((lesson) => lesson.label)
      .join(" · ") || "still forming";
    return this.panelMarkup("CORE", "Current self-reading", [
      ["Form response", this.percent(composition.form)],
      ["Flux response", this.percent(composition.flux)],
      ["Scar load", this.percent(composition.scar)],
      ["Seed response", this.percent(composition.seed)],
      ["Signal response", this.percent(composition.signal)],
      ["Bodily stage", growth.displayStage ?? "Seed Core"],
      ["Shell restructuring", this.percent(growth.growthProgress)],
      ["Retained chemistry bias", (growth.biasLabel ?? "balanced_first_binding").replaceAll("_", " ")],
      ["Grave memory imprint", growth.graveMemoryImprintCommitted ? "attached pearl — reading retained" : "none"],
      ["Memory trace integrity", growth.graveMemoryImprintCommitted ? this.percent(growth.graveMemoryTraceIntegrity) : "not carried"],
      ["Residue recoil", growth.graveRiskEventCount > 0
        ? growth.graveResidueRecoilRecovered ? "encountered and recovered" : "still present"
        : "none encountered"],
      ["Vascular rhythm", growth.vascularRhythmRetained
        ? `${growth.vascularCadenceReads ?? 0}/3 cadence retained — visible filament`
        : "not yet carried"],
      ["Vascular return integrity", growth.vascularRhythmRetained
        ? `${this.percent(growth.vascularCirculationIntegrity)} / no ability unlocked`
        : "not returned"],
      ["Pressure response", `${this.percent(1 - (growth.movementModifiers?.pressureResponseMultiplier ?? 1))} resistance`],
      ["Growth class lock", growth.permanentClass ? "locked" : "none — bias remains reversible"],
      ["Emerging practice", cohesion.emergingIdentity ?? "Emergent Conduit"],
      ["Practice strength (independent)", `${this.percent(practice.reading)} / ${this.percent(practice.binding)} / ${this.percent(practice.stabilizing)}`],
      ["Practice balance (read / bind / stabilize)", `${this.percent(balance.reading)} / ${this.percent(balance.binding)} / ${this.percent(balance.stabilizing)}`],
      ["Retained lessons", retainedLessons],
      ["Living Core slice", cohesion.sliceLockReady ? "locked" : `pending — ${(cohesion.missingLockCriteria ?? []).join(", ") || "criteria forming"}`],
      ["Growth evidence", cohesion.decorativePracticeVisualsDisabled ? "Binding Core body — practice rings disabled" : "practice imprint"],
      ["Current bond", bond.objectId && bond.objectId !== "none" ? bond.objectId : "none"],
      ["Camera", inspection.active ? (inspection.selfInspection ? "Core inspection orbit" : "authored focus inspection") : "wide orbit"],
      ["Movement reference", frameState.playerKinematics?.movementFeel ?? "camera-relative planar"]
    ], "Composition and practice strengths are independent response gauges, not pieces of one 100% total. The first shell bias remains reversible. Grave returns as a pearl; Vascular returns as rhythm. Neither is loot, a new ability, a class, or a newly opened route.");
  }

  renderChemistry(frameState) {
    const field = frameState.chemistry ?? {};
    const chem = frameState.chemObjectState ?? {};
    return this.panelMarkup("CHEMISTRY", "Local host field", [
      ["Form field", this.number(field.form)],
      ["Flux field", this.number(field.flux)],
      ["Scar field", this.number(field.scar)],
      ["Seed field", this.number(field.seed)],
      ["Signal field", this.number(field.signal)],
      ["Nearest chemistry object", chem.nearestObject ?? "none"],
      ["Absorbed objects", String(chem.absorbedObjects ?? 0)],
      ["Pulse response", chem.pulseResponse ?? "none"]
    ], "Matter is alive with state. Pulse reads; absorb draws only what the current bond permits.");
  }

  renderRegion(frameState) {
    const mode = frameState.currentMode ?? {};
    const objective = frameState.objectiveState ?? {};
    const hub = frameState.hubChamberFoundation ?? {};
    const routes = Array.isArray(hub.routes) ? hub.routes : [];
    const routeLines = routes.length
      ? routes.map((route) => `<div style="margin-top:7px"><span style="color:${route.activeRoute ? "#ffe3a8" : "#9cc8d0"}">${this.escape(route.displayName ?? route.id)}</span> — ${this.escape(route.runtimeStatus ?? "unknown")}</div>`).join("")
      : '<div style="margin-top:7px;color:#9cc8d0">No Hub route layout active in this region.</div>';

    return `
      ${this.panelMarkup("REGION", mode.regionDisplayName ?? mode.regionId ?? "Unknown region", [
        ["Mode", mode.label ?? mode.id ?? "unknown"],
        ["Host function", mode.hostFunction ?? "unmapped"],
        ["Objective", objective.displayText ?? objective.id ?? "none"],
        ["Objective progress", this.percent(objective.progress)],
        ["Gate out", mode.gateOutId ?? "none"],
        ["Visual language", mode.visualLanguageId ?? "unmapped"]
      ], "Regions are living functions of the Host Core, not disconnected levels.")}
      <div style="margin-top:18px;padding:16px;border:1px solid rgba(255,224,169,.16);border-radius:12px;background:rgba(255,224,169,.035)">
        <div style="font-size:10px;letter-spacing:.14em;color:#ffdca8">HUB ROUTE READINGS</div>
        ${routeLines}
      </div>
    `;
  }

  renderControls(frameState) {
    const map = frameState.controlMap ?? {};
    const controller = map.controller ?? {};
    const keyboard = map.keyboard ?? {};
    const hotButtons = frameState.debugAreaJump?.hotButtons ?? {};
    const displayRows = (hotButtons.display ?? []).map((entry) => [entry.key, `${entry.label} — ${entry.purpose}`]);
    const platformRows = (hotButtons.testPlatforms ?? []).map((entry) => [entry.key, `${entry.label} — ${entry.purpose}`]);
    const areaRows = (hotButtons.areaJumps ?? []).map((entry) => [entry.key, `${entry.label} — ${entry.purpose}`]);
    const toolRows = (hotButtons.tools ?? []).map((entry) => [entry.key, `${entry.label} — ${entry.purpose}`]);

    return `
      ${this.panelMarkup("CONTROLS", "Canonical HOST CORE mapping", [
        ["Move", controller.move ?? "Left Stick"],
        ["Vertical", controller.verticalMove ?? "RB / LB"],
        ["Look", controller.look ?? "Right Stick"],
        ["Interact / scan / cross", controller.interact ?? "A"],
        ["Pulse", controller.pulse ?? "X"],
        ["Absorb", controller.absorb ?? "RT"],
        ["Stabilize / brace", controller.stabilize ?? "LT"],
        ["Core / authored focus", controller.guideFocus ?? "Y"],
        ["Boost", controller.boost ?? "L3"],
        ["Recenter", controller.recenter ?? "R3"],
        ["Status Page", controller.statusPage ?? "View / Select"],
        ["Tabs", controller.statusTabs ?? "LB / RB"],
        ["Menu navigation", controller.menuNavigation ?? "D-Pad"]
      ], "Physical controls stay stable. Regions interpret actions; they do not remap the buttons.")}
      ${this.panelMarkup("KEYBOARD", "Keyboard / mouse", [
        ["Move", keyboard.move ?? "WASD / Arrow Keys"],
        ["Vertical", keyboard.verticalMove ?? "C / Z or Page Up / Page Down"],
        ["Pulse", keyboard.pulse ?? "Left Mouse / X / Space"],
        ["Absorb", keyboard.absorb ?? "Right Mouse"],
        ["Stabilize", keyboard.stabilize ?? "Q"],
        ["Interact", keyboard.interact ?? "E"],
        ["Core / authored focus", keyboard.guideFocus ?? "F"],
        ["Core Work entry", keyboard.coreWorkView ?? "G while in Core Inspection"],
        ["Boost", keyboard.boost ?? "Shift"],
        ["Recenter", keyboard.recenter ?? "R"],
        ["Status Page", keyboard.statusPage ?? "Tab"]
      ], "") }
      <div style="height:18px"></div>
      ${this.panelMarkup("HOT BUTTONS // DEBUG HUD", "Display and playtest instrumentation", displayRows.length ? displayRows : [
        ["F1", "Playtest Trace — large input/action telemetry + small context HUD"],
        ["F2", "System Debug — deep runtime/system diagnostics"],
        ["F3", "Clean Play — hide debug overlays"]
      ], "HC027K1 HOTFIX2: F1 is the recording-friendly Playtest Trace; HC027L adds rhythm-gap context there; F2 is deep System Debug; F3 is Clean Play. F1 holds the last interpreted action briefly so quick releases remain readable in video. Telemetry is read-only and does not alter gameplay.")}
      <div style="height:18px"></div>
      ${this.panelMarkup("HOT BUTTONS // 8-MINUTE TEST", "Shift+1 through Shift+8", platformRows.length ? platformRows : [["Shift+1..8", "Eight deterministic test platforms; no progression authority"]], "These are the browser-safe focused playtest jumps. Each platform clears momentum and starts from a deterministic world-view setup.")}
      <div style="height:18px"></div>
      ${this.panelMarkup("HOT BUTTONS // DIRECT AREA JUMPS", "Legacy Ctrl+number shortcuts", areaRows.length ? areaRows : [["Ctrl+1..8", "Direct region jumps"]], "Browsers can intercept Ctrl/Cmd+number for tab switching. Prefer Shift+1..8 for ordinary focused testing.")}
      <div style="height:18px"></div>
      ${this.panelMarkup("HOT BUTTONS // TOOLS", "Debug-only setup and architecture commands", toolRows.length ? toolRows : [
        ["Ctrl+Shift+8", "Signal Plain direct reset"],
        ["P", "Seed/reset Core Work anatomy"],
        ["O", "Cycle Core engine 3 → 6 → 12"]
      ], "These commands are developer instrumentation only; none grants progression, completes objectives, or changes route authority.")}
    `;
  }

  renderTelemetry(frameState) {
    const telemetry = frameState.sessionTelemetry ?? {};
    const summary = telemetry.summary ?? {};
    const weights = summary.finalCore?.weights ?? {};
    const source = frameState.inputTelemetry ?? {};
    return `
      ${this.panelMarkup("TELEMETRY", "HC028A1 calibrated session recorder", [
        ["Session", telemetry.sessionId ?? "not started"],
        ["Golden baseline", telemetry.baselineId ?? "HC027L1_GOLDEN_INQUIRY_BASELINE_01"],
        ["Schema", telemetry.schemaVersion ?? "blob.session.telemetry.v1.1"],
        ["Wall / sim time", `${this.number(telemetry.wallDurationSeconds)}s / ${this.number(telemetry.simDurationSeconds)}s`],
        ["Clock drift", `${this.number(telemetry.wallMinusSimSeconds)}s`],
        ["Storage", telemetry.storageStatus ?? "memory only"],
        ["Events", String(telemetry.eventCount ?? 0)],
        ["Movement samples", String(telemetry.movementSampleCount ?? 0)],
        ["Core snapshots", String(telemetry.coreSnapshotCount ?? 0)],
        ["Last event", telemetry.lastEventType ?? "none"],
        ["Pulse quick / charged", `${summary.quickPulses ?? 0} / ${summary.chargedPulses ?? 0}`],
        ["Sonar returns / deep", `${summary.sonarReturns ?? 0} / ${summary.deepSonarReturns ?? 0}`],
        ["Resolution increases", String(summary.resolutionIncreases ?? 0)],
        ["Absorb uses / held", `${summary.absorbUses ?? 0} / ${this.number(summary.absorbHeldSeconds)}s`],
        ["Stabilize uses / held", `${summary.stabilizeUses ?? 0} / ${this.number(summary.stabilizeHeldSeconds)}s`],
        ["Consequences / relationships", `${summary.consequences ?? 0} / ${summary.relationships ?? 0}`],
        ["Semantic-stagnation entries", String(summary.semanticStagnationEntries ?? 0)],
        ["Semantic-churn entries", String(summary.semanticChurnEntries ?? 0)],
        ["Information gain / score", `${summary.informationGainEvents ?? 0} / ${this.number(summary.informationGainScore)}`],
        ["Redundant max-res sonar", String(summary.redundantMaxResolutionReturns ?? 0)],
        ["No-gain attempts", String(summary.noGainAttempts ?? 0)],
        ["Current churn", telemetry.semanticChurnActive ? `ACTIVE · score ${this.number(telemetry.semanticChurnScore)}` : `clear · score ${this.number(telemetry.semanticChurnScore)}`],
        ["Current Core", `${summary.finalCore?.personality ?? "forming / neutral"} · D/I/M ${this.number(weights.deep)}/${this.number(weights.inner)}/${this.number(weights.membrane)}`],
        ["Current physical input", source.physicalSummary ?? source.physical ?? "see F1 trace"],
        ["Export", `${telemetry.exportHotkey ?? "Shift+T"} — download current JSON`],
        ["Manual marker", `${telemetry.markerHotkey ?? "Shift+M"} — mark an interesting moment`]
      ], "HC028A1 records calibrated read-only session evidence, including wall-clock alignment and human-marker-calibrated semantic churn. The percept layer is separated from developer truth so future blind agents can consume observable facts without authored IDs. Local browser persistence is only the development transport; server upload is intentionally not part of this pass.")}
      <div style="height:18px"></div>
      ${this.panelMarkup("DATA BOUNDARY", "What the later AI may and may not see", [
        ["Percept stream", "allowed — anonymous source, distance/reach, timing, visible condition, action result"],
        ["Developer truth", "blocked from blind agent — authored IDs, semantic class names, correct-verb knowledge"],
        ["Gameplay authority", telemetry.gameplayAuthority ? "ERROR — telemetry has authority" : "none — observer only"],
        ["Server transport", telemetry.serverTransport ?? "not added in HC028A1"]
      ], "The same session file can support developer diagnosis and later perceptual-firewall testing without teaching the agent the grammar.")}
    `;
  }

  panelMarkup(title, subtitle, rows, note = "") {
    const body = rows.map(([label, value]) => `
      <div style="display:grid;grid-template-columns:minmax(150px,32%) 1fr;gap:12px;padding:8px 0;border-bottom:1px solid rgba(150,238,255,.065)">
        <span style="color:#8fcad4">${this.escape(label)}</span>
        <span style="color:#f2fcff">${this.escape(value)}</span>
      </div>
    `).join("");
    return `
      <div style="max-width:820px;margin:0 auto">
        <div style="font-size:10px;letter-spacing:.16em;color:#8defff">${this.escape(title)}</div>
        <div style="font-size:18px;margin:6px 0 14px;color:#fff1c8">${this.escape(subtitle)}</div>
        <div>${body}</div>
        ${note ? `<div style="margin-top:16px;color:#afcdd3;line-height:1.5;font-size:11px">${this.escape(note)}</div>` : ""}
      </div>
    `;
  }

  percent(value) {
    const numeric = Number(value ?? 0);
    return `${Math.round(Math.max(0, Math.min(1, numeric)) * 100)}%`;
  }

  number(value) {
    const numeric = Number(value ?? 0);
    return Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00";
  }

  escape(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
}
