# C0C-TRACE1-A — Local validation report

Validation executed against fixture, latest uploaded C0C5 recording, earlier Silt-only REC1 recording, and LS1E2 route source extracted from the known changed-files package.

| Check | Result |
|---|---|
| Unit/negative fixtures | **PASS**, 16 assertions |
| Latest full REC1: cause → Host → Vascular | **OBSERVED_CHAIN**, 5 / 5 / 5 |
| C0C5 recorder | **1,989 / 1,989**, no missing event ordinal |
| Latest final membrane load | **0.1528** (last accepted load was 0.85) |
| Latest final current multiplier | **0.987** |
| Silt-only previous recording | **EVIDENCE_INCOMPLETE** (no Vascular receipt) |
| Static source endpoints | **6 / 6 FOUND** in audited LS1E2 Vascular route source |
| Gameplay files modified | **0** |
| Browser playback/rendering | **NOT RUN** |
| Player-visible response | **NOT ESTABLISHED**; player reported indistinguishable effect |

Report provenance: source signature scan uses the LS1E2 archived `VascularRhythmRouteSystem.js`, not an independent read of the user's current local worktree. Re-run with `--source` locally to check the installed file. No direct sound endpoint was established for this signal in the source scanned. The report does not claim audio integration.
