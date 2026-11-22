# TRADE_SCOPE_MATRIX — WC01 v0.2

One writer per mutable gameplay state. Interfaces are frozen for WC01. Obtain agreement from the owner and affected consumers before changing a shared interface.

| Trade | Owner and permitted work | Shared contract, prohibited work, inspection |
|---|---|---|
| World / Level | ModeController, morph and boundary owners, Hub Foundation and native layout owners. Spatial layout and readiness only in approved packages. | Mount identity and route readiness. No input or chemistry changes. Check available, out-of-range, true lock and leave/re-entry. |
| Ecology / Beings | EntitySystem, OrbiterSystem, relationship and encounter owners. Being motion, local response and memory. | Read route conditions. No grain, route current or reserve writes. Check neutral/verb behavior, custody, remount and cooldown. |
| Core Physiology | CoreGrowthSystem and CoreRadialPerformanceSystem. Growth, radial performance, recovery and settlement. | Accepted work and recovery witness. No regional writes or visual-triggered debit. Check 3→6→12, layouts, exact once and catch-up. |
| Chemistry / Flow | ChemObjectSystem, BondSystem, CoreFlowSystem, Silt route, Territory receiver, Host ledger and downstream owners. | Intent, sample and receipt identity. No second targeting, new progression credit or reserve writer. Check valid/rejected/duplicate/stale work and material conservation. |
| Controls / Camera | ControlMap, InputSystem, TargetingSystem, PlayerMovementController and GameRuntime camera. | Context and canonical relationship. No acceptance or physiology writes. Check world vs inspection/Core Work, Far/Near, physical controller and sediment parity. |
| Visuals / Audio | Existing composers, Flow visuals, HUD, contextual labels, event-anchored audio. | Read accepted state and reason. No physics or persistence. Check local cue meaning, labels and HC027D1 calibration. |
| Lore / Progression | Native route owners, boundary history and ReturnRegionEngineSystem. Curate language and meaning from evidence. | Real readiness and retained history. No invented canon, copy-driven permissions or unreviewed credits. Check history versus live readiness. |
| QA / Integration | Test fixtures, WorldObjectCensusSystem and SessionTelemetrySystem. Evidence and admission. | Stable IDs, ownership and source trace. No diagnostic writes to gameplay. Check exact reproducibility, old baseline failures and ref/index integrity. |

[Runtime registration](../../../../src/core/GameRuntime.js) · [Targeting](../../../../src/targeting/TargetingSystem.js) · [Receipt ledger](../../../../src/core/HostConnectionReceiptLedger.js) · [Telemetry](../../../../src/core/SessionTelemetrySystem.js)

## Design and canon decision boundary

Each trade can propose a change and supply evidence through the [Design/RFI Register](DESIGN_RFI_REGISTER.md). Changes to experience, repeatability, shared interfaces or lore require recorded approval appropriate to the decision. An inspector can verify conformance or reject a candidate. A trade or inspector cannot approve its own unaddressed design or canon decision.
