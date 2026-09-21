# HC-004QJ Acceptance Tests

- [x] Build identity is HC-004QJ / 0.0.73.
- [x] `safeMemoryTransferReady` is absent from `InputSystem`.
- [x] A is pulse/listen before `safeAbsorbReady`.
- [x] A becomes absorb when `safeAbsorbReady` is true.
- [x] Completed transfer does not revert A to pulse.
- [x] Post-seam Grave response preserves pulse/listen.
- [x] Existing pulse/listen cells and default absorb cells remain unchanged.
- [x] Focused validator covers the contextual handoff.

## Live test
At 80% in `safe_silt_transfer`, full debug should read:

- `Ready yes`
- `A[0] ... absorb`
- holding A sets `absorbHeld`
- `safeAbsorbProgress` rises from 0 to 1
- the flow advances to `memory_trace_received`
