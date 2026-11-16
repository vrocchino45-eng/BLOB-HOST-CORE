# CONNECTION24 — presentation checks in the main bot series

This is a test-coverage checkpoint for CONNECTION23. It changes no gameplay, world geometry, controls, camera, progression or audio. The recent visibility, Stabilize, arrival-audio and Absorb tests now run through the same catalog and report collector as the existing world/Core tests.

## Install

Requires CONNECTION23. Extract beside package.json, then run:

```powershell
node .\APPLY_CONNECTION24.mjs --check
node .\APPLY_CONNECTION24.mjs --apply
node .\BLOB_BOT_SERIES1\run.mjs --quick
```

No game reload is needed for this coverage update. Restore the exact prior test files with `node .\APPLY_CONNECTION24.mjs --restore`. The installer preserves earlier checkpoints/backups and rejects unknown versions or later edits before writing.

The browser cases use the existing Playwright setup described in BLOB_BOT_SERIES1/README.md. `node .\BLOB_BOT_SERIES1\run.mjs --browser --case=J08` selects the live Absorb check; `--all` runs the complete catalog. Missing browser prerequisites are not a pass.

## Registered coverage

| Cases | Existing behavior checked | Machine checks |
| --- | --- | ---: |
| J01 / J02 | Silt foreground attenuation and material restoration | 15 owner + 1 browser |
| J03 / J04 | Stabilize alignment follows the contacted material's condition | 16 owner + 1 browser |
| J05 / J06 | Authenticated arrival audio, location, freshness and no replay | 21 owner + 1 browser |
| J07 / J08 | Absorb flow follows actual accepted progress, then quiets on stalls | 14 owner + 1 browser |

The existing test assertions and declared fixtures remain intact. Each script now accepts BLOB_BOT_REPORT after its dedicated report override, allowing the main runner to collect its result. Dedicated standalone report paths keep precedence.

The catalog contains 37 cases / 423 summary checks: 22 quick cases / 407 checks and 15 browser cases / 16 checks. Registration is not evidence that every browser case has passed in this pass. RESULTS_CONNECTION24.md identifies the executed subset.

## Pass contract

Mode: convergence and regression coverage. Purpose: ensure recent presentation fixes participate in normal bot runs. Allowed scope: catalog entries, report-path integration and documentation. Locked: all production source and data, test assertions, fixtures and acceptance thresholds. Delete target: independent-only execution of these regression checks. Visual/feel target: preserve CONNECTION23 exactly. Acceptance: complete quick tier, the four newly cataloged browser cases, unchanged production fingerprint and guarded installer recovery.

The next integration decision is human acceptance of the current visual/audio feedback. The locked review asks whether the Core, contact and destination remain legible, whether verbs show actual outcomes, and whether a world consequence can be followed through its receiving tissue. See HUMAN_CHECK_CONNECTION24.md. A new region or mechanic is not added by this checkpoint.
