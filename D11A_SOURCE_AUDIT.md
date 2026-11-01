# D11A Source Audit — ownership and evidence boundaries

Audited against the uploaded full working source archive, `BLOB-HOST-CORE-BLOB-BOT0.zip`, plus previous harness deltas, not an independently fetched latest GitHub checkout.

| Area | Observed source | Role |
|---|---|---|
| Silt debug entry | `src/debug/DebugAreaJumpSystem.js` `TEST_PLATFORMS[6]` | Debug-only canonical entry into `CELL_SILT_PRESSURE_ROUTE_001`, initial position (0,0,0); clears momentum |
| Debug key | `src/input/InputSystem.js` | Shift+Digit6 queues `debugTestPlatformSlot=6` |
| Silt route | `src/routes/SiltPressureRouteSystem.js` | Silt regional gameplay and presentation; *not* the input owner |
| Translation | `src/player/PlayerMovementController.js` | Single owner of player translation; attachment and peel threshold logic |
| Surface truth | `src/player/CoreSurfaceTruthSystem.js`, `src/world/CrawlableSurfaceRegistry.js` | Eligibility from authored ecological surface metadata, not all visible meshes |
| Silt exploratory sites | `src/world/RegionalTerritoryDefinitions.js` | Porosity Shelf, Catchment Bowl, Deep Reservoir; not automatically crawlable contact meshes |
| Source-observed crawlable registrations | `src/world/HostContactShelfSystem.js`, `src/fields/GatheringGroundAliveSystem.js` | Both invoke `applyCrawlableSurfaceMetadata`; Silt route does not do so in this uploaded source |
| REC1 owner observation | `src/debug/WorldObjectCensusSystem.js` `mobilityOwnerSnapshot` | Existing owner snapshots for cell, move input, velocity, intended/environmental vectors, boundary mode and pressure, attachment mode, peel intent, surface ID |
| Recording export | Existing `Alt+Shift+R` and `Alt+Shift+E` | Existing REC1 controls; no new observer added |

## Test design lock

- No gameplay imports or source edits; all changes are Python under `BLOB_BOT1_REAL_INPUT_HARNESS/scripts/`.
- Offline referee distinguishes `SILT_DIAGNOSTIC_CAPTURED` from `ATTACH_AND_RELEASE_OBSERVED_NOT_CAUSALLY_ATTRIBUTED`.
- No source-claimed contact normal in current mobility REC1. A directional sweep cannot be called a correctly aligned peel.
- Existing debug Silt entry bypasses natural progression. It cannot prove access/navigation from Hub.
- No actual Chrome/Vite browser run has been executed here. Live test is pending.
