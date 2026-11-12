# SILT-ROUTE-HANDOFF1 — release and unmount coordination

## Result

Eight focused checks pass against the supplied current source. No production file is changed. This is an evidence/harness checkpoint, not an installable gameplay repair.

The checks execute the exact source text of SiltPressureRouteSystem.updateSiltGrip, flushHeldAbsorbMotion, recordSiltDecision and onRuntimeUnmount in isolation, with real SiltGripAuthority, SiltCompressionContact, SiltPlateSeat, SiltTrajectoryMemory, MaterialIdentityLedger and HostConnectionReceiptLedger helpers. Controlled fields supply the local held grain and publication context. Presentation setVisible/publish endpoints are fixture recording callbacks.

This route imports Three.js, which is absent from this src-only environment. The harness deliberately isolates only branches that do not require Three.js. It neither substitutes a fake Three.js implementation nor claims full module/runtime evaluation. The method extraction fails closed if the expected method boundaries change. Reported route SHA-256 hashes identify the exact inspected source text.

## Verified scenarios

1. Free deliberate release uses the committed grain ID despite a different published camera candidate; one Host observation is created.
2. Repeated release input cannot create a second trajectory or Host observation.
3. Actual contact helper updates establish brace and imprint; release seats the same grain and cancels its free trajectory.
4. Absorb withdrawal cannot seat an imprinted grain.
5. Unimprinted contact follows free release rather than seating.
6. Pending absorb displacement is flushed once under the original held ID before grip clears.
7. Unmount records region-hidden trajectory release, clears grip/contact, restores ledger ownership and grants no Host disturbance.
8. Unmount reconciles stale grip owners in its own material ledger without changing mass.

## Source scheduling review

In the normal Silt update, updateSiltGrip runs before the loop that reconciles materialIdentity owners from the resulting held ID. The cycle then advances with both held and seated IDs withheld. Living-matter visuals update before the contact tick; seating uses the retained valid contact relationship at release, and the subsequent contact update sees grip cleared. The release helper itself does not immediately transfer ordinary ledger ownership; that happens in the following reconciliation loop. These order relationships were inspected, not executed as a complete integration test in this pass.

Region unmount is different: it explicitly returns all local grip-owned records to environment because no later Silt update is guaranteed. Its region-hidden receipt is deliberately excluded from the Host's deliberate-release observation path.

## Current limits and next boundary

Camera-aligned acquisition, seated extraction, authored recipe and geometry, full update ordering, normalized input/Core Work interaction, full coordinate transforms, renderer behavior and human feel remain unverified by these eight cases. Controlled candidate-ID evidence proves release follows committed identity; it does not prove camera selection quality.

The earlier 16/16 material helper checkpoint and installed 13/13 C1 plus 11/11 Stage2B results remain separate evidence with their original scopes. The intermittent Silt visual disappearance stays open and reproduction is deferred by the user. No repeated disappearance test is requested.

The next integration boundary is camera-selected candidate -> accepted grip -> seated extraction and post-grip ownership reconciliation. Full proof needs the real dependency and authored-content environment. Do not claim this isolated-method result closes live regional acceptance or enables feature expansion.

## Pass contract

Mode: Audit / Convergence.

Purpose: verify existing route release/seating/unmount coordination with committed identity and bounded receipt effects.

Allowed scope: source inspection, isolated production-method execution, real-helper tests, hashes and documentation.

Forbidden scope: gameplay edits, camera/input behavior changes, surface tagging, material count changes, update reordering and new content.

Locked systems: all production files; player movement, Guide timers/arbitration, authored controls/camera/audio, LS1 geometry and 3->6->12 grammar.

Delete/disable targets: none. No new browser observer is installed by this package.

Visual/feel targets: current game preserved; all work occurs outside the live game.

Acceptance: eight focused cases pass, extraction/source identity is recorded, original production bytes unchanged. Completed locally within the isolated-method scope.

Regression: no duplicated Host observations, seating excludes free trajectory, pending pull receipts preserve grain ID, and hidden-cell release grants no Host effect.

## Optional reuse

No installation or playtest is needed now. The archive includes the reusable harness and this environment's LOCAL_REPORT. For a later code edit, copy SILT_ROUTE_HANDOFF1.mjs into the repository root and run in VS Code PowerShell:

```powershell
node ./SILT_ROUTE_HANDOFF1.mjs > ./SILT_ROUTE_HANDOFF1_REPORT.json
```

The harness reads installed route method bodies and imports the real helper files. It never writes production source. A changed route should be reviewed before treating extraction-boundary or scenario failures as gameplay regressions.
