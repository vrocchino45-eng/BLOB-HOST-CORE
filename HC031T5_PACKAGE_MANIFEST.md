# HC031T5 Delta Manifest

Changed runtime/source files:
- package.json
- src/main.js
- src/core/GameRuntime.js
- src/core/SessionTelemetrySystem.js
- src/fields/ApertureFieldsArrivalSystem.js
- src/fields/MembraneRidgeGameplaySystem.js
- src/fields/ApertureAdjacentTerritorySystem.js
- src/guide/GuidePromptSystem.js
- src/ui/PlaytestHudSystem.js

New validation files:
- scripts/validateHC031T5RidgeTraceCanonicalGatheringGround.mjs
- scripts/smokeHC031T5RidgeTraceFrameRate.mjs

New documentation:
- HC031T5_BUILD_REPORT.md
- HC031T5_FOCUSED_PLAYTEST.md
- HC031T5_PATCH_APPLY.md
- HC031T5_PACKAGE_MANIFEST.md

Filesystem deletions: none.
Runtime duplicate deleted by source replacement: `gathering_ground_adjacent_ghost_body` mesh construction.
