# HC-004QI Acceptance Tests

## Automated

- [x] Build identity is HC-004QI / 0.0.72.
- [x] Stability is inactive before safe silt transfer completes.
- [x] Initial Grave diagnostics are owned by `GraveReadBeforeAbsorbSystem`.
- [x] `safeAbsorbReady` reports ready for input.
- [x] Guide and tissue panel both tell the player to hold A/F at the safe-silt stage.
- [x] Safe silt focus publishes `safe_grave_silt_transfer` with no bond blocker.
- [x] Valid Grave pulses publish `GraveReadBeforeAbsorbSystem` and the consumed target.
- [x] Stability activates only after `safeMemoryTransferComplete`.
- [x] Guide, tissue panel, and diagnostics hand off to stability after transfer.
- [x] Existing seam and post-seam ownership validators remain green.
- [x] Undefined-method audit and production build pass.

## Live verification

1. Enter the initial Grave bed.
2. Complete husk, silt, scar-lock, and inheritance-seed reads.
3. At `safe_silt_transfer`, verify all visible instructions agree on holding A/F.
4. Verify full debug reports:
   - Owner: `GraveReadBeforeAbsorbSystem`
   - Ready: yes
   - Expected/Actual: `residue_silt_cloud_001`
   - Bond compatibility: `safe_grave_silt_transfer`
5. Hold A/F until the settled silt transfer completes.
6. Verify ownership changes to `GraveLoopStabilitySystem` only then.
7. Release absorb, let the stability timer settle, and continue through the existing seam/fold-back path.

## Failure evidence
Capture one F1 full-debug screenshot containing owner, stage, progress, ready/complete, expected/actual target, pulse producer/consumer, bond compatibility, and both visible instruction panels.
