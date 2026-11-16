# CONNECTION30 — current-cell chemistry provenance

Requires CONNECTION28. CONNECTION29 was audit-only and is not an installation prerequisite. Extract beside package.json, then run:

```powershell
node .\APPLY_CONNECTION30.mjs --check
node .\APPLY_CONNECTION30.mjs --apply
```

Reload afterward. Restore exact original affected files with `node .\APPLY_CONNECTION30.mjs --restore`. Affected files and required unchanged anchors are checked before writes; conflicting edits there are refused and earlier backups/reports are preserved.

## What this establishes

One read-only owner now publishes the active cell's authored chemistry with its Host derivation, recipe identity, frame/time/substep and nine validated domain values. It is explicitly authored local-cell context, not a claim of mutable Host metabolism. Host chemistryBias is not blended into it or normalized as a probability distribution.

The field reflects the correct authored region, for example:

| Region | Flux | Residue |
| --- | ---: | ---: |
| Vascular | 0.70 | 0.14 |
| Silt | 0.24 | 0.72 |
| Grave | 0.22 | 0.82 |

Guarded reads return neutral during unresolved morphs/crossings and reject a mismatched cell/Host, stale frame/clock/substep or invalid schema. A boundary can change the cell later in a frame: the old publication is then rejected until the next sample. It cannot become a benefit in the destination by accident.

Existing `frameState.chemistry` writers remain intact. This owner writes only `localChemistryContext`; it does not change composition, physicalFeel, bonding, material, credit, controls, camera or audio. No new HUD, geometry or interaction modifier is added. Normal play should remain visually and mechanically equivalent to CONNECTION28.

The existing session JSON now includes a guarded current-context snapshot under `developerTruth.localChemistryContext`. The perceptual v1.52 schema remains unchanged. This developer record is not evidence that a player perceived a chemical difference.

## Ownership and future consumer rule

The single registry slot runs after the early local morph writers and before targeting/Bond. Consumers must call `readLocalChemistryContext(frameState)` from src/chemistry/LocalChemistryContextSystem.js. A raw snapshot's active flag is not sufficient: later same-frame boundary changes must be checked at read time. Session export uses `inspectLocalChemistryContext`, which records a neutral reason when a snapshot is no longer valid.

No existing Bond consumer reads this new context yet. The optional Flux-mote formation prototype remains the next mechanical step, after specifying its domain relationship, neutral behavior and bounds. The compatibility-list discrepancy found in CONNECTION29 is not silently enforced or migrated here; existing fluid-mote eligibility remains unchanged.

## Verification

N01 adds 27 checks over all ten authored cell recipes, schema/provenance/freshness/transition guards, immutability, legacy state preservation and matched actual Bond trajectories. N02 uses separate debug-mount and fresh ordinary-preparation sessions, verifies actual E-input commitment/crossing for three routes, records late-frame rejection/next-sample recovery, and downloads a real Shift+T session JSON.

The complete quick tier passed 25 cases / 481 checks. N02 and F02 passed, for **483 final passing machine-summary checks**. F02 preserves the actual controlled Grave II-to-Silt relief/reply chain. Build and 15 installer groups passed. The catalog now has 43 cases / 500 checks; sixteen browser cases were not rerun on this source. See RESULTS_CONNECTION30.md.

## Pass contract

Mode: chemistry/Core ownership convergence. Purpose: provide reliable authored environmental chemistry for future material-specific interaction. Allowed scope: the context owner and guards, its single registry slot, one developer-export field and focused tests. Locked: legacy chemistry/composition writers, Bond behavior/eligibility, protected seed, required route rewards, finite Silt matter, consequence lineage, Core grammar, movement/camera, recovery, reserve, credit and calibrated audio.

Keep: all current gameplay owners and CONNECTION28's accepted return feedback. Delete/disable targets: none; prevent duplicate chemistry writers and stale-context consumers. Visual/feel target: preserve the current playable build. Acceptance: correct current-cell values, neutral invalid/transition reads, unchanged existing state and Bond outputs, real crossing/export evidence, build and guarded restore checks.

All ten recipes passing context validation does not establish ten fully accepted playable regions. The normal crossing test still uses declared prior-history and near-body fixtures; fresh-start natural-play acceptance remains separate. No new recording is required specifically to perceive this foundation update.
