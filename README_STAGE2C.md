# GSL-4E2G Stage 2C — live producer chain observer

Stage 2B-R is locked at 11/11 passing. This pass observes the installed movement controller publishing playerAttachment, the real adapter being called by the Guide, and the Guide's resulting interpretation. No synthetic attachment inputs are generated. No production source file is replaced.

## Install

Copy these TWO files into the BLOB-HOST-CORE repository root:

- GSL4E2G_STAGE2C.mjs
- GSL4E2G_STAGE2C_OBSERVER.mjs

Start the game normally with your existing development server. Open browser developer tools (F12), select Console, and run:

```javascript
await import('/GSL4E2G_STAGE2C.mjs')
```

This installs temporary observation wrappers on the existing movement and Guide methods, including instances already running. It does not call the adapter extra times or change gameplay flags, inputs, arguments or return values. Reloading the page removes the wrappers. Import again after any reload. If developer tools reports an import error, send the error and stop this capture rather than changing production files.

Enable the existing Guide experiment with Ctrl+Shift+F9 only if it is OFF; confirm the existing console message says ON. Leave it ON throughout this capture. This is the existing comparison toggle, not a new control.

## Focused capture, approximately 5–10 minutes

Return focus to the game. In the LS1 Silt test area, use ordinary controls to attach, deliberately peel away, then reattach. Continue across surfaces where contact may naturally be lost, then recover onto a surface. Do not rewrite attachment state, remove surfaces, or force loss through console commands. An unexpected loss may not occur in this short session; missing coverage will correctly report INCOMPLETE.

Return to Console and export:

```javascript
__BLOB_GSL_STAGE2C__.download()
```

Upload GSL4E2G_STAGE2C_REPORT.json. Stop observation afterward:

```javascript
__BLOB_GSL_STAGE2C__.stop()
```

Reload before starting another capture. Video is optional for this data pass; if recording, a short matching clip is sufficient.

## Interpretation

PASS requires live paired samples, observed deliberate release, reason-bearing unexpected loss and recovery, no chain errors, and no dropped transition records. The first observed sample and samples after a producer/consumer gap establish a new coverage baseline rather than counting as proven transitions. FAIL includes producer/adapter input mismatch, attachment mutation across the consumer, incorrect release classification or Guide interpretation mismatch. INCOMPLETE means required evidence is absent. Authored Guide movement or Core Work may legitimately retain movement ownership; this observer compares interpretation and preserves the recorded owner.

The recorder retains at most 4,000 transition records and 100 issue details; totals continue counting. It records runtime time, cell, attachment reason, adapter output, interpretation and owner. It does not record full geometry or input streams. A PASS applies only to the observed branches, not every possible LS1 loss reason.

## Pass contract

- Mode: Audit / Convergence. Milestone: prove the live LS1 producer -> adapter -> Guide chain.
- Purpose: verify actual producer classifications and consumer agreement after Stage 2B's controlled-input proof.
- Allowed scope: additive, opt-in diagnostic modules; temporary method observation in memory; JSON export.
- Forbidden scope / locked systems: movement laws, production adapter, Guide logic, timing, inputs, camera, audio, world content and Stage 2B checks.
- Inspected sources: supplied src snapshot's PlayerMovementController.update publication, release reason branches, OrbiterSystem adapter call and toggle; E2F Guide interpretation delta; accepted Stage 2B-R report.
- Delete/disable targets: no production systems. Stop/reload removes this observer.
- Visual / feel targets: existing game appearance and response preserved; no HUD additions.
- Acceptance: installed browser imports succeed; required real-event coverage is present; actual chain report passes.
- Regression: Stage 2B remains 11/11; movement and Guide calls preserve their arguments, return values and thrown exceptions; stopping restores original methods when still owned by this observer.
- Next: review live reasons and coverage before any behavior change. Browser appearance, human feel, separate Guide cooldown and unobserved branches remain outside automated proof.

## Local validation

Node syntax checks passed. Run the included optional self-test from the repository root:

```powershell
node ./GSL4E2G_STAGE2C_SELFTEST.mjs
```

It checks observer plumbing with small synthetic classes: coverage gating, stale pairing, mismatches, mutation detection, return values, restoration and original exception propagation. These tests do NOT establish production LS1 correctness. Actual browser installation and live event validation remain pending your capture.
